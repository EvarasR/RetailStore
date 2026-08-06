import type { SessionState } from '../types/user.types';

/**
 * Retorna la ruta interna predeterminada según la prioridad de roles del usuario.
 */
export function getDefaultRouteForSession(session: Pick<SessionState, 'es_proveedor_externo' | 'es_admin' | 'roles'>): string {
  if (session.es_proveedor_externo) {
    return '/proveedor/dashboard';
  }
  if (session.es_admin || session.roles.includes('ADMIN')) {
    return '/admin/dashboard';
  }
  if (session.roles.includes('WAREHOUSE_MANAGER')) {
    return '/warehouse/dashboard';
  }
  if (session.roles.includes('SUPPLIER_MANAGER')) {
    return '/supplier-manager/dashboard';
  }
  if (session.roles.includes('SUPPORT')) {
    return '/support/dashboard';
  }
  // Default para CUSTOMER, PREMIUM_CUSTOMER o usuario general autenticado
  return '/cuenta';
}

/**
 * Valida que una URL `next` sea segura para redirigir internamente.
 */
export function isValidNextRoute(next: string | null | undefined): boolean {
  if (!next || typeof next !== 'string') return false;
  
  const trimmed = next.trim();
  // Debe empezar con '/' pero no con '//' (que podría ser un dominio externo sin protocolo)
  // Tampoco debe empezar con 'http' ni 'javascript:'
  if (!trimmed.startsWith('/')) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.toLowerCase().startsWith('http')) return false;
  if (trimmed.toLowerCase().startsWith('javascript:')) return false;

  return true;
}
