# Plan de Migración Progresiva Frontend (Django Templates -> React SPA)

Este documento explica la estrategia no destructiva por etapas para migrar el frontend de **RetailStore / TechTail** desde Django Templates hacia una SPA React moderna.

## 1. Coexistencia de Arquitecturas

- **Sin eliminación de templates:** Los archivos `.html` existentes en `apps/*/templates/` y los estáticos de Django (`apps/core/static/retail/`) no serán eliminados ni alterados durante la migración.
- **Doble acceso durante transición:**
  - Las rutas tradicionales de Django continúan operativas para fallbacks y compatibilidad heredada.
  - El servidor de desarrollo de Vite (`http://localhost:5173`) consume las mismas APIs REST/JSON de Django, usando la misma sesión y cookies.

## 2. Plan por Fases de Implementación

### FASE 1 — Setup React + Integración Base *(En ejecución)*
- Creación de la carpeta `frontend/` con React + Vite + TypeScript.
- Configuración de enrutamiento y proxy local en puerto 8000.
- Cliente HTTP centralizado (`src/api/http.ts`) con cookies y token CSRF.
- Endpoints de autenticación en JSON (`/api/auth/login/`, `/api/auth/registro/`, `/api/auth/logout/`) y autocompletado del buscador (`/api/productos/autocompletar/`).
- Layout y estilos base (`tokens.css`, `global.css`, `marketplace.css`, `AppShell.tsx`, páginas placeholder).

### FASE 2 — Storefront Público
- Rediseño de página de inicio, catálogo y buscador inteligente.
- Carruseles de productos destacados, ofertas y recomendados.

### FASE 3 — Detalle de Producto tipo Amazon
- Galería con miniaturas y zoom.
- Selector de cantidad, botón de compra, wishlist, reseñas y preguntas.

### FASE 4 — Carrito y Checkout
- Carrito interactivo conectado a las APIs DB-first.
- Flujo de Checkout por pasos (dirección, envío, pago simulado, confirmación).

### FASE 5 — Cuenta de Cliente y Prime
- Perfil de usuario diferenciado para `CUSTOMER` y `PREMIUM_CUSTOMER`.
- Pestañas de seguimiento de pedidos, direcciones, favoritos y membresía.

### FASE 6 — Panel Admin Ejecutivo
- Dashboard administrativo renovado y visualmente distinto al cliente.
- Tablas y vistas para productos, inventario, pedidos, clientes y proveedores.

### FASE 7 — Paneles Operativos por Rol
- Portales específicos para `WAREHOUSE_MANAGER`, `SUPPLIER_MANAGER`, `SUPPORT` y proveedor externo (`SUPPLIER`).

### FASE 8 — Limpieza de Templates y Despliegue Producción
- Auditoría de templates antiguos a conservar como fallback vs retirar.
- Configuración de compilación para producción (`npm run build`) en monorepo o estáticos servidos por Django.
