import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AdminDrawerProps { open: boolean; title: string; onClose: () => void; children: React.ReactNode; wide?: boolean; }

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ open, title, onClose, children, wide = false }) => {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open, onClose]);
  if (!open) return null;
  return <div className="admin-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`admin-drawer${wide ? ' admin-drawer--wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="admin-drawer-title">
      <header><h2 id="admin-drawer-title">{title}</h2><button type="button" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></header>
      <div className="admin-drawer__body">{children}</div>
    </section>
  </div>;
};
