import React, { useState } from 'react'
import { ShowMathPanel } from './ShowMathPanel'
import type { VendorOverstockGroup } from '../../types'

const SEVERITY_STYLES = {
  high: { badge: 'bg-red-500/15 text-red-400', border: 'border-red-500/25' },
  watch: { badge: 'bg-orange-500/15 text-orange-400', border: 'border-orange-500/20' },
}
const ACTION_LABELS: Record<string, string> = {
  return_negotiate: 'Return / Negotiate',
  markdown: 'Markdown',
  watch: 'Watch',
  dead_stock: 'Dead Stock',
}
const ACTION_STYLES: Record<string, string> = {
  return_negotiate: 'bg-red-500/12 text-red-400',
  markdown: 'bg-red-500/12 text-red-400',
  watch: 'bg-orange-500/12 text-orange-400',
  dead_stock: 'bg-red-500/20 text-red-300',
}
const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const VendorOverstockCard: React.FC<{ group: VendorOverstockGroup; carryingRate: number }> = ({ group, carryingRate }) => {
  const [expandedSku, setExpandedSku] = useState<string | null>(null)
  const style = SEVERITY_STYLES[group.worst_severity]

  return (
    <div className={`bg-slate-900 border ${style.border} rounded-xl overflow-hidden mb-4`}>
      <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className={`${style.badge} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
            {group.worst_severity === 'high' ? 'High Risk' : 'Watch'}
          </span>
          <span className="text-white font-semibold">{group.vendor_name}</span>
        </div>
        <div className="text-taupe-400 text-sm">
          Capital tied up: <strong className="text-white">{fmt(group.capital_tied_up)}</strong>
          <span className="text-slate-500 ml-2">· {group.items.length} SKUs</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wide border-b border-white/4">
              {['Product', 'On Hand', 'Avg/Mo', 'Months Supply', 'Carrying/Mo', 'Action', ''].map((h, i) => (
                <th key={i} className="px-4 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.items.map(item => (
              <React.Fragment key={item.sku}>
                <tr className={`border-t border-white/4 hover:bg-white/2 transition-colors ${expandedSku === item.sku ? 'bg-red-500/4' : ''}`}>
                  <td className="px-4 py-2.5 text-slate-200">
                    {item.product_name}
                    <span className="text-slate-500 ml-2 text-xs">{item.sku}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{item.on_hand}</td>
                  <td className="px-4 py-2.5 text-slate-400">{item.avg_monthly_sales || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={item.months_supply && item.months_supply > 12 ? 'text-red-400 font-bold' : item.months_supply && item.months_supply > 4 ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                      {item.is_dead_stock ? '∞' : `${item.months_supply?.toFixed(1)} mo`}
                    </span>
                  </td>
                  <td className={`px-4 py-2.5 ${item.monthly_carrying_cost > 200 ? 'text-red-400' : 'text-orange-400'}`}>
                    ${item.monthly_carrying_cost.toFixed(0)}
                  </td>
                  <td className="px-4 py-2.5">
                    {item.overstock_action && (
                      <span className={`${ACTION_STYLES[item.overstock_action]} text-xs px-2 py-0.5 rounded`}>
                        {ACTION_LABELS[item.overstock_action]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => setExpandedSku(expandedSku === item.sku ? null : item.sku)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                        expandedSku === item.sku
                          ? 'border-taupe-500/30 text-taupe-400 bg-taupe-400/8'
                          : 'border-white/10 text-slate-500 hover:text-white'
                      }`}
                    >
                      {expandedSku === item.sku ? 'Hide Math ▲' : 'Show Math'}
                    </button>
                  </td>
                </tr>
                {expandedSku === item.sku && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <ShowMathPanel item={item} carryingRate={carryingRate} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
