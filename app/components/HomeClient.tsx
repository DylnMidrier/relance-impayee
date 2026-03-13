'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormState, EmailTemplate, genEmails, genEmailLevel } from '../lib/emails'
import { createClient } from '../lib/supabase'
import FormSection from './FormSection'
import ResultsModal from './ResultsModal'
import UpgradeModal from './UpgradeModal'
import type { Plan } from '../dashboard/page'

const PENDING_FORM_KEY = 'recouvr_pending_form'

export default function HomeClient() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [form, setForm] = useState<FormState>({ prenom: '', client: '', emailClient: '', facture: '', montant: '', echeance: '' })
  const [emails, setEmails] = useState<EmailTemplate[]>([])
  const [relanceId, setRelanceId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [toastClosing, setToastClosing] = useState(false)
  const [userPlan, setUserPlan] = useState<Plan>('free')
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const given = user?.user_metadata?.given_name ?? user?.user_metadata?.full_name?.split(' ')[0] ?? ''
      if (given) setForm(prev => ({ ...prev, prenom: given }))

      // Restaurer le formulaire après retour OAuth
      const pendingRaw = localStorage.getItem(PENDING_FORM_KEY)
      if (user && pendingRaw) {
        localStorage.removeItem(PENDING_FORM_KEY)
        const pendingForm = JSON.parse(pendingRaw) as FormState
        // Utiliser le prénom Google si le champ était vide
        if (!pendingForm.prenom && given) pendingForm.prenom = given
        setForm(pendingForm)
        await completePendingForm(user, pendingForm)
      }
    })
  }, [])

  async function completePendingForm(user: { id: string }, pendingForm: FormState) {
    const supabase = createClient()
    const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    const plan = (profileData?.plan ?? 'free') as Plan
    setUserPlan(plan)

    if (plan === 'free') {
      const { count } = await supabase
        .from('factures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('statut', 'payé')
      if ((count ?? 0) >= 1) {
        setShowUpgrade(true)
        return
      }
    }

    const generatedEmails = genEmails(pendingForm.prenom, pendingForm.client, pendingForm.facture, pendingForm.montant, pendingForm.echeance)
    setEmails(generatedEmails)
    setRelanceId(null)
    setShowModal(true)

    const { data, error } = await supabase
      .from('factures')
      .insert({
        user_id: user.id,
        nom_client: pendingForm.client,
        email_client: pendingForm.emailClient || null,
        numero_facture: pendingForm.facture || null,
        montant: parseFloat(pendingForm.montant) || null,
        date_echeance: pendingForm.echeance || null,
      })
      .select('id')
      .single()

    if (error) {
      showToast('Impossible d\'enregistrer la relance. Réessayez plus tard.', 'error')
      return
    }

    const factureId = data.id
    setRelanceId(factureId)
  }

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setToastClosing(false)
    setTimeout(() => {
      setToastClosing(true)
      setTimeout(() => setToast(null), 320)
    }, 4000)
  }

  async function handleFormSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    window.dataLayer?.push({ event: 'submit_form' })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Non connecté → mur d'inscription
    if (!user) {
      localStorage.setItem(PENDING_FORM_KEY, JSON.stringify(form))
      setShowAuthModal(true)
      return
    }

    const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    const plan = (profileData?.plan ?? 'free') as Plan
    setUserPlan(plan)

    if (plan === 'free') {
      const { count } = await supabase
        .from('factures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('statut', 'payé')
      if ((count ?? 0) >= 1) {
        setShowUpgrade(true)
        return
      }
    }

    setEmails(genEmails(form.prenom, form.client, form.facture, form.montant, form.echeance))
    setRelanceId(null)
    setShowModal(true)

    const { data, error } = await supabase
      .from('factures')
      .insert({
        user_id: user.id,
        nom_client: form.client,
        email_client: form.emailClient || null,
        numero_facture: form.facture || null,
        montant: parseFloat(form.montant) || null,
        date_echeance: form.echeance || null,
      })
      .select('id')
      .single()

    if (error) {
      showToast('Impossible d\'enregistrer la relance. Réessayez plus tard.', 'error')
      return
    }

    const factureId = data.id
    setRelanceId(factureId)
  }

  function handleRegenerateLevel(level: number) {
    const newEmail = genEmailLevel(level as 1 | 2 | 3, form.prenom, form.client, form.facture, form.montant, form.echeance)
    setEmails(prev => prev.map(e => e.level === level ? newEmail : e))
  }

  async function handleActivateAutoSend(alreadySentLevels: number[]) {
    if (!relanceId || !form.echeance) return
    const supabase = createClient()
    const OFFSETS: Record<number, number> = { 1: 7, 2: 15, 3: 30 }
    const niveauxRestants = [1, 2, 3].filter(n => !alreadySentLevels.includes(n))
    const rows = niveauxRestants.map(n => {
      const [y, m, d] = form.echeance.split('-').map(Number)
      const base = new Date(y, m - 1, d)
      base.setDate(base.getDate() + OFFSETS[n])
      const sendAt = new Date(Date.UTC(base.getFullYear(), base.getMonth(), base.getDate(), 8, 30, 0, 0))
      return { facture_id: relanceId, niveau: n, send_at: sendAt.toISOString() }
    })
    if (!rows.length) return
    await supabase.from('scheduled_sends').insert(rows)
    showToast(`Envoi automatique activé — ${rows.length} email${rows.length > 1 ? 's' : ''} programmé${rows.length > 1 ? 's' : ''}.`, 'success')
  }

  return (
    <>
      <FormSection form={form} onChange={setForm} onSubmit={handleFormSubmit} />

      {/* Modale inscription — mur avant les emails pour les non-connectés */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">Vos emails sont prêts !</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Créez votre compte gratuit pour accéder à vos 3 emails de relance et les sauvegarder dans votre historique.
              </p>
            </div>
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-all shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>
            <p className="text-xs text-gray-400">
              Gratuit · Sans carte bancaire
            </p>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors -mt-2"
            >
              Retour au formulaire
            </button>
          </div>
        </div>
      )}

      <ResultsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        emails={emails}
        form={form}
        onRegenerateLevel={handleRegenerateLevel}
        relanceId={relanceId}
        plan={userPlan}
        onActivateAutoSend={handleActivateAutoSend}
        onSaved={() => {
          showToast('Relances enregistrées dans votre historique ✓', 'success')
          setTimeout(() => router.push('/dashboard'), 2000)
        }}
      />
      <UpgradeModal
        show={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Limite du plan Gratuit atteinte"
        description="Vous avez déjà 1 facture active. Passez Premium pour gérer plusieurs factures impayées simultanément."
      />
      {toast && (
        <div className="fixed top-5 right-5 z-[80] pointer-events-none">
          <div
            style={{
              animation: `${toastClosing ? 'toast-out' : 'toast-in'} 0.32s ease-out forwards`,
              boxShadow: toast.type === 'success'
                ? '0 0 0 1px rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.15)'
                : '0 0 0 1px rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(239,68,68,0.15)',
            }}
            className="flex items-center gap-3 bg-[#13151f] rounded-xl px-4 py-3 pointer-events-auto max-w-xs"
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
              {toast.type === 'success' ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              )}
            </span>
            <p className="text-[#f0f2ff] text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  )
}
