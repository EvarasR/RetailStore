import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface SupplierManagerFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  statusOptions?: string[];
  onReset?: () => void;
  placeholder?: string;
}

export const SupplierManagerFilters: React.FC<SupplierManagerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  statusOptions = ['TODOS', 'ACTIVO', 'INACTIVO'],
  onReset,
  placeholder = 'Buscar por razón social, RUC, SKU o producto...',
}) => {
  return (
    <div className="ops-filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem' }} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="ops-filter-input"
          style={{ width: '100%', paddingLeft: '2.4rem' }}
        />
      </div>

      {statusOptions.length > 0 && (
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="ops-filter-select"
        >
          <option value="">Cualquier Estado</option>
          {statusOptions.map((st, i) => (
            <option key={i} value={st === 'TODOS' ? '' : st}>
              {st === 'TODOS' ? 'Todos los estados' : st}
            </option>
          ))}
        </select>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          style={{
            background: 'transparent',
            border: '1px solid #334155',
            color: '#94a3b8',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
          }}
          title="Restablecer filtros"
        >
          <RotateCcw size={15} />
          <span>Limpiar</span>
        </button>
      )}
    </div>
  );
};
