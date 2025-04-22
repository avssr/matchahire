import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

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

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    // Update session context with resume URL
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        context: {
          ...session.context,
          collectedInfo: {
            ...session.context.collectedInfo,
            resume: publicUrl
          }
        }
      })
      .eq('id', session.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({
      session: {
        ...session,
        context: {
          ...session.context,
          collectedInfo: {
            ...session.context.collectedInfo,
            resume: publicUrl
          }
        }
      },
      resumeUrl: publicUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 