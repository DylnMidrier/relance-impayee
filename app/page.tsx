'use client'

import { useState } from 'react'
import { FormState, EmailTemplate, genEmails, genEmailLevel } from './lib/emails'
import { createClient } from './lib/supabase'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import ShowcaseSection from './components/ShowcaseSection'
import FormSection from './components/FormSection'
import Footer from './components/Footer'
import ResultsModal from './components/ResultsModal'
import UpgradeModal from './components/UpgradeModal'
import type { Plan } from './dashboard/page'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>({ prenom: '', client: '', emailClient: '', facture: '', montant: '', echeance: '' })
  const [emails, setEmails] = useState<EmailTemplate[]>([])
  const [relanceId, setRelanceId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [toastClosing, setToastClosing] = useState(false)
  const [userPlan, setUserPlan] = useState<Plan>('free')
  const [showUpgrade, setShowUpgrade] = useState(false)

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
    setEmails(genEmails(form.prenom, form.client, form.facture, form.montant, form.echeance))
    setRelanceId(null) // reset pour chaque nouvelle génération
    setShowModal(true)

    // Sauvegarde en base si l'utilisateur est connecté
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch plan + check facture limit for free users
    const { data: profileData } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
    const plan = (profileData?.plan ?? 'free') as Plan
    setUserPlan(plan)

    if (plan === 'free') {
      const { count } = await supabase
        .from('factures')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('statut', 'payé')
      if ((count ?? 0) >= 2) {
        setShowUpgrade(true)
        return
      }
    }

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

    // Créer les 3 relances planifiées
    const LEVEL_OFFSETS: Record<number, number> = { 1: 7, 2: 15, 3: 30 }
    const relancesData = [1, 2, 3].map(niveau => {
      let date_planifiee: string | null = null
      if (form.echeance) {
        const d = new Date(form.echeance)
        d.setDate(d.getDate() + LEVEL_OFFSETS[niveau])
        date_planifiee = d.toISOString().split('T')[0]
      }
      return { facture_id: factureId, niveau, statut: 'planifiée', date_planifiee }
    })
    await supabase.from('relances').insert(relancesData)

    showToast('Relance enregistrée dans votre historique ✓', 'success')
  }

  function handleRegenerateLevel(level: number) {
    const newEmail = genEmailLevel(level as 1 | 2 | 3, form.prenom, form.client, form.facture, form.montant, form.echeance)
    setEmails(prev => prev.map(e => e.level === level ? newEmail : e))
  }

  return (
    <>
      <Nav />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <ShowcaseSection />
      <FormSection form={form} onChange={setForm} onSubmit={handleFormSubmit} />
      <Footer />
      <ResultsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        emails={emails}
        form={form}
        onRegenerateLevel={handleRegenerateLevel}
        relanceId={relanceId}
        plan={userPlan}
      />
      <UpgradeModal
        show={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="Limite de 2 relances actives atteinte"
      />

      {/* Toast save — z-[80] pour passer au-dessus de la modale et du toast IA (z-[70]) */}
      {toast && (
        <div className="fixed bottom-6 left-0 right-0 z-[80] flex justify-center px-4 pointer-events-none">
          <div
            style={{ animation: `${toastClosing ? 'toast-out' : 'toast-in'} 0.32s ease-out forwards` }}
            className={`text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl text-center leading-relaxed max-w-sm pointer-events-auto ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  )
}
