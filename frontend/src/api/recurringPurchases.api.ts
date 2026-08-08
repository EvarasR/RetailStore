import { getJSON, postForm } from './http';
import type { RecurringPurchasesResponse } from '../types/recurringPurchase.types';

export const fetchRecurringPurchases = () => getJSON<RecurringPurchasesResponse>('/api/compras-recurrentes/');
export const createRecurringPurchase = (values: Record<string, unknown>) => postForm<{ mensaje?: string }>('/api/compras-recurrentes/crear/', values);
export const updateRecurringPurchase = (id: number, values: Record<string, unknown>) => postForm<{ mensaje?: string }>(`/api/compras-recurrentes/${id}/actualizar/`, values);
export const addRecurringProduct = (id: number, values: Record<string, unknown>) => postForm<{ mensaje?: string }>(`/api/compras-recurrentes/${id}/productos/`, values);
export const executeRecurringPurchase = (id: number) => postForm<{ mensaje?: string; cod_carrito?: number }>(`/api/compras-recurrentes/${id}/ejecutar/`, {});
