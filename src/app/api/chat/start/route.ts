import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
    }

    const supabase = createClient();

    // Get role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Create a new chat session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        role_id: roleId,
        status: 'active',
        context: {
          roleId,
          mode: 'initial',
          currentStep: 0,
          totalSteps: 5,
          collectedInfo: {}
        }
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({
      session,
      persona: {
        id: role.id,
        name: role.title,
        description: role.description,
        company: role.company_name,
        role: role.role_title
      }
    });
  } catch (error) {
    console.error('Start session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 