import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, subtitle, align = 'center', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          align === 'center' && 'text-center',
          className
        )}
        {...props}
      >
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';

export { SectionHeader }; 