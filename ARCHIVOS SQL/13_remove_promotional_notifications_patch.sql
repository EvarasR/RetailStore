-- TechTail / RetailStore
-- Retirada no destructiva de las notificaciones automáticas wishlist/descuento.
-- Conserva wishlist, descuentos, notificaciones históricas, facturación y cola email.

BEGIN;

-- Cancela entregas promocionales pendientes sin borrar el historial.
UPDATE cola_email
SET estado = 'CANCELADO',
    procesando = FALSE,
    fecha_inicio_proceso = NULL,
    error_ultimo = 'Entrega promocional retirada por configuración'
WHERE tipo = 'WISHLIST_DESCUENTO'
  AND estado IN ('PENDIENTE', 'FALLIDO');

CREATE OR REPLACE FUNCTION fn_notificar_wishlist_promocion(p_cod_promocion BIGINT)
RETURNS INTEGER LANGUAGE sql AS $$
    SELECT 0;
$$;

CREATE OR REPLACE FUNCTION fn_procesar_notificaciones_descuentos_wishlist(
    p_fecha TIMESTAMPTZ DEFAULT now()
) RETURNS INTEGER LANGUAGE sql AS $$
    SELECT 0;
$$;

CREATE OR REPLACE FUNCTION fn_trg_notificar_asociacion_descuento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_notificar_activacion_descuento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RETURN NEW;
END;
$$;

COMMIT;
