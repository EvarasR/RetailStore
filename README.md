# TechTail / RetailStore

Marketplace DB-First con PostgreSQL 15, Django 5.2 y una SPA React 19 + TypeScript. PostgreSQL conserva las reglas de precio, impuestos, stock, promociones, pedidos, pagos, envío y estados; Django expone servicios JSON y React gestiona captura e interacción.

## Desarrollo en Windows

1. Copia `.env.example` a `.env` y reemplaza todos los `CHANGE_ME`.
2. Instala Python y valida el intérprete del entorno:

```powershell
.\entorno\Scripts\python.exe --version
.\entorno\Scripts\python.exe -m pip install -r requirements.txt
.\entorno\Scripts\python.exe -c "from decouple import config; print('python-decouple OK')"
```

3. Inicia Django usando siempre el venv (no uses `py manage.py`):

```powershell
.\entorno\Scripts\python.exe manage.py check
.\entorno\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

4. En otra terminal inicia React:

```powershell
Set-Location frontend
npm.cmd ci
npm.cmd run dev
```

Abre `http://127.0.0.1:5173`. Mantén el mismo hostname para Vite y Django, de modo que sesión y CSRF sean coherentes.

## Validación

```powershell
.\entorno\Scripts\python.exe manage.py test apps.core apps.clientes apps.administracion apps.operaciones apps.proveedores
.\entorno\Scripts\python.exe manage.py check
.\entorno\Scripts\python.exe -m compileall apps TiendaRetail
Set-Location frontend
npm.cmd ci
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## Producción

Instala `requirements-prod.txt`, configura `DEBUG=False`, genera el build de Vite y sigue [docs/deploy-production.md](docs/deploy-production.md). `frontend/dist`, `staticfiles`, `.env` y backups no se versionan.

Las credenciales PostgreSQL y `SECRET_KEY` utilizados durante desarrollo deben rotarse antes del despliegue porque existieron valores expuestos en plantillas históricas. Nunca guardes secretos reales en `.env.example`.
