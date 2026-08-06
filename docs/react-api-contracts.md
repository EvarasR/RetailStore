# Contratos de API de React vs Django

## Endpoints Existentes y Consumidos
- **GET** `content-type`
- **GET** `location`

## Endpoints Faltantes o No Consumidos
El backend Django expone muchos más endpoints (ver `docs/django_urls.json`) que no se encontraron en la carpeta `api/` de React, como por ejemplo:
- `/panel/api/productos/crear-integral/`
- `/panel/api/inventario/acciones/`
- `/proveedores/api/stock/actualizar/`
- y muchos otros destinados a administración.
