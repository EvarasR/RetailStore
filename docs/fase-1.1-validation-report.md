# FASE 1.1: Validación y Endurecimiento de Autenticación y Rutas React

## 1. Estado inicial y commit
- **Hash exacto del commit de la FASE 1**: `4cfd2f8 feat(auth): secure React session and role routing`
- **Hash del nuevo commit (FASE 1.1)**: `2be6f10 fix(auth): harden session and role routing`
- **Rama actual**: `feat/react-auth-routing-security`
- **Archivos creados inicialmente**: `docs/fase-1-auth-routing.md`, `frontend/src/pages/ForbiddenPage.tsx`, `frontend/src/pages/NotFoundPage.tsx`, `frontend/src/providers/AuthProvider.tsx`, `frontend/src/utils/authUtils.ts`
- **Archivos modificados inicialmente**: Múltiples Sidebars y Headers, App.tsx, http.ts, useAuth.ts, LoginPage.tsx, AppRouter.tsx, RoleRoute.tsx, user.types.ts, apps/core/views.py.
- **Árbol limpio**: Confirmado.

## 2. Arquitectura real de providers y router
```text
AuthProvider
└── BrowserRouter
    └── AppShell
        └── AppRouter
            ├── Header
            ├── Rutas
            └── Footer
```
El `AuthProvider` envuelve a `BrowserRouter`. Esto es válido y robusto porque el proveedor no utiliza hooks de enrutamiento de React (`useNavigate`, `useLocation`) internamente, sino llamadas HTTP nativas y limpieza local.

## 3. Contrato final de `/api/session/`
**Anónimo:**
```json
{
  "ok": true,
  "autenticado": false,
  "usuario": null,
  "es_admin": false,
  "es_prime": false,
  "es_proveedor_externo": false,
  "cod_proveedor": null,
  "roles": []
}
```

**CUSTOMER (`cliente@example.test`):**
```json
{
  "ok": true,
  "autenticado": true,
  "es_admin": false,
  "es_prime": false,
  "es_proveedor_externo": false,
  "cod_proveedor": null,
  "roles": ["CUSTOMER"],
  "usuario": {
    "id": 100,
    "cod_usuario": 100,
    "email": "cliente@example.test",
    "nombre": "Usuario Cliente",
    "nombres": "Usuario",
    "apellidos": "Cliente",
    "nombre_completo": "Usuario Cliente"
  }
}
```

**SUPPLIER_MANAGER (sin asociación de proveedor externo):**
```json
{
  "es_proveedor_externo": false,
  "cod_proveedor": null,
  "roles": ["SUPPLIER_MANAGER"]
}
```

**Proveedor externo asociado:**
```json
{
  "es_proveedor_externo": true,
  "cod_proveedor": 100,
  "roles": []
}
```

**ADMIN sin asociación:**
`es_proveedor_externo: false, cod_proveedor: null` y roles `["ADMIN"]`. La consulta utiliza `es_usuario_proveedor(user)` que valida que tenga el rol y esté directamente vinculado.

## 4. Contabilizar solicitudes de sesión
Llamadas físicas a `/api/session/`:
- **2 archivos principales**: `AuthProvider.tsx` (al inicializarse) y `LoginPage.tsx` (para refresco tras credenciales, y para cookie de CSRF inicial si es visitante y va directo al form).
- Eventos que provocan nueva llamada: Inicialización global (refresh de la SPA), login exitoso.
- El resto de componentes consumen `useAuth()` sin provocar llamadas HTTP a backend.
- En StrictMode de desarrollo ocurren dos llamadas simultáneas pero no en producción.

## 5. Validación del parámetro `next`
- `/cuenta/pedidos` -> **Aceptado**
- `/producto/12` -> **Aceptado**
- `/checkout` -> **Aceptado**
- `/catalogo?q=teclado` -> **Aceptado**
- `https://evil.example` -> Rechazado
- `http://evil.example` -> Rechazado
- `//evil.example` -> Rechazado
- `///evil.example` -> Rechazado (incluso codificado como `/%2F%2Fevil.example` luego de la corrección)
- `javascript:alert(1)` -> Rechazado
- `data:text/html,test` -> Rechazado
- `\evil.example` -> Rechazado

Se reparó la función `isValidNextRoute` para validar el parámetro luego de decodificarlo.

## 6. Redirección predeterminada central
- **Función:** `getDefaultRouteForSession` en `authUtils.ts`.
- **Prioridad:**
  1. `es_proveedor_externo` -> `/proveedor/dashboard`
  2. `ADMIN` -> `/admin/dashboard`
  3. `WAREHOUSE_MANAGER` -> `/warehouse/dashboard`
  4. `SUPPLIER_MANAGER` -> `/supplier-manager/dashboard`
  5. `SUPPORT` -> `/support/dashboard`
  6. default -> `/cuenta`
La lógica está centralizada sin duplicaciones en los componentes de validación.

## 7. Validar ProtectedRoute
- **Cargando:** Skeleton nativo.
- **Anónimo:** Redirección a `/login?next=...` preservando la ruta. (Se arregló el uso de `state` a URL Params explícito).
- **Autenticado:** Muestra a los hijos (children).

## 8. Validar RoleRoute (Escenarios)
- **CUSTOMER** a `/cuenta`: Permitido.
- **CUSTOMER** a dashboards (admin, etc): **403**.
- **ADMIN** a `/admin/dashboard`: Permitido.
- **ADMIN** a `/proveedor/dashboard`: **403**. (El administrador no puede ingresar directamente como externo sin estar vinculado en BD).
- **WAREHOUSE_MANAGER** a `/warehouse/dashboard`: Permitido.
- **SUPPLIER_MANAGER** (interno) a `/proveedor/dashboard` (externo): **403**.
- **Proveedor asociado** a `/proveedor/dashboard`: Permitido (basado puramente en flag `es_proveedor_externo`).

## 9. Aislamiento del proveedor externo
En `portal_service.py` el backend ejecuta:
`proveedor = obtener_proveedor_usuario(usuario)` y autoriza únicamente sobre ese `cod_proveedor`. Totalmente aislado y blindado.

## 10. Validar 401, 403 y HTML inesperado
- Se modificó `http.ts` para que un 401 y una redirección pura de login originen un evento `session_expired`.
- El 403 lanza error para pintar mensaje pero no limpia la sesión localmente.
- Cualquier otro HTML (e.g. un 500 error o un 404) lanza error de fallo genérico de JSON pero no destruye la sesión autenticada local.

## 11. Listener de `session_expired`
- Evento central: `session_expired`.
- Listener en `AuthProvider.tsx` inicializado solo una vez y con limpieza (removeEventListener) correcta.

## 12. Logout
- Consume `POST /api/auth/logout/`.
- Limpia los flags locales.
- Tolera que ya haya expirado la sesión de Django, ejecutando un reinicio de estados en frontend de igual manera.
- Tras la limpieza, ProtectedRoute enruta transparentemente a /login.

## 13. Rutas legacy y páginas 403/404
- `/perfil` y `/pedidos` redirigen hacia `/cuenta/perfil` y `/cuenta/pedidos` dinámicamente en el router de React.
- Rutas erróneas llevan a `NotFoundPage` (404), una pantalla 100% React sin fugas legacy.

## 14. Búsquedas obligatorias
- `DjangoFallbackPage` -> Eliminada completamente.
- `fallbackPath` -> Cero resultados.
- `href="/panel/"` -> Persiste exclusivamente en cajones de visualización secundaria (e.g. ProviderOrderDrawer, SupplierDetailDrawer), clasificados en diseño original como "CRUD aún no migrados" y son enlaces con `target="_blank"`. Esto es adecuado temporalmente.
- `href="/proveedores/"` -> Igualmente existe en acciones fallback hacia el portal clásico.
- `href="/perfil/"` y `/pedidos/` -> **0 resultados**. (Se limpiaron de `AccountDashboardPage.tsx`).

## 15. Validación Backend
- `python manage.py check`: OK.
- `python -m compileall`: OK.
- `npm run lint`: OK (4 warnings nativos inofensivos).
- `npm run build`: OK.
