import React, { useState } from 'react'
import type { AnalysisResult } from '../../types'

const GRADE_COLORS: Record<string, string> = {
  A: 'text-green-400', 'A-': 'text-green-400',
  'B+': 'text-emerald-400', B: 'text-emerald-400', 'B-': 'text-emerald-400',
  'C+': 'text-orange-400', C: 'text-orange-400', 'C-': 'text-orange-400',
  'D+': 'text-red-400', D: 'text-red-400', F: 'text-red-500',
}
const GRADE_DESCRIPTIONS: Record<string, string> = {
  A: 'Excellent', 'A-': 'Very Good',
  'B+': 'Good', B: 'Good', 'B-': 'Above Average',
  'C+': 'Needs Attention', C: 'Needs Attention', 'C-': 'Below Average',
  'D+': 'At Risk', D: 'At Risk', F: 'Critical',
}
const COMPONENT_GRADE_COLORS: Record<string, string> = { A: 'text-green-400', B: 'text-emerald-400', C: 'text-orange-400', D: 'text-red-400', F: 'text-red-500' }
const COMPONENT_BORDER: Record<string, string> = { A: 'border-green-500/10', B: 'border-emerald-500/10', C: 'border-orange-500/10', D: 'border-red-500/15', F: 'border-red-500/20' }
const POSITION_PCT: Record<string, number> = { A: 90, B: 70, C: 50, D: 30, F: 10 }

export const HealthScoreCard: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const [expanded, setExpanded] = useState(false)
  const { scorecard } = result
  const gradeColor = GRADE_COLORS[scorecard.final_grade] ?? 'text-slate-300'

  return (
    <div className="bg-slate-900 border border-orange-500/25 rounded-xl overflow-hidden mb-6">
      <div className="px-5 py-4 flex justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-5">
          <div className="text-center">
            <p className="text-slate-500 text-xs uppercase tracking-wider">Health Score</p>
            <p className={`${gradeColor} text-5xl font-black leading-tight`}>{scorecard.final_grade}</p>
            <p className="text-slate-500 text-xs">{GRADE_DESCRIPTIONS[scorecard.final_grade]}</p>
          </div>
          <div className="w-px h-12 bg-white/7" />
          <div>
            {scorecard.grade_summary && (
              <p className="text-slate-300 text-sm font-medium">{scorecard.grade_summary}</p>
            )}
            <p className="text-slate-500 text-xs mt-0.5">
              This score reflects current inventory position against recent sales velocity — not a performance review.
            </p>
          </div>
        </div>
        <span className="text-taupe-400 text-xs border border-taupe-500/30 px-3 py-1 rounded bg-taupe-400/8 whitespace-nowrap">
          {expanded ? 'Hide Detail ▲' : 'Show Detail ▼'}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-white/6 p-5">
          <div className="grid grid-cols-3 gap-4 mb-5">
            {scorecard.components.map(comp => (
              <div key={comp.name} className={`bg-slate-950 border ${COMPONENT_BORDER[comp.grade]} rounded-xl p-4`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-taupe-400 text-xs font-bold uppercase tracking-wider">{comp.name}</span>
                  <span className={`${COMPONENT_GRADE_COLORS[comp.grade]} text-2xl font-black`}>{comp.grade}</span>
                </div>
                <p className="text-slate-500 text-xs mb-3">Weight: {Math.round(comp.weight * 100)}%</p>
                <div className="space-y-1 text-xs mb-3">
                  <div className="flex justify-between"><span className="text-slate-500">Metric</span><span className={COMPONENT_GRADE_COLORS[comp.grade]}>{Math.round(comp.metric_value * 100)}%</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Detail</span><span className="text-slate-400">{comp.metric_label}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Range for {comp.grade}</span><span className="text-slate-500">{comp.score_range}</span></div>
                </div>
                {/* Position bar */}
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  {['A', 'B', 'C', 'D', 'F'].map(g => (
                    <span key={g} className={g === comp.grade ? `${COMPONENT_GRADE_COLORS[comp.grade]} font-bold` : ''}>{g}{g === comp.grade ? ' ◀' : ''}</span>
                  ))}
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    {['#4ade80', '#86efac', '#fb923c', '#f87171', '#ef4444'].map((color, i) => (
                      <div key={i} className="flex-1" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="h-1.5 relative">
                  <div className="absolute border-l-2 border-current h-2" style={{ left: `${POSITION_PCT[comp.grade]}%`, color: COMPONENT_GRADE_COLORS[comp.grade] }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 rounded-lg px-4 py-3 text-xs text-slate-400">
            <span className="text-slate-500">How </span>
            <span className={`${gradeColor} font-bold`}>{scorecard.final_grade}</span>
            <span className="text-slate-500"> is calculated: </span>
            {scorecard.components.map((c, i) => (
              <span key={c.name}>
                ({c.name.split(' ')[0]} <span className={COMPONENT_GRADE_COLORS[c.grade]}>{c.grade}</span> × {Math.round(c.weight * 100)}%){i < 2 ? ' + ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
