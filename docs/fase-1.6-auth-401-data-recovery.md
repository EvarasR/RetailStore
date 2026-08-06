# Fase 1.6: Auditoría de Datos y Corrección de 401

Este documento reporta los hallazgos y correcciones aplicadas durante la Fase 1.6 tras el reporte de error 401 en el login y la eliminación del rol ficticio.

## 1. Auditoría del Rol Eliminado
* **Causa de la eliminación:** En la Fase 1.5 se ejecutó un script temporal (`verify_auth.py` o shell) que contenía llamadas al ORM (`.delete()`) sobre la tabla de roles y la tabla de asignación.
* **Estado en el Seed Oficial:** Al inspeccionar `ARCHIVOS SQL/datos.sql`, se confirmó que el rol `PROVEEDOR` **nunca formó parte del seed oficial**. Los únicos 6 roles oficiales son: `CUSTOMER`, `PREMIUM_CUSTOMER`, `ADMIN`, `WAREHOUSE_MANAGER`, `SUPPLIER_MANAGER` y `SUPPORT`.
* **Datos Restaurados:** **Ninguno**. 
* **Justificación:** Ya que el rol no forma parte de los datos estables de la aplicación y las autorizaciones modernas dependen de la propiedad nativa `es_proveedor_externo`, se determinó que no existía dependencia legítima y no se requería restaurarlo.

> **Importante:** No se ejecutaron operaciones `DELETE`, `TRUNCATE` ni `DROP` durante esta fase. Se generó previamente un volcado JSON de seguridad para el módulo `core`.

## 2. Auditoría del Administrador y Causa del 401
* **Cuenta ADMIN:** El usuario `admin@retailprime.local` **existe** y está **activo**.
* **Roles Asociados:** Su rol asociado principal sigue siendo `ADMIN`.
* **Causa exacta del 401:** Durante el script de verificación automatizado en la Fase 1.5, se cambió exitosamente la contraseña de este y otros usuarios a `TestPass123!`. Como el cliente intentaba iniciar sesión con la contraseña antigua (`RetailPrime2026*`), el backend devolvía correctamente un HTTP 401.
* **Respuesta JSON Real:** `{"ok": false, "mensaje": "Credenciales incorrectas"}` (HTTP 401).

## 3. Corrección del Manejo 401 en el Frontend (React)
Anteriormente, el cliente HTTP (`http.ts`) trataba cualquier 401 (incluso durante `/api/auth/login/`) como una caducidad de sesión. Esto se corrigió:
1. **Diferenciación de Endpoints:** Se implementó `skipSessionExpiredHandling`. El login y registro no disparan el evento `session_expired`.
2. **Visualización de Error:** `LoginPage.tsx` ahora muestra el mensaje real (`Credenciales incorrectas`) emitido por la API y ya no redirige ni superpone un "La sesión ha caducado".
3. **Manejo Real de Sesión Caducada:** Si se intenta acceder a una ruta protegida y falla (ej., sesión del browser borrada), se dispara el evento, limpia la sesión local, redirige a `/login?next=...` y muestra "Sesión caducada".

## 4. Validación de Registro y Backend
* **Registro de nuevo usuario:** Se ejecutaron pruebas reales de registro, recibiendo código HTTP 200 y una sesión activa.
* **Manejo de Errores DB:** Se corrigió un error 500 originado en el procedimiento almacenado (SQL) cuando se enviaba un correo duplicado, atrapándolo en la vista y respondiendo correctamente un JSON con código HTTP 400.
* **Validaciones Técnicas:** Se ejecutaron y pasaron `manage.py check`, `compileall`, tests de Backend (`apps.core` y `apps.proveedores`), así como `npm run lint` y `npm run build` sin errores ni advertencias.
