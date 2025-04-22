'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';

interface QuickApplyFormProps {
  roleId: string;
}

export function QuickApplyForm({ roleId }: QuickApplyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    coverLetter: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to apply');
      }

      const { error } = await supabase
        .from('applications')
        .insert({
          role_id: roleId,
          candidate_id: session.user.id,
          status: 'pending',
          cover_letter: formData.coverLetter,
          linkedin_url: formData.linkedin,
          portfolio_url: formData.portfolio,
        });

      if (error) throw error;

      toast({
        title: 'Application submitted',
        description: 'Your application has been successfully submitted.',
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <Input
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <Input
          name="linkedin"
          type="url"
          placeholder="LinkedIn Profile"
          value={formData.linkedin}
          onChange={handleChange}
        />
        <Input
          name="portfolio"
          type="url"
          placeholder="Portfolio Website"
          value={formData.portfolio}
          onChange={handleChange}
        />
      </div>

      <Textarea
        name="coverLetter"
        placeholder="Cover Letter (optional)"
        value={formData.coverLetter}
        onChange={handleChange}
        className="min-h-[200px]"
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
} 