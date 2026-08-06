import React, { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import type { Address, UbicacionesData } from '../../types/address.types';
import { Alert } from '../ui/Alert';

interface AddressFormProps {
  initialAddress?: Address | null;
  locations: UbicacionesData | null;
  onSave: (data: Record<string, string | number | boolean>) => Promise<unknown>;
  onClose: () => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialAddress,
  locations,
  onSave,
  onClose,
}) => {
  const [alias, setAlias] = useState(initialAddress?.alias || '');
  const [receptor, setReceptor] = useState(initialAddress?.receptor || '');
  const [linea1, setLinea1] = useState(initialAddress?.linea1 || '');
  const [linea2, setLinea2] = useState(initialAddress?.linea2 || '');
  const [codProvincia, setCodProvincia] = useState<number | ''>(
    initialAddress?.cod_provincia || (locations?.provincias?.[0]?.cod_provincia ?? '')
  );
  const [codCanton, setCodCanton] = useState<number | ''>(
    initialAddress?.cod_canton || ''
  );
  const [telefonoContacto, setTelefonoContacto] = useState(initialAddress?.telefono_contacto || '');
  const [codigoPostal, setCodigoPostal] = useState(initialAddress?.codigo_postal || '');
  const [esPredeterminada, setEsPredeterminada] = useState(Boolean(initialAddress?.es_predeterminada));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cantonesFiltrados = React.useMemo(() => {
    return locations?.cantones.filter(
      (c) => Number(c.cod_provincia) === Number(codProvincia)
    ) || [];
  }, [locations?.cantones, codProvincia]);

  useEffect(() => {
    if (cantonesFiltrados.length > 0 && !cantonesFiltrados.some((c) => c.cod_canton === codCanton)) {
      setCodCanton(cantonesFiltrados[0].cod_canton);
    }
  }, [cantonesFiltrados, codCanton, setCodCanton]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || !receptor.trim() || !linea1.trim()) {
      setError('Por favor completa Alias, Receptor y Dirección principal.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const selectedProvincia = locations?.provincias.find((p) => p.cod_provincia === Number(codProvincia));
      const selectedCanton = locations?.cantones.find((c) => c.cod_canton === Number(codCanton));

      await onSave({
        alias: alias.trim(),
        receptor: receptor.trim(),
        linea1: linea1.trim(),
        linea2: linea2.trim(),
        provincia: selectedProvincia ? selectedProvincia.nombre : 'Pichincha',
        ciudad: selectedCanton ? selectedCanton.nombre : 'Quito',
        cod_provincia: codProvincia ? Number(codProvincia) : '',
        cod_canton: codCanton ? Number(codCanton) : '',
        telefono_contacto: telefonoContacto.trim(),
        codigo_postal: codigoPostal.trim() || '170101',
        pais: 'Ecuador',
        es_predeterminada: esPredeterminada,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar la dirección.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tt-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-addr-title">
      <div className="tt-modal" style={{ maxWidth: '540px' }}>
        <div className="tt-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--tt-color-primary)" />
            <h2 id="modal-addr-title" className="tt-modal__title">
              {initialAddress ? 'Editar Dirección Corporativa' : 'Nueva Dirección Corporativa'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="tt-modal__close" aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tt-modal__body">
          {error && <Alert variant="error">{error}</Alert>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="tt-form-group">
              <label htmlFor="af-alias" className="tt-form-label">
                Alias (ej. Oficina Principal, Almacén Quito) <span style={{ color: 'var(--tt-color-error)' }}>*</span>
              </label>
              <input
                id="af-alias"
                type="text"
                className="tt-input"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Oficina Centro"
                required
                disabled={saving}
              />
            </div>

            <div className="tt-form-group">
              <label htmlFor="af-receptor" className="tt-form-label">
                Nombre de Receptor o Empresa <span style={{ color: 'var(--tt-color-error)' }}>*</span>
              </label>
              <input
                id="af-receptor"
                type="text"
                className="tt-input"
                value={receptor}
                onChange={(e) => setReceptor(e.target.value)}
                placeholder="Juan Pérez / TechTail Corp"
                required
                disabled={saving}
              />
            </div>

            <div className="tt-form-group">
              <label htmlFor="af-linea1" className="tt-form-label">
                Dirección Principal <span style={{ color: 'var(--tt-color-error)' }}>*</span>
              </label>
              <input
                id="af-linea1"
                type="text"
                className="tt-input"
                value={linea1}
                onChange={(e) => setLinea1(e.target.value)}
                placeholder="Av. Amazonas N35 y Japón, Edif. Corporativo"
                required
                disabled={saving}
              />
            </div>

            <div className="tt-form-group">
              <label htmlFor="af-linea2" className="tt-form-label">
                Referencia o Piso (Opcional)
              </label>
              <input
                id="af-linea2"
                type="text"
                className="tt-input"
                value={linea2}
                onChange={(e) => setLinea2(e.target.value)}
                placeholder="Piso 4, Oficina 402"
                disabled={saving}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="tt-form-group">
                <label htmlFor="af-provincia" className="tt-form-label">
                  Provincia <span style={{ color: 'var(--tt-color-error)' }}>*</span>
                </label>
                <select
                  id="af-provincia"
                  className="tt-input"
                  value={codProvincia}
                  onChange={(e) => setCodProvincia(Number(e.target.value))}
                  disabled={saving || !locations}
                >
                  {locations?.provincias.map((p) => (
                    <option key={p.cod_provincia} value={p.cod_provincia}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tt-form-group">
                <label htmlFor="af-canton" className="tt-form-label">
                  Cantón / Ciudad <span style={{ color: 'var(--tt-color-error)' }}>*</span>
                </label>
                <select
                  id="af-canton"
                  className="tt-input"
                  value={codCanton}
                  onChange={(e) => setCodCanton(Number(e.target.value))}
                  disabled={saving || cantonesFiltrados.length === 0}
                >
                  {cantonesFiltrados.map((c) => (
                    <option key={c.cod_canton} value={c.cod_canton}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="tt-form-group">
                <label htmlFor="af-tel" className="tt-form-label">
                  Teléfono para Despacho
                </label>
                <input
                  id="af-tel"
                  type="tel"
                  className="tt-input"
                  value={telefonoContacto}
                  onChange={(e) => setTelefonoContacto(e.target.value)}
                  placeholder="+593 99..."
                  disabled={saving}
                />
              </div>

              <div className="tt-form-group">
                <label htmlFor="af-zip" className="tt-form-label">
                  Código Postal
                </label>
                <input
                  id="af-zip"
                  type="text"
                  className="tt-input"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  placeholder="170101"
                  disabled={saving}
                />
              </div>
            </div>

            <label className="tt-checkbox" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={esPredeterminada}
                onChange={(e) => setEsPredeterminada(e.target.checked)}
                disabled={saving}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Usar como dirección principal predeterminada para cotizaciones y pedidos
              </span>
            </label>
          </div>

          <div className="tt-modal__footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="tt-btn tt-btn--secondary" disabled={saving}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="tt-btn tt-btn--primary">
              <Save size={16} />
              <span>{saving ? 'Guardando en servidor...' : 'Guardar Dirección'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
