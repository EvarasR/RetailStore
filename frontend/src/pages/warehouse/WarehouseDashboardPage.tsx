import React from 'react';
import { WarehouseLayout } from '../../components/warehouse/WarehouseLayout';
import { useWarehouse } from '../../hooks/useWarehouse';
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Layers,
  RefreshCw,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WarehouseDashboardPage: React.FC = () => {
  const { dashboard, productos, alertas, loading, error, reload } = useWarehouse();

  return (
    <WarehouseLayout title="Dashboard de Bodega y Logística">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
            Estado Operativo en Tiempo Real
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Control DB-First del inventario físico, lotes activos y preparación de pedidos
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
          <span className="ops-metric-title">Stock Crítico o Agotado</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-error)' }}>
            {dashboard.stock_critico}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Requieren reabastecimiento inmediato
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Alertas de Almacén</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-warning)' }}>
            {dashboard.alertas_pendientes}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Umbrales de stock detectados
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Lotes Activos en Bodega</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-primary)' }}>
            {dashboard.lotes_proximos}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Recepcionados y con trazabilidad
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Pedidos por Preparar</span>
          <span className="ops-metric-value" style={{ color: 'var(--tt-color-success)' }}>
            {dashboard.pedidos_por_preparar}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Listos para picking y packing
          </span>
        </div>
      </div>

      {/* Sección Doble: Alertas Pendientes y Accesos Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="ops-table-card" style={{ marginBottom: 0 }}>
          <div className="ops-table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--tt-color-warning)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Alertas Activas en Almacén
              </h3>
            </div>
            <Link
              to="/warehouse/alertas"
              style={{ fontSize: '0.8rem', color: 'var(--tt-color-primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver Todas →
            </Link>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>SKU / Producto</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {alertas.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--tt-color-text-light)' }}>
                      No hay alertas de inventario activas
                    </td>
                  </tr>
                ) : (
                  alertas.slice(0, 5).map((a, idx) => (
                    <tr key={a.cod_alerta || a.id || idx}>
                      <td style={{ fontWeight: 600 }}>{a.producto}</td>
                      <td>
                        <span className={`ops-badge ops-badge--${a.severidad?.toLowerCase() || 'media'}`}>
                          {a.severidad}
                        </span>
                      </td>
                      <td>{a.estado}</td>
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
              <TrendingDown size={18} color="var(--tt-color-error)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Productos con Stock Crítico
              </h3>
            </div>
            <Link
              to="/warehouse/inventario"
              style={{ fontSize: '0.8rem', color: 'var(--tt-color-primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              Inventario Completo →
            </Link>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Disponible</th>
                  <th>Estado BD</th>
                </tr>
              </thead>
              <tbody>
                {productos.filter((p) => p.estado === 'SIN_STOCK' || p.estado === 'STOCK_CRITICO').length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--tt-color-text-light)' }}>
                      Ningún producto con stock crítico en este momento
                    </td>
                  </tr>
                ) : (
                  productos
                    .filter((p) => p.estado === 'SIN_STOCK' || p.estado === 'STOCK_CRITICO')
                    .slice(0, 5)
                    .map((p) => (
                      <tr key={p.cod_producto}>
                        <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                        <td style={{ fontWeight: 700, color: p.stock_disponible === 0 ? 'var(--tt-color-error)' : 'var(--tt-color-warning)' }}>
                          {p.stock_disponible} unid.
                        </td>
                        <td>
                          <span className={p.stock_disponible === 0 ? 'ops-badge ops-badge--critica' : 'ops-badge ops-badge--media'}>
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Accesos de Gestión Rápida */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Link
          to="/warehouse/inventario"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-primary)', background: 'rgba(59, 130, 246, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Boxes size={22} color="var(--tt-color-primary)" />
            <ArrowRight size={18} color="var(--tt-color-primary)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem' }}>
            Gestión de Inventario
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Consultar stock de almacenes y niveles de seguridad
          </span>
        </Link>

        <Link
          to="/warehouse/lotes"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-success)', background: 'rgba(16, 185, 129, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Layers size={22} color="var(--tt-color-success)" />
            <ArrowRight size={18} color="var(--tt-color-success)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem' }}>
            Lotes y Vencimientos
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Registros de lotes entrantes y rotación FEFO/FIFO
          </span>
        </Link>

        <Link
          to="/warehouse/pedidos"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-warning)', background: 'rgba(245, 158, 11, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ClipboardList size={22} color="var(--tt-color-warning)" />
            <ArrowRight size={18} color="var(--tt-color-warning)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem' }}>
            Despacho y Pedidos
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Cola operativa para preparación y empaque
          </span>
        </Link>
      </div>
    </WarehouseLayout>
  );
};
