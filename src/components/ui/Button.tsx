import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none hover:scale-105 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20',
        outline: 'border border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-500/10',
        ghost: 'hover:bg-emerald-50 text-emerald-600 hover:shadow-lg hover:shadow-emerald-500/10',
        gradient: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/20',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3',
        lg: 'h-12 px-8',
        xl: 'h-14 px-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconLeft, iconRight, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants }; 