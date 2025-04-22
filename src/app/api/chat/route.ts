import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSystemPrompt } from '@/lib/chat/context';
import { cookies } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const messages = JSON.parse(formData.get('messages') as string);
    const roleId = formData.get('roleId') as string;
    const resumeContent = formData.get('resumeContent') as string;
    const mode = formData.get('mode') as string;
    const expectedResponseLength = formData.get('expectedResponseLength') as string;
    const attachments = formData.getAll('attachments') as File[];

    if (!roleId) {
      console.error('No role ID provided');
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*, companies(name)')
      .eq('id', roleId)
      .single();

    if (roleError) {
      console.error('Role error:', roleError);
      return NextResponse.json({ 
        error: 'Role not found', 
        details: roleError,
        message: roleError.message,
        hint: roleError.hint
      }, { status: 404 });
    }

    if (!role) {
      console.error('No role found for ID:', roleId);
      return NextResponse.json({ error: 'Role not found', roleId }, { status: 404 });
    }

    // Get or create chat session
    let chatSessionId: string | null = null;
    const { data: existingSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, context')
      .eq('role_id', roleId)
      .eq('status', 'active')
      .single();

    if (sessionError && sessionError.code !== 'PGRST116') {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Failed to get chat session', 
        details: sessionError,
        message: sessionError.message,
        hint: sessionError.hint
      }, { status: 500 });
    }

    if (existingSession) {
      chatSessionId = existingSession.id;
    } else {
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          role_id: roleId,
          status: 'active',
          context: {
            mode: mode || 'initial',
            expectedResponseLength,
            resumeContent,
            collectedInfo: {},
            currentStep: 0,
            totalSteps: 5,
            isComplete: false,
          }
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Create session error:', createError);
        return NextResponse.json({ 
          error: 'Failed to create chat session', 
          details: createError,
          message: createError.message,
          hint: createError.hint
        }, { status: 500 });
      }

      chatSessionId = newSession.id;
    }

    if (!chatSessionId) {
      console.error('No session ID available');
      return NextResponse.json({ error: 'Failed to get or create chat session' }, { status: 500 });
    }

    // Save the user's message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      const { error: messageError } = await supabase.from('messages').insert({
        session_id: chatSessionId,
        role: lastMessage.role,
        content: lastMessage.content,
        attachments: attachments.length > 0 ? attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        })) : null
      });

      if (messageError) {
        console.error('Save message error:', messageError);
        return NextResponse.json({ 
          error: 'Failed to save message', 
          details: messageError,
          message: messageError.message,
          hint: messageError.hint
        }, { status: 500 });
      }
    }

    // Get session context
    const { data: session, error: contextError } = await supabase
      .from('chat_sessions')
      .select('context')
      .eq('id', chatSessionId)
      .single();

    if (contextError) {
      console.error('Context error:', contextError);
      return NextResponse.json({ 
        error: 'Failed to get session context', 
        details: contextError,
        message: contextError.message,
        hint: contextError.hint
      }, { status: 500 });
    }

    // Generate AI response
    try {
      const systemPrompt = getSystemPrompt(role, session?.context || {});
      const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Create a new ReadableStream
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();

            // Save the assistant's response
            if (chatSessionId && fullResponse) {
              const { error: saveError } = await supabase.from('messages').insert({
                session_id: chatSessionId,
                role: 'assistant',
                content: fullResponse,
              });

              if (saveError) {
                console.error('Failed to save assistant message:', saveError);
              }
            }
          } catch (error) {
            console.error('Stream error:', error);
            controller.error(error);
          }
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from OpenAI', details: error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 