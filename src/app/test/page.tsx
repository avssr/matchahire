'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Testing...');
  const [openaiStatus, setOpenaiStatus] = useState<string>('Testing...');

  useEffect(() => {
    // Test Supabase connection
    const testSupabase = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1);
        if (error) throw error;
        setSupabaseStatus('✅ Supabase connected successfully');
      } catch (error: any) {
        setSupabaseStatus(`❌ Supabase error: ${error?.message || 'Unknown error'}`);
      }
    };

    // Test OpenAI connection through API route
    const testOpenAI = async () => {
      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        if (data.success) {
          setOpenaiStatus('✅ OpenAI connected successfully');
        } else {
          setOpenaiStatus(`❌ OpenAI error: ${data.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        setOpenaiStatus(`❌ OpenAI error: ${error?.message || 'Unknown error'}`);
      }
    };

    testSupabase();
    testOpenAI();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Integration Tests</h1>
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Supabase Status:</h2>
          <p>{supabaseStatus}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">OpenAI Status:</h2>
          <p>{openaiStatus}</p>
        </div>
      </div>
    </div>
  );
} 