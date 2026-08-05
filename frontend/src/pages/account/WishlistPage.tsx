import React, { useState } from 'react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { WishlistGrid } from '../../components/account/WishlistGrid';
import { useWishlist } from '../../hooks/useWishlist';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert } from '../../components/ui/Alert';

export const WishlistPage: React.FC = () => {
  const { wishlist, loading, error, toggleFavorite } = useWishlist();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleRemove = async (cod_producto: number) => {
    setRemovingId(cod_producto);
    try {
      await toggleFavorite(cod_producto);
      setActionMessage('Producto eliminado de tus favoritos.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el producto.';
      setActionMessage(msg);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <AccountLayout
      title="Wishlist y Productos Favoritos"
      subtitle="Guarda ítems de interés para futuras cotizaciones o compras corporativas rápidas."
    >
      {error && <Alert variant="error">{error}</Alert>}
      {actionMessage && <Alert variant="success">{actionMessage}</Alert>}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
          <Skeleton height="320px" width="100%" />
          <Skeleton height="320px" width="100%" />
          <Skeleton height="320px" width="100%" />
        </div>
      ) : (
        <WishlistGrid products={wishlist} onRemove={handleRemove} removingId={removingId} />
      )}
    </AccountLayout>
  );
};
