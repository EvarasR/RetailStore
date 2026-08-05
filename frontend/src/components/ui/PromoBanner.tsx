import React from 'react';
import { Link } from 'react-router-dom';
import networkSvg from '../../assets/network-banner.svg';
import upsSvg from '../../assets/ups-banner.svg';
import securitySvg from '../../assets/security-banner.svg';
import storageSvg from '../../assets/storage-banner.svg';

export interface PromoBannerProps {
  type?: 'network' | 'networking' | 'ups' | 'security' | 'storage' | 'servers';
  className?: string;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({
  type = 'network',
  className = '',
}) => {
  const getBannerConfig = () => {
    switch (type) {
      case 'network':
      case 'networking':
        return {
          svg: networkSvg,
          alt: 'Redes y Conectividad Empresarial TechTail',
          link: '/catalogo?categoria=2',
        };
      case 'ups':
        return {
          svg: upsSvg,
          alt: 'Protección Eléctrica y UPS Online TechTail',
          link: '/catalogo?categoria=4',
        };
      case 'security':
        return {
          svg: securitySvg,
          alt: 'Ciberseguridad y Appliances UTM TechTail',
          link: '/catalogo?categoria=5',
        };
      case 'servers':
      case 'storage':
      default:
        return {
          svg: storageSvg,
          alt: 'Almacenamiento Masivo NVMe y SAN/NAS TechTail',
          link: '/catalogo?categoria=3',
        };
    }
  };

  const config = getBannerConfig();

  return (
    <div className={`tt-promo-card ${className}`.trim()} style={{
      background: 'var(--tt-color-surface)',
      border: '1px solid var(--tt-color-border)',
      borderRadius: 'var(--tt-radius-md)',
      overflow: 'hidden',
      boxShadow: 'var(--tt-shadow-sm)',
      transition: 'all 0.2s ease',
    }}>
      <Link to={config.link} aria-label={config.alt} style={{ display: 'block' }}>
        <img
          src={config.svg}
          alt={config.alt}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </Link>
    </div>
  );
};
