import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface EntityOption {
  value: number | string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface EntitySearchSelectProps {
  label: string;
  value: number | string | null;
  options: EntityOption[];
  onChange: (value: number | string | null) => void;
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
}

export const EntitySearchSelect: React.FC<EntitySearchSelectProps> = ({
  label, value, options, onChange, placeholder = 'Buscar o seleccionar…', loading = false,
  error, helperText, required = false, disabled = false, clearable = true,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => String(option.value) === String(value));
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es');
    if (!normalized) return options;
    return options.filter((option) => `${option.label} ${option.description || ''}`.toLocaleLowerCase('es').includes(normalized));
  }, [options, query]);

  return (
    <div className="admin-field">
      <label className="admin-field__label">
        {label}{required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className={`admin-entity-select${open ? ' is-open' : ''}`}>
        <button
          type="button"
          className="admin-entity-select__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled || loading}
          onClick={() => setOpen((current) => !current)}
        >
          <span>{loading ? `Cargando ${label.toLocaleLowerCase('es')}…` : selected?.label || placeholder}</span>
          <ChevronDown size={17} />
        </button>
        {selected && clearable && !disabled ? (
          <button type="button" className="admin-entity-select__clear" aria-label={`Limpiar ${label}`} onClick={() => onChange(null)}>
            <X size={15} />
          </button>
        ) : null}
        {open && !disabled ? (
          <div className="admin-entity-select__popover">
            <div className="admin-entity-select__search">
              <Search size={16} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ${label.toLocaleLowerCase('es')}…`} aria-label={`Buscar ${label}`} />
            </div>
            <div className="admin-entity-select__options" role="listbox" aria-label={label}>
              {filtered.length ? filtered.map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={String(option.value) === String(value)}
                  disabled={option.disabled}
                  key={option.value}
                  onClick={() => { onChange(option.value); setOpen(false); setQuery(''); }}
                >
                  <span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span>
                  {String(option.value) === String(value) ? <Check size={16} /> : null}
                </button>
              )) : <div className="admin-entity-select__empty">No hay resultados.</div>}
            </div>
          </div>
        ) : null}
      </div>
      {helperText && !error ? <small className="admin-field__helper">{helperText}</small> : null}
      {error ? <small className="admin-field__error" role="alert">{error}</small> : null}
    </div>
  );
};
