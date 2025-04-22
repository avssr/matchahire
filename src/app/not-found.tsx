'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">
      <h1 className="text-3xl font-semibold text-gray-900">This page doesn't exist… yet.</h1>
      <p className="mt-2 text-gray-600">Let's get you back on track.</p>
      <a href="/" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
        Back to Home
      </a>
    </div>
  );
} 