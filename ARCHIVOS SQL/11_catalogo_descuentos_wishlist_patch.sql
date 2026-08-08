-- TechTail: descuentos por producto/categoría y notificaciones idempotentes.
-- Parche DB-first no destructivo para PostgreSQL 15.

BEGIN;

CREATE TABLE IF NOT EXISTS promocion_categoria (
    cod_promocion BIGINT NOT NULL REFERENCES promocion(cod_promocion) ON DELETE RESTRICT,
    cod_categoria BIGINT NOT NULL REFERENCES categoria(cod_categoria) ON DELETE RESTRICT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (cod_promocion, cod_categoria)
);

CREATE INDEX IF NOT EXISTS ix_promocion_categoria_categoria
ON promocion_categoria(cod_categoria, cod_promocion);

ALTER TABLE notificacion
    ADD COLUMN IF NOT EXISTS referencia_tipo VARCHAR(40),
    ADD COLUMN IF NOT EXISTS referencia_id BIGINT,
    ADD COLUMN IF NOT EXISTS cod_producto BIGINT REFERENCES producto(cod_producto) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_notificacion_wishlist_promocion
ON notificacion(cod_usuario, tipo, referencia_id, cod_producto)
WHERE tipo = 'WISHLIST_DESCUENTO';

CREATE OR REPLACE FUNCTION fn_asociar_promocion_categoria(
    p_cod_promocion BIGINT,
    p_cod_categoria BIGINT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM promocion WHERE cod_promocion=p_cod_promocion) THEN
        RAISE EXCEPTION 'Descuento no encontrado';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM categoria WHERE cod_categoria=p_cod_categoria AND activo) THEN
        RAISE EXCEPTION 'Categoría no encontrada o inactiva';
    END IF;
    INSERT INTO promocion_categoria(cod_promocion, cod_categoria)
    VALUES (p_cod_promocion, p_cod_categoria)
    ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION fn_desasociar_promocion_categoria(
    p_cod_promocion BIGINT,
    p_cod_categoria BIGINT
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM promocion_categoria
    WHERE cod_promocion=p_cod_promocion AND cod_categoria=p_cod_categoria;
END;
$$;

-- Regla oficial de conflicto: se aplica un solo descuento, el de mayor importe
-- monetario. En empate gana el alcance específico de producto y luego el código
-- de promoción menor. React y Django solo presentan este resultado.
CREATE OR REPLACE FUNCTION fn_calcular_descuento_promocion(
    p_cod_producto BIGINT,
    p_precio_base NUMERIC,
    p_fecha TIMESTAMPTZ DEFAULT now()
) RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE
    r RECORD;
    v_descuento NUMERIC(12,2) := 0;
BEGIN
    IF p_precio_base IS NULL OR p_precio_base < 0 THEN
        RAISE EXCEPTION 'Precio base inválido';
    END IF;

    SELECT
        pr.cod_promocion,
        pr.nombre,
        pr.tipo_descuento,
        pr.valor,
        CASE
            WHEN EXISTS (
                SELECT 1 FROM promocion_producto pp
                WHERE pp.cod_promocion=pr.cod_promocion AND pp.cod_producto=p_cod_producto
            ) THEN 'PRODUCTO'
            ELSE 'CATEGORIA'
        END AS alcance,
        LEAST(
            p_precio_base,
            CASE WHEN pr.tipo_descuento='PORCENTAJE'
                THEN ROUND(p_precio_base * pr.valor / 100, 2)
                ELSE pr.valor
            END
        ) AS descuento_calculado
    INTO r
    FROM promocion pr
    WHERE pr.activo
      AND p_fecha BETWEEN pr.fecha_inicio AND pr.fecha_fin
      AND (
          EXISTS (
              SELECT 1 FROM promocion_producto pp
              WHERE pp.cod_promocion=pr.cod_promocion AND pp.cod_producto=p_cod_producto
          )
          OR EXISTS (
              SELECT 1
              FROM promocion_categoria pc
              JOIN producto p ON p.cod_categoria=pc.cod_categoria
              WHERE pc.cod_promocion=pr.cod_promocion AND p.cod_producto=p_cod_producto
          )
      )
    ORDER BY descuento_calculado DESC,
             CASE WHEN EXISTS (
                 SELECT 1 FROM promocion_producto pp
                 WHERE pp.cod_promocion=pr.cod_promocion AND pp.cod_producto=p_cod_producto
             ) THEN 0 ELSE 1 END,
             pr.cod_promocion
    LIMIT 1;

    IF FOUND THEN
        v_descuento := COALESCE(r.descuento_calculado, 0);
    END IF;

    RETURN jsonb_build_object(
        'cod_promocion', CASE WHEN FOUND THEN r.cod_promocion ELSE NULL END,
        'nombre', CASE WHEN FOUND THEN r.nombre ELSE NULL END,
        'tipo_descuento', CASE WHEN FOUND THEN r.tipo_descuento ELSE NULL END,
        'valor', CASE WHEN FOUND THEN r.valor ELSE NULL END,
        'alcance', CASE WHEN FOUND THEN r.alcance ELSE NULL END,
        'descuento', v_descuento,
        'porcentaje', CASE WHEN p_precio_base > 0 THEN ROUND(v_descuento * 100 / p_precio_base, 2) ELSE 0 END,
        'aplicada', FOUND
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_detalle_precio_producto(
    p_cod_producto BIGINT,
    p_fecha TIMESTAMPTZ DEFAULT now()
) RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE
    v_precio NUMERIC(12,2);
    v_promocion JSONB;
    v_descuento NUMERIC(12,2);
BEGIN
    SELECT precio_actual INTO v_precio
    FROM producto WHERE cod_producto=p_cod_producto;
    IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto; END IF;

    v_promocion := fn_calcular_descuento_promocion(p_cod_producto, v_precio, p_fecha);
    v_descuento := COALESCE((v_promocion->>'descuento')::NUMERIC, 0);

    RETURN jsonb_build_object(
        'precio_normal', v_precio,
        'precio_final', GREATEST(v_precio-v_descuento, 0),
        'tiene_descuento', COALESCE((v_promocion->>'aplicada')::BOOLEAN, FALSE) AND v_descuento > 0,
        'descuento_monto', v_descuento,
        'descuento_porcentaje', COALESCE((v_promocion->>'porcentaje')::NUMERIC, 0),
        'promocion', v_promocion
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_precio_producto_con_promocion(p_cod_producto BIGINT)
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
    SELECT (fn_detalle_precio_producto(p_cod_producto)->>'precio_final')::NUMERIC(12,2);
$$;

CREATE OR REPLACE FUNCTION fn_notificar_wishlist_promocion(p_cod_promocion BIGINT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    v_insertadas INTEGER := 0;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM promocion
        WHERE cod_promocion=p_cod_promocion
          AND activo AND now() BETWEEN fecha_inicio AND fecha_fin
    ) THEN
        RETURN 0;
    END IF;

    WITH productos_afectados AS (
        SELECT pp.cod_producto
        FROM promocion_producto pp
        WHERE pp.cod_promocion=p_cod_promocion
        UNION
        SELECT p.cod_producto
        FROM promocion_categoria pc
        JOIN producto p ON p.cod_categoria=pc.cod_categoria
        WHERE pc.cod_promocion=p_cod_promocion
    ), favoritos AS (
        SELECT pf.cod_usuario, pf.cod_producto
        FROM producto_favorito pf
        JOIN productos_afectados pa ON pa.cod_producto=pf.cod_producto
        UNION
        SELECT w.cod_usuario, wd.cod_producto
        FROM wishlist w
        JOIN wishlist_detalle wd ON wd.cod_wishlist=w.cod_wishlist
        JOIN productos_afectados pa ON pa.cod_producto=wd.cod_producto
        WHERE w.activo
    )
    INSERT INTO notificacion(
        cod_usuario, tipo, titulo, mensaje, url_accion, leida,
        referencia_tipo, referencia_id, cod_producto
    )
    SELECT DISTINCT
        f.cod_usuario,
        'WISHLIST_DESCUENTO',
        '¡Uno de tus favoritos está en oferta!',
        p.nombre || ' tiene un descuento disponible.',
        '/producto/' || p.cod_producto,
        FALSE,
        'PROMOCION',
        p_cod_promocion,
        p.cod_producto
    FROM favoritos f
    JOIN producto p ON p.cod_producto=f.cod_producto
    ON CONFLICT (cod_usuario, tipo, referencia_id, cod_producto)
        WHERE tipo='WISHLIST_DESCUENTO'
        DO NOTHING;

    GET DIAGNOSTICS v_insertadas = ROW_COUNT;
    RETURN v_insertadas;
END;
$$;

CREATE OR REPLACE FUNCTION fn_procesar_notificaciones_descuentos_wishlist(
    p_fecha TIMESTAMPTZ DEFAULT now()
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    r RECORD;
    v_total INTEGER := 0;
BEGIN
    FOR r IN
        SELECT cod_promocion
        FROM promocion
        WHERE activo AND p_fecha BETWEEN fecha_inicio AND fecha_fin
        ORDER BY cod_promocion
        FOR UPDATE SKIP LOCKED
    LOOP
        v_total := v_total + fn_notificar_wishlist_promocion(r.cod_promocion);
    END LOOP;
    RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_notificar_asociacion_descuento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    PERFORM fn_notificar_wishlist_promocion(NEW.cod_promocion);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_notificar_activacion_descuento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.activo AND now() BETWEEN NEW.fecha_inicio AND NEW.fecha_fin THEN
        PERFORM fn_notificar_wishlist_promocion(NEW.cod_promocion);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_promocion_producto_notificar_wishlist
AFTER INSERT ON promocion_producto
FOR EACH ROW EXECUTE FUNCTION fn_trg_notificar_asociacion_descuento();

CREATE OR REPLACE TRIGGER trg_promocion_categoria_notificar_wishlist
AFTER INSERT ON promocion_categoria
FOR EACH ROW EXECUTE FUNCTION fn_trg_notificar_asociacion_descuento();

CREATE OR REPLACE TRIGGER trg_promocion_activar_notificar_wishlist
AFTER INSERT OR UPDATE OF activo, fecha_inicio, fecha_fin ON promocion
FOR EACH ROW EXECUTE FUNCTION fn_trg_notificar_activacion_descuento();

COMMIT;
