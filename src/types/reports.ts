export interface Informe {
  _id: string;
  direccionCompleta?: string;
  pdfUrl?: string;
  estado: string;
  createdAt: string;
  tipoPrefa?: string;
  fueDescargado?: boolean;
  usuario?: { nombre: string; email: string; _id?: string };
}
