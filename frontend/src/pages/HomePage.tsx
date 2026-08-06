import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  TrendingUp,
  Zap,
  ArrowRight,
  Server,
  Wifi,
  BatteryCharging,
  Activity,
  Camera,
  HardDrive,
  Monitor,
  ShieldCheck,
  Truck,
  Award,
  Headphones,
  Lock,
} from 'lucide-react';
import { useProductCarousels } from '../hooks/useProducts';
import { HeroBanner } from '../components/ui/HeroBanner';
import { PromoBanner } from '../components/ui/PromoBanner';
import { ProductCarousel } from '../components/product/ProductCarousel';

export const HomePage: React.FC = () => {
  const { destacados, masVendidos, nuevos, ofertas, loading, error } =
    useProductCarousels();

  return (
    <div className="tt-home-page">
      <div className="tt-container">
        {/* Aviso en caso de error de conexión DB-First */}
        {error && (
          <div className="tt-error-state" role="alert">
            <div className="tt-error-state__content">
              <h3>Aviso de Conexión de Servidor</h3>
              <p>
                No se pudo consultar la lista de productos del backend: {error}. Se muestran estructuras de respaldo.
              </p>
            </div>
            <button
              type="button"
              className="tt-btn--secondary"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* 1. Hero Principal Limpio y Atractivo */}
        <section className="tt-hero-marketplace">
          <HeroBanner />
        </section>

        {/* 2. Tarjetas de Acceso Rápido (4 Cuadrantes Limpios) */}
        <div className="tt-quad-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          margin: '2.5rem 0'
        }}>
          <div className="tt-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-color-text-main)', marginBottom: '0.5rem' }}>
                Servidores &amp; Data Center
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                Infraestructura Xeon Dual Socket para cargas transaccionales críticas y bases de datos PostgreSQL.
              </p>
            </div>
            <Link to="/catalogo?categoria=1" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--tt-color-primary)' }}>
              <span>Explorar Servidores</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="tt-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-color-text-main)', marginBottom: '0.5rem' }}>
                Redes &amp; Conectividad 10G
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                Switches gestionados L2/L3, enrutadores perimetrales y fibra óptica certificada para alta velocidad.
              </p>
            </div>
            <Link to="/catalogo?categoria=2" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--tt-color-primary)' }}>
              <span>Ver switches &amp; redes</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="tt-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-color-text-main)', marginBottom: '0.5rem' }}>
                Almacenamiento NVMe/SAN
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                Cabinas de almacenamiento all-flash, arreglos RAID empresariales y unidades SAS de grado servidor.
              </p>
            </div>
            <Link to="/catalogo?categoria=3" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--tt-color-primary)' }}>
              <span>Almacenamiento SAN</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="tt-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid var(--tt-color-primary)' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-color-primary-dark)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={18} color="var(--tt-color-primary)" />
                <span>TechTail Prime</span>
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.45, marginBottom: '1.25rem' }}>
                Envíos prioritarios en 24h, soporte técnico dedicado y garantía corporativa sin costos adicionales.
              </p>
            </div>
            <Link to="/catalogo?orden=precio" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--tt-color-primary-dark)' }}>
              <span>Beneficios Prime</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 3. Sección Visual de las 8 Categorías Tecnológicas */}
        <section className="tt-tech-categories">
          <header className="tt-tech-categories__header">
            <h2 className="tt-tech-categories__title">
              <span>Explorar por Categorías Tecnológicas</span>
            </h2>
            <Link
              to="/catalogo"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--tt-color-primary)',
                textDecoration: 'none',
              }}
            >
              Ver Catálogo Completo →
            </Link>
          </header>

          <div className="tt-tech-categories__grid">
            <Link to="/catalogo?categoria=1" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <Server size={24} />
              </div>
              <span className="tt-tech-cat-item__name">Servidores</span>
            </Link>

            <Link to="/catalogo?categoria=2" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <Wifi size={24} />
              </div>
              <span className="tt-tech-cat-item__name">Redes &amp; 10G</span>
            </Link>

            <Link to="/catalogo?categoria=3" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <BatteryCharging size={24} />
              </div>
              <span className="tt-tech-cat-item__name">UPS &amp; Energía</span>
            </Link>

            <Link to="/catalogo?categoria=Cableado" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <Activity size={24} />
              </div>
              <span className="tt-tech-cat-item__name">Cableado Cat6A</span>
            </Link>

            <Link to="/catalogo?categoria=Videovigilancia" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <Camera size={24} />
              </div>
              <span className="tt-tech-cat-item__name">Cámaras IP</span>
            </Link>

            <Link to="/catalogo?categoria=3" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <HardDrive size={24} />
              </div>
              <span className="tt-tech-cat-item__name">Almacenamiento</span>
            </Link>

            <Link to="/catalogo?categoria=Perifericos" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <Monitor size={24} />
              </div>
              <span className="tt-tech-cat-item__name">Periféricos KVM</span>
            </Link>

            <Link to="/catalogo?categoria=Seguridad" className="tt-tech-cat-item">
              <div className="tt-tech-cat-item__icon">
                <Lock size={24} />
              </div>
              <span className="tt-tech-cat-item__name">Seguridad UTM</span>
            </Link>
          </div>
        </section>

        {/* 4. Carrusel 1: Productos Destacados */}
        <ProductCarousel
          title="Productos Destacados en TechTail"
          products={destacados}
          loading={loading}
          linkTo="/catalogo"
          icon={<Sparkles size={20} color="var(--tt-color-primary)" />}
        />

        {/* 5. Banners Promocionales (Servidores y Redes) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', margin: '3rem 0' }}>
          <PromoBanner type="servers" />
          <PromoBanner type="networking" />
        </div>

        {/* 6. Carrusel 2: Ofertas Especiales */}
        <ProductCarousel
          title="Ofertas Especiales en Hardware"
          products={ofertas}
          loading={loading}
          linkTo="/catalogo?orden=precio"
          icon={<Flame size={20} color="#0ea5e9" />}
        />

        {/* 7. Bloque de Beneficios TechTail (Clean, Blanco y Grises Suaves) */}
        <section className="tt-benefits-strip">
          <div className="tt-benefit-item">
            <div className="tt-benefit-item__icon">
              <Truck size={22} />
            </div>
            <div className="tt-benefit-item__content">
              <h4>Envíos Globales en 24h</h4>
              <p>Despacho directo desde nuestro Almacén Central certificado.</p>
            </div>
          </div>

          <div className="tt-benefit-item">
            <div className="tt-benefit-item__icon">
              <Award size={22} />
            </div>
            <div className="tt-benefit-item__content">
              <h4>Garantía de Hardware 100% Original</h4>
              <p>Trámite RMA corporativo sin intermediarios para empresas.</p>
            </div>
          </div>

          <div className="tt-benefit-item">
            <div className="tt-benefit-item__icon">
              <Headphones size={22} />
            </div>
            <div className="tt-benefit-item__content">
              <h4>Soporte Técnico 24/7</h4>
              <p>Ingenieros especialistas en centros de datos, redes y servidores.</p>
            </div>
          </div>

          <div className="tt-benefit-item">
            <div className="tt-benefit-item__icon">
              <Lock size={22} />
            </div>
            <div className="tt-benefit-item__content">
              <h4>Compra Segura DB-First</h4>
              <p>Transacciones protegidas con validación e integridad ACID en PostgreSQL.</p>
            </div>
          </div>

          <div className="tt-benefit-item">
            <div className="tt-benefit-item__icon">
              <ShieldCheck size={22} />
            </div>
            <div className="tt-benefit-item__content">
              <h4>Beneficios Prime</h4>
              <p>Tarifas de envío gratuitas en catálogo y descuentos empresariales.</p>
            </div>
          </div>
        </section>

        {/* 8. Carrusel 3: Más Vendidos */}
        <ProductCarousel
          title="Los Más Vendidos en Hardware"
          products={masVendidos}
          loading={loading}
          linkTo="/catalogo"
          icon={<TrendingUp size={20} color="var(--tt-color-primary)" />}
        />

        {/* 9. Banners Promocionales (UPS y Seguridad) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', margin: '3rem 0' }}>
          <PromoBanner type="ups" />
          <PromoBanner type="security" />
        </div>

        {/* 10. Carrusel 4: Nuevos Lanzamientos */}
        <ProductCarousel
          title="Nuevos Lanzamientos Tecnológicos"
          products={nuevos}
          loading={loading}
          linkTo="/catalogo?orden=nuevo"
          icon={<Zap size={20} color="var(--tt-color-primary)" />}
        />
      </div>
    </div>
  );
};
