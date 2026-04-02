import React, { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { ModeToggle } from './components/ModeToggle'
import { ViewTabs, type ViewTab } from './components/ViewTabs'
import { DataWarningBanner } from './components/DataWarningBanner'
import { SAMPLE_RESULT } from './data/sampleData'
import { parseInventoryCsv } from './services/csvParser'
import { enrichWithAi } from './services/geminiService'
import type { AnalysisResult } from './types'
import { ExportButtons } from './components/ExportButtons'
import { Footer } from './components/Footer'
import { ReorderView } from './components/reorder/ReorderView'
import { OverstockView } from './components/overstock/OverstockView'
import { ScorecardView } from './components/scorecard/ScorecardView'

const DEFAULT_CARRYING_RATE = 0.25

export default function App() {
  const [result, setResult] = useState<AnalysisResult>(SAMPLE_RESULT)
  const [mode, setMode] = useState<'demo' | 'upload'>('demo')
  const [activeTab, setActiveTab] = useState<ViewTab>('reorder')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [carryingRate, setCarryingRate] = useState(DEFAULT_CARRYING_RATE)

  const handleDemo = useCallback(() => {
    setMode('demo')
    setResult(SAMPLE_RESULT)
    setError(null)
  }, [])

  const handleUpload = useCallback((file: File) => {
    setIsLoading(true)
    setError(null)
    parseInventoryCsv(
      file,
      carryingRate,
      async (parsed) => {
        try {
          const enriched = await enrichWithAi(parsed)
          setResult(enriched)
          setMode('upload')
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Analysis failed.')
          setResult(parsed) // show what we have even without AI
          setMode('upload')
        } finally {
          setIsLoading(false)
        }
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      }
    )
  }, [carryingRate])

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Header />

      {/* Top bar */}
      <div className="pt-14 bg-slate-900 border-b border-white/7">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-end items-center">
          <div className="flex items-center gap-3">
            <ExportButtons result={result} />
            <ModeToggle mode={mode} onDemo={handleDemo} onUpload={handleUpload} isLoading={isLoading} />
          </div>
        </div>
      </div>

      <ViewTabs active={activeTab} onChange={setActiveTab} />
      <DataWarningBanner warnings={result.warnings} />

      {error !== null && (
        <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'reorder' && <ReorderView result={result} />}
        {activeTab === 'overstock' && (
          <OverstockView
            result={result}
            carryingRate={carryingRate}
            onCarryingRateChange={setCarryingRate}
          />
        )}
        {activeTab === 'scorecard' && (
          <ScorecardView
            result={result}
            onNavigate={(tab, _vendorId) => setActiveTab(tab)}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}
