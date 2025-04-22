'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  type?: string;
  containerClassName?: string;
}

export function FormField({
  label,
  type = 'text',
  className,
  containerClassName,
  ...props
}: FormFieldProps) {
  const inputClasses = cn(
    'w-full rounded-md border border-border bg-background px-3 py-2',
    'text-sm focus:outline-none focus:ring-2 focus:ring-primary',
    className
  );

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          className={cn(inputClasses, 'min-h-[100px] resize-y')}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          type={type}
          className={inputClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
} 