'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/client/ui/Button';
import { Card } from '@/components/client/ui/Card';
import { ChatWithPersona } from './ChatWithPersona';
import { QuickApplyForm } from './QuickApplyForm';

interface Role {
  id: string;
  title: string;
  location?: string;
  level: string;
  tags: string[];
  description: string;
  requirements: string[];
  responsibilities: string[];
  company_id: string;
  company_name?: string;
  conversation_mode: 'structured' | 'conversational';
  expected_response_length: string;
}

interface RoleModalProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'details' | 'chat' | 'apply';
  onTabChange: (tab: 'details' | 'chat' | 'apply') => void;
}

export function RoleModal({ role, isOpen, onClose, activeTab, onTabChange }: RoleModalProps) {
  const handleQuickApplySubmit = (data: any) => {
    // Handle form submission
    console.log('Form submitted:', data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="role-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{role.title}</DialogTitle>
          <DialogDescription id="role-description">
            View role details, chat with an AI persona, or apply quickly
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'details' ? 'default' : 'outline'}
            onClick={() => onTabChange('details')}
          >
            Role Details
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'default' : 'outline'}
            onClick={() => onTabChange('chat')}
          >
            Chat with Persona
          </Button>
          <Button
            variant={activeTab === 'apply' ? 'default' : 'outline'}
            onClick={() => onTabChange('apply')}
          >
            Quick Apply
          </Button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">About the Role</h3>
              <p className="text-slate-600">{role.description}</p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                {role.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Responsibilities</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600">
                {role.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </Card>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Location</h3>
                <p className="text-gray-600">{role.location || 'Remote'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Level</h3>
                <p className="text-gray-600">{role.level}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatWithPersona
            roleId={role.id}
            mode={role.conversation_mode}
            expectedResponseLength={role.expected_response_length}
            onSwitchToApply={() => onTabChange('apply')}
          />
        )}

        {activeTab === 'apply' && (
          <QuickApplyForm 
            roleId={role.id} 
            onSubmit={handleQuickApplySubmit}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 