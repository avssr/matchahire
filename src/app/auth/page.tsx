import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full"
            />
          </div>
          <Button className="w-full">Sign In</Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-600">
            Don't have an account?{' '}
            <a href="#" className="text-emerald-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 