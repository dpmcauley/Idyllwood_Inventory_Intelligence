import React from 'react'
import type { VendorReorderGroup } from '../../types'

const SEVERITY_STYLES = {
  critical: { badge: 'bg-red-500/15 text-red-400', border: 'border-red-500/25' },
  high: { badge: 'bg-orange-500/15 text-orange-400', border: 'border-orange-500/20' },
  monitor: { badge: 'bg-yellow-500/15 text-yellow-400', border: 'border-yellow-500/20' },
}

const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export const VendorReorderCard: React.FC<{ group: VendorReorderGroup }> = ({ group }) => {
  const style = SEVERITY_STYLES[group.worst_severity]
  return (
    <div className={`bg-slate-900 border ${style.border} rounded-xl overflow-hidden mb-4`}>
      <div className="px-4 py-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className={`${style.badge} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded`}>
            {group.worst_severity}
          </span>
          <span className="text-white font-semibold">{group.vendor_name}</span>
        </div>
        <div className="text-taupe-400 text-sm">
          Suggested PO: <strong className="text-white">{fmt(group.suggested_po)}</strong>
          <span className="text-slate-500 ml-2">· {group.items.length} SKUs</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs uppercase tracking-wide border-b border-white/4">
              {['Product', 'On Hand', 'On Order', 'Committed', 'Suggest Qty', 'Unit Cost'].map(h => (
                <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.items.map(item => (
              <tr key={item.sku} className="border-t border-white/4 hover:bg-white/2 transition-colors">
                <td className="px-4 py-2.5 text-slate-200">
                  {item.product_name}
                  <span className="text-slate-500 ml-2 text-xs">{item.sku}</span>
                </td>
                <td className={`px-4 py-2.5 ${item.on_hand === 0 ? 'text-red-400' : item.on_hand <= 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                  {item.on_hand}
                </td>
                <td className={`px-4 py-2.5 ${item.on_order > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                  {item.on_order}
                </td>
                <td className={`px-4 py-2.5 ${item.committed > 0 ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {item.committed}
                </td>
                <td className="px-4 py-2.5 text-taupe-400 font-bold">{item.suggest_qty}</td>
                <td className="px-4 py-2.5 text-slate-400">{fmt(item.unit_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
