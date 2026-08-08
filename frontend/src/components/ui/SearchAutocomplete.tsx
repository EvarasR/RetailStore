import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useAutocomplete, useCategories } from '../../hooks/useProducts';

export interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  placeholder = 'Buscar servidores, switches, UPS, firewalls o por código SKU...',
  className = '',
}) => {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    suggestions,
    loading,
    isOpen,
    setIsOpen,
    close,
  } = useAutocomplete();

  const { categories } = useCategories();

  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        close();
        navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        close();
        navigate(`/producto/${selected.cod_producto}`);
      } else if (query.trim()) {
        close();
        navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const handleSelectSuggestion = (codProducto: number) => {
    close();
    navigate(`/producto/${codProducto}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      close();
      navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className={`tt-search ${className}`.trim()}>
      <form onSubmit={handleSearchSubmit} className="tt-search__bar">
        <select
          className="tt-search__select"
          aria-label="Departamento o categoría de hardware"
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              navigate(`/catalogo?categoria=${e.target.value}`);
            } else {
              navigate('/catalogo');
            }
          }}
        >
          <option value="">Todos los departamentos</option>
          {categories.map((cat) => (
            <option key={cat.cod_categoria} value={cat.cod_categoria}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="tt-search__input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          aria-label="Buscar hardware tecnológico"
        />

        {query && (
          <button
            type="button"
            className="tt-search__clear"
            onClick={() => setQuery('')}
            title="Limpiar búsqueda"
            style={{ background: 'transparent', border: 'none' }}
          >
            <X size={18} />
          </button>
        )}

        <button
          type="submit"
          className="tt-search__button"
          aria-label="Ejecutar búsqueda"
        >
          {loading ? (
            <Loader2 size={20} className="tt-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Search size={22} />
          )}
        </button>
      </form>

      {isOpen && (
        <div className="tt-search__dropdown">
          {loading && suggestions.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--tt-color-text-muted)', fontSize: '0.875rem' }}>
              Consultando en PostgreSQL DB-First...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((item, idx) => (
                <div
                  key={item.cod_producto}
                  className={`tt-search__item ${
                    idx === selectedIndex ? 'tt-search__item--active' : ''
                  }`.trim()}
                  onClick={() => handleSelectSuggestion(item.cod_producto)}
                >
                  <div className="tt-search__item-left">
                    <span className="tt-search__item-title">
                      {item.nombre || item.titulo}
                    </span>
                    <span className="tt-search__item-meta">
                      {item.categoria} {item.marca ? `• ${item.marca}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.precio_actual && (
                      <span className="tt-search__item-price">
                        ${item.precio_actual}
                      </span>
                    )}
                    <ArrowRight size={16} color="var(--tt-color-text-light)" />
                  </div>
                </div>
              ))}
              <div
                style={{
                  padding: '0.6rem 1rem',
                  backgroundColor: 'var(--tt-color-surface-subtle)',
                  textAlign: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--tt-color-primary-hover)',
                  cursor: 'pointer',
                  borderTop: '1px solid var(--tt-color-border)',
                }}
                onClick={() => {
                  close();
                  navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
                }}
              >
                Ver todos los resultados en el Catálogo para "{query}" →
              </div>
            </>
          ) : query.trim().length >= 2 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--tt-color-text-muted)', fontSize: '0.875rem' }}>
              No se encontraron coincidencias para "<strong>{query}</strong>".
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
