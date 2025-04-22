import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { getPersonaForRole } from '@/lib/chat/personas';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  return new NextResponse(JSON.stringify({ 
    error: 'Method not allowed',
    message: 'Please use POST method to start a chat session'
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return new NextResponse(JSON.stringify({ 
        error: 'Invalid request body',
        details: 'Request body must be valid JSON'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { roleId, mode, expectedResponseLength } = body;

    if (!roleId) {
      return new NextResponse(JSON.stringify({ 
        error: 'Role ID is required',
        details: 'roleId parameter is missing in request body'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return new NextResponse(JSON.stringify({ 
        error: 'Role not found',
        details: roleError?.message
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get persona configuration
    const persona = await getPersonaForRole(roleId);

    // Create new chat session with explicit ID and status
    const sessionId = uuidv4();
    const { data: chatSession, error: sessionCreateError } = await supabase
      .from('chat_sessions')
      .insert({
        id: sessionId,
        role_id: roleId,
        status: 'active',
        context: {
          roleType: role.title,
          mode: mode || 'initial',
          expectedResponseLength: expectedResponseLength || 'medium',
          currentStage: 0,
          totalStages: 5,
          lastActivity: new Date().toISOString(),
          persona: {
            name: persona.name,
            gender: persona.gender,
            style: persona.style,
            languageTone: persona.languageTone,
            emojiStyle: persona.emojiStyle
          },
          roleDetails: {
            title: role.title,
            description: role.description,
            requirements: role.requirements
          }
        }
      })
      .select()
      .single();

    if (sessionCreateError) {
      return new NextResponse(JSON.stringify({ 
        error: 'Failed to create chat session',
        details: sessionCreateError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate initial welcome message
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are ${persona.name}, an AI recruiter specialized in ${role.title} roles. 
          Your style is ${persona.style} and you speak with a ${persona.languageTone} tone.
          ${persona.emojiStyle ? 'Use emojis appropriately in your responses.' : ''}

          Role Details:
          - Title: ${role.title}
          - Description: ${role.description}
          ${role.requirements ? `\nKey Requirements:\n${role.requirements.join('\n')}` : ''}
          ${role.responsibilities ? `\nKey Responsibilities:\n${role.responsibilities.join('\n')}` : ''}

          ${persona.basePrompt}`
        },
        {
          role: "user",
          content: "Hello"
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    const welcomeMessage = completion.choices[0]?.message?.content || 
      `Hello! I'm ${persona.name}, your AI recruiter for this ${role.title} role. How can I help you today?`;

    // Save welcome message with explicit ID
    const messageId = uuidv4();
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        id: messageId,
        session_id: chatSession.id,
        content: welcomeMessage,
        role: 'assistant'
      });

    if (messageError) {
      console.error('Failed to save welcome message:', messageError);
    }

    return new NextResponse(JSON.stringify({
      session: chatSession,
      welcomeMessage,
      role: {
        type: role.title
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in chat start:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 