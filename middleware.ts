// Import createServerClient untuk membuat Supabase client di middleware; client ini membaca cookie session dari request dan menulis cookie baru ke response.
import { createServerClient, type CookieOptions } from '@supabase/ssr'
// Import NextRequest dan NextResponse agar middleware bisa membaca URL/cookie request lalu mengirim response normal atau redirect.
import { NextResponse, type NextRequest } from 'next/server'

// middleware berjalan sebelum halaman dibuka untuk mengecek cookie Supabase, mengarahkan user yang belum login ke /login, dan menjaga cookie auth tetap ikut di response.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Supabase SSR meminta cookie auth lewat fungsi ini; middleware mengambil nilainya dari request user yang sedang dibuka.
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // IMPORTANT: getUser() validates the session server-side.
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes — redirect to login if no valid session
  const protectedPaths = [
    '/beranda', '/pendapatan', '/pengeluaran', '/e-invoice',
    '/laporan', '/klien', '/pengaturan', '/profil'
  ]
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  // Kalau user membuka halaman dashboard tanpa session valid, middleware menyiapkan redirect ke /login.
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    // Create the redirect and then copy cookies from our 'response' object
    const redirectResponse = NextResponse.redirect(loginUrl)
    // Transfer cookies set by supabase.auth.getUser() to the redirect response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    // Middleware mengirim response redirect yang sudah membawa cookie Supabase terbaru.
    return redirectResponse
  }

  // If already authenticated, redirect away from login/root
  if (user && (pathname === '/login' || pathname === '/')) {
    const berandaUrl = new URL('/beranda', request.url)
    const redirectResponse = NextResponse.redirect(berandaUrl)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    // Middleware mengirim response redirect yang sudah membawa cookie Supabase terbaru.
    return redirectResponse
  }

  // If root with no auth — go to login
  if (!user && pathname === '/') {
    // Middleware mengirim redirect ke halaman login untuk pengunjung yang belum punya session.
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Middleware melanjutkan request normal karena user boleh membuka halaman yang diminta.
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
