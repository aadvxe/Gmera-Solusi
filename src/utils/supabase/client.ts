// Import createServerClient untuk membuat Supabase client di server component dengan akses cookie Next.js.
import { createBrowserClient } from '@supabase/ssr'
// Import createClient Supabase untuk membuat koneksi browser lama memakai URL dan anon key dari env.
import { type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined;

// createClient membuat satu Supabase browser client yang dipakai ulang untuk login, query tabel, dan realtime di Client Component.
export function createClient() {
  // Kalau client sudah pernah dibuat, gunakan instance yang sama agar koneksi Supabase browser tidak dibuat berulang.
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // createClient mengembalikan Supabase browser client yang baru dibuat dari env URL dan anon key.
  return client;
}
