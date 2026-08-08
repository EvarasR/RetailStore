import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { NotificationCard } from './NotificationCard';

describe('NotificationCard', () => {
  it('solo ofrece navegación para rutas internas seguras', () => {
    const base = { cod_notificacion: 1, tipo: 'SOPORTE', titulo: 'Actualización', mensaje: 'Tu solicitud fue atendida', leida: false };
    const { rerender } = render(<MemoryRouter><NotificationCard notification={{ ...base, url_accion: 'https://externo.example' }} onMarkRead={vi.fn()} /></MemoryRouter>);
    expect(screen.queryByRole('link', { name: /Ver producto/i })).not.toBeInTheDocument();
    rerender(<MemoryRouter><NotificationCard notification={{ ...base, url_accion: '/producto/42' }} onMarkRead={vi.fn()} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /Ver producto/i })).toHaveAttribute('href', '/producto/42');
  });
});
