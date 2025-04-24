import { createClient } from '@/lib/supabase/server';
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPersonaForRole } from '@/lib/chat/personas';
import { Education, Project, ResumeInsights, PortfolioInsights } from '@/lib/chat/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, roleId, sessionId } = await req.json();

    if (!roleId || !messages || !sessionId) {
      console.error('Missing required fields:', { roleId, messages, sessionId });
      return NextResponse.json({ error: 'Role ID, messages, and session ID are required' }, { status: 400 });
    }

    const supabase = createClient();

    // Get role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      console.error('Role error:', roleError);
      return NextResponse.json({ 
        error: 'Role not found', 
        details: roleError?.message
      }, { status: 404 });
    }

    // Get session context including any uploaded documents
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ 
        error: 'Failed to get session context', 
        details: sessionError?.message
      }, { status: 500 });
    }

    // Get persona configuration
    const persona = await getPersonaForRole(roleId);

    // Generate AI response
    try {
      let systemPrompt = `You are ${persona.name}, an AI recruiter specialized in ${role.title} roles. 
      Your style is ${persona.style} and you speak with a ${persona.languageTone} tone.
      ${persona.emojiStyle ? 'Use emojis appropriately in your responses.' : ''}

      Role Details:
      - Title: ${role.title}
      - Description: ${role.description}
      ${role.requirements ? `\nKey Requirements:\n${role.requirements.join('\n')}` : ''}
      ${role.responsibilities ? `\nKey Responsibilities:\n${role.responsibilities.join('\n')}` : ''}`;

      // Add document context if available
      if (session.context?.resumeInsights) {
        const insights = session.context.resumeInsights as ResumeInsights;
        systemPrompt += `\n\nCandidate's Resume Insights:
        - Skills: ${insights.skills.join(', ')}
        - Experience: ${insights.experience.years} years
        - Previous Roles: ${insights.experience.roles.join(', ')}
        - Education: ${insights.education.map(edu => 
          `${edu.degree} from ${edu.institution} (${edu.year})`
        ).join(', ')}`;
      }

      if (session.context?.portfolioInsights) {
        const insights = session.context.portfolioInsights as PortfolioInsights;
        systemPrompt += `\n\nCandidate's Portfolio Insights:
        - Projects: ${insights.projects.map(p => p.name).join(', ')}
        - Technical Skills: ${insights.skills.join(', ')}`;
      }

      systemPrompt += `\n\n${persona.basePrompt}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }

      // Save the assistant's response
      const { error: saveError } = await supabase.from('messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: aiResponse,
        status: 'delivered'
      });

      if (saveError) {
        console.error('Failed to save assistant message:', saveError);
      }

      return NextResponse.json({
        content: aiResponse,
        sessionId
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