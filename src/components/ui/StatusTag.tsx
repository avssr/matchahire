'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'Open' | 'Closed' | 'Upcoming' | 'AI Persona';

interface StatusTagProps {
  type: StatusType;
  className?: string;
}

const statusColors: Record<StatusType, string> = {
  'Open': 'bg-emerald-100 text-emerald-800',
  'Closed': 'bg-red-100 text-red-800',
  'Upcoming': 'bg-yellow-100 text-yellow-800',
  'AI Persona': 'bg-blue-100 text-blue-800',
};

export function StatusTag({ type, className }: StatusTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusColors[type],
        className
      )}
    >
      {type}
    </span>
  );
} 