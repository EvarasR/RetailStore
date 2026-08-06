import { postForm, getJSON } from './http';
import type { WishlistResponse, ToggleWishlistResult } from '../types/wishlist.types';
import type { ProductItem } from './products.api';

/**
 * Agrega o elimina un producto de favoritos/wishlist en PostgreSQL llamando a /api/favoritos/toggle/
 * @param cod_producto ID único del producto
 */
export async function toggleWishlist(cod_producto: number | string): Promise<ToggleWishlistResult> {
  try {
    const res = await postForm<{ ok?: boolean; mensaje?: string; favorito?: boolean }>('/api/favoritos/toggle/', {
      cod_producto,
    });
    return {
      ok: Boolean(res?.ok !== false),
      mensaje: String(res?.mensaje || 'Favorito actualizado.'),
      favorito: Boolean(res?.favorito),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'No se pudo actualizar la lista de favoritos.';
    throw new Error(msg);
  }
}

/**
 * Consulta la lista de productos favoritos del usuario autenticado.
 */
export async function fetchWishlist(): Promise<ProductItem[]> {
  const res = await getJSON<WishlistResponse>('/api/favoritos/');
  return res.favoritos || [];
}
