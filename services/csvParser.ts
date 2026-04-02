import Papa from 'papaparse'
import {
  calculateItem,
  buildReorderGroups,
  buildOverstockGroups,
  buildCategoryBreakdown,
  gradeReorderHealth,
  gradeOverstockHealth,
  gradeCatalogHealth,
  computeFinalGrade,
} from './calculations'
import type { InventoryRow, InventoryItem, AnalysisResult, DataWarning } from '../types'

const REQUIRED_COLUMNS = ['sku', 'product_name', 'category', 'vendor_name', 'on_hand', 'unit_cost', 'reorder_point'] as const

export interface ParseError {
  type: 'missing_columns' | 'empty_file' | 'parse_error'
  message: string
  missing?: string[]
}

export function parseInventoryCsv(
  file: File,
  carryingRate: number,
  onSuccess: (result: AnalysisResult) => void,
  onError: (err: ParseError) => void
): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(results) {
      if (results.data.length === 0) {
        return onError({ type: 'empty_file', message: 'The CSV file contains no data rows.' })
      }

      if (results.data.length > 500) {
        return onError({ type: 'parse_error', message: 'CSV exceeds 500 row limit. Trim to your top SKUs.' })
      }

      const headers = Object.keys(results.data[0] as object).map(h => h.toLowerCase().trim())
      const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col))
      if (missing.length > 0) {
        return onError({ type: 'missing_columns', message: 'Missing required columns.', missing })
      }

      const rows = (results.data as Record<string, string>[]).map(raw => normalizeRow(raw))
      onSuccess(buildAnalysisResult(rows, carryingRate, file.name))
    },
    error(err) {
      onError({ type: 'parse_error', message: err.message })
    },
  })
}

function normalizeRow(raw: Record<string, string>): InventoryRow {
  const lower = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase().trim(), v.trim()]))
  return {
    sku: lower['sku'] ?? '',
    product_name: lower['product_name'] ?? '',
    category: lower['category'] ?? 'Uncategorized',
    vendor_id: lower['vendor_id'] ?? 'V000000',
    vendor_name: lower['vendor_name'] ?? 'Unknown Vendor',
    on_hand: parseFloat(lower['on_hand']) || 0,
    on_order: parseFloat(lower['on_order']) || 0,
    committed: parseFloat(lower['committed']) || 0,
    avg_monthly_sales: parseFloat(lower['avg_monthly_sales']) || 0,
    unit_cost: parseFloat(lower['unit_cost']) || 0,
    lead_time_days: parseFloat(lower['lead_time_days']) || 14,
    reorder_point: parseFloat(lower['reorder_point']) || 0,
  }
}

function buildAnalysisResult(rows: InventoryRow[], carryingRate: number, filename: string): AnalysisResult {
  const warnings: DataWarning[] = []

  const missingVelocity = rows.filter(r => !r.avg_monthly_sales).length
  if (missingVelocity > 0) {
    warnings.push({
      type: 'missing_avg_monthly_sales',
      sku_count: missingVelocity,
      message: `No sales velocity data for ${missingVelocity} SKU${missingVelocity > 1 ? 's' : ''}. Add an avg_monthly_sales column (units sold last 90 days ÷ 3), or upload a sales history CSV.`,
    })
  }

  const hasOnOrder = rows.some(r => r.on_order > 0)
  if (!hasOnOrder) {
    warnings.push({
      type: 'missing_on_order',
      sku_count: 0,
      message: 'No open PO data found. Suggested quantities assume no incoming stock.',
    })
  }

  const items: InventoryItem[] = rows.map(r => calculateItem(r, carryingRate))

  const reorder_groups = buildReorderGroups(items)
  const overstock_groups = buildOverstockGroups(items, carryingRate)
  const category_breakdown = buildCategoryBreakdown(items)

  const totalValue = items.reduce((s, i) => s + i.on_hand * i.unit_cost, 0)
  const healthyItems = items.filter(i => !i.reorder_severity && !i.overstock_severity)
  const overstockItems = items.filter(i => i.overstock_severity)
  const reorderCriticalHigh = items.filter(i => i.reorder_severity === 'critical' || i.reorder_severity === 'high')
  const capitalAtRisk = overstockItems.reduce((s, i) => s + i.on_hand * i.unit_cost, 0)
  const monthlyCarrying = overstockItems.reduce((s, i) => s + i.monthly_carrying_cost, 0)
  const reorderSpend = reorder_groups.reduce((s, g) => s + g.suggested_po, 0)

  const reorderGrade = gradeReorderHealth(reorderCriticalHigh.length / items.length)
  const overstockGrade = gradeOverstockHealth(totalValue > 0 ? capitalAtRisk / totalValue : 0)
  const catalogGrade = gradeCatalogHealth(healthyItems.length / items.length)
  const finalGrade = computeFinalGrade(reorderGrade, overstockGrade, catalogGrade)

  const vendorIds = new Set(items.map(i => i.vendor_id))

  return {
    items,
    reorder_groups,
    overstock_groups,
    scorecard: {
      final_grade: finalGrade,
      grade_summary: '', // filled by AI in Live Mode
      components: [
        {
          name: 'Reorder Health', weight: 0.35,
          metric_value: reorderCriticalHigh.length / items.length,
          metric_label: `${reorderCriticalHigh.length} of ${items.length} SKUs critical or high`,
          grade: reorderGrade, score_range: scoreRange('reorder', reorderGrade),
        },
        {
          name: 'Overstock Health', weight: 0.35,
          metric_value: totalValue > 0 ? capitalAtRisk / totalValue : 0,
          metric_label: `${Math.round((totalValue > 0 ? capitalAtRisk / totalValue : 0) * 100)}% of capital at risk`,
          grade: overstockGrade, score_range: scoreRange('overstock', overstockGrade),
        },
        {
          name: 'Catalog Health', weight: 0.30,
          metric_value: healthyItems.length / items.length,
          metric_label: `${healthyItems.length} of ${items.length} SKUs healthy`,
          grade: catalogGrade, score_range: scoreRange('catalog', catalogGrade),
        },
      ],
      total_inventory_value: totalValue,
      healthy_sku_count: healthyItems.length,
      healthy_sku_pct: healthyItems.length / items.length,
      capital_at_risk: capitalAtRisk,
      total_monthly_carrying_cost: monthlyCarrying,
      suggested_reorder_spend: reorderSpend,
      vendor_count: vendorIds.size,
      category_breakdown,
      top_actions: [], // filled by AI in Live Mode
    },
    warnings,
    source: 'upload',
    filename,
    analyzed_at: new Date().toISOString(),
  }
}

function scoreRange(component: 'reorder' | 'overstock' | 'catalog', grade: string): string {
  const ranges: Record<string, Record<string, string>> = {
    reorder: { A: '0–5%', B: '6–15%', C: '16–30%', D: '31–50%', F: '>50%' },
    overstock: { A: '0–5%', B: '6–15%', C: '16–25%', D: '26–40%', F: '>40%' },
    catalog: { A: '>85%', B: '71–85%', C: '56–70%', D: '41–55%', F: '<40%' },
  }
  return ranges[component][grade] ?? ''
}
