import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`tt-theme-toggle ${className}`.trim()}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.38rem',
        padding: '0.32rem 0.62rem',
        borderRadius: 'var(--tt-radius-full)',
        backgroundColor: 'var(--tt-color-surface-subtle)',
        color: 'var(--tt-color-text-main)',
        border: '1px solid var(--tt-color-border)',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontWeight: 600,
        transition: 'all 0.25s ease',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {isDark ? (
        <>
          <Sun size={15} color="#F59E0B" style={{ flexShrink: 0 }} />
          <span>Claro</span>
        </>
      ) : (
        <>
          <Moon size={15} color="#0EA5E9" style={{ flexShrink: 0 }} />
          <span>Oscuro</span>
        </>
      )}
    </button>
  );
};
