import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// Appelé par Vercel Cron chaque jour à 18h UTC
// Envoie une alerte email à chaque user ayant un envoi automatique prévu le lendemain

const resend = new Resend(process.env.RESEND_API_KEY)

const NIVEAU_LABEL: Record<number, string> = {
  1: '1re relance',
  2: '2e relance',
  3: 'Mise en demeure',
}

function buildAlertHtml(
  prenom: string,
  sends: { niveauLabel: string; nomClient: string; montant: number | null; sendAt: string }[],
): string {
  const dateLabel = new Date(sends[0].sendAt).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const rows = sends.map(s => `
    <tr>
      <td style="font-size:13px;color:#6b7280;padding:8px 0;border-bottom:1px solid #f3f4f6;">${s.niveauLabel}</td>
      <td style="font-size:13px;font-weight:600;color:#0c0e14;padding:8px 0;border-bottom:1px solid #f3f4f6;">${s.nomClient}</td>
      <td style="font-size:13px;color:#6b7280;padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
        ${s.montant != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(s.montant) : '—'}
      </td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#0c0e14;padding:28px 32px;">
          <p style="margin:0;font-size:18px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">recouvr<span style="color:#7c6dfa;">.</span>io</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">

          <!-- Icône -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="width:40px;height:40px;background:#ede9fe;border-radius:50%;text-align:center;vertical-align:middle;">
              <span style="font-size:18px;line-height:40px;">🔔</span>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0c0e14;letter-spacing:-0.3px;">
            ${sends.length === 1 ? 'Un envoi automatique prévu demain' : `${sends.length} envois automatiques prévus demain`}
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.5;">
            ${prenom ? `Bonjour ${prenom},` : 'Bonjour,'} voici les relances qui partiront automatiquement <strong style="color:#0c0e14;">${dateLabel}</strong> depuis votre Gmail.
          </p>

          <!-- Tableau des envois -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:4px 20px 0;margin-bottom:28px;">
            <tr>
              <td style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding:14px 0 10px;">Niveau</td>
              <td style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding:14px 0 10px;">Client</td>
              <td style="font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding:14px 0 10px;text-align:right;">Montant</td>
            </tr>
            ${rows}
          </table>

          <p style="margin:0 0 20px;font-size:13px;color:#9ca3af;line-height:1.6;">
            Vous pouvez modifier ou désactiver l'envoi automatique depuis votre tableau de bord avant 8h30 demain matin.
          </p>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#7c6dfa;border-radius:10px;">
              <a href="https://recouvr.io/dashboard" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                Voir mon tableau de bord →
              </a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #f3f4f6;">
          <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
            Vous recevez cet email car l'envoi automatique est activé sur recouvr.io.<br>
            Pour le désactiver, rendez-vous dans votre <a href="https://recouvr.io/dashboard" style="color:#7c6dfa;text-decoration:none;">tableau de bord</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Fenêtre : demain 00:00 → demain 23:59:59 UTC
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const from = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 0, 0, 0))
  const to   = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate(), 23, 59, 59))

  const { data: pending, error } = await supabase
    .from('scheduled_sends')
    .select(`
      id, niveau, send_at,
      factures ( user_id, nom_client, montant )
    `)
    .gte('send_at', from.toISOString())
    .lte('send_at', to.toISOString())
    .is('sent_at', null)

  if (error) {
    console.error('[cron/send-reminders] fetch error', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Groupe par user_id
  const byUser = new Map<string, typeof pending>()
  for (const send of pending ?? []) {
    const userId = (send.factures as any)?.user_id
    if (!userId) continue
    if (!byUser.has(userId)) byUser.set(userId, [])
    byUser.get(userId)!.push(send)
  }

  const results = await Promise.allSettled(
    Array.from(byUser.entries()).map(async ([userId, sends]) => {
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)
      if (!authUser?.email) return

      const prenom = authUser.user_metadata?.given_name
        ?? authUser.user_metadata?.full_name?.split(' ')[0]
        ?? ''

      const sendsForEmail = sends.map((s: any) => ({
        niveauLabel: NIVEAU_LABEL[s.niveau] ?? `Relance N${s.niveau}`,
        nomClient:   s.factures?.nom_client ?? '—',
        montant:     s.factures?.montant ?? null,
        sendAt:      s.send_at,
      }))

      await resend.emails.send({
        from:    'recouvr.io <notifications@recouvr.io>',
        to:      authUser.email,
        subject: sendsForEmail.length === 1
          ? `🔔 Rappel : 1 relance envoyée demain (${sendsForEmail[0].nomClient})`
          : `🔔 Rappel : ${sendsForEmail.length} relances envoyées demain`,
        html: buildAlertHtml(prenom, sendsForEmail),
      })
    })
  )

  const failed = results.filter(r => r.status === 'rejected').length
  return NextResponse.json({ notified: results.length, failed })
}
