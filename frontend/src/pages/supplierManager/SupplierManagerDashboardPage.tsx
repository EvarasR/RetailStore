import React from 'react';
import { SupplierManagerLayout } from '../../components/supplierManager/SupplierManagerLayout';
import { useSupplierManager } from '../../hooks/useSupplierManager';
import {
  Users,
  ShoppingCart,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupplierManagerDashboardPage: React.FC = () => {
  const { dashboard, proveedores, ordenes, loading, error, reload } = useSupplierManager();

  return (
    <SupplierManagerLayout title="Dashboard de Compras y Abastecimiento">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
            Control del Panel Interno de Compras
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Gestión ejecutiva de proveedores activos, órdenes de compra y monitoreo de quiebres
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'tt-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de KPI Cards */}
      <div className="ops-metrics-grid">
        <div className="ops-metric-card">
          <span className="ops-metric-title">Proveedores Activos</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-success)' }}>
            {dashboard.proveedores_activos}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Asociados comerciales en catálogo
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Órdenes Abastecimiento</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-primary)' }}>
            {dashboard.ordenes_pendientes}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Órdenes en curso o pendientes
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">SKUs con Stock Faltante</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-warning)' }}>
            {dashboard.productos_con_faltante}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Prioridad alta de reposición
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Cumplimiento de Entrega</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-success)' }}>
            {dashboard.cumplimiento_promedio}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Promedio 4 días de entrega
          </span>
        </div>
      </div>

      {/* Sección Doble: Proveedores Recientes y Órdenes en Curso */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="ops-table-card" style={{ marginBottom: 0 }}>
          <div className="ops-table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--tt-color-success)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Proveedores Destacados
              </h3>
            </div>
            <Link
              to="/supplier-manager/proveedores"
              style={{ fontSize: '0.8rem', color: 'var(--tt-color-success)', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver Directorio →
            </Link>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Razón Social</th>
                  <th>Ciudad</th>
                  <th>Calificación</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--tt-color-text-light)' }}>
                      No hay proveedores registrados
                    </td>
                  </tr>
                ) : (
                  proveedores.slice(0, 5).map((pv) => (
                    <tr key={pv.cod_proveedor}>
                      <td style={{ fontWeight: 600 }}>{pv.razon_social}</td>
                      <td>{pv.ciudad || 'Lima'}</td>
                      <td>
                        <span className="ops-badge ops-badge--ok">{pv.calificacion || '4.8'} ⭐</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ops-table-card" style={{ marginBottom: 0 }}>
          <div className="ops-table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} color="var(--tt-color-primary)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Últimas Órdenes de Abastecimiento
              </h3>
            </div>
            <Link
              to="/supplier-manager/abastecimiento"
              style={{ fontSize: '0.8rem', color: 'var(--tt-color-primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver Historial →
            </Link>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Orden #</th>
                  <th>Almacén</th>
                  <th>Total Estimado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--tt-color-text-light)' }}>
                      Ninguna orden de abastecimiento pendiente
                    </td>
                  </tr>
                ) : (
                  ordenes.slice(0, 5).map((o) => (
                    <tr key={o.cod_orden_abastecimiento}>
                      <td style={{ fontWeight: 700, color: 'var(--tt-color-primary)' }}>
                        #{o.cod_orden_abastecimiento}
                      </td>
                      <td>{o.almacen || 'Principal'}</td>
                      <td style={{ fontWeight: 700 }}>${o.total_estimado}</td>
                      <td>
                        <span className="ops-badge ops-badge--media">{o.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos de Abastecimiento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Link
          to="/supplier-manager/proveedores"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-success)', background: 'rgba(16, 185, 129, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Users size={22} color="var(--tt-color-success)" />
            <ArrowRight size={18} color="var(--tt-color-success)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem' }}>
            Directorio de Proveedores
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Consultar datos de contacto, RUC y reputación
          </span>
        </Link>

        <Link
          to="/supplier-manager/abastecimiento"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-primary)', background: 'rgba(59, 130, 246, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ShoppingCart size={22} color="var(--tt-color-primary)" />
            <ArrowRight size={18} color="var(--tt-color-primary)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem' }}>
            Órdenes de Abastecimiento
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Creación y control del flujo de compra y recepción
          </span>
        </Link>

        <Link
          to="/supplier-manager/faltantes"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-warning)', background: 'rgba(245, 158, 11, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TrendingUp size={22} color="var(--tt-color-warning)" />
            <ArrowRight size={18} color="var(--tt-color-warning)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem' }}>
            Reabastecimiento de Stock
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Asignar compra a proveedores por producto con faltante
          </span>
        </Link>
      </div>
    </SupplierManagerLayout>
  );
};
