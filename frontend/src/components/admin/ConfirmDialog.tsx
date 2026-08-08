import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps { open: boolean; title: string; message: string; confirmLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void; }

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, confirmLabel = 'Confirmar', busy, onConfirm, onCancel }) => {
  if (!open) return null;
  return <div className="admin-modal-backdrop"><section className="admin-confirm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
    <AlertTriangle size={28} /><h2 id="confirm-title">{title}</h2><p id="confirm-message">{message}</p>
    <div><button type="button" className="tt-btn tt-btn--secondary" onClick={onCancel} disabled={busy}>Cancelar</button><button type="button" className="tt-btn tt-btn--danger" onClick={onConfirm} disabled={busy}>{busy ? 'Procesando…' : confirmLabel}</button></div>
  </section></div>;
};
