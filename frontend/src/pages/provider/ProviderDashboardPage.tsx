import React from 'react';
import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { useProviderPortal } from '../../hooks/useProviderPortal';
import {
  Package,
  ClipboardCheck,
  History,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProviderDashboardPage: React.FC = () => {
  const { proveedor, productos, ordenes, historial, loading, error, reload } = useProviderPortal();

  return (
    <ProviderLayout
      title="Portal de Gestión para Proveedor Externo"
      razonSocial={proveedor?.razon_social}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
            Panel Principal de Abastecimiento y Stock
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Acceso seguro y diferenciado DB-First para socios comerciales externos de TechTail
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
      <div className="prov-metrics">
        <div className="prov-metric-card">
          <span className="prov-metric-title">Productos Asociados</span>
          <span className="prov-metric-value" style={{ color: 'var(--tt-color-primary)' }}>
            {productos.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            SKUs activos con TechTail
          </span>
        </div>

        <div className="prov-metric-card">
          <span className="prov-metric-title">Órdenes Abastecimiento</span>
          <span className="prov-metric-value" style={{ color: 'var(--tt-color-success)' }}>
            {ordenes.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Solicitudes de compra
          </span>
        </div>

        <div className="prov-metric-card">
          <span className="prov-metric-title">Calificación Actual</span>
          <span className="prov-metric-value" style={{ color: 'var(--tt-color-warning)' }}>
            {proveedor?.calificacion || '4.9'} ⭐
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Reputación comercial
          </span>
        </div>

        <div className="prov-metric-card">
          <span className="prov-metric-title">Registros Históricos</span>
          <span className="prov-metric-value" style={{ color: '#a855f7' }}>
            {historial.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            Eventos y entregas pasadas
          </span>
        </div>
      </div>

      {/* Sección Doble: Órdenes Activas y Productos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="prov-table-box" style={{ marginBottom: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--tt-color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ClipboardCheck size={18} color="var(--tt-color-primary)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Órdenes Pendientes o Recientes
              </h3>
            </div>
            <Link
              to="/proveedor/ordenes"
              style={{ fontSize: '0.8rem', color: 'var(--tt-color-primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver Órdenes →
            </Link>
          </div>

          <table>
            <thead>
              <tr>
                <th>Orden #</th>
                <th>Almacén Destino</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--tt-color-text-light)' }}>
                    Sin órdenes de abastecimiento pendientes
                  </td>
                </tr>
              ) : (
                ordenes.slice(0, 5).map((ord) => (
                  <tr key={ord.cod_orden_abastecimiento}>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-primary)' }}>
                      #{ord.cod_orden_abastecimiento}
                    </td>
                    <td>{ord.almacen || 'Central'}</td>
                    <td style={{ fontWeight: 700 }}>${ord.total_estimado}</td>
                    <td>
                      <span className="ops-badge ops-badge--media">{ord.estado}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="prov-table-box" style={{ marginBottom: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--tt-color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} color="var(--tt-color-success)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Mis Productos Destacados
              </h3>
            </div>
            <Link
              to="/proveedor/productos"
              style={{ fontSize: '0.8rem', color: 'var(--tt-color-success)', textDecoration: 'none', fontWeight: 600 }}
            >
              Actualizar Stock →
            </Link>
          </div>

          <table>
            <thead>
              <tr>
                <th>Producto / SKU</th>
                <th>Costo Unit.</th>
                <th>Stock Disp.</th>
                <th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--tt-color-text-light)' }}>
                    No tienes productos vinculados aún
                  </td>
                </tr>
              ) : (
                productos.slice(0, 5).map((p, idx) => (
                  <tr key={p.cod_producto_proveedor || idx}>
                    <td style={{ fontWeight: 600 }}>{p.producto}</td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>${p.costo_unitario}</td>
                    <td style={{ fontWeight: 700 }}>{p.stock_disponible ?? 100}</td>
                    <td>{p.tiempo_entrega_dias || 3}d</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tarjetas de Navegación del Portal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Link
          to="/proveedor/productos"
          className="prov-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-primary)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Package size={22} color="var(--tt-color-primary)" />
            <ArrowRight size={18} color="var(--tt-color-primary)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem', display: 'block' }}>
            Mis Productos y Stock
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Actualiza tus existencias disponibles para compra en BD
          </span>
        </Link>

        <Link
          to="/proveedor/ordenes"
          className="prov-metric-card"
          style={{ textDecoration: 'none', border: '1px solid var(--tt-color-success)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ClipboardCheck size={22} color="var(--tt-color-success)" />
            <ArrowRight size={18} color="var(--tt-color-success)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem', display: 'block' }}>
            Órdenes de Abastecimiento
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Revisa solicitudes de entrega y fechas de recepción
          </span>
        </Link>

        <Link
          to="/proveedor/historial"
          className="prov-metric-card"
          style={{ textDecoration: 'none', border: '1px solid #a855f7' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <History size={22} color="#a855f7" />
            <ArrowRight size={18} color="#a855f7" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--tt-color-text-main)', marginTop: '0.5rem', display: 'block' }}>
            Historial de Relación
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
            Auditoría de despachos completados y eventos
          </span>
        </Link>
      </div>
    </ProviderLayout>
  );
};
