'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/client/ui/Button';
import { Card } from '@/components/client/ui/Card';

export function PageContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`transition-all duration-500 ease-in-out ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {/* Hero Section */}
      <section className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Match in Tech
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with top tech companies and discover opportunities that match your skills and aspirations.
            </p>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Link href="/roles" className="no-underline">
                <Button size="lg" className="w-full">Browse Jobs</Button>
              </Link>
              <Link href="/company" className="no-underline">
                <Button variant="ghost" size="lg" className="w-full">Post a Job</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MatchaHire</h2>
            <p className="text-lg text-gray-600">
              We make job hunting and hiring simple and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Matching",
                description: "Our AI-powered matching system connects you with the most relevant opportunities."
              },
              {
                title: "Verified Companies",
                description: "Work with trusted companies that have been vetted for quality and reliability."
              },
              {
                title: "Easy Application",
                description: "Apply to jobs with just a few clicks and track your applications in real-time."
              }
            ].map((feature, index) => (
              <Card key={feature.title} className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Quick Links</h2>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Link href="/roles" className="no-underline">
                <Button variant="ghost" className="w-full">Find Roles</Button>
              </Link>
              <Link href="/company" className="no-underline">
                <Button variant="ghost" className="w-full">For Companies</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact</h2>
            <a 
              href="mailto:hello@matchahire.com"
              className="text-emerald-600 hover:underline text-lg"
            >
              hello@matchahire.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 