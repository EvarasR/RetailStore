# Recuperación del proyecto TechTail / RetailStore

## Qué se recuperó

La carpeta `frontend/` del archivo recibido contenía 314 archivos fuente y no pertenecía a ningún commit anterior. Se creó la rama:

```text
recovery/frontend-2026-08-04
```

En esa rama el frontend, la documentación, los assets, los cambios Django, los scripts SQL y los archivos multimedia quedan rastreados por Git.

## Restauración recomendada desde el Git bundle

En Windows PowerShell o CMD:

```bash
git clone RetailStore_RECUPERADO_2026-08-04.bundle RetailStore_RECUPERADO
cd RetailStore_RECUPERADO
git switch recovery/frontend-2026-08-04
```

Después crea nuevamente el entorno y las dependencias:

```bash
python -m venv entorno
entorno\Scripts\activate
pip install -r requirements.txt
cd frontend
npm install
npm run dev
```

En otra terminal:

```bash
entorno\Scripts\activate
python manage.py runserver
```

No copies `node_modules` ni el entorno virtual antiguo; deben reconstruirse en la computadora actual.

## Error de ficha técnica PDF

La función final `fn_validar_producto_publicable` exige:

```text
metadata.ficha_tecnica.url
```

con una URL que termine en `.pdf`. El seed intentaba publicar los productos antes de agregar ese dato.

La corrección aplicada:

- Agrega el dato de ficha técnica antes del bloque de publicación en `datos.sql`.
- Corrige también `datos_productos_demo_patch.sql`.
- Incluye `00_HOTFIX_FICHA_TECNICA_PRODUCTOS.sql`.
- Incluye un PDF local demo en `media/productos/fichas/ficha-tecnica-demo.pdf`.

### Para una base que ya mostró el error

1. Ejecuta `ARCHIVOS SQL/00_HOTFIX_FICHA_TECNICA_PRODUCTOS.sql`.
2. Vuelve a ejecutar el `datos.sql` corregido completo.
3. Luego ejecuta los parches demo en el orden documentado.

La validación SQL no fue eliminada; se corrigió la incoherencia de los datos.

## Seguridad

El paquete limpio no incluye `.env`, `entorno/`, `frontend/node_modules/`, `frontend/dist/`, cachés de Python ni archivos compilados.
