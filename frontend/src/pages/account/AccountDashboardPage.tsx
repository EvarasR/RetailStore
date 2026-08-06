import React from 'react';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  ShieldCheck,
  ExternalLink,
  Bell,
  HelpCircle,
  Award,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { AccountSummaryCard } from '../../components/account/AccountSummaryCard';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { useAddresses } from '../../hooks/useAddresses';
import { useWishlist } from '../../hooks/useWishlist';
import { useNotifications } from '../../hooks/useNotifications';
import { useSupport } from '../../hooks/useSupport';
import { useMembership } from '../../hooks/useMembership';
import { OrderCard } from '../../components/account/OrderCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { Link } from 'react-router-dom';

export const AccountDashboardPage: React.FC = () => {
  const { usuario, es_prime } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const { addresses, loading: addrLoading } = useAddresses();
  const { wishlist, loading: wishLoading } = useWishlist();
  const { notifications, loading: notifLoading, unreadCount } = useNotifications();
  const { tickets, loading: ticketsLoading } = useSupport();
  const { membership, loading: memLoading } = useMembership();

  const recentOrders = orders.slice(0, 3);
  const mainAddress = addresses.find((a) => a.es_predeterminada) || addresses[0];
  const recentNotifications = notifications.slice(0, 2);
  const recentTickets = tickets.slice(0, 2);

  return (
    <AccountLayout
      title={`Bienvenido, ${usuario?.nombres || usuario?.nombre_completo || 'Cliente TechTail'}`}
      subtitle="Centro corporativo de control para gestionar pedidos, suscripciones Prime, tickets de soporte y seguridad."
    >
      {/* Tarjetas de Resumen KPI Principales (4) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <AccountSummaryCard
          title="Mis Pedidos"
          value={ordersLoading ? '...' : `${orders.length} pedidos`}
          subtitle="Historial y estado logístico"
          to="/cuenta/pedidos"
          icon={ShoppingBag}
        />

        <AccountSummaryCard
          title="Mis Direcciones"
          value={addrLoading ? '...' : `${addresses.length} guardadas`}
          subtitle={mainAddress ? `Principal: ${mainAddress.ciudad}` : 'Sin dirección principal'}
          to="/cuenta/direcciones"
          icon={MapPin}
        />

        <AccountSummaryCard
          title="Wishlist Favoritos"
          value={wishLoading ? '...' : `${wishlist.length} productos`}
          subtitle="Ítems guardados para compra"
          to="/cuenta/wishlist"
          icon={Heart}
        />

        <AccountSummaryCard
          title="Datos Corporativos"
          value={es_prime ? 'Prime Activo' : 'Cuenta Estándar'}
          subtitle={usuario?.email || 'Datos fiscales'}
          to="/cuenta/perfil"
          icon={es_prime ? ShieldCheck : User}
        />
      </div>

      {/* Tarjetas de Resumen KPI Complementarias — FASE 5.2 (4) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <AccountSummaryCard
          title="Notificaciones"
          value={notifLoading ? '...' : `${unreadCount} no leídas`}
          subtitle={`Total: ${notifications.length} avisos en servidor`}
          to="/cuenta/notificaciones"
          icon={Bell}
        />

        <AccountSummaryCard
          title="Mesa de Soporte"
          value={ticketsLoading ? '...' : `${tickets.length} tickets`}
          subtitle="Consultas y garantías"
          to="/cuenta/soporte"
          icon={HelpCircle}
        />

        <AccountSummaryCard
          title="Membresía Prime"
          value={memLoading ? '...' : membership?.activa ? 'Suscripción Activa' : 'Sin membresía'}
          subtitle={membership?.plan || 'Beneficios y despacho gratis'}
          to="/cuenta/membresia"
          icon={Award}
        />

        <AccountSummaryCard
          title="Seguridad y Acceso"
          value="Credenciales"
          subtitle="Verificar correo y contraseña"
          to="/cuenta/seguridad"
          icon={Shield}
        />
      </div>

      {/* Sección Pedidos Recientes */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Pedidos Recientes</h2>
          <Link to="/cuenta/pedidos" style={{ color: 'var(--tt-color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
            Ver todos los pedidos →
          </Link>
        </div>

        {ordersLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="140px" width="100%" />
            <Skeleton height="140px" width="100%" />
          </div>
        ) : recentOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentOrders.map((ord) => (
              <OrderCard key={ord.cod_pedido} order={ord} />
            ))}
          </div>
        ) : (
          <div className="tt-empty-state" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--tt-color-surface)', borderRadius: '0.75rem', border: '1px dashed var(--tt-color-border)' }}>
            <ShoppingBag size={36} color="var(--tt-color-text-light)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--tt-color-text)', margin: '0 0 0.5rem 0' }}>Aún no tienes pedidos registrados</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', margin: '0 0 1.25rem 0' }}>
              Descubre los mejores productos corporativos y realiza tu primera compra.
            </p>
            <Link to="/catalogo" className="tt-btn tt-btn--primary">
              Ir al Catálogo de Productos
            </Link>
          </div>
        )}
      </section>

      {/* Resumen en 2 columnas: Notificaciones y Tickets de Soporte — FASE 5.2 */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Columna 1: Notificaciones Recientes */}
        <div style={{ backgroundColor: 'var(--tt-color-surface)', border: '1px solid var(--tt-color-border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--tt-color-primary)" />
              <span>Últimas Notificaciones</span>
            </h3>
            <Link to="/cuenta/notificaciones" style={{ color: 'var(--tt-color-primary)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span>Ver todas</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {notifLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Skeleton height="60px" width="100%" />
              <Skeleton height="60px" width="100%" />
            </div>
          ) : recentNotifications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentNotifications.map((notif) => (
                <div key={notif.cod_notificacion} style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--tt-color-surface-hover)', borderLeft: `3px solid ${notif.leida ? 'var(--tt-color-border)' : 'var(--tt-color-primary)'}` }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tt-color-primary)', display: 'block' }}>
                    {notif.titulo}
                  </span>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--tt-color-text)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {notif.mensaje}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', textAlign: 'center', margin: '1.5rem 0' }}>
              Sin notificaciones recientes en el servidor.
            </p>
          )}
        </div>

        {/* Columna 2: Tickets de Soporte Recientes */}
        <div style={{ backgroundColor: 'var(--tt-color-surface)', border: '1px solid var(--tt-color-border)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} color="var(--tt-color-primary)" />
              <span>Tickets de Soporte</span>
            </h3>
            <Link to="/cuenta/soporte" style={{ color: 'var(--tt-color-primary)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span>Ir a mesa de soporte</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {ticketsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Skeleton height="60px" width="100%" />
              <Skeleton height="60px" width="100%" />
            </div>
          ) : recentTickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTickets.map((tic) => (
                <div key={tic.cod_ticket} style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--tt-color-surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tt-color-text-light)', display: 'block' }}>
                      #{tic.cod_ticket} • {tic.categoria}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--tt-color-text)' }}>
                      {tic.asunto}
                    </span>
                  </div>
                  <span className="tt-badge" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: 'var(--tt-color-primary)', fontWeight: 700 }}>
                    {tic.estado || 'ABIERTO'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', textAlign: 'center', margin: '1.5rem 0' }}>
              No tienes tickets abiertos. ¿Necesitas ayuda o garantía?
            </p>
          )}
        </div>
      </section>

      {/* Banner de Fallback Temporal Clásico */}
      <div style={{ backgroundColor: 'var(--tt-color-surface)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong style={{ fontSize: '0.9375rem', color: 'var(--tt-color-text)', display: 'block' }}>¿Buscas la vista clásica de Django?</strong>
          <span style={{ fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)' }}>
            Puedes acceder en cualquier momento al portal heredado de perfil o historial de devoluciones.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/cuenta/perfil" className="tt-btn tt-btn--secondary" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}>
            <ExternalLink size={15} />
            <span>Editar Perfil</span>
          </Link>
          <Link to="/cuenta/pedidos" className="tt-btn tt-btn--secondary" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}>
            <ExternalLink size={15} />
            <span>Ver Pedidos</span>
          </Link>
        </div>
      </div>
    </AccountLayout>
  );
};
