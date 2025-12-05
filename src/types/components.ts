export interface RuleSelectorRule {
  _id: string;
  id_regla: string;
  titulo_regla: string;
  categoria?: string;
}

export interface DashboardItem {
  label: string;
  count: number;
}

export interface RevenueItem {
  plan: string;
  revenue: number;
}

export interface HeatMapPoint {
  lat: number;
  lon: number;
  count: number;
}
