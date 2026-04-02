import type { AnalysisResult, AiQualitativeOutput } from '../types'

export async function enrichWithAi(result: AnalysisResult): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: result.items }),
  })

  if (response.status === 429) {
    throw new Error('Rate limit exceeded. Maximum 10 analyses per hour.')
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Analysis failed.')
  }

  const ai: AiQualitativeOutput = await response.json()

  // Merge AI rationale + overstock_action back onto items
  const itemMap = new Map(ai.items.map(a => [a.sku, a]))
  const enrichedItems = result.items.map(item => {
    const aiItem = itemMap.get(item.sku)
    if (!aiItem) return item
    return {
      ...item,
      ai_rationale: aiItem.ai_rationale ?? item.ai_rationale,
      overstock_action: aiItem.overstock_action ?? item.overstock_action,
    }
  })

  return {
    ...result,
    items: enrichedItems,
    scorecard: {
      ...result.scorecard,
      grade_summary: ai.grade_summary,
      top_actions: ai.top_actions,
    },
  }
}
