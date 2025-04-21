'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';

interface QuickApplyFormProps {
  roleId: string;
}

export function QuickApplyForm({ roleId }: QuickApplyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [dribbbleUrl, setDribbbleUrl] = useState('');
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        alert('Please upload a PDF or DOCX file');
        return;
      }
      setResume(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      alert('Please upload your resume');
      return;
    }

    setIsLoading(true);

    try {
      // Upload resume to Supabase Storage
      const fileExt = resume.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resume);

      if (uploadError) throw uploadError;

      // Create application record
      const { error: applicationError } = await supabase
        .from('applications')
        .insert({
          role_id: roleId,
          resume_url: uploadData.path,
          portfolio_url: portfolioUrl || null,
          linkedin_url: linkedinUrl || null,
          dribbble_url: dribbbleUrl || null,
          status: 'submitted'
        });

      if (applicationError) throw applicationError;

      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Resume (PDF or DOCX)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-emerald-50 file:text-emerald-700
              hover:file:bg-emerald-100"
          />
          <p className="mt-1 text-sm text-slate-500">
            Max file size: 5MB
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Portfolio URL
          </label>
          <Input
            type="url"
            placeholder="https://your-portfolio.com"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            LinkedIn Profile
          </label>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/your-profile"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Dribbble Profile (Optional)
          </label>
          <Input
            type="url"
            placeholder="https://dribbble.com/your-profile"
            value={dribbbleUrl}
            onChange={(e) => setDribbbleUrl(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </Card>
  );
} 