import React from 'react';
import { Link } from 'react-router-dom';
import serverBannerSvg from '../../assets/server-banner.svg';

export interface HeroBannerProps {
  className?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ className = '' }) => {
  return (
    <div className={`tt-hero ${className}`.trim()}>
      <Link
        to="/catalogo?categoria=1"
        className="tt-hero__content"
        aria-label="Explorar Servidores Enterprise & Racks 2U/4U en TechTail"
      >
        <img
          src={serverBannerSvg}
          alt="Servidores Enterprise & Racks 2U/4U TechTail"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </Link>
    </div>
  );
};
