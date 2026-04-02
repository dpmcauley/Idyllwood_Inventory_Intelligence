// Raw CSV row — maps 1:1 to CSV columns
export interface InventoryRow {
  sku: string;
  product_name: string;
  category: string;
  vendor_id: string;
  vendor_name: string;
  on_hand: number;
  on_order: number;
  committed: number;
  avg_monthly_sales: number;
  unit_cost: number;
  lead_time_days: number;
  reorder_point: number;
}

export type ReorderSeverity = 'critical' | 'high' | 'monitor';
export type OverstockSeverity = 'high' | 'watch';
export type OverstockAction = 'return_negotiate' | 'markdown' | 'watch' | 'dead_stock';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
export type FinalGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'F';

// Calculated item — InventoryRow + derived fields
export interface InventoryItem extends InventoryRow {
  available: number;           // on_hand - committed
  net_need: number;            // reorder_point - available - on_order (clamped >= 0)
  suggest_qty: number;         // net_need (0 if no reorder needed)
  months_supply: number | null; // null if avg_monthly_sales === 0 (dead stock)
  monthly_carrying_cost: number; // recalculated when carrying_rate changes
  is_dead_stock: boolean;
  reorder_severity: ReorderSeverity | null;
  overstock_severity: OverstockSeverity | null;
  overstock_action: OverstockAction | null;
  // Filled by AI in Live Mode, pre-crafted in Demo Mode
  ai_rationale: string | null;
}

export interface VendorReorderGroup {
  vendor_id: string;
  vendor_name: string;
  worst_severity: ReorderSeverity;
  items: InventoryItem[];
  suggested_po: number; // sum(suggest_qty * unit_cost)
}

export interface VendorOverstockGroup {
  vendor_id: string;
  vendor_name: string;
  worst_severity: OverstockSeverity;
  items: InventoryItem[];
  capital_tied_up: number; // sum(on_hand * unit_cost)
  monthly_carrying_cost: number;
}

export interface GradeComponent {
  name: string;
  weight: number;
  metric_value: number; // decimal e.g. 0.24 = 24%
  metric_label: string; // e.g. "24% of SKUs critical/high"
  grade: Grade;
  score_range: string; // e.g. "16-30%"
}

export interface CategoryBreakdown {
  category: string;
  sku_count: number;
  healthy_pct: number;
  monitor_pct: number;
  reorder_pct: number;
  critical_pct: number;
  worst_status: 'healthy' | 'monitor' | 'reorder' | 'critical';
}

export interface TopAction {
  type: 'reorder' | 'overstock';
  severity: 'critical' | 'high';
  vendor_name: string;
  vendor_id: string;
  text: string; // AI-generated one-liner
}

export interface DataWarning {
  type: 'missing_avg_monthly_sales' | 'missing_on_order';
  sku_count: number;
  message: string;
}

export interface AnalysisResult {
  items: InventoryItem[];
  reorder_groups: VendorReorderGroup[];
  overstock_groups: VendorOverstockGroup[];
  scorecard: {
    final_grade: FinalGrade;
    grade_summary: string;
    components: [GradeComponent, GradeComponent, GradeComponent];
    total_inventory_value: number;
    healthy_sku_count: number;
    healthy_sku_pct: number;
    capital_at_risk: number;
    total_monthly_carrying_cost: number;
    suggested_reorder_spend: number;
    vendor_count: number;
    category_breakdown: CategoryBreakdown[];
    top_actions: TopAction[];
  };
  warnings: DataWarning[];
  source: 'demo' | 'upload';
  filename?: string;
  analyzed_at: string; // ISO date string
}

// Partial AI response from /api/analyze
export interface AiQualitativeOutput {
  items: Array<{
    sku: string;
    ai_rationale: string;
    overstock_action?: OverstockAction;
  }>;
  top_actions: TopAction[];
  grade_summary: string;
}
