# Línea Base de Recuperación del Frontend (FASE 0 y 0.1)

## 1. Rama y Commit Base
- **Rama activa:** `recovery/frontend-2026-08-04`
- **Commit base validado:** `37b13e9` (chore(recovery): establish reproducible frontend baseline)

## 2. Estado Git Encontrado
Al iniciar la FASE 0, se encontró el archivo `ARCHIVOS SQL/datos.sql` con modificaciones sin registrar (unstaged). Los archivos de la carpeta `frontend/src` se encontraban correctamente rastreados por Git en esta rama de recuperación.

### Auditoría del archivo `datos.sql` en commit `37b13e9`
El archivo `datos.sql` fue incluido en el commit `37b13e9` porque contenía cambios locales previos a la recuperación (un espacio en blanco/línea vacía eliminada al inicio del archivo). Este cambio no fue originado por la FASE 0, sino que correspondía al caso A: "El archivo ya contenía cambios recuperados antes de la FASE 0 y solamente fue incorporado al commit" al ejecutar el proceso de guardado de línea base.

### Auditoría del archivo `.env`
Se validó correctamente con `git ls-files .env` (vacío) y `git check-ignore -v .env` (regla `*.env` de la línea 8 del `.gitignore`). El archivo `.env` no está siendo rastreado y las credenciales permanecen seguras y fuera del versionamiento.

### Rastreo del Frontend
Se ha comprobado que la carpeta `frontend/src` está debidamente rastreada por Git. El comando `git ls-files frontend/src` reportó un total exacto de **301 archivos** rastreados.

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

## 6. Resultado de las Comprobaciones (FASE 0.1)
- **Node.js:** Versión `v24.19.0`
- **npm:** Versión `11.17.0`
- **npm install:** Ejecutado correctamente (añadidos 40 paquetes).
- **npm run lint:** 0 errores, 2 advertencias (regla `exhaustive-deps` y `no-unused-vars`). Validado con éxito.
- **npm run build:** Construcción de Vite realizada con éxito en 3.30s (compilando los dist `index.html`, `index.css`, `index.js`).
- **Django `manage.py check`:** **Éxito**. "System check identified no issues (0 silenced)." (Ejecutado sin depender de `Activate.ps1`).
- **Django `compileall`:** **Éxito**. Los módulos de Python compilaron correctamente sin errores de sintaxis.

## 7. Incidencias Detectadas
- **Políticas de Ejecución (PowerShell):** El sistema restringe la ejecución de scripts (`.ps1`). Esto bloqueó el script de activación del entorno virtual de Python y el alias nativo `npm`. Se superó mediante `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` y ejecutando Python directamente desde el binario `.\entorno\Scripts\python.exe`.
