'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/client/ui/Button';

export function Header() {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border animate-fade-in"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">MatchaHire</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/roles" className="text-foreground/80 hover:text-primary transition-colors">
              Find Roles
            </Link>
            <Link href="/company" className="text-foreground/80 hover:text-primary transition-colors">
              For Companies
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/roles">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Find Roles
              </Button>
            </Link>
            <Link href="/company">
              <Button size="sm">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 