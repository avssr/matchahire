import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();

    // Get the current session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No active session found' }, { status: 404 });
    }

    // Update session status to completed
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({ status: 'completed' })
      .eq('id', session.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('End session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 