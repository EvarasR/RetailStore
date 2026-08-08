import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

interface SupportFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  statusOptions?: string[];
  selectedPriority?: string;
  onPriorityChange?: (val: string) => void;
  priorityOptions?: string[];
  onReset?: () => void;
  placeholder?: string;
}

export const SupportFilters: React.FC<SupportFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  statusOptions = ['TODOS', 'ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'],
  selectedPriority,
  onPriorityChange,
  priorityOptions = ['TODAS', 'ALTA', 'MEDIA', 'BAJA'],
  onReset,
  placeholder = 'Buscar por asunto, cliente, correo o ticket #...',
}) => {
  return (
    <div className="ops-filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '230px', position: 'relative' }}>
        <Search size={18} color="var(--tt-color-text-light)" style={{ position: 'absolute', left: '0.75rem' }} />
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
          <option value="">Todos los Estados</option>
          {statusOptions.map((st, i) => (
            <option key={i} value={st === 'TODOS' ? '' : st}>
              {st === 'TODOS' ? 'Todos los Estados' : st}
            </option>
          ))}
        </select>
      )}

      {onPriorityChange && priorityOptions.length > 0 && (
        <select
          value={selectedPriority || ''}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="ops-filter-select"
        >
          <option value="">Todas las Prioridades</option>
          {priorityOptions.map((pri, i) => (
            <option key={i} value={pri === 'TODAS' ? '' : pri}>
              {pri === 'TODAS' ? 'Todas las prioridades' : pri}
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
            border: '1px solid var(--tt-color-border-dark)',
            color: 'var(--tt-color-text-light)',
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
