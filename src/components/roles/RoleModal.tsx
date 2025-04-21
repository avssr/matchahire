'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChatWithPersona } from './ChatWithPersona';
import { QuickApplyForm } from './QuickApplyForm';

interface RoleModalProps {
  role: {
    id: string;
    title: string;
    description: string;
    expectations: string[];
    work_culture: string;
    persona: {
      name: string;
      mode: 'structured' | 'conversational';
      tone: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
}

export function RoleModal({ role, isOpen, onClose }: RoleModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'apply'>('details');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={role.title}>
      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'details' ? 'default' : 'outline'}
          onClick={() => setActiveTab('details')}
        >
          Role Details
        </Button>
        <Button
          variant={activeTab === 'chat' ? 'default' : 'outline'}
          onClick={() => setActiveTab('chat')}
        >
          Chat with {role.persona.name}
        </Button>
        <Button
          variant={activeTab === 'apply' ? 'default' : 'outline'}
          onClick={() => setActiveTab('apply')}
        >
          Quick Apply
        </Button>
      </div>

      {activeTab === 'details' && (
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">About the Role</h3>
              <p className="text-slate-700 whitespace-pre-line">{role.description}</p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Expectations</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                {role.expectations.map((expectation, index) => (
                  <li key={index}>{expectation}</li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Work Culture</h3>
              <p className="text-slate-700 whitespace-pre-line">{role.work_culture}</p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'chat' && (
        <ChatWithPersona 
          roleId={role.id}
          persona={role.persona}
        />
      )}

      {activeTab === 'apply' && (
        <QuickApplyForm roleId={role.id} />
      )}
    </Modal>
  );
} 