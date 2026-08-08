import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../hooks/useAuth';
import { RoleRoute } from './RoleRoute';

vi.mock('../hooks/useAuth', () => ({ useAuth: vi.fn() }));
const mockedUseAuth = vi.mocked(useAuth);

function renderRoleRoute() {
  render(
    <MemoryRouter initialEntries={['/warehouse/pedidos?estado=PENDIENTE']}>
      <Routes>
        <Route
          path="/warehouse/pedidos"
          element={<RoleRoute requiredRole="WAREHOUSE_MANAGER"><div>Panel autorizado</div></RoleRoute>}
        />
        <Route path="/login" element={<div>Página de acceso</div>} />
        <Route path="/403" element={<div>Acceso denegado</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envía sesiones anónimas al login sin perder next', () => {
    mockedUseAuth.mockReturnValue({ autenticado: false, loading: false, roles: [] } as unknown as ReturnType<typeof useAuth>);
    renderRoleRoute();
    expect(screen.getByText('Página de acceso')).toBeInTheDocument();
  });

  it('rechaza un CUSTOMER en una ruta operativa', () => {
    mockedUseAuth.mockReturnValue({
      autenticado: true,
      loading: false,
      es_admin: false,
      es_proveedor_externo: false,
      roles: ['CUSTOMER'],
    } as ReturnType<typeof useAuth>);
    renderRoleRoute();
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });

  it('permite al rol interno expresamente autorizado', () => {
    mockedUseAuth.mockReturnValue({
      autenticado: true,
      loading: false,
      es_admin: false,
      es_proveedor_externo: false,
      roles: ['WAREHOUSE_MANAGER'],
    } as ReturnType<typeof useAuth>);
    renderRoleRoute();
    expect(screen.getByText('Panel autorizado')).toBeInTheDocument();
  });
});
