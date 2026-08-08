import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, Lock, Loader2, ArrowRight } from 'lucide-react';
import { QuantitySelector } from '../ui/QuantitySelector';
import { ProductDeliveryPanel } from './ProductDeliveryPanel';
import { addToCart } from '../../api/cart.api';
import { toggleWishlist } from '../../api/wishlist.api';
import type { ProductDetail } from '../../api/products.api';

export interface ProductBuyBoxProps {
  product: ProductDetail;
  onCartAdded?: (msg: string) => void;
  onCartError?: (msg: string) => void;
  onWishlistToggled?: (isFav: boolean, msg: string) => void;
}

export const ProductBuyBox: React.FC<ProductBuyBoxProps> = ({
  product,
  onCartAdded,
  onCartError,
  onWishlistToggled,
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [isFavorito, setIsFavorito] = useState(Boolean(product.favorito));

  const canBuy = product.puede_comprar;
  const requireLogin = product.requiere_login;

  const maxVisualLimit = typeof product.stock_disponible === 'number' && product.stock_disponible > 0
    ? product.stock_disponible
    : 99;

  const handleAddToCart = async () => {
    if (requireLogin) {
      navigate(`/login?next=/producto/${product.cod_producto}`);
      return;
    }
    setAddingToCart(true);
    try {
      const res = await addToCart(product.cod_producto, quantity);
      if (onCartAdded) {
        onCartAdded(res.mensaje || 'Producto agregado al carrito.');
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al agregar producto al carrito.';
      if (onCartError) {
        onCartError(errorMsg);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (requireLogin) {
      navigate(`/login?next=/producto/${product.cod_producto}`);
      return;
    }
    setBuyingNow(true);
    try {
      await addToCart(product.cod_producto, quantity);
      navigate('/carrito');
    } catch (err: any) {
      const errorMsg = err?.message || 'Error al iniciar la compra.';
      if (onCartError) {
        onCartError(errorMsg);
      }
    } finally {
      setBuyingNow(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (requireLogin) {
      navigate(`/login?next=/producto/${product.cod_producto}`);
      return;
    }
    setTogglingFav(true);
    try {
      const res = await toggleWishlist(product.cod_producto);
      setIsFavorito(res.favorito);
      if (onWishlistToggled) {
        onWishlistToggled(res.favorito, res.mensaje);
      }
    } catch (err: any) {
      if (onCartError) {
        onCartError(err?.message || 'No se pudo actualizar favoritos.');
      }
    } finally {
      setTogglingFav(false);
    }
  };

  return (
    <aside className="tt-buy-box">
      {/* Encabezado de Precio del Box */}
      <div className="tt-buy-box__price-header">
        <span className="tt-buy-box__price-value">{product.precio_final || product.precio_actual}</span>
        {product.tiene_descuento && (
          <span className="tt-buy-box__price-old"><del>{product.precio_normal}</del></span>
        )}
      </div>

      {/* Entrega, Almacén y Estado de Stock */}
      <ProductDeliveryPanel product={product} />

      <hr className="tt-buy-box__divider" />

      {/* Selector de Cantidad */}
      <div className="tt-buy-box__quantity-section">
        <label htmlFor="quantity-selector" className="tt-buy-box__label">
          Cantidad:
        </label>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={maxVisualLimit}
          disabled={!canBuy || addingToCart || buyingNow}
        />
      </div>

      {/* Botones de Acción */}
      <div className="tt-buy-box__actions">
        <button
          type="button"
          className="tt-btn tt-btn--primary tt-buy-box__btn-add"
          onClick={handleAddToCart}
          disabled={!canBuy || addingToCart || buyingNow}
        >
          {addingToCart ? (
            <>
              <Loader2 size={18} className="tt-spin" />
              <span>Agregando...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>Agregar al carrito</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="tt-btn tt-btn--action tt-buy-box__btn-buy"
          onClick={handleBuyNow}
          disabled={!canBuy || addingToCart || buyingNow}
        >
          {buyingNow ? (
            <>
              <Loader2 size={18} className="tt-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>Comprar ahora</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <button
          type="button"
          className={`tt-buy-box__wishlist-btn ${isFavorito ? 'tt-buy-box__wishlist-btn--active' : ''}`}
          onClick={handleToggleWishlist}
          disabled={togglingFav}
          aria-label={isFavorito ? 'Quitar de la lista de deseos' : 'Agregar a la lista de deseos'}
        >
          <Heart size={18} className="tt-buy-box__wishlist-icon" fill={isFavorito ? 'currentColor' : 'none'} />
          <span>{isFavorito ? 'Guardado en tu Lista de Deseos' : 'Agregar a Lista de Deseos'}</span>
        </button>
      </div>

      {/* Confianza y Garantía */}
      <div className="tt-buy-box__trust">
        <div className="tt-buy-box__trust-item">
          <Shield size={15} />
          <span>Transacción segura y encriptada por PostgreSQL</span>
        </div>
        <div className="tt-buy-box__trust-item">
          <Lock size={15} />
          <span>Protección de datos y garantía oficial</span>
        </div>
      </div>
    </aside>
  );
};
