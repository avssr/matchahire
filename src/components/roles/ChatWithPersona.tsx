'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/client/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Send, AlertCircle, RefreshCw, Paperclip, X, CheckCircle2, MessageSquare, FileText, Image, File, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast, type ToastT } from 'sonner';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { useChatStore, type ConversationMode } from '@/lib/chat/context';
import { ChatMessage } from '@/components/client/ui/ChatMessage';
import { FileUpload } from '@/components/client/ui/FileUpload';

interface ChatWithPersonaProps {
  roleId: string;
  mode: string;
  expectedResponseLength: string;
  resumeContent?: string;
  onSwitchToApply?: () => void;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  attachments?: File[];
  status?: 'sending' | 'delivered' | 'error';
}

interface FilePreview {
  name: string;
  type: string;
  size: number;
  preview?: string;
}

export function ChatWithPersona({
  roleId,
  mode,
  expectedResponseLength,
  resumeContent,
  onSwitchToApply,
}: ChatWithPersonaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [attachments, setAttachments] = useState<FilePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const pathname = usePathname();

  const {
    mode: chatMode,
    currentStep,
    totalSteps,
    collectedInfo,
    setMode,
    setCurrentStep,
    setCollectedInfo,
    actions
  } = useChatStore();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsInitializing(true);
        await actions.startSession(roleId);
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setError('Failed to initialize chat session');
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [roleId, actions]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast({ title: 'Invalid file type', description: 'Please upload PDF, DOC, DOCX, JPG, or PNG files only.' });
        return false;
      }
      if (!isValidSize) {
        toast({ title: 'File too large', description: 'Please upload files smaller than 5MB.' });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const filePreviews = await Promise.all(validFiles.map(async (file) => {
        const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          preview
        };
      }));
      
      setAttachments(prev => [...prev, ...filePreviews]);
      toast({ title: 'Files added successfully' });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
    toast({ title: 'File removed' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setUploadProgress(0);
    setIsLoading(true);
    setError(null);

    try {
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Failed to get session');
      }

      const formData = new FormData();
      formData.append('messages', JSON.stringify([userMessage]));
      formData.append('roleId', roleId);
      if (resumeContent) formData.append('resumeContent', resumeContent);
      if (chatMode) formData.append('mode', chatMode);
      if (expectedResponseLength) formData.append('expectedResponseLength', expectedResponseLength);

      // Upload files if any
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileBlob = await fetch(file.preview || '').then(r => r.blob());
          formData.append('attachments', fileBlob, file.name);
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || 'default-user-id'}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Update message status to delivered
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));

      setIsTyping(true);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to read response');

      let assistantMessage = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        assistantMessage += chunk;
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant') {
            return [...prev.slice(0, -1), { ...lastMessage, content: assistantMessage }];
          }
          return [...prev, { 
            id: Date.now().toString(), 
            content: assistantMessage, 
            role: 'assistant', 
            timestamp: new Date().toISOString() 
          }];
        });
      }

      // Update context based on the conversation
      const info = extractInfoFromMessage(assistantMessage);
      if (info) {
        setCollectedInfo({
          ...collectedInfo,
          [info.key]: info.value
        });
      }

      // Move to next step if appropriate
      if (shouldMoveToNextStep(assistantMessage)) {
        setCurrentStep(Math.min(currentStep + 1, totalSteps));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'error' } : msg
      ));
      toast({ title: 'Failed to send message. Please try again.' });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setAttachments([]);
      setMessages(prev => prev.filter(m => m.id !== lastUserMessage.id));
    }
  };

  const handleFileUpload = async (file: File) => {
    await actions.uploadResume(file);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-lg border border-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Step {currentStep + 1} of {totalSteps}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-emerald-500 capitalize">{chatMode}</span>
        </div>
        {currentStep === totalSteps - 1 && (
          <Button
            onClick={onSwitchToApply}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Proceed to Application
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
            <MessageSquare className="w-12 h-12 mb-4 text-emerald-500" />
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">Ask about the role, company culture, or application process</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start',
              message.status === 'error' && 'opacity-75'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl p-4 relative",
                message.role === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-900'
              )}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white/10 p-2 rounded-lg"
                    >
                      <Paperclip className="w-4 h-4" />
                      <span className="text-xs truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className={cn(
                "text-xs mt-2 flex items-center gap-2",
                message.role === 'user' ? 'text-emerald-100' : 'text-slate-500'
              )}>
                {new Date(message.timestamp).toLocaleTimeString()}
                {message.status === 'sending' && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
                {message.status === 'delivered' && (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {message.status === 'error' && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is typing...</span>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-red-500 text-center">
              We're having trouble with the chat. Would you like to try again?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                className="bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              {onSwitchToApply && (
                <Button
                  onClick={onSwitchToApply}
                  className="bg-slate-100 text-slate-900 hover:bg-slate-200"
                >
                  Switch to Quick Apply
                </Button>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg text-sm"
              >
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4 text-slate-500" />
                ) : file.type === 'application/pdf' ? (
                  <FileText className="w-4 h-4 text-slate-500" />
                ) : (
                  <File className="w-4 h-4 text-slate-500" />
                )}
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-slate-500 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-[42px] w-[42px] p-0"
            disabled={isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            type="submit"
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="h-[42px] w-[42px] p-0 bg-emerald-500 hover:bg-emerald-600"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </Button>
        </div>
      </form>

      <div className="flex flex-col space-y-4 p-4">
        <FileUpload onUpload={handleFileUpload} />
        <div className="flex space-x-2">
          <Button onClick={() => setCurrentStep(Math.min(currentStep + 1, totalSteps))}>Next</Button>
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