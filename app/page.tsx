'use client'

import { useState } from 'react'
import { FormState, EmailTemplate, genEmails } from './lib/emails'
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

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    window.dataLayer?.push({ event: 'submit_form' })
    setShowModal(true)
  }

  const emails: EmailTemplate[] = form.client && form.montant && form.echeance
    ? genEmails(form.prenom, form.client, form.facture, form.montant, form.echeance)
    : []

  return (
    <>
      <Nav />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FormSection form={form} onChange={setForm} onSubmit={handleFormSubmit} />
      <Footer />
      <ResultsModal show={showModal} onClose={() => setShowModal(false)} emails={emails} form={form} />
    </>
  )
}
