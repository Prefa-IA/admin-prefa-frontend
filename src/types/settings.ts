export interface Setting {
  _id?: string;
  key: string;
  category: string;
  value: unknown;
  description?: string;
}
