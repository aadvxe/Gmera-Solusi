// Import createServerClient untuk membuat Supabase client di server component dengan akses cookie Next.js.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
// Import cookies agar Supabase server client bisa membaca dan menyimpan cookie session melalui Next.js.
import { cookies } from 'next/headers'

// createClient membuat Supabase client untuk Server Component dan middleware, lengkap dengan akses cookie session dari Next.js.
export async function createClient() {
  // await menunggu proses async selesai sebelum Supabase client server melanjutkan langkah berikutnya.
  const cookieStore = await cookies()

  // createClient mengembalikan Supabase server client yang sudah tersambung ke cookie Next.js.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // cookieStore mengembalikan nilai yang dibutuhkan oleh Supabase client server.
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // try ini mencoba menulis cookie session; error diabaikan jika pemanggilnya adalah Server Component.
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          // try ini mencoba menulis cookie session; error diabaikan jika pemanggilnya adalah Server Component.
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
