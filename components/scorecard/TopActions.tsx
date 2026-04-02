import React from 'react'
import type { TopAction } from '../../types'

const BADGE_STYLES: Record<string, string> = {
  'reorder-critical': 'bg-red-500/15 text-red-400',
  'reorder-high': 'bg-red-500/12 text-red-400',
  'overstock-critical': 'bg-red-500/15 text-red-400',
  'overstock-high': 'bg-red-500/12 text-red-400',
}
const BORDER: Record<string, string> = {
  critical: 'border-red-500/20',
  high: 'border-orange-500/15',
}

interface Props { actions: TopAction[]; onViewVendor: (type: 'reorder' | 'overstock', vendorId: string) => void }

export const TopActions: React.FC<Props> = ({ actions, onViewVendor }) => (
  <div>
    <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Top Actions This Week</p>
    <div className="space-y-2">
      {actions.map((action, i) => (
        <div key={i} className={`bg-slate-900 border ${BORDER[action.severity]} rounded-xl px-4 py-3 flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <span className={`${BADGE_STYLES[`${action.type}-${action.severity}`]} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap`}>
              {action.type}
            </span>
            <span className="text-slate-200 text-sm">{action.text}</span>
          </div>
          <button
            onClick={() => onViewVendor(action.type, action.vendor_id)}
            className="text-slate-500 text-xs border border-white/8 px-3 py-1 rounded hover:text-white transition-colors whitespace-nowrap ml-4"
          >
            View →
          </button>
        </div>
      ))}
    </div>
  </div>
)
