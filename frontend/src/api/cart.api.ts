import { postForm, getJSON } from './http';
import type { CartData, CartValidationResult } from '../types/cart.types';

export interface AddToCartResult {
  ok: boolean;
  mensaje: string;
  cod_carrito_detalle?: number;
}

/**
 * Agrega producto al carrito en PostgreSQL invocando el endpoint oficial de Django (DB-First).
 */
export async function addToCart(cod_producto: number | string, cantidad: number = 1): Promise<AddToCartResult> {
  try {
    const res = await postForm<any>('/api/carrito/agregar/', {
      cod_producto,
      cantidad,
    });
    return {
      ok: Boolean(res?.ok !== false),
      mensaje: String(res?.mensaje || 'Producto agregado al carrito.'),
      cod_carrito_detalle: res?.cod_carrito_detalle ? Number(res.cod_carrito_detalle) : undefined,
    };
  } catch (err: any) {
    const msg = err?.message || 'No se pudo agregar el producto al carrito.';
    throw new Error(msg);
  }
}

/**
 * Actualiza la cantidad de un ítem en el carrito vía POST de Django.
 */
export async function updateCartQuantity(cod_producto: number | string, cantidad: number): Promise<{ ok: boolean; mensaje: string }> {
  try {
    const res = await postForm<any>('/api/carrito/actualizar/', {
      cod_producto,
      cantidad,
    });
    return {
      ok: Boolean(res?.ok !== false),
      mensaje: String(res?.mensaje || 'Cantidad actualizada.'),
    };
  } catch (err: any) {
    const msg = err?.message || 'No se pudo actualizar la cantidad en el carrito.';
    throw new Error(msg);
  }
}

/**
 * Elimina un producto del carrito en PostgreSQL.
 */
export async function removeFromCart(cod_producto: number | string): Promise<{ ok: boolean; mensaje: string }> {
  try {
    const res = await postForm<any>('/api/carrito/eliminar/', {
      cod_producto,
    });
    return {
      ok: Boolean(res?.ok !== false),
      mensaje: String(res?.mensaje || 'Producto eliminado.'),
    };
  } catch (err: any) {
    const msg = err?.message || 'No se pudo eliminar el producto del carrito.';
    throw new Error(msg);
  }
}

/**
 * Consulta el estado actual del carrito oficial DB-First en /api/carrito/.
 */
export async function fetchCart(): Promise<CartData> {
  return getJSON<CartData>('/api/carrito/');
}

/**
 * Valida si el carrito cumple condiciones (stock, reglas DB) vía GET /api/carrito/validar/.
 */
export async function validateCart(): Promise<CartValidationResult> {
  return getJSON<CartValidationResult>('/api/carrito/validar/');
}
