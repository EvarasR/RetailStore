# Frontend React TechTail

## Arquitectura efectiva

La SPA usa React 19, TypeScript, Vite, React Router y CSS propio. El inventario actual contiene 53 páginas, 121 componentes, 35 clientes API, 33 hooks, 31 módulos de tipos y 62 declaraciones de ruta. Los guards son `ProtectedRoute` y `RoleRoute`; `SessionNavigationBridge` convierte eventos de sesión en navegación SPA segura.

El cliente `src/api/http.ts` usa cookies Django con `credentials: include`, obtiene CSRF, acepta JSON y `FormData`, aplica timeout, distingue estados HTTP y elimina HTML o detalles internos de los mensajes visibles. No se usa JWT, Redux ni una librería UI externa.

## Ejecución

Backend, desde la raíz:

```powershell
.\entorno\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Frontend:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Vite redirige `/api/`, `/panel/api/`, `/proveedores/api/`, `/operaciones/api/`, `/media/` y `/static/` a Django. Usa `127.0.0.1` en ambos procesos o `localhost` en ambos; no mezcles hosts.

## DB-First

React presenta valores devueltos por Django. No calcula PVP, subtotal oficial, IVA, descuentos, Prime, stock, envío, entrega, total, reembolso ni transición de estados. El checkout persiste solo identificadores de recuperación y vuelve a consultar el pedido oficial.

## Pruebas

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Vitest cubre redirecciones internas, prioridad de roles y clasificación segura de errores HTTP. Las pruebas de navegador por rol siguen la matriz manual de `docs/final-production-checklist.md` y no deben marcarse como aprobadas sin ejecutarse con cuentas y datos controlados.
