'use client';

import { useEffect } from 'react';
import { Button } from '@/components/client/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-emerald-600 mb-4">
          Something went wrong!
        </h1>
        <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="space-x-4">
          <Button
            onClick={reset}
            className="hover:shadow-lg hover:shadow-emerald-500/20"
          >
            Try again
          </Button>
          <Button
            variant="ghost"
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