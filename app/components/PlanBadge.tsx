'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

type Plan = 'free' | 'premium' | null

export default function PlanBadge() {
  const [plan, setPlan] = useState<Plan>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchPlan(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single()
      setPlan((data?.plan as 'free' | 'premium') ?? 'free')
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) fetchPlan(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        fetchPlan(session.user.id)
      } else {
        setPlan(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (plan === 'premium') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600">
        ✦ Premium
      </span>
    )
  }

  if (plan === 'free') {
    return (
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors no-underline"
      >
        Gratuit
      </Link>
    )
  }

  return null
}
