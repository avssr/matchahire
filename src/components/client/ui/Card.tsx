'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  const styles = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #E5E7EB',
    padding: '1.5rem',
    transition: 'all 200ms ease-in-out',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    height: '100%'
  };

  return (
    <div
      className={cn(className)}
      style={styles}
      {...props}
    >
      {children}
    </div>
  );
} 