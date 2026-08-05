import React from 'react';
import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import type { OrderTrackingResponse } from '../../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderTimelineProps {
  tracking: OrderTrackingResponse;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ tracking }) => {
  const { envio, eventos } = tracking;

  return (
    <div className="tt-order-timeline">
      <div className="tt-order-timeline__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--tt-color-border)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>NÚMERO DE GUÍA LOGÍSTICA</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--tt-color-text)' }}>
            {envio.numero_tracking || 'Asignación Logística en Progreso'}
          </strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>ESTADO GENERAL</span>
            <OrderStatusBadge estado={envio.estado} />
          </div>
          {envio.fecha_estimada_entrega && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>ENTREGA ESTIMADA</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--tt-color-primary)' }}>{envio.fecha_estimada_entrega}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Barra de progreso visual DB-First */}
      <div style={{ margin: '1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--tt-color-text-muted)' }}>
          <span>Progreso Logístico TechTail</span>
          <span>{envio.progreso || 0}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--tt-color-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${envio.progreso || 0}%`,
              height: '100%',
              backgroundColor: 'var(--tt-color-primary)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Lista de eventos del timeline */}
      <div className="tt-order-timeline__list" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Historial de Eventos de Envío</h3>
        {eventos && eventos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            {eventos.map((evt, idx) => (
              <div key={evt.cod_tracking_evento || idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: evt.completado ? 'rgba(14, 165, 233, 0.15)' : 'var(--tt-color-surface-hover)',
                    color: evt.completado ? 'var(--tt-color-primary)' : 'var(--tt-color-text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {evt.completado ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--tt-color-text)' }}>{evt.nombre}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>{evt.fecha}</span>
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
                    {evt.descripcion}
                  </p>
                  {evt.ubicacion && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--tt-color-primary)', marginTop: '0.3rem' }}>
                      <MapPin size={12} /> {evt.ubicacion}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--tt-color-text-muted)', fontSize: '0.875rem' }}>
            Aún no hay eventos registrados en la guía logística para este pedido.
          </p>
        )}
      </div>
    </div>
  );
};
