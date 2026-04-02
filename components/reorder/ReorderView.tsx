import React, { useState } from 'react'
import { ReorderSummaryChips } from './ReorderSummaryChips'
import { VendorReorderCard } from './VendorReorderCard'
import { VendorFilter } from '../VendorFilter'
import type { AnalysisResult } from '../../types'

export const ReorderView: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)

  const visibleGroups = selectedVendor
    ? result.reorder_groups.filter(g => g.vendor_id === selectedVendor)
    : result.reorder_groups

  if (result.reorder_groups.length === 0) {
    return <p className="text-slate-500 text-center py-16">No reorder alerts. Inventory looks healthy.</p>
  }

  return (
    <div>
      <ReorderSummaryChips result={result} />
      <VendorFilter
        vendors={result.reorder_groups.map(g => ({ vendor_id: g.vendor_id, vendor_name: g.vendor_name, severity: g.worst_severity }))}
        selected={selectedVendor}
        onChange={setSelectedVendor}
      />
      {visibleGroups.map(group => <VendorReorderCard key={group.vendor_id} group={group} />)}
    </div>
  )
}
