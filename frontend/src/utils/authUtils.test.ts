import { describe, expect, it } from 'vitest';
import { getDefaultRouteForSession, isValidNextRoute } from './authUtils';

describe('isValidNextRoute', () => {
  it.each(['/cuenta/pedidos', '/producto/12', '/checkout?paso=pago'])('acepta rutas SPA internas: %s', (route) => {
    expect(isValidNextRoute(route)).toBe(true);
  });

  it.each([
    'https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)',
    'data:text/html,test', '/%2F%2Fevil.example', '/%252F%252Fevil.example',
  ])('rechaza redirecciones externas o peligrosas: %s', (route) => {
    expect(isValidNextRoute(route)).toBe(false);
  });
});

describe('getDefaultRouteForSession', () => {
  it('prioriza proveedor externo sin convertir ADMIN automáticamente', () => {
    expect(getDefaultRouteForSession({ es_proveedor_externo: true, es_admin: true, roles: ['ADMIN'] })).toBe('/proveedor/dashboard');
    expect(getDefaultRouteForSession({ es_proveedor_externo: false, es_admin: true, roles: ['ADMIN'] })).toBe('/admin/dashboard');
  });

  it.each([
    ['WAREHOUSE_MANAGER', '/warehouse/dashboard'],
    ['SUPPLIER_MANAGER', '/supplier-manager/dashboard'],
    ['SUPPORT', '/support/dashboard'],
    ['CUSTOMER', '/cuenta'],
  ])('dirige %s a su portal', (role, expected) => {
    expect(getDefaultRouteForSession({ es_proveedor_externo: false, es_admin: false, roles: [role] })).toBe(expected);
  });
});
