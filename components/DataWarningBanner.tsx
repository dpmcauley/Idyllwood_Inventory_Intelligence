import React from 'react'
import { AlertTriangle } from 'lucide-react'
import type { DataWarning } from '../types'

export const DataWarningBanner: React.FC<{ warnings: DataWarning[] }> = ({ warnings }) => {
  if (warnings.length === 0) return null
  return (
    <div className="mx-6 mt-4 space-y-2">
      {warnings.map((w, i) => (
        <div key={i} className="flex gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
          <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-yellow-200/80 text-sm">{w.message}</p>
        </div>
      ))}
    </div>
  )
}
