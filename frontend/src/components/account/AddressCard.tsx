import React from 'react';
import { MapPin, Edit3, Trash2, CheckCircle } from 'lucide-react';
import type { Address } from '../../types/address.types';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (cod_direccion: number) => void;
  onSetDefault?: (address: Address) => void;
  deleting?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting = false,
}) => {
  return (
    <div className={`tt-address-card ${address.es_predeterminada ? 'tt-address-card--default' : ''}`}>
      <div className="tt-address-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} color="var(--tt-color-primary)" />
          <h3 className="tt-address-card__alias">{address.alias}</h3>
        </div>
        {address.es_predeterminada && (
          <span className="tt-badge" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: 'var(--tt-color-primary)', fontSize: '0.6875rem', fontWeight: 700 }}>
            PRINCIPAL
          </span>
        )}
      </div>

      <div className="tt-address-card__body">
        <p style={{ fontWeight: 600, color: 'var(--tt-color-text-main)', margin: '0 0 0.25rem 0' }}>{address.receptor}</p>
        <p style={{ margin: '0 0 0.2rem 0', color: 'var(--tt-color-text-muted)', fontSize: '0.875rem' }}>
          {address.linea1} {address.linea2 ? `• ${address.linea2}` : ''}
        </p>
        <p style={{ margin: '0 0 0.2rem 0', color: 'var(--tt-color-text-muted)', fontSize: '0.875rem' }}>
          {address.ciudad}, {address.provincia} - {address.pais}
        </p>
        {address.telefono_contacto && (
          <p style={{ margin: '0.4rem 0 0 0', color: 'var(--tt-color-text-light)', fontSize: '0.8125rem' }}>
            Tel: {address.telefono_contacto}
          </p>
        )}
      </div>

      <div className="tt-address-card__footer">
        {!address.es_predeterminada && onSetDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(address)}
            className="tt-btn tt-btn--ghost"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          >
            <CheckCircle size={14} />
            <span>Usar como Principal</span>
          </button>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="tt-btn tt-btn--secondary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            disabled={deleting}
          >
            <Edit3 size={14} />
            <span>Editar</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(address.cod_direccion)}
            className="tt-btn tt-btn--danger"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            disabled={deleting}
          >
            <Trash2 size={14} />
            <span>{deleting ? '...' : 'Eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
