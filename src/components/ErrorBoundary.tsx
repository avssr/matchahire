'use client';

import React from 'react';
import { Button } from '@/components/client/ui/Button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
          <div className="text-center px-4">
            <h1 className="text-4xl font-bold text-emerald-600 mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
              We've encountered an unexpected error. Our team has been notified and is working to fix it.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => window.location.reload()}
                className="hover:shadow-lg hover:shadow-emerald-500/20"
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="hover:bg-emerald-50"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 