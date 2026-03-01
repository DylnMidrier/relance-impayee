// Placeholders disponibles : {client}, {montant}, {echeance}, {ref}, {deadline}, {prenom}
// {ref} = " n°XXXX" ou "" si pas de numéro de facture

export interface RawTemplate {
  subject: string
  body: string
}

// ─── Niveau 1 — Rappel amical (J+7) ─────────────────────────────────────────

const L1: RawTemplate[] = [
  {
    subject: 'Rappel – Facture{ref}',
    body: `Bonjour {client},

J'espère que vous allez bien. Je me permets de revenir sur ma facture{ref} de {montant}, dont l'échéance était fixée au {echeance}.

Peut-être est-elle passée entre les mailles ? Si vous avez déjà procédé au règlement, merci de ne pas tenir compte de ce message.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance amiable – Facture{ref}',
    body: `Bonjour {client},

Je me permets de vous contacter au sujet de ma facture{ref} d'un montant de {montant}, arrivée à échéance le {echeance}.

Il s'agit peut-être d'un simple oubli ou d'un problème de réception. Je reste disponible si vous avez des questions.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Petit rappel – Facture{ref}',
    body: `Bonjour {client},

Je souhaitais vous signaler que ma facture{ref} de {montant} est arrivée à échéance le {echeance} et n'a pas encore été réglée.

Si le virement est déjà parti, merci d'ignorer ce message. Dans le cas contraire, je vous remercie d'en tenir compte.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel de paiement – Facture{ref}',
    body: `Bonjour {client},

J'espère que vous passez une bonne semaine. Je reviens concernant ma facture{ref} de {montant}, due le {echeance}.

Pourriez-vous me confirmer la date prévue du virement si le règlement n'a pas encore été effectué ?

Merci d'avance,
{prenom}`,
  },
  {
    subject: "Facture{ref} – Rappel d'échéance",
    body: `Bonjour {client},

Je me permets de vous rappeler que ma facture{ref} de {montant} est échue depuis le {echeance}.

Je ne doute pas qu'il s'agit d'un simple oubli. Merci de bien vouloir y donner suite à votre convenance.

Bonne journée,
{prenom}`,
  },
  {
    subject: 'Rappel – Règlement en attente',
    body: `Bonjour {client},

J'espère que tout va bien de votre côté. Je vous contacte car ma facture{ref} de {montant}, échue le {echeance}, ne semble pas avoir été réglée.

N'hésitez pas à me faire signe si vous avez la moindre question.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Suivi – Facture{ref}',
    body: `Bonjour {client},

Je reviens vers vous pour un rapide suivi sur ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Pourriez-vous m'indiquer si le règlement est en cours de traitement ?

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Petit point',
    body: `Bonjour {client},

Petit mot pour revenir sur ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Est-ce que tout est en ordre de votre côté ? N'hésitez pas à me dire si vous avez besoin de quoi que ce soit.

Bonne journée,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} ({montant})',
    body: `Bonjour {client},

Je me permets de vous rappeler que ma facture{ref} de {montant} est arrivée à son terme le {echeance}.

Si vous avez besoin d'un duplicata ou d'un document complémentaire, je suis à votre disposition.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Vérification règlement',
    body: `Bonjour {client},

J'espère que vous allez bien. Je souhaite m'assurer que ma facture{ref} de {montant}, arrivée à échéance le {echeance}, a bien été prise en compte.

Merci de me confirmer le statut du règlement.

Cordiales salutations,
{prenom}`,
  },
  {
    subject: 'Petite relance – Facture{ref}',
    body: `Bonjour {client},

Je reviens vers vous rapidement au sujet de ma facture{ref} de {montant}. L'échéance est passée le {echeance} et je n'ai pas encore reçu le règlement.

Est-ce que tout va bien de votre côté ?

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Rappel amiable – {montant} à régler',
    body: `Bonjour {client},

Je me permets de vous rappeler amicalement que ma facture{ref} de {montant} est échue depuis le {echeance}.

Il y a peut-être un délai administratif de votre côté — ce n'est pas un problème, merci simplement de m'en tenir informé(e).

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Premier rappel',
    body: `Bonjour {client},

Je vous adresse ce premier rappel au sujet de ma facture{ref} de {montant}, arrivée à échéance le {echeance}.

Je ne doute pas qu'il s'agit d'un simple délai de traitement. Merci de me tenir informé(e).

Cordiales salutations,
{prenom}`,
  },
  {
    subject: 'Un mot au sujet de la facture{ref}',
    body: `Bonjour {client},

Je me permets de vous écrire au sujet de ma facture{ref} de {montant}, dont l'échéance est passée le {echeance}.

Y a-t-il un souci particulier ou un document manquant ? Je suis joignable pour clarifier le moindre point.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} non réglée',
    body: `Bonjour {client},

J'espère que vous allez bien. Je vous écris au sujet de ma facture{ref} de {montant} arrivée à échéance le {echeance}.

Si vous avez besoin du moindre document pour faciliter le paiement, je suis disponible.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Paiement en cours ?',
    body: `Bonjour {client},

Je vous écris pour m'assurer que ma facture{ref} de {montant}, échue le {echeance}, est bien en cours de traitement de votre côté.

N'hésitez pas à me faire un retour.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel de facturation – Facture{ref}',
    body: `Bonjour {client},

Je vous contacte car ma facture{ref} de {montant}, dont l'échéance était le {echeance}, n'a pas encore fait l'objet d'un règlement selon mes informations.

Merci de bien vouloir vérifier de votre côté.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Rappel de règlement',
    body: `Bonjour {client},

Je prends la liberté de vous rappeler que ma facture{ref} de {montant} est arrivée à son terme le {echeance}.

Si vous avez déjà procédé au virement, merci d'en faire abstraction. Autrement, je vous remercie d'y donner suite.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} ({montant})',
    body: `Bonjour {client},

J'espère que vous passez une bonne semaine. Je reviens vers vous pour vous rappeler que ma facture{ref} de {montant} est arrivée à échéance le {echeance}.

Merci de bien vouloir traiter ce règlement prochainement.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Rappel amiable',
    body: `Bonjour {client},

J'espère que tout se passe bien pour vous. Je reviens sur ma facture{ref} de {montant}, dont le règlement était attendu le {echeance}.

Peut-être a-t-il été perdu dans les échanges ? Je reste disponible.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} arrivée à terme',
    body: `Bonjour {client},

Je me permets de vous rappeler que ma facture{ref} de {montant} est arrivée à terme le {echeance} sans que le règlement n'ait été reçu.

En cas de doute sur les modalités de paiement, je reste disponible.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Paiement attendu',
    body: `Bonjour {client},

Je me permets de vous solliciter concernant ma facture{ref} de {montant}, arrivée à échéance le {echeance}.

Si vous rencontrez des difficultés, n'hésitez pas à me le faire savoir.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Règlement attendu ({montant})',
    body: `Bonjour {client},

Je vous contacte pour vous rappeler que ma facture{ref} de {montant} est arrivée à terme le {echeance} sans qu'un règlement n'ait été effectué.

Je reste disponible si vous avez des questions.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Point règlement – Facture{ref}',
    body: `Bonjour {client},

Je reviens vers vous pour un point sur le règlement de ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Je n'ai pas encore reçu le virement. Merci de me confirmer le statut.

Merci d'avance,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Rappel ({montant})',
    body: `Bonjour {client},

Je me permets de vous contacter pour vous rappeler que ma facture{ref} de {montant} est arrivée à son échéance le {echeance}.

Je reste disponible pour toute question.

Bonne journée,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} à régler',
    body: `Bonjour {client},

Je vous adresse ce message pour vous informer que ma facture{ref} de {montant} est arrivée à échéance le {echeance} et n'a pas encore été réglée.

Je vous remercie de bien vouloir y donner suite.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance',
    body: `Bonjour {client},

Je vous contacte au sujet de ma facture{ref} de {montant} arrivée à terme le {echeance}.

Peut-être s'agit-il d'un simple délai. Je reste joignable si vous souhaitez des précisions.

Bonne journée,
{prenom}`,
  },
  {
    subject: 'Petit suivi – Facture{ref}',
    body: `Bonjour {client},

Je prends contact pour vous rappeler que ma facture{ref} de {montant} est arrivée à échéance le {echeance}.

Y a-t-il quelque chose que je peux faire pour faciliter le traitement ? N'hésitez pas.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – {montant} en attente',
    body: `Bonjour {client},

Je vous adresse ce rappel au sujet de ma facture{ref} de {montant}, dont l'échéance du {echeance} est maintenant dépassée.

En cas de difficultés, je suis disponible pour en discuter.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance amicale',
    body: `Bonjour {client},

J'espère que vous allez bien. Je vous contacte amicalement au sujet de ma facture{ref} de {montant}, échue le {echeance}.

Je suppose qu'il s'agit d'un oubli ou d'un délai de traitement. Merci d'en prendre note.

Bonne journée,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} impayée',
    body: `Bonjour {client},

Je me permets de revenir sur ma facture{ref} de {montant}, dont le règlement était attendu au {echeance}.

Si un retard s'est produit de votre côté, ce n'est pas un problème — merci simplement de m'en tenir informé(e).

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Paiement non reçu',
    body: `Bonjour {client},

Je reviens vers vous concernant ma facture{ref} de {montant} dont l'échéance était le {echeance}.

Je n'ai pas encore reçu le règlement. Merci de bien vouloir vérifier le statut de ce paiement.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} ({montant}) échue',
    body: `Bonjour {client},

Je me permets de vous informer que ma facture{ref} de {montant} est échue depuis le {echeance} et qu'aucun paiement n'a encore été enregistré.

Merci de me faire signe si vous avez la moindre question.

Cordiales salutations,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Un mot',
    body: `Bonjour {client},

Juste un petit mot pour vous rappeler que ma facture{ref} de {montant} est arrivée à échéance le {echeance}.

Je n'ai rien reçu de votre côté à ce jour. Est-ce que tout va bien ?

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Règlement de {montant}',
    body: `Bonjour {client},

J'espère que vous avez passé une bonne semaine. Je reviens pour un rappel concernant ma facture{ref} de {montant} due le {echeance}.

Merci de bien vouloir donner suite à ce règlement dès que possible.

Bien cordialement,
{prenom}`,
  },
  {
    subject: "Facture{ref} – Rappel d'échéance dépassée",
    body: `Bonjour {client},

Je vous adresse ce rappel au sujet de ma facture{ref} de {montant}, dont l'échéance du {echeance} est maintenant dépassée.

Je vous remercie d'y donner suite à votre convenance.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Rappel amical – Facture{ref}',
    body: `Bonjour {client},

Je me permets de vous rappeler amicalement que ma facture{ref} de {montant} était due le {echeance}.

Si vous avez besoin d'une copie ou d'un autre document, n'hésitez pas.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance ({montant})',
    body: `Bonjour {client},

J'espère que vous allez bien. Je vous contacte car ma facture{ref} de {montant} est arrivée à échéance le {echeance} sans avoir été réglée.

Je reste disponible si vous avez des questions ou besoins particuliers.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} non réglée ({montant})',
    body: `Bonjour {client},

Je vous contacte pour vous rappeler le règlement de ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Merci de bien vouloir vérifier ce point avec votre comptabilité.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Rappel de paiement',
    body: `Bonjour {client},

Je prends contact avec vous concernant ma facture{ref} de {montant}, dont l'échéance est passée le {echeance}.

Je vous remercie d'avance pour votre retour.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} en attente',
    body: `Bonjour {client},

Je vous adresse ce message pour vous rappeler que ma facture{ref} de {montant} n'a pas encore été réglée, l'échéance étant passée le {echeance}.

Merci de bien vouloir traiter ce point.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Paiement en attente – Facture{ref}',
    body: `Bonjour {client},

Je me permets de vous rappeler que ma facture{ref} de {montant} est arrivée à échéance le {echeance}.

Si le traitement est en cours de votre côté, parfait. Sinon, je vous saurais gré d'y donner suite rapidement.

Bonne continuation,
{prenom}`,
  },
  {
    subject: 'Rappel – Paiement de {montant} attendu',
    body: `Bonjour {client},

J'espère que vous allez bien. Juste un rappel : ma facture{ref} de {montant} est arrivée à échéance le {echeance} et reste à ce jour impayée.

Merci de votre attention.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance douce',
    body: `Bonjour {client},

Je vous contacte doucement au sujet de ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Je suppose qu'il s'agit d'un simple délai de votre côté. Merci de me tenir au courant.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} en souffrance',
    body: `Bonjour {client},

Je reviens vers vous concernant ma facture{ref} de {montant}, arrivée à échéance le {echeance} sans que le règlement n'ait été reçu.

Je vous remercie de bien vouloir régulariser ce point à votre prochaine opportunité.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Avez-vous reçu ma facture ?',
    body: `Bonjour {client},

Je voulais m'assurer que ma facture{ref} de {montant}, dont l'échéance était le {echeance}, vous est bien parvenue et n'a pas été perdue.

Si vous avez besoin que je la renvoie, dites-le moi.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Rappel – {montant} toujours en attente',
    body: `Bonjour {client},

Je me permets de vous rappeler que le règlement de ma facture{ref} de {montant}, due le {echeance}, n'a pas encore été reçu.

N'hésitez pas à me contacter si nécessaire.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Rappel de règlement ({montant})',
    body: `Bonjour {client},

Je vous adresse ce rappel au sujet de ma facture{ref} de {montant}, arrivée à échéance le {echeance}.

Si le règlement a été effectué, veuillez ignorer ce message. Dans le cas contraire, je vous remercie d'y donner suite.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance amiable',
    body: `Bonjour {client},

Je prends contact avec vous au sujet de ma facture{ref} de {montant}, arrivée à terme le {echeance}.

Je vous serais reconnaissant(e) de bien vouloir régler ce montant dans les prochains jours.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Rappel – Facture{ref} ({montant}) à traiter',
    body: `Bonjour {client},

Je vous contacte une dernière fois amiablement au sujet de ma facture{ref} de {montant}, échue le {echeance}.

Je reste ouvert(e) à tout échange si vous avez des questions.

Cordialement,
{prenom}`,
  },
]

// ─── Niveau 2 — Relance ferme (J+15) ────────────────────────────────────────

const L2: RawTemplate[] = [
  {
    subject: 'Relance – Facture{ref} toujours impayée',
    body: `Bonjour {client},

Sauf erreur de ma part, ma facture{ref} de {montant}, échue le {echeance}, reste impayée à ce jour malgré mon précédent message.

Je vous remercie de bien vouloir y donner suite dans les meilleurs délais. Sans retour de votre part avant le {deadline}, je me verrai dans l'obligation de prendre d'autres dispositions.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Deuxième relance – Facture{ref} ({montant})',
    body: `Bonjour {client},

Je vous ai déjà contacté(e) concernant ma facture{ref} de {montant}, échue le {echeance}. Je n'ai à ce jour reçu ni règlement ni réponse.

Merci de bien vouloir régulariser cette situation avant le {deadline}, faute de quoi je serai contraint(e) d'envisager d'autres recours.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance ferme – Facture{ref}',
    body: `Bonjour {client},

Malgré mon précédent rappel, je n'ai toujours pas reçu le règlement de ma facture{ref} de {montant}, échue le {echeance}.

Je vous demande de bien vouloir régulariser cette situation avant le {deadline}. Passé ce délai, je prendrai les mesures nécessaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Urgence règlement',
    body: `Bonjour {client},

Malgré mon premier message, je n'ai toujours pas reçu le règlement de ma facture{ref} de {montant}, échue le {echeance}.

Je vous demande de régulariser cette situation avant le {deadline}. Dans le cas contraire, je serai contraint(e) d'envisager d'autres voies.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} impayée ({montant})',
    body: `Bonjour {client},

Sans nouvelle de votre part suite à mon précédent message, je reviens au sujet de ma facture{ref} de {montant}, échue le {echeance}.

Je vous remercie d'effectuer le règlement avant le {deadline}, ou de me contacter afin de trouver une solution.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième rappel',
    body: `Bonjour {client},

Je me vois obligé(e) de vous relancer une nouvelle fois concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Je vous invite vivement à régulariser cette situation avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Règlement toujours attendu',
    body: `Bonjour {client},

Je constate qu'à ce jour, ma facture{ref} de {montant}, échue le {echeance}, demeure impayée. Mon précédent message est resté sans suite.

Je vous remercie de traiter ce règlement avant le {deadline}, faute de quoi je me réserve le droit d'engager des démarches de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième relance ({montant})',
    body: `Bonjour {client},

Je reviens vers vous pour la deuxième fois concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

En l'absence de règlement ou de réponse avant le {deadline}, je serai contraint(e) de prendre les mesures qui s'imposent.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} sans réponse',
    body: `Bonjour {client},

Mon précédent message concernant ma facture{ref} de {montant}, arrivée à échéance le {echeance}, est resté sans réponse.

Je vous invite à régulariser cette situation avant le {deadline}.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Deuxième rappel – Facture{ref} impayée',
    body: `Bonjour {client},

Je vous adresse ce second rappel concernant ma facture{ref} de {montant}, dont l'échéance du {echeance} est maintenant largement dépassée.

Merci de procéder au règlement avant le {deadline}, faute de quoi je me verrai dans l'obligation de prendre les mesures appropriées.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} en retard de paiement',
    body: `Bonjour {client},

Je vous contacte une nouvelle fois concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Je n'ai toujours pas reçu le règlement. Je vous remercie d'y donner suite avant le {deadline}.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance (2/3)',
    body: `Bonjour {client},

Je vous contacte pour cette deuxième relance concernant ma facture{ref} de {montant}, arrivée à échéance le {echeance}.

Je vous demande de bien vouloir procéder au règlement avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} toujours en attente',
    body: `Bonjour {client},

J'avais déjà pris contact avec vous concernant ma facture{ref} de {montant}, arrivée à échéance le {echeance}. À ce jour, aucun règlement n'a été effectué.

Je vous remercie de traiter ce point en priorité avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Règlement requis avant le {deadline}',
    body: `Bonjour {client},

En l'absence de réponse à ma précédente relance, je reviens vers vous concernant ma facture{ref} de {montant}, échue le {echeance}.

Je vous demande de bien vouloir procéder au règlement avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance ferme – {montant} impayé',
    body: `Bonjour {client},

Je me vois contraint(e) de vous relancer concernant ma facture{ref} de {montant}, échue le {echeance}.

Ce retard commence à me pénaliser. Je vous demande de régulariser avant le {deadline}, faute de quoi j'engagerai les démarches de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Toujours en attente ({montant})',
    body: `Bonjour {client},

Malgré mes relances, ma facture{ref} de {montant}, échue le {echeance}, n'a toujours pas été réglée.

Je vous demande de régulariser cette situation avant le {deadline}, faute de quoi je serai contraint(e) d'engager une procédure de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} ({montant}) sans suite',
    body: `Bonjour {client},

Je prends acte de l'absence de règlement et de réponse à mes précédentes sollicitations concernant ma facture{ref} de {montant}, échue le {echeance}.

Je vous accorde un délai supplémentaire jusqu'au {deadline} pour effectuer ce règlement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Deuxième relance – Facture{ref}',
    body: `Bonjour {client},

Je reviens vers vous pour la deuxième fois au sujet de ma facture{ref} de {montant}, arrivée à échéance le {echeance} et toujours impayée.

Je vous serais reconnaissant(e) de bien vouloir procéder au règlement avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance urgente – Facture{ref}',
    body: `Bonjour {client},

Malgré ma précédente relance, je n'ai toujours pas reçu le règlement de ma facture{ref} de {montant}, échue le {echeance}.

Je vous demande de bien vouloir y remédier avant le {deadline}. Passé ce délai, je me verrai dans l'obligation de prendre des mesures supplémentaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième relance urgente',
    body: `Bonjour {client},

Je vous ai déjà relancé(e) concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}. Aucun règlement n'a été reçu à ce jour.

Je vous demande de régulariser avant le {deadline}, dans le cas contraire je serai amené(e) à prendre d'autres dispositions.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} en souffrance ({montant})',
    body: `Bonjour {client},

Je vous contacte pour vous signaler que ma facture{ref} de {montant}, due le {echeance}, est toujours en attente de règlement malgré mon précédent message.

Je vous invite à régulariser avant le {deadline}.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance avant recours',
    body: `Bonjour {client},

Cette relance fait suite à mon message précédent au sujet de ma facture{ref} de {montant}, échue le {echeance}.

En l'absence de règlement avant le {deadline}, je me verrai contraint(e) d'engager une procédure de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} ({montant}) en retard',
    body: `Bonjour {client},

Je vous contacte à nouveau concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}, et qui reste impayée malgré mes rappels.

Je vous demande de traiter ce règlement avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième rappel de paiement',
    body: `Bonjour {client},

Je vous adresse ce deuxième rappel concernant ma facture{ref} de {montant}, arrivée à échéance le {echeance}.

En l'absence de règlement avant le {deadline}, je me verrai contraint(e) d'escalader cette situation.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} sans règlement',
    body: `Bonjour {client},

Je vous contacte de nouveau concernant ma facture{ref} de {montant} dont l'échéance du {echeance} est dépassée.

Sans règlement ou contact de votre part avant le {deadline}, je me verrai contraint(e) d'envisager une procédure de recouvrement.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Deuxième relance – {montant} en attente',
    body: `Bonjour {client},

Je me permets de revenir vers vous une nouvelle fois concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Mon précédent rappel est resté sans réponse. Je vous demande de régulariser avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance ({montant})',
    body: `Bonjour {client},

Je me permets de vous relancer une deuxième fois au sujet de ma facture{ref} de {montant}, échue le {echeance}.

Ce retard me contraint à vous demander de régulariser cette situation avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} toujours impayée ({montant})',
    body: `Bonjour {client},

Je prends note qu'aucun règlement n'a été effectué concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Je vous demande de bien vouloir y remédier avant le {deadline} pour éviter que cette situation n'évolue défavorablement.

Cordialement,
{prenom}`,
  },
  {
    subject: "Facture{ref} – Règlement attendu d'urgence",
    body: `Bonjour {client},

Je vous adresse cette relance au sujet de ma facture{ref} de {montant}, dont l'échéance du {echeance} est dépassée.

Sans nouvelle de votre part avant le {deadline}, je serai contraint(e) d'engager les procédures de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Deuxième relance – Facture{ref} ({montant})',
    body: `Bonjour {client},

Je vous relance une deuxième fois pour ma facture{ref} de {montant}, arrivée à échéance le {echeance}.

Merci de me confirmer d'ici le {deadline} la date à laquelle ce règlement sera effectué, faute de quoi je prendrai les mesures nécessaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance (impayée)',
    body: `Bonjour {client},

Je me vois contraint(e) de revenir vers vous pour la deuxième fois au sujet de ma facture{ref} de {montant}, due le {echeance}.

Je vous demande de régulariser cette situation avant le {deadline}.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} non réglée ({montant})',
    body: `Bonjour {client},

Malgré mon précédent message, ma facture{ref} de {montant}, échue le {echeance}, reste impayée à ce jour.

Je vous remercie de bien vouloir traiter ce règlement avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième rappel urgent',
    body: `Bonjour {client},

Je vous contacte une deuxième fois au sujet de ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

En l'absence de règlement avant le {deadline}, j'envisagerai d'engager un recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} ({montant}) en souffrance',
    body: `Bonjour {client},

Je reviens vers vous une nouvelle fois concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Ce retard de paiement ne peut pas durer. Je vous invite à régulariser avant le {deadline}.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance avant mise en demeure',
    body: `Bonjour {client},

En l'absence de réponse à mes précédents messages, je reviens vers vous concernant ma facture{ref} de {montant}, échue le {echeance}.

Sans règlement avant le {deadline}, je serai contraint(e) de vous adresser une mise en demeure formelle.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Deuxième relance – Règlement de {montant}',
    body: `Bonjour {client},

Je vous contacte pour vous rappeler que ma facture{ref} de {montant}, due le {echeance}, est toujours en attente de règlement.

Je vous accorde jusqu'au {deadline} pour régulariser cette situation.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} ({montant}) sans réponse',
    body: `Bonjour {client},

Je n'ai reçu aucune suite à mon précédent message concernant ma facture{ref} de {montant}, échue le {echeance}.

Sans règlement ou retour de votre part avant le {deadline}, je me verrai contraint(e) d'engager les démarches nécessaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième relance (dernier rappel amiable)',
    body: `Bonjour {client},

Je vous adresse ce qui sera mon dernier rappel amiable concernant ma facture{ref} de {montant}, échue le {echeance}.

Je vous invite à régler cette somme avant le {deadline} pour éviter d'autres suites.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} toujours due ({montant})',
    body: `Bonjour {client},

Je constate que ma facture{ref} de {montant}, dont l'échéance était le {echeance}, est toujours impayée malgré ma précédente relance.

Je vous remercie de régulariser avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième contact ({montant})',
    body: `Bonjour {client},

Suite à mon précédent message resté sans réponse, je reviens vers vous au sujet de ma facture{ref} de {montant}, échue le {echeance}.

Je vous demande de bien vouloir procéder au règlement avant le {deadline}, faute de quoi je devrai envisager un recours.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} impayée (2e rappel)',
    body: `Bonjour {client},

Pour la deuxième fois, je vous contacte concernant le règlement de ma facture{ref} de {montant}, arrivée à échéance le {echeance}.

Merci de régulariser avant le {deadline}.

Bien à vous,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance avec échéance',
    body: `Bonjour {client},

Je reviens vers vous pour la deuxième fois au sujet de ma facture{ref} de {montant}, due le {echeance}.

Je vous fixe comme échéance le {deadline} pour effectuer le règlement ou me contacter.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Deuxième relance – Facture{ref} non réglée',
    body: `Bonjour {client},

Je vous adresse ce deuxième rappel concernant ma facture{ref} de {montant}, dont l'échéance du {echeance} est largement dépassée.

Je vous invite à régulariser avant le {deadline}. Dans le cas contraire, je prendrai les dispositions qui s'imposent.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} ({montant}) urgente',
    body: `Bonjour {client},

Ma facture{ref} de {montant}, échue le {echeance}, est toujours impayée malgré mon précédent message.

Je vous demande de bien vouloir y donner suite avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Relance ferme avant recours',
    body: `Bonjour {client},

Je me vois contraint(e) de vous relancer fermement concernant ma facture{ref} de {montant}, due le {echeance}.

Sans règlement avant le {deadline}, j'envisagerai d'engager une procédure de recouvrement.

Bien cordialement,
{prenom}`,
  },
  {
    subject: 'Deuxième relance – Facture{ref} ({montant}) impayée',
    body: `Bonjour {client},

Je vous contacte une deuxième fois concernant ma facture{ref} de {montant}, dont l'échéance était le {echeance}.

Je vous demande de régulariser ce règlement avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance – Facture{ref} ({montant}) non honorée',
    body: `Bonjour {client},

Ma facture{ref} de {montant}, arrivée à échéance le {echeance}, n'a toujours pas été honorée malgré mes rappels.

Merci de procéder au règlement avant le {deadline}.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Facture{ref} – Deuxième demande de règlement',
    body: `Bonjour {client},

Pour la deuxième fois, je vous sollicite au sujet de ma facture{ref} de {montant}, due le {echeance}.

Je vous demande de régulariser cette situation avant le {deadline}, faute de quoi je serai amené(e) à envisager d'autres recours.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Relance ferme – Facture{ref} ({montant}) en retard',
    body: `Bonjour {client},

Je vous relance une nouvelle fois concernant ma facture{ref} de {montant}, échue le {echeance}.

Le retard de paiement se prolongeant, je vous demande de régulariser avant le {deadline} pour éviter d'autres suites.

Cordialement,
{prenom}`,
  },
]

// ─── Niveau 3 — Mise en demeure (J+30) ───────────────────────────────────────

const L3: RawTemplate[] = [
  {
    subject: 'Mise en demeure – Règlement facture{ref}',
    body: `Bonjour {client},

Par la présente, je vous mets en demeure de procéder au règlement de la somme de {montant}, augmentée des pénalités de retard légales (3 fois le taux d'intérêt légal en vigueur), dans un délai de 8 jours à compter de la réception de ce message.

À défaut de règlement dans ce délai, je me verrai contraint(e) d'engager les démarches de recouvrement appropriées, pouvant inclure une procédure judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} impayée ({montant})',
    body: `Bonjour {client},

Malgré mes relances successives, ma facture{ref} de {montant}, échue le {echeance}, demeure impayée.

Par la présente, je vous mets formellement en demeure de régler cette somme dans un délai de 8 jours. À défaut, j'engagerai une procédure judiciaire de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant})',
    body: `Bonjour {client},

En l'absence de règlement suite à mes précédentes relances concernant ma facture{ref} de {montant}, échue le {echeance}, je vous adresse la présente mise en demeure.

Vous disposez d'un délai de 8 jours pour régler cette somme, majorée des pénalités de retard légales. Passé ce délai, j'engagerai les procédures de recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} – {montant}',
    body: `Bonjour {client},

Par la présente mise en demeure, je vous somme de régler sous 8 jours la somme de {montant} correspondant à ma facture{ref}, dont l'échéance était le {echeance}.

Cette somme sera majorée des pénalités de retard légales calculées conformément à l'article L. 441-10 du Code de commerce.

À défaut de paiement dans ce délai, je me réserve le droit d'engager toute procédure judiciaire utile.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Règlement sous 8 jours',
    body: `Bonjour {client},

Malgré plusieurs relances restées sans effet, ma facture{ref} de {montant}, due le {echeance}, demeure impayée.

Par la présente, je vous mets en demeure de procéder au règlement intégral de cette somme dans un délai de 8 jours, sous peine d'engager une procédure judiciaire de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure formelle – Facture{ref}',
    body: `Bonjour {client},

Ayant épuisé les voies amiables de règlement, je vous adresse la présente mise en demeure concernant ma facture{ref} de {montant}, échue le {echeance}.

Vous avez 8 jours pour régler cette somme augmentée des pénalités légales. Sans règlement dans ce délai, j'engagerai une procédure de recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – {montant} à régler sous 8 jours',
    body: `Bonjour {client},

Par la présente, je vous mets en demeure de régler sous 8 jours la somme de {montant} (facture{ref}, échue le {echeance}), augmentée de l'indemnité forfaitaire de recouvrement de 40 € et des pénalités de retard légales.

À défaut, j'engagerai sans préavis les procédures de recouvrement appropriées.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Paiement requis',
    body: `Bonjour {client},

Suite à mes relances successives demeurées sans effet, je vous adresse cette mise en demeure de régler la somme de {montant} (facture{ref}) dans un délai de 8 jours.

Cette créance est exigible depuis le {echeance}. Des pénalités de retard sont applicables de plein droit.

Passé le délai de 8 jours, je saisirai la juridiction compétente sans autre avertissement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} impayée',
    body: `Bonjour {client},

En dépit de mes rappels, ma facture{ref} de {montant}, dont l'échéance était le {echeance}, reste impayée.

Je vous mets en demeure par ce courrier de procéder au règlement dans les 8 jours. À défaut, j'engagerai les procédures de recouvrement judiciaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} ({montant})',
    body: `Bonjour {client},

Je vous mets formellement en demeure de régler la somme de {montant} correspondant à ma facture{ref}, exigible depuis le {echeance}.

Vous disposez d'un délai de 8 jours à compter de ce message pour effectuer ce règlement. Sans paiement dans ce délai, je procéderai à un recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} en retard ({montant})',
    body: `Bonjour {client},

Mes relances amiables n'ayant pas abouti, je vous adresse cette mise en demeure concernant ma facture{ref} de {montant}, échue depuis le {echeance}.

Vous disposez de 8 jours pour régulariser cette situation. Dans le cas contraire, j'engagerai une procédure de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Action judiciaire imminente',
    body: `Bonjour {client},

Malgré mes nombreuses relances, ma facture{ref} de {montant}, due le {echeance}, demeure impayée.

Je vous mets en demeure de procéder au règlement dans les 8 jours. Sans règlement, j'engagerai une procédure judiciaire et vous réclamerai en sus les frais de procédure et pénalités légales.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure de payer – Facture{ref}',
    body: `Bonjour {client},

Par la présente, je vous mets en demeure de payer la somme de {montant} due au titre de ma facture{ref}, exigible depuis le {echeance}.

Le non-paiement dans un délai de 8 jours me conduira à saisir la juridiction compétente pour obtenir le recouvrement forcé de cette créance, augmentée des intérêts légaux.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – {montant} impayé (facture{ref})',
    body: `Bonjour {client},

En l'absence de tout règlement ou réponse de votre part malgré mes relances, je me vois dans l'obligation de vous mettre en demeure de payer {montant} (facture{ref}, échéance {echeance}).

Délai accordé : 8 jours. Passé ce délai, j'engagerai les procédures judiciaires nécessaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure formelle – {montant} à régler',
    body: `Bonjour {client},

N'ayant reçu ni règlement ni réponse à mes précédentes relances concernant ma facture{ref} de {montant} (échéance {echeance}), je vous adresse la présente mise en demeure.

Vous avez 8 jours pour régler cette somme, sous peine d'une procédure de recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Dernier délai',
    body: `Bonjour {client},

Il s'agit de mon dernier recours amiable concernant ma facture{ref} de {montant}, échue le {echeance}.

Je vous mets en demeure de régler cette somme dans les 8 jours. Passé ce délai, je transmettrai ce dossier à mon conseil pour engagement d'une procédure judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} impayée depuis {echeance}',
    body: `Bonjour {client},

Je vous adresse cette mise en demeure concernant ma facture{ref} de {montant}, impayée depuis le {echeance} malgré mes relances.

Vous disposez d'un délai de 8 jours pour effectuer ce règlement, majoré des pénalités de retard légales. À défaut, j'engagerai une procédure judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant}) – Procédure engagée sous 8 jours',
    body: `Bonjour {client},

Suite à l'absence de règlement de ma facture{ref} de {montant}, due le {echeance}, je vous adresse la présente mise en demeure.

Sans paiement dans les 8 jours suivant ce message, j'engagerai sans préavis supplémentaire une procédure de recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Pénalités applicables',
    body: `Bonjour {client},

Par la présente, je vous mets en demeure de régler sous 8 jours la somme de {montant} (facture{ref}, échue le {echeance}), augmentée des pénalités de retard légales et de l'indemnité forfaitaire de 40 € pour frais de recouvrement.

À défaut, j'engagerai une procédure judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Recouvrement judiciaire imminent',
    body: `Bonjour {client},

Mes relances amiables concernant ma facture{ref} de {montant} (échéance {echeance}) étant restées vaines, je vous mets en demeure de régler cette somme dans un délai de 8 jours.

À défaut de règlement, j'engagerai une procédure judiciaire sans autre avertissement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Montant exigible',
    body: `Bonjour {client},

En vertu de l'article L. 441-10 du Code de commerce, je vous mets en demeure de régler la somme de {montant} (facture{ref}, échue le {echeance}).

Des pénalités de retard courent de plein droit depuis l'échéance. Vous disposez de 8 jours pour régulariser avant que j'engage une procédure judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} impayée – Recours imminent',
    body: `Bonjour {client},

Je vous adresse cette mise en demeure concernant ma facture{ref} de {montant}, dont l'échéance du {echeance} est largement dépassée.

Vous avez 8 jours pour régler intégralement cette somme. Sans règlement dans ce délai, je saisirai la juridiction compétente.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} ({montant}) – 8 jours',
    body: `Bonjour {client},

Par la présente, je vous mets formellement en demeure de procéder au règlement de la somme de {montant} due au titre de la facture{ref}, exigible depuis le {echeance}.

À défaut de règlement dans les 8 jours, j'engagerai sans délai supplémentaire les procédures judiciaires appropriées.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Dernière chance',
    body: `Bonjour {client},

Malgré mes relances successives, aucun règlement n'a été reçu pour ma facture{ref} de {montant} (échéance {echeance}).

Je vous mets en demeure de régler cette somme dans les 8 jours suivant la réception de ce message. À défaut, j'engagerai une procédure de recouvrement judiciaire et vous réclamerai les frais afférents.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant}) impayée',
    body: `Bonjour {client},

En l'absence de tout règlement malgré mes relances, je vous adresse cette mise en demeure de payer la somme de {montant} (facture{ref}, échue le {echeance}).

Délai : 8 jours. Au-delà, une procédure judiciaire sera engagée.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure formelle – Facture{ref} – Procédure judiciaire',
    body: `Bonjour {client},

Je vous mets en demeure, par la présente, de régler la somme de {montant} (facture{ref}, exigible depuis le {echeance}), majorée des pénalités de retard légales.

Si le règlement n'est pas effectué dans les 8 jours, je transmettrai ce dossier à un huissier de justice pour recouvrement forcé.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Délai final',
    body: `Bonjour {client},

Suite à mes nombreuses relances demeurées sans effet, je vous adresse cette mise en demeure finale concernant ma facture{ref} de {montant}, échue le {echeance}.

Vous avez 8 jours pour régler cette somme. Passé ce délai, j'engagerai les voies judiciaires de recouvrement sans autre préavis.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} – Recouvrement forcé',
    body: `Bonjour {client},

Par la présente mise en demeure, je vous somme de régler sous 8 jours la somme de {montant} (facture{ref}, exigible depuis le {echeance}).

À défaut, j'engagerai un recouvrement forcé par voie judiciaire, dont les frais vous seront réclamés.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant}) – Saisine imminente',
    body: `Bonjour {client},

Mes démarches amiables étant restées sans effet, je me vois contraint(e) de vous adresser cette mise en demeure concernant ma facture{ref} de {montant}, due le {echeance}.

Sans règlement dans les 8 jours, je saisirai la juridiction compétente pour obtenir le paiement forcé de cette créance.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Paiement sous 8 jours',
    body: `Bonjour {client},

Je vous mets en demeure de payer la somme de {montant} au titre de la facture{ref}, dont l'échéance était le {echeance}.

Vous disposez de 8 jours à compter de ce message. Passé ce délai, j'engagerai les procédures de recouvrement judiciaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} impayée – Action judiciaire',
    body: `Bonjour {client},

Par la présente, je vous mets en demeure de régler sous 8 jours la somme de {montant} (facture{ref}, exigible depuis le {echeance}), ainsi que les pénalités de retard légales applicables.

À défaut, j'engagerai une procédure judiciaire sans autre avertissement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant}) non réglée',
    body: `Bonjour {client},

Malgré mes relances, je constate que ma facture{ref} de {montant}, échue le {echeance}, demeure impayée.

Je vous mets en demeure de régler cette somme dans les 8 jours suivant la réception de ce message, sous peine d'engagement de procédures de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Règlement de {montant} sous 8 jours',
    body: `Bonjour {client},

Par la présente, je vous mets formellement en demeure de procéder au règlement de {montant} (facture{ref}, due le {echeance}).

Ce règlement doit intervenir dans un délai de 8 jours. À défaut, j'engagerai sans délai une procédure judiciaire de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Procédure judiciaire imminente',
    body: `Bonjour {client},

Suite à l'échec de mes tentatives amiables, je vous mets en demeure de régler la somme de {montant} (facture{ref}, exigible depuis le {echeance}) dans un délai de 8 jours.

L'absence de règlement dans ce délai entraînera l'engagement d'une procédure judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} ({montant}) – Délai 8 jours',
    body: `Bonjour {client},

Je vous adresse cette mise en demeure concernant ma facture{ref} de {montant}, échue le {echeance}, restée impayée malgré mes relances.

Vous avez 8 jours pour régler cette somme majorée des pénalités légales. À défaut, je saisirai sans préavis la juridiction compétente.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Créance exigible',
    body: `Bonjour {client},

En l'absence de tout règlement de ma facture{ref} de {montant}, due le {echeance}, je vous adresse la présente mise en demeure.

Je vous accorde un délai de 8 jours pour régulariser cette situation, passé lequel j'engagerai les procédures de recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant}) – Dernier recours amiable',
    body: `Bonjour {client},

Cette mise en demeure constitue mon dernier recours amiable concernant ma facture{ref} de {montant}, exigible depuis le {echeance}.

Vous disposez de 8 jours pour procéder au règlement intégral. À défaut, j'engagerai une procédure judiciaire sans autre avertissement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} impayée – Recouvrement',
    body: `Bonjour {client},

Mes relances successives étant restées sans effet, je vous adresse cette mise en demeure de payer la somme de {montant} (facture{ref}, exigible depuis le {echeance}).

Délai accordé : 8 jours. À l'issue de ce délai, j'engagerai un recouvrement par voie judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Pénalités et frais',
    body: `Bonjour {client},

Je vous mets en demeure de régler sous 8 jours la somme de {montant} (facture{ref}, échue le {echeance}), augmentée des pénalités de retard (3 fois le taux légal) et de l'indemnité forfaitaire légale de 40 €.

À défaut, j'engagerai une procédure judiciaire pour le recouvrement de l'intégralité des sommes dues.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure formelle – Facture{ref} ({montant})',
    body: `Bonjour {client},

Par la présente, je vous mets formellement en demeure de payer, dans un délai de 8 jours, la somme de {montant} correspondant à ma facture{ref} dont l'échéance était le {echeance}.

Sans paiement dans ce délai, j'engagerai les procédures judiciaires de recouvrement.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} – Ultimatum',
    body: `Bonjour {client},

Par la présente, je vous mets en demeure de régler sous 8 jours la somme de {montant} (facture{ref}, exigible depuis le {echeance}).

Il s'agit de mon ultime démarche amiable. Sans règlement dans ce délai, je transmettrai ce dossier sans délai à un conseil juridique pour recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Saisine du tribunal',
    body: `Bonjour {client},

En l'absence de règlement de ma facture{ref} de {montant} (échéance {echeance}) malgré mes relances, je vous mets en demeure de payer cette somme dans les 8 jours.

À défaut, je saisirai le tribunal compétent pour obtenir le recouvrement forcé de cette créance, majorée des frais et pénalités applicables.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant}) – Engagement de procédure',
    body: `Bonjour {client},

Ayant épuisé toutes les voies amiables, je vous adresse cette mise en demeure concernant ma facture{ref} de {montant}, due le {echeance}.

Vous avez 8 jours pour régler cette somme. À défaut, j'engagerai une procédure judiciaire dont les frais vous seront imputés.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} – Dernière démarche',
    body: `Bonjour {client},

Je vous adresse cette dernière démarche amiable sous forme de mise en demeure concernant ma facture{ref} de {montant}, exigible depuis le {echeance}.

Vous disposez de 8 jours pour régler cette somme majorée des pénalités légales. Passé ce délai, je procéderai à un recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Recouvrement par huissier',
    body: `Bonjour {client},

En l'absence de tout règlement de ma facture{ref} de {montant} (exigible depuis le {echeance}) malgré mes relances successives, je vous mets en demeure de payer sous 8 jours.

Sans règlement dans ce délai, je confierai ce dossier à un huissier de justice pour recouvrement forcé.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} ({montant}) – Art. L. 441-10',
    body: `Bonjour {client},

En application des dispositions légales relatives aux délais de paiement, je vous mets en demeure de régler sous 8 jours la somme de {montant} (facture{ref}, exigible depuis le {echeance}).

Des pénalités de retard courent de plein droit. À défaut de règlement dans ce délai, j'engagerai les procédures judiciaires nécessaires.

Cordialement,
{prenom}`,
  },
  {
    subject: 'MISE EN DEMEURE – Facture{ref} impayée – {montant}',
    body: `Bonjour {client},

Malgré mes relances restées sans effet, ma facture{ref} de {montant}, due le {echeance}, demeure impayée.

Par la présente mise en demeure, je vous accorde 8 jours pour régler cette somme. À défaut, j'engagerai une procédure de recouvrement judiciaire.

Cordialement,
{prenom}`,
  },
  {
    subject: 'Mise en demeure – Facture{ref} – Créance impayée ({montant})',
    body: `Bonjour {client},

Je vous mets en demeure, par la présente, de procéder au règlement de {montant} (facture{ref}, exigible depuis le {echeance}).

À défaut de paiement dans les 8 jours, je me verrai dans l'obligation d'engager les voies judiciaires, dont les frais vous seront réclamés en sus.

Cordialement,
{prenom}`,
  },
]

export const TEMPLATES: Record<1 | 2 | 3, RawTemplate[]> = { 1: L1, 2: L2, 3: L3 }
