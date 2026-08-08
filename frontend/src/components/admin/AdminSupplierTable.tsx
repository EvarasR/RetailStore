import React from 'react';
import type { AdminSupplierItem } from '../../types/adminSupplier.types';
import { Mail, Phone, MapPin, Building2 } from 'lucide-react';

interface AdminSupplierTableProps {
  suppliers: AdminSupplierItem[];
  loading: boolean;
}

export const AdminSupplierTable: React.FC<AdminSupplierTableProps> = ({ suppliers, loading }) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        Cargando directorio oficial de proveedores...
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        No se encontraron proveedores registrados en PostgreSQL.
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Proveedor / Razón Social</th>
            <th>RUC / Doc. Fiscal</th>
            <th>Contacto</th>
            <th>Ubicación</th>
            <th>Calificación DB</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((sup) => (
            <tr key={sup.cod_proveedor}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--tt-radius-md)',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--tt-color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--tt-color-text-main)' }}>
                      {sup.razon_social}
                    </div>
                    {sup.nombre_comercial && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)' }}>
                        {sup.nombre_comercial}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>{sup.ruc}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {sup.email && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <Mail size={13} color="var(--tt-color-text-muted)" />
                      {sup.email}
                    </span>
                  )}
                  {sup.telefono && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                      <Phone size={13} color="var(--tt-color-text-muted)" />
                      {sup.telefono}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <MapPin size={13} color="var(--tt-color-text-muted)" />
                  {sup.ciudad}, {sup.provincia}
                </span>
              </td>
              <td>
                <span
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--tt-radius-sm)',
                    background: 'var(--tt-color-surface)',
                    border: '1px solid var(--tt-color-border)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {sup.calificacion}
                </span>
              </td>
              <td>
                <span className={`status-badge ${sup.activo ? 'status-active' : 'status-inactive'}`}>
                  {sup.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
