import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, roleId, resumeContent } = await req.json();
    const supabase = createClient();

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Get or create chat session
    const { data: chatSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('role_id', roleId)
      .eq('user_id', session.user.id)
      .single();

    let sessionId = chatSession?.id;

    if (!chatSession) {
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          role_id: roleId,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (createError) throw createError;
      sessionId = newSession.id;
    }

    // Construct system prompt with role and resume context
    const systemPrompt = `
      You are a virtual recruiter for ${role.title} position.
      ${resumeContent ? `Candidate's resume summary: ${resumeContent}` : ''}
      Conversation mode: ${role.conversation_mode}
      Expected response length: ${role.expected_response_length}
    `.trim();

    // Get streaming response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
    });

    // Create a new ReadableStream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Save the message to Supabase
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      await supabase.from('messages').insert({
        session_id: sessionId,
        role: lastMessage.role,
        content: lastMessage.content,
      });
    }

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 