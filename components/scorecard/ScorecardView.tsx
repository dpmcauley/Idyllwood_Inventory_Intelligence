import React from 'react'
import { HealthScoreCard } from './HealthScoreCard'
import { CapitalSummary } from './CapitalSummary'
import { CategoryBreakdown } from './CategoryBreakdown'
import { TopActions } from './TopActions'
import { buildCategoryBreakdown } from '../../services/calculations'
import type { AnalysisResult } from '../../types'

interface Props {
  result: AnalysisResult
  onNavigate: (tab: 'reorder' | 'overstock', vendorId: string) => void
}

export const ScorecardView: React.FC<Props> = ({ result, onNavigate }) => {
  const categories = result.scorecard.category_breakdown.length > 0
    ? result.scorecard.category_breakdown
    : buildCategoryBreakdown(result.items)

  return (
    <div>
      <HealthScoreCard result={result} />
      <CapitalSummary result={result} />
      <CategoryBreakdown categories={categories} />
      {result.scorecard.top_actions.length > 0 && (
        <TopActions
          actions={result.scorecard.top_actions}
          onViewVendor={(type, vendorId) => onNavigate(type, vendorId)}
        />
      )}
    </div>
  )
}
