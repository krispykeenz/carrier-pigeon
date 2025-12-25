import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { createDemoSupabase } from '@/demo/demoSupabase';

const DEMO_MODE_FLAG = 'true';
const isDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE === DEMO_MODE_FLAG;

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (() => {
  if (isDemoMode) {
    return createDemoSupabase() as any;
  }

  if (!url || !anonKey) {
    throw new Error(
      'Supabase credentials are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
})();
