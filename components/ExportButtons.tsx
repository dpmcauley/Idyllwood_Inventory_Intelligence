import React from 'react'
import { FileDown, Table } from 'lucide-react'
import { exportToPdf } from '../services/exportPdf'
import { exportToExcel } from '../services/exportExcel'
import type { AnalysisResult } from '../types'

export const ExportButtons: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div className="flex gap-2">
    <button
      onClick={() => exportToPdf(result)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 border border-white/10 rounded hover:text-white hover:border-white/20 transition-colors"
    >
      <FileDown size={13} /> PDF
    </button>
    <button
      onClick={() => exportToExcel(result)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 border border-white/10 rounded hover:text-white hover:border-white/20 transition-colors"
    >
      <Table size={13} /> Excel
    </button>
  </div>
)
