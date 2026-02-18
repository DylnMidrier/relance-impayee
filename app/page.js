'use client'

import { useState } from 'react'

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    client: '',
    montant: '',
    echeance: '',
  })

  function handleFormSubmit(e) {
    e.preventDefault()
    setShowModal(true)
  }

  function handleEmailSubmit(e) {
    e.preventDefault()
    // Ici on pourrait envoyer vers une API plus tard
    setSubmitted(true)
  }

  return (
    <>
      {/* ─── NAVIGATION ─── */}
      <nav className="nav">
        <a href="#" className="nav-logo">RelanceImpayée</a>
        <span className="badge">Bientôt disponible</span>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-label">Pour les freelances français</span>
            <h1>
              Fini d'hésiter à<br />
              <em>relancer vos clients</em>
            </h1>
            <p>
              Une facture impayée et vous ne savez pas comment relancer sans froisser la relation ?
              On génère vos emails à votre place — du rappel amical à la mise en demeure.
            </p>
            <a href="#formulaire" className="btn-primary">
              Générer mes emails de relance →
            </a>
            <p className="hero-note">Gratuit · 30 secondes · Aucun compte requis</p>
          </div>

          <div className="hero-visual">
            <div className="email-stack">

              <div className="email-mock email-mock-1">
                <div className="email-mock-topbar">
                  <span className="email-mock-dot dot-green"></span>
                  <span className="email-mock-tag tag-green">Niveau 1 · J+7</span>
                </div>
                <div className="email-mock-from">De : <strong>Marie Fontaine</strong></div>
                <div className="email-mock-subject">Objet : Rappel – Facture n°2024-089 (2 400 €)</div>
                <div className="email-mock-body">
                  Bonjour Martin,<br /><br />
                  J'espère que vous allez bien. Je me permets de revenir sur la facture
                  n°2024-089 de <strong>2 400 €</strong>, échue le 1er nov. — peut-être
                  est-elle passée entre les mailles ? N'hésitez pas à me le signaler.
                </div>
              </div>

              <div className="email-mock email-mock-2">
                <div className="email-mock-topbar">
                  <span className="email-mock-dot dot-orange"></span>
                  <span className="email-mock-tag tag-orange">Niveau 2 · J+15</span>
                </div>
                <div className="email-mock-from">De : <strong>Marie Fontaine</strong></div>
                <div className="email-mock-subject">Objet : Relance – Facture n°2024-089 impayée</div>
                <div className="email-mock-body">
                  Bonjour Martin,<br /><br />
                  Sauf erreur de ma part, la facture n°2024-089 de <strong>2 400 €</strong> reste
                  impayée à ce jour. Je vous remercie d'y donner suite dans les meilleurs délais.
                </div>
              </div>

              <div className="email-mock email-mock-3">
                <div className="email-mock-topbar">
                  <span className="email-mock-dot dot-red"></span>
                  <span className="email-mock-tag tag-red">Niveau 3 · J+30</span>
                </div>
                <div className="email-mock-from">De : <strong>Marie Fontaine</strong></div>
                <div className="email-mock-subject">Objet : Mise en demeure – Facture n°2024-089</div>
                <div className="email-mock-body">
                  Bonjour Martin,<br /><br />
                  Par la présente, je vous mets en demeure de régler sous <strong>8 jours</strong> la
                  somme de <strong>2 400 €</strong>, augmentée des pénalités de retard légales (3× taux BCE).
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── PROBLÈME ─── */}
      <section className="section section-alt">
        <div className="container">
          <p className="section-label">Le problème</p>
          <h2 className="section-title">Relancer un client, c'est awkward.</h2>
          <p className="section-sub">
            On le sait tous. On reporte, on hésite, on ne sait pas quoi dire. Et pendant ce temps, l'argent dort.
          </p>

          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-icon">😬</div>
              <h3>On ne sait pas comment formuler</h3>
              <p>Trop agressif ? Trop mou ? Trouver le bon ton prend un temps fou.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">⏳</div>
              <h3>On reporte encore et encore</h3>
              <p>Chaque jour sans relancer, c'est un jour de plus où l'argent n'arrive pas.</p>
            </div>
            <div className="problem-card">
              <div className="problem-icon">😰</div>
              <h3>On a peur de froisser</h3>
              <p>Et si le client se vexe ? Et si on perd la relation ? Ces doutes paralysent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section className="section">
        <div className="container">
          <p className="section-label">La solution</p>
          <h2 className="section-title">3 emails générés en 30 secondes.</h2>
          <p className="section-sub">
            Vous renseignez la facture, on s'occupe du reste. Trois emails, trois tons, prêts à envoyer.
          </p>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Renseignez la facture</h3>
              <p>Nom du client, montant dû, date d'échéance. C'est tout ce qu'on demande.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>On génère 3 emails</h3>
              <p>Un rappel amical, une relance ferme, une mise en demeure. Chaque email adapté à la situation.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Copiez-collez et envoyez</h3>
              <p>Aucun compte. Aucune inscription. Vous copiez l'email, vous l'envoyez depuis votre boîte.</p>
            </div>
          </div>

          <div className="emails-preview">
            <div className="email-card">
              <div className="email-dot dot-green"></div>
              <div className="email-meta">
                <strong>Rappel amical — J+7</strong>
                <span>Ton neutre et bienveillant, laisse une porte ouverte</span>
              </div>
              <span className="email-tag tag-green">Niveau 1</span>
            </div>
            <div className="email-card">
              <div className="email-dot dot-orange"></div>
              <div className="email-meta">
                <strong>Relance ferme — J+15</strong>
                <span>Ton direct, sans agressivité, demande claire</span>
              </div>
              <span className="email-tag tag-orange">Niveau 2</span>
            </div>
            <div className="email-card">
              <div className="email-dot dot-red"></div>
              <div className="email-meta">
                <strong>Mise en demeure — J+30</strong>
                <span>Cadre légal, pénalités de retard, délai de 8 jours</span>
              </div>
              <span className="email-tag tag-red">Niveau 3</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FORMULAIRE ─── */}
      <section className="section section-alt" id="formulaire">
        <div className="form-wrapper">
          <h2 className="form-title">Essayez maintenant</h2>
          <p className="form-sub">Renseignez les infos de votre facture impayée.</p>

          <div className="form-card">
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="client">Nom du client</label>
                <input
                  id="client"
                  type="text"
                  placeholder="Ex : Agence Dupont"
                  required
                  value={form.client}
                  onChange={e => setForm({ ...form, client: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="montant">Montant de la facture (€)</label>
                <input
                  id="montant"
                  type="number"
                  placeholder="Ex : 1500"
                  min="1"
                  required
                  value={form.montant}
                  onChange={e => setForm({ ...form, montant: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="echeance">Date d'échéance</label>
                <input
                  id="echeance"
                  type="date"
                  required
                  value={form.echeance}
                  onChange={e => setForm({ ...form, echeance: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-submit">
                Générer mes 3 emails de relance →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <p>
          RelanceImpayée · Fait par un freelance, pour les freelances ·{' '}
          <a href="mailto:contact@relanceimpayee.fr" style={{ color: 'inherit' }}>
            contact@relanceimpayee.fr
          </a>
        </p>
      </footer>

      {/* ─── MODAL CAPTURE EMAIL ─── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-emoji">🚀</div>
            <h2>L'outil arrive bientôt !</h2>
            <p>
              Laissez votre email et soyez le premier à recevoir les emails de relance
              pour <strong>{form.client}</strong>{form.montant ? ` (${Number(form.montant).toLocaleString('fr-FR')} €)` : ''}.
            </p>

            {!submitted ? (
              <form onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  className="modal-email-input"
                  placeholder="votre@email.fr"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <button type="submit" className="btn-modal">
                  Me prévenir au lancement
                </button>
              </form>
            ) : (
              <p className="modal-success">
                ✓ Noté ! On vous prévient dès l'ouverture.
              </p>
            )}

            <button className="modal-close" onClick={() => setShowModal(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}
