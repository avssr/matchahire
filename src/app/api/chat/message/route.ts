import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getSystemPrompt } from '@/lib/chat/context';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const attachments = formData.getAll('attachments') as File[];

    if (!text) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
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

    // Save the user's message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: text,
        attachments: attachments.length > 0 ? attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })) : null
      });

    if (messageError) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Get AI response
    const systemPrompt = getSystemPrompt(session.context);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // Save AI response
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: session.id,
        role: 'assistant',
        content: aiResponse
      });

    if (aiMessageError) {
      return NextResponse.json({ error: 'Failed to save AI response' }, { status: 500 });
    }

    // Update session context if needed
    const nextMode = session.context.mode;
    const nextStep = session.context.currentStep;
    const collectedInfo = session.context.collectedInfo;

    return NextResponse.json({
      session: {
        ...session,
        context: {
          ...session.context,
          mode: nextMode,
          currentStep: nextStep,
          collectedInfo
        }
      }
    });
  } catch (error) {
    console.error('Message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 