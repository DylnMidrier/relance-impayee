'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../lib/supabase'
import type { Plan } from '../lib/plan'
import { useTheme } from './ThemeProvider'

export default function DashboardNav({ plan }: { plan: Plan }) {
  const [user, setUser] = useState<User | null>(null)
  const { theme, toggle } = useTheme()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 10) setVisible(true)
      else if (y > lastY.current + 8) setVisible(false)
      else if (y < lastY.current - 4) setVisible(true)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <nav className={`sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 bg-[--bg]/95 backdrop-blur-sm border-b border-[--bd] transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <a href="/" className="flex items-center gap-1.5 no-underline group">
        <img src="/recouvr_logo.webp" alt="Recouvr.io" className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
        <span className="text-base sm:text-lg font-black tracking-tight text-[--t1]">
          Recouvr<span className="text-[#7c6dfa]">.io</span>
        </span>
      </a>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="p-2 rounded-lg text-[--t3] hover:text-[--t2] hover:bg-[--h1] transition-colors"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {plan === 'premium' ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500 via-rose-400 to-orange-400 text-white shadow-md shadow-violet-500/20">
            + Premium
          </span>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[--bd2] text-[--t3] hover:border-[#7c6dfa]/30 hover:text-[#7c6dfa] transition-colors no-underline"
          >
            Gratuit
          </Link>
        )}

        {user && (
          <div className="relative group">
            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[--h1] transition-colors">
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
                <span className="text-xs text-[--t2] hidden sm:block">
                  Bonjour, <span className="font-semibold text-[--t1]">{firstName}</span>
                </span>
              )}
              <svg className="w-3 h-3 text-[--t3] hidden sm:block transition-transform duration-150 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className="absolute right-0 top-full pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50">
              <div className="bg-[--card] border border-[--bd2] rounded-xl shadow-xl overflow-hidden min-w-[160px]">
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
