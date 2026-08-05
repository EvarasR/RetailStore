import type { ProductItem } from '../api/products.api';

export interface WishlistResponse {
  ok: boolean;
  favoritos: ProductItem[];
}

export interface ToggleWishlistResult {
  ok: boolean;
  mensaje: string;
  favorito: boolean;
}
