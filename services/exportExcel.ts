import * as XLSX from 'xlsx'
import type { AnalysisResult } from '../types'

export function exportToExcel(result: AnalysisResult): void {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ['Inventory Intelligence Report', ''],
    ['Generated', new Date(result.analyzed_at).toLocaleDateString('en-CA')],
    ['Source', result.source === 'demo' ? 'Sample Data' : result.filename ?? 'Upload'],
    [],
    ['Overall Grade', result.scorecard.final_grade],
    ['Total Inventory Value', result.scorecard.total_inventory_value],
    ['Capital at Risk', result.scorecard.capital_at_risk],
    ['Monthly Carrying Cost', result.scorecard.total_monthly_carrying_cost],
    ['Suggested Reorder Spend', result.scorecard.suggested_reorder_spend],
    ['Healthy SKUs', result.scorecard.healthy_sku_count],
    ['Total Vendors', result.scorecard.vendor_count],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary')

  // Reorder Alerts sheet
  const reorderHeaders = ['SKU', 'Product', 'Category', 'Vendor ID', 'Vendor Name', 'On Hand', 'On Order', 'Committed', 'Avg Monthly Sales', 'Suggest Qty', 'Unit Cost', 'Lead Time Days', 'Reorder Point', 'Severity']
  const reorderRows = result.reorder_groups.flatMap(g =>
    g.items.map(i => [i.sku, i.product_name, i.category, i.vendor_id, i.vendor_name, i.on_hand, i.on_order, i.committed, i.avg_monthly_sales, i.suggest_qty, i.unit_cost, i.lead_time_days, i.reorder_point, i.reorder_severity])
  )
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([reorderHeaders, ...reorderRows]), 'Reorder Alerts')

  // Overstock Risk sheet
  const overstockHeaders = ['SKU', 'Product', 'Category', 'Vendor ID', 'Vendor Name', 'On Hand', 'Avg Monthly Sales', 'Months Supply', 'Unit Cost', 'Monthly Carrying Cost', 'Action', 'Severity', 'Lead Time Days', 'Reorder Point']
  const overstockRows = result.overstock_groups.flatMap(g =>
    g.items.map(i => [i.sku, i.product_name, i.category, i.vendor_id, i.vendor_name, i.on_hand, i.avg_monthly_sales, i.months_supply ?? 'Dead Stock', i.unit_cost, i.monthly_carrying_cost, i.overstock_action ?? '—', i.overstock_severity, i.lead_time_days, i.reorder_point])
  )
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([overstockHeaders, ...overstockRows]), 'Overstock Risk')

  XLSX.writeFile(wb, `inventory-intelligence-${new Date().toISOString().slice(0, 10)}.xlsx`)
}
