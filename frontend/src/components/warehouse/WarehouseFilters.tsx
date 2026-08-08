import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface WarehouseFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedAlmacen: string;
  onAlmacenChange: (val: string) => void;
  almacenesDisponibles: string[];
  selectedEstado: string;
  onEstadoChange: (val: string) => void;
  estadosDisponibles?: string[];
  onReset?: () => void;
  placeholder?: string;
}

export const WarehouseFilters: React.FC<WarehouseFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedAlmacen,
  onAlmacenChange,
  almacenesDisponibles,
  selectedEstado,
  onEstadoChange,
  estadosDisponibles = ['TODOS', 'NORMAL', 'CRITICO', 'SIN_STOCK'],
  onReset,
  placeholder = 'Buscar por producto, SKU o código...',
}) => {
  return (
    <div className="ops-filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', position: 'relative' }}>
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

      {almacenesDisponibles.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--tt-color-text-light)" />
          <select
            value={selectedAlmacen}
            onChange={(e) => onAlmacenChange(e.target.value)}
            className="ops-filter-select"
          >
            <option value="">Todos los Almacenes</option>
            {almacenesDisponibles.map((alm, idx) => (
              <option key={idx} value={alm}>
                {alm}
              </option>
            ))}
          </select>
        </div>
      )}

      {estadosDisponibles.length > 0 && (
        <select
          value={selectedEstado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="ops-filter-select"
        >
          <option value="">Cualquier Estado / Prioridad</option>
          {estadosDisponibles.map((est, idx) => (
            <option key={idx} value={est === 'TODOS' ? '' : est}>
              {est === 'TODOS' ? 'Todos los estados' : est}
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
