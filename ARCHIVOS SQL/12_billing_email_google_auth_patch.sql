-- TechTail - facturacion privada, email transaccional, preferencias y Google OIDC.
-- PostgreSQL 15. Parche aditivo e idempotente: no elimina datos ni objetos.

BEGIN;

CREATE TABLE IF NOT EXISTS preferencia_notificacion (
    cod_usuario BIGINT PRIMARY KEY REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    notificaciones_web BOOLEAN NOT NULL DEFAULT TRUE,
    emails_pedidos BOOLEAN NOT NULL DEFAULT TRUE,
    emails_descuentos BOOLEAN NOT NULL DEFAULT TRUE,
    emails_prime BOOLEAN NOT NULL DEFAULT TRUE,
    emails_soporte BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuario_identidad_externa (
    cod_identidad BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    proveedor VARCHAR(30) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    email_proveedor VARCHAR(180) NOT NULL,
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    onboarding_completo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_vinculacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_identidad_proveedor_subject UNIQUE (proveedor, provider_subject)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_identidad_google_usuario_activa
ON usuario_identidad_externa(cod_usuario)
WHERE proveedor = 'GOOGLE' AND activo IS TRUE;

CREATE OR REPLACE FUNCTION fn_vincular_identidad_google(
    p_cod_usuario BIGINT,
    p_provider_subject TEXT,
    p_email_proveedor TEXT,
    p_onboarding_completo BOOLEAN DEFAULT TRUE
) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    v_identidad usuario_identidad_externa%ROWTYPE;
BEGIN
    SELECT * INTO v_identidad
    FROM usuario_identidad_externa
    WHERE proveedor='GOOGLE' AND provider_subject=p_provider_subject
    FOR UPDATE;

    IF FOUND THEN
        IF v_identidad.cod_usuario <> p_cod_usuario THEN
            RAISE EXCEPTION 'La identidad Google ya pertenece a otra cuenta';
        END IF;
        UPDATE usuario_identidad_externa
        SET activo=TRUE,
            email_proveedor=lower(trim(p_email_proveedor)),
            email_verificado=TRUE,
            onboarding_completo=p_onboarding_completo,
            fecha_actualizacion=now()
        WHERE cod_identidad=v_identidad.cod_identidad
        RETURNING cod_identidad INTO v_identidad.cod_identidad;
        RETURN v_identidad.cod_identidad;
    END IF;

    INSERT INTO usuario_identidad_externa(
        cod_usuario, proveedor, provider_subject, email_proveedor,
        email_verificado, activo, onboarding_completo
    ) VALUES (
        p_cod_usuario, 'GOOGLE', p_provider_subject,
        lower(trim(p_email_proveedor)), TRUE, TRUE, p_onboarding_completo
    ) RETURNING cod_identidad INTO v_identidad.cod_identidad;
    RETURN v_identidad.cod_identidad;
END;
$$;

CREATE OR REPLACE FUNCTION fn_desvincular_identidad_google(p_cod_usuario BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE usuario_identidad_externa
    SET activo=FALSE, fecha_actualizacion=now()
    WHERE cod_usuario=p_cod_usuario AND proveedor='GOOGLE' AND activo IS TRUE;
END;
$$;

ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS tipo VARCHAR(60) NOT NULL DEFAULT 'GENERICO';
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS cuerpo_texto TEXT NOT NULL DEFAULT '';
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS cuerpo_html TEXT NOT NULL DEFAULT '';
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS contexto JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS referencia_tipo VARCHAR(40);
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS referencia_id BIGINT;
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS clave_idempotencia VARCHAR(240);
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS procesando BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS fecha_inicio_proceso TIMESTAMPTZ;
ALTER TABLE cola_email ADD COLUMN IF NOT EXISTS max_intentos INTEGER NOT NULL DEFAULT 5;

CREATE UNIQUE INDEX IF NOT EXISTS uq_cola_email_clave_idempotencia
ON cola_email(clave_idempotencia)
WHERE clave_idempotencia IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_cola_email_worker
ON cola_email(estado, procesando, fecha_programada, cod_email);

CREATE OR REPLACE FUNCTION fn_actualizar_preferencias_notificacion(
    p_cod_usuario BIGINT,
    p_notificaciones_web BOOLEAN,
    p_emails_pedidos BOOLEAN,
    p_emails_descuentos BOOLEAN,
    p_emails_prime BOOLEAN,
    p_emails_soporte BOOLEAN
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO preferencia_notificacion(
        cod_usuario, notificaciones_web, emails_pedidos,
        emails_descuentos, emails_prime, emails_soporte
    ) VALUES (
        p_cod_usuario, p_notificaciones_web, p_emails_pedidos,
        p_emails_descuentos, p_emails_prime, p_emails_soporte
    )
    ON CONFLICT (cod_usuario) DO UPDATE SET
        notificaciones_web = EXCLUDED.notificaciones_web,
        emails_pedidos = EXCLUDED.emails_pedidos,
        emails_descuentos = EXCLUDED.emails_descuentos,
        emails_prime = EXCLUDED.emails_prime,
        emails_soporte = EXCLUDED.emails_soporte,
        fecha_actualizacion = now();
END;
$$;

CREATE OR REPLACE FUNCTION fn_encolar_email_transaccional(
    p_cod_usuario BIGINT,
    p_destinatario TEXT,
    p_tipo TEXT,
    p_asunto TEXT,
    p_cuerpo_texto TEXT DEFAULT '',
    p_cuerpo_html TEXT DEFAULT '',
    p_contexto JSONB DEFAULT '{}'::jsonb,
    p_referencia_tipo TEXT DEFAULT NULL,
    p_referencia_id BIGINT DEFAULT NULL,
    p_clave_idempotencia TEXT DEFAULT NULL,
    p_fecha_programada TIMESTAMPTZ DEFAULT now()
) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    v_cod_email BIGINT;
BEGIN
    INSERT INTO cola_email(
        cod_usuario, destinatario, tipo, asunto, cuerpo, cuerpo_texto,
        cuerpo_html, contexto, referencia_tipo, referencia_id,
        clave_idempotencia, fecha_programada, estado, procesando
    ) VALUES (
        p_cod_usuario, lower(trim(p_destinatario)), upper(trim(p_tipo)), p_asunto,
        COALESCE(NULLIF(p_cuerpo_texto, ''), p_asunto), COALESCE(p_cuerpo_texto, ''),
        COALESCE(p_cuerpo_html, ''), COALESCE(p_contexto, '{}'::jsonb),
        p_referencia_tipo, p_referencia_id, NULLIF(trim(p_clave_idempotencia), ''),
        COALESCE(p_fecha_programada, now()), 'PENDIENTE', FALSE
    )
    ON CONFLICT (clave_idempotencia) WHERE clave_idempotencia IS NOT NULL
    DO UPDATE SET clave_idempotencia = cola_email.clave_idempotencia
    RETURNING cod_email INTO v_cod_email;
    RETURN v_cod_email;
END;
$$;

CREATE OR REPLACE FUNCTION fn_encolar_email_factura(
    p_cod_factura BIGINT,
    p_clave_manual TEXT DEFAULT NULL
) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    v_factura factura%ROWTYPE;
    v_usuario usuario%ROWTYPE;
    v_pedido pedido%ROWTYPE;
    v_clave TEXT;
BEGIN
    SELECT * INTO v_factura FROM factura WHERE cod_factura = p_cod_factura;
    IF NOT FOUND THEN RAISE EXCEPTION 'Factura no encontrada'; END IF;
    SELECT * INTO v_pedido FROM pedido WHERE cod_pedido = v_factura.cod_pedido;
    SELECT * INTO v_usuario FROM usuario WHERE cod_usuario = v_pedido.cod_usuario AND activo IS TRUE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Usuario de factura no disponible'; END IF;

    IF p_clave_manual IS NULL AND NOT COALESCE(
        (SELECT emails_pedidos FROM preferencia_notificacion WHERE cod_usuario=v_usuario.cod_usuario),
        TRUE
    ) THEN
        RETURN NULL;
    END IF;

    v_clave := COALESCE(
        NULLIF(trim(p_clave_manual), ''),
        'FACTURA_EMITIDA:' || v_factura.cod_factura || ':' || v_usuario.cod_usuario
    );

    RETURN fn_encolar_email_transaccional(
        v_usuario.cod_usuario,
        v_usuario.email,
        'FACTURA_EMITIDA',
        'Tu factura TechTail #' || v_factura.numero_factura,
        '', '',
        jsonb_build_object(
            'cod_factura', v_factura.cod_factura,
            'numero_factura', v_factura.numero_factura,
            'cod_pedido', v_pedido.cod_pedido,
            'numero_pedido', v_pedido.numero_pedido
        ),
        'FACTURA', v_factura.cod_factura, v_clave, now()
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_encolar_email_factura()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        PERFORM fn_encolar_email_factura(NEW.cod_factura, NULL);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'No se pudo encolar el email de factura; la factura permanece emitida';
    END;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_validar_factura_pago_capturado()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM transaccion_pago
        WHERE cod_pedido=NEW.cod_pedido AND cod_estado_pago='CAPTURADO'
    ) THEN
        RAISE EXCEPTION 'No se puede emitir factura sin pago capturado';
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_factura_exige_pago_capturado
BEFORE INSERT ON factura
FOR EACH ROW EXECUTE FUNCTION fn_trg_validar_factura_pago_capturado();

CREATE OR REPLACE TRIGGER trg_factura_encolar_email
AFTER INSERT ON factura
FOR EACH ROW EXECUTE FUNCTION fn_trg_encolar_email_factura();

CREATE OR REPLACE FUNCTION fn_notificar_wishlist_promocion(p_cod_promocion BIGINT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    v_insertadas_web INTEGER := 0;
    v_insertadas_email INTEGER := 0;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM promocion
        WHERE cod_promocion=p_cod_promocion
          AND activo AND now() BETWEEN fecha_inicio AND fecha_fin
    ) THEN
        RETURN 0;
    END IF;

    WITH productos_afectados AS (
        SELECT pp.cod_producto FROM promocion_producto pp
        WHERE pp.cod_promocion=p_cod_promocion
        UNION
        SELECT p.cod_producto FROM promocion_categoria pc
        JOIN producto p ON p.cod_categoria=pc.cod_categoria
        WHERE pc.cod_promocion=p_cod_promocion
    ), favoritos AS (
        SELECT pf.cod_usuario, pf.cod_producto FROM producto_favorito pf
        JOIN productos_afectados pa ON pa.cod_producto=pf.cod_producto
        UNION
        SELECT w.cod_usuario, wd.cod_producto FROM wishlist w
        JOIN wishlist_detalle wd ON wd.cod_wishlist=w.cod_wishlist
        JOIN productos_afectados pa ON pa.cod_producto=wd.cod_producto
        WHERE w.activo
    )
    INSERT INTO notificacion(
        cod_usuario, tipo, titulo, mensaje, url_accion, leida,
        referencia_tipo, referencia_id, cod_producto
    )
    SELECT DISTINCT
        f.cod_usuario, 'WISHLIST_DESCUENTO',
        '¡Uno de tus favoritos está en oferta!',
        p.nombre || ' tiene un descuento disponible.',
        '/producto/' || p.cod_producto, FALSE,
        'PROMOCION', p_cod_promocion, p.cod_producto
    FROM favoritos f
    JOIN producto p ON p.cod_producto=f.cod_producto
    LEFT JOIN preferencia_notificacion pn ON pn.cod_usuario=f.cod_usuario
    WHERE COALESCE(pn.notificaciones_web, TRUE)
    ON CONFLICT (cod_usuario, tipo, referencia_id, cod_producto)
        WHERE tipo='WISHLIST_DESCUENTO' DO NOTHING;
    GET DIAGNOSTICS v_insertadas_web = ROW_COUNT;

    WITH productos_afectados AS (
        SELECT pp.cod_producto FROM promocion_producto pp
        WHERE pp.cod_promocion=p_cod_promocion
        UNION
        SELECT p.cod_producto FROM promocion_categoria pc
        JOIN producto p ON p.cod_categoria=pc.cod_categoria
        WHERE pc.cod_promocion=p_cod_promocion
    ), favoritos AS (
        SELECT pf.cod_usuario, pf.cod_producto FROM producto_favorito pf
        JOIN productos_afectados pa ON pa.cod_producto=pf.cod_producto
        UNION
        SELECT w.cod_usuario, wd.cod_producto FROM wishlist w
        JOIN wishlist_detalle wd ON wd.cod_wishlist=w.cod_wishlist
        JOIN productos_afectados pa ON pa.cod_producto=wd.cod_producto
        WHERE w.activo
    )
    INSERT INTO cola_email(
        cod_usuario, destinatario, tipo, asunto, cuerpo, cuerpo_texto,
        contexto, referencia_tipo, referencia_id, clave_idempotencia,
        fecha_programada, estado, procesando
    )
    SELECT DISTINCT
        f.cod_usuario, u.email, 'WISHLIST_DESCUENTO',
        '¡Uno de tus favoritos está en oferta!',
        p.nombre || ' tiene un descuento disponible.', '',
        jsonb_build_object(
            'cod_producto', p.cod_producto,
            'producto', p.nombre,
            'cod_promocion', p_cod_promocion
        ),
        'PROMOCION', p_cod_promocion,
        'WISHLIST_DESCUENTO:' || p_cod_promocion || ':' || f.cod_usuario || ':' || p.cod_producto,
        now(), 'PENDIENTE', FALSE
    FROM favoritos f
    JOIN usuario u ON u.cod_usuario=f.cod_usuario AND u.activo IS TRUE
    JOIN producto p ON p.cod_producto=f.cod_producto
    LEFT JOIN preferencia_notificacion pn ON pn.cod_usuario=f.cod_usuario
    WHERE COALESCE(pn.emails_descuentos, TRUE)
    ON CONFLICT (clave_idempotencia) WHERE clave_idempotencia IS NOT NULL DO NOTHING;
    GET DIAGNOSTICS v_insertadas_email = ROW_COUNT;

    RETURN v_insertadas_web + v_insertadas_email;
END;
$$;

-- Las notificaciones son un efecto secundario: nunca deben impedir que el
-- administrador asocie o active una promocion valida.
CREATE OR REPLACE FUNCTION fn_trg_notificar_asociacion_descuento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        PERFORM fn_notificar_wishlist_promocion(NEW.cod_promocion);
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'No se pudieron encolar las notificaciones de la promocion';
    END;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_notificar_activacion_descuento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.activo AND now() BETWEEN NEW.fecha_inicio AND NEW.fecha_fin THEN
        BEGIN
            PERFORM fn_notificar_wishlist_promocion(NEW.cod_promocion);
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'No se pudieron encolar las notificaciones de la promocion';
        END;
    END IF;
    RETURN NEW;
END;
$$;

COMMIT;
