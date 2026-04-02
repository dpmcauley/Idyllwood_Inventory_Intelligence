import jsPDF from 'jspdf'
import type { AnalysisResult } from '../types'

const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

export function exportToPdf(result: AnalysisResult): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 15
  let y = margin

  const line = (text: string, size = 10, bold = false) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.text(text, margin, y)
    y += size * 0.5 + 2
  }

  const newPage = () => { doc.addPage(); y = margin }
  const checkPage = (needed = 20) => { if (y + needed > 280) newPage() }

  // Header
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(163, 151, 133)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('IDYLLWOOD LAB', margin, 12)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Inventory Intelligence Report', margin, 20)
  doc.setTextColor(100, 116, 139)
  doc.text(`Generated: ${new Date(result.analyzed_at).toLocaleDateString('en-CA')}  |  Source: ${result.source === 'demo' ? 'Sample Data' : result.filename ?? 'Upload'}`, margin, 26)
  y = 38

  doc.setTextColor(30, 30, 30)

  // Scorecard summary
  line('INVENTORY HEALTH SUMMARY', 13, true)
  y += 2
  line(`Overall Grade: ${result.scorecard.final_grade}`, 11, true)
  if (result.scorecard.grade_summary) line(result.scorecard.grade_summary, 9)
  y += 3
  line(`Total Inventory Value: ${fmt(result.scorecard.total_inventory_value)}`, 9)
  line(`Capital at Risk (Overstock): ${fmt(result.scorecard.capital_at_risk)}`, 9)
  line(`Monthly Carrying Cost: ${fmt(result.scorecard.total_monthly_carrying_cost)}`, 9)
  line(`Total Suggested Reorder Spend: ${fmt(result.scorecard.suggested_reorder_spend)}`, 9)
  y += 5

  // Reorder Alerts
  line('REORDER ALERTS', 13, true)
  y += 2
  result.reorder_groups.forEach(group => {
    checkPage(40)
    line(`${group.vendor_name} (${group.vendor_id})  |  Suggested PO: ${fmt(group.suggested_po)}`, 10, true)
    group.items.forEach(item => {
      checkPage(8)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `  ${item.sku}  ${item.product_name}  |  On Hand: ${item.on_hand}  On Order: ${item.on_order}  Committed: ${item.committed}  Suggest: ${item.suggest_qty}  Cost: ${fmt(item.unit_cost)}  Lead: ${item.lead_time_days}d  Reorder Pt: ${item.reorder_point}`,
        margin, y
      )
      y += 5
    })
    y += 3
  })

  // Overstock Risk
  checkPage(20)
  line('OVERSTOCK RISK', 13, true)
  y += 2
  result.overstock_groups.forEach(group => {
    checkPage(40)
    line(`${group.vendor_name} (${group.vendor_id})  |  Capital Tied Up: ${fmt(group.capital_tied_up)}`, 10, true)
    group.items.forEach(item => {
      checkPage(8)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const mos = item.is_dead_stock ? 'Dead Stock' : `${item.months_supply?.toFixed(1)} mo`
      doc.text(
        `  ${item.sku}  ${item.product_name}  |  On Hand: ${item.on_hand}  Months Supply: ${mos}  Carrying/Mo: ${fmt(item.monthly_carrying_cost)}  Action: ${item.overstock_action ?? '—'}`,
        margin, y
      )
      y += 5
    })
    y += 3
  })

  doc.save(`inventory-intelligence-${new Date().toISOString().slice(0, 10)}.pdf`)
}
