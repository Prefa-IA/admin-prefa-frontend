export interface Informe {
  _id: string;
  direccionCompleta?: string;
  direccionesNormalizadas?: Array<{ direccion?: string }>;
  pdfUrl?: string;
  estado: string;
  createdAt: string;
  tipoPrefa?: string;
  basicSearch?: boolean;
  fueDescargado?: boolean;
  usuario?: { nombre: string; email: string; _id?: string };
}
