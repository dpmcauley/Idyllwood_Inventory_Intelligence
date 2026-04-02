import React from 'react'

interface VendorChip { vendor_id: string; vendor_name: string; severity: 'critical' | 'high' | 'monitor' | 'watch' }

interface Props {
  vendors: VendorChip[]
  selected: string | null
  onChange: (vendor_id: string | null) => void
}

const SEVERITY_COLORS = {
  critical: 'border-red-500/40',
  high: 'border-orange-500/40',
  monitor: 'border-yellow-500/30',
  watch: 'border-orange-500/30',
}
const SEVERITY_DOTS = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  monitor: 'text-yellow-400',
  watch: 'text-orange-400',
}

export const VendorFilter: React.FC<Props> = ({ vendors, selected, onChange }) => (
  <div className="mb-5">
    <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Filter by vendor</p>
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
          selected === null ? 'bg-taupe-400 text-slate-900 font-bold' : 'bg-slate-800 text-slate-400 border border-white/8'
        }`}
      >
        All
      </button>
      {vendors.map(v => (
        <button
          key={v.vendor_id}
          onClick={() => onChange(v.vendor_id)}
          className={`px-3 py-1 rounded-full text-xs transition-all bg-slate-800 border ${SEVERITY_COLORS[v.severity]} ${
            selected === v.vendor_id ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {v.vendor_name} <span className={SEVERITY_DOTS[v.severity]}>●</span>
        </button>
      ))}
    </div>
  </div>
)
