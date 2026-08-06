import React, { useState, useEffect } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { AddressCard } from '../../components/account/AddressCard';
import { AddressForm } from '../../components/account/AddressForm';
import { useAddresses } from '../../hooks/useAddresses';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert } from '../../components/ui/Alert';
import type { Address } from '../../types/address.types';

export const AddressesPage: React.FC = () => {
  const {
    addresses,
    loading,
    error,
    locations,
    loadLocations,
    createAddress,
    updateAddress,
    deleteAddress,
  } = useAddresses();

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadLocations().catch(() => {
      // Si falla la red al cargar ubicaciones, se notifica de forma silenciosa
    });
  }, [loadLocations]);

  const handleCreateNew = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  const handleDelete = async (cod_direccion: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta dirección corporativa de tu cuenta?')) return;
    try {
      await deleteAddress(cod_direccion);
      setActionMessage({ type: 'success', text: 'Dirección eliminada correctamente.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar la dirección.';
      setActionMessage({ type: 'error', text: msg });
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await updateAddress(addr.cod_direccion, {
        alias: addr.alias,
        receptor: addr.receptor,
        linea1: addr.linea1,
        linea2: addr.linea2 || '',
        ciudad: addr.ciudad,
        provincia: addr.provincia,
        cod_provincia: addr.cod_provincia || '',
        cod_canton: addr.cod_canton || '',
        pais: addr.pais || 'Ecuador',
        codigo_postal: addr.codigo_postal || '170101',
        telefono_contacto: addr.telefono_contacto || '',
        es_predeterminada: true,
      });
      setActionMessage({ type: 'success', text: 'Dirección principal actualizada correctamente.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo establecer la dirección principal.';
      setActionMessage({ type: 'error', text: msg });
    }
  };

  const handleSaveForm = async (data: Record<string, string | number | boolean>) => {
    if (editingAddress) {
      await updateAddress(editingAddress.cod_direccion, data);
      setActionMessage({ type: 'success', text: 'Dirección actualizada exitosamente.' });
    } else {
      await createAddress(data);
      setActionMessage({ type: 'success', text: 'Nueva dirección creada y guardada.' });
    }
  };

  return (
    <AccountLayout
      title="Mis Direcciones de Entrega y Facturación"
      subtitle="Gestiona tus sucursales y puntos de recepción para despacho logístico TechTail."
    >
      {error && <Alert variant="error">{error}</Alert>}
      {actionMessage && <Alert variant={actionMessage.type}>{actionMessage.text}</Alert>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={handleCreateNew}
          className="tt-btn tt-btn--primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          <span>Nueva Dirección Corporativa</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <Skeleton height="180px" width="100%" />
          <Skeleton height="180px" width="100%" />
        </div>
      ) : addresses.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {addresses.map((addr) => (
            <AddressCard
              key={addr.cod_direccion}
              address={addr}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      ) : (
        <div className="tt-empty-state" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--tt-color-surface)', borderRadius: '0.75rem', border: '1px dashed var(--tt-color-border)' }}>
          <MapPin size={40} color="var(--tt-color-text-light)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No tienes direcciones guardadas</h3>
          <p style={{ color: 'var(--tt-color-text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Agrega tu primera dirección corporativa o de almacén para agilizar tu próximo pedido.
          </p>
          <button type="button" onClick={handleCreateNew} className="tt-btn tt-btn--primary">
            Agregar Dirección
          </button>
        </div>
      )}

      {showForm && (
        <AddressForm
          initialAddress={editingAddress}
          locations={locations}
          onSave={handleSaveForm}
          onClose={() => setShowForm(false)}
        />
      )}
    </AccountLayout>
  );
};
