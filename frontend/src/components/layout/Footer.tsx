import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Server, Lock, Cpu, ArrowUp } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import techTailLogoSvg from '../../assets/brand/techtail-logo.svg';
import techTailLogoDarkSvg from '../../assets/brand/techtail-logo-dark.svg';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="tt-footer">
      {/* Botón Volver al principio minimalista */}
      <div
        onClick={scrollToTop}
        style={{
          backgroundColor: 'var(--tt-color-surface-subtle)',
          color: 'var(--tt-color-text-main)',
          textAlign: 'center',
          padding: '0.75rem 0',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s',
          borderTop: '1px solid var(--tt-color-border)',
          borderBottom: '1px solid var(--tt-color-border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--tt-color-surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--tt-color-surface-subtle)';
        }}
      >
        <ArrowUp size={16} />
        <span>Volver al principio</span>
      </div>

      <div className="tt-container" style={{ paddingTop: '3.5rem' }}>
        <div className="tt-footer__grid">
          {/* Columna 1 */}
          <div>
            <h3 className="tt-footer__title">Conócenos TechTail</h3>
            <ul className="tt-footer__list">
              <li><Link to="/" className="tt-footer__link">Acerca de TechTail Marketplace</Link></li>
              <li><Link to="/" className="tt-footer__link">Infraestructura y Data Centers</Link></li>
              <li><Link to="/" className="tt-footer__link">Blog de Ingeniería &amp; Hardware</Link></li>
              <li><Link to="/" className="tt-footer__link">Sostenibilidad y Eficiencia Energética</Link></li>
              <li><Link to="/" className="tt-footer__link">Relación con Inversores</Link></li>
            </ul>
          </div>

          {/* Columna 2 */}
          <div>
            <h3 className="tt-footer__title">Gana Dinero con Nosotros</h3>
            <ul className="tt-footer__list">
              <li><Link to="/" className="tt-footer__link">Vende hardware en TechTail</Link></li>
              <li><Link to="/" className="tt-footer__link">Programa de Proveedores y Partners</Link></li>
              <li><Link to="/" className="tt-footer__link">Soluciones B2B para Empresas</Link></li>
              <li><Link to="/" className="tt-footer__link">Programa de Afiliados Tech</Link></li>
              <li><Link to="/" className="tt-footer__link">Publica tu marca tecnológica</Link></li>
            </ul>
          </div>

          {/* Columna 3 */}
          <div>
            <h3 className="tt-footer__title">Podemos Ayudarte</h3>
            <ul className="tt-footer__list">
              <li><Link to="/pedidos" className="tt-footer__link">Tu Cuenta y Pedidos</Link></li>
              <li><Link to="/pedidos" className="tt-footer__link">Devoluciones y Garantía RMA</Link></li>
              <li><Link to="/" className="tt-footer__link">Soporte Técnico Especializado</Link></li>
              <li><Link to="/" className="tt-footer__link">Tarifas y Tiempos de Envío Prime</Link></li>
              <li><Link to="/" className="tt-footer__link">Ayuda y Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Columna 4 */}
          <div>
            <h3 className="tt-footer__title">Arquitectura &amp; Seguridad</h3>
            <ul className="tt-footer__list">
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-text-muted)' }}>
                <Server size={16} color="var(--tt-color-primary)" />
                <span>PostgreSQL DB-First Enterprise</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-text-muted)' }}>
                <Lock size={16} color="var(--tt-color-success)" />
                <span>Protección CSRF &amp; SSL Certificado</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-text-muted)' }}>
                <Shield size={16} color="var(--tt-color-primary-dark)" />
                <span>Garantía de Hardware 100% Original</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-text-muted)' }}>
                <Cpu size={16} color="var(--tt-color-primary)" />
                <span>Despliegue y Pruebas en Servidor Real</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador y Logo Footer */}
        <div className="tt-footer__bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }} aria-label="Portada de TechTail">
              <img
                src={isDark ? techTailLogoDarkSvg : techTailLogoSvg}
                alt="TechTail Enterprise Marketplace"
                style={{ height: '34px', width: 'auto', display: 'block' }}
              />
            </Link>
            <span>© 2026 TechTail Corporation. Todos los derechos reservados.</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/" className="tt-footer__link">Condiciones de Uso</Link>
            <Link to="/" className="tt-footer__link">Aviso de Privacidad</Link>
            <Link to="/" className="tt-footer__link">Seguridad de Base de Datos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
