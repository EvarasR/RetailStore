import React from 'react';
import type { AdminPromotionAssociation } from '../../types/adminPromotion.types';
import { Tag } from 'lucide-react';

interface AdminPromotionsTableProps {
  associations: AdminPromotionAssociation[];
  loading: boolean;
}

export const AdminPromotionsTable: React.FC<AdminPromotionsTableProps> = ({ associations, loading }) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        Cargando asociaciones de promociones en el catálogo...
      </div>
    );
  }

  if (associations.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        No hay asociaciones de promociones activas registradas en PostgreSQL.
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Código de Promoción</th>
            <th>Producto Asociado en BD</th>
            <th>ID Promoción</th>
            <th>ID Producto</th>
          </tr>
        </thead>
        <tbody>
          {associations.map((assoc, idx) => (
            <tr key={`${assoc.cod_promocion}-${assoc.cod_producto}-${idx}`}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={15} color="var(--tt-color-primary)" />
                  <span style={{ fontWeight: 700, color: 'var(--tt-color-text-main)' }}>
                    {assoc.promocion}
                  </span>
                </div>
              </td>
              <td style={{ fontWeight: 600 }}>{assoc.producto}</td>
              <td style={{ fontFamily: 'monospace', color: 'var(--tt-color-text-muted)' }}>
                #{assoc.cod_promocion}
              </td>
              <td style={{ fontFamily: 'monospace', color: 'var(--tt-color-text-muted)' }}>
                #{assoc.cod_producto}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
