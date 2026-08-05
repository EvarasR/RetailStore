import React from 'react';

interface AdminStatusBadgeProps {
  status: string | number;
  label?: string;
}

export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({ status, label }) => {
  const code = String(status).toUpperCase();
  const text = label || code;

  let colorClass = 'admin-badge-gray';

  if (
    ['PUBLICADO', 'ENTREGADO', 'DISPONIBLE', 'APROBADO', 'PAGADO', 'ACTIVO'].includes(code)
  ) {
    colorClass = 'admin-badge-green';
  } else if (
    ['EN_REVISION', 'PREPARANDO', 'EN_TRANSITO', 'RESERVADO', 'EN_BODEGA', 'PROCESANDO'].includes(code)
  ) {
    colorClass = 'admin-badge-blue';
  } else if (
    ['BORRADOR', 'PAUSADO', 'AGOTADO', 'ALERTA', 'PENDIENTE', 'CREADO', 'LISTO_ENVIO'].includes(code)
  ) {
    colorClass = 'admin-badge-amber';
  } else if (
    ['DESACTIVADO', 'CANCELADO', 'RECHAZADO', 'ERROR', 'CRITICO'].includes(code)
  ) {
    colorClass = 'admin-badge-red';
  }

  return <span className={`admin-badge ${colorClass}`}>{text}</span>;
};
