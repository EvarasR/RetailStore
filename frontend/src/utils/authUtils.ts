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
  
  let decoded = next;
  try {
    decoded = decodeURIComponent(next);
    // Segunda pasada por si viene con doble codificación (ej. /%252F%252Fevil.example)
    decoded = decodeURIComponent(decoded);
  } catch {
    return false; // Invalid encoding
  }

  const trimmed = decoded.trim();
  // Debe empezar con '/' pero no con '//' o '/\' (que podría ser un dominio externo sin protocolo)
  if (!trimmed.startsWith('/')) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.startsWith('/\\')) return false;
  if (trimmed.startsWith('\\')) return false;
  
  // Prohibir protocolos explícitos ocultos tras espacios, tabs o mayúsculas
  const normalized = trimmed.toLowerCase().replace(/[\s\t\n\r]/g, '');
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return false;
  if (normalized.startsWith('javascript:')) return false;
  if (normalized.startsWith('data:')) return false;

  return true;
}
