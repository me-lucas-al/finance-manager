import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// Lazy, service-role-only client for the Open Finance data (Supabase project is
// separate from the app's Neon/Drizzle database — see plano_migracao.xml, tarefa 1).
// Never import this from client components: it holds the secret service role key.
export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY).',
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
