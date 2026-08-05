import { useState, useEffect, useCallback } from 'react';
import { fetchCart, updateCartQuantity, removeFromCart, validateCart, addToCart } from '../api/cart.api';
import type { CartData, CartValidationResult } from '../types/cart.types';
import { useAuth } from './useAuth';

export function useCart() {
  const { autenticado: isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [validating, setValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<CartValidationResult | null>(null);

  const loadCart = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCart();
      setCart(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el carrito';
      setError(msg);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleUpdateQuantity = async (cod_producto: number, cantidad: number) => {
    try {
      setUpdatingId(cod_producto);
      setError(null);
      await updateCartQuantity(cod_producto, cantidad);
      await loadCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar cantidad';
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (cod_producto: number) => {
    try {
      setUpdatingId(cod_producto);
      setError(null);
      await removeFromCart(cod_producto);
      await loadCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar producto';
      setError(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddToCart = async (cod_producto: number, cantidad: number = 1) => {
    try {
      setError(null);
      await addToCart(cod_producto, cantidad);
      await loadCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar producto';
      setError(msg);
      throw err;
    }
  };

  const handleValidateCart = async (): Promise<CartValidationResult> => {
    try {
      setValidating(true);
      setError(null);
      const res = await validateCart();
      setValidationResult(res);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo validar el carrito';
      setError(msg);
      const errRes: CartValidationResult = { ok: false, resultado: { valido: false, mensajes: [msg] } };
      setValidationResult(errRes);
      return errRes;
    } finally {
      setValidating(false);
    }
  };

  return {
    cart,
    loading,
    error,
    updatingId,
    validating,
    validationResult,
    refreshCart: loadCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    addToCart: handleAddToCart,
    validate: handleValidateCart,
  };
}
