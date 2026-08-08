import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { EntityOption } from './EntitySearchSelect';

interface MultiEntitySelectProps {
  label: string;
  options: EntityOption[];
  values: Array<number | string>;
  onChange: (values: Array<number | string>) => void;
  loading?: boolean;
  helperText?: string;
  required?: boolean;
}

export const MultiEntitySelect: React.FC<MultiEntitySelectProps> = ({ label, options, values, onChange, loading, helperText, required }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => options.filter((option) => `${option.label} ${option.description || ''}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))), [options, query]);
  const selected = options.filter((option) => values.some((value) => String(value) === String(option.value)));
  const toggle = (value: number | string) => {
    if (values.some((current) => String(current) === String(value))) {
      onChange(values.filter((current) => String(current) !== String(value)));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <fieldset className="admin-multi-select">
      <legend>{label}{required ? ' *' : ''}</legend>
      {selected.length ? <div className="admin-multi-select__chips">{selected.map((option) => (
        <span key={option.value}>{option.label}<button type="button" onClick={() => toggle(option.value)} aria-label={`Quitar ${option.label}`}><X size={13} /></button></span>
      ))}</div> : null}
      <div className="admin-multi-select__search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={loading ? 'Cargando opciones…' : `Buscar ${label.toLocaleLowerCase('es')}…`} disabled={loading} /></div>
      <div className="admin-multi-select__options">
        {filtered.length ? filtered.map((option) => (
          <label key={option.value}>
            <input type="checkbox" checked={values.some((value) => String(value) === String(option.value))} onChange={() => toggle(option.value)} disabled={option.disabled} />
            <span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span>
          </label>
        )) : <p>No hay resultados.</p>}
      </div>
      {helperText ? <small className="admin-field__helper">{helperText}</small> : null}
    </fieldset>
  );
};
