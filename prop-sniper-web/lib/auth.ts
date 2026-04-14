import { createClient } from '@/utils/supabase/server';

export type UserProfile = {
  id: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'free' | 'pro';
};

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, plan')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile as UserProfile;
}