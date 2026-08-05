# Línea Base de Recuperación del Frontend (FASE 0)

## 1. Rama y Commit Base
- **Rama activa:** `recovery/frontend-2026-08-04`
- **Commit base encontrado:** `2406586a4b41a192a4ed71d0ccd9ae7b66530861` (fix(sql): seed technical-sheet PDF metadata before publication)

## 2. Estado Git Encontrado
Al iniciar, se encontró el archivo `ARCHIVOS SQL/datos.sql` con modificaciones sin registrar (unstaged). Los archivos de la carpeta `frontend/src` se encontraban correctamente rastreados por Git en esta rama de recuperación.

## 3. Comandos de Instalación
Para recrear el entorno de manera controlada y reproducible:
```powershell
# Backend
py -m venv entorno
entorno\Scripts\activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

## 4. Variables `.env` Requeridas
Se requiere un archivo `.env` en la raíz del proyecto para que Django funcione correctamente. Las variables necesarias son:
- `SECRET_KEY`
- `DEBUG`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

## 5. Comandos para ejecutar Django y Vite
- **Backend (Django):** `python manage.py runserver`
- **Frontend (Vite):** En la carpeta frontend, ejecutar `npm run dev`

## 6. Resultado de las Comprobaciones
- `python manage.py check`: **Éxito**. "System check identified no issues (0 silenced)." (Requirió la creación de un `.env` base temporal).
- `python -m compileall apps TiendaRetail`: **Éxito**. Los módulos de Python se compilaron correctamente sin errores de sintaxis.
- `npm install`, `npm run lint`, `npm run build`: **Fallido**. (Ver incidencias).

## 7. Incidencias Detectadas
- **Ausencia de Node/npm:** El comando `npm` no se reconoce en el entorno de ejecución actual, por lo que no fue posible compilar ni construir las dependencias del frontend de forma automatizada.
- **Políticas de Ejecución (PowerShell):** El sistema restringe la ejecución de scripts, bloqueando la activación directa de `entorno\Scripts\activate.ps1`.
- **Falta de variables de entorno:** El chequeo de Django (`manage.py check`) fallaba inicialmente por la ausencia de `SECRET_KEY`. Se creó un archivo `.env` base para solucionar esto.

## 8. Archivos Recuperados que no estaban originalmente en Git
Se ha comprobado con `git ls-files frontend/src` que toda la base de código de React (componentes, apis, assets) ya se encuentra rastreada y asegurada en el historial de Git actual, corrigiendo la omisión original. Se ha blindado el archivo `.gitignore` para prevenir que `node_modules` y directorios de compilación vuelvan a subirse accidentalmente.
