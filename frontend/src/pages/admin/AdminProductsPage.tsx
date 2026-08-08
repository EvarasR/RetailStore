import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminProductTable } from '../../components/admin/AdminProductTable';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { AdminMutationForm } from '../../components/admin/AdminMutationForm';
import { createAdminProduct } from '../../api/adminProducts.api';

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    loading,
    error,
    actionLoading,
    q,
    setQ,
    estado,
    setEstado,
    refresh,
    handlePublish,
    handlePause,
    handleDeactivate,
  } = useAdminProducts();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refresh();
  };

  return (
    <AdminLayout title="Catálogo y Gestión de Productos">
      <div className="admin-table-container" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-table-toolbar">
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--tt-color-surface)',
                padding: '0.45rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                flex: '1 1 240px',
              }}
            >
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Nombre, SKU..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--tt-color-text-main)',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>

            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                border: '1px solid var(--tt-color-border)',
                borderRadius: '0.5rem',
              }}
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="PAUSADO">Pausado</option>
              <option value="DESACTIVADO">Desactivado</option>
            </select>

            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--tt-color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Filtrar
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={refresh}
              title="Refrescar catálogo"
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--tt-color-text-muted)',
                border: '1px solid var(--tt-color-border)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <RefreshCw size={14} />
              <span>Actualizar</span>
            </button>

          </div>
        </div>
      </div>

      <AdminMutationForm
        title="Crear producto"
        description="Captura datos base; la publicación, stock y precio oficial siguen validados por PostgreSQL."
        submitLabel="Crear producto"
        fields={[
          { name: 'cod_categoria', label: 'ID categoría', type: 'number', required: true },
          { name: 'cod_marca', label: 'ID marca', type: 'number', required: true },
          { name: 'sku', label: 'SKU', required: true },
          { name: 'nombre', label: 'Nombre', required: true },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          { name: 'precio_actual', label: 'Precio base registrado', type: 'number', required: true },
          { name: 'peso_kg', label: 'Peso kg', type: 'number', defaultValue: '0' },
          { name: 'largo_cm', label: 'Largo cm', type: 'number', defaultValue: '0' },
          { name: 'ancho_cm', label: 'Ancho cm', type: 'number', defaultValue: '0' },
          { name: 'alto_cm', label: 'Alto cm', type: 'number', defaultValue: '0' },
        ]}
        onSubmit={createAdminProduct}
        onSuccess={refresh}
      />

      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--tt-color-error)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--tt-color-text-light)' }}>
          Consultando productos institucionales...
        </div>
      ) : products.length === 0 ? (
        <AdminEmptyState
          title="No se encontraron productos"
          description="Ajusta los criterios de búsqueda o usa el formulario React para crear un producto."
        />
      ) : (
        <AdminProductTable
          products={products}
          actionLoading={actionLoading}
          onPublish={handlePublish}
          onPause={handlePause}
          onDeactivate={handleDeactivate}
        />
      )}
    </AdminLayout>
  );
};
