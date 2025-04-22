'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Send, AlertCircle, RefreshCw, Paperclip, X, CheckCircle2, MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toast, type ToastT } from 'sonner';
import { Input } from '@/components/ui/Input';

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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const pathname = usePathname();

  useEffect(() => {
    // Reset states when component mounts or pathname changes
    setMessages([]);
    setInput('');
    setError(null);
    setIsInitializing(false);
    setAttachments([]);
    setUploadProgress(0);
  }, [pathname]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
      toast({ title: 'Files added successfully' });
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      attachments: attachments,
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
      if (mode) formData.append('mode', mode);
      if (expectedResponseLength) formData.append('expectedResponseLength', expectedResponseLength);
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

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
          return [...prev, { id: Date.now().toString(), content: assistantMessage, role: 'assistant', timestamp: new Date().toISOString() }];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({ title: 'Failed to send message. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      setAttachments(lastUserMessage.attachments || []);
      setMessages(prev => prev.filter(m => m.id !== lastUserMessage.id));
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-slate-50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-lg shadow-lg border border-slate-200">
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
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
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
              <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-emerald-100' : 'text-slate-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
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
                <Paperclip className="w-4 h-4 text-slate-500" />
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
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </label>
          <Button
            type="submit"
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            className="h-[60px] w-[60px] bg-emerald-500 hover:bg-emerald-600"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 