import React from 'react'
import type { AnalysisResult } from '../../types'

export const ReorderSummaryChips: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const critical = result.items.filter(i => i.reorder_severity === 'critical').length
  const high = result.items.filter(i => i.reorder_severity === 'high').length
  const monitor = result.items.filter(i => i.reorder_severity === 'monitor').length
  const vendors = result.reorder_groups.length
  const totalSpend = result.scorecard.suggested_reorder_spend

  return (
    <div className="flex gap-3 flex-wrap mb-5">
      <Chip value={critical} label="Critical SKUs" color="text-red-400" border="border-red-500/20" />
      <Chip value={high} label="High SKUs" color="text-orange-400" border="border-orange-500/20" />
      <Chip value={monitor} label="Monitor SKUs" color="text-yellow-400" border="border-yellow-500/20" />
      <Chip value={vendors} label="Vendors" color="text-slate-300" border="border-white/8" />
      <Chip
        value={`$${totalSpend.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        label="Total Suggested Spend"
        color="text-taupe-400"
        border="border-taupe-500/25"
      />
    </div>
  )
}

const Chip: React.FC<{ value: number | string; label: string; color: string; border: string }> = ({ value, label, color, border }) => (
  <div className={`bg-slate-900 border ${border} rounded-lg px-3 py-2 text-center min-w-[80px]`}>
    <div className={`${color} text-sm font-bold`}>{value}</div>
    <div className="text-slate-500 text-xs mt-0.5">{label}</div>
  </div>
)
