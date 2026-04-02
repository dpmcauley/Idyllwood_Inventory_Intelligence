import React from 'react'
import type { CategoryBreakdown as CatBreakdown } from '../../types'

const STATUS_COLORS = { healthy: 'text-green-400', monitor: 'text-yellow-400', reorder: 'text-orange-400', critical: 'text-red-400' }
const STATUS_LABELS = { healthy: 'Healthy', monitor: 'Monitor', reorder: 'Reorder', critical: 'Overweight' }

export const CategoryBreakdown: React.FC<{ categories: CatBreakdown[] }> = ({ categories }) => (
  <div className="bg-slate-900 border border-white/6 rounded-xl overflow-hidden mb-6">
    <div className="px-4 py-3 border-b border-white/5">
      <p className="text-slate-400 text-xs uppercase tracking-wider">Inventory Health by Category</p>
    </div>
    {categories.map(cat => (
      <div key={cat.category} className="flex items-center gap-4 px-4 py-2.5 border-t border-white/4">
        <span className="text-slate-200 text-sm font-medium w-36 shrink-0">{cat.category}</span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div style={{ width: `${cat.healthy_pct * 100}%`, background: '#4ade80' }} />
            <div style={{ width: `${cat.monitor_pct * 100}%`, background: '#facc15' }} />
            <div style={{ width: `${cat.reorder_pct * 100}%`, background: '#fb923c' }} />
            <div style={{ width: `${cat.critical_pct * 100}%`, background: '#f87171' }} />
          </div>
        </div>
        <span className={`${STATUS_COLORS[cat.worst_status]} text-xs font-semibold w-20 text-right`}>
          {STATUS_LABELS[cat.worst_status]}
        </span>
        <span className="text-slate-500 text-xs w-12 text-right">{cat.sku_count} SKUs</span>
      </div>
    ))}
    <div className="px-4 py-2 bg-slate-950/50 border-t border-white/4 flex gap-4">
      {[['#4ade80', 'Healthy'], ['#facc15', 'Monitor'], ['#fb923c', 'Reorder / Watch'], ['#f87171', 'Critical / Overstock']].map(([color, label]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
          <span className="text-slate-500 text-xs">{label}</span>
        </div>
      ))}
    </div>
  </div>
)
