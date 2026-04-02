import React from 'react'
import type { InventoryItem } from '../../types'

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const ShowMathPanel: React.FC<{ item: InventoryItem; carryingRate: number }> = ({ item, carryingRate }) => {
  const inventoryValue = item.on_hand * item.unit_cost
  const annualCost = inventoryValue * carryingRate
  const monthlyActual = annualCost / 12

  return (
    <div className="bg-slate-950 border-t border-white/4 p-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Months of Supply */}
        <div>
          <p className="text-taupe-400 text-xs font-bold uppercase tracking-wider mb-2">Months of Supply</p>
          <div className="bg-slate-900 rounded-lg p-3 text-xs space-y-1.5">
            <Row label="On Hand" value={`${item.on_hand} units`} />
            <Row label="Avg Monthly Sales" value={`${item.avg_monthly_sales} units/mo`} />
            <Row label="Formula" value={`${item.on_hand} ÷ ${item.avg_monthly_sales}`} muted />
            <div className="flex justify-between pt-1.5 border-t border-white/6">
              <span className="text-taupe-400 font-semibold">Result</span>
              <span className="text-red-400 font-bold">{item.months_supply?.toFixed(1)} months</span>
            </div>
          </div>
        </div>

        {/* Carrying Cost */}
        <div>
          <p className="text-taupe-400 text-xs font-bold uppercase tracking-wider mb-2">Monthly Carrying Cost</p>
          <div className="bg-slate-900 rounded-lg p-3 text-xs space-y-1.5">
            <Row label="On Hand" value={`${item.on_hand} units`} />
            <Row label="Unit Cost" value={fmt(item.unit_cost)} />
            <Row label="Inventory Value" value={fmt(inventoryValue)} />
            <Row label="Annual Rate" value={`${Math.round(carryingRate * 100)}%`} />
            <Row label="Formula" value={`${fmt(inventoryValue)} × ${Math.round(carryingRate * 100)}% ÷ 12`} muted />
            <div className="flex justify-between pt-1.5 border-t border-white/6">
              <span className="text-taupe-400 font-semibold">Result</span>
              <span className="text-red-400 font-bold">{fmt(monthlyActual)} / month</span>
            </div>
          </div>
        </div>
      </div>

      {item.ai_rationale && (
        <div className="border-l-2 border-taupe-500 pl-3 bg-slate-900/50 rounded-r-lg py-2 pr-3">
          <p className="text-taupe-400 text-xs font-bold uppercase tracking-wider mb-1">AI Rationale</p>
          <p className="text-slate-400 text-xs leading-relaxed">{item.ai_rationale}</p>
        </div>
      )}
    </div>
  )
}

const Row: React.FC<{ label: string; value: string; muted?: boolean }> = ({ label, value, muted }) => (
  <div className="flex justify-between">
    <span className="text-slate-500">{label}</span>
    <span className={muted ? 'text-slate-600 italic' : 'text-slate-200'}>{value}</span>
  </div>
)
