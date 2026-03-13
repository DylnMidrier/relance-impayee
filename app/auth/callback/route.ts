import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      },
    )
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)
    const user = session?.user
    if (user) {
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          plan: 'free',
          ...(session.provider_token         && { gmail_access_token:  session.provider_token }),
          ...(session.provider_refresh_token && { gmail_refresh_token: session.provider_refresh_token }),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )
    }
  }

  return NextResponse.redirect(origin)
}
