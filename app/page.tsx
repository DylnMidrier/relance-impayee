'use client'

import { useState } from 'react'
import { FormState, EmailTemplate, genEmails, genEmailLevel } from './lib/emails'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import FormSection from './components/FormSection'
import Footer from './components/Footer'
import ResultsModal from './components/ResultsModal'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>({ prenom: '', client: '', emailClient: '', facture: '', montant: '', echeance: '' })
  const [emails, setEmails] = useState<EmailTemplate[]>([])

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    window.dataLayer?.push({ event: 'submit_form' })
    setEmails(genEmails(form.prenom, form.client, form.facture, form.montant, form.echeance))
    setShowModal(true)
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
      <FormSection form={form} onChange={setForm} onSubmit={handleFormSubmit} />
      <Footer />
      <ResultsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        emails={emails}
        form={form}
        onRegenerateLevel={handleRegenerateLevel}
      />
    </>
  )
}