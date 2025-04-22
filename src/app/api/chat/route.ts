import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSystemPrompt } from '@/lib/chat/context';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    const supabase = createClient();

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('Invalid authorization header format');
      return NextResponse.json({ error: 'Unauthorized - Invalid token format' }, { status: 401 });
    }

    // Generate a valid UUID for the default user
    const userId = token === 'default-user-id' ? uuidv4() : token;
    if (!userId) {
      console.error('Invalid user ID');
      return NextResponse.json({ error: 'Unauthorized - Invalid user ID' }, { status: 401 });
    }

    console.log('Authenticated user:', userId);
    console.log('Fetching role:', roleId);

    // Get role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
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

    console.log('Found role:', role);

    // Get or create chat session
    let sessionId: string | null = null;
    const { data: existingSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, context')
      .eq('role_id', roleId)
      .eq('user_id', userId)
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
      sessionId = existingSession.id;
    } else {
      const { data: newSession, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          role_id: roleId,
          user_id: userId,
          status: 'active',
          context: {
            roleId,
            mode: mode || 'initial',
            expectedResponseLength: expectedResponseLength || 'medium',
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

      sessionId = newSession.id;
    }

    if (!sessionId) {
      console.error('No session ID available');
      return NextResponse.json({ error: 'Failed to get or create chat session' }, { status: 500 });
    }

    // Save the user's message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage) {
      const { error: messageError } = await supabase.from('messages').insert({
        session_id: sessionId,
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
      .eq('id', sessionId)
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

    // Construct system prompt with role and context
    const systemPrompt = getSystemPrompt(session.context);

    try {
      // Get streaming response from OpenAI
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
            if (sessionId && fullResponse) {
              const { error: saveError } = await supabase.from('messages').insert({
                session_id: sessionId,
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