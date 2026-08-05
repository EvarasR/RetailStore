# TechTail / RetailStore — Frontend React SPA

Este documento describe la arquitectura, configuración y ejecución del nuevo frontend basado en **React 18/19, Vite y TypeScript**, diseñado para integrarse con **Django 5.2 + PostgreSQL (DB-First)** de forma no destructiva.

## 1. Estructura del Proyecto

El frontend reside en el directorio raíz `frontend/`:
- **Framework:** React con TypeScript.
- **Bundler / Dev Server:** Vite (`http://localhost:5173`).
- **Enrutador:** React Router DOM (v7/v6).
- **Estilos:** Vanilla CSS con variables por temas y tokens de diseño (`tokens.css`, `global.css`, `marketplace.css`).
- **Iconos:** `lucide-react`.

## 2. Cómo Correr en Desarrollo (Recomendación de Host Base)

> [!IMPORTANT]
> **Usa siempre `127.0.0.1` en ambos servidores** para garantizar que el navegador comparta las cookies (`sessionid`, `csrftoken`) entre el backend Django y la SPA React sin problemas de aislamiento de dominio.

### A. Backend Django (`http://127.0.0.1:8000`)
En una terminal, desde la raíz del proyecto Django:
```bash
python manage.py runserver 127.0.0.1:8000
```
*Asegúrate de tener la base de datos PostgreSQL en ejecución y que `requirements.txt` esté instalado.*

### B. Frontend React (`http://127.0.0.1:5173`)
En otra terminal, dentro del directorio `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
Accede en tu navegador a: **`http://127.0.0.1:5173`** (o `http://localhost:5173` solo si corres Django en `http://localhost:8000`).

## 3. Conexión con Django y Seguridad CSRF

1. **Proxy Integrado en Vite (`vite.config.ts`):**
   Toda petición hacia `/api`, `/panel/api`, `/proveedores/api`, `/operaciones/api`, `/media` o `/static` se redirige de forma transparente al backend en `http://127.0.0.1:8000`. Esto permite compartir la misma sesión (`sessionid`) y cookie CSRF (`csrftoken`) sin conflictos de CORS.

2. **Manejo Automático de CSRF (Doble Garantía):**
   - El endpoint `/api/session/` está decorado con `@ensure_csrf_cookie`, garantizando que la cookie `csrftoken` se emita en cuanto la SPA carga.
   - Adicionalmente, se dispone del endpoint dedicado `GET /api/csrf/` en `apps/core/urls.py` decorado con `@ensure_csrf_cookie` como respaldo técnico.
   - El cliente HTTP en `src/api/http.ts` lee la cookie `csrftoken` y la envía como encabezado `X-CSRFToken` en peticiones `POST`, `PUT` y `DELETE`.
   - Todas las llamadas envían `credentials: 'include'` y cabecera `X-Requested-With: fetch`. No se utiliza `@csrf_exempt` en ninguna vista.

## 4. Filosofía DB-First (Reglas Críticas)

- El frontend React **nunca calcula** precios, descuentos, stock, PVP, impuestos o membresías Prime.
- Todas las mutaciones del carrito o compras se realizan llamando a los endpoints oficiales de Django (`/api/carrito/agregar/`, `/api/carrito/actualizar/`, `/api/checkout/crear-pedido/`).
- La lógica financiera, inventarios, kardex y estados del sistema se mantienen 100% en **PostgreSQL**.
