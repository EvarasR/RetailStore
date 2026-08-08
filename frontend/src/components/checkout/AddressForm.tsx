import React, { useState, useEffect } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import type { UbicacionesData } from '../../types/address.types';

interface AddressFormProps {
  locations: UbicacionesData | null;
  onLoadLocations: (cod_provincia?: number | string) => Promise<UbicacionesData>;
  onCreateAddress: (data: Record<string, string | number | boolean>) => Promise<{ ok: boolean; mensaje: string }>;
  onClose: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  locations,
  onLoadLocations,
  onCreateAddress,
  onClose,
}) => {
  const [alias, setAlias] = useState('Oficina Principal');
  const [receptor, setReceptor] = useState('');
  const [linea1, setLinea1] = useState('');
  const [linea2, setLinea2] = useState('');
  const [codProvincia, setCodProvincia] = useState<string>('');
  const [codCanton, setCodCanton] = useState<string>('');
  const [provinciaNombre, setProvinciaNombre] = useState<string>('');
  const [ciudadNombre, setCiudadNombre] = useState<string>('');
  const [telefonoContacto, setTelefonoContacto] = useState('');
  const [esPredeterminada, setEsPredeterminada] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onLoadLocations().catch(() => {});
  }, [onLoadLocations]);

  const handleProvinciaChange = async (val: string) => {
    setCodProvincia(val);
    setCodCanton('');
    const provObj = locations?.provincias.find((p) => String(p.cod_provincia) === val);
    if (provObj) {
      setProvinciaNombre(provObj.nombre);
    }
    if (val) {
      await onLoadLocations(val);
    }
  };

  const handleCantonChange = (val: string) => {
    setCodCanton(val);
    const canObj = locations?.cantones.find((c) => String(c.cod_canton) === val);
    if (canObj) {
      setCiudadNombre(canObj.nombre);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linea1.trim()) {
      setError('Por favor ingresa la dirección principal (Calle principal y numeración).');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const payload: Record<string, string | number | boolean> = {
        alias: alias.trim() || 'Principal',
        receptor: receptor.trim(),
        linea1: linea1.trim(),
        linea2: linea2.trim(),
        telefono_contacto: telefonoContacto.trim(),
        es_predeterminada: esPredeterminada ? 'true' : 'false',
        pais: 'Ecuador',
      };
      if (codProvincia) {
        payload.cod_provincia = codProvincia;
      } else if (provinciaNombre) {
        payload.provincia = provinciaNombre;
      }
      if (codCanton) {
        payload.cod_canton = codCanton;
      } else if (ciudadNombre) {
        payload.ciudad = ciudadNombre;
      }

      const res = await onCreateAddress(payload);
      if (!res.ok) {
        throw new Error(res.mensaje || 'No se pudo crear la dirección.');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la dirección';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="tt-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '1.75rem',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--tt-color-primary)" /> Registrar Dirección en PostgreSQL
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tt-color-text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--tt-color-error)',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Alias / Identificador de la Sede
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Ej: Oficina Central Quito, Almacén Guayaquil"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Receptor / Encargado de Recepción
            </label>
            <input
              type="text"
              value={receptor}
              onChange={(e) => setReceptor(e.target.value)}
              placeholder="Nombre completo o departamento IT"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                Provincia (Ecuador)
              </label>
              <select
                value={codProvincia}
                onChange={(e) => handleProvinciaChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--tt-color-border)',
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text-main)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Selecciona Provincia</option>
                {locations?.provincias.map((p) => (
                  <option key={p.cod_provincia} value={p.cod_provincia}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                Cantón / Ciudad
              </label>
              <select
                value={codCanton}
                onChange={(e) => handleCantonChange(e.target.value)}
                disabled={!codProvincia}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--tt-color-border)',
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text-main)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Selecciona Cantón</option>
                {locations?.cantones
                  .filter((c) => !codProvincia || String(c.cod_provincia) === codProvincia)
                  .map((c) => (
                    <option key={c.cod_canton} value={c.cod_canton}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Dirección Principal (Línea 1) *
            </label>
            <input
              type="text"
              required
              value={linea1}
              onChange={(e) => setLinea1(e.target.value)}
              placeholder="Av. Amazonas N34-120 y República"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Referencia o Piso / Edificio (Línea 2)
            </label>
            <input
              type="text"
              value={linea2}
              onChange={(e) => setLinea2(e.target.value)}
              placeholder="Edificio Corporativo Torre Norte, Piso 5, Oficina 502"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Teléfono de Contacto para Entrega
            </label>
            <input
              type="tel"
              value={telefonoContacto}
              onChange={(e) => setTelefonoContacto(e.target.value)}
              placeholder="0991234567"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="esPred"
              checked={esPredeterminada}
              onChange={(e) => setEsPredeterminada(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="esPred" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
              Definir como dirección de entrega principal
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                border: '1px solid var(--tt-color-border)',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: 'var(--tt-color-primary)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {submitting ? 'Guardando...' : 'Guardar Dirección'}
              {!submitting && <Check size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
