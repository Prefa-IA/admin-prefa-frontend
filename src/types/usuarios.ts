export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  isActive: boolean;
  role: string;
  suscripcion?: { tipo: string };
  consultasDisponibles?: number;
}

