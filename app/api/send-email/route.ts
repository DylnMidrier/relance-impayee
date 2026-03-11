import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const SendSchema = z.object({
  factureId: z.string().uuid(),
  niveau:    z.union([z.literal(1), z.literal(2), z.literal(3)]),
  token:     z.string().min(1),
  to:        z.string().email(),
  subject:   z.string().min(1).max(200),
  body:      z.string().min(1).max(8000),
  fromName:  z.string().max(100).optional(),
})

// Encode un email au format RFC 2822 en base64url pour l'API Gmail
function buildRfc2822(to: string, subject: string, body: string, fromName?: string): string {
  const from = fromName ? `"${fromName}" <me>` : 'me'
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(body).toString('base64'),
  ]
  return Buffer.from(lines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function POST(req: Request) {
  const parsed = SendSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 })
  }
  const { factureId, niveau, token, to, subject, body, fromName } = parsed.data

  // Vérifier que l'user est authentifié et propriétaire de la facture
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const { data: facture } = await supabase
    .from('factures')
    .select('id')
    .eq('id', factureId)
    .eq('user_id', user.id)
    .single()
  if (!facture) return NextResponse.json({ error: 'Facture introuvable.' }, { status: 404 })

  // Envoi via Gmail API
  const raw = buildRfc2822(to, subject, body, fromName)
  const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!gmailRes.ok) {
    const err = await gmailRes.json().catch(() => ({}))
    console.error('[send-email] Gmail error', gmailRes.status, err)
    return NextResponse.json({ error: 'Échec de l\'envoi Gmail.' }, { status: 502 })
  }

  const gmailData = await gmailRes.json()

  // Marquer comme envoyé dans scheduled_sends + relances
  const now = new Date().toISOString()
  await Promise.all([
    supabase
      .from('scheduled_sends')
      .upsert({
        facture_id: factureId,
        niveau,
        send_at: now,
        sent_at: now,
        gmail_message_id: gmailData.id,
      }, { onConflict: 'facture_id,niveau' }),
    supabase
      .from('relances')
      .update({ statut: 'envoyée', date_envoi: now.split('T')[0] })
      .eq('facture_id', factureId)
      .eq('niveau', niveau),
  ])

  return NextResponse.json({ success: true, messageId: gmailData.id })
}
