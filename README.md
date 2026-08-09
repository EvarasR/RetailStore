# TechTail / RetailStore

Marketplace DB-First con PostgreSQL 15, Django 5.2 y una SPA React 19 + TypeScript. PostgreSQL conserva las reglas de precio, impuestos, stock, promociones, pedidos, pagos, envío y estados; Django expone servicios JSON y React gestiona captura e interacción.

## Desarrollo en Windows

1. Copia `.env.example` a `.env` y reemplaza todos los `CHANGE_ME`.
   Para el correo de facturas consulta
   [facturación y email](docs/billing-email-notifications.md).
2. Crea el entorno local e instala las dependencias (configuración inicial):

```powershell
cd C:\Users\Admin\OneDrive\Desktop\RetailStore-COPIA
py -m venv entorno
.\entorno\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

Si PowerShell bloquea `Activate.ps1`, habilita los scripts solo para la terminal
actual y vuelve a activarlo (no cambia la política permanente de Windows):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\entorno\Scripts\Activate.ps1
```

3. Con `(entorno)` activo, comprueba el intérprete e inicia Django normalmente:

```powershell
py -c "import sys; print(sys.executable)"
py -c "from decouple import config; print('python-decouple OK')"
py manage.py check
py manage.py runserver
```

El ejecutable mostrado por el primer comando debe ser
`C:\Users\Admin\OneDrive\Desktop\RetailStore-COPIA\entorno\Scripts\python.exe`.
Si la terminal integrada ya abre con `(entorno)` activo, basta con ejecutar
`py manage.py runserver`.

4. En otra terminal inicia React:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Abre `http://127.0.0.1:5173`. Mantén el mismo hostname para Vite y Django, de modo que sesión y CSRF sean coherentes.

## Validación

```powershell
py manage.py test apps.core apps.clientes apps.administracion apps.operaciones apps.proveedores
py manage.py check
py -m compileall apps TiendaRetail
Set-Location frontend
npm.cmd ci
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Producción

Instala `requirements-prod.txt`, configura `DEBUG=False`, genera el build de Vite y sigue [docs/deploy-production.md](docs/deploy-production.md). `frontend/dist`, `staticfiles`, `.env` y backups no se versionan.

Las credenciales PostgreSQL y `SECRET_KEY` utilizados durante desarrollo deben rotarse antes del despliegue porque existieron valores expuestos en plantillas históricas. Nunca guardes secretos reales en `.env.example`.

El acceso soportado es exclusivamente email y contraseña; el proyecto no
requiere Google Cloud. Las facturas PDF pueden enviarse por SMTP mediante la
cola transaccional.

Antes de arrancar esta versión aplica, en orden, los parches SQL `11`, `12` y `13` de
`ARCHIVOS SQL`. Ejecuta el worker `procesar_cola_emails` como un servicio
separado de Gunicorn; la petición web únicamente encola el trabajo.
