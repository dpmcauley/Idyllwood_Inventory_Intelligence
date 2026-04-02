import React from 'react'
import type { AnalysisResult } from '../../types'

const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const CapitalSummary: React.FC<{ result: AnalysisResult }> = ({ result: { scorecard } }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <MetricCard label="Total Inventory Value" value={fmt(scorecard.total_inventory_value)} sub={`${scorecard.vendor_count} vendors`} />
    <MetricCard label="Healthy SKUs" value={`${scorecard.healthy_sku_count}`} sub={`${Math.round(scorecard.healthy_sku_pct * 100)}% of catalog`} valueColor="text-green-400" />
    <MetricCard label="Capital at Risk" value={fmt(scorecard.capital_at_risk)} sub={`${fmt(scorecard.total_monthly_carrying_cost)}/mo carrying cost`} valueColor="text-red-400" />
    <MetricCard label="Suggested Reorder Spend" value={fmt(scorecard.suggested_reorder_spend)} sub={`Across ${scorecard.vendor_count} vendors`} valueColor="text-taupe-400" />
  </div>
)

const MetricCard: React.FC<{ label: string; value: string; sub: string; valueColor?: string }> = ({ label, value, sub, valueColor = 'text-white' }) => (
  <div className="bg-slate-900 border border-white/6 rounded-xl p-4">
    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
    <p className={`${valueColor} text-xl font-bold`}>{value}</p>
    <p className="text-slate-600 text-xs mt-0.5">{sub}</p>
  </div>
)
