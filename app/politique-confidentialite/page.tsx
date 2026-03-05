import type { Metadata } from 'next'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    content: `Recouvr.io est édité en tant que service indépendant destiné aux freelances et travailleurs indépendants. Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse : contact@recouvr.io.`,
  },
  {
    title: '2. Données collectées',
    content: `Nous collectons uniquement les données nécessaires au fonctionnement du service :

• Données de compte : adresse e-mail, utilisées pour l'authentification via Supabase Auth.
• Données de facturation : nom du client, e-mail du client, numéro de facture, montant, date d'échéance (saisies par vous lors de la création d'une relance).
• Données de suivi : statut des relances (planifiée, envoyée), dates d'envoi, identifiants d'événements Google Calendar (si vous activez la synchronisation).
• Données techniques : logs d'accès minimaux à des fins de sécurité.

Nous ne collectons aucune donnée de paiement (les transactions éventuelles sont gérées par un prestataire tiers).`,
  },
  {
    title: '3. Finalités du traitement',
    content: `Vos données sont utilisées pour :

• Fournir le service de génération et de suivi des emails de relance.
• Authentifier votre compte et sécuriser votre accès.
• Synchroniser vos rappels avec Google Calendar (uniquement si vous activez cette fonctionnalité).
• Améliorer vos emails via notre agent IA (plan Premium uniquement ; le texte de votre email et votre instruction sont transmis à l'API Anthropic Claude).
• Vous contacter en cas de problème technique critique affectant votre compte.`,
  },
  {
    title: '4. Base légale',
    content: `Le traitement de vos données repose sur :

• L'exécution du contrat : les données nécessaires au fonctionnement du service (compte, factures, relances).
• Votre consentement explicite : pour la synchronisation Google Calendar, accordée lors de l'autorisation OAuth.
• Notre intérêt légitime : pour la sécurité et la stabilité du service.`,
  },
  {
    title: '5. Sous-traitants et transferts',
    content: `Nous faisons appel aux prestataires suivants :

• Supabase : hébergement de la base de données et authentification (infrastructure AWS, datacenter Union Européenne).
• Anthropic : traitement IA des emails (plan Premium). Les données transmises sont limitées au contenu de l'email et à votre instruction. Anthropic s'engage contractuellement à ne pas utiliser ces données pour entraîner ses modèles.
• Google : authentification OAuth et synchronisation Google Calendar. Lors de la connexion, Google reçoit une demande d'authentification et nous transmet votre adresse e-mail et photo de profil. Si vous activez la synchronisation Calendar, nous créons et supprimons des événements dans votre agenda via l'API Google Calendar. Ces données sont soumises à la politique de confidentialité de Google : policies.google.com/privacy
• Vercel : hébergement de l'application (infrastructure EU).
• Stripe : gestion des paiements et abonnements (plan Premium). Stripe traite vos données de paiement directement ; nous ne stockons aucune donnée bancaire.

Partage des données utilisateur Google avec des tiers :
Les données que nous recevons de Google (adresse e-mail, photo de profil pour l'authentification ; identifiants d'événements Calendar si vous activez la synchronisation) sont communiquées aux tiers suivants, dans la stricte limite du nécessaire :
• Supabase : stockage sécurisé de votre profil (adresse e-mail, identifiant utilisateur, identifiants d'événements Calendar).
• Vercel : hébergement de l'application (vos données transitent par les serveurs Vercel lors des requêtes HTTP).
Nous ne partageons pas vos données utilisateur Google avec Anthropic, Stripe, ni aucun autre tiers non listé ci-dessus. Vos données Google ne sont jamais revendues ni utilisées à des fins publicitaires.`,
  },
  {
    title: '6. Durée de conservation',
    content: `Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte, l'ensemble de vos données (factures, relances, historique) est supprimé dans un délai de 30 jours.

Les logs techniques sont conservés 90 jours à des fins de sécurité.`,
  },
  {
    title: '7. Vos droits (RGPD)',
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de vos données personnelles.
• Droit de rectification : corriger des données inexactes.
• Droit à l'effacement : demander la suppression de vos données.
• Droit à la portabilité : recevoir vos données dans un format structuré.
• Droit d'opposition : vous opposer à un traitement basé sur notre intérêt légitime.
• Droit de retrait du consentement : révoquer à tout moment l'accès à Google Calendar depuis votre tableau de bord.

Pour exercer ces droits, contactez-nous à : contact@recouvr.io. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).`,
  },
  {
    title: '8. Cookies et mesure d\'audience',
    content: `Recouvr.io utilise les cookies suivants :

• Cookie de session Supabase Auth : strictement nécessaire au maintien de votre connexion. Aucun consentement préalable requis.

• Google Analytics : mesure du trafic et des usages (pages visitées, durée de session, source d'acquisition). Les données sont anonymisées et agrégées. Google peut déposer des cookies de mesure sur votre appareil.

• Microsoft Clarity : enregistrement de sessions et heatmaps, utilisé pour comprendre les comportements de navigation et améliorer l'ergonomie du service. Microsoft peut déposer des cookies sur votre appareil.

Ces outils sont chargés uniquement après votre consentement, recueilli via la bannière cookies affichée à votre première visite. Vous pouvez modifier votre choix à tout moment en bas de page, ou vous y opposer via les paramètres de votre navigateur.`,
  },
  {
    title: '9. Sécurité',
    content: `Vos données sont protégées par :

• Chiffrement en transit (HTTPS / TLS) et au repos (AES-256 via Supabase).
• Accès restreint par Row Level Security (RLS) : chaque utilisateur n'accède qu'à ses propres données.
• Authentification sécurisée via Supabase Auth (tokens JWT, rotation automatique).`,
  },
  {
    title: '10. Modifications',
    content: `Nous pouvons mettre à jour cette politique de confidentialité. En cas de modification substantielle, vous serez informé par e-mail ou via une notification dans l'application. La date de dernière mise à jour est indiquée en bas de cette page.`,
  },
]

export default function PolitiqueConfidentialite() {
  return (
    <>
      <Nav />
      <main className="bg-slate-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-24">

          <div className="mb-14">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Légal</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-slate-400">
              Dernière mise à jour : février 2026
            </p>
          </div>

          <div className="space-y-10">
            {SECTIONS.map(({ title, content }) => (
              <div key={title} className="border-b border-slate-700/60 pb-10">
                <h2 className="text-base font-bold text-white mb-4">{title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-slate-500 mb-3">Des questions sur vos données ?</p>
            <a
              href="mailto:contact@recouvr.io"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors no-underline"
            >
              contact@recouvr.io
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
