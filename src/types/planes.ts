export interface Plan {
  id: string;
  name: string;
  price: number;
  creditosTotales?: number;
  freeCredits?: number;
  permiteCompuestas?: boolean;
  watermarkOrg?: boolean;
  watermarkPrefas?: boolean;
  discountPct?: number;
  discountUntil?: string | null;
  prioridad?: number;
  isOverage?: boolean;
  parentPlan?: string | null;
  maxPrefactibilidades?: number;
  tag?: string | { _id: string; name: string; slug: string };
  showDiscountSticker?: boolean;
}
