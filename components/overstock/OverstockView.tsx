import React, { useState } from 'react'
import { OverstockSummaryChips } from './OverstockSummaryChips'
import { VendorOverstockCard } from './VendorOverstockCard'
import { CarryingRateBar } from './CarryingRateBar'
import { VendorFilter } from '../VendorFilter'
import type { AnalysisResult } from '../../types'

interface Props { result: AnalysisResult; carryingRate: number; onCarryingRateChange: (r: number) => void }

export const OverstockView: React.FC<Props> = ({ result, carryingRate, onCarryingRateChange }) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)
  const visible = selectedVendor
    ? result.overstock_groups.filter(g => g.vendor_id === selectedVendor)
    : result.overstock_groups

  if (result.overstock_groups.length === 0) {
    return <p className="text-slate-500 text-center py-16">No overstock risk detected.</p>
  }

  return (
    <div>
      <OverstockSummaryChips result={result} />
      <CarryingRateBar rate={carryingRate} onChange={onCarryingRateChange} />
      <VendorFilter
        vendors={result.overstock_groups.map(g => ({ vendor_id: g.vendor_id, vendor_name: g.vendor_name, severity: g.worst_severity }))}
        selected={selectedVendor}
        onChange={setSelectedVendor}
      />
      {visible.map(g => <VendorOverstockCard key={g.vendor_id} group={g} carryingRate={carryingRate} />)}
    </div>
  )
}
