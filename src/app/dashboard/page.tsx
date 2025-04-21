import React from 'react';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

// Mock data - replace with actual data from Supabase
const stats = [
  { label: 'Total Applications', value: '124' },
  { label: 'Active Roles', value: '4' },
  { label: 'Interviews Scheduled', value: '32' },
  { label: 'Offers Extended', value: '8' },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen pt-16">
      <section className="container mx-auto px-4 py-12">
        <SectionHeader
          title="Recruiter Dashboard"
          subtitle="Manage your job postings and candidate interactions"
        />
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Active Job Postings</h3>
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="text-lg font-medium text-slate-900">Senior Frontend Engineer</h4>
                  <p className="text-slate-700">Posted 2 days ago</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-slate-600">12 applications</span>
                    <span className="mx-2 text-slate-400">•</span>
                    <span className="text-sm text-slate-600">3 interviews scheduled</span>
                  </div>
                </div>
                
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="text-lg font-medium text-slate-900">Backend Developer</h4>
                  <p className="text-slate-700">Posted 1 week ago</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-slate-600">8 applications</span>
                    <span className="mx-2 text-slate-400">•</span>
                    <span className="text-sm text-slate-600">2 interviews scheduled</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <Button className="w-full justify-center">
                  Post New Job
                </Button>
                <Button variant="outline" className="w-full justify-center">
                  View All Applications
                </Button>
                <Button variant="outline" className="w-full justify-center">
                  Manage Company Profile
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
} 