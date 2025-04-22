'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/client/ui/Card';
import { Button } from '@/components/client/ui/Button';
import { FiMapPin, FiClock, FiMessageSquare, FiMessageCircle, FiSend } from 'react-icons/fi';

interface RoleCardProps {
  role: {
    id: string;
    title: string;
    location: string;
    level: string;
    tags: string[];
    company_name: string;
    conversation_mode: 'structured' | 'conversational';
    expected_response_length: string;
  };
  onClick: () => void;
  onChat: () => void;
  onApply: () => void;
}

export function RoleCard({ role, onClick, onChat, onApply }: RoleCardProps) {
  return (
    <div className="animate-fade-in">
      <Card 
        className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02]"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {role.title}
              </h3>
              <p className="text-slate-600 mt-1">{role.company_name}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              {role.level}
            </span>
          </div>
          
          <div className="flex items-center text-slate-600 mb-4">
            <FiMapPin className="w-4 h-4 mr-2" />
            {role.location}
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {role.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-slate-50 text-slate-700 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="flex-1 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                onClick={onClick}
              >
                View Details
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 group-hover:border-emerald-600 group-hover:text-emerald-600 transition-colors"
                onClick={onChat}
              >
                <FiMessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
            
            <Button 
              variant="default" 
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              onClick={onApply}
            >
              <FiSend className="w-4 h-4 mr-2" />
              Quick Apply
            </Button>
            
            <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
              <div className="flex items-center gap-2">
                <FiMessageSquare className="w-4 h-4" />
                <span>{role.conversation_mode === 'structured' ? 'Structured Interview' : 'Conversational Chat'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>{role.expected_response_length}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 