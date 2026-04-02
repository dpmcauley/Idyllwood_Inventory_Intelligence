import React from 'react'
import type { AnalysisResult } from '../../types'

const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const OverstockSummaryChips: React.FC<{ result: AnalysisResult; carryingRate: number }> = ({ result, carryingRate }) => {
  const highRisk = result.items.filter(i => i.overstock_severity === 'high').length
  const watch = result.items.filter(i => i.overstock_severity === 'watch').length
  const overstockItems = result.items.filter(i => i.overstock_severity)
  const monthlyCarrying = overstockItems.reduce((s, i) => s + i.on_hand * i.unit_cost * carryingRate / 12, 0)
  const capitalAtRisk = overstockItems.reduce((s, i) => s + i.on_hand * i.unit_cost, 0)

  return (
    <div className="flex gap-3 flex-wrap mb-5">
      <Chip value={highRisk} label="High Risk SKUs" color="text-red-400" border="border-red-500/20" />
      <Chip value={watch} label="Watch SKUs" color="text-orange-400" border="border-orange-500/20" />
      <Chip value={fmt(monthlyCarrying)} label="Monthly Carrying Cost" color="text-taupe-400" border="border-taupe-500/25" />
      <Chip value={fmt(capitalAtRisk)} label="Capital Tied Up" color="text-taupe-400" border="border-taupe-500/25" />
    </div>
  )
}

const Chip: React.FC<{ value: number | string; label: string; color: string; border: string }> = ({ value, label, color, border }) => (
  <div className={`bg-slate-900 border ${border} rounded-lg px-3 py-2 text-center min-w-[80px]`}>
    <div className={`${color} text-sm font-bold`}>{value}</div>
    <div className="text-slate-500 text-xs mt-0.5">{label}</div>
  </div>
)
