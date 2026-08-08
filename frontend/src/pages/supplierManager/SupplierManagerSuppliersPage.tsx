import React, { useState, useMemo } from 'react';
import { SupplierManagerLayout } from '../../components/supplierManager/SupplierManagerLayout';
import { useSupplierManager } from '../../hooks/useSupplierManager';
import { SupplierManagerFilters } from '../../components/supplierManager/SupplierManagerFilters';
import { SupplierDetailDrawer } from '../../components/supplierManager/SupplierDetailDrawer';
import { Users, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import type { SupplierManagerSupplierItem } from '../../types/supplierManager.types';

export const SupplierManagerSuppliersPage: React.FC = () => {
  const { proveedores, loading, error, reload } = useSupplierManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierManagerSupplierItem | null>(null);

  const filteredSuppliers = useMemo(() => {
    return proveedores.filter((pv) => {
      const matchesSearch =
        pv.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pv.ruc && pv.ruc.includes(searchTerm)) ||
        (pv.ciudad && pv.ciudad.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(pv.cod_proveedor).includes(searchTerm);
      const isActivo = pv.activo !== false;
      const matchesStatus =
        selectedStatus === 'ACTIVO'
          ? isActivo
          : selectedStatus === 'INACTIVO'
          ? !isActivo
          : true;
      return matchesSearch && matchesStatus;
    });
  }, [proveedores, searchTerm, selectedStatus]);

  return (
    <SupplierManagerLayout title="Directorio Oficial de Proveedores">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            Empresas y Socios Registrados en BD
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Directorio corporativo importado desde PostgreSQL con detalle y enlace de edición
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Actualizar Directorio</span>
        </button>
      </div>

      <SupplierManagerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={['TODOS', 'ACTIVO', 'INACTIVO']}
        onReset={() => {
          setSearchTerm('');
          setSelectedStatus('');
        }}
        placeholder="Buscar por razón social, RUC, ciudad o código..."
      />

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Proveedores Habilitados en TechTail ({filteredSuppliers.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>RUC / NIT</th>
                <th>Razón Social</th>
                <th>Ciudad / Provincia</th>
                <th>Contacto Económico</th>
                <th>Calificación</th>
                <th>Estado BD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Consultando proveedores en base de datos...
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron proveedores que coincidan con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((prov) => (
                  <tr key={prov.cod_proveedor}>
                    <td style={{ color: 'var(--tt-color-text-light)' }}>#{prov.cod_proveedor}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--tt-color-text-muted)' }}>
                      {prov.ruc || 'N/D'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{prov.razon_social}</td>
                    <td>
                      {prov.ciudad || 'Quito'}{prov.provincia ? `, ${prov.provincia}` : ''}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{prov.email || 'sin@correo.com'}</div>
                      <div style={{ color: 'var(--tt-color-text-light)', fontSize: '0.75rem' }}>{prov.telefono || 'sin teléfono'}</div>
                    </td>
                    <td>
                      <span className="ops-badge ops-badge--media" style={{ fontWeight: 700 }}>
                        ★ {prov.calificacion || '4.5'}
                      </span>
                    </td>
                    <td>
                      <span className={`ops-badge ${prov.activo !== false ? 'ops-badge--ok' : 'ops-badge--critica'}`}>
                        {prov.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedSupplier(prov)}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Ver ficha de datos de proveedor"
                      >
                        <Eye size={13} />
                        <span>Ficha</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierDetailDrawer
        supplier={selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
      />
    </SupplierManagerLayout>
  );
};
