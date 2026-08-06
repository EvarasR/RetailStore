import React from 'react';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminProductActions } from './AdminProductActions';
import type { AdminProductItem } from '../../types/adminProduct.types';
import { AlertCircle } from 'lucide-react';

interface AdminProductTableProps {
  products: AdminProductItem[];
  actionLoading: number | null;
  onPublish: (id: number) => Promise<unknown>;
  onPause: (id: number) => Promise<unknown>;
  onDeactivate: (id: number) => Promise<unknown>;
}

export const AdminProductTable: React.FC<AdminProductTableProps> = ({
  products,
  actionLoading,
  onPublish,
  onPause,
  onDeactivate,
}) => {
  return (
    <div className="admin-table-container">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU / Marca</th>
              <th>Categoría</th>
              <th>Precio DB</th>
              <th>Stock DB</th>
              <th>Estado</th>
              <th>Publicable</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isBusy = actionLoading === p.cod_producto;
              return (
                <tr key={p.cod_producto}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {p.imagen ? (
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          style={{
                            width: '44px',
                            height: '44px',
                            objectFit: 'cover',
                            borderRadius: '0.375rem',
                            border: '1px solid var(--tt-color-border)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          SKU
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.nombre}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ID: #{p.cod_producto} • {p.fecha || 'Reciente'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.sku}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.marca}</div>
                  </td>
                  <td>{p.categoria}</td>
                  <td>
                    <strong style={{ color: '#38bdf8' }}>${p.precio}</strong>
                  </td>
                  <td>
                    {p.stock !== null && p.stock !== undefined ? (
                      <span
                        style={{
                          color: p.stock <= 5 ? '#ef4444' : '#f8fafc',
                          fontWeight: 700,
                        }}
                      >
                        {p.stock} un.
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>N/D</span>
                    )}
                  </td>
                  <td>
                    <AdminStatusBadge status={p.estado} />
                  </td>
                  <td>
                    {p.publicable ? (
                      <span className="admin-badge admin-badge-green">Listo (100%)</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b', fontSize: '0.75rem' }}>
                        <AlertCircle size={14} />
                        <span>Faltan {p.faltantes.length} datos</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <AdminProductActions
                      codProducto={p.cod_producto}
                      estado={p.estado}
                      publicable={p.publicable}
                      actionLoading={isBusy}
                      onPublish={onPublish}
                      onPause={onPause}
                      onDeactivate={onDeactivate}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
