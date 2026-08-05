import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useProducts';
import { Server, Network, HardDrive, Zap, Lock, Cpu, ArrowRight } from 'lucide-react';

export interface CategoryMenuProps {
  className?: string;
}

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('servidor')) return <Server size={20} color="#38bdf8" />;
  if (lower.includes('red') || lower.includes('switch')) return <Network size={20} color="#2dd4bf" />;
  if (lower.includes('almacen') || lower.includes('disco') || lower.includes('nvme')) return <HardDrive size={20} color="#818cf8" />;
  if (lower.includes('ups') || lower.includes('energ')) return <Zap size={20} color="#fbbf24" />;
  if (lower.includes('segur') || lower.includes('firewall')) return <Lock size={20} color="#e879f9" />;
  return <Cpu size={20} color="#64748b" />;
};

export const CategoryMenu: React.FC<CategoryMenuProps> = ({ className = '' }) => {
  const { categories, loading } = useCategories();

  return (
    <div className={`tt-card ${className}`.trim()} style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--tt-color-text-main)' }}>
        Explorar por Categoría de Hardware
      </h3>
      {loading ? (
        <div style={{ color: 'var(--tt-color-text-light)', fontSize: '0.875rem' }}>
          Cargando categorías...
        </div>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map((cat) => (
            <li key={cat.cod_categoria}>
              <Link
                to={`/catalogo?categoria=${cat.cod_categoria}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--tt-radius-sm)',
                  backgroundColor: 'var(--tt-color-surface-subtle)',
                  textDecoration: 'none',
                  color: 'var(--tt-color-text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'var(--tt-transition)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {getCategoryIcon(cat.nombre)}
                  <span>{cat.nombre}</span>
                </div>
                <ArrowRight size={16} color="var(--tt-color-text-light)" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
