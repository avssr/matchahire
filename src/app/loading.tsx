'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-white">
      <div 
        className="flex flex-col items-center animate-fade-in"
      >
        <div
          className="h-16 w-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"
        />
        <p
          className="mt-4 text-lg text-emerald-600 font-medium animate-fade-in-delayed"
        >
          Loading...
        </p>
      </div>
    </div>
  );
} 