'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../lib/supabase'
import type { Plan } from '../lib/plan'

export default function DashboardNav({ plan }: { plan: Plan }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await createClient().auth.signOut()
  }

  const meta = user?.user_metadata as { avatar_url?: string; full_name?: string; name?: string } | undefined
  const avatarUrl = meta?.avatar_url
  const firstName = (meta?.full_name ?? meta?.name ?? '').split(' ')[0]

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#0c0e14]/95 backdrop-blur-sm border-b border-white/[0.07]">
      <a href="/" className="flex items-center gap-1.5 no-underline group">
        <img src="/recouvr_logo.webp" alt="Recouvr.io" className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
        <span className="text-base sm:text-lg font-black tracking-tight text-[#f0f2ff]">
          Recouvr<span className="text-[#7c6dfa]">.io</span>
        </span>
      </a>

      <div className="flex items-center gap-2 sm:gap-3">
        {plan === 'premium' ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#7c6dfa]/30 bg-[#7c6dfa]/10 text-[#7c6dfa]">
            ✦ Premium
          </span>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/[0.08] text-[#454d6e] hover:border-[#7c6dfa]/30 hover:text-[#7c6dfa] transition-colors no-underline"
          >
            Gratuit
          </Link>
        )}

        {user && (
          <div className="relative group">
            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#7c6dfa]/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#7c6dfa]">{firstName[0]?.toUpperCase() ?? '?'}</span>
                </div>
              )}
              {firstName && (
                <span className="text-xs text-[#8891b4] hidden sm:block">
                  Bonjour, <span className="font-semibold text-[#f0f2ff]">{firstName}</span>
                </span>
              )}
              <svg className="w-3 h-3 text-[#454d6e] hidden sm:block transition-transform duration-150 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="absolute right-0 top-full pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50">
              <div className="bg-[#13151f] border border-white/[0.08] rounded-xl shadow-xl overflow-hidden min-w-[160px]">
                <button
                  onClick={signOut}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
