export interface AdminPrimePlan {
  cod_plan: number;
  codigo: string;
  nombre: string;
  precio: string;
  duracion_dias: number;
  activo: boolean;
}

export interface AdminPrimeBenefit {
  cod_beneficio: number;
  plan: string;
  codigo: string;
  nombre: string;
  valor: string;
  descripcion: string;
  activo: boolean;
}

export interface AdminPrimeMembership {
  cod_membresia: number;
  usuario: string;
  plan: string;
  estado: string;
  inicio: string;
  fin: string;
}

export interface AdminPrimeUsage {
  cod_uso_beneficio: number;
  usuario: string;
  beneficio: string;
  pedido: number;
  valor: string;
  fecha: string;
}

export interface AdminPrimeResponse {
  planes: AdminPrimePlan[];
  beneficios: AdminPrimeBenefit[];
  membresias: AdminPrimeMembership[];
  usos: AdminPrimeUsage[];
}
