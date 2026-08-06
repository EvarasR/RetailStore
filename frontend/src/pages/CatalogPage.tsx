import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Tag,
  CheckCircle,
  Star,
  RotateCcw,
} from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useProducts';
import { ProductGrid } from '../components/product/ProductGrid';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const qParam = searchParams.get('q') || '';
  const catParam = searchParams.get('categoria') || '';
  const ordenParam = searchParams.get('orden') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10) || 1;

  const { products, paginacion, loading, error } = useProducts({
    q: qParam,
    categoria: catParam,
    orden: ordenParam,
    page: pageParam,
    per_page: 12,
  });

  const { categories } = useCategories();

  const activeCategoryObj = categories.find(
    (c) =>
      c.cod_categoria.toString() === catParam ||
      c.nombre.toLowerCase() === catParam.toLowerCase()
  );

  const handleCategoryChange = (val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('categoria', val);
    } else {
      next.delete('categoria');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set('orden', val);
    } else {
      next.delete('orden');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage.toString());
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(qParam || catParam || ordenParam);

  return (
    <div className="tt-catalog-page" style={{ padding: '2rem 0', minHeight: '80vh' }}>
      <div className="tt-container">
        {/* Banner de Aviso en caso de Error de Conexión */}
        {error && (
          <div className="tt-error-state" role="alert">
            <div className="tt-error-state__content">
              <h3>Error al cargar el catálogo</h3>
              <p>
                Ocurrió un problema consultando la base de datos PostgreSQL: {error}.
              </p>
            </div>
            <button
              type="button"
              className="tt-btn--amazon"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Header y Migas de Pan */}
        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.875rem',
                fontWeight: 900,
                color: 'var(--tt-color-text-main)',
              }}
            >
              {activeCategoryObj
                ? `Hardware: ${activeCategoryObj.nombre}`
                : 'Catálogo Completo de Hardware TechTail'}
            </h1>
            <p
              style={{
                color: 'var(--tt-color-text-light)',
                fontSize: '0.9375rem',
                marginTop: '0.25rem',
              }}
            >
              {qParam ? (
                <span>
                  Resultados para la búsqueda: "<strong>{qParam}</strong>"
                </span>
              ) : (
                'Explora servidores, switches, racks y almacenamiento enterprise en tiempo real.'
              )}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="tt-btn--secondary"
              onClick={handleClearFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
              }}
            >
              <RotateCcw size={15} />
              <span>Restablecer Filtros</span>
            </button>
          )}
        </div>

        <div className="tt-catalog-layout">
          {/* BARRA LATERAL DE FILTROS ENTERPRISE */}
          <aside className="tt-sidebar" aria-label="Filtros de Catálogo">
            <h2 className="tt-sidebar__title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} color="var(--tt-color-primary)" />
                <span>Filtrar Resultados</span>
              </span>
            </h2>

            {/* Departamentos */}
            <div className="tt-sidebar__section">
              <h3 className="tt-sidebar__subtitle">Departamentos</h3>
              <ul className="tt-sidebar__list">
                <li>
                  <div
                    className={`tt-sidebar__item ${
                      !catParam ? 'tt-sidebar__item--active' : ''
                    }`.trim()}
                    onClick={() => handleCategoryChange('')}
                  >
                    <span>Todos los departamentos</span>
                  </div>
                </li>
                {categories.map((cat) => (
                  <li key={cat.cod_categoria}>
                    <div
                      className={`tt-sidebar__item ${
                        catParam === cat.cod_categoria.toString() ||
                        catParam.toLowerCase() === cat.nombre.toLowerCase()
                          ? 'tt-sidebar__item--active'
                          : ''
                      }`.trim()}
                      onClick={() => handleCategoryChange(cat.cod_categoria.toString())}
                    >
                      <span>{cat.nombre}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filtro por Marcas Corporativas */}
            <div className="tt-sidebar__section" style={{ marginTop: '1.75rem' }}>
              <h3 className="tt-sidebar__subtitle">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={16} />
                  <span>Marcas Destacadas</span>
                </span>
              </h3>
              <ul className="tt-sidebar__list" style={{ fontSize: '0.8125rem', gap: '0.4rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" id="brand-dell" defaultChecked readOnly />
                  <label htmlFor="brand-dell" style={{ cursor: 'pointer' }}>Dell Enterprise</label>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" id="brand-cisco" defaultChecked readOnly />
                  <label htmlFor="brand-cisco" style={{ cursor: 'pointer' }}>Cisco Systems</label>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" id="brand-apc" defaultChecked readOnly />
                  <label htmlFor="brand-apc" style={{ cursor: 'pointer' }}>APC by Schneider</label>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" id="brand-hp" defaultChecked readOnly />
                  <label htmlFor="brand-hp" style={{ cursor: 'pointer' }}>HP Enterprise</label>
                </li>
              </ul>
            </div>

            {/* Filtro de Disponibilidad en Almacén */}
            <div className="tt-sidebar__section" style={{ marginTop: '1.75rem' }}>
              <h3 className="tt-sidebar__subtitle">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={16} />
                  <span>Disponibilidad</span>
                </span>
              </h3>
              <ul className="tt-sidebar__list" style={{ fontSize: '0.8125rem', gap: '0.4rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" id="stock-yes" defaultChecked readOnly />
                  <label htmlFor="stock-yes" style={{ cursor: 'pointer' }}>En stock inmediato (Almacén)</label>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" id="stock-prime" defaultChecked readOnly />
                  <label htmlFor="stock-prime" style={{ cursor: 'pointer' }}>Envío GRATIS Prime</label>
                </li>
              </ul>
            </div>

            {/* Filtro de Valoración */}
            <div className="tt-sidebar__section" style={{ marginTop: '1.75rem' }}>
              <h3 className="tt-sidebar__subtitle">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>Opinión del cliente</span>
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#090e17' }}>
                  <span style={{ color: '#f59e0b' }}>★★★★☆</span>
                  <span>4 estrellas o más</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#64748b' }}>
                  <span style={{ color: '#f59e0b' }}>★★★☆☆</span>
                  <span>3 estrellas o más</span>
                </div>
              </div>
            </div>

            {/* Nota de Integración DB-First */}
            <div
              style={{
                marginTop: '2.5rem',
                padding: '1rem',
                backgroundColor: 'var(--tt-color-surface-subtle)',
                borderRadius: 'var(--tt-radius-sm)',
                border: '1px solid var(--tt-color-border)',
                fontSize: '0.75rem',
                color: 'var(--tt-color-text-muted)',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--tt-color-text-main)' }}>
                Integración DB-First
              </strong>
              Los precios, inventario disponible, esquemas de descuento y tributación están calculados al 100% por PostgreSQL.
            </div>
          </aside>

          {/* ÁREA PRINCIPAL DEL CATÁLOGO */}
          <main>
            {/* Toolbar Superior del Catálogo */}
            <div className="tt-catalog-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className="tt-catalog-count">
                  {!loading && paginacion
                    ? `Mostrando ${products.length} de ${paginacion.total} productos en total`
                    : 'Consultando catálogo de productos...'}
                </span>

                {qParam && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <span>Búsqueda: {qParam}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('q');
                        setSearchParams(next);
                      }}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#0369a1' }}
                      title="Quitar filtro de búsqueda"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>

              {/* Selector de Orden y Vista Grid/List */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="tt-catalog-sort">
                  <ArrowUpDown size={16} />
                  <label htmlFor="tt-sort-select">Ordenar por:</label>
                  <select
                    id="tt-sort-select"
                    className="tt-catalog-sort__select"
                    value={ordenParam}
                    onChange={handleSortChange}
                    aria-label="Criterio de ordenamiento de productos"
                  >
                    <option value="">Destacados / Relevancia</option>
                    <option value="precio">Precio: De menor a mayor</option>
                    <option value="-precio">Precio: De mayor a menor</option>
                    <option value="nuevo">Nuevos Lanzamientos</option>
                    <option value="nombre">Nombre: A - Z</option>
                    <option value="-nombre">Nombre: Z - A</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--tt-color-border)', borderRadius: '6px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '0.4rem 0.6rem',
                      background: viewMode === 'grid' ? '#0ea5e9' : '#ffffff',
                      color: viewMode === 'grid' ? '#ffffff' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    title="Vista en Grilla"
                    aria-label="Vista en grilla"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '0.4rem 0.6rem',
                      background: viewMode === 'list' ? '#0ea5e9' : '#ffffff',
                      color: viewMode === 'list' ? '#ffffff' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    title="Vista en Lista"
                    aria-label="Vista en lista"
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grilla de Productos */}
            <ProductGrid
              products={products}
              loading={loading}
              viewMode={viewMode}
              emptyTitle={
                qParam
                  ? `No se encontraron coincidencias para "${qParam}"`
                  : 'No hay productos disponibles en esta selección'
              }
              emptyDescription="Intenta limpiar tus filtros o explorar otros departamentos de hardware en TechTail."
              onResetFilters={handleClearFilters}
            />

            {/* Paginación Sincrónica DB-First */}
            {!loading && paginacion && paginacion.num_pages > 1 && (
              <nav className="tt-pagination" aria-label="Navegación de páginas del catálogo">
                <button
                  type="button"
                  className="tt-pagination__btn"
                  disabled={!paginacion.has_previous}
                  onClick={() => handlePageChange(paginacion.page - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </button>

                {Array.from({ length: paginacion.num_pages }, (_, idx) => idx + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`tt-pagination__btn tt-pagination__page ${
                        pageNum === paginacion.page
                          ? 'tt-pagination__page--active'
                          : ''
                      }`.trim()}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="tt-pagination__btn"
                  disabled={!paginacion.has_next}
                  onClick={() => handlePageChange(paginacion.page + 1)}
                  aria-label="Página siguiente"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
