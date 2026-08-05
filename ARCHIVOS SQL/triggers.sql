-- ============================================================
-- triggers.sql
-- Sistema Retail Prime - PostgreSQL 15
-- Contiene: funciones trigger y triggers de auditoría, stock, pedidos,
-- tracking, pagos y membresías.
-- Ejecutar después de funciones.sql.
-- ============================================================

-- ============================================================
-- 05_triggers.sql
-- Triggers de automatización, auditoría y control
-- ============================================================

BEGIN;
-- ============================================================
-- FUNCIONES TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION fn_trg_validar_producto_publicado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.cod_estado_producto = 'PUBLICADO'
       AND (TG_OP = 'INSERT' OR OLD.cod_estado_producto IS DISTINCT FROM NEW.cod_estado_producto) THEN
        PERFORM fn_validar_producto_publicable(NEW.cod_producto);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_pedido_detalle_subtotal()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.subtotal_linea := ROUND(NEW.cantidad * NEW.precio_unitario, 2);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_recalcular_total_pedido_detalle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_pedido BIGINT;
BEGIN
    v_cod_pedido := COALESCE(NEW.cod_pedido, OLD.cod_pedido);
    PERFORM fn_recalcular_total_pedido(v_cod_pedido);
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_pedido_estado_historial_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_envio BIGINT;
    v_tipo_evento VARCHAR(40);
    v_descripcion TEXT;
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.cod_estado_pedido IS DISTINCT FROM NEW.cod_estado_pedido THEN
        INSERT INTO pedido_estado_historial(cod_pedido, cod_estado_pedido, comentario)
        VALUES (NEW.cod_pedido, NEW.cod_estado_pedido, COALESCE(NEW.observacion, 'Cambio automático de estado'));

        SELECT cod_envio INTO v_cod_envio
        FROM envio
        WHERE cod_pedido = NEW.cod_pedido;

        IF v_cod_envio IS NULL
           AND NEW.cod_estado_pedido IN (
                'PREPARANDO','ESPERANDO_PROVEEDOR','LISTO_ENVIO','ENVIADO',
                'EN_TRANSITO','EN_REPARTO','ENTREGADO','DEVOLUCION_SOLICITADA',
                'DEVUELTO','REEMBOLSADO'
           ) THEN
            v_cod_envio := fn_generar_tracking_inicial(NEW.cod_pedido, NULL);
        END IF;

        v_tipo_evento := CASE NEW.cod_estado_pedido
            WHEN 'PREPARANDO' THEN 'PREPARING_PACKAGE'
            WHEN 'ESPERANDO_PROVEEDOR' THEN 'SUPPLIER_PENDING'
            WHEN 'LISTO_ENVIO' THEN 'PACKAGE_READY'
            WHEN 'ENVIADO' THEN 'PICKED_UP'
            WHEN 'EN_TRANSITO' THEN 'IN_TRANSIT'
            WHEN 'EN_REPARTO' THEN 'OUT_FOR_DELIVERY'
            WHEN 'ENTREGADO' THEN 'DELIVERED'
            WHEN 'CANCELADO' THEN 'ORDER_CANCELLED'
            WHEN 'DEVOLUCION_SOLICITADA' THEN 'RETURNING'
            WHEN 'DEVUELTO' THEN 'RETURNED'
            WHEN 'REEMBOLSADO' THEN 'REFUNDED'
            ELSE NULL
        END;

        IF v_tipo_evento IS NOT NULL AND v_cod_envio IS NOT NULL THEN
            v_descripcion := 'Estado del pedido actualizado a ' || NEW.cod_estado_pedido;

            INSERT INTO tracking_evento(cod_envio, cod_tipo_evento, descripcion, ubicacion)
            VALUES (v_cod_envio, v_tipo_evento, v_descripcion, 'Centro de operación');

            UPDATE envio
            SET estado = NEW.cod_estado_pedido,
                fecha_entrega = CASE WHEN NEW.cod_estado_pedido = 'ENTREGADO' THEN now() ELSE fecha_entrega END
            WHERE cod_envio = v_cod_envio;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_alerta_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_disponible INTEGER;
BEGIN
    v_disponible := NEW.stock_total - NEW.stock_reservado;

    IF v_disponible = 0 THEN
        INSERT INTO alerta_stock(cod_producto, cod_almacen, tipo_alerta, mensaje)
        VALUES (NEW.cod_producto, NEW.cod_almacen, 'SIN_STOCK', 'Producto sin stock disponible')
        ON CONFLICT DO NOTHING;
    ELSIF v_disponible <= NEW.stock_minimo THEN
        INSERT INTO alerta_stock(cod_producto, cod_almacen, tipo_alerta, mensaje)
        VALUES (NEW.cod_producto, NEW.cod_almacen, 'STOCK_BAJO', 'Producto por debajo o igual al stock mínimo')
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_direccion_predeterminada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.es_predeterminada IS TRUE THEN
        UPDATE direccion_usuario
        SET es_predeterminada = FALSE
        WHERE cod_usuario = NEW.cod_usuario
          AND cod_direccion <> NEW.cod_direccion
          AND activo IS TRUE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_expirar_membresia()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.fecha_fin < CURRENT_DATE AND NEW.cod_estado_membresia = 'ACTIVA' THEN
        NEW.cod_estado_membresia := 'EXPIRADA';
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGERS DE FECHA ACTUALIZACIÓN
-- ============================================================

DROP TRIGGER IF EXISTS trg_touch_usuario ON usuario;
CREATE TRIGGER trg_touch_usuario
BEFORE UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_producto ON producto;
CREATE TRIGGER trg_touch_producto
BEFORE UPDATE ON producto
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_proveedor ON proveedor;
CREATE TRIGGER trg_touch_proveedor
BEFORE UPDATE ON proveedor
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_producto_proveedor ON producto_proveedor;
CREATE TRIGGER trg_touch_producto_proveedor
BEFORE UPDATE ON producto_proveedor
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_inventario ON inventario;
CREATE TRIGGER trg_touch_inventario
BEFORE UPDATE ON inventario
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_carrito ON carrito;
CREATE TRIGGER trg_touch_carrito
BEFORE UPDATE ON carrito
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_carrito_detalle ON carrito_detalle;
CREATE TRIGGER trg_touch_carrito_detalle
BEFORE UPDATE ON carrito_detalle
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_pedido ON pedido;
CREATE TRIGGER trg_touch_pedido
BEFORE UPDATE ON pedido
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_transaccion_pago ON transaccion_pago;
CREATE TRIGGER trg_touch_transaccion_pago
BEFORE UPDATE ON transaccion_pago
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

DROP TRIGGER IF EXISTS trg_touch_devolucion ON devolucion;
CREATE TRIGGER trg_touch_devolucion
BEFORE UPDATE ON devolucion
FOR EACH ROW
EXECUTE FUNCTION fn_touch_fecha_actualizacion();

-- ============================================================
-- TRIGGERS DE NEGOCIO
-- ============================================================

DROP TRIGGER IF EXISTS trg_validar_producto_publicado ON producto;
CREATE TRIGGER trg_validar_producto_publicado
BEFORE INSERT OR UPDATE OF cod_estado_producto ON producto
FOR EACH ROW
EXECUTE FUNCTION fn_trg_validar_producto_publicado();

DROP TRIGGER IF EXISTS trg_pedido_detalle_subtotal ON pedido_detalle;
CREATE TRIGGER trg_pedido_detalle_subtotal
BEFORE INSERT OR UPDATE OF cantidad, precio_unitario ON pedido_detalle
FOR EACH ROW
EXECUTE FUNCTION fn_trg_pedido_detalle_subtotal();

DROP TRIGGER IF EXISTS trg_recalcular_pedido_aiud ON pedido_detalle;
CREATE TRIGGER trg_recalcular_pedido_aiud
AFTER INSERT OR UPDATE OR DELETE ON pedido_detalle
FOR EACH ROW
EXECUTE FUNCTION fn_trg_recalcular_total_pedido_detalle();

DROP TRIGGER IF EXISTS trg_pedido_estado_historial_tracking ON pedido;
CREATE TRIGGER trg_pedido_estado_historial_tracking
AFTER UPDATE OF cod_estado_pedido ON pedido
FOR EACH ROW
EXECUTE FUNCTION fn_trg_pedido_estado_historial_tracking();

DROP TRIGGER IF EXISTS trg_alerta_stock ON inventario;
CREATE TRIGGER trg_alerta_stock
AFTER INSERT OR UPDATE OF stock_total, stock_reservado, stock_minimo ON inventario
FOR EACH ROW
EXECUTE FUNCTION fn_trg_alerta_stock();

DROP TRIGGER IF EXISTS trg_direccion_predeterminada ON direccion_usuario;
CREATE TRIGGER trg_direccion_predeterminada
AFTER INSERT OR UPDATE OF es_predeterminada ON direccion_usuario
FOR EACH ROW
EXECUTE FUNCTION fn_trg_direccion_predeterminada();

DROP TRIGGER IF EXISTS trg_expirar_membresia ON membresia_usuario;
CREATE TRIGGER trg_expirar_membresia
BEFORE INSERT OR UPDATE OF fecha_fin, cod_estado_membresia ON membresia_usuario
FOR EACH ROW
EXECUTE FUNCTION fn_trg_expirar_membresia();

-- ============================================================
-- TRIGGERS DE AUDITORÍA
-- ============================================================

DROP TRIGGER IF EXISTS trg_audit_usuario ON usuario;
CREATE TRIGGER trg_audit_usuario
AFTER INSERT OR UPDATE OR DELETE ON usuario
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_producto ON producto;
CREATE TRIGGER trg_audit_producto
AFTER INSERT OR UPDATE OR DELETE ON producto
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_proveedor ON proveedor;
CREATE TRIGGER trg_audit_proveedor
AFTER INSERT OR UPDATE OR DELETE ON proveedor
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_inventario ON inventario;
CREATE TRIGGER trg_audit_inventario
AFTER INSERT OR UPDATE OR DELETE ON inventario
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_pedido ON pedido;
CREATE TRIGGER trg_audit_pedido
AFTER INSERT OR UPDATE OR DELETE ON pedido
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_transaccion_pago ON transaccion_pago;
CREATE TRIGGER trg_audit_transaccion_pago
AFTER INSERT OR UPDATE OR DELETE ON transaccion_pago
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_membresia_usuario ON membresia_usuario;
CREATE TRIGGER trg_audit_membresia_usuario
AFTER INSERT OR UPDATE OR DELETE ON membresia_usuario
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

COMMIT;

-- ============================================================
-- FASE A: SINCRONIZACIÓN DE LOTES
-- ============================================================
BEGIN;

CREATE OR REPLACE FUNCTION fn_trg_touch_lote_inventario()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.fecha_actualizacion := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_touch_regla_precio()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.fecha_actualizacion := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_sincronizar_lote_inventario()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_producto BIGINT; v_almacen BIGINT;
BEGIN
    v_producto := COALESCE(NEW.cod_producto, OLD.cod_producto);
    v_almacen := COALESCE(NEW.cod_almacen, OLD.cod_almacen);
    PERFORM fn_recalcular_inventario_desde_lotes(v_producto, v_almacen);
    PERFORM fn_recalcular_precio_actual_producto(v_producto);
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_lote_inventario ON lote_inventario;
CREATE TRIGGER trg_touch_lote_inventario
BEFORE UPDATE ON lote_inventario
FOR EACH ROW EXECUTE FUNCTION fn_trg_touch_lote_inventario();

DROP TRIGGER IF EXISTS trg_touch_regla_precio ON regla_precio;
CREATE TRIGGER trg_touch_regla_precio
BEFORE UPDATE ON regla_precio
FOR EACH ROW EXECUTE FUNCTION fn_trg_touch_regla_precio();

DROP TRIGGER IF EXISTS trg_sincronizar_lote_inventario ON lote_inventario;
CREATE TRIGGER trg_sincronizar_lote_inventario
AFTER INSERT OR UPDATE OR DELETE ON lote_inventario
FOR EACH ROW EXECUTE FUNCTION fn_trg_sincronizar_lote_inventario();

COMMIT;


-- ============================================================
-- 10_triggers_complementarios_retail_prime.sql
-- Automatizaciones adicionales: historial de precio, outbox de correos,
-- notificaciones, soporte y auditoría extendida.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION fn_trg_historial_precio_producto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.precio_actual IS DISTINCT FROM NEW.precio_actual THEN
        INSERT INTO historial_precio_producto(cod_producto, precio_anterior, precio_nuevo, motivo)
        VALUES (NEW.cod_producto, OLD.precio_actual, NEW.precio_actual, 'Cambio detectado automáticamente');
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_usuario_bienvenida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM fn_crear_notificacion(
        NEW.cod_usuario,
        'BIENVENIDA',
        'Bienvenido a Retail Prime',
        'Tu cuenta fue creada correctamente. Ya puedes explorar el catálogo.'
    );

    PERFORM fn_encolar_email(
        NEW.cod_usuario,
        NEW.email,
        'Bienvenido a Retail Prime',
        'Hola ' || NEW.nombres || ', tu cuenta fue creada correctamente en Retail Prime.'
    );

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_pedido_notificar_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_email TEXT;
    v_titulo TEXT;
    v_mensaje TEXT;
BEGIN
    IF OLD.cod_estado_pedido IS DISTINCT FROM NEW.cod_estado_pedido THEN
        SELECT email INTO v_email FROM usuario WHERE cod_usuario = NEW.cod_usuario;
        v_titulo := 'Actualización de pedido ' || NEW.numero_pedido;
        v_mensaje := 'Tu pedido cambió al estado: ' || NEW.cod_estado_pedido;

        PERFORM fn_crear_notificacion(NEW.cod_usuario, 'PEDIDO', v_titulo, v_mensaje, '/pedidos/' || NEW.cod_pedido);
        PERFORM fn_encolar_email(NEW.cod_usuario, v_email, v_titulo, v_mensaje);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_pago_notificar_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_usuario BIGINT;
    v_email TEXT;
    v_numero_pedido TEXT;
    v_titulo TEXT;
    v_mensaje TEXT;
BEGIN
    IF TG_OP = 'INSERT' OR OLD.cod_estado_pago IS DISTINCT FROM NEW.cod_estado_pago THEN
        SELECT p.cod_usuario, u.email, p.numero_pedido
        INTO v_cod_usuario, v_email, v_numero_pedido
        FROM pedido p
        JOIN usuario u ON u.cod_usuario = p.cod_usuario
        WHERE p.cod_pedido = NEW.cod_pedido;

        v_titulo := 'Pago ' || lower(NEW.cod_estado_pago) || ' - Pedido ' || COALESCE(v_numero_pedido, NEW.cod_pedido::TEXT);
        v_mensaje := COALESCE(NEW.mensaje, 'Estado de pago actualizado a ' || NEW.cod_estado_pago);

        PERFORM fn_crear_notificacion(v_cod_usuario, 'PAGO', v_titulo, v_mensaje, '/pedidos/' || NEW.cod_pedido);
        PERFORM fn_encolar_email(v_cod_usuario, v_email, v_titulo, v_mensaje);
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_wishlist_predeterminada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.es_predeterminada IS TRUE THEN
        UPDATE wishlist
        SET es_predeterminada = FALSE
        WHERE cod_usuario = NEW.cod_usuario
          AND cod_wishlist <> NEW.cod_wishlist
          AND activo IS TRUE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_soporte_ticket_actualizacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_email TEXT;
BEGIN
    NEW.fecha_actualizacion := now();

    IF NEW.estado = 'CERRADO' AND OLD.estado IS DISTINCT FROM NEW.estado THEN
        NEW.fecha_cierre := now();
    END IF;

    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        SELECT email INTO v_email FROM usuario WHERE cod_usuario = NEW.cod_usuario;
        PERFORM fn_crear_notificacion(NEW.cod_usuario, 'SOPORTE', 'Ticket actualizado', 'Tu ticket cambió a estado ' || NEW.estado, '/soporte/' || NEW.cod_ticket);
        PERFORM fn_encolar_email(NEW.cod_usuario, v_email, 'Ticket de soporte actualizado', 'Tu ticket "' || NEW.asunto || '" cambió a estado ' || NEW.estado);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_historial_precio_producto ON producto;
CREATE TRIGGER trg_historial_precio_producto
AFTER UPDATE OF precio_actual ON producto
FOR EACH ROW
EXECUTE FUNCTION fn_trg_historial_precio_producto();

DROP TRIGGER IF EXISTS trg_usuario_bienvenida ON usuario;
CREATE TRIGGER trg_usuario_bienvenida
AFTER INSERT ON usuario
FOR EACH ROW
EXECUTE FUNCTION fn_trg_usuario_bienvenida();

DROP TRIGGER IF EXISTS trg_pedido_notificar_estado ON pedido;
CREATE TRIGGER trg_pedido_notificar_estado
AFTER UPDATE OF cod_estado_pedido ON pedido
FOR EACH ROW
EXECUTE FUNCTION fn_trg_pedido_notificar_estado();

DROP TRIGGER IF EXISTS trg_pago_notificar_estado ON transaccion_pago;
CREATE TRIGGER trg_pago_notificar_estado
AFTER INSERT OR UPDATE OF cod_estado_pago ON transaccion_pago
FOR EACH ROW
EXECUTE FUNCTION fn_trg_pago_notificar_estado();

DROP TRIGGER IF EXISTS trg_wishlist_predeterminada ON wishlist;
CREATE TRIGGER trg_wishlist_predeterminada
AFTER INSERT OR UPDATE OF es_predeterminada ON wishlist
FOR EACH ROW
EXECUTE FUNCTION fn_trg_wishlist_predeterminada();

DROP TRIGGER IF EXISTS trg_touch_soporte_ticket ON soporte_ticket;
CREATE TRIGGER trg_touch_soporte_ticket
BEFORE UPDATE ON soporte_ticket
FOR EACH ROW
EXECUTE FUNCTION fn_trg_soporte_ticket_actualizacion();

DROP TRIGGER IF EXISTS trg_audit_historial_precio_producto ON historial_precio_producto;
CREATE TRIGGER trg_audit_historial_precio_producto
AFTER INSERT OR UPDATE OR DELETE ON historial_precio_producto
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_promocion ON promocion;
CREATE TRIGGER trg_audit_promocion
AFTER INSERT OR UPDATE OR DELETE ON promocion
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_cupon ON cupon;
CREATE TRIGGER trg_audit_cupon
AFTER INSERT OR UPDATE OR DELETE ON cupon
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_soporte_ticket ON soporte_ticket;
CREATE TRIGGER trg_audit_soporte_ticket
AFTER INSERT OR UPDATE OR DELETE ON soporte_ticket
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

DROP TRIGGER IF EXISTS trg_audit_cola_email ON cola_email;
CREATE TRIGGER trg_audit_cola_email
AFTER INSERT OR UPDATE OR DELETE ON cola_email
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_cambios();

COMMIT;

-- FASE C: la captura confirmada deja el tracking programado en la BD.
BEGIN;
CREATE OR REPLACE FUNCTION fn_trg_programar_tracking_pago()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.cod_estado_pago = 'CAPTURADO' AND (TG_OP = 'INSERT' OR OLD.cod_estado_pago IS DISTINCT FROM NEW.cod_estado_pago) THEN
        PERFORM fn_programar_tracking_pedido(NEW.cod_pedido);
    END IF;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_programar_tracking_pago ON transaccion_pago;
CREATE TRIGGER trg_programar_tracking_pago
AFTER INSERT OR UPDATE OF cod_estado_pago ON transaccion_pago
FOR EACH ROW EXECUTE FUNCTION fn_trg_programar_tracking_pago();
COMMIT;

-- TECHTAIL: redefinición final de marca sin eliminar el historial SQL.
CREATE OR REPLACE FUNCTION fn_trg_usuario_bienvenida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM fn_crear_notificacion(
        NEW.cod_usuario,
        'BIENVENIDA',
        'Bienvenido a TechTail',
        'Tu cuenta fue creada correctamente. Ya puedes explorar el catálogo.'
    );
    PERFORM fn_encolar_email(
        NEW.cod_usuario,
        NEW.email,
        'Bienvenido a TechTail',
        'Hola ' || NEW.nombres || ', tu cuenta fue creada correctamente en TechTail.'
    );
    RETURN NEW;
END;
$$;
