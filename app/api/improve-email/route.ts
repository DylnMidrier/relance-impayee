import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const anthropic = new Anthropic()

const LEVEL_LABELS: Record<number, string> = {
  1: 'rappel amical (J+7)',
  2: 'relance ferme (J+15)',
  3: 'mise en demeure (J+30)',
}

// Rate limiter in-memory : 10 requêtes par utilisateur par minute
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(userId)
  if (!entry || now > entry.resetAt) {
    rateMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      },
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!checkRateLimit(user.id)) {
      return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans une minute.' }, { status: 429 })
    }

    // Plan check — IA réservée aux comptes Premium
    const { getUserPlan } = await import('../../lib/plan')
    const plan = await getUserPlan(user.id)
    if (plan !== 'premium') {
      return NextResponse.json({ error: 'premium_required' }, { status: 403 })
    }

    const ImproveSchema = z.object({
      body:       z.string().max(4000),
      subject:    z.string().max(200),
      userPrompt: z.string().min(1).max(500),
      client:     z.string().max(200),
      montant:    z.string().max(50),
      echeance:   z.string().max(50),
      level:      z.union([z.literal(1), z.literal(2), z.literal(3)]),
    })

    const parsed = ImproveSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 })
    }
    const { body, subject, userPrompt, client, montant, echeance, level } = parsed.data

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
    console.log('[improve-email] stop_reason:', message.stop_reason)
    console.log('[improve-email] usage:', message.usage)
    console.log('[improve-email] response:\n', improved)
    return NextResponse.json({ body: improved })
  } catch (err) {
    console.error('[improve-email]', err)
    return NextResponse.json({ error: 'Erreur lors de la génération IA' }, { status: 500 })
  }
}
