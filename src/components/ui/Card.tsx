import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  gradient?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, gradient = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200',
          gradient && 'bg-gradient-to-br from-white to-emerald-50',
          hoverEffect && 'hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-200 hover:scale-105 active:scale-95',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card }; 