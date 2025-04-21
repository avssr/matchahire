import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';

export default function Home() {
  return (
    <main className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Find Your Perfect Match in Tech
          </h1>
          <p className="text-xl text-slate-700 mb-8">
            Connect with top tech companies and discover opportunities that match your skills and aspirations.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/roles">
              <Button size="lg" className="hover:shadow-lg hover:shadow-emerald-500/20">
                Browse Jobs
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="hover:bg-emerald-50">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Why Choose MatchaHire"
            subtitle="We make job hunting and hiring simple and effective"
          />
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Smart Matching</h3>
                <p className="text-slate-700">
                  Our AI-powered matching system connects you with the most relevant opportunities.
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Verified Companies</h3>
                <p className="text-slate-700">
                  Work with trusted companies that have been vetted for quality and reliability.
                </p>
              </div>
            </Card>
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Easy Application</h3>
                <p className="text-slate-700">
                  Apply to jobs with just a few clicks and track your applications in real-time.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
