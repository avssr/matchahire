import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { roleId: string } }
) {
  try {
    const supabase = createClient();

    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', params.roleId)
      .single();

    if (error || !role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 