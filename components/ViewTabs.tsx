import React from 'react'

export type ViewTab = 'reorder' | 'overstock' | 'scorecard'

interface Props {
  active: ViewTab
  onChange: (tab: ViewTab) => void
}

const TABS: { id: ViewTab; label: string }[] = [
  { id: 'reorder', label: 'Reorder Alerts' },
  { id: 'overstock', label: 'Overstock Risk' },
  { id: 'scorecard', label: 'Full Scorecard' },
]

export const ViewTabs: React.FC<Props> = ({ active, onChange }) => (
  <div className="bg-slate-950 border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 py-2 flex gap-2">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-1.5 rounded text-sm transition-all ${
            active === tab.id
              ? 'bg-taupe-400 text-slate-900 font-bold'
              : 'text-slate-500 border border-white/8 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
)
