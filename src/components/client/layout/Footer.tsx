'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/client/ui/Button';

export function Footer() {
  return (
    <footer
      className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in"
    >
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">MatchaHire</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered hiring platform connecting top talent with innovative companies.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/roles">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Find Roles
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/company">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    For Companies
                  </Button>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:hello@matchahire.com">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    hello@matchahire.com
                  </Button>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MatchaHire. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 