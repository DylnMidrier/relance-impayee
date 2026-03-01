'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'

const PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK!

export default function CheckoutButton() {
  const [href, setHref] = useState(PAYMENT_LINK)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const url = new URL(PAYMENT_LINK)
      url.searchParams.set('client_reference_id', user.id)
      if (user.email) url.searchParams.set('prefilled_email', user.email)
      setHref(url.toString())
    })
  }, [])

  return (
    <a
      href={href}
      className="block w-full text-center text-sm font-semibold px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 transition-colors no-underline mb-8 shadow"
    >
      Passer Premium →
    </a>
  )
}
