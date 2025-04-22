import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const message = formData.get('message');
    const sessionId = formData.get('sessionId');

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and session ID are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get chat session and role details
    const { data: chatSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        roles (
          title,
          description,
          requirements,
          responsibilities,
          conversation_mode,
          expected_response_length
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    // Get previous messages for context
    const { data: previousMessages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch chat history' },
        { status: 500 }
      );
    }

    // Save user message
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message
      });

    if (userMessageError) {
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Prepare conversation context for OpenAI
    const systemPrompt = `You are an AI recruiter for the ${chatSession.roles.title} position.
    Your role is to help candidates understand the position and evaluate their fit.
    Be professional but friendly, and focus on understanding the candidate's experience and skills.
    Keep responses concise and relevant to the role.
    
    Role Details:
    Title: ${chatSession.roles.title}
    Description: ${chatSession.roles.description}
    Requirements: ${chatSession.roles.requirements}
    Responsibilities: ${chatSession.roles.responsibilities}
    
    Conversation Mode: ${chatSession.roles.conversation_mode || 'structured'}
    Expected Response Length: ${chatSession.roles.expected_response_length || 'medium'}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.choices[0].message.content;

    // Save AI response
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse
      });

    if (aiMessageError) {
      return NextResponse.json(
        { error: 'Failed to save AI response' },
        { status: 500 }
      );
    }

    // Get updated message history
    const { data: updatedMessages, error: updatedMessagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (updatedMessagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch updated messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session: chatSession,
      messages: updatedMessages
    });
  } catch (error) {
    console.error('Error in message handling:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 