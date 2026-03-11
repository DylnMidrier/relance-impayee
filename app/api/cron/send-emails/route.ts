import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Route appelée par Vercel Cron toutes les heures
// Sécurisée par CRON_SECRET en Authorization header

function buildRfc2822(to: string, subject: string, body: string): string {
  const lines = [
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

export async function GET(req: Request) {
  // Vérification du secret cron
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Client service role pour lire tous les sends en attente
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Récupère les envois planifiés à envoyer maintenant et pas encore envoyés
  const { data: pending, error } = await supabase
    .from('scheduled_sends')
    .select(`
      id, facture_id, niveau,
      factures (
        email_client, nom_client, date_echeance,
        profiles ( gmail_access_token, prenom )
      ),
      relances ( body_override, subject_override )
    `)
    .lte('send_at', new Date().toISOString())
    .is('sent_at', null)
    .limit(50)

  if (error) {
    console.error('[cron/send-emails] fetch error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (pending ?? []).map(async (send: any) => {
      const facture = send.factures
      const token = facture?.profiles?.gmail_access_token
      const to = facture?.email_client
      const relance = (send.relances ?? []).find((r: any) => r.niveau === send.niveau)

      if (!token || !to) {
        await supabase
          .from('scheduled_sends')
          .update({ error: 'Token ou email manquant', sent_at: new Date().toISOString() })
          .eq('id', send.id)
        return
      }

      const subject = relance?.subject_override ?? `Relance facture — ${facture.nom_client}`
      const body = relance?.body_override ?? ''
      const raw = buildRfc2822(to, subject, body)

      const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      })

      const now = new Date().toISOString()

      if (!gmailRes.ok) {
        const err = await gmailRes.json().catch(() => ({}))
        await supabase
          .from('scheduled_sends')
          .update({ error: JSON.stringify(err), sent_at: now })
          .eq('id', send.id)
        return
      }

      const gmailData = await gmailRes.json()
      await Promise.all([
        supabase
          .from('scheduled_sends')
          .update({ sent_at: now, gmail_message_id: gmailData.id, error: null })
          .eq('id', send.id),
        supabase
          .from('relances')
          .update({ statut: 'envoyée', date_envoi: now.split('T')[0] })
          .eq('facture_id', send.facture_id)
          .eq('niveau', send.niveau),
      ])
    })
  )

  const failed = results.filter(r => r.status === 'rejected').length
  return NextResponse.json({ processed: results.length, failed })
}
