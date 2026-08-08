import React, { useState } from 'react';
import { Edit3, ExternalLink, FileText, Link2, MoreVertical, Pause, Play, Power, Truck, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProductManagementTab } from './ProductManagementDrawer';

interface AdminProductActionsProps {
  codProducto: number;
  estado: string;
  publicable: boolean;
  actionLoading: boolean;
  onPublish: (id: number) => Promise<unknown>;
  onPause: (id: number) => Promise<unknown>;
  onDeactivate: (id: number) => Promise<unknown>;
  onManage: (id: number, tab: ProductManagementTab) => void;
}

export const AdminProductActions: React.FC<AdminProductActionsProps> = ({ codProducto, estado, publicable, actionLoading, onPublish, onPause, onDeactivate, onManage }) => {
  const [open, setOpen] = useState(false);
  const manage = (tab: ProductManagementTab) => { setOpen(false); onManage(codProducto, tab); };
  return <div className="admin-row-menu">
    <button type="button" className="admin-row-menu__trigger" onClick={() => setOpen((current) => !current)} aria-haspopup="menu" aria-expanded={open} aria-label="Acciones del producto"><MoreVertical size={18} /></button>
    {open ? <div className="admin-row-menu__popover" role="menu">
      <Link to={`/producto/${codProducto}`} target="_blank" role="menuitem"><ExternalLink size={15} />Ver en tienda</Link>
      <button type="button" role="menuitem" onClick={() => manage('datos')}><Edit3 size={15} />Editar</button>
      <button type="button" role="menuitem" onClick={() => manage('multimedia')}><Video size={15} />Multimedia</button>
      <button type="button" role="menuitem" onClick={() => manage('multimedia')}><FileText size={15} />Ficha técnica</button>
      <button type="button" role="menuitem" onClick={() => manage('proveedores')}><Truck size={15} />Proveedores</button>
      <button type="button" role="menuitem" onClick={() => manage('especificaciones')}><Link2 size={15} />Relacionados</button>
      {estado !== 'PUBLICADO' ? <button type="button" role="menuitem" disabled={actionLoading || !publicable} onClick={() => { setOpen(false); onPublish(codProducto); }}><Play size={15} />Publicar</button> : <button type="button" role="menuitem" disabled={actionLoading} onClick={() => { setOpen(false); onPause(codProducto); }}><Pause size={15} />Pausar</button>}
      {estado !== 'DESACTIVADO' ? <button type="button" role="menuitem" className="is-danger" disabled={actionLoading} onClick={() => { setOpen(false); onDeactivate(codProducto); }}><Power size={15} />Desactivar</button> : null}
    </div> : null}
  </div>;
};
