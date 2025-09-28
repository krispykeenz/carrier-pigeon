import { supabase } from '@/services/supabaseClient';
import type { ProfileRow } from '@/types/database';

export async function getAllProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return (data ?? []) as ProfileRow[];
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ProfileRow;
}
