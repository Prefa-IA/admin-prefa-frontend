export interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  isActive: boolean;
  role: string;
  isSuperAdmin?: boolean;
  suscripcion?: {
    tipo?: string;
    plan?: string;
    nombrePlan?: string;
    fechaInicio?: string;
    fechaFin?: string;
    suscripcionInterna?: boolean;
  };
  consultasDisponibles?: number;
  creditBalance?: number;
  credits?: {
    fromSubscription?: number;
    fromOverages?: number;
    total?: number;
  };
}
