import { StateCreator, create } from 'zustand';
import { PersistOptions, persist } from 'zustand/middleware';
import { ChatSession, Message, Persona } from './types';

export type ConversationMode = 'initial' | 'screening' | 'technical' | 'cultural' | 'closing';

export interface ChatState {
  session: ChatSession | null;
  persona: Persona | null;
  isLoading: boolean;
  error: string | null;
  mode: ConversationMode;
  collectedInfo: Record<string, unknown>;
  currentStep: number;
  totalSteps: number;
  actions: {
    startSession: (roleId: string) => Promise<void>;
    sendMessage: (text: string, attachments?: File[]) => Promise<void>;
    uploadResume: (file: File) => Promise<void>;
    endSession: () => Promise<void>;
  };
}

interface ChatStore extends ChatState {
  setSession: (session: ChatSession | null) => void;
  setPersona: (persona: Persona | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setMode: (mode: ConversationMode) => void;
  setCollectedInfo: (info: Record<string, unknown>) => void;
  setCurrentStep: (step: number) => void;
  setTotalSteps: (steps: number) => void;
}

type ChatStorePersist = (
  config: StateCreator<ChatStore>,
  options: PersistOptions<ChatStore>
) => StateCreator<ChatStore>;

export const useChatStore = create<ChatStore>()(
  (persist as ChatStorePersist)(
    (set: (fn: (state: ChatStore) => Partial<ChatStore>) => void) => ({
      session: null,
      persona: null,
      isLoading: false,
      error: null,
      mode: 'initial',
      collectedInfo: {},
      currentStep: 0,
      totalSteps: 5,
      actions: {
        startSession: async (roleId: string) => {
          set((state) => ({ ...state, isLoading: true, error: null }));
          try {
            const response = await fetch(`/api/chat/start?roleId=${roleId}`);
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to start session');
            }
            const data = await response.json();
            set((state) => ({ 
              ...state, 
              session: data.session,
              persona: data.persona,
              mode: 'initial',
              currentStep: 0,
              collectedInfo: {}
            }));
          } catch (error) {
            set((state) => ({ 
              ...state, 
              error: error instanceof Error ? error.message : 'Failed to start session',
              session: null,
              persona: null
            }));
          } finally {
            set((state) => ({ ...state, isLoading: false }));
          }
        },
        sendMessage: async (text: string, attachments?: File[]) => {
          set((state) => ({ ...state, isLoading: true, error: null }));
          try {
            const formData = new FormData();
            formData.append('text', text);
            if (attachments) {
              attachments.forEach(file => formData.append('attachments', file));
            }
            
            const response = await fetch('/api/chat/message', {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) throw new Error('Failed to send message');
            const data = await response.json();
            
            set((state) => ({ 
              ...state, 
              session: data.session,
              mode: data.nextMode || state.mode,
              currentStep: data.nextStep || state.currentStep,
              collectedInfo: { ...state.collectedInfo, ...data.collectedInfo }
            }));
          } catch (error) {
            set((state) => ({ ...state, error: 'Failed to send message' }));
          } finally {
            set((state) => ({ ...state, isLoading: false }));
          }
        },
        uploadResume: async (file: File) => {
          set((state) => ({ ...state, isLoading: true, error: null }));
          try {
            const formData = new FormData();
            formData.append('resume', file);
            
            const response = await fetch('/api/chat/upload', {
              method: 'POST',
              body: formData
            });
            
            if (!response.ok) throw new Error('Failed to upload resume');
            const data = await response.json();
            
            set((state) => ({ 
              ...state, 
              session: data.session,
              collectedInfo: { ...state.collectedInfo, resume: data.resumeUrl }
            }));
          } catch (error) {
            set((state) => ({ ...state, error: 'Failed to upload resume' }));
          } finally {
            set((state) => ({ ...state, isLoading: false }));
          }
        },
        endSession: async () => {
          set((state) => ({ ...state, isLoading: true, error: null }));
          try {
            const response = await fetch('/api/chat/end', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to end session');
            set((state) => ({ 
              ...state, 
              session: null,
              persona: null,
              mode: 'initial',
              currentStep: 0,
              collectedInfo: {}
            }));
          } catch (error) {
            set((state) => ({ ...state, error: 'Failed to end session' }));
          } finally {
            set((state) => ({ ...state, isLoading: false }));
          }
        }
      },
      setSession: (session: ChatSession | null) => set((state) => ({ ...state, session })),
      setPersona: (persona: Persona | null) => set((state) => ({ ...state, persona })),
      setLoading: (isLoading: boolean) => set((state) => ({ ...state, isLoading })),
      setError: (error: string | null) => set((state) => ({ ...state, error })),
      setMode: (mode: ConversationMode) => set((state) => ({ ...state, mode })),
      setCollectedInfo: (collectedInfo: Record<string, unknown>) => set((state) => ({ ...state, collectedInfo })),
      setCurrentStep: (currentStep: number) => set((state) => ({ ...state, currentStep })),
      setTotalSteps: (totalSteps: number) => set((state) => ({ ...state, totalSteps }))
    }),
    {
      name: 'chat-storage'
    }
  )
);

export const getSystemPrompt = (state: ChatState) => {
  const basePrompt = `
    You are a virtual recruiter conducting an interview.
    Current progress: Step ${state.currentStep + 1} of ${state.totalSteps}
    Collected information: ${JSON.stringify(state.collectedInfo, null, 2)}
  `.trim();

  const modeSpecificPrompt = {
    initial: `
      This is the initial screening phase.
      Focus on:
      - Basic qualifications
      - Work authorization
      - Availability
      - Salary expectations
    `,
    screening: `
      This is the detailed screening phase.
      Focus on:
      - Relevant experience
      - Technical skills
      - Project examples
    `,
    technical: `
      This is the technical assessment phase.
      Focus on:
      - Technical problem-solving
      - System design
      - Coding practices
    `,
    cultural: `
      This is the cultural fit assessment.
      Focus on:
      - Team collaboration
      - Communication style
      - Work preferences
    `,
    closing: `
      This is the closing phase.
      Focus on:
      - Next steps
      - Timeline expectations
      - Any remaining questions
    `
  };

  return `${basePrompt}\n\n${modeSpecificPrompt[state.mode]}`;
};

export const getNextMode = (currentMode: ConversationMode): ConversationMode => {
  const modes: ConversationMode[] = ['initial', 'screening', 'technical', 'cultural', 'closing'];
  const currentIndex = modes.indexOf(currentMode);
  return modes[currentIndex + 1] || currentMode;
};

// Helper functions for context management
export const extractInfoFromMessage = (message: string, mode: ConversationMode): { key: string; value: any } | null => {
  const infoPatterns = {
    initial: {
      availability: /(?:available|start|join).*?(?:from|on|after)?\s*(\d{1,2}\s*(?:weeks|months|days)?)/i,
      salary: /(?:salary|compensation|pay).*?(?:expect|looking|want).*?(\d+(?:k|K)?(?:\s*-\s*\d+(?:k|K))?)/i,
      notice: /(?:notice|period).*?(\d+)\s*(?:weeks|months|days)/i,
    },
    screening: {
      experience: /(?:years|experience).*?(\d+)\s*(?:years|yrs|yr)/i,
      skills: /(?:proficient|expert|skilled).*?(?:in|with|at)\s*([^.,]+)/i,
    },
    technical: {
      projects: /(?:project|work).*?(?:involve|include|about).*?([^.,]+)/i,
      challenges: /(?:challenge|difficult|hard).*?([^.,]+)/i,
    },
    cultural: {
      workStyle: /(?:work|prefer).*?(?:style|environment).*?([^.,]+)/i,
      values: /(?:value|important).*?([^.,]+)/i,
    },
    closing: {
      timeline: /(?:timeline|process).*?([^.,]+)/i,
      nextSteps: /(?:next|follow).*?(?:step|action).*?([^.,]+)/i,
    },
  };

  const patterns = infoPatterns[mode];
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = message.match(pattern);
    if (match) {
      return { key, value: match[1].trim() };
    }
  }

  return null;
};

export const shouldMoveToNextStep = (message: string, mode: ConversationMode, currentStep: number, totalSteps: number): boolean => {
  if (currentStep >= totalSteps - 1) return false;

  const completionPatterns = {
    initial: [
      /(?:thank|appreciate).*?(?:information|details)/i,
      /(?:move|proceed).*?(?:next|technical)/i,
    ],
    screening: [
      /(?:technical|skills).*?(?:assessment|evaluation)/i,
      /(?:move|proceed).*?(?:next|technical)/i,
    ],
    technical: [
      /(?:technical|skills).*?(?:discussion|interview)/i,
      /(?:move|proceed).*?(?:next|cultural)/i,
    ],
    cultural: [
      /(?:cultural|fit).*?(?:assessment|evaluation)/i,
      /(?:move|proceed).*?(?:next|closing)/i,
    ],
    closing: [
      /(?:thank|appreciate).*?(?:time|participation)/i,
      /(?:next|follow).*?(?:step|action)/i,
    ],
  };

  const patterns = completionPatterns[mode];
  return patterns.some(pattern => pattern.test(message));
}; 