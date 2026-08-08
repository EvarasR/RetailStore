# Catálogo administrativo, multimedia y descuentos

## Alcance

El panel React administra productos, categorías, relaciones, archivos y descuentos sin pedir identificadores técnicos al usuario. Django valida autenticación, permisos, transacciones y archivos; PostgreSQL conserva las reglas comerciales y calcula el precio oficial.

## Instalación

1. Instalar dependencias Python con `python -m pip install -r requirements.txt`.
2. Aplicar `ARCHIVOS SQL/11_catalogo_descuentos_wishlist_patch.sql` sobre una base que ya tenga el esquema principal TechTail.
3. Instalar el frontend con `npm install` dentro de `frontend`.
4. Ejecutar Django y Vite con su configuración de desarrollo habitual.

El parche es incremental: crea la relación descuento-categoría, amplía las referencias de notificaciones y reemplaza funciones concretas mediante `CREATE OR REPLACE`. No borra datos de negocio.

## Productos y publicación

La ruta `/admin/productos` ofrece búsqueda, filtros y dos flujos:

- “Nuevo producto” abre un asistente de seis pasos.
- El menú de cada fila abre gestión de datos, multimedia, PDF, proveedores, especificaciones o relacionados.

La publicación se confirma únicamente si PostgreSQL acepta todos los requisitos: categoría, marca, SKU, precio positivo, imagen principal, PDF, límite retail activo, al menos cinco proveedores activos y stock propio o de proveedor. Si falla una creación integral, la transacción revierte datos y el backend limpia los archivos recién guardados.

Archivos admitidos:

| Tipo | Formatos | Máximo | Validación |
|---|---|---:|---|
| Imágenes | JPG, PNG, WebP | 8 MB | MIME, extensión y decodificación Pillow |
| Videos | MP4, WebM | 60 MB | MIME y firma básica del contenedor |
| Ficha técnica | PDF | 15 MB | MIME y cabecera `%PDF-` |

Los nombres aportados por el cliente no se usan como ruta final. Los archivos se guardan bajo `productos/<producto>/<tipo>/<uuid>.<ext>`.

Endpoints principales reutilizados:

- `GET /panel/api/productos/` y `GET /panel/api/catalogo/?entidad=opciones_producto`
- `POST /panel/api/productos/crear-integral/`
- `POST /panel/api/productos/<id>/actualizar/`
- `GET /panel/api/productos/<id>/gestion/`
- `POST /panel/api/productos/<id>/imagenes/`
- `POST /panel/api/imagenes/<id>/`
- `POST /panel/api/productos/<id>/archivos/`
- `POST /panel/api/producto-proveedor/`
- `POST /panel/api/productos/<id>/relacionados/`

## Categorías

La ruta `/admin/categorias` permite buscar, crear, editar, activar y desactivar. El slug se genera en Django a partir del nombre; no se expone como requisito del formulario. Desactivar es lógico y conserva productos e historial.

Contratos: `GET /panel/api/catalogo/?entidad=categoria`, `POST /panel/api/categorias/` y `POST /panel/api/categorias/<id>/`.

## Descuentos

La ruta `/admin/descuentos` reemplaza la terminología visible de promociones. Una regla puede aplicarse a varios productos en una operación o a una categoría completa. La relación directa con producto tiene prioridad en empates; en cualquier solapamiento se usa el mayor descuento monetario vigente y luego el identificador de la regla como desempate estable.

`fn_detalle_precio_producto` es el contrato público único y devuelve:

- `precio_normal`
- `precio_final`
- `tiene_descuento`
- `descuento_monto`
- `descuento_porcentaje`
- datos de la regla elegida

React muestra esos valores sin recalcularlos.

Contratos administrativos: `POST /panel/api/promociones/`, `POST /panel/api/promociones/<id>/`, `POST /panel/api/promociones/<id>/productos/` y `POST /panel/api/promociones/<id>/categorias/`. El escaparate consume `GET /api/productos/ofertas/`.

## Wishlist

La wishlist conserva altas, bajas, consulta y navegación al producto. Los
descuentos continúan reflejándose mediante el contrato oficial de precios, pero
no generan notificaciones ni emails automáticos para los favoritos.

## Verificación

```powershell
python manage.py check
python manage.py test apps.administracion apps.proveedores apps.operaciones
cd frontend
npm run lint
npm run test
npm run build
```

Lista manual mínima:

- Crear producto con varias imágenes, varios videos y PDF.
- Rechazar extensiones, MIME, contenido o tamaño inválidos.
- Confirmar que un producto incompleto no se publica ni deja una creación parcial.
- Editar y desactivar una categoría con confirmación.
- Crear descuento para varios productos y para una categoría.
- Ver el mismo precio normal/final y badge en inicio, catálogo, detalle y ofertas.
- Probar los cajones con teclado, foco, Escape y ancho de 360 px.

La prueba integral final se ejecutó dentro de `transaction.atomic()` y forzó rollback: confirmó publicación con cinco imágenes, dos videos, un PDF, cinco proveedores, imagen principal y diagnóstico publicable. Los ocho archivos físicos temporales producidos por esa prueba se eliminaron después del rollback. Los casos de descuento por producto y descuento de categoría también se probaron con rollback.
