import React from 'react';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { Address } from '../../types/address.types';

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: number | null;
  onSelectAddress: (id: number) => void;
  onOpenCreateForm: () => void;
  onDeleteAddress?: (id: number) => Promise<void>;
  loading?: boolean;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onOpenCreateForm,
  onDeleteAddress,
  loading = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--tt-color-primary)" /> Selecciona una Dirección de Entrega
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
            Tus direcciones guardadas y verificadas por la base de datos de Ecuador en PostgreSQL.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreateForm}
          disabled={loading}
          style={{
            backgroundColor: 'var(--tt-color-surface)',
            color: 'var(--tt-color-text-main)',
            border: '1px solid var(--tt-color-primary)',
            padding: '0.625rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <Plus size={16} /> Nueva Dirección
        </button>
      </div>

      {addresses.length === 0 ? (
        <div
          className="tt-card"
          style={{
            padding: '2rem',
            textAlign: 'center',
            borderStyle: 'dashed',
            backgroundColor: 'rgba(59, 130, 246, 0.03)',
          }}
        >
          <MapPin size={36} color="var(--tt-color-text-light)" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.375rem' }}>
            No tienes direcciones registradas
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', marginBottom: '1rem' }}>
            Agrega tu primera dirección corporativa para calcular zonas de entrega.
          </p>
          <button
            type="button"
            onClick={onOpenCreateForm}
            style={{
              backgroundColor: 'var(--tt-color-primary)',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Registrar Dirección
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.cod_direccion;
            return (
              <div
                key={addr.cod_direccion}
                onClick={() => onSelectAddress(addr.cod_direccion)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: isSelected
                    ? '2px solid var(--tt-color-primary)'
                    : '1px solid var(--tt-color-border)',
                  backgroundColor: isSelected
                    ? 'rgba(59, 130, 246, 0.05)'
                    : 'var(--tt-color-surface)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: isSelected ? 'var(--tt-color-primary)' : 'var(--tt-color-text-main)',
                        color: '#ffffff',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                      }}
                    >
                      {addr.alias || 'Empresa'}
                    </span>
                    {addr.es_predeterminada && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-success)', fontWeight: 600 }}>
                        ★ Principal
                      </span>
                    )}
                  </div>

                  {isSelected && <CheckCircle2 size={20} color="var(--tt-color-primary)" />}
                </div>

                <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {addr.receptor}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', lineHeight: '1.4' }}>
                  {addr.linea1}
                  {addr.linea2 && ` — ${addr.linea2}`}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', marginTop: '0.25rem' }}>
                  {addr.ciudad}, {addr.provincia} ({addr.pais})
                </div>
                {addr.telefono_contacto && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', marginTop: '0.5rem' }}>
                    Tel: {addr.telefono_contacto}
                  </div>
                )}

                {onDeleteAddress && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAddress(addr.cod_direccion);
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--tt-color-error)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      opacity: 0.7,
                    }}
                    title="Eliminar dirección"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
