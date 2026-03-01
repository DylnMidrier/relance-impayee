import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Initialisé à la demande pour éviter une erreur au build si la var n'est pas encore définie
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature invalide', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.client_reference_id
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string | null

    if (!userId) {
      console.error('[stripe webhook] client_reference_id manquant')
      return NextResponse.json({ error: 'Missing client_reference_id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        plan: 'premium',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
      })
      .eq('id', userId)

    if (error) console.error('[stripe webhook] update profiles failed', error)
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('stripe_customer_id', customerId)

    if (error) console.error('[stripe webhook] downgrade failed', error)
  }

  return NextResponse.json({ received: true })
}
