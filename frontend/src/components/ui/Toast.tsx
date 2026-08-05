import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  autoCloseMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  autoCloseMs = 5000,
}) => {
  useEffect(() => {
    if (!autoCloseMs) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [autoCloseMs, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="tt-toast__icon tt-toast__icon--success" />;
      case 'error':
        return <AlertCircle size={18} className="tt-toast__icon tt-toast__icon--error" />;
      default:
        return <Info size={18} className="tt-toast__icon tt-toast__icon--info" />;
    }
  };

  return (
    <div className={`tt-toast tt-toast--${type}`} role="alert" aria-live="assertive">
      {getIcon()}
      <span className="tt-toast__message">{message}</span>
      <button
        type="button"
        className="tt-toast__close"
        onClick={onClose}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};
