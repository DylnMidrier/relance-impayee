import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// Route appelée par Vercel Cron une fois par jour à 9h30 Paris
// Sécurisée par CRON_SECRET en Authorization header

const resend = new Resend(process.env.RESEND_API_KEY)

const NIVEAU_LABEL: Record<number, string> = {
  1: '1re relance',
  2: '2e relance',
  3: 'Mise en demeure',
}

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

function buildNotifHtml(prenom: string, niveauLabel: string, nomClient: string, emailClient: string): string {
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

          <!-- Icône succès -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="width:40px;height:40px;background:#ecfdf5;border-radius:50%;text-align:center;vertical-align:middle;">
              <span style="font-size:18px;line-height:40px;">✓</span>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#0c0e14;letter-spacing:-0.3px;">Email envoyé automatiquement</p>
          <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.5;">
            ${prenom ? `Bonjour ${prenom},` : 'Bonjour,'} votre <strong style="color:#0c0e14;">${niveauLabel}</strong> a bien été envoyée à votre client.
          </p>

          <!-- Détails -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
            <tr>
              <td style="font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:12px;">Détails de l'envoi</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding-bottom:6px;">Niveau</td>
              <td style="font-size:13px;font-weight:600;color:#0c0e14;text-align:right;">${niveauLabel}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;padding-bottom:6px;">Client</td>
              <td style="font-size:13px;font-weight:600;color:#0c0e14;text-align:right;">${nomClient}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#6b7280;">Destinataire</td>
              <td style="font-size:13px;font-weight:600;color:#0c0e14;text-align:right;">${emailClient}</td>
            </tr>
          </table>

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
      factures ( user_id, email_client, nom_client, date_echeance )
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

      // Récupère le profil séparément (pas de FK directe entre factures et profiles)
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('gmail_access_token, gmail_refresh_token')
        .eq('id', facture?.user_id)
        .single()
      if (profileErr) console.log('[cron] profile error:', JSON.stringify(profileErr))

      // Rafraîchit le token Gmail si un refresh_token est disponible
      let token = profile?.gmail_access_token
      console.log(`[cron] profile raw:`, JSON.stringify(profile))
      console.log(`[cron] send#${send.id} user=${facture?.user_id} has_access=${!!profile?.gmail_access_token} has_refresh=${!!profile?.gmail_refresh_token} to=${facture?.email_client}`)
      if (profile?.gmail_refresh_token && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id:     process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: profile.gmail_refresh_token,
            grant_type:    'refresh_token',
          }),
        })
        const refreshData = await refreshRes.json()
        console.log(`[cron] refresh result: ok=${!!refreshData.access_token} error=${refreshData.error ?? 'none'}`)
        if (refreshData.access_token) {
          token = refreshData.access_token
          await supabase.from('profiles')
            .update({ gmail_access_token: token })
            .eq('id', facture.user_id)
        }
      } else {
        console.log(`[cron] skipping refresh: has_refresh=${!!profile?.gmail_refresh_token} GOOGLE_CLIENT_ID=${!!process.env.GOOGLE_CLIENT_ID} GOOGLE_CLIENT_SECRET=${!!process.env.GOOGLE_CLIENT_SECRET}`)
      }
      const to = facture?.email_client

      // Récupère la relance séparément (pas de FK directe entre scheduled_sends et relances)
      const { data: relance } = await supabase
        .from('relances')
        .select('body_override, subject_override')
        .eq('facture_id', send.facture_id)
        .eq('niveau', send.niveau)
        .single()

      if (!token || !to) {
        console.log(`[cron] aborting send#${send.id}: token=${!!token} to=${!!to}`)
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

      // Notification email à l'utilisateur via Resend
      if (process.env.RESEND_API_KEY && facture.user_id) {
        const { data: { user: authUser } } = await supabase.auth.admin.getUserById(facture.user_id)
        if (authUser?.email) {
          const niveauLabel = NIVEAU_LABEL[send.niveau] ?? `Relance N${send.niveau}`
          const prenom = profile?.prenom ?? ''
          await resend.emails.send({
            from: 'recouvr.io <notifications@recouvr.io>',
            to: authUser.email,
            subject: `✓ ${niveauLabel} envoyée à ${facture.nom_client}`,
            html: buildNotifHtml(prenom, niveauLabel, facture.nom_client, facture.email_client),
          }).catch(err => console.error('[cron/notif-resend]', err))
        }
      }
    })
  )

  const failed = results.filter(r => r.status === 'rejected').length
  return NextResponse.json({ processed: results.length, failed })
}
