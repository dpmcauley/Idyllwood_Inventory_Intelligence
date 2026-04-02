import type {
  InventoryRow, InventoryItem, VendorReorderGroup, VendorOverstockGroup,
  CategoryBreakdown, Grade, FinalGrade, ReorderSeverity, OverstockSeverity, OverstockAction,
} from '../types'

const GRADE_SCORES: Record<Grade, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 }

export function calculateItem(row: InventoryRow, carryingRate: number): InventoryItem {
  const available = Math.max(0, row.on_hand - row.committed)
  const rawNeed = row.reorder_point - available - row.on_order
  const net_need = Math.max(0, rawNeed)
  const suggest_qty = net_need
  const is_dead_stock = row.avg_monthly_sales === 0

  const months_supply = is_dead_stock
    ? null
    : row.on_hand / row.avg_monthly_sales

  const monthly_carrying_cost = row.on_hand * row.unit_cost * (carryingRate / 12)

  const reorder_severity = classifyReorderSeverity(row, available, net_need, is_dead_stock)
  const overstock_severity = classifyOverstockSeverity(months_supply, is_dead_stock, row.on_hand)
  const overstock_action = classifyOverstockAction(months_supply, is_dead_stock)

  return {
    ...row,
    available,
    net_need,
    suggest_qty,
    months_supply,
    monthly_carrying_cost,
    is_dead_stock,
    reorder_severity,
    overstock_severity,
    overstock_action,
    ai_rationale: null,
  }
}

export function classifyReorderSeverity(
  row: InventoryRow,
  available: number,
  net_need: number,
  is_dead_stock: boolean
): ReorderSeverity | null {
  if (is_dead_stock || net_need === 0) return null
  if (available <= 0) return 'critical'
  const days_until_stockout = (available / row.avg_monthly_sales) * 30
  if (days_until_stockout <= 7) return 'high'
  return 'monitor'
}

export function classifyOverstockSeverity(
  months_supply: number | null,
  is_dead_stock: boolean,
  on_hand: number
): OverstockSeverity | null {
  if (is_dead_stock && on_hand > 0) return 'high'
  if (months_supply === null) return null
  if (months_supply > 18) return 'high'
  if (months_supply > 6) return 'watch'
  return null
}

export function classifyOverstockAction(
  months_supply: number | null,
  is_dead_stock: boolean
): OverstockAction | null {
  if (is_dead_stock) return 'dead_stock'
  if (months_supply === null) return null
  if (months_supply > 18) return 'return_negotiate'
  if (months_supply > 9) return 'markdown'
  if (months_supply > 6) return 'watch'
  return null
}

export function gradeReorderHealth(pct: number): Grade {
  if (pct <= 0.05) return 'A'
  if (pct <= 0.15) return 'B'
  if (pct <= 0.30) return 'C'
  if (pct <= 0.50) return 'D'
  return 'F'
}

export function gradeOverstockHealth(pct: number): Grade {
  if (pct <= 0.05) return 'A'
  if (pct <= 0.15) return 'B'
  if (pct <= 0.25) return 'C'
  if (pct <= 0.40) return 'D'
  return 'F'
}

export function gradeCatalogHealth(pct: number): Grade {
  if (pct > 0.85) return 'A'
  if (pct > 0.70) return 'B'
  if (pct > 0.55) return 'C'
  if (pct > 0.40) return 'D'
  return 'F'
}

export function computeFinalGrade(
  reorderGrade: Grade,
  overstockGrade: Grade,
  catalogGrade: Grade
): FinalGrade {
  const rawScore =
    GRADE_SCORES[reorderGrade] * 0.35 +
    GRADE_SCORES[overstockGrade] * 0.35 +
    GRADE_SCORES[catalogGrade] * 0.30
  // Round to 4 decimal places to avoid floating-point drift (e.g. 3*0.35+3*0.35+3*0.30 = 2.9999…)
  const score = Math.round(rawScore * 10000) / 10000

  if (score >= 3.7) return 'A'
  if (score >= 3.3) return 'A-'
  if (score >= 3.0) return 'B+'
  if (score >= 2.7) return 'B'
  if (score >= 2.3) return 'B-'
  if (score >= 2.0) return 'C+'
  if (score >= 1.7) return 'C'
  if (score >= 1.3) return 'C-'
  if (score >= 1.0) return 'D+'
  if (score >= 0.7) return 'D'
  return 'F'
}

export function buildReorderGroups(items: InventoryItem[]): VendorReorderGroup[] {
  const flagged = items.filter(i => i.reorder_severity !== null)
  const byVendor = new Map<string, InventoryItem[]>()
  flagged.forEach(item => {
    const existing = byVendor.get(item.vendor_id) ?? []
    byVendor.set(item.vendor_id, [...existing, item])
  })

  const severityOrder: ReorderSeverity[] = ['critical', 'high', 'monitor']

  return Array.from(byVendor.entries())
    .map(([vendor_id, vendorItems]) => {
      const worst = vendorItems.reduce<ReorderSeverity>((acc, item) => {
        if (!item.reorder_severity) return acc
        return severityOrder.indexOf(item.reorder_severity) < severityOrder.indexOf(acc)
          ? item.reorder_severity
          : acc
      }, 'monitor')

      return {
        vendor_id,
        vendor_name: vendorItems[0].vendor_name,
        worst_severity: worst,
        items: vendorItems,
        suggested_po: vendorItems.reduce((sum, i) => sum + i.suggest_qty * i.unit_cost, 0),
      }
    })
    .sort((a, b) => severityOrder.indexOf(a.worst_severity) - severityOrder.indexOf(b.worst_severity))
}

export function buildOverstockGroups(items: InventoryItem[], carryingRate: number): VendorOverstockGroup[] {
  const flagged = items.filter(i => i.overstock_severity !== null)
  const byVendor = new Map<string, InventoryItem[]>()
  flagged.forEach(item => {
    const existing = byVendor.get(item.vendor_id) ?? []
    byVendor.set(item.vendor_id, [...existing, item])
  })

  const severityOrder: OverstockSeverity[] = ['high', 'watch']

  return Array.from(byVendor.entries())
    .map(([vendor_id, vendorItems]) => {
      const worst = vendorItems.reduce<OverstockSeverity>((acc, item) => {
        if (!item.overstock_severity) return acc
        return severityOrder.indexOf(item.overstock_severity) < severityOrder.indexOf(acc)
          ? item.overstock_severity
          : acc
      }, 'watch')

      return {
        vendor_id,
        vendor_name: vendorItems[0].vendor_name,
        worst_severity: worst,
        items: vendorItems,
        capital_tied_up: vendorItems.reduce((sum, i) => sum + i.on_hand * i.unit_cost, 0),
        monthly_carrying_cost: vendorItems.reduce((sum, i) => sum + i.monthly_carrying_cost, 0),
      }
    })
    .sort((a, b) => severityOrder.indexOf(a.worst_severity) - severityOrder.indexOf(b.worst_severity))
}

export function buildCategoryBreakdown(items: InventoryItem[]): CategoryBreakdown[] {
  const byCategory = new Map<string, InventoryItem[]>()
  items.forEach(item => {
    const existing = byCategory.get(item.category) ?? []
    byCategory.set(item.category, [...existing, item])
  })

  return Array.from(byCategory.entries()).map(([category, catItems]) => {
    const total = catItems.length
    const critical = catItems.filter(i => i.reorder_severity === 'critical' || i.overstock_severity === 'high').length
    const reorder = catItems.filter(i => i.reorder_severity === 'high' || i.reorder_severity === 'monitor').length
    const monitor = catItems.filter(i => i.overstock_severity === 'watch').length
    const healthy = total - critical - reorder - monitor

    const worstStatus = critical > 0 ? 'critical'
      : reorder > 0 ? 'reorder'
      : monitor > 0 ? 'monitor'
      : 'healthy'

    return {
      category,
      sku_count: total,
      healthy_pct: healthy / total,
      monitor_pct: monitor / total,
      reorder_pct: reorder / total,
      critical_pct: critical / total,
      worst_status: worstStatus,
    }
  })
}
