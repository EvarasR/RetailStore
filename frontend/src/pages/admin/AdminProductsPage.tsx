import React from 'react';
import { Search, Plus, ExternalLink, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminProductTable } from '../../components/admin/AdminProductTable';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { useAdminProducts } from '../../hooks/useAdminProducts';

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
                backgroundColor: '#1e293b',
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
                  color: '#f8fafc',
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
                backgroundColor: '#1e293b',
                color: '#f8fafc',
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
                background: '#3b82f6',
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
                color: '#cbd5e1',
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

            <a
              href="/panel/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-classic-fallback-btn"
              style={{ width: 'auto', background: '#2563eb', borderColor: '#3b82f6' }}
            >
              <Plus size={16} />
              <span>Crear Producto (Panel Clásico)</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          Consultando productos institucionales...
        </div>
      ) : products.length === 0 ? (
        <AdminEmptyState
          title="No se encontraron productos"
          description="Ajusta los criterios de búsqueda o crea un nuevo producto en el panel clásico Django."
          action={
            <a
              href="/panel/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-classic-fallback-btn"
              style={{ width: 'auto' }}
            >
              <span>Abrir Panel Clásico</span>
            </a>
          }
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
