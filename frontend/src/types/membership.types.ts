export interface MembershipBenefit {
  codigo: string;
  nombre: string;
  descripcion: string;
  valor?: string | null;
}

export interface MembershipPlan {
  cod_plan: string;
  nombre: string;
  precio_mensual: string;
  duracion_dias: number;
  beneficios: MembershipBenefit[];
}

export interface MembershipActive {
  activa: boolean;
  cod_membresia: number | null;
  plan: string | null;
  cod_plan: string | null;
  estado: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  renovacion_automatica: boolean;
}

export interface MembershipHistoryItem {
  cod_membresia: number;
  plan: string;
  estado: string;
  inicio: string;
  fin: string;
  renovacion_automatica: boolean;
}

export interface MembershipPaymentItem {
  cod_pago: number;
  monto: string;
  fecha: string;
  cod_membresia: number;
}

export interface MembershipResponse {
  ok: boolean;
  membresia: MembershipActive;
  planes: MembershipPlan[];
  historial: MembershipHistoryItem[];
  pagos: MembershipPaymentItem[];
}

export interface PaymentMethodItem {
  cod_metodo_pago: number;
  tipo: string;
  marca: string;
  bin6?: string;
  ultimos4: string;
  titular: string;
  exp_mes?: number;
  exp_anio?: number;
  saldo_disponible?: string | null;
  bloqueada?: boolean;
}

export interface PaymentMethodsResponse {
  ok: boolean;
  metodos: PaymentMethodItem[];
}
