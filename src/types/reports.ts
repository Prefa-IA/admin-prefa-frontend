export interface Informe {
  _id: string;
  direccionCompleta?: string;
  pdfUrl?: string;
  estado: string;
  createdAt: string;
  usuario?: { nombre: string; email: string };
}

