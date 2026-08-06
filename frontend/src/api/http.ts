/**
 * Cliente HTTP Base para TechTail React SPA
 * Incluye soporte automático para la cookie de sesión y el token CSRF de Django.
 */

export function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || '';
  }
  return '';
}

export interface ApiOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Cliente genérico fetch con credenciales e inyección de token CSRF.
 */
export async function http<T = unknown>(url: string, options: ApiOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'X-Requested-With': 'fetch',
    ...options.headers,
  };

  // En métodos que alteran el estado, adjuntamos la cookie 'csrftoken' oficial de Django
  if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    let csrfToken = getCookie('csrftoken');
    if (!csrfToken) {
      try {
        await fetch('/api/csrf/', { credentials: 'include' });
        csrfToken = getCookie('csrftoken');
      } catch {
        // Fallback silencioso por si falla la red
      }
    }
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  const response = await fetch(url, {
    credentials: 'include', // Para enviar/recibir cookies de sesión de Django
    ...options,
    method,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html') || response.redirected) {
    console.error(
      `[HTTP Error] Respuesta no-JSON en ${url}. Status: ${response.status}, Content-Type: ${contentType}, Redirected: ${response.redirected}, Location: ${response.headers.get('location') || 'N/A'}`
    );
    throw new Error(
      'Respuesta HTML inesperada o redirección de sesión. Puedes autenticarte con la versión clásica en /login/'
    );
  }

  let data: Record<string, unknown> | T;
  try {
    data = await response.json();
  } catch {
    console.error(`[HTTP Error] El servidor no devolvió un JSON válido en ${url}.`);
    throw new Error('Respuesta inválida del servidor (formato no es JSON)');
  }

  if (!response.ok || (data && typeof data === 'object' && 'ok' in data && data.ok === false)) {
    const errorMsg =
      (data && typeof data === 'object' && 'mensaje' in data && typeof data.mensaje === 'string'
        ? data.mensaje
        : null) ||
      `Error HTTP ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    Object.assign(error, { payload: data, status: response.status });
    throw error;
  }

  return data as T;
}

export async function getJSON<T = unknown>(url: string, options?: ApiOptions): Promise<T> {
  return http<T>(url, { ...options, method: 'GET' });
}

export async function postJSON<T = unknown>(url: string, body: unknown, options?: ApiOptions): Promise<T> {
  return http<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    body: JSON.stringify(body),
  });
}

export async function postForm<T = unknown>(
  url: string,
  objOrForm: FormData | Record<string, unknown>,
  options?: ApiOptions
): Promise<T> {
  const formData = objOrForm instanceof FormData ? objOrForm : new FormData();
  if (!(objOrForm instanceof FormData)) {
    Object.entries(objOrForm || {}).forEach(([key, val]) => {
      formData.append(key, val !== undefined && val !== null ? String(val) : '');
    });
  }

  return http<T>(url, {
    ...options,
    method: 'POST',
    body: formData,
  });
}
