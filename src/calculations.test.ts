import { describe, it, expect } from 'vitest'
import {
  calculateItem,
  classifyReorderSeverity,
  classifyOverstockSeverity,
  gradeReorderHealth,
  gradeOverstockHealth,
  gradeCatalogHealth,
  computeFinalGrade,
  buildReorderGroups,
  buildOverstockGroups,
  buildCategoryBreakdown,
} from '../services/calculations'
import type { InventoryRow, InventoryItem } from '../types'

const baseRow: InventoryRow = {
  sku: 'DS004100', product_name: 'Solara Dreadnought', category: 'Acoustic Guitars',
  vendor_id: 'V001000', vendor_name: 'Meridian Music Supply',
  on_hand: 1, on_order: 0, committed: 1, avg_monthly_sales: 3.2,
  unit_cost: 489, lead_time_days: 14, reorder_point: 4,
}

describe('calculateItem', () => {
  it('computes available as on_hand - committed', () => {
    const item = calculateItem(baseRow, 0.25)
    expect(item.available).toBe(0) // 1 - 1
  })

  it('computes net_need clamped to 0 minimum', () => {
    const item = calculateItem({ ...baseRow, on_hand: 10, committed: 0 }, 0.25)
    expect(item.net_need).toBe(0) // reorder_point(4) - available(10) - on_order(0) = -6, clamped to 0
  })

  it('computes net_need when genuinely needed', () => {
    const item = calculateItem(baseRow, 0.25)
    expect(item.net_need).toBe(4) // 4 - 0 - 0 = 4
  })

  it('marks dead stock when avg_monthly_sales is 0', () => {
    const item = calculateItem({ ...baseRow, avg_monthly_sales: 0 }, 0.25)
    expect(item.is_dead_stock).toBe(true)
    expect(item.months_supply).toBeNull()
  })

  it('computes months_supply when sales > 0', () => {
    const item = calculateItem({ ...baseRow, on_hand: 8, committed: 0, avg_monthly_sales: 2 }, 0.25)
    expect(item.months_supply).toBe(4)
  })

  it('computes monthly_carrying_cost correctly', () => {
    // 1 unit × $489 × (0.25/12) = $10.19
    const item = calculateItem(baseRow, 0.25)
    expect(item.monthly_carrying_cost).toBeCloseTo(10.19, 1)
  })
})

describe('classifyReorderSeverity', () => {
  it('returns critical when available is 0', () => {
    const item = calculateItem(baseRow, 0.25) // available=0, net_need=4
    expect(item.reorder_severity).toBe('critical')
  })

  it('returns monitor when days_until_stockout > 7', () => {
    // available=1, sales=3.2/mo → days = (1/3.2)*30 = 9.4 days > 7 → monitor
    const item = calculateItem({ ...baseRow, committed: 0 }, 0.25) // available=1
    expect(item.reorder_severity).toBe('monitor')
  })

  it('returns null when no reorder needed', () => {
    const item = calculateItem({ ...baseRow, on_hand: 10, committed: 0 }, 0.25)
    expect(item.reorder_severity).toBeNull()
  })

  it('dead stock has null reorder_severity', () => {
    const item = calculateItem({ ...baseRow, avg_monthly_sales: 0 }, 0.25)
    expect(item.reorder_severity).toBeNull()
  })
})

describe('classifyOverstockSeverity', () => {
  it('returns high when months_supply > 12', () => {
    const item = calculateItem({ ...baseRow, on_hand: 40, committed: 0, avg_monthly_sales: 3 }, 0.25)
    expect(item.overstock_severity).toBe('high')
  })

  it('returns watch when months_supply between 4 and 12', () => {
    const item = calculateItem({ ...baseRow, on_hand: 10, committed: 0, avg_monthly_sales: 2 }, 0.25)
    expect(item.months_supply).toBe(5)
    expect(item.overstock_severity).toBe('watch')
  })

  it('returns null when months_supply <= 4', () => {
    const item = calculateItem({ ...baseRow, on_hand: 4, committed: 0, avg_monthly_sales: 2 }, 0.25)
    expect(item.overstock_severity).toBeNull()
  })

  it('dead stock returns overstock severity high', () => {
    const item = calculateItem({ ...baseRow, avg_monthly_sales: 0, on_hand: 5 }, 0.25)
    expect(item.overstock_severity).toBe('high')
    expect(item.overstock_action).toBe('dead_stock')
  })
})

describe('gradeReorderHealth', () => {
  it('grades A when 0-5% critical/high', () => {
    expect(gradeReorderHealth(0.03)).toBe('A')
  })
  it('grades C when 16-30%', () => {
    expect(gradeReorderHealth(0.24)).toBe('C')
  })
  it('grades D when 31-50%', () => {
    expect(gradeReorderHealth(0.40)).toBe('D')
  })
})

describe('computeFinalGrade', () => {
  it('returns C+ when all three components are C', () => {
    // A=4, B=3, C=2, D=1, F=0
    // 2*0.35 + 2*0.35 + 2*0.30 = 2.00 → C+
    expect(computeFinalGrade('C', 'C', 'C')).toBe('C+')
  })
  it('returns B+ when all three components are B', () => {
    // 3*0.35 + 3*0.35 + 3*0.30 = 3.00 → B+
    expect(computeFinalGrade('B', 'B', 'B')).toBe('B+')
  })
})
