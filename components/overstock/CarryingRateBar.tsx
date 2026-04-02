import React, { useState } from 'react'

const BREAKDOWN = [
  { label: 'Capital cost (opportunity cost)', rate: '12%' },
  { label: 'Storage / floor space', rate: '5%' },
  { label: 'Obsolescence / price erosion', rate: '4%' },
  { label: 'Insurance', rate: '2%' },
  { label: 'Shrinkage / handling', rate: '2%' },
]

interface Props { rate: number; onChange: (rate: number) => void }

export const CarryingRateBar: React.FC<Props> = ({ rate, onChange }) => {
  const [editing, setEditing] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [draftRate, setDraftRate] = useState(String(Math.round(rate * 100)))

  const handleSave = () => {
    const parsed = parseFloat(draftRate)
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      onChange(parsed / 100)
    }
    setEditing(false)
  }

  return (
    <div className="relative bg-slate-900 border border-white/6 rounded-lg px-4 py-2.5 flex justify-between items-center mb-5">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-sm">Annual carrying rate assumption</span>
        <button
          onClick={() => setTooltipOpen(!tooltipOpen)}
          className="w-4 h-4 rounded-full border border-slate-500 text-slate-500 text-xs flex items-center justify-center hover:border-taupe-400 hover:text-taupe-400 transition-colors"
        >
          i
        </button>
      </div>
      <div className="flex items-center gap-2">
        {editing ? (
          <>
            <input
              value={draftRate}
              onChange={e => setDraftRate(e.target.value)}
              className="w-14 bg-slate-800 border border-taupe-500/40 rounded px-2 py-0.5 text-sm text-white text-right"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
            <span className="text-slate-400 text-sm">%</span>
            <button onClick={handleSave} className="text-taupe-400 text-xs hover:text-white">Save</button>
          </>
        ) : (
          <>
            <span className="text-taupe-400 font-bold">{Math.round(rate * 100)}%</span>
            <button
              onClick={() => setEditing(true)}
              className="text-slate-500 text-xs border border-white/10 px-2 py-0.5 rounded hover:text-white transition-colors"
            >
              Edit
            </button>
          </>
        )}
      </div>

      {tooltipOpen && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-slate-900 border border-taupe-500/30 rounded-xl p-4 shadow-2xl z-20">
          <div className="absolute -top-1.5 left-6 w-2.5 h-2.5 bg-slate-900 border-l border-t border-taupe-500/30 rotate-45" />
          <p className="text-taupe-400 text-xs font-bold uppercase tracking-wider mb-2">What's in the {Math.round(rate * 100)}%?</p>
          <p className="text-slate-500 text-xs mb-3 leading-relaxed">Industry standard for retail inventory. Covers the true cost of holding stock beyond what you paid for it.</p>
          <table className="w-full text-xs">
            <tbody>
              {BREAKDOWN.map(row => (
                <tr key={row.label} className="border-t border-white/4">
                  <td className="py-1.5 text-slate-400">{row.label}</td>
                  <td className="py-1.5 text-white font-semibold text-right">{row.rate}</td>
                </tr>
              ))}
              <tr className="border-t border-taupe-500/20">
                <td className="pt-2 text-taupe-400 font-bold">Industry default</td>
                <td className="pt-2 text-taupe-400 font-bold text-right">25%</td>
              </tr>
            </tbody>
          </table>
          <p className="text-slate-600 text-xs mt-3 leading-relaxed">
            MI retailers with premium floor space (e.g. Toronto, Vancouver) may run 28–30%. Use Edit to override with your actual rate.
          </p>
        </div>
      )}
    </div>
  )
}
