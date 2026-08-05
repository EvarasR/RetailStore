import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { CartEmptyState } from '../components/cart/CartEmptyState';
import { CartValidationAlert } from '../components/cart/CartValidationAlert';
import { Skeleton } from '../components/ui/Skeleton';
import { Alert } from '../components/ui/Alert';

export const CartPage: React.FC = () => {
  const { autenticado: isAuthenticated, loading: authLoading } = useAuth();
  const {
    cart,
    loading,
    error,
    updatingId,
    validating,
    validationResult,
    updateQuantity,
    removeItem,
    validate,
  } = useCart();
  const navigate = useNavigate();

  if (authLoading || loading) {
    return (
      <div className="tt-container" style={{ padding: '2rem 1.5rem' }}>
        <Skeleton height="80px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="140px" />
            <Skeleton height="140px" />
          </div>
          <Skeleton height="320px" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="tt-container" style={{ padding: '2rem 1.5rem' }}>
        <div className="tt-page-header">
          <span className="tt-badge tt-badge--primary">CARRITO CORPORATIVO</span>
          <h1 className="tt-page-header__title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart size={32} /> Carrito de Compras TechTail
          </h1>
        </div>
        <CartEmptyState isAuthenticated={false} />
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="tt-container" style={{ padding: '3rem 1.5rem' }}>
        <Alert variant="error" title="Error al cargar el carrito de PostgreSQL">
          {error}
        </Alert>
      </div>
    );
  }

  if (!cart || cart.cantidad_items === 0 || cart.items.length === 0) {
    return (
      <div className="tt-container" style={{ padding: '2rem 1.5rem' }}>
        <div className="tt-page-header">
          <span className="tt-badge tt-badge--primary">CARRITO CORPORATIVO</span>
          <h1 className="tt-page-header__title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart size={32} /> Carrito de Compras TechTail
          </h1>
        </div>
        <CartEmptyState isAuthenticated={true} />
      </div>
    );
  }

  const handleValidateAndProceed = async () => {
    const res = await validate();
    // Continuamos a checkout independientemente si el backend devolvió un ok o para mostrar mensajes de advertencia, a menos que el backend rechace la validez en el resultado
    if (res.ok && res.resultado?.valido !== false) {
      navigate('/checkout');
    }
  };

  return (
    <div className="tt-container" style={{ padding: '2rem 1.5rem' }}>
      <div className="tt-page-header">
        <span className="tt-badge tt-badge--primary">
          CARRITO OFICIAL • {cart.cantidad_items} {cart.cantidad_items === 1 ? 'ÍTEM' : 'ÍTEMS'}
        </span>
        <h1 className="tt-page-header__title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={32} /> Carrito de Compras TechTail
        </h1>
        <p className="tt-page-header__subtitle">
          Cotización oficial DB-First. Los subtotales, descuentos y disponibilidad se consultan en tiempo real a PostgreSQL.
        </p>
      </div>

      <CartValidationAlert result={validationResult} />

      {error && (
        <Alert variant="warning" title="Aviso en tu carrito" className="mb-4">
          {error}
        </Alert>
      )}

      <div
        className="tt-cart-layout"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
          marginTop: '1.5rem',
        }}
      >
        {/* Columna de ítems */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 2 }}>
          {cart.items.map((item) => (
            <CartItem
              key={item.cod_producto}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              updating={updatingId === item.cod_producto}
            />
          ))}
        </div>

        {/* Columna de resumen */}
        <div style={{ flex: 1, minWidth: '320px', maxWidth: '420px' }}>
          <CartSummary
            cart={cart}
            onValidateAndCheckout={handleValidateAndProceed}
            validating={validating}
          />
        </div>
      </div>
    </div>
  );
};
