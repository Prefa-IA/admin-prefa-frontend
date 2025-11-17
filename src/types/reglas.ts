export interface Regla {
  id_regla: string;
  titulo_regla: string;
  descripcion_completa: string;
  categoria?: string;
  estado?: string;
  referencia_original?: string;
  parametros_clave?: string[];
  version_documento?: string;
  condiciones?: string;
}

export interface ReglaLogica {
  _id?: string;
  id_paso?: string;
  distrito_cpu: string;
  condicion_json: unknown;
  formula_json: unknown;
  id_cu_referencia?: string | string[];
  descripcion?: string;
  activo?: boolean;
}

export interface ReglasPageProps {
  mode: 'admin' | 'view';
  categoria?: string;
}
