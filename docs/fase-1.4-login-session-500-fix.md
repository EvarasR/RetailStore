# Informe de Fase 1.4: Diagnóstico y Corrección de Error 500 en Login

## Información Base
- **Commit Base de la Fase:** (El commit desde el cual partió la FASE 1.4)
- **Rama Actual:** feat/react-auth-routing-security

## Análisis de la Excepción (Error 500)
- **Tipo de Excepción:** `django.db.utils.ProgrammingError` (Precedida por `psycopg.errors.UndefinedTable`)
- **Mensaje:** `no existe la relación «django_session»`
- **Archivo:** `apps/core/views.py`
- **Función:** `api_auth_registro` (y también `api_auth_login`)
- **Línea de Código Exacta que Falló:** `login(request, user)` (Línea 349 original de registro)
- **Explicación Técnica:** La función `login()` de Django intenta regenerar o crear un session identifier en el backend. Sin embargo, al no haberse corrido las migraciones de Django porque el proyecto utiliza `managed=False` para las tablas de dominio, la tabla de infraestructura requerida por Django (`django_session`) no existía, provocando una caída a nivel de PostgreSQL que Django no manejaba controladamente.

## Infraestructura de Sesiones Actual
- **Valor real de SESSION_ENGINE:** El valor predeterminado `"django.contrib.sessions.backends.db"`, ya que no se encuentra sobreescrito en `TiendaRetail/settings.py`.
- **Estado de su infraestructura:** La tabla fue creada aplicando la migración explícita con `manage.py migrate sessions`.

### Configuración de Cookies
- **SESSION_COOKIE_NAME:** `sessionid` (predeterminado)
- **SESSION_COOKIE_HTTPONLY:** `True`
- **SESSION_COOKIE_SAMESITE:** `"Lax"`
- **SESSION_COOKIE_SECURE:** False (En entorno local `not DEBUG`).
- **Duración de Sesión:** (Predeterminada por Django)

## Modificaciones Realizadas

### `apps/core/views.py`
- **Por qué:** Se refactorizó la lógica en `api_auth_login` y `api_auth_registro` para interceptar `Exception` genéricas.
- **Detalle:** Se añadieron bloques `try-except` más finos en torno al proceso de autenticación de usuario y en la invocación de `login()`. Ahora se registra la traza de la excepción usando el logger estándar de Python en lugar de silenciarla o transformarla en 401 Credenciales Incorrectas, devolviendo un error 500 con formato JSON seguro (`_json_error`).
- En `api_auth_registro`, se implementó el contexto transaccional nativo (`with transaction.atomic():`) para evitar un estado ambiguo donde el alta (creación) en la BD funcionaba exitosamente, pero fallaba la creación de sesión, causando que el usuario quedase huérfano de login y al reintentar fallase con "usuario ya existe".

### `apps/core/tests/test_login_api.py`
- **Por qué:** Los mocks previos y el uso de `SimpleTestCase` requerían ajustes debido a los cambios implementados para atrapar correctamente los errores.
- **Detalle:** Se incluyó un parche sobre `transaction.atomic` para no exigir interacción real de base de datos durante los unit tests en modo `SimpleTestCase`. Adicionalmente, se integró el assert adecuado que corrobora la devolución de una estructura JSON 500 para un fallo simulado de autenticación.
