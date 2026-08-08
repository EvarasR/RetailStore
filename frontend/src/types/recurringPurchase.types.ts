export interface RecurringProductItem { cod_producto: number; producto: string; cantidad: number; precio: string; }
export interface RecurringPurchaseItem {
  cod_compra: number;
  nombre: string;
  frecuencia_dias: number;
  proxima_ejecucion: string;
  activa: boolean;
  productos: RecurringProductItem[];
}
export interface RecurringPurchasesResponse { ok: boolean; habilitado: boolean; compras: RecurringPurchaseItem[]; }
