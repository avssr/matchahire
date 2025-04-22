'use client';

import React, { useState } from 'react';
import { Button } from '@/components/client/ui/Button';
import { FormField } from '@/components/client/ui/FormField';

interface FormData {
  name: string;
  email: string;
  resume: File | null;
  coverLetter: string;
}

interface QuickApplyFormProps {
  roleId: string;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}

export function QuickApplyForm({ roleId, onSubmit, onClose }: QuickApplyFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    resume: null,
    coverLetter: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="transition-all duration-300 ease-in-out opacity-100 translate-y-0">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData({ ...formData, name: e.target.value })}
          required
        />
        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setFormData({ ...formData, email: e.target.value })}
          required
        />
        <FormField
          label="Resume"
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setFormData({ ...formData, resume: file });
          }}
          required
        />
        <FormField
          label="Cover Letter"
          type="textarea"
          value={formData.coverLetter}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
            setFormData({ ...formData, coverLetter: e.target.value })}
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Submit Application</Button>
        </div>
      </form>
    </div>
  );
} 