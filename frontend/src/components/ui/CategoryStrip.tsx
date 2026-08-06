import React from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  ShieldCheck,
  Flame,
  Server,
  HardDrive,
  Wifi,
  BatteryCharging,
  Activity,
  Camera,
} from 'lucide-react';

export const CategoryStrip: React.FC = () => {
  return (
    <nav className="tt-header__subnav" aria-label="Navegación por categorías de hardware">
      <div className="tt-container">
        <ul className="tt-subnav__list">
          <li className="tt-subnav__item">
            <Link
              to="/catalogo"
              className="tt-subnav__link"
              style={{ fontWeight: 700, color: 'var(--tt-color-text-main)' }}
            >
              <Menu size={15} />
              <span>Todas las Categorías</span>
            </Link>
          </li>
          <li className="tt-subnav__item">
            <Link
              to="/catalogo?orden=precio"
              className="tt-subnav__link"
              style={{ color: 'var(--tt-color-primary-dark)', fontWeight: 600 }}
            >
              <Flame size={15} color="var(--tt-color-primary)" />
              <span>Ofertas TechTail</span>
            </Link>
          </li>
          <li className="tt-subnav__item">
            <Link to="/catalogo?categoria=1" className="tt-subnav__link">
              <Server size={14} />
              <span>Servidores Enterprise</span>
            </Link>
          </li>
          <li className="tt-subnav__item">
            <Link to="/catalogo?categoria=2" className="tt-subnav__link">
              <Wifi size={14} />
              <span>Redes &amp; Switches</span>
            </Link>
          </li>
          <li className="tt-subnav__item">
            <Link to="/catalogo?categoria=3" className="tt-subnav__link">
              <BatteryCharging size={14} />
              <span>UPS &amp; Energía</span>
            </Link>
          </li>
          <li className="tt-subnav__item">
            <Link to="/catalogo?categoria=Cableado" className="tt-subnav__link">
              <Activity size={14} />
              <span>Cableado &amp; Fibra</span>
            </Link>
          </li>
          <li className="tt-subnav__item">
            <Link to="/catalogo?categoria=Videovigilancia" className="tt-subnav__link">
              <Camera size={14} />
              <span>Videovigilancia IP</span>
            </Link>
          </li>
          <li className="tt-subnav__item">
            <Link to="/catalogo?categoria=3" className="tt-subnav__link">
              <HardDrive size={14} />
              <span>Almacenamiento</span>
            </Link>
          </li>
          <li className="tt-subnav__item" style={{ marginLeft: 'auto' }}>
            <Link to="/catalogo?orden=precio" className="tt-subnav__link tt-subnav__link--prime">
              <ShieldCheck size={15} color="var(--tt-color-primary)" />
              <span>Membresía TechTail Prime</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
