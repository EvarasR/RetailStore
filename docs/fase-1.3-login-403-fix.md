# Reporte FASE 1.3: Corrección de 403 CSRF en Login y Registro

## 1. Registro exacto que confirmó el fallo
Durante la auditoría, se capturaron los siguientes errores en el servidor de Django originados al usar el proxy de Vite en React:
```text
Forbidden (Origin checking failed - http://localhost:5173 does not match any trusted origins.): /api/auth/login/
Forbidden (Origin checking failed - http://localhost:5173 does not match any trusted origins.): /api/auth/registro/
```

## 2. Causa raíz
El fallo 403 Forbidden era generado por el `CsrfViewMiddleware` de Django, no por reglas de negocio o permisos de roles. 
React realizaba el POST a través del proxy de Vite configurado con `changeOrigin: true`. Esto provocaba que el encabezado `Host` enviado a Django fuera `127.0.0.1:8000`, mientras que el encabezado `Origin` aportado por el navegador seguía siendo `http://localhost:5173`. Ante esta disparidad, y sin tener configurado el origen en la lista blanca (`CSRF_TRUSTED_ORIGINS`), Django abortaba la petición asumiendo un riesgo de seguridad.

Simultáneamente, el interceptor genérico en `http.ts` encubría este problema, mapeando cualquier respuesta 403 estática al mensaje "No tienes permisos para realizar esta acción".

## 3. Valor requerido de `CSRF_TRUSTED_ORIGINS`
Para solucionar el bloqueo en desarrollo sin alterar artificialmente el origen a través de Vite o bajar la guardia de Django, se requiere añadir la siguiente línea al archivo `.env` local:
```env
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
Esta clave ha sido documentada en el `.env.example` y no expone datos sensibles. No debe rastrearse el `.env` real.

## 4. Flujo de CSRF implementado
El flujo de inicialización y validación queda estructurado de la siguiente manera:
1. `LoginPage`/`RegisterPage` invocan la acción `login`/`registro` de `AuthContext`.
2. `http.ts` evalúa la existencia local de la cookie `csrftoken`.
3. Si no existe, realiza previamente un `GET /api/csrf/`.
4. Django (`api_csrf` con `@ensure_csrf_cookie`) despacha la cookie validada.
5. El cliente adjunta el valor en el encabezado `X-CSRFToken` y envía el POST principal con `credentials: include`.
6. Si ocurre un fallo legítimo de CSRF, la nueva vista personalizada `CSRF_FAILURE_VIEW` en Django devuelve un JSON estructurado (403), el cual `http.ts` traduce en la UI como *"No se pudo validar la sesión de seguridad. Recarga el formulario e inténtalo nuevamente"*, evitando un bucle.

## 5. Resultados funcionales
Tras las correcciones de origen, el flujo de seguridad demostró total estabilidad.

### Cliente de Django (Pruebas Automatizadas: `apps.core.tests.test_login_api`)
- `GET /api/csrf/`: Status 200, asigna la cookie correctamente.
- `POST /api/auth/login/` (Sin CSRF): Status 403, devuelto por el JSON nativo.
- `POST /api/auth/registro/` (Con CSRF Válido): Status OK / Validation, aprueba el filtro.
- Todo test exitoso sin errores en suite.

### Navegador y Pruebas Manuales
Las pruebas de integración en entorno real con la base de datos confirmaron que la sesión transita y funciona:
- **Resultado del login CUSTOMER/ADMIN**: Inicio de sesión 200 OK. La cookie se anexa y el enrutador avanza automáticamente a `/cuenta` y `/admin/dashboard`.
- **Resultado del registro**: 200/201 OK. Creación fluida del perfil y confirmación por pantalla, sin interrupciones 403.
- **Resultado de credenciales inválidas**: El endpoint devuelve un 401 puro con el mensaje "Credenciales incorrectas" en formato JSON, que es visualizado correctamente en pantalla de login gracias a que el manejador `http.ts` deja pasar los errores controlados sin manipularlos genéricamente.

## 6. Confirmaciones Finales Obligatorias
- **Proxy Conservado**: Se confirma que `changeOrigin: true` se ha mantenido intacto en `vite.config.ts`.
- **Exención Inexistente**: Se ratifica que NO se empleó `@csrf_exempt` bajo ningún motivo. La protección de Django opera normalmente.
