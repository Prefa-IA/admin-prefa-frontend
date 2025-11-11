export interface Template {
  _id?: string;
  slug: string;
  nombre: string;
  subject: string;
  html: string;
  variables?: string[];
  description?: string;
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export type TemplateKey = 'info-prefas' | 'marketing-newsletter';

