import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic()

const LEVEL_LABELS: Record<number, string> = {
  1: 'rappel amical (J+7)',
  2: 'relance ferme (J+15)',
  3: 'mise en demeure (J+30)',
}

export async function POST(req: Request) {
  try {
    const { body, subject, userPrompt, client, montant, echeance, level } = await req.json()

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `Tu es un expert en communication professionnelle française. Tu aides des freelances à rédiger des emails de relance pour factures impayées. Réponds uniquement avec le corps de l'email, sans objet, sans intro, sans explication supplémentaire.`,
      messages: [
        {
          role: 'user',
          content: `Contexte :
- Client : ${client}
- Montant : ${montant}
- Échéance : ${echeance}
- Niveau de relance : ${LEVEL_LABELS[level] ?? level}

Email actuel :
Objet : ${subject}

${body}

Instruction : ${userPrompt}

Réécris le corps de l'email en appliquant cette instruction, en conservant un ton adapté au niveau de relance. Réponds uniquement avec le corps de l'email.`,
        },
      ],
    })

    const improved = (message.content[0] as { type: string; text: string }).text
    return NextResponse.json({ body: improved })
  } catch (err) {
    console.error('[improve-email]', err)
    return NextResponse.json({ error: 'Erreur lors de la génération IA' }, { status: 500 })
  }
}
