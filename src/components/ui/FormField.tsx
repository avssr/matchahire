'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
  error?: string;
  containerClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, helper, error, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', containerClassName)}>
        <label className="block text-sm font-medium text-text-main">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />
        {helper && !error && (
          <p className="text-sm text-muted-foreground">{helper}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField }; 