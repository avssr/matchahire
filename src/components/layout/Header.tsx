import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2 group"
            title="Return to Homepage"
          >
            <div className="relative h-8 w-8 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
              <Image
                src="/logo.svg"
                alt="MatchaHire Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
              MatchaHire
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-slate-700 hover:text-emerald-600 transition-colors hover:underline underline-offset-4"
              title="Home"
            >
              Home
            </Link>
            <Link
              href="/roles"
              className="text-slate-700 hover:text-emerald-600 transition-colors hover:underline underline-offset-4"
              title="Browse Available Roles"
            >
              Browse Roles
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-700 hover:text-emerald-600 transition-colors hover:underline underline-offset-4"
              title="Recruiter Dashboard"
            >
              Post a Job
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button 
                variant="outline" 
                size="sm"
                className="hover:bg-emerald-50"
                title="Sign in to your account"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/company">
              <Button 
                size="sm"
                className="hover:shadow-lg hover:shadow-emerald-500/20"
                title="Get started with MatchaHire"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 