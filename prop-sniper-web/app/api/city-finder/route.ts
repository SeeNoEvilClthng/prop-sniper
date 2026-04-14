import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type FilterRequest = {
  city?: string;
  state?: string;
  filters?: {
    isPreforeclosure?: boolean;
    isForeclosure?: boolean;
    hasTaxLien?: boolean;
    isTaxDelinquent?: boolean;
  };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as FilterRequest;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, plan')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const wantsPhase2Filter =
      body.filters?.isPreforeclosure ||
      body.filters?.isForeclosure ||
      body.filters?.hasTaxLien ||
      body.filters?.isTaxDelinquent;

    const canUsePhase2Filters =
      profile.plan === 'pro' || profile.role === 'admin';

    if (wantsPhase2Filter && !canUsePhase2Filters) {
      return NextResponse.json(
        { error: 'Pro access required for distress filters' },
        { status: 403 }
      );
    }

    let query = supabase.from('properties').select('*');

    if (body.city) {
      query = query.eq('city', body.city);
    }

    if (body.state) {
      query = query.eq('state', body.state);
    }

    if (body.filters?.isPreforeclosure) {
      query = query.eq('is_preforeclosure', true);
    }

    if (body.filters?.isForeclosure) {
      query = query.eq('is_foreclosure', true);
    }

    if (body.filters?.hasTaxLien) {
      query = query.eq('has_tax_lien', true);
    }

    if (body.filters?.isTaxDelinquent) {
      query = query.eq('is_tax_delinquent', true);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: data ?? [] });
  } catch (error) {
    console.error('city-finder error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}