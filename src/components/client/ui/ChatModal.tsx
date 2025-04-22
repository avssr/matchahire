'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  text: string;
  isAi: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isAi: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response after 1 second
    setTimeout(() => {
      const aiMessage = {
        id: Date.now(),
        text: "I'm an AI assistant. I'll help you with your questions about Matcha Hire.",
        isAi: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="h-[80vh] max-h-[600px]">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'transition-all duration-300',
                  'opacity-100 translate-y-0',
                  'animate-in fade-in slide-in-from-bottom-2'
                )}
              >
                <div
                  className={cn(
                    'rounded-lg p-3',
                    message.isAi
                      ? 'bg-primary/10 text-primary ml-4'
                      : 'bg-muted text-foreground mr-4'
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ml-4 animate-pulse text-sm text-text-muted">
                AI is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
} 