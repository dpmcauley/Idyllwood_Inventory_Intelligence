import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GoogleGenAI } from '@google/genai'

// Simple in-memory rate limiter: 10 req/hour per IP (resets on cold start — adequate for demo)
const rateLimiter = new Map<string, number[]>()
const RATE_LIMIT = 10
const WINDOW_MS = 60 * 60 * 1000

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = (rateLimiter.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (timestamps.length >= RATE_LIMIT) return true
  rateLimiter.set(ip, [...timestamps, now])
  return false
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Maximum 10 analyses per hour.' })
  }

  const { items } = req.body
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array required' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  try {
    const ai = new GoogleGenAI({ apiKey })

    const flaggedItems = items.filter((i: { reorder_severity: string | null; overstock_severity: string | null }) =>
      i.reorder_severity || i.overstock_severity
    )

    const prompt = `You are an inventory analyst for a musical instrument retailer. Analyze the following flagged inventory items and return a JSON response.

Flagged items (${flaggedItems.length} of ${items.length} total SKUs):
${JSON.stringify(flaggedItems.map((i: {
  sku: string; product_name: string; vendor_name: string; on_hand: number;
  avg_monthly_sales: number; months_supply: number | null; monthly_carrying_cost: number;
  reorder_severity: string | null; overstock_severity: string | null; overstock_action: string | null;
  net_need: number; unit_cost: number;
}) => ({
  sku: i.sku,
  product_name: i.product_name,
  vendor_name: i.vendor_name,
  on_hand: i.on_hand,
  avg_monthly_sales: i.avg_monthly_sales,
  months_supply: i.months_supply,
  monthly_carrying_cost: i.monthly_carrying_cost,
  reorder_severity: i.reorder_severity,
  overstock_severity: i.overstock_severity,
  overstock_action: i.overstock_action,
  net_need: i.net_need,
  unit_cost: i.unit_cost,
})), null, 2)}

Return ONLY valid JSON with this exact structure:
{
  "items": [
    {
      "sku": "DS000000",
      "ai_rationale": "One to two sentence plain-English explanation of this item's risk and recommended action.",
      "overstock_action": "return_negotiate | markdown | watch | dead_stock | null"
    }
  ],
  "top_actions": [
    {
      "type": "reorder | overstock",
      "severity": "critical | high",
      "vendor_name": "string",
      "vendor_id": "string",
      "text": "One sentence describing the action the buyer should take this week."
    }
  ],
  "grade_summary": "One sentence summarizing the overall grade and the most important thing to act on."
}

Rules:
- Include ALL flagged items in the items array
- top_actions: 4-6 items, highest severity first, interleave reorder and overstock
- grade_summary: max 20 words, direct and specific
- overstock_action for non-overstock items: null
- Do not include any text outside the JSON`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const text = response.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const parsed = JSON.parse(jsonMatch[0])
    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Gemini error:', err)
    return res.status(500).json({ error: 'Analysis failed. Please try again.' })
  }
}
