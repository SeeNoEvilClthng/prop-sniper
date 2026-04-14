import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type RequestBody = {
  email: string;
  plan: 'free' | 'pro';
  role?: 'user' | 'admin';
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: me, error: meError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (meError || !me || me.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatePayload: { plan: 'free' | 'pro'; role?: 'user' | 'admin' } = {
      plan: body.plan,
    };

    if (body.role) {
      updatePayload.role = body.role;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('email', body.email)
      .select('id, email, role, plan')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ updatedUser: data });
  } catch (error) {
    console.error('set-plan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}