import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractTextFromFile } from '@/lib/chat/fileProcessor';
import { analyzeResume, analyzePortfolio } from '@/lib/chat/intelligence';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'resume' | 'portfolio';
    const sessionId = formData.get('sessionId') as string;

    if (!file || !type || !sessionId) {
      return new NextResponse(JSON.stringify({ 
        error: 'Missing required fields',
        details: 'File, type, and sessionId are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract text from file
    const text = await extractTextFromFile(file);

    // Analyze based on file type
    let insights;
    if (type === 'resume') {
      insights = await analyzeResume(text);
    } else {
      insights = await analyzePortfolio(text);
    }

    // Update session with file insights
    const supabase = createClient();
    await supabase
      .from('chat_sessions')
      .update({
        context: {
          [`${type}Insights`]: insights,
          [`${type}Submitted`]: true
        }
      })
      .eq('id', sessionId);

    return new NextResponse(JSON.stringify({ insights }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('File processing error:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 