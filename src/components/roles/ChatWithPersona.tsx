'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/client/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send, Upload, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/chat/context';
import { Message, ConversationMode } from '@/types/chat';
import { DialogContent } from '@/components/ui/Dialog';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  attachments?: string[];
  status?: 'sending' | 'delivered' | 'error';
}

function ChatMessage({
  content,
  role,
  timestamp,
  attachments,
  status
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex mb-4',
        role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-3',
          role === 'user'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {attachments && attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((fileName, index) => (
              <div key={index} className="text-sm opacity-75">
                📎 {fileName}
              </div>
            ))}
          </div>
        )}
        {timestamp && (
          <div className="mt-1 text-xs opacity-50">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
        {status && (
          <div className="mt-1 text-xs opacity-50">
            {status === 'sending' && '⏳ Sending...'}
            {status === 'delivered' && '✓ Delivered'}
            {status === 'error' && '❌ Error'}
          </div>
        )}
      </div>
    </div>
  );
}

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  selectedFile?: File | null;
  id?: string;
  name?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = '.pdf,.doc,.docx',
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  selectedFile,
  id,
  name,
  disabled,
  ariaLabel
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }
    setIsUploading(true);
    try {
      await onFileSelect(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id={id}
        name={name}
        disabled={disabled || isUploading}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : selectedFile ? (
          <X className="w-4 h-4" onClick={onFileRemove} />
        ) : (
          <Upload className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

interface ChatWithPersonaProps {
  roleId: string;
  mode?: ConversationMode;
  expectedResponseLength?: string;
  resumeContent?: string;
  onSwitchToApply?: () => void;
}

export default function ChatWithPersona({
  roleId,
  mode = 'structured',
  expectedResponseLength = '500',
  resumeContent,
  onSwitchToApply,
}: ChatWithPersonaProps) {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<string>('introduction');
  const [skillScores, setSkillScores] = useState<Record<string, number>>({});
  const initializationTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { messages, session, loading, error, startSession, sendMessage, uploadResume } = useChat();

  // Simulate typing indicator
  const simulateTyping = useCallback(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, Math.random() * 1000 + 500);
  }, []);

  // Handle message analysis and topic progression
  const analyzeMessage = useCallback((message: string) => {
    // Extract skills and update scores
    const skills = extractSkillsFromMessage(message);
    setSkillScores(prev => {
      const newScores = { ...prev };
      skills.forEach(skill => {
        newScores[skill] = (newScores[skill] || 0) + 1;
      });
      return newScores;
    });

    // Determine if we should move to next topic
    if (shouldMoveToNextStep(message)) {
      setCurrentTopic(prev => {
        switch (prev) {
          case 'introduction':
            return 'technical';
          case 'technical':
            return 'experience';
          case 'experience':
            return 'closing';
          default:
            return prev;
        }
      });
    }
  }, []);

  function extractSkillsFromMessage(message: string): string[] {
    const technicalSkills = ['programming', 'architecture', 'debugging', 'testing'];
    const softSkills = ['communication', 'leadership', 'teamwork', 'problem-solving'];
    
    const skills: string[] = [];
    [...technicalSkills, ...softSkills].forEach(skill => {
      if (message.toLowerCase().includes(skill)) {
        skills.push(skill);
      }
    });
    
    return skills;
  }

  function shouldMoveToNextStep(message: string): boolean {
    // Check for completion indicators in the message
    const completionPhrases = [
      'great, let\'s move on',
      'thank you for sharing',
      'i understand',
      'that\'s helpful'
    ];
    
    return completionPhrases.some(phrase => 
      message.toLowerCase().includes(phrase)
    );
  }

  function getPlaceholderForTopic(topic: string): string {
    switch (topic) {
      case 'introduction':
        return 'Introduce yourself and your background...';
      case 'technical':
        return 'Share your technical experience...';
      case 'experience':
        return 'Tell me about your relevant work experience...';
      case 'closing':
        return 'Any final questions?';
      default:
        return 'Type your message...';
    }
  }

  const initializeChat = useCallback(async () => {
    if (isInitializing || session) return;
    
    try {
      setIsInitializing(true);
      setRoleError(null);
      await startSession(roleId, mode, expectedResponseLength);
      setRetryCount(0);
    } catch (err) {
      console.error('Error initializing chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
      setRoleError(errorMessage);
      
      if (retryCount < 5) {
        setRetryCount(prev => prev + 1);
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
        }
        initializationTimeoutRef.current = setTimeout(() => {
          initializeChat();
        }, 1000 * Math.pow(2, retryCount));
      }
    } finally {
      setIsInitializing(false);
    }
  }, [roleId, mode, expectedResponseLength, startSession, retryCount, isInitializing, session]);

  // Single effect for initialization
  useEffect(() => {
    if (!session && !isInitializing && !roleError) {
      initializeChat();
    }

    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [session, initializeChat, isInitializing, roleError]);

  // Single effect for auto-scrolling and debug logging
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('Chat state:', { session, messages, roleError });
    }
  }, [messages, session, roleError]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await uploadResume(formData);
        setSelectedFile(null);
        analyzeMessage('resume_uploaded');
      }

      if (input.trim()) {
        // Show typing indicator before sending
        simulateTyping();
        
        // Send message and analyze response
        await sendMessage(input);
        analyzeMessage(input);
        
        // Clear input and update UI
        setInput('');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        
        // Show typing indicator for AI response
        simulateTyping();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setRoleError('Failed to send message. Please try again.');
    }
  };

  if (roleError && retryCount >= 5) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-red-500 mb-4">
          {roleError}
        </div>
        <Button
          onClick={() => {
            setRetryCount(0);
            setRoleError(null);
            initializeChat();
          }}
          disabled={isInitializing}
        >
          {isInitializing ? 'Retrying...' : 'Retry'}
        </Button>
      </div>
    );
  }

  if (loading && !messages.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-background rounded-lg border">
      {/* Progress Indicator */}
      <div className="flex justify-between px-4 py-2 bg-muted/50">
        {['introduction', 'technical', 'experience', 'closing'].map((topic, index) => (
          <div
            key={topic}
            className={cn(
              'flex items-center',
              topic === currentTopic ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <div className={cn(
              'w-2 h-2 rounded-full mr-2',
              topic === currentTopic ? 'bg-primary' : 'bg-muted'
            )} />
            {topic}
          </div>
        ))}
      </div>
      
      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                content={message.content}
                role={message.role}
                timestamp={message.created_at}
                attachments={message.attachments}
                status={message.status}
              />
            ))}
            {isTyping && (
              <div className="flex items-center space-x-2 p-4 text-muted-foreground">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              id="chat-message-input"
              name="message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholderForTopic(currentTopic)}
              className="w-full"
              disabled={loading || !session}
              aria-label="Message input"
              aria-describedby="chat-status"
            />
          </div>
          <div className="flex items-center gap-2">
            <FileUpload
              id="chat-file-upload"
              name="file"
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile}
              className="w-10 h-10"
              disabled={loading || !session}
              aria-label="Upload file"
            />
            <Button
              type="submit" 
              id="chat-send-button"
              name="send"
              disabled={loading || (!input.trim() && !selectedFile) || !session}
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
        <div id="chat-status" className="sr-only" aria-live="polite">
          {loading ? 'Loading...' : session ? 'Ready to chat' : 'Initializing chat...'}
        </div>
      </div>
    </div>
  );
}

// Helper functions for context management
function extractInfoFromMessage(message: string): { key: string; value: any } | null {
  // Implement logic to extract key information from the assistant's message
  // This is a placeholder - you should implement specific extraction logic based on your needs
  return null;
}

function shouldMoveToNextStep(message: string): boolean {
  // Implement logic to determine if we should move to the next step
  // This is a placeholder - you should implement specific logic based on your needs
  return false;
}

<DialogContent 
  className="max-w-4xl h-[80vh] flex flex-col bg-white dark:bg-gray-900"
  aria-describedby="chat-description"
>
  <div id="chat-description" className="sr-only">
    Chat interface for interacting with the role's persona
  </div>
</DialogContent> 