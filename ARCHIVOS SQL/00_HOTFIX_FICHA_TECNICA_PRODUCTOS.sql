-- ============================================================
-- HOTFIX: productos sin ficha técnica PDF
-- PostgreSQL 15 / TechTail
--
-- Uso recomendado después del error P0001:
-- 1. Ejecutar este archivo completo.
-- 2. Volver a ejecutar datos.sql CORREGIDO desde el inicio.
--
-- ROLLBACK es seguro aunque no exista una transacción activa; PostgreSQL
-- mostrará solamente una advertencia.
-- ============================================================

ROLLBACK;

BEGIN;

UPDATE producto
SET metadata = COALESCE(metadata, '{}'::jsonb) ||
    jsonb_build_object(
        'ficha_tecnica',
        jsonb_build_object(
            'url', '/media/productos/fichas/ficha-tecnica-demo.pdf',
            'nombre', 'Ficha técnica demo - ' || sku
        )
    ),
    fecha_actualizacion = now()
WHERE COALESCE(metadata->'ficha_tecnica'->>'url', '') = ''
   OR lower(split_part(metadata->'ficha_tecnica'->>'url', '?', 1)) NOT LIKE '%.pdf';

COMMIT;

-- Diagnóstico: esta consulta debe devolver cero filas.
SELECT cod_producto, sku, nombre, metadata->'ficha_tecnica'->>'url' AS ficha_tecnica_url
FROM producto
WHERE COALESCE(metadata->'ficha_tecnica'->>'url', '') = ''
   OR lower(split_part(metadata->'ficha_tecnica'->>'url', '?', 1)) NOT LIKE '%.pdf'
ORDER BY cod_producto;
