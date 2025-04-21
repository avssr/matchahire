import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-emerald-600 mb-4 animate-bounce">
          404
        </h1>
        <h2 className="text-3xl font-semibold text-slate-900 mb-6">
          Page not found — but your next opportunity might be.
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Looks like you've taken a wrong turn. Don't worry, we'll help you get back on track to finding your perfect role.
        </p>
        <Link href="/">
          <Button 
            size="lg" 
            className="group hover:shadow-lg hover:shadow-emerald-500/20"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-1 mr-2">←</span>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 