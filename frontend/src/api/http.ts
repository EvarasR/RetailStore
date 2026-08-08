/** Cliente HTTP de la SPA: sesión Django, CSRF, timeouts y errores seguros. */
export function getCookie(name: string): string {
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(';').shift() || '' : '';
}

export interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
  skipSessionExpiredHandling?: boolean;
  timeoutMs?: number;
}

export class HttpError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
  }
}

const protectedPrefixes = [
  '/panel/', '/proveedores/', '/operaciones/', '/api/perfil', '/api/direcciones',
  '/api/seguridad', '/api/carrito', '/api/checkout', '/api/pedidos', '/api/mis-pedidos',
  '/api/favoritos', '/api/membresia', '/api/compras-recurrentes',
];

export function isProtectedApiUrl(url: string): boolean {
  const pathname = url.split('?', 1)[0];
  return protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function safeErrorMessage(status: number, data: Record<string, unknown> | unknown): string {
  const candidate = data && typeof data === 'object' && 'mensaje' in data && typeof data.mensaje === 'string'
    ? data.mensaje.trim()
    : '';
  if (status >= 500 || /(?:traceback|sql|psycopg|django|\\|[a-z]:\/)/i.test(candidate)) {
    return 'El servidor no pudo completar la operación. Inténtalo nuevamente.';
  }
  const defaults: Record<number, string> = {
    400: 'Revisa los datos enviados.',
    401: 'Credenciales o sesión no válidas.',
    402: 'El pago fue rechazado.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso solicitado no existe.',
    409: 'La operación entra en conflicto con el estado actual.',
    422: 'Los datos no cumplen las reglas requeridas.',
  };
  return candidate || defaults[status] || `No se pudo completar la solicitud (${status}).`;
}

export async function http<T = unknown>(url: string, options: ApiOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = { 'X-Requested-With': 'fetch', ...options.headers };

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    let csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      try {
        await fetch('/api/csrf/', { credentials: 'include' });
        csrfToken = getCookie('csrftoken');
      } catch {
        // La solicitud principal devolverá un error de red o CSRF seguro.
      }
    }
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetch(url, { credentials: 'include', ...options, method, headers, signal: controller.signal });
  } catch (reason) {
    if (controller.signal.aborted) throw new HttpError('La solicitud tardó demasiado o fue cancelada.', 0);
    throw new HttpError('No se pudo conectar con el servidor. Revisa tu conexión.', 0, reason);
  } finally {
    window.clearTimeout(timeout);
  }

  const contentType = response.headers.get('content-type') || '';
  const isHtml = contentType.includes('text/html');
  const isLoginRedirect = response.redirected && response.url.includes('/login');
  if ((response.status === 401 || isLoginRedirect) && !options.skipSessionExpiredHandling && isProtectedApiUrl(url)) {
    window.dispatchEvent(new CustomEvent('session_expired'));
    throw new HttpError('La sesión ha caducado. Vuelve a iniciar sesión.', 401);
  }
  if (response.status === 403 && !url.includes('/login') && !url.includes('/registro') && !url.includes('/csrf')) {
    window.dispatchEvent(new CustomEvent('forbidden_access'));
  }
  if (isHtml) throw new HttpError('El servidor devolvió una respuesta inesperada.', response.status);

  let data: Record<string, unknown> | T;
  try {
    data = await response.json();
  } catch {
    throw new HttpError('El servidor devolvió una respuesta no válida.', response.status);
  }

  if (!response.ok || (data && typeof data === 'object' && 'ok' in data && data.ok === false)) {
    if (response.status === 401 && !options.skipSessionExpiredHandling && isProtectedApiUrl(url)) {
      window.dispatchEvent(new CustomEvent('session_expired'));
    }
    throw new HttpError(safeErrorMessage(response.status, data), response.status, data);
  }
  return data as T;
}

export function getJSON<T = unknown>(url: string, options?: ApiOptions): Promise<T> {
  return http<T>(url, { ...options, method: 'GET' });
}

export function postJSON<T = unknown>(url: string, body: unknown, options?: ApiOptions): Promise<T> {
  return http<T>(url, {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    body: JSON.stringify(body),
  });
}

export function postForm<T = unknown>(url: string, objOrForm: FormData | Record<string, unknown>, options?: ApiOptions): Promise<T> {
  const formData = objOrForm instanceof FormData ? objOrForm : new FormData();
  if (!(objOrForm instanceof FormData)) {
    Object.entries(objOrForm || {}).forEach(([key, value]) => {
      formData.append(key, value !== undefined && value !== null ? String(value) : '');
    });
  }
  return http<T>(url, { ...options, method: 'POST', body: formData });
}
