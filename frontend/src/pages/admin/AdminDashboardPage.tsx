import React from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  AlertCircle,
  Truck,
  Boxes,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { AdminStatusBadge } from '../../components/admin/AdminStatusBadge';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

export const AdminDashboardPage: React.FC = () => {
  const { loading, error, tarjetas, estadosPedido, ventasDiarias, kpis } = useAdminDashboard();

  return (
    <AdminLayout title="Dashboard Ejecutivo Empresarial">
      {loading && (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          Cargando indicadores de negocio desde PostgreSQL...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1.5rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            borderRadius: '0.75rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '2rem',
          }}
        >
          {error}
        </div>
      )}

      {tarjetas && (
        <>
          <div className="admin-kpis-grid">
            <AdminMetricCard
              title="Ventas Oficiales"
              value={`$${tarjetas.ventas}`}
              subtitle="Ingreso total acumulado DB"
              icon={DollarSign}
            />
            <AdminMetricCard
              title="Pedidos Totales"
              value={tarjetas.pedidos}
              subtitle="Órdenes de clientes"
              icon={ShoppingCart}
            />
            <AdminMetricCard
              title="Catálogo Activo"
              value={tarjetas.productos_publicados}
              subtitle={`De ${tarjetas.productos} registrados`}
              icon={Package}
            />
            <AdminMetricCard
              title="Clientes Registrados"
              value={tarjetas.clientes}
              subtitle="Cuentas con rol CUSTOMER"
              icon={Users}
            />
            <AdminMetricCard
              title="Alertas de Stock"
              value={tarjetas.alertas_stock}
              subtitle="Almacén en mínimo"
              icon={AlertCircle}
            />
            <AdminMetricCard
              title="Proveedores"
              value={tarjetas.proveedores}
              subtitle="Socios logísticos"
              icon={Truck}
            />
            <AdminMetricCard
              title="Carritos Activos"
              value={tarjetas.carritos_activos}
              subtitle="En proceso de compra"
              icon={Boxes}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem',
            }}
          >
            {/* VENTAS DIARIAS */}
            <div className="admin-table-container">
              <div className="admin-table-toolbar">
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>
                  Ventas Diarias (PostgreSQL)
                </h3>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Pedidos</th>
                      <th>Venta DB</th>
                      <th>Ticket Prom.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasDiarias.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>
                          No hay registros diarios de venta en este periodo.
                        </td>
                      </tr>
                    ) : (
                      ventasDiarias.map((v, i) => (
                        <tr key={i}>
                          <td>{v.fecha}</td>
                          <td>{v.total_pedidos} un.</td>
                          <td>
                            <strong style={{ color: '#38bdf8' }}>${v.total_ventas}</strong>
                          </td>
                          <td>${v.ticket_promedio}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ESTADOS DE PEDIDO */}
            <div className="admin-table-container">
              <div className="admin-table-toolbar">
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>
                  Estado Operativo de Pedidos
                </h3>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Estado Oficial</th>
                      <th>Cantidad</th>
                      <th>Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estadosPedido.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: '#64748b' }}>
                          No hay pedidos procesados.
                        </td>
                      </tr>
                    ) : (
                      estadosPedido.map((e, idx) => {
                        const sumTotal = estadosPedido.reduce((acc, curr) => acc + curr.total, 0);
                        const pct = sumTotal > 0 ? ((e.total / sumTotal) * 100).toFixed(1) : '0';
                        return (
                          <tr key={idx}>
                            <td>
                              <AdminStatusBadge status={e.estado} />
                            </td>
                            <td>
                              <strong>{e.total}</strong>
                            </td>
                            <td style={{ color: '#94a3b8' }}>{pct}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* KPIS CORPORATIVOS */}
          {kpis && kpis.length > 0 && (
            <div className="admin-table-container">
              <div className="admin-table-toolbar">
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>
                  Indicadores Clave de Rendimiento (KPIs Snapshot)
                </h3>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nombre de KPI</th>
                      <th>Valor BD</th>
                      <th>Unidad</th>
                      <th>Fecha de Snapshot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpis.map((k, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{k.nombre}</td>
                        <td>
                          <strong style={{ color: '#38bdf8' }}>{k.valor}</strong>
                        </td>
                        <td>{k.unidad}</td>
                        <td style={{ color: '#64748b' }}>{k.fecha || 'Reciente'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};
