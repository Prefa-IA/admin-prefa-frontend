export interface AnalyticsResponse {
  activeUsers: number;
  suspendedUsers: number;
  monthlyRevenue: number;
  topMonth: { usuarioId: string; nombre: string; email: string; count: number }[];
}

export interface RevenueHistoryItem {
  label: string;
  month: number;
  year: number;
  revenue: number;
}
