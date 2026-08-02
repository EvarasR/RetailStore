-- ============================================================
-- funciones.sql
-- Sistema Retail Prime - PostgreSQL 15
-- Contiene: funciones utilitarias, CRUD, lógica de negocio, vistas/reportes.
-- Ejecutar después de estructura.sql y antes de triggers.sql.
-- ============================================================

-- ============================================================
-- 02_util_functions.sql
-- Funciones utilitarias PostgreSQL 15
-- ============================================================

BEGIN;
CREATE OR REPLACE FUNCTION fn_touch_fecha_actualizacion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fecha_actualizacion := now();
    RETURN NEW;
END;
$$;

-- ============================================================
-- TECHTAIL: CAPACIDADES ADMINISTRATIVAS COMPLEMENTARIAS
-- Redefiniciones y funciones añadidas sin eliminar contratos anteriores.
-- ============================================================
CREATE OR REPLACE FUNCTION fn_configurar_archivo_producto(
    p_cod_producto BIGINT,
    p_tipo VARCHAR,
    p_url TEXT,
    p_titulo TEXT DEFAULT NULL,
    p_eliminar BOOLEAN DEFAULT FALSE
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_metadata JSONB;
    v_videos JSONB;
BEGIN
    SELECT COALESCE(metadata, '{}'::jsonb) INTO v_metadata
    FROM producto WHERE cod_producto=p_cod_producto FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
    p_tipo := upper(trim(p_tipo));
    IF p_tipo='FICHA' THEN
        v_metadata := CASE WHEN p_eliminar
            THEN v_metadata - 'ficha_tecnica'
            ELSE jsonb_set(v_metadata,'{ficha_tecnica}',jsonb_build_object('url',p_url,'titulo',COALESCE(NULLIF(trim(p_titulo),''),'Ficha técnica')),TRUE)
        END;
    ELSIF p_tipo='VIDEO' THEN
        SELECT COALESCE(jsonb_agg(x),'[]'::jsonb) INTO v_videos
        FROM jsonb_array_elements(COALESCE(v_metadata->'videos','[]'::jsonb)) x
        WHERE x->>'url' IS DISTINCT FROM p_url;
        IF NOT p_eliminar THEN
            v_videos := v_videos || jsonb_build_array(jsonb_build_object('url',p_url,'titulo',COALESCE(NULLIF(trim(p_titulo),''),'Video del producto')));
        END IF;
        v_metadata := jsonb_set(v_metadata,'{videos}',v_videos,TRUE);
    ELSE
        RAISE EXCEPTION 'Tipo de archivo no soportado';
    END IF;
    UPDATE producto SET metadata=v_metadata,fecha_actualizacion=now() WHERE cod_producto=p_cod_producto;
END; $$;

CREATE OR REPLACE FUNCTION fn_configurar_limite_producto(
    p_cod_producto BIGINT,
    p_limite_pedido INTEGER,
    p_limite_dia INTEGER DEFAULT NULL,
    p_limite_mes INTEGER DEFAULT NULL,
    p_requiere_revision BOOLEAN DEFAULT FALSE,
    p_activo BOOLEAN DEFAULT TRUE
) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT;
BEGIN
    IF p_limite_pedido<1 OR COALESCE(p_limite_dia,1)<1 OR COALESCE(p_limite_mes,1)<1 THEN
        RAISE EXCEPTION 'Los límites deben ser positivos';
    END IF;
    SELECT cod_regla INTO v_id FROM regla_limite_compra
    WHERE cod_producto=p_cod_producto ORDER BY activo DESC,fecha_creacion DESC LIMIT 1 FOR UPDATE;
    IF v_id IS NULL THEN
        INSERT INTO regla_limite_compra(cod_producto,limite_por_pedido,limite_por_dia,limite_por_mes,requiere_revision,activo)
        VALUES(p_cod_producto,p_limite_pedido,p_limite_dia,p_limite_mes,p_requiere_revision,p_activo)
        RETURNING cod_regla INTO v_id;
    ELSE
        UPDATE regla_limite_compra SET limite_por_pedido=p_limite_pedido,limite_por_dia=p_limite_dia,
            limite_por_mes=p_limite_mes,requiere_revision=p_requiere_revision,activo=p_activo
        WHERE cod_regla=v_id;
    END IF;
    RETURN v_id;
END; $$;

CREATE OR REPLACE FUNCTION fn_asociar_producto_relacionado(
    p_cod_producto BIGINT,p_cod_relacionado BIGINT,p_tipo VARCHAR DEFAULT 'RELACIONADO'
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF p_cod_producto=p_cod_relacionado THEN RAISE EXCEPTION 'Un producto no puede relacionarse consigo mismo'; END IF;
    INSERT INTO producto_relacionado(cod_producto,cod_producto_relacionado,tipo_relacion)
    VALUES(p_cod_producto,p_cod_relacionado,upper(trim(p_tipo)))
    ON CONFLICT(cod_producto,cod_producto_relacionado) DO UPDATE SET tipo_relacion=EXCLUDED.tipo_relacion;
END; $$;

CREATE OR REPLACE FUNCTION fn_desasociar_producto_relacionado(p_cod_producto BIGINT,p_cod_relacionado BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN DELETE FROM producto_relacionado WHERE cod_producto=p_cod_producto AND cod_producto_relacionado=p_cod_relacionado; END; $$;

CREATE OR REPLACE FUNCTION fn_moderar_resena_producto(p_cod_resena BIGINT,p_aprobado BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE producto_resena SET aprobado=p_aprobado WHERE cod_resena=p_cod_resena;
IF NOT FOUND THEN RAISE EXCEPTION 'Reseña no encontrada'; END IF; END; $$;

CREATE OR REPLACE FUNCTION fn_moderar_pregunta_producto(p_cod_pregunta BIGINT,p_estado VARCHAR)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF upper(p_estado) NOT IN ('PENDIENTE','PUBLICADA','RESPONDIDA','RECHAZADA') THEN RAISE EXCEPTION 'Estado de pregunta inválido'; END IF;
    UPDATE producto_pregunta SET estado=upper(p_estado) WHERE cod_pregunta=p_cod_pregunta;
    IF NOT FOUND THEN RAISE EXCEPTION 'Pregunta no encontrada'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION fn_desasociar_promocion_producto(p_cod_promocion BIGINT,p_cod_producto BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN DELETE FROM promocion_producto WHERE cod_promocion=p_cod_promocion AND cod_producto=p_cod_producto; END; $$;

CREATE OR REPLACE FUNCTION fn_actualizar_plan_membresia(p_cod_plan BIGINT,p_nombre TEXT,p_precio NUMERIC,p_duracion INTEGER,p_activo BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF p_precio<0 OR p_duracion<1 THEN RAISE EXCEPTION 'Precio o duración inválidos'; END IF;
    UPDATE plan_membresia SET nombre=trim(p_nombre),precio_mensual=p_precio,duracion_dias=p_duracion,activo=p_activo WHERE cod_plan=p_cod_plan;
    IF NOT FOUND THEN RAISE EXCEPTION 'Plan no encontrado'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION fn_cancelar_membresia_usuario(p_cod_membresia BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE membresia_usuario SET cod_estado_membresia='CANCELADA',renovacion_automatica=FALSE WHERE cod_membresia=p_cod_membresia AND cod_estado_membresia<>'CANCELADA';
    IF NOT FOUND THEN RAISE EXCEPTION 'Membresía no encontrada o ya cancelada'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION fn_crear_rol(p_nombre TEXT,p_descripcion TEXT DEFAULT NULL)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT; BEGIN INSERT INTO rol(nombre,descripcion,activo) VALUES(upper(trim(p_nombre)),p_descripcion,TRUE) RETURNING cod_rol INTO v_id; RETURN v_id; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_rol(p_cod_rol BIGINT,p_nombre TEXT,p_descripcion TEXT,p_activo BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE rol SET nombre=upper(trim(p_nombre)),descripcion=p_descripcion,activo=p_activo WHERE cod_rol=p_cod_rol; IF NOT FOUND THEN RAISE EXCEPTION 'Rol no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_crear_permiso(p_codigo TEXT,p_nombre TEXT,p_descripcion TEXT DEFAULT NULL)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT; BEGIN INSERT INTO permiso(codigo,nombre,descripcion,activo) VALUES(lower(trim(p_codigo)),trim(p_nombre),p_descripcion,TRUE) RETURNING cod_permiso INTO v_id; RETURN v_id; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_permiso(p_cod_permiso BIGINT,p_codigo TEXT,p_nombre TEXT,p_descripcion TEXT,p_activo BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE permiso SET codigo=lower(trim(p_codigo)),nombre=trim(p_nombre),descripcion=p_descripcion,activo=p_activo WHERE cod_permiso=p_cod_permiso; IF NOT FOUND THEN RAISE EXCEPTION 'Permiso no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_asignar_permiso_rol(p_cod_rol BIGINT,p_cod_permiso BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN INSERT INTO rol_permiso(cod_rol,cod_permiso) VALUES(p_cod_rol,p_cod_permiso) ON CONFLICT DO NOTHING; END; $$;
CREATE OR REPLACE FUNCTION fn_revocar_permiso_rol(p_cod_rol BIGINT,p_cod_permiso BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN DELETE FROM rol_permiso WHERE cod_rol=p_cod_rol AND cod_permiso=p_cod_permiso; END; $$;
CREATE OR REPLACE FUNCTION fn_reactivar_usuario(p_cod_usuario BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE usuario SET activo=TRUE,fecha_actualizacion=now() WHERE cod_usuario=p_cod_usuario; IF NOT FOUND THEN RAISE EXCEPTION 'Usuario no encontrado'; END IF; END; $$;

CREATE OR REPLACE FUNCTION fn_actualizar_almacen(p_cod_almacen BIGINT,p_nombre TEXT,p_direccion TEXT,p_ciudad TEXT,p_provincia TEXT,p_activo BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE almacen SET nombre=trim(p_nombre),direccion=p_direccion,ciudad=p_ciudad,provincia=p_provincia,activo=p_activo WHERE cod_almacen=p_cod_almacen; IF NOT FOUND THEN RAISE EXCEPTION 'Almacén no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_almacen(p_cod_almacen BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE almacen SET activo=FALSE WHERE cod_almacen=p_cod_almacen; IF NOT FOUND THEN RAISE EXCEPTION 'Almacén no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_estado_lote(p_cod_lote BIGINT,p_estado VARCHAR)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN IF upper(p_estado) NOT IN ('ACTIVO','AGOTADO','BLOQUEADO','ANULADO') THEN RAISE EXCEPTION 'Estado de lote inválido'; END IF; UPDATE lote_inventario SET estado=upper(p_estado),fecha_actualizacion=now() WHERE cod_lote=p_cod_lote; IF NOT FOUND THEN RAISE EXCEPTION 'Lote no encontrado'; END IF; END; $$;

CREATE OR REPLACE FUNCTION fn_crear_transportista(p_nombre TEXT,p_telefono TEXT DEFAULT NULL,p_email TEXT DEFAULT NULL)
RETURNS BIGINT LANGUAGE plpgsql AS $$ DECLARE v_id BIGINT; BEGIN INSERT INTO transportista(nombre,telefono,email,activo) VALUES(trim(p_nombre),p_telefono,p_email,TRUE) RETURNING cod_transportista INTO v_id; RETURN v_id; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_transportista(p_cod BIGINT,p_nombre TEXT,p_telefono TEXT,p_email TEXT,p_activo BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE transportista SET nombre=trim(p_nombre),telefono=p_telefono,email=p_email,activo=p_activo WHERE cod_transportista=p_cod; IF NOT FOUND THEN RAISE EXCEPTION 'Transportista no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_crear_metodo_envio(p_nombre TEXT,p_dias_min INTEGER,p_dias_max INTEGER,p_costo NUMERIC,p_prime BOOLEAN DEFAULT FALSE)
RETURNS BIGINT LANGUAGE plpgsql AS $$ DECLARE v_id BIGINT; BEGIN IF p_dias_min<0 OR p_dias_max<p_dias_min OR p_costo<0 THEN RAISE EXCEPTION 'Configuración de envío inválida'; END IF; INSERT INTO metodo_envio(nombre,dias_min,dias_max,costo_base,es_premium_gratis,activo) VALUES(trim(p_nombre),p_dias_min,p_dias_max,p_costo,p_prime,TRUE) RETURNING cod_metodo_envio INTO v_id; RETURN v_id; END; $$;
CREATE OR REPLACE FUNCTION fn_crear_zona_entrega(p_ciudad TEXT,p_provincia TEXT,p_recargo NUMERIC DEFAULT 0)
RETURNS BIGINT LANGUAGE plpgsql AS $$ DECLARE v_id BIGINT; BEGIN INSERT INTO zona_entrega(ciudad,provincia,recargo,activo) VALUES(trim(p_ciudad),trim(p_provincia),p_recargo,TRUE) RETURNING cod_zona INTO v_id; RETURN v_id; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_zona_entrega(p_cod BIGINT,p_ciudad TEXT,p_provincia TEXT,p_recargo NUMERIC,p_activo BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE zona_entrega SET ciudad=trim(p_ciudad),provincia=trim(p_provincia),recargo=p_recargo,activo=p_activo WHERE cod_zona=p_cod; IF NOT FOUND THEN RAISE EXCEPTION 'Zona no encontrada'; END IF; END; $$;

CREATE OR REPLACE FUNCTION fn_actualizar_estado_ticket_soporte(p_cod_ticket BIGINT,p_estado VARCHAR)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF upper(p_estado) NOT IN ('ABIERTO','EN_PROCESO','ESCALADO','CERRADO') THEN RAISE EXCEPTION 'Estado de ticket inválido'; END IF;
    UPDATE soporte_ticket SET estado=upper(p_estado),fecha_actualizacion=now(),fecha_cierre=CASE WHEN upper(p_estado)='CERRADO' THEN now() ELSE NULL END WHERE cod_ticket=p_cod_ticket;
    IF NOT FOUND THEN RAISE EXCEPTION 'Ticket no encontrado'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION fn_actualizar_compra_recurrente(p_cod_compra BIGINT,p_nombre TEXT,p_frecuencia INTEGER,p_proxima DATE,p_activa BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN IF p_frecuencia<1 THEN RAISE EXCEPTION 'Frecuencia inválida'; END IF; UPDATE compra_recurrente SET nombre=trim(p_nombre),frecuencia_dias=p_frecuencia,proxima_ejecucion=p_proxima,activa=p_activa WHERE cod_compra_recurrente=p_cod_compra; IF NOT FOUND THEN RAISE EXCEPTION 'Compra recurrente no encontrada'; END IF; END; $$;

CREATE OR REPLACE FUNCTION fn_actualizar_producto_completo(
    p_cod_producto BIGINT,p_cod_categoria BIGINT,p_cod_marca BIGINT,p_sku TEXT,p_nombre TEXT,
    p_descripcion TEXT,p_precio NUMERIC,p_peso NUMERIC,p_largo NUMERIC,p_ancho NUMERIC,p_alto NUMERIC
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    IF NULLIF(trim(p_sku),'') IS NULL OR NULLIF(trim(p_nombre),'') IS NULL THEN RAISE EXCEPTION 'SKU y nombre son obligatorios'; END IF;
    IF p_precio<=0 OR p_peso<0 OR p_largo<0 OR p_ancho<0 OR p_alto<0 THEN RAISE EXCEPTION 'Precio o dimensiones inválidos'; END IF;
    IF EXISTS(SELECT 1 FROM producto WHERE lower(sku)=lower(trim(p_sku)) AND cod_producto<>p_cod_producto) THEN RAISE EXCEPTION 'El SKU ya está registrado'; END IF;
    UPDATE producto SET cod_categoria=p_cod_categoria,cod_marca=p_cod_marca,sku=trim(p_sku),nombre=trim(p_nombre),
        descripcion=COALESCE(p_descripcion,''),precio_actual=p_precio,peso_kg=p_peso,largo_cm=p_largo,
        ancho_cm=p_ancho,alto_cm=p_alto,fecha_actualizacion=now()
    WHERE cod_producto=p_cod_producto;
    IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION fn_auditar_cambios()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_pk TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_pk := to_jsonb(NEW)->>('cod_' || TG_TABLE_NAME);
        INSERT INTO auditoria(tabla, operacion, cod_registro, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_pk, NULL, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        v_pk := to_jsonb(NEW)->>('cod_' || TG_TABLE_NAME);
        INSERT INTO auditoria(tabla, operacion, cod_registro, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_pk, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        v_pk := to_jsonb(OLD)->>('cod_' || TG_TABLE_NAME);
        INSERT INTO auditoria(tabla, operacion, cod_registro, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_pk, to_jsonb(OLD), NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_numero_pedido()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'RP-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_numero_factura()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'FAC-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_numero_tracking()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'TRK-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_codigo_autorizacion()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'AUTH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
END;
$$;

CREATE OR REPLACE FUNCTION fn_luhn_valid(p_numero TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_num TEXT := regexp_replace(COALESCE(p_numero,''), '\D', '', 'g');
    v_len INT;
    v_sum INT := 0;
    v_digit INT;
    v_double BOOLEAN := FALSE;
    i INT;
BEGIN
    v_len := length(v_num);
    IF v_len < 12 OR v_len > 19 THEN
        RETURN FALSE;
    END IF;

    FOR i IN REVERSE v_len..1 LOOP
        v_digit := substr(v_num, i, 1)::INT;
        IF v_double THEN
            v_digit := v_digit * 2;
            IF v_digit > 9 THEN
                v_digit := v_digit - 9;
            END IF;
        END IF;
        v_sum := v_sum + v_digit;
        v_double := NOT v_double;
    END LOOP;

    RETURN (v_sum % 10 = 0);
END;
$$;

CREATE OR REPLACE FUNCTION fn_detectar_marca_tarjeta(p_numero TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_num TEXT := regexp_replace(COALESCE(p_numero,''), '\D', '', 'g');
    v_prefijo TEXT;
    v_marca TEXT;
BEGIN
    SELECT b.marca
    INTO v_marca
    FROM bin_tarjeta b
    WHERE b.activo IS TRUE
      AND length(v_num) BETWEEN b.longitud_min AND b.longitud_max
      AND left(v_num, length(b.prefijo)) = b.prefijo
    ORDER BY length(b.prefijo) DESC
    LIMIT 1;

    IF v_marca IS NOT NULL THEN
        RETURN v_marca;
    END IF;

    IF v_num LIKE '4%' THEN
        RETURN 'VISA';
    ELSIF substring(v_num from 1 for 2)::INT BETWEEN 51 AND 55 THEN
        RETURN 'MASTERCARD';
    ELSIF substring(v_num from 1 for 2) IN ('34','37') THEN
        RETURN 'AMEX';
    ELSIF v_num LIKE '6011%' OR v_num LIKE '65%' THEN
        RETURN 'DISCOVER';
    ELSIF substring(v_num from 1 for 2) IN ('36','38') THEN
        RETURN 'DINERS';
    END IF;

    RETURN 'DESCONOCIDA';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'DESCONOCIDA';
END;
$$;

CREATE OR REPLACE FUNCTION fn_cvv_longitud_por_marca(p_marca TEXT)
RETURNS SMALLINT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF upper(p_marca) = 'AMEX' THEN
        RETURN 4;
    END IF;
    RETURN 3;
END;
$$;

CREATE OR REPLACE FUNCTION fn_usuario_tiene_membresia_activa(p_cod_usuario BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM membresia_usuario mu
        WHERE mu.cod_usuario = p_cod_usuario
          AND mu.cod_estado_membresia = 'ACTIVA'
          AND current_date BETWEEN mu.fecha_inicio AND mu.fecha_fin
    );
$$;

CREATE OR REPLACE FUNCTION fn_stock_disponible_producto(p_cod_producto BIGINT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(SUM(stock_total - stock_reservado), 0)::INTEGER
    FROM inventario
    WHERE cod_producto = p_cod_producto;
$$;

-- ============================================================
-- FASE B: CÁLCULO ÚNICO DE PRECIO FINAL Y PAGO CONSISTENTE
-- ============================================================
CREATE OR REPLACE FUNCTION fn_obtener_tasa_impuesto()
RETURNS NUMERIC LANGUAGE sql STABLE AS $$
 SELECT COALESCE((SELECT CASE WHEN valor ~ '^[0-9]+([.][0-9]+)?$' THEN valor::NUMERIC ELSE 0 END FROM parametro_sistema WHERE clave='IVA_PORCENTAJE'),0);
$$;
CREATE OR REPLACE FUNCTION fn_calcular_descuento_promocion(p_cod_producto BIGINT,p_precio_base NUMERIC,p_fecha TIMESTAMPTZ DEFAULT now())
RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE r RECORD; v_desc NUMERIC:=0; v_cod BIGINT;
BEGIN
 FOR r IN SELECT pr.cod_promocion,pr.tipo_descuento,pr.valor,pr.acumulable FROM promocion pr JOIN promocion_producto pp ON pp.cod_promocion=pr.cod_promocion
          WHERE pp.cod_producto=p_cod_producto AND pr.activo AND p_fecha BETWEEN pr.fecha_inicio AND pr.fecha_fin ORDER BY pr.acumulable,pr.valor DESC LOOP
   v_desc:=LEAST(p_precio_base,CASE WHEN r.tipo_descuento='PORCENTAJE' THEN ROUND(p_precio_base*r.valor/100,2) ELSE r.valor END); v_cod:=r.cod_promocion;
   EXIT WHEN r.acumulable IS FALSE;
 END LOOP;
 RETURN jsonb_build_object('cod_promocion',v_cod,'descuento',COALESCE(v_desc,0),'aplicada',v_cod IS NOT NULL);
END; $$;
CREATE OR REPLACE FUNCTION fn_calcular_descuento_prime(p_cod_usuario BIGINT,p_precio_base NUMERIC)
RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE v_cod_beneficio BIGINT; v_codigo VARCHAR(80); v_valor NUMERIC; v_desc NUMERIC:=0;
BEGIN
 SELECT b.cod_beneficio,b.codigo,b.valor INTO v_cod_beneficio,v_codigo,v_valor FROM membresia_usuario mu JOIN beneficio_membresia b ON b.cod_plan=mu.cod_plan
 WHERE mu.cod_usuario=$1 AND mu.cod_estado_membresia='ACTIVA' AND mu.fecha_fin>=current_date AND b.activo
   AND b.codigo IN ('DESCUENTO_PRIME','DESCUENTO_PORCENTAJE') ORDER BY b.valor DESC LIMIT 1;
 IF v_cod_beneficio IS NOT NULL THEN v_desc:=LEAST(p_precio_base,CASE WHEN v_codigo='DESCUENTO_PORCENTAJE' THEN ROUND(p_precio_base*COALESCE(v_valor,0)/100,2) ELSE COALESCE(v_valor,0) END); END IF;
 RETURN jsonb_build_object('cod_beneficio',v_cod_beneficio,'descuento',v_desc,'aplicado',v_cod_beneficio IS NOT NULL);
END; $$;
CREATE OR REPLACE FUNCTION fn_calcular_precio_final_item(p_cod_usuario BIGINT,p_cod_producto BIGINT,p_cantidad INTEGER,p_precio_base NUMERIC DEFAULT NULL,p_codigo_cupon TEXT DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE v_base NUMERIC; v_prom JSONB; v_prime JSONB; v_cupon NUMERIC:=0; v_final NUMERIC;
BEGIN
 IF p_cantidad<=0 THEN RAISE EXCEPTION 'Cantidad inválida'; END IF;
 SELECT COALESCE(p_precio_base,l.pvp_unitario,p.precio_actual) INTO v_base FROM producto p LEFT JOIN LATERAL
   (SELECT pvp_unitario FROM lote_inventario WHERE cod_producto=p.cod_producto AND estado='ACTIVO' AND cantidad_disponible>cantidad_reservada ORDER BY fecha_recepcion,cod_lote LIMIT 1) l ON TRUE WHERE p.cod_producto=$2;
 IF v_base IS NULL THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
 v_prom:=fn_calcular_descuento_promocion(p_cod_producto,v_base); v_prime:=fn_calcular_descuento_prime(p_cod_usuario,v_base-(v_prom->>'descuento')::NUMERIC);
 IF p_codigo_cupon IS NOT NULL THEN v_cupon:=ROUND(fn_calcular_descuento_cupon(p_codigo_cupon,p_cod_usuario,(v_base-(v_prom->>'descuento')::NUMERIC-(v_prime->>'descuento')::NUMERIC)*p_cantidad)/p_cantidad,2); END IF;
 v_final:=GREATEST(v_base-(v_prom->>'descuento')::NUMERIC-(v_prime->>'descuento')::NUMERIC-v_cupon,0);
 RETURN jsonb_build_object('precio_base',v_base,'pvp_lote',v_base,'promocion_aplicada',v_prom,'descuento_promocion',(v_prom->>'descuento')::NUMERIC,'prime_aplicado',v_prime,'descuento_prime',(v_prime->>'descuento')::NUMERIC,'cupon_aplicado',p_codigo_cupon,'descuento_cupon',v_cupon,'precio_final_unitario',v_final,'subtotal',ROUND(v_final*p_cantidad,2),'explicacion','base - promoción - Prime - cupón');
END; $$;
CREATE OR REPLACE FUNCTION fn_calcular_costo_envio(p_cod_usuario BIGINT,p_cod_metodo_envio BIGINT,p_cod_zona_entrega BIGINT,p_subtotal NUMERIC)
RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE m RECORD; z NUMERIC:=0; v_cod_beneficio BIGINT; v NUMERIC;
BEGIN
 SELECT * INTO m FROM metodo_envio WHERE cod_metodo_envio=p_cod_metodo_envio AND activo; IF NOT FOUND THEN RAISE EXCEPTION 'Método de envío inválido'; END IF;
 SELECT COALESCE(recargo,0) INTO z FROM zona_entrega WHERE cod_zona=p_cod_zona_entrega AND activo; z:=COALESCE(z,0);
 SELECT bm.cod_beneficio INTO v_cod_beneficio FROM membresia_usuario mu JOIN beneficio_membresia bm ON bm.cod_plan=mu.cod_plan WHERE mu.cod_usuario=p_cod_usuario AND mu.cod_estado_membresia='ACTIVA' AND mu.fecha_fin>=current_date AND bm.codigo='ENVIO_GRATIS' AND bm.activo LIMIT 1;
 v:=CASE WHEN v_cod_beneficio IS NOT NULL AND m.es_premium_gratis THEN 0 ELSE m.costo_base+z END;
 RETURN jsonb_build_object('costo_envio',v,'costo_base',m.costo_base,'recargo_zona',z,'cod_beneficio',v_cod_beneficio,'prime_aplicado',v_cod_beneficio IS NOT NULL AND m.es_premium_gratis);
END; $$;
CREATE OR REPLACE FUNCTION fn_registrar_uso_beneficio(p_cod_usuario BIGINT,p_cod_beneficio BIGINT,p_cod_pedido BIGINT,p_valor NUMERIC)
RETURNS BIGINT LANGUAGE plpgsql AS $$ DECLARE v BIGINT; BEGIN IF p_cod_beneficio IS NULL OR p_valor<=0 THEN RETURN NULL; END IF; INSERT INTO uso_beneficio(cod_usuario,cod_beneficio,cod_pedido,valor_aplicado) VALUES(p_cod_usuario,p_cod_beneficio,p_cod_pedido,p_valor) RETURNING cod_uso_beneficio INTO v; RETURN v; END; $$;
CREATE OR REPLACE FUNCTION fn_validar_transicion_pedido(p_actual VARCHAR,p_nuevo VARCHAR)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN
 IF p_actual=p_nuevo THEN RETURN; END IF;
 IF NOT ((p_actual='PENDIENTE_PAGO' AND p_nuevo IN ('PAGO_AUTORIZADO','CANCELADO')) OR (p_actual='PAGO_AUTORIZADO' AND p_nuevo IN ('PREPARANDO','ESPERANDO_PROVEEDOR','CANCELADO')) OR (p_actual IN ('PREPARANDO','ESPERANDO_PROVEEDOR') AND p_nuevo IN ('LISTO_ENVIO','CANCELADO')) OR (p_actual='LISTO_ENVIO' AND p_nuevo='ENVIADO') OR (p_actual='ENVIADO' AND p_nuevo='EN_TRANSITO') OR (p_actual='EN_TRANSITO' AND p_nuevo='EN_REPARTO') OR (p_actual='EN_REPARTO' AND p_nuevo='ENTREGADO') OR (p_actual='ENTREGADO' AND p_nuevo='DEVOLUCION_SOLICITADA') OR (p_actual='DEVOLUCION_SOLICITADA' AND p_nuevo='DEVUELTO') OR (p_actual='DEVUELTO' AND p_nuevo='REEMBOLSADO')) THEN RAISE EXCEPTION 'Transición de pedido inválida: % -> %',p_actual,p_nuevo; END IF;
END; $$;
CREATE OR REPLACE FUNCTION fn_anular_autorizaciones_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE transaccion_pago SET cod_estado_pago='ANULADO',mensaje='Autorización anulada por cancelación',fecha_actualizacion=now() WHERE cod_pedido=p_cod_pedido AND cod_estado_pago='AUTORIZADO'; END; $$;

CREATE OR REPLACE FUNCTION fn_stock_proveedor_disponible_producto(p_cod_producto BIGINT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(SUM(ps.cantidad_disponible), 0)::INTEGER
    FROM producto_proveedor pp
    JOIN proveedor_stock ps ON ps.cod_producto_proveedor = pp.cod_producto_proveedor
    JOIN proveedor pr ON pr.cod_proveedor = pp.cod_proveedor
    WHERE pp.cod_producto = p_cod_producto
      AND pp.activo IS TRUE
      AND pr.activo IS TRUE;
$$;

CREATE OR REPLACE FUNCTION fn_contar_proveedores_activos_producto(p_cod_producto BIGINT)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM producto_proveedor pp
    JOIN proveedor p ON p.cod_proveedor = pp.cod_proveedor
    WHERE pp.cod_producto = p_cod_producto
      AND pp.activo IS TRUE
      AND p.activo IS TRUE;
$$;

CREATE OR REPLACE FUNCTION fn_producto_tiene_imagen_principal(p_cod_producto BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM producto_imagen
        WHERE cod_producto = p_cod_producto
          AND es_principal IS TRUE
    );
$$;

CREATE OR REPLACE FUNCTION fn_obtener_limite_retail(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT
)
RETURNS TABLE (
    limite_por_pedido INTEGER,
    limite_por_dia INTEGER,
    limite_por_mes INTEGER,
    requiere_revision BOOLEAN
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_cod_categoria BIGINT;
BEGIN
    SELECT cod_categoria INTO v_cod_categoria
    FROM producto
    WHERE cod_producto = p_cod_producto;

    RETURN QUERY
    SELECT r.limite_por_pedido, r.limite_por_dia, r.limite_por_mes, r.requiere_revision
    FROM regla_limite_compra r
    WHERE r.activo IS TRUE
      AND r.cod_producto = p_cod_producto
    LIMIT 1;

    IF FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT r.limite_por_pedido, r.limite_por_dia, r.limite_por_mes, r.requiere_revision
    FROM regla_limite_compra r
    WHERE r.activo IS TRUE
      AND r.cod_producto IS NULL
      AND r.cod_categoria = v_cod_categoria
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 10, 20, 50, FALSE;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_recalcular_total_pedido(p_cod_pedido BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_subtotal NUMERIC(12,2);
    v_descuento NUMERIC(12,2);
    v_costo_envio NUMERIC(12,2);
BEGIN
    SELECT COALESCE(SUM(subtotal_linea),0)
    INTO v_subtotal
    FROM pedido_detalle
    WHERE cod_pedido = p_cod_pedido;

    SELECT descuento, costo_envio
    INTO v_descuento, v_costo_envio
    FROM pedido
    WHERE cod_pedido = p_cod_pedido;

    UPDATE pedido
    SET subtotal = v_subtotal,
        total = GREATEST(v_subtotal - COALESCE(v_descuento,0) + COALESCE(v_costo_envio,0), 0),
        fecha_actualizacion = now()
    WHERE cod_pedido = p_cod_pedido;
END;
$$;

CREATE OR REPLACE FUNCTION fn_total_carrito(p_cod_carrito BIGINT)
RETURNS NUMERIC(12,2)
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(SUM(cantidad * precio_unitario_snapshot), 0)::NUMERIC(12,2)
    FROM carrito_detalle
    WHERE cod_carrito = p_cod_carrito;
$$;

CREATE OR REPLACE FUNCTION fn_normalizar_email(p_email TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT lower(trim(p_email));
$$;

CREATE OR REPLACE FUNCTION fn_generar_password_hash_django(
    p_password TEXT,
    p_salt TEXT DEFAULT NULL,
    p_iterations INTEGER DEFAULT 120000
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_algorithm CONSTANT TEXT := 'pbkdf2_sha256';
    v_iterations INTEGER := COALESCE(p_iterations, 120000);
    v_salt TEXT;
    v_password_key BYTEA;
    v_u BYTEA;
    v_t BYTEA;
    v_i INTEGER;
    v_j INTEGER;
BEGIN
    IF COALESCE(length(p_password), 0) < 8 THEN
        RAISE EXCEPTION 'La contraseña debe tener al menos 8 caracteres';
    END IF;

    IF v_iterations < 10000 THEN
        RAISE EXCEPTION 'Las iteraciones PBKDF2 deben ser al menos 10000';
    END IF;

    v_salt := NULLIF(regexp_replace(COALESCE(p_salt, ''), '[^A-Za-z0-9]', '', 'g'), '');

    IF v_salt IS NULL THEN
        v_salt := regexp_replace(encode(gen_random_bytes(18), 'base64'), '[^A-Za-z0-9]', '', 'g');
    END IF;

    IF length(v_salt) < 12 THEN
        v_salt := v_salt || substr(encode(digest(v_salt || clock_timestamp()::TEXT || gen_random_uuid()::TEXT, 'sha256'), 'hex'), 1, 12);
    END IF;

    v_salt := substr(v_salt, 1, 22);
    v_password_key := convert_to(p_password, 'UTF8');

    -- PBKDF2-HMAC-SHA256, dkLen=32, bloque 1: U1 = HMAC(password, salt || INT_32_BE(1)).
    v_u := hmac(convert_to(v_salt, 'UTF8') || decode('00000001', 'hex'), v_password_key, 'sha256');
    v_t := v_u;

    FOR v_i IN 2..v_iterations LOOP
        v_u := hmac(v_u, v_password_key, 'sha256');
        FOR v_j IN 0..31 LOOP
            v_t := set_byte(v_t, v_j, get_byte(v_t, v_j) # get_byte(v_u, v_j));
        END LOOP;
    END LOOP;

    RETURN v_algorithm || '$' || v_iterations || '$' || v_salt || '$' || encode(v_t, 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION fn_cambiar_password_usuario(
    p_cod_usuario BIGINT,
    p_password TEXT,
    p_iterations INTEGER DEFAULT 120000
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_salt TEXT;
BEGIN
    IF p_cod_usuario IS NULL THEN
        RAISE EXCEPTION 'Debe indicar el usuario';
    END IF;

    v_salt := 'usr' || p_cod_usuario::TEXT || substr(encode(gen_random_bytes(12), 'hex'), 1, 12);

    UPDATE usuario
    SET password_hash = fn_generar_password_hash_django(p_password, v_salt, p_iterations),
        fecha_actualizacion = now()
    WHERE cod_usuario = p_cod_usuario
      AND activo IS TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado o inactivo: %', p_cod_usuario;
    END IF;
END;
$$;


COMMIT;

-- ============================================================
-- FASE A: LOTES, FIFO, RESERVAS Y REPOSICIÓN PREVENTIVA
-- Las redefiniciones al final preservan los contratos ya consumidos por Django.
-- ============================================================
BEGIN;

CREATE OR REPLACE FUNCTION fn_obtener_regla_precio_producto(
    p_cod_producto BIGINT,
    p_fecha_referencia TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
    cod_regla_precio BIGINT, margen_porcentaje NUMERIC, costo_operativo_porcentaje NUMERIC,
    costo_fijo_unitario NUMERIC, porcentaje_impuesto NUMERIC, prioridad INTEGER,
    nivel_aplicacion TEXT
)
LANGUAGE sql STABLE AS $$
    WITH producto_objetivo AS (
        SELECT cod_categoria FROM producto WHERE cod_producto = p_cod_producto
    ), candidatas AS (
        SELECT r.*, 1 AS nivel, 'PRODUCTO'::TEXT AS etiqueta FROM regla_precio r
        WHERE r.cod_producto = p_cod_producto
        UNION ALL
        SELECT r.*, 2, 'CATEGORIA'::TEXT FROM regla_precio r JOIN producto_objetivo p ON p.cod_categoria = r.cod_categoria
        WHERE r.cod_producto IS NULL
        UNION ALL
        SELECT r.*, 3, 'GLOBAL'::TEXT FROM regla_precio r
        WHERE r.cod_producto IS NULL AND r.cod_categoria IS NULL
    )
    SELECT cod_regla_precio, margen_porcentaje, costo_operativo_porcentaje,
           costo_fijo_unitario, porcentaje_impuesto, prioridad, etiqueta
    FROM candidatas
    WHERE activo IS TRUE
      AND (fecha_inicio IS NULL OR fecha_inicio <= p_fecha_referencia)
      AND (fecha_fin IS NULL OR fecha_fin >= p_fecha_referencia)
    ORDER BY nivel, prioridad, cod_regla_precio
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION fn_calcular_pvp_lote(
    p_cod_producto BIGINT,
    p_costo_unitario NUMERIC,
    p_fecha_referencia TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql STABLE AS $$
DECLARE r RECORD; v_impuesto NUMERIC := 0; v_base NUMERIC; v_pvp NUMERIC;
BEGIN
    IF p_costo_unitario IS NULL OR p_costo_unitario <= 0 THEN RAISE EXCEPTION 'Costo unitario inválido'; END IF;
    SELECT * INTO r FROM fn_obtener_regla_precio_producto(p_cod_producto, p_fecha_referencia);
    IF NOT FOUND THEN
        SELECT NULL::BIGINT AS cod_regla_precio,
               0::NUMERIC AS margen_porcentaje,
               0::NUMERIC AS costo_operativo_porcentaje,
               0::NUMERIC AS costo_fijo_unitario,
               NULL::NUMERIC AS porcentaje_impuesto,
               NULL::INTEGER AS prioridad,
               NULL::TEXT AS nivel_aplicacion
        INTO r;
    END IF;
    IF r.cod_regla_precio IS NULL THEN
        r.margen_porcentaje := 0; r.costo_operativo_porcentaje := 0; r.costo_fijo_unitario := 0; r.porcentaje_impuesto := NULL;
    END IF;
    SELECT CASE WHEN valor ~ '^[0-9]+([.][0-9]+)?$' THEN valor::NUMERIC ELSE 0 END
      INTO v_impuesto FROM parametro_sistema WHERE clave = 'IVA_PORCENTAJE';
    v_impuesto := COALESCE(r.porcentaje_impuesto, v_impuesto, 0);
    v_base := p_costo_unitario * (1 + COALESCE(r.margen_porcentaje,0) / 100 + COALESCE(r.costo_operativo_porcentaje,0) / 100)
              + COALESCE(r.costo_fijo_unitario,0);
    v_pvp := ROUND(v_base * (1 + v_impuesto / 100), 2);
    RETURN jsonb_build_object('cod_regla_precio', r.cod_regla_precio, 'margen_porcentaje', COALESCE(r.margen_porcentaje,0),
        'costo_operativo_porcentaje', COALESCE(r.costo_operativo_porcentaje,0), 'costo_fijo_unitario', COALESCE(r.costo_fijo_unitario,0),
        'porcentaje_impuesto', v_impuesto, 'precio_sin_impuesto', ROUND(v_base,2), 'pvp_unitario', v_pvp);
END;
$$;

-- El cupon se distribuye en las lineas antes de recalcular el pedido; asi el
-- recalculo SQL conserva exactamente el descuento que se cobra y factura.
CREATE OR REPLACE FUNCTION fn_aplicar_cupon_pedido(
    p_cod_pedido BIGINT,
    p_codigo_cupon TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_pedido RECORD;
    v_cod_cupon BIGINT;
    v_base_cupon NUMERIC;
    v_descuento_solicitado NUMERIC;
    v_descuento_aplicado NUMERIC;
BEGIN
    SELECT * INTO v_pedido
    FROM pedido
    WHERE cod_pedido = $1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado';
    END IF;

    IF v_pedido.cod_estado_pedido <> 'PENDIENTE_PAGO' THEN
        RAISE EXCEPTION 'El cupon solo se puede aplicar a un pedido pendiente de pago';
    END IF;

    SELECT c.cod_cupon INTO v_cod_cupon
    FROM cupon c
    WHERE c.codigo = upper(trim($2));

    IF v_cod_cupon IS NULL THEN
        RAISE EXCEPTION 'Cupon no encontrado';
    END IF;

    -- La operacion es repetible para el mismo pedido: se sustituye el cupon
    -- previo antes de calcular y distribuir el nuevo descuento.
    UPDATE pedido_detalle
    SET descuento_cupon_unitario = 0,
        precio_final_unitario = GREATEST(precio_base_unitario
            - descuento_promocion_unitario - descuento_prime_unitario, 0),
        precio_unitario = GREATEST(precio_base_unitario
            - descuento_promocion_unitario - descuento_prime_unitario, 0)
    WHERE cod_pedido = $1;

    SELECT COALESCE(SUM(cantidad * precio_final_unitario), 0)
    INTO v_base_cupon
    FROM pedido_detalle
    WHERE cod_pedido = $1;

    v_descuento_solicitado := fn_calcular_descuento_cupon($2, v_pedido.cod_usuario, v_base_cupon);

    IF v_base_cupon > 0 AND v_descuento_solicitado > 0 THEN
        UPDATE pedido_detalle pd
        SET descuento_cupon_unitario = LEAST(
                GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario - pd.descuento_prime_unitario, 0),
                ROUND(v_descuento_solicitado
                    * (pd.cantidad * GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario - pd.descuento_prime_unitario, 0))
                    / v_base_cupon / pd.cantidad, 2)
            ),
            precio_final_unitario = GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario
                - pd.descuento_prime_unitario - LEAST(
                    GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario - pd.descuento_prime_unitario, 0),
                    ROUND(v_descuento_solicitado
                        * (pd.cantidad * GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario - pd.descuento_prime_unitario, 0))
                        / v_base_cupon / pd.cantidad, 2)
                ), 0),
            precio_unitario = GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario
                - pd.descuento_prime_unitario - LEAST(
                    GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario - pd.descuento_prime_unitario, 0),
                    ROUND(v_descuento_solicitado
                        * (pd.cantidad * GREATEST(pd.precio_base_unitario - pd.descuento_promocion_unitario - pd.descuento_prime_unitario, 0))
                        / v_base_cupon / pd.cantidad, 2)
                ), 0)
        WHERE pd.cod_pedido = $1;
    END IF;

    PERFORM fn_recalcular_total_pedido($1);

    SELECT descuento INTO v_descuento_aplicado
    FROM pedido
    WHERE cod_pedido = $1;

    INSERT INTO cupon_uso(cod_cupon, cod_usuario, cod_pedido, valor_aplicado)
    VALUES(v_cod_cupon, v_pedido.cod_usuario, $1, v_descuento_aplicado)
    ON CONFLICT (cod_cupon, cod_pedido) DO UPDATE
    SET valor_aplicado = EXCLUDED.valor_aplicado;

    RETURN v_descuento_aplicado;
END;
$$;

CREATE OR REPLACE FUNCTION fn_recalcular_inventario_desde_lotes(
    p_cod_producto BIGINT DEFAULT NULL, p_cod_almacen BIGINT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO inventario(cod_producto, cod_almacen, stock_total, stock_reservado, stock_minimo)
    SELECT cod_producto, cod_almacen, SUM(cantidad_disponible)::INTEGER, SUM(cantidad_reservada)::INTEGER, 0
    FROM lote_inventario
    WHERE (p_cod_producto IS NULL OR cod_producto = p_cod_producto)
      AND (p_cod_almacen IS NULL OR cod_almacen = p_cod_almacen)
    GROUP BY cod_producto, cod_almacen
    ON CONFLICT (cod_producto, cod_almacen) DO UPDATE
       SET stock_total = EXCLUDED.stock_total, stock_reservado = EXCLUDED.stock_reservado, fecha_actualizacion = now();
END;
$$;

CREATE OR REPLACE FUNCTION fn_recalcular_precio_actual_producto(p_cod_producto BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE v_pvp NUMERIC;
BEGIN
    SELECT pvp_unitario INTO v_pvp FROM lote_inventario
    WHERE cod_producto = p_cod_producto AND estado = 'ACTIVO' AND cantidad_disponible > cantidad_reservada
    ORDER BY fecha_recepcion, cod_lote LIMIT 1;
    IF v_pvp IS NOT NULL THEN
        UPDATE producto SET precio_actual = v_pvp, fecha_actualizacion = now() WHERE cod_producto = p_cod_producto;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_lote_inventario(
    p_cod_producto BIGINT, p_cod_almacen BIGINT, p_cantidad_recibida INTEGER, p_costo_unitario NUMERIC,
    p_numero_lote TEXT DEFAULT NULL, p_cod_proveedor BIGINT DEFAULT NULL,
    p_cod_orden_abastecimiento_detalle BIGINT DEFAULT NULL, p_fecha_recepcion TIMESTAMPTZ DEFAULT now(),
    p_fecha_vencimiento TIMESTAMPTZ DEFAULT NULL
) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_precio JSONB; v_cod_lote BIGINT; v_numero TEXT;
BEGIN
    IF p_cantidad_recibida <= 0 OR p_costo_unitario <= 0 THEN RAISE EXCEPTION 'Cantidad y costo del lote deben ser positivos'; END IF;
    PERFORM 1 FROM producto WHERE cod_producto = p_cod_producto; IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
    PERFORM 1 FROM almacen WHERE cod_almacen = p_cod_almacen AND activo IS TRUE; IF NOT FOUND THEN RAISE EXCEPTION 'Almacén no encontrado o inactivo'; END IF;
    v_precio := fn_calcular_pvp_lote(p_cod_producto, p_costo_unitario, p_fecha_recepcion);
    v_numero := COALESCE(NULLIF(trim(p_numero_lote), ''), 'LOT-' || to_char(p_fecha_recepcion, 'YYYYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::TEXT,'-',''),1,10)));
    INSERT INTO lote_inventario(numero_lote,cod_producto,cod_almacen,cod_proveedor,cod_orden_abastecimiento_detalle,
        cantidad_recibida,cantidad_disponible,cantidad_reservada,costo_unitario,margen_porcentaje_aplicado,
        costo_operativo_aplicado,porcentaje_impuesto_aplicado,pvp_unitario,fecha_recepcion,fecha_vencimiento)
    VALUES(v_numero,p_cod_producto,p_cod_almacen,p_cod_proveedor,p_cod_orden_abastecimiento_detalle,p_cantidad_recibida,p_cantidad_recibida,0,p_costo_unitario,
        (v_precio->>'margen_porcentaje')::NUMERIC,(v_precio->>'costo_operativo_porcentaje')::NUMERIC,
        (v_precio->>'porcentaje_impuesto')::NUMERIC,(v_precio->>'pvp_unitario')::NUMERIC,p_fecha_recepcion,p_fecha_vencimiento)
    RETURNING cod_lote INTO v_cod_lote;
    PERFORM fn_recalcular_inventario_desde_lotes(p_cod_producto,p_cod_almacen);
    PERFORM fn_recalcular_precio_actual_producto(p_cod_producto);
    RETURN v_cod_lote;
END;
$$;

CREATE OR REPLACE FUNCTION fn_cotizar_producto_por_lotes(p_cod_usuario BIGINT, p_cod_producto BIGINT, p_cantidad INTEGER)
RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE v_cubierta INTEGER := 0; v_restante INTEGER := p_cantidad; v_subtotal NUMERIC := 0; v_lotes JSONB := '[]'::JSONB; r RECORD; v_tomar INTEGER; v_tiempo INTEGER;
BEGIN
    IF p_cantidad <= 0 THEN RAISE EXCEPTION 'Cantidad inválida'; END IF;
    PERFORM fn_validar_limite_retail(p_cod_usuario,p_cod_producto,p_cantidad);
    FOR r IN SELECT cod_lote,numero_lote,cantidad_disponible,cantidad_reservada,costo_unitario,pvp_unitario,fecha_recepcion
             FROM lote_inventario WHERE cod_producto=p_cod_producto AND estado='ACTIVO' AND cantidad_disponible>cantidad_reservada
             ORDER BY fecha_recepcion,cod_lote LOOP
        EXIT WHEN v_restante <= 0;
        v_tomar := LEAST(v_restante,r.cantidad_disponible-r.cantidad_reservada);
        v_cubierta := v_cubierta + v_tomar; v_restante := v_restante-v_tomar;
        v_subtotal := v_subtotal + v_tomar*r.pvp_unitario;
        v_lotes := v_lotes || jsonb_build_array(jsonb_build_object('cod_lote',r.cod_lote,'numero_lote',r.numero_lote,'cantidad',v_tomar,
          'costo_unitario',r.costo_unitario,'pvp_unitario',r.pvp_unitario,'precio_final_preliminar',r.pvp_unitario));
    END LOOP;
    SELECT MIN(pp.tiempo_entrega_dias) INTO v_tiempo FROM producto_proveedor pp JOIN proveedor p ON p.cod_proveedor=pp.cod_proveedor
      JOIN proveedor_stock ps ON ps.cod_producto_proveedor=pp.cod_producto_proveedor
      WHERE pp.cod_producto=p_cod_producto AND pp.activo AND p.activo AND ps.cantidad_disponible>0;
    RETURN jsonb_build_object('cantidad_solicitada',p_cantidad,'cantidad_cubierta',v_cubierta,'cantidad_faltante',v_restante,'lotes',v_lotes,
      'subtotal_total',ROUND(v_subtotal,2),'precio_promedio_informativo',CASE WHEN v_cubierta=0 THEN NULL ELSE ROUND(v_subtotal/v_cubierta,2) END,
      'requiere_proveedor',v_restante>0,'tiempo_estimado_dias',CASE WHEN v_restante>0 THEN v_tiempo ELSE 0 END);
END;
$$;

CREATE OR REPLACE FUNCTION fn_reservar_stock_por_lotes(
    p_cod_usuario BIGINT, p_cod_producto BIGINT, p_cantidad INTEGER,
    p_cod_pedido BIGINT DEFAULT NULL, p_cod_pedido_detalle BIGINT DEFAULT NULL
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_restante INTEGER:=p_cantidad; v_tomar INTEGER; v_minutos INTEGER:=30; v_detalle BIGINT:=p_cod_pedido_detalle;
BEGIN
    IF p_cantidad<=0 THEN RAISE EXCEPTION 'Cantidad a reservar inválida'; END IF;
    IF v_detalle IS NULL AND p_cod_pedido IS NOT NULL THEN SELECT cod_pedido_detalle INTO v_detalle FROM pedido_detalle WHERE cod_pedido=p_cod_pedido AND cod_producto=p_cod_producto; END IF;
    SELECT CASE WHEN valor ~ '^[0-9]+$' THEN valor::INTEGER ELSE 30 END INTO v_minutos FROM parametro_sistema WHERE clave='CHECKOUT_RESERVA_MINUTOS';
    v_minutos:=COALESCE(v_minutos,30);
    FOR r IN SELECT * FROM lote_inventario WHERE cod_producto=p_cod_producto AND estado='ACTIVO' AND cantidad_disponible>cantidad_reservada
             ORDER BY fecha_recepcion,cod_lote FOR UPDATE LOOP
        EXIT WHEN v_restante=0; v_tomar:=LEAST(v_restante,r.cantidad_disponible-r.cantidad_reservada);
        UPDATE lote_inventario SET cantidad_reservada=cantidad_reservada+v_tomar,fecha_actualizacion=now() WHERE cod_lote=r.cod_lote;
        INSERT INTO reserva_inventario(cod_producto,cod_almacen,cod_usuario,cod_pedido,cod_lote,cod_pedido_detalle,cantidad,estado,estado_reserva,expira_en,fecha_expiracion)
        VALUES(p_cod_producto,r.cod_almacen,p_cod_usuario,p_cod_pedido,r.cod_lote,v_detalle,v_tomar,'ACTIVA','ACTIVA',now()+make_interval(mins=>v_minutos),now()+make_interval(mins=>v_minutos));
        v_restante:=v_restante-v_tomar;
    END LOOP;
    PERFORM fn_recalcular_inventario_desde_lotes(p_cod_producto,NULL);
    IF v_restante>0 THEN PERFORM fn_recalcular_reposicion_producto(p_cod_producto); END IF;
    RETURN v_restante;
END;
$$;

CREATE OR REPLACE FUNCTION fn_liberar_reservas_lote_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT * FROM reserva_inventario WHERE cod_pedido=p_cod_pedido AND estado_reserva='ACTIVA' FOR UPDATE LOOP
        IF r.cod_lote IS NOT NULL THEN
            UPDATE lote_inventario SET cantidad_reservada=GREATEST(cantidad_reservada-r.cantidad,0),fecha_actualizacion=now() WHERE cod_lote=r.cod_lote;
        END IF;
        UPDATE reserva_inventario SET estado='LIBERADA',estado_reserva='LIBERADA' WHERE cod_reserva=r.cod_reserva;
    END LOOP;
    PERFORM fn_recalcular_inventario_desde_lotes(NULL,NULL);
END;
$$;

CREATE OR REPLACE FUNCTION fn_consumir_reservas_lote_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_detalle BIGINT; v_inv RECORD;
BEGIN
    FOR r IN SELECT * FROM reserva_inventario WHERE cod_pedido=p_cod_pedido AND estado_reserva='ACTIVA' FOR UPDATE LOOP
        IF r.cod_lote IS NULL THEN RAISE EXCEPTION 'Reserva % sin lote; no se puede consumir con FIFO',r.cod_reserva; END IF;
        SELECT cod_pedido_detalle INTO v_detalle FROM pedido_detalle WHERE cod_pedido=p_cod_pedido AND cod_producto=r.cod_producto;
        v_detalle:=COALESCE(r.cod_pedido_detalle,v_detalle);
        IF v_detalle IS NULL THEN RAISE EXCEPTION 'No existe detalle de pedido para reserva %',r.cod_reserva; END IF;
        UPDATE lote_inventario SET cantidad_reservada=cantidad_reservada-r.cantidad,cantidad_disponible=cantidad_disponible-r.cantidad,
            estado=CASE WHEN cantidad_disponible-r.cantidad=0 THEN 'AGOTADO' ELSE 'ACTIVO' END,fecha_actualizacion=now()
        WHERE cod_lote=r.cod_lote AND cantidad_reservada>=r.cantidad AND cantidad_disponible>=r.cantidad;
        IF NOT FOUND THEN RAISE EXCEPTION 'Lote % sin saldo reservado suficiente',r.cod_lote; END IF;
        INSERT INTO pedido_detalle_lote(cod_pedido_detalle,cod_lote,cantidad,costo_unitario_historico,pvp_unitario_historico,descuento_unitario,precio_final_unitario)
        SELECT v_detalle,l.cod_lote,r.cantidad,l.costo_unitario,l.pvp_unitario,0,l.pvp_unitario FROM lote_inventario l WHERE l.cod_lote=r.cod_lote
        ON CONFLICT (cod_pedido_detalle,cod_lote) DO UPDATE SET cantidad=pedido_detalle_lote.cantidad+EXCLUDED.cantidad;
        UPDATE reserva_inventario SET estado='CONSUMIDA',estado_reserva='CONSUMIDA',cod_pedido_detalle=v_detalle WHERE cod_reserva=r.cod_reserva;
    END LOOP;
    PERFORM fn_recalcular_inventario_desde_lotes(NULL,NULL);
    FOR v_inv IN SELECT DISTINCT cod_producto FROM pedido_detalle WHERE cod_pedido=p_cod_pedido LOOP
        PERFORM fn_recalcular_precio_actual_producto(v_inv.cod_producto);
        PERFORM fn_recalcular_reposicion_producto(v_inv.cod_producto);
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION fn_stock_proyectado_producto_almacen(p_cod_producto BIGINT, p_cod_almacen BIGINT)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT COALESCE((SELECT SUM(cantidad_disponible-cantidad_reservada) FROM lote_inventario
                     WHERE cod_producto=p_cod_producto AND cod_almacen=p_cod_almacen AND estado='ACTIVO'),0)::INTEGER
         + COALESCE((SELECT SUM(oad.cantidad) FROM orden_abastecimiento_detalle oad
                     JOIN orden_abastecimiento oa ON oa.cod_orden_abastecimiento=oad.cod_orden_abastecimiento
                     WHERE oad.cod_producto=p_cod_producto AND oa.cod_almacen=p_cod_almacen
                       AND oa.estado IN ('GENERADA','ENVIADA','ACEPTADA')),0)::INTEGER;
$$;

CREATE OR REPLACE FUNCTION fn_cantidad_pendiente_abastecimiento(p_cod_producto BIGINT, p_cod_almacen BIGINT DEFAULT NULL)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT COALESCE(SUM(oad.cantidad),0)::INTEGER FROM orden_abastecimiento_detalle oad
    JOIN orden_abastecimiento oa ON oa.cod_orden_abastecimiento=oad.cod_orden_abastecimiento
    WHERE oad.cod_producto=p_cod_producto AND (p_cod_almacen IS NULL OR oa.cod_almacen=p_cod_almacen)
      AND oa.estado IN ('GENERADA','ENVIADA','ACEPTADA');
$$;

CREATE OR REPLACE FUNCTION fn_generar_reposicion_automatica(p_cod_producto BIGINT, p_cod_almacen BIGINT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE v_inv RECORD; v_faltante INTEGER; v_tomar INTEGER; v_orden BIGINT; r RECORD; v_generado INTEGER:=0;
BEGIN
    SELECT * INTO v_inv FROM inventario WHERE cod_producto=p_cod_producto AND cod_almacen=p_cod_almacen FOR UPDATE;
    IF NOT FOUND OR v_inv.stock_maximo IS NULL THEN RETURN 0; END IF;
    IF fn_stock_proyectado_producto_almacen(p_cod_producto,p_cod_almacen)>v_inv.stock_minimo THEN RETURN 0; END IF;
    v_faltante:=GREATEST(v_inv.stock_maximo-fn_stock_proyectado_producto_almacen(p_cod_producto,p_cod_almacen),0);
    FOR r IN SELECT pp.cod_proveedor,pp.costo_unitario,ps.cod_proveedor_stock,ps.cantidad_disponible
             FROM producto_proveedor pp JOIN proveedor pr ON pr.cod_proveedor=pp.cod_proveedor
             JOIN proveedor_stock ps ON ps.cod_producto_proveedor=pp.cod_producto_proveedor
             WHERE pp.cod_producto=p_cod_producto AND pp.activo AND pr.activo AND ps.cantidad_disponible>0
             ORDER BY pp.prioridad,pp.costo_unitario,pp.tiempo_entrega_dias,pr.calificacion DESC FOR UPDATE OF ps LOOP
        EXIT WHEN v_faltante=0; v_tomar:=LEAST(v_faltante,r.cantidad_disponible);
        SELECT oa.cod_orden_abastecimiento INTO v_orden FROM orden_abastecimiento oa
        WHERE oa.cod_almacen=p_cod_almacen AND oa.cod_proveedor=r.cod_proveedor AND oa.estado IN ('GENERADA','ENVIADA','ACEPTADA')
        ORDER BY oa.cod_orden_abastecimiento LIMIT 1 FOR UPDATE;
        IF v_orden IS NULL THEN INSERT INTO orden_abastecimiento(cod_proveedor,cod_almacen,estado,total_estimado) VALUES(r.cod_proveedor,p_cod_almacen,'GENERADA',0) RETURNING cod_orden_abastecimiento INTO v_orden; END IF;
        IF EXISTS(SELECT 1 FROM orden_abastecimiento_detalle WHERE cod_orden_abastecimiento=v_orden AND cod_producto=p_cod_producto) THEN
          UPDATE orden_abastecimiento_detalle SET cantidad=cantidad+v_tomar WHERE cod_orden_abastecimiento=v_orden AND cod_producto=p_cod_producto;
        ELSE INSERT INTO orden_abastecimiento_detalle(cod_orden_abastecimiento,cod_producto,cantidad,costo_unitario) VALUES(v_orden,p_cod_producto,v_tomar,r.costo_unitario); END IF;
        UPDATE proveedor_stock SET cantidad_disponible=cantidad_disponible-v_tomar,fecha_actualizacion=now() WHERE cod_proveedor_stock=r.cod_proveedor_stock;
        UPDATE orden_abastecimiento SET total_estimado=(SELECT COALESCE(SUM(subtotal),0) FROM orden_abastecimiento_detalle WHERE cod_orden_abastecimiento=v_orden),fecha_actualizacion=now() WHERE cod_orden_abastecimiento=v_orden;
        v_faltante:=v_faltante-v_tomar; v_generado:=v_generado+v_tomar;
    END LOOP;
    IF v_faltante>0 THEN INSERT INTO alerta_stock(cod_producto,cod_almacen,tipo_alerta,mensaje) VALUES(p_cod_producto,p_cod_almacen,'SIN_STOCK','Reposición preventiva sin cobertura para '||v_faltante||' unidades'); END IF;
    RETURN v_generado;
END;
$$;

CREATE OR REPLACE FUNCTION fn_recalcular_reposicion_producto(p_cod_producto BIGINT)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_total INTEGER:=0;
BEGIN
    FOR r IN SELECT cod_almacen FROM inventario WHERE cod_producto=p_cod_producto LOOP v_total:=v_total+fn_generar_reposicion_automatica(p_cod_producto,r.cod_almacen); END LOOP;
    RETURN v_total;
END;
$$;

-- Wrappers con firmas históricas de Django.
CREATE OR REPLACE FUNCTION fn_stock_disponible_producto(p_cod_producto BIGINT)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT (
        COALESCE((SELECT SUM(cantidad_disponible-cantidad_reservada) FROM lote_inventario
                  WHERE cod_producto=p_cod_producto AND estado='ACTIVO'),0)
        + COALESCE((SELECT SUM(i.stock_total-i.stock_reservado) FROM inventario i
                    WHERE i.cod_producto=p_cod_producto
                      AND NOT EXISTS (SELECT 1 FROM lote_inventario l
                                      WHERE l.cod_producto=i.cod_producto AND l.cod_almacen=i.cod_almacen)),0)
    )::INTEGER;
$$;

-- Reseñas verificadas: solo una reseña por usuario y producto, creada
-- después de que la compra conste como entregada. Toda reseña nueva queda
-- pendiente hasta que un moderador cambie aprobado a TRUE.
CREATE OR REPLACE FUNCTION fn_crear_resena_producto(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_calificacion SMALLINT,
    p_titulo TEXT DEFAULT NULL,
    p_comentario TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_resena BIGINT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM usuario
        WHERE cod_usuario = p_cod_usuario AND activo
    ) THEN
        RAISE EXCEPTION 'El usuario no existe o está inactivo.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM producto WHERE cod_producto = p_cod_producto
    ) THEN
        RAISE EXCEPTION 'El producto no existe.';
    END IF;

    IF p_calificacion IS NULL OR p_calificacion NOT BETWEEN 1 AND 5 THEN
        RAISE EXCEPTION 'La calificación debe estar entre 1 y 5.';
    END IF;

    IF length(trim(COALESCE(p_titulo, ''))) > 160 THEN
        RAISE EXCEPTION 'El título no puede superar 160 caracteres.';
    END IF;

    IF length(trim(COALESCE(p_comentario, ''))) NOT BETWEEN 10 AND 2000 THEN
        RAISE EXCEPTION 'La reseña debe tener entre 10 y 2000 caracteres.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pedido pe
        JOIN pedido_detalle pd ON pd.cod_pedido = pe.cod_pedido
        WHERE pe.cod_usuario = p_cod_usuario
          AND pd.cod_producto = p_cod_producto
          AND pe.cod_estado_pedido = 'ENTREGADO'
    ) THEN
        RAISE EXCEPTION 'Solo puedes reseñar productos de pedidos entregados.';
    END IF;

    INSERT INTO producto_resena(
        cod_usuario, cod_producto, calificacion, titulo, comentario, aprobado
    )
    VALUES (
        p_cod_usuario,
        p_cod_producto,
        p_calificacion,
        NULLIF(trim(COALESCE(p_titulo, '')), ''),
        trim(p_comentario),
        FALSE
    )
    ON CONFLICT (cod_usuario, cod_producto) DO NOTHING
    RETURNING cod_resena INTO v_cod_resena;

    IF v_cod_resena IS NULL THEN
        RAISE EXCEPTION 'Ya registraste una reseña para este producto.';
    END IF;

    RETURN v_cod_resena;
END;
$$;

-- Redefinicion final: el descuento de cupon vive en las lineas y no se pierde
-- cuando fn_recalcular_total_pedido recalcula el encabezado.
CREATE OR REPLACE FUNCTION fn_aplicar_cupon_pedido(
    p_cod_pedido BIGINT,
    p_codigo_cupon TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_pedido RECORD;
    v_cod_cupon BIGINT;
    v_base NUMERIC;
    v_descuento NUMERIC;
BEGIN
    SELECT * INTO v_pedido FROM pedido WHERE cod_pedido = $1 FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Pedido no encontrado'; END IF;
    IF v_pedido.cod_estado_pedido <> 'PENDIENTE_PAGO' THEN
        RAISE EXCEPTION 'El cupon solo se puede aplicar a un pedido pendiente de pago';
    END IF;

    SELECT c.cod_cupon INTO v_cod_cupon
    FROM cupon c WHERE c.codigo = upper(trim($2));
    IF v_cod_cupon IS NULL THEN RAISE EXCEPTION 'Cupon no encontrado'; END IF;

    UPDATE pedido_detalle
    SET descuento_cupon_unitario = 0,
        precio_final_unitario = GREATEST(precio_base_unitario - descuento_promocion_unitario - descuento_prime_unitario, 0),
        precio_unitario = GREATEST(precio_base_unitario - descuento_promocion_unitario - descuento_prime_unitario, 0)
    WHERE cod_pedido = $1;

    SELECT COALESCE(SUM(cantidad * precio_final_unitario), 0)
    INTO v_base FROM pedido_detalle WHERE cod_pedido = $1;
    v_descuento := fn_calcular_descuento_cupon($2, v_pedido.cod_usuario, v_base);

    IF v_base > 0 AND v_descuento > 0 THEN
        UPDATE pedido_detalle pd
        SET descuento_cupon_unitario = LEAST(
                pd.precio_final_unitario,
                ROUND(v_descuento * pd.precio_final_unitario / v_base, 2)
            ),
            precio_final_unitario = GREATEST(
                pd.precio_final_unitario - LEAST(pd.precio_final_unitario,
                    ROUND(v_descuento * pd.precio_final_unitario / v_base, 2)), 0),
            precio_unitario = GREATEST(
                pd.precio_final_unitario - LEAST(pd.precio_final_unitario,
                    ROUND(v_descuento * pd.precio_final_unitario / v_base, 2)), 0)
        WHERE pd.cod_pedido = $1;
    END IF;

    PERFORM fn_recalcular_total_pedido($1);
    SELECT descuento INTO v_descuento FROM pedido WHERE cod_pedido = $1;

    INSERT INTO cupon_uso(cod_cupon, cod_usuario, cod_pedido, valor_aplicado)
    VALUES(v_cod_cupon, v_pedido.cod_usuario, $1, v_descuento)
    ON CONFLICT (cod_cupon, cod_pedido) DO UPDATE
    SET valor_aplicado = EXCLUDED.valor_aplicado;

    RETURN v_descuento;
END;
$$;

-- Correcciones finales de ejecucion: no usar un alias de tabla como variable PL/pgSQL.
CREATE OR REPLACE FUNCTION fn_calcular_costo_envio(
    p_cod_usuario BIGINT,
    p_cod_metodo_envio BIGINT,
    p_cod_zona_entrega BIGINT,
    p_subtotal NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_metodo RECORD;
    v_recargo NUMERIC := 0;
    v_cod_beneficio BIGINT;
    v_costo NUMERIC;
BEGIN
    SELECT me.* INTO v_metodo
    FROM metodo_envio me
    WHERE me.cod_metodo_envio = $2 AND me.activo IS TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Metodo de envio invalido';
    END IF;

    SELECT COALESCE(ze.recargo, 0) INTO v_recargo
    FROM zona_entrega ze
    WHERE ze.cod_zona = $3 AND ze.activo IS TRUE;

    v_recargo := COALESCE(v_recargo, 0);

    SELECT bm.cod_beneficio INTO v_cod_beneficio
    FROM membresia_usuario mu
    JOIN beneficio_membresia bm ON bm.cod_plan = mu.cod_plan
    WHERE mu.cod_usuario = $1
      AND mu.cod_estado_membresia = 'ACTIVA'
      AND mu.fecha_fin >= current_date
      AND bm.codigo = 'ENVIO_GRATIS'
      AND bm.activo IS TRUE
    LIMIT 1;

    v_costo := CASE
        WHEN v_cod_beneficio IS NOT NULL AND v_metodo.es_premium_gratis THEN 0
        ELSE v_metodo.costo_base + v_recargo
    END;

    RETURN jsonb_build_object(
        'costo_envio', v_costo,
        'costo_base', v_metodo.costo_base,
        'recargo_zona', v_recargo,
        'cod_beneficio', v_cod_beneficio,
        'prime_aplicado', v_cod_beneficio IS NOT NULL AND v_metodo.es_premium_gratis
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_calcular_pvp_lote(
    p_cod_producto BIGINT,
    p_costo_unitario NUMERIC,
    p_fecha_referencia TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_cod_regla_precio BIGINT;
    v_margen_porcentaje NUMERIC := 0;
    v_costo_operativo_porcentaje NUMERIC := 0;
    v_costo_fijo_unitario NUMERIC := 0;
    v_porcentaje_impuesto NUMERIC;
    v_impuesto NUMERIC := 0;
    v_base NUMERIC;
    v_pvp NUMERIC;
BEGIN
    IF p_costo_unitario IS NULL OR p_costo_unitario <= 0 THEN
        RAISE EXCEPTION 'Costo unitario invalido';
    END IF;

    SELECT cod_regla_precio, margen_porcentaje, costo_operativo_porcentaje,
           costo_fijo_unitario, porcentaje_impuesto
    INTO v_cod_regla_precio, v_margen_porcentaje, v_costo_operativo_porcentaje,
         v_costo_fijo_unitario, v_porcentaje_impuesto
    FROM fn_obtener_regla_precio_producto($1, $3);

    SELECT CASE WHEN ps.valor ~ '^[0-9]+([.][0-9]+)?$' THEN ps.valor::NUMERIC ELSE 0 END
    INTO v_impuesto
    FROM parametro_sistema ps
    WHERE ps.clave = 'IVA_PORCENTAJE';

    v_impuesto := COALESCE(v_porcentaje_impuesto, v_impuesto, 0);
    v_base := $2 * (1 + COALESCE(v_margen_porcentaje, 0) / 100
                      + COALESCE(v_costo_operativo_porcentaje, 0) / 100)
              + COALESCE(v_costo_fijo_unitario, 0);
    v_pvp := ROUND(v_base * (1 + v_impuesto / 100), 2);

    RETURN jsonb_build_object(
        'cod_regla_precio', v_cod_regla_precio,
        'margen_porcentaje', COALESCE(v_margen_porcentaje, 0),
        'costo_operativo_porcentaje', COALESCE(v_costo_operativo_porcentaje, 0),
        'costo_fijo_unitario', COALESCE(v_costo_fijo_unitario, 0),
        'porcentaje_impuesto', v_impuesto,
        'precio_sin_impuesto', ROUND(v_base, 2),
        'pvp_unitario', v_pvp
    );
END;
$$;

-- FASE B: contratos existentes, redefinidos al final del archivo.
CREATE OR REPLACE FUNCTION fn_recalcular_total_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE v_sub NUMERIC; v_desc NUMERIC; v_tasa NUMERIC; v_envio NUMERIC;
BEGIN
 SELECT COALESCE(SUM(cantidad*precio_base_unitario),0),COALESCE(SUM(cantidad*(descuento_promocion_unitario+descuento_prime_unitario+descuento_cupon_unitario)),0)
 INTO v_sub,v_desc FROM pedido_detalle WHERE cod_pedido=p_cod_pedido;
 SELECT tasa_impuesto,costo_envio INTO v_tasa,v_envio FROM pedido WHERE cod_pedido=p_cod_pedido FOR UPDATE;
 UPDATE pedido SET subtotal=v_sub,descuento=LEAST(v_desc,v_sub),impuesto=ROUND(GREATEST(v_sub-v_desc,0)*COALESCE(v_tasa,0)/100,2),total=ROUND(GREATEST(v_sub-v_desc,0)+ROUND(GREATEST(v_sub-v_desc,0)*COALESCE(v_tasa,0)/100,2)+COALESCE(v_envio,0),2),fecha_actualizacion=now() WHERE cod_pedido=p_cod_pedido;
END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_estado_pedido(p_cod_pedido BIGINT,p_cod_estado_pedido VARCHAR,p_comentario TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql AS $$ DECLARE v TEXT; BEGIN SELECT cod_estado_pedido INTO v FROM pedido WHERE cod_pedido=p_cod_pedido FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Pedido no encontrado: %',p_cod_pedido; END IF; PERFORM fn_validar_transicion_pedido(v,p_cod_estado_pedido); UPDATE pedido SET cod_estado_pedido=p_cod_estado_pedido,observacion=COALESCE(p_comentario,observacion),fecha_actualizacion=now() WHERE cod_pedido=p_cod_pedido; END; $$;
CREATE OR REPLACE FUNCTION fn_capturar_pago_simulado(p_cod_transaccion BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE t RECORD; c RECORD; v_estado TEXT;
BEGIN
 SELECT tp.*,p.cod_estado_pedido,p.total,p.subtotal,p.descuento,p.impuesto,p.tasa_impuesto,p.costo_envio,p.requiere_abastecimiento INTO t FROM transaccion_pago tp JOIN pedido p ON p.cod_pedido=tp.cod_pedido WHERE tp.cod_transaccion=p_cod_transaccion FOR UPDATE OF tp,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Transacción no encontrada: %',p_cod_transaccion; END IF;
 IF t.cod_estado_pago='CAPTURADO' THEN RETURN; END IF;
 IF t.cod_estado_pedido='CANCELADO' THEN RAISE EXCEPTION 'No se puede capturar un pedido cancelado'; END IF;
 IF t.cod_estado_pago<>'AUTORIZADO' OR t.monto<>t.total THEN RAISE EXCEPTION 'Transacción no autorizada o monto inconsistente'; END IF;
 SELECT * INTO c FROM cuenta_simulada WHERE cod_metodo_pago=t.cod_metodo_pago FOR UPDATE; IF c.saldo_disponible<t.monto THEN RAISE EXCEPTION 'Saldo insuficiente al capturar'; END IF;
 UPDATE cuenta_simulada SET saldo_disponible=saldo_disponible-t.monto,monto_usado_hoy=monto_usado_hoy+t.monto,fecha_uso=current_date WHERE cod_cuenta=c.cod_cuenta;
 UPDATE transaccion_pago SET cod_estado_pago='CAPTURADO',mensaje='Pago capturado correctamente',fecha_actualizacion=now() WHERE cod_transaccion=p_cod_transaccion;
 PERFORM fn_consumir_reservas_pedido(t.cod_pedido); PERFORM fn_actualizar_estado_pedido(t.cod_pedido,CASE WHEN t.requiere_abastecimiento THEN 'ESPERANDO_PROVEEDOR' ELSE 'PREPARANDO' END,'Pago capturado');
 INSERT INTO factura(cod_pedido,numero_factura,subtotal,descuento,impuesto,tasa_impuesto,costo_envio,total) VALUES(t.cod_pedido,fn_generar_numero_factura(),t.subtotal,t.descuento,t.impuesto,t.tasa_impuesto,t.costo_envio,t.total) ON CONFLICT(cod_pedido) DO NOTHING;
END; $$;
CREATE OR REPLACE FUNCTION fn_cancelar_pedido(p_cod_pedido BIGINT,p_motivo TEXT DEFAULT 'Cancelación solicitada')
RETURNS VOID LANGUAGE plpgsql AS $$ DECLARE v TEXT; BEGIN SELECT cod_estado_pedido INTO v FROM pedido WHERE cod_pedido=p_cod_pedido FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Pedido no encontrado'; END IF; IF v IN ('ENTREGADO','DEVUELTO','REEMBOLSADO','CANCELADO') THEN RAISE EXCEPTION 'No se puede cancelar pedido en estado %',v; END IF; PERFORM fn_liberar_reservas_pedido(p_cod_pedido); PERFORM fn_anular_autorizaciones_pedido(p_cod_pedido); PERFORM fn_actualizar_estado_pedido(p_cod_pedido,'CANCELADO',p_motivo); END; $$;
CREATE OR REPLACE FUNCTION fn_reservar_stock(p_cod_usuario BIGINT,p_cod_producto BIGINT,p_cantidad INTEGER,p_cod_pedido BIGINT DEFAULT NULL)
RETURNS INTEGER LANGUAGE plpgsql AS $$ BEGIN RETURN fn_reservar_stock_por_lotes(p_cod_usuario,p_cod_producto,p_cantidad,p_cod_pedido,NULL); END; $$;
CREATE OR REPLACE FUNCTION fn_consumir_reservas_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN PERFORM fn_consumir_reservas_lote_pedido(p_cod_pedido); END; $$;
CREATE OR REPLACE FUNCTION fn_liberar_reservas_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN PERFORM fn_liberar_reservas_lote_pedido(p_cod_pedido); END; $$;
CREATE OR REPLACE FUNCTION fn_expirar_reservas_vencidas()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_total INTEGER:=0;
BEGIN
 FOR r IN SELECT * FROM reserva_inventario WHERE estado_reserva='ACTIVA' AND fecha_expiracion<now() FOR UPDATE LOOP
   IF r.cod_lote IS NOT NULL THEN UPDATE lote_inventario SET cantidad_reservada=GREATEST(cantidad_reservada-r.cantidad,0),fecha_actualizacion=now() WHERE cod_lote=r.cod_lote; END IF;
   UPDATE reserva_inventario SET estado='EXPIRADA',estado_reserva='EXPIRADA' WHERE cod_reserva=r.cod_reserva; v_total:=v_total+1;
 END LOOP; PERFORM fn_recalcular_inventario_desde_lotes(NULL,NULL); RETURN v_total;
END; $$;

CREATE OR REPLACE FUNCTION fn_recibir_orden_abastecimiento(p_cod_orden_abastecimiento BIGINT,p_cod_almacen BIGINT,p_observacion TEXT DEFAULT 'Recepción de orden de abastecimiento')
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_proveedor BIGINT; v_estado TEXT;
BEGIN
 SELECT cod_proveedor,estado INTO v_proveedor,v_estado FROM orden_abastecimiento WHERE cod_orden_abastecimiento=p_cod_orden_abastecimiento FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Orden de abastecimiento no encontrada: %',p_cod_orden_abastecimiento; END IF;
 IF v_estado='RECIBIDA' THEN RETURN; END IF; IF v_estado='CANCELADA' THEN RAISE EXCEPTION 'No se puede recibir una orden cancelada'; END IF;
 FOR r IN SELECT * FROM orden_abastecimiento_detalle WHERE cod_orden_abastecimiento=p_cod_orden_abastecimiento LOOP
   PERFORM fn_crear_lote_inventario(r.cod_producto,p_cod_almacen,r.cantidad,r.costo_unitario,'OC-'||p_cod_orden_abastecimiento||'-DET-'||r.cod_orden_abastecimiento_detalle,v_proveedor,r.cod_orden_abastecimiento_detalle,now(),NULL);
 END LOOP;
 UPDATE orden_abastecimiento SET estado='RECIBIDA',cod_almacen=p_cod_almacen,fecha_actualizacion=now() WHERE cod_orden_abastecimiento=p_cod_orden_abastecimiento;
END; $$;

COMMIT;
-- ============================================================
-- 03_crud_functions.sql
-- CRUD principal y seguro mediante funciones SQL
-- ============================================================

BEGIN;
-- ============================================================
-- USUARIOS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_crear_usuario(
    p_email TEXT,
    p_password_hash TEXT,
    p_nombres TEXT,
    p_apellidos TEXT,
    p_telefono TEXT DEFAULT NULL,
    p_documento_identidad TEXT DEFAULT NULL,
    p_rol_nombre TEXT DEFAULT 'CUSTOMER'
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_usuario BIGINT;
    v_cod_rol BIGINT;
BEGIN
    IF p_email IS NULL OR position('@' in p_email) <= 1 THEN
        RAISE EXCEPTION 'Email inválido';
    END IF;

    INSERT INTO usuario(email, password_hash, nombres, apellidos, telefono, documento_identidad)
    VALUES (
        fn_normalizar_email(p_email),
        p_password_hash,
        trim(p_nombres),
        trim(p_apellidos),
        p_telefono,
        NULLIF(trim(COALESCE(p_documento_identidad,'')), '')
    )
    RETURNING cod_usuario INTO v_cod_usuario;

    INSERT INTO perfil_usuario(cod_usuario)
    VALUES (v_cod_usuario);

    SELECT cod_rol INTO v_cod_rol
    FROM rol
    WHERE nombre = p_rol_nombre AND activo IS TRUE;

    IF v_cod_rol IS NULL THEN
        RAISE EXCEPTION 'Rol no existe o está inactivo: %', p_rol_nombre;
    END IF;

    INSERT INTO usuario_rol(cod_usuario, cod_rol)
    VALUES (v_cod_usuario, v_cod_rol);

    RETURN v_cod_usuario;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_usuario_cliente(
    p_email TEXT,
    p_password TEXT,
    p_nombres TEXT,
    p_apellidos TEXT,
    p_telefono TEXT DEFAULT NULL,
    p_documento_identidad TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_salt TEXT;
    v_hash TEXT;
BEGIN
    IF p_password IS NULL OR length(p_password) < 8 THEN
        RAISE EXCEPTION 'La contraseña debe tener al menos 8 caracteres';
    END IF;

    IF trim(COALESCE(p_nombres,'')) = '' OR trim(COALESCE(p_apellidos,'')) = '' THEN
        RAISE EXCEPTION 'Nombres y apellidos son obligatorios';
    END IF;

    v_salt := substr(translate(encode(gen_random_bytes(18), 'base64'), '+/=', 'abc'), 1, 22);
    v_hash := fn_generar_password_hash_django(p_password, v_salt, 120000);

    RETURN fn_crear_usuario(
        p_email,
        v_hash,
        p_nombres,
        p_apellidos,
        p_telefono,
        p_documento_identidad,
        'CUSTOMER'
    );
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Ya existe una cuenta con ese correo o documento';
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_usuario(
    p_cod_usuario BIGINT,
    p_nombres TEXT DEFAULT NULL,
    p_apellidos TEXT DEFAULT NULL,
    p_telefono TEXT DEFAULT NULL,
    p_email_verificado BOOLEAN DEFAULT NULL,
    p_activo BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE usuario
    SET nombres = COALESCE(p_nombres, nombres),
        apellidos = COALESCE(p_apellidos, apellidos),
        telefono = COALESCE(p_telefono, telefono),
        email_verificado = COALESCE(p_email_verificado, email_verificado),
        activo = COALESCE(p_activo, activo),
        fecha_actualizacion = now()
    WHERE cod_usuario = p_cod_usuario;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_cod_usuario;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_eliminar_usuario_logico(p_cod_usuario BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE usuario
    SET activo = FALSE,
        fecha_actualizacion = now()
    WHERE cod_usuario = p_cod_usuario;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_cod_usuario;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_usuario(p_cod_usuario BIGINT)
RETURNS SETOF usuario
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM usuario
    WHERE cod_usuario = p_cod_usuario;
$$;

CREATE OR REPLACE FUNCTION fn_crear_direccion_usuario(
    p_cod_usuario BIGINT,
    p_alias TEXT,
    p_receptor TEXT,
    p_linea1 TEXT,
    p_linea2 TEXT,
    p_ciudad TEXT,
    p_provincia TEXT,
    p_pais TEXT DEFAULT 'Ecuador',
    p_codigo_postal TEXT DEFAULT NULL,
    p_telefono_contacto TEXT DEFAULT NULL,
    p_es_predeterminada BOOLEAN DEFAULT FALSE
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_direccion BIGINT;
    v_ciudad TEXT := trim(COALESCE(p_ciudad,''));
    v_provincia TEXT := trim(COALESCE(p_provincia,''));
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE cod_usuario = p_cod_usuario AND activo IS TRUE) THEN
        RAISE EXCEPTION 'Usuario no encontrado o inactivo';
    END IF;

    IF trim(COALESCE(p_linea1,'')) = '' THEN
        RAISE EXCEPTION 'La dirección principal es obligatoria';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM canton c
        JOIN provincia p ON p.cod_provincia = c.cod_provincia
        WHERE lower(p.nombre) = lower(v_provincia)
          AND lower(c.nombre) = lower(v_ciudad)
          AND p.activo IS TRUE
          AND c.activo IS TRUE
    ) THEN
        RAISE EXCEPTION 'Provincia/cantón inválidos: %, %', v_provincia, v_ciudad;
    END IF;

    IF p_es_predeterminada THEN
        UPDATE direccion_usuario
        SET es_predeterminada = FALSE
        WHERE cod_usuario = p_cod_usuario
          AND activo IS TRUE;
    END IF;

    INSERT INTO direccion_usuario(
        cod_usuario, alias, receptor, linea1, linea2, ciudad, provincia,
        pais, codigo_postal, telefono_contacto, es_predeterminada
    )
    VALUES (
        p_cod_usuario,
        COALESCE(NULLIF(trim(p_alias), ''), 'Principal'),
        COALESCE(NULLIF(trim(p_receptor), ''), 'Cliente Retail Prime'),
        trim(p_linea1),
        NULLIF(trim(COALESCE(p_linea2,'')), ''),
        v_ciudad,
        v_provincia,
        COALESCE(NULLIF(trim(p_pais), ''), 'Ecuador'),
        NULLIF(trim(COALESCE(p_codigo_postal,'')), ''),
        NULLIF(trim(COALESCE(p_telefono_contacto,'')), ''),
        p_es_predeterminada
    )
    RETURNING cod_direccion INTO v_cod_direccion;

    RETURN v_cod_direccion;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_direccion_usuario(
    p_cod_direccion BIGINT,
    p_alias TEXT DEFAULT NULL,
    p_receptor TEXT DEFAULT NULL,
    p_linea1 TEXT DEFAULT NULL,
    p_linea2 TEXT DEFAULT NULL,
    p_ciudad TEXT DEFAULT NULL,
    p_provincia TEXT DEFAULT NULL,
    p_pais TEXT DEFAULT NULL,
    p_codigo_postal TEXT DEFAULT NULL,
    p_telefono_contacto TEXT DEFAULT NULL,
    p_es_predeterminada BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_usuario BIGINT;
BEGIN
    SELECT cod_usuario INTO v_cod_usuario
    FROM direccion_usuario
    WHERE cod_direccion = p_cod_direccion;

    IF v_cod_usuario IS NULL THEN
        RAISE EXCEPTION 'Dirección no encontrada: %', p_cod_direccion;
    END IF;

    IF p_es_predeterminada IS TRUE THEN
        UPDATE direccion_usuario
        SET es_predeterminada = FALSE
        WHERE cod_usuario = v_cod_usuario AND activo IS TRUE;
    END IF;

    UPDATE direccion_usuario
    SET alias = COALESCE(p_alias, alias),
        receptor = COALESCE(p_receptor, receptor),
        linea1 = COALESCE(p_linea1, linea1),
        linea2 = COALESCE(p_linea2, linea2),
        ciudad = COALESCE(p_ciudad, ciudad),
        provincia = COALESCE(p_provincia, provincia),
        pais = COALESCE(p_pais, pais),
        codigo_postal = COALESCE(p_codigo_postal, codigo_postal),
        telefono_contacto = COALESCE(p_telefono_contacto, telefono_contacto),
        es_predeterminada = COALESCE(p_es_predeterminada, es_predeterminada)
    WHERE cod_direccion = p_cod_direccion;
END;
$$;

CREATE OR REPLACE FUNCTION fn_eliminar_direccion_usuario(p_cod_direccion BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE direccion_usuario
    SET activo = FALSE,
        es_predeterminada = FALSE
    WHERE cod_direccion = p_cod_direccion;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Dirección no encontrada: %', p_cod_direccion;
    END IF;
END;
$$;

-- ============================================================
-- CATEGORÍAS, MARCAS, PRODUCTOS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_crear_categoria(
    p_nombre TEXT,
    p_slug TEXT,
    p_descripcion TEXT DEFAULT NULL,
    p_cod_categoria_padre BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_categoria BIGINT;
BEGIN
    INSERT INTO categoria(nombre, slug, descripcion, cod_categoria_padre)
    VALUES (trim(p_nombre), lower(trim(p_slug)), p_descripcion, p_cod_categoria_padre)
    RETURNING cod_categoria INTO v_cod_categoria;

    RETURN v_cod_categoria;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_categoria(
    p_cod_categoria BIGINT,
    p_nombre TEXT DEFAULT NULL,
    p_slug TEXT DEFAULT NULL,
    p_descripcion TEXT DEFAULT NULL,
    p_activo BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE categoria
    SET nombre = COALESCE(p_nombre, nombre),
        slug = COALESCE(lower(p_slug), slug),
        descripcion = COALESCE(p_descripcion, descripcion),
        activo = COALESCE(p_activo, activo)
    WHERE cod_categoria = p_cod_categoria;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Categoría no encontrada: %', p_cod_categoria;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_eliminar_categoria_logica(p_cod_categoria BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE categoria
    SET activo = FALSE
    WHERE cod_categoria = p_cod_categoria;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Categoría no encontrada: %', p_cod_categoria;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_marca(
    p_nombre TEXT,
    p_descripcion TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_marca BIGINT;
BEGIN
    INSERT INTO marca(nombre, descripcion)
    VALUES (trim(p_nombre), p_descripcion)
    RETURNING cod_marca INTO v_cod_marca;

    RETURN v_cod_marca;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_marca(
    p_cod_marca BIGINT,
    p_nombre TEXT DEFAULT NULL,
    p_descripcion TEXT DEFAULT NULL,
    p_activo BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE marca
    SET nombre = COALESCE(p_nombre, nombre),
        descripcion = COALESCE(p_descripcion, descripcion),
        activo = COALESCE(p_activo, activo)
    WHERE cod_marca = p_cod_marca;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Marca no encontrada: %', p_cod_marca;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_eliminar_marca_logica(p_cod_marca BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE marca
    SET activo = FALSE
    WHERE cod_marca = p_cod_marca;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Marca no encontrada: %', p_cod_marca;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_producto(
    p_cod_categoria BIGINT,
    p_cod_marca BIGINT,
    p_sku TEXT,
    p_nombre TEXT,
    p_descripcion TEXT,
    p_precio_actual NUMERIC,
    p_peso_kg NUMERIC DEFAULT 0,
    p_largo_cm NUMERIC DEFAULT 0,
    p_ancho_cm NUMERIC DEFAULT 0,
    p_alto_cm NUMERIC DEFAULT 0,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_producto BIGINT;
BEGIN
    INSERT INTO producto(
        cod_categoria, cod_marca, sku, nombre, descripcion, precio_actual,
        peso_kg, largo_cm, ancho_cm, alto_cm, metadata
    )
    VALUES (
        p_cod_categoria, p_cod_marca, upper(trim(p_sku)), trim(p_nombre),
        p_descripcion, p_precio_actual, p_peso_kg, p_largo_cm,
        p_ancho_cm, p_alto_cm, COALESCE(p_metadata, '{}'::jsonb)
    )
    RETURNING cod_producto INTO v_cod_producto;

    RETURN v_cod_producto;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_producto(
    p_cod_producto BIGINT,
    p_nombre TEXT DEFAULT NULL,
    p_descripcion TEXT DEFAULT NULL,
    p_precio_actual NUMERIC DEFAULT NULL,
    p_cod_categoria BIGINT DEFAULT NULL,
    p_cod_marca BIGINT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE producto
    SET nombre = COALESCE(p_nombre, nombre),
        descripcion = COALESCE(p_descripcion, descripcion),
        precio_actual = COALESCE(p_precio_actual, precio_actual),
        cod_categoria = COALESCE(p_cod_categoria, cod_categoria),
        cod_marca = COALESCE(p_cod_marca, cod_marca),
        metadata = COALESCE(p_metadata, metadata),
        fecha_actualizacion = now()
    WHERE cod_producto = p_cod_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_agregar_imagen_producto(
    p_cod_producto BIGINT,
    p_url_imagen TEXT,
    p_alt_text TEXT DEFAULT NULL,
    p_es_principal BOOLEAN DEFAULT FALSE,
    p_orden INTEGER DEFAULT 1
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_imagen BIGINT;
BEGIN
    IF p_es_principal THEN
        UPDATE producto_imagen
        SET es_principal = FALSE
        WHERE cod_producto = p_cod_producto;
    END IF;

    INSERT INTO producto_imagen(cod_producto, url_imagen, alt_text, es_principal, orden)
    VALUES (p_cod_producto, p_url_imagen, p_alt_text, p_es_principal, p_orden)
    RETURNING cod_imagen INTO v_cod_imagen;

    RETURN v_cod_imagen;
END;
$$;

CREATE OR REPLACE FUNCTION fn_desactivar_producto(p_cod_producto BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE producto
    SET cod_estado_producto = 'DESACTIVADO',
        fecha_actualizacion = now()
    WHERE cod_producto = p_cod_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto;
    END IF;
END;
$$;

-- ============================================================
-- PROVEEDORES
-- ============================================================

CREATE OR REPLACE FUNCTION fn_crear_proveedor(
    p_ruc TEXT,
    p_razon_social TEXT,
    p_nombre_comercial TEXT,
    p_email TEXT,
    p_telefono TEXT DEFAULT NULL,
    p_direccion TEXT DEFAULT NULL,
    p_ciudad TEXT DEFAULT NULL,
    p_provincia TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_proveedor BIGINT;
BEGIN
    INSERT INTO proveedor(
        ruc, razon_social, nombre_comercial, email, telefono,
        direccion, ciudad, provincia
    )
    VALUES (
        trim(p_ruc), trim(p_razon_social), p_nombre_comercial,
        fn_normalizar_email(p_email), p_telefono, p_direccion, p_ciudad, p_provincia
    )
    RETURNING cod_proveedor INTO v_cod_proveedor;

    RETURN v_cod_proveedor;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_proveedor(
    p_cod_proveedor BIGINT,
    p_razon_social TEXT DEFAULT NULL,
    p_nombre_comercial TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_telefono TEXT DEFAULT NULL,
    p_direccion TEXT DEFAULT NULL,
    p_ciudad TEXT DEFAULT NULL,
    p_provincia TEXT DEFAULT NULL,
    p_calificacion NUMERIC DEFAULT NULL,
    p_activo BOOLEAN DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE proveedor
    SET razon_social = COALESCE(p_razon_social, razon_social),
        nombre_comercial = COALESCE(p_nombre_comercial, nombre_comercial),
        email = COALESCE(fn_normalizar_email(p_email), email),
        telefono = COALESCE(p_telefono, telefono),
        direccion = COALESCE(p_direccion, direccion),
        ciudad = COALESCE(p_ciudad, ciudad),
        provincia = COALESCE(p_provincia, provincia),
        calificacion = COALESCE(p_calificacion, calificacion),
        activo = COALESCE(p_activo, activo),
        fecha_actualizacion = now()
    WHERE cod_proveedor = p_cod_proveedor;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proveedor no encontrado: %', p_cod_proveedor;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_eliminar_proveedor_logico(p_cod_proveedor BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE proveedor
    SET activo = FALSE,
        fecha_actualizacion = now()
    WHERE cod_proveedor = p_cod_proveedor;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Proveedor no encontrado: %', p_cod_proveedor;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_asociar_producto_proveedor(
    p_cod_producto BIGINT,
    p_cod_proveedor BIGINT,
    p_sku_proveedor TEXT,
    p_costo_unitario NUMERIC,
    p_precio_sugerido NUMERIC DEFAULT NULL,
    p_tiempo_entrega_dias INTEGER DEFAULT 3,
    p_prioridad INTEGER DEFAULT 100,
    p_pedido_minimo INTEGER DEFAULT 1,
    p_pedido_maximo INTEGER DEFAULT NULL,
    p_cantidad_disponible INTEGER DEFAULT 0
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_producto_proveedor BIGINT;
BEGIN
    INSERT INTO producto_proveedor(
        cod_producto, cod_proveedor, sku_proveedor, costo_unitario,
        precio_sugerido, tiempo_entrega_dias, prioridad, pedido_minimo, pedido_maximo
    )
    VALUES (
        p_cod_producto, p_cod_proveedor, upper(trim(p_sku_proveedor)),
        p_costo_unitario, p_precio_sugerido, p_tiempo_entrega_dias,
        p_prioridad, p_pedido_minimo, p_pedido_maximo
    )
    ON CONFLICT (cod_producto, cod_proveedor)
    DO UPDATE SET
        sku_proveedor = EXCLUDED.sku_proveedor,
        costo_unitario = EXCLUDED.costo_unitario,
        precio_sugerido = EXCLUDED.precio_sugerido,
        tiempo_entrega_dias = EXCLUDED.tiempo_entrega_dias,
        prioridad = EXCLUDED.prioridad,
        pedido_minimo = EXCLUDED.pedido_minimo,
        pedido_maximo = EXCLUDED.pedido_maximo,
        activo = TRUE,
        fecha_actualizacion = now()
    RETURNING cod_producto_proveedor INTO v_cod_producto_proveedor;

    INSERT INTO proveedor_stock(cod_producto_proveedor, cantidad_disponible)
    VALUES (v_cod_producto_proveedor, p_cantidad_disponible)
    ON CONFLICT (cod_producto_proveedor)
    DO UPDATE SET cantidad_disponible = EXCLUDED.cantidad_disponible,
                  fecha_actualizacion = now();

    RETURN v_cod_producto_proveedor;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_stock_proveedor(
    p_cod_producto_proveedor BIGINT,
    p_cantidad_disponible INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE proveedor_stock
    SET cantidad_disponible = p_cantidad_disponible,
        fecha_actualizacion = now()
    WHERE cod_producto_proveedor = p_cod_producto_proveedor;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto-proveedor no encontrado en stock: %', p_cod_producto_proveedor;
    END IF;
END;
$$;

-- ============================================================
-- INVENTARIO
-- ============================================================

CREATE OR REPLACE FUNCTION fn_crear_almacen(
    p_nombre TEXT,
    p_direccion TEXT,
    p_ciudad TEXT,
    p_provincia TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_almacen BIGINT;
BEGIN
    INSERT INTO almacen(nombre, direccion, ciudad, provincia)
    VALUES (trim(p_nombre), p_direccion, p_ciudad, p_provincia)
    RETURNING cod_almacen INTO v_cod_almacen;

    RETURN v_cod_almacen;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_o_actualizar_inventario(
    p_cod_producto BIGINT,
    p_cod_almacen BIGINT,
    p_stock_total INTEGER,
    p_stock_minimo INTEGER DEFAULT 0,
    p_stock_maximo INTEGER DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_inventario BIGINT;
BEGIN
    INSERT INTO inventario(cod_producto, cod_almacen, stock_total, stock_minimo, stock_maximo)
    VALUES (p_cod_producto, p_cod_almacen, p_stock_total, p_stock_minimo, p_stock_maximo)
    ON CONFLICT (cod_producto, cod_almacen)
    DO UPDATE SET
        stock_total = EXCLUDED.stock_total,
        stock_minimo = EXCLUDED.stock_minimo,
        stock_maximo = EXCLUDED.stock_maximo,
        fecha_actualizacion = now()
    RETURNING cod_inventario INTO v_cod_inventario;

    RETURN v_cod_inventario;
END;
$$;

CREATE OR REPLACE FUNCTION fn_eliminar_inventario_si_sin_stock(
    p_cod_producto BIGINT,
    p_cod_almacen BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM inventario
    WHERE cod_producto = p_cod_producto
      AND cod_almacen = p_cod_almacen
      AND stock_total = 0
      AND stock_reservado = 0;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se puede eliminar inventario con stock o no existe';
    END IF;
END;
$$;

-- ============================================================
-- CARRITO
-- ============================================================

CREATE OR REPLACE FUNCTION fn_obtener_o_crear_carrito_activo(p_cod_usuario BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_carrito BIGINT;
BEGIN
    SELECT cod_carrito INTO v_cod_carrito
    FROM carrito
    WHERE cod_usuario = p_cod_usuario
      AND estado = 'ACTIVO'
    LIMIT 1;

    IF v_cod_carrito IS NULL THEN
        INSERT INTO carrito(cod_usuario)
        VALUES (p_cod_usuario)
        RETURNING cod_carrito INTO v_cod_carrito;
    END IF;

    RETURN v_cod_carrito;
END;
$$;

CREATE OR REPLACE FUNCTION fn_limpiar_carrito(p_cod_carrito BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM carrito_detalle
    WHERE cod_carrito = p_cod_carrito;
END;
$$;

-- ============================================================
-- MÉTODOS DE PAGO, MEMBRESÍA
-- ============================================================

CREATE OR REPLACE FUNCTION fn_desactivar_metodo_pago(p_cod_metodo_pago BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE metodo_pago
    SET activo = FALSE
    WHERE cod_metodo_pago = p_cod_metodo_pago;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Método de pago no encontrado: %', p_cod_metodo_pago;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_plan_membresia(
    p_nombre TEXT,
    p_precio_mensual NUMERIC,
    p_duracion_dias INTEGER DEFAULT 30
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_plan BIGINT;
BEGIN
    INSERT INTO plan_membresia(nombre, precio_mensual, duracion_dias)
    VALUES (trim(p_nombre), p_precio_mensual, p_duracion_dias)
    RETURNING cod_plan INTO v_cod_plan;

    RETURN v_cod_plan;
END;
$$;

CREATE OR REPLACE FUNCTION fn_desactivar_plan_membresia(p_cod_plan BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE plan_membresia
    SET activo = FALSE
    WHERE cod_plan = p_cod_plan;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plan de membresía no encontrado: %', p_cod_plan;
    END IF;
END;
$$;

COMMIT;
-- ============================================================
-- 04_business_functions.sql
-- Funciones de lógica de negocio para Retail Prime
-- ============================================================

BEGIN;
-- ============================================================
-- VALIDACIONES DE PRODUCTO Y RETAIL
-- ============================================================

CREATE OR REPLACE FUNCTION fn_validar_producto_publicable(p_cod_producto BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_producto RECORD;
    v_proveedores INTEGER;
    v_stock_total INTEGER;
    v_tiene_imagen BOOLEAN;
    v_tiene_regla BOOLEAN;
BEGIN
    SELECT *
    INTO v_producto
    FROM producto
    WHERE cod_producto = p_cod_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto;
    END IF;

    IF v_producto.precio_actual <= 0 THEN
        RAISE EXCEPTION 'El producto % no tiene precio válido', p_cod_producto;
    END IF;

    v_proveedores := fn_contar_proveedores_activos_producto(p_cod_producto);
    IF v_proveedores < 5 THEN
        RAISE EXCEPTION 'Producto % no puede publicarse: requiere mínimo 5 proveedores activos, tiene %', p_cod_producto, v_proveedores;
    END IF;

    v_tiene_imagen := fn_producto_tiene_imagen_principal(p_cod_producto);
    IF v_tiene_imagen IS FALSE THEN
        RAISE EXCEPTION 'Producto % no puede publicarse: falta imagen principal', p_cod_producto;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM regla_limite_compra r
        WHERE r.activo IS TRUE
          AND (r.cod_producto = p_cod_producto OR (r.cod_producto IS NULL AND r.cod_categoria = v_producto.cod_categoria))
    )
    INTO v_tiene_regla;

    IF v_tiene_regla IS FALSE THEN
        RAISE EXCEPTION 'Producto % no puede publicarse: falta regla de límite retail', p_cod_producto;
    END IF;

    v_stock_total := fn_stock_disponible_producto(p_cod_producto) + fn_stock_proveedor_disponible_producto(p_cod_producto);
    IF v_stock_total <= 0 THEN
        RAISE EXCEPTION 'Producto % no puede publicarse: sin stock propio ni de proveedores', p_cod_producto;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_publicar_producto(p_cod_producto BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM fn_validar_producto_publicable(p_cod_producto);

    UPDATE producto
    SET cod_estado_producto = 'PUBLICADO',
        fecha_actualizacion = now()
    WHERE cod_producto = p_cod_producto;
END;
$$;

CREATE OR REPLACE FUNCTION fn_pausar_producto(p_cod_producto BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE producto
    SET cod_estado_producto = 'PAUSADO',
        fecha_actualizacion = now()
    WHERE cod_producto = p_cod_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_validar_limite_retail(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_cantidad INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_limite_pedido INTEGER;
    v_limite_dia INTEGER;
    v_limite_mes INTEGER;
    v_requiere_revision BOOLEAN;
    v_comprado_dia INTEGER;
    v_comprado_mes INTEGER;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a cero';
    END IF;

    SELECT l.limite_por_pedido, l.limite_por_dia, l.limite_por_mes, l.requiere_revision
    INTO v_limite_pedido, v_limite_dia, v_limite_mes, v_requiere_revision
    FROM fn_obtener_limite_retail(p_cod_usuario, p_cod_producto) l
    LIMIT 1;

    IF p_cantidad > v_limite_pedido THEN
        RAISE EXCEPTION 'Límite retail superado: cantidad %, máximo por pedido %', p_cantidad, v_limite_pedido;
    END IF;

    IF v_limite_dia IS NOT NULL THEN
        SELECT COALESCE(SUM(pd.cantidad), 0)::INTEGER
        INTO v_comprado_dia
        FROM pedido p
        JOIN pedido_detalle pd ON pd.cod_pedido = p.cod_pedido
        WHERE p.cod_usuario = p_cod_usuario
          AND pd.cod_producto = p_cod_producto
          AND p.cod_estado_pedido NOT IN ('CANCELADO','REEMBOLSADO')
          AND p.fecha_creacion::DATE = CURRENT_DATE;

        IF v_comprado_dia + p_cantidad > v_limite_dia THEN
            RAISE EXCEPTION 'Límite diario superado: comprado hoy %, solicitado %, máximo %', v_comprado_dia, p_cantidad, v_limite_dia;
        END IF;
    END IF;

    IF v_limite_mes IS NOT NULL THEN
        SELECT COALESCE(SUM(pd.cantidad), 0)::INTEGER
        INTO v_comprado_mes
        FROM pedido p
        JOIN pedido_detalle pd ON pd.cod_pedido = p.cod_pedido
        WHERE p.cod_usuario = p_cod_usuario
          AND pd.cod_producto = p_cod_producto
          AND p.cod_estado_pedido NOT IN ('CANCELADO','REEMBOLSADO')
          AND date_trunc('month', p.fecha_creacion) = date_trunc('month', now());

        IF v_comprado_mes + p_cantidad > v_limite_mes THEN
            RAISE EXCEPTION 'Límite mensual superado: comprado mes %, solicitado %, máximo %', v_comprado_mes, p_cantidad, v_limite_mes;
        END IF;
    END IF;
END;
$$;

-- ============================================================
-- CARRITO Y CHECKOUT
-- ============================================================

CREATE OR REPLACE FUNCTION fn_agregar_producto_carrito(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_cantidad INTEGER
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_carrito BIGINT;
    v_precio NUMERIC(12,2);
    v_estado VARCHAR(30);
    v_cod_detalle BIGINT;
BEGIN
    SELECT precio_actual, cod_estado_producto
    INTO v_precio, v_estado
    FROM producto
    WHERE cod_producto = p_cod_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto;
    END IF;

    IF v_estado <> 'PUBLICADO' THEN
        RAISE EXCEPTION 'El producto % no está publicado', p_cod_producto;
    END IF;

    PERFORM fn_validar_limite_retail(p_cod_usuario, p_cod_producto, p_cantidad);

    v_cod_carrito := fn_obtener_o_crear_carrito_activo(p_cod_usuario);

    INSERT INTO carrito_detalle(cod_carrito, cod_producto, cantidad, precio_unitario_snapshot)
    VALUES (v_cod_carrito, p_cod_producto, p_cantidad, v_precio)
    ON CONFLICT (cod_carrito, cod_producto)
    DO UPDATE SET
        cantidad = carrito_detalle.cantidad + EXCLUDED.cantidad,
        precio_unitario_snapshot = EXCLUDED.precio_unitario_snapshot,
        fecha_actualizacion = now()
    RETURNING cod_carrito_detalle INTO v_cod_detalle;

    UPDATE carrito SET fecha_actualizacion = now()
    WHERE cod_carrito = v_cod_carrito;

    RETURN v_cod_detalle;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_cantidad_carrito(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_cantidad INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_carrito BIGINT;
BEGIN
    IF p_cantidad < 0 THEN
        RAISE EXCEPTION 'Cantidad inválida';
    END IF;

    v_cod_carrito := fn_obtener_o_crear_carrito_activo(p_cod_usuario);

    IF p_cantidad = 0 THEN
        DELETE FROM carrito_detalle
        WHERE cod_carrito = v_cod_carrito
          AND cod_producto = p_cod_producto;
    ELSE
        PERFORM fn_validar_limite_retail(p_cod_usuario, p_cod_producto, p_cantidad);

        UPDATE carrito_detalle
        SET cantidad = p_cantidad,
            fecha_actualizacion = now()
        WHERE cod_carrito = v_cod_carrito
          AND cod_producto = p_cod_producto;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto no encontrado en carrito';
        END IF;
    END IF;

    UPDATE carrito SET fecha_actualizacion = now()
    WHERE cod_carrito = v_cod_carrito;
END;
$$;

-- ============================================================
-- INVENTARIO Y PROVEEDORES
-- ============================================================

CREATE OR REPLACE FUNCTION fn_registrar_movimiento_inventario(
    p_cod_producto BIGINT,
    p_cod_almacen BIGINT,
    p_cod_tipo_movimiento VARCHAR,
    p_cantidad INTEGER,
    p_referencia_tipo VARCHAR DEFAULT NULL,
    p_referencia_id BIGINT DEFAULT NULL,
    p_observacion TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_inv RECORD;
BEGIN
    SELECT *
    INTO v_inv
    FROM inventario
    WHERE cod_producto = p_cod_producto
      AND cod_almacen = p_cod_almacen
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Inventario no encontrado para producto % almacén %', p_cod_producto, p_cod_almacen;
    END IF;

    IF p_cod_tipo_movimiento = 'ENTRADA' THEN
        UPDATE inventario
        SET stock_total = stock_total + p_cantidad,
            fecha_actualizacion = now()
        WHERE cod_inventario = v_inv.cod_inventario;
    ELSIF p_cod_tipo_movimiento = 'SALIDA' THEN
        IF (v_inv.stock_total - v_inv.stock_reservado) < p_cantidad THEN
            RAISE EXCEPTION 'Stock disponible insuficiente para salida';
        END IF;
        UPDATE inventario
        SET stock_total = stock_total - p_cantidad,
            fecha_actualizacion = now()
        WHERE cod_inventario = v_inv.cod_inventario;
    ELSIF p_cod_tipo_movimiento = 'RESERVA' THEN
        IF (v_inv.stock_total - v_inv.stock_reservado) < p_cantidad THEN
            RAISE EXCEPTION 'Stock disponible insuficiente para reserva';
        END IF;
        UPDATE inventario
        SET stock_reservado = stock_reservado + p_cantidad,
            fecha_actualizacion = now()
        WHERE cod_inventario = v_inv.cod_inventario;
    ELSIF p_cod_tipo_movimiento = 'LIBERACION' THEN
        IF v_inv.stock_reservado < p_cantidad THEN
            RAISE EXCEPTION 'No hay stock reservado suficiente para liberar';
        END IF;
        UPDATE inventario
        SET stock_reservado = stock_reservado - p_cantidad,
            fecha_actualizacion = now()
        WHERE cod_inventario = v_inv.cod_inventario;
    ELSIF p_cod_tipo_movimiento = 'CONSUMO_RESERVA' THEN
        IF v_inv.stock_reservado < p_cantidad THEN
            RAISE EXCEPTION 'No hay stock reservado suficiente para consumir';
        END IF;
        UPDATE inventario
        SET stock_reservado = stock_reservado - p_cantidad,
            stock_total = stock_total - p_cantidad,
            fecha_actualizacion = now()
        WHERE cod_inventario = v_inv.cod_inventario;
    ELSE
        RAISE EXCEPTION 'Tipo de movimiento no soportado: %', p_cod_tipo_movimiento;
    END IF;

    SELECT *
    INTO v_inv
    FROM inventario
    WHERE cod_producto = p_cod_producto
      AND cod_almacen = p_cod_almacen;

    INSERT INTO movimiento_inventario(
        cod_producto, cod_almacen, cod_tipo_movimiento, cantidad,
        referencia_tipo, referencia_id, stock_total_resultante,
        stock_reservado_resultante, observacion
    )
    VALUES (
        p_cod_producto, p_cod_almacen, p_cod_tipo_movimiento, p_cantidad,
        p_referencia_tipo, p_referencia_id, v_inv.stock_total,
        v_inv.stock_reservado, p_observacion
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_reservar_stock(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_cantidad INTEGER,
    p_cod_pedido BIGINT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_restante INTEGER := p_cantidad;
    v_disponible INTEGER;
    v_a_reservar INTEGER;
    r RECORD;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'Cantidad a reservar inválida';
    END IF;

    FOR r IN
        SELECT *
        FROM inventario
        WHERE cod_producto = p_cod_producto
          AND (stock_total - stock_reservado) > 0
        ORDER BY (stock_total - stock_reservado) DESC, cod_almacen
        FOR UPDATE
    LOOP
        EXIT WHEN v_restante <= 0;

        v_disponible := r.stock_total - r.stock_reservado;
        v_a_reservar := LEAST(v_disponible, v_restante);

        PERFORM fn_registrar_movimiento_inventario(
            p_cod_producto, r.cod_almacen, 'RESERVA', v_a_reservar,
            'PEDIDO', p_cod_pedido, 'Reserva automática por checkout'
        );

        INSERT INTO reserva_inventario(
            cod_producto, cod_almacen, cod_usuario, cod_pedido, cantidad
        )
        VALUES (p_cod_producto, r.cod_almacen, p_cod_usuario, p_cod_pedido, v_a_reservar);

        v_restante := v_restante - v_a_reservar;
    END LOOP;

    RETURN v_restante;
END;
$$;

CREATE OR REPLACE FUNCTION fn_consumir_reservas_pedido(p_cod_pedido BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT *
        FROM reserva_inventario
        WHERE cod_pedido = p_cod_pedido
          AND estado = 'ACTIVA'
        FOR UPDATE
    LOOP
        PERFORM fn_registrar_movimiento_inventario(
            r.cod_producto, r.cod_almacen, 'CONSUMO_RESERVA', r.cantidad,
            'PEDIDO', p_cod_pedido, 'Consumo de reserva por pago capturado'
        );

        UPDATE reserva_inventario
        SET estado = 'CONSUMIDA'
        WHERE cod_reserva = r.cod_reserva;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION fn_liberar_reservas_pedido(p_cod_pedido BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT *
        FROM reserva_inventario
        WHERE cod_pedido = p_cod_pedido
          AND estado = 'ACTIVA'
        FOR UPDATE
    LOOP
        PERFORM fn_registrar_movimiento_inventario(
            r.cod_producto, r.cod_almacen, 'LIBERACION', r.cantidad,
            'PEDIDO', p_cod_pedido, 'Liberación de reserva'
        );

        UPDATE reserva_inventario
        SET estado = 'LIBERADA'
        WHERE cod_reserva = r.cod_reserva;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION fn_consultar_proveedores_para_faltante(
    p_cod_producto BIGINT,
    p_cantidad_faltante INTEGER
)
RETURNS TABLE(
    cod_proveedor BIGINT,
    cod_producto_proveedor BIGINT,
    cantidad_asignada INTEGER,
    costo_unitario NUMERIC(12,2),
    tiempo_entrega_dias INTEGER,
    prioridad INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_restante INTEGER := p_cantidad_faltante;
    r RECORD;
    v_asignar INTEGER;
BEGIN
    IF p_cantidad_faltante <= 0 THEN
        RETURN;
    END IF;

    FOR r IN
        SELECT pp.cod_proveedor, pp.cod_producto_proveedor, pp.costo_unitario,
               pp.tiempo_entrega_dias, pp.prioridad, ps.cantidad_disponible
        FROM producto_proveedor pp
        JOIN proveedor_stock ps ON ps.cod_producto_proveedor = pp.cod_producto_proveedor
        JOIN proveedor pr ON pr.cod_proveedor = pp.cod_proveedor
        WHERE pp.cod_producto = p_cod_producto
          AND pp.activo IS TRUE
          AND pr.activo IS TRUE
          AND ps.cantidad_disponible > 0
        ORDER BY pp.prioridad ASC, pp.tiempo_entrega_dias ASC, pp.costo_unitario ASC
    LOOP
        EXIT WHEN v_restante <= 0;
        v_asignar := LEAST(r.cantidad_disponible, v_restante);
        cod_proveedor := r.cod_proveedor;
        cod_producto_proveedor := r.cod_producto_proveedor;
        cantidad_asignada := v_asignar;
        costo_unitario := r.costo_unitario;
        tiempo_entrega_dias := r.tiempo_entrega_dias;
        prioridad := r.prioridad;
        RETURN NEXT;
        v_restante := v_restante - v_asignar;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_ordenes_abastecimiento(
    p_cod_pedido BIGINT,
    p_cod_producto BIGINT,
    p_cantidad_faltante INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_restante INTEGER := p_cantidad_faltante;
    v_asignar INTEGER;
    v_cod_orden BIGINT;
    v_generado INTEGER := 0;
    r RECORD;
BEGIN
    IF p_cantidad_faltante <= 0 THEN
        RETURN 0;
    END IF;

    FOR r IN
        SELECT pp.cod_producto_proveedor, pp.cod_proveedor, pp.costo_unitario,
               ps.cod_proveedor_stock, ps.cantidad_disponible,
               pp.prioridad, pp.tiempo_entrega_dias
        FROM producto_proveedor pp
        JOIN proveedor_stock ps ON ps.cod_producto_proveedor = pp.cod_producto_proveedor
        JOIN proveedor pr ON pr.cod_proveedor = pp.cod_proveedor
        WHERE pp.cod_producto = p_cod_producto
          AND pp.activo IS TRUE
          AND pr.activo IS TRUE
          AND ps.cantidad_disponible > 0
        ORDER BY pp.prioridad ASC, pp.tiempo_entrega_dias ASC, pp.costo_unitario ASC
        FOR UPDATE OF ps
    LOOP
        EXIT WHEN v_restante <= 0;

        v_asignar := LEAST(r.cantidad_disponible, v_restante);

        SELECT cod_orden_abastecimiento
        INTO v_cod_orden
        FROM orden_abastecimiento
        WHERE cod_pedido = p_cod_pedido
          AND cod_proveedor = r.cod_proveedor
          AND estado = 'GENERADA'
        LIMIT 1;

        IF v_cod_orden IS NULL THEN
            INSERT INTO orden_abastecimiento(cod_proveedor, cod_pedido, estado, total_estimado)
            VALUES (r.cod_proveedor, p_cod_pedido, 'GENERADA', 0)
            RETURNING cod_orden_abastecimiento INTO v_cod_orden;
        END IF;

        INSERT INTO orden_abastecimiento_detalle(
            cod_orden_abastecimiento, cod_producto, cantidad, costo_unitario
        )
        VALUES (v_cod_orden, p_cod_producto, v_asignar, r.costo_unitario);

        UPDATE proveedor_stock
        SET cantidad_disponible = cantidad_disponible - v_asignar,
            fecha_actualizacion = now()
        WHERE cod_proveedor_stock = r.cod_proveedor_stock;

        UPDATE orden_abastecimiento oa
        SET total_estimado = (
                SELECT COALESCE(SUM(subtotal),0)
                FROM orden_abastecimiento_detalle d
                WHERE d.cod_orden_abastecimiento = oa.cod_orden_abastecimiento
            ),
            fecha_actualizacion = now()
        WHERE oa.cod_orden_abastecimiento = v_cod_orden;

        v_restante := v_restante - v_asignar;
        v_generado := v_generado + v_asignar;
    END LOOP;

    IF v_restante > 0 THEN
        RAISE EXCEPTION 'Proveedores insuficientes para producto %, faltan % unidades', p_cod_producto, v_restante;
    END IF;

    RETURN v_generado;
END;
$$;

-- ============================================================
-- PEDIDOS, ENVÍOS Y TRACKING
-- ============================================================

CREATE OR REPLACE FUNCTION fn_generar_tracking_inicial(
    p_cod_pedido BIGINT,
    p_cod_metodo_envio BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_envio BIGINT;
    v_cod_transportista BIGINT;
    v_cod_metodo_envio BIGINT;
    v_dias_max INTEGER;
BEGIN
    SELECT cod_envio INTO v_cod_envio
    FROM envio
    WHERE cod_pedido = p_cod_pedido;

    IF v_cod_envio IS NOT NULL THEN
        RETURN v_cod_envio;
    END IF;

    SELECT cod_transportista INTO v_cod_transportista
    FROM transportista
    WHERE activo IS TRUE
    ORDER BY cod_transportista
    LIMIT 1;

    v_cod_metodo_envio := p_cod_metodo_envio;
    IF v_cod_metodo_envio IS NULL THEN
        SELECT cod_metodo_envio INTO v_cod_metodo_envio
        FROM metodo_envio
        WHERE activo IS TRUE
        ORDER BY costo_base ASC, dias_max ASC
        LIMIT 1;
    END IF;

    SELECT dias_max INTO v_dias_max
    FROM metodo_envio
    WHERE cod_metodo_envio = v_cod_metodo_envio;

    INSERT INTO envio(
        cod_pedido, cod_transportista, cod_metodo_envio, numero_tracking,
        estado, fecha_estimada_entrega
    )
    VALUES (
        p_cod_pedido, v_cod_transportista, v_cod_metodo_envio,
        fn_generar_numero_tracking(), 'CREADO', current_date + COALESCE(v_dias_max, 3)
    )
    RETURNING cod_envio INTO v_cod_envio;

    INSERT INTO tracking_evento(cod_envio, cod_tipo_evento, descripcion, ubicacion)
    VALUES (v_cod_envio, 'ORDER_RECEIVED', 'Pedido recibido por el sistema', 'Centro de operación');

    RETURN v_cod_envio;
END;
$$;

CREATE OR REPLACE FUNCTION fn_actualizar_estado_pedido(
    p_cod_pedido BIGINT,
    p_cod_estado_pedido VARCHAR,
    p_comentario TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE pedido
    SET cod_estado_pedido = p_cod_estado_pedido,
        observacion = COALESCE(p_comentario, observacion),
        fecha_actualizacion = now()
    WHERE cod_pedido = p_cod_pedido;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado: %', p_cod_pedido;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_pedido_desde_carrito(
    p_cod_usuario BIGINT,
    p_cod_direccion_envio BIGINT,
    p_cod_metodo_envio BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_carrito BIGINT;
    v_cod_pedido BIGINT;
    v_es_premium BOOLEAN;
    v_costo_envio NUMERIC(12,2);
    v_descuento NUMERIC(12,2) := 0;
    v_faltante INTEGER;
    v_total_disponible INTEGER;
    v_metodo RECORD;
    r RECORD;
BEGIN
    SELECT cod_carrito INTO v_cod_carrito
    FROM carrito
    WHERE cod_usuario = p_cod_usuario
      AND estado = 'ACTIVO'
    LIMIT 1;

    IF v_cod_carrito IS NULL THEN
        RAISE EXCEPTION 'El usuario no tiene carrito activo';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM carrito_detalle WHERE cod_carrito = v_cod_carrito) THEN
        RAISE EXCEPTION 'El carrito está vacío';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM direccion_usuario
        WHERE cod_direccion = p_cod_direccion_envio
          AND cod_usuario = p_cod_usuario
          AND activo IS TRUE
    ) THEN
        RAISE EXCEPTION 'La dirección no pertenece al usuario o está inactiva';
    END IF;

    v_es_premium := fn_usuario_tiene_membresia_activa(p_cod_usuario);

    IF p_cod_metodo_envio IS NULL THEN
        SELECT * INTO v_metodo
        FROM metodo_envio
        WHERE activo IS TRUE
        ORDER BY costo_base ASC
        LIMIT 1;
    ELSE
        SELECT * INTO v_metodo
        FROM metodo_envio
        WHERE cod_metodo_envio = p_cod_metodo_envio
          AND activo IS TRUE;
    END IF;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Método de envío inválido';
    END IF;

    v_costo_envio := CASE
        WHEN v_es_premium AND v_metodo.es_premium_gratis THEN 0
        ELSE v_metodo.costo_base
    END;

    INSERT INTO pedido(
        numero_pedido, cod_usuario, cod_direccion_envio, cod_estado_pedido,
        costo_envio, es_premium
    )
    VALUES (
        fn_generar_numero_pedido(), p_cod_usuario, p_cod_direccion_envio,
        'PENDIENTE_PAGO', v_costo_envio, v_es_premium
    )
    RETURNING cod_pedido INTO v_cod_pedido;

    FOR r IN
        SELECT cd.cod_producto, cd.cantidad, cd.precio_unitario_snapshot, p.nombre
        FROM carrito_detalle cd
        JOIN producto p ON p.cod_producto = cd.cod_producto
        WHERE cd.cod_carrito = v_cod_carrito
        ORDER BY cd.cod_carrito_detalle
    LOOP
        PERFORM fn_validar_limite_retail(p_cod_usuario, r.cod_producto, r.cantidad);

        v_total_disponible := fn_stock_disponible_producto(r.cod_producto)
                            + fn_stock_proveedor_disponible_producto(r.cod_producto);

        IF v_total_disponible < r.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para %, solicitado %, disponible total %',
                r.nombre, r.cantidad, v_total_disponible;
        END IF;

        INSERT INTO pedido_detalle(cod_pedido, cod_producto, cantidad, precio_unitario, subtotal_linea)
        VALUES (v_cod_pedido, r.cod_producto, r.cantidad, r.precio_unitario_snapshot, r.cantidad * r.precio_unitario_snapshot);

        v_faltante := fn_reservar_stock(p_cod_usuario, r.cod_producto, r.cantidad, v_cod_pedido);

        IF v_faltante > 0 THEN
            PERFORM fn_generar_ordenes_abastecimiento(v_cod_pedido, r.cod_producto, v_faltante);
            UPDATE pedido
            SET requiere_abastecimiento = TRUE
            WHERE cod_pedido = v_cod_pedido;
        END IF;
    END LOOP;

    PERFORM fn_recalcular_total_pedido(v_cod_pedido);
    -- El tracking/envío se genera recién después de capturar el pago.
    -- En este punto el pedido solo queda PENDIENTE_PAGO.

    UPDATE carrito
    SET estado = 'CONVERTIDO',
        fecha_actualizacion = now()
    WHERE cod_carrito = v_cod_carrito;

    INSERT INTO pedido_estado_historial(cod_pedido, cod_estado_pedido, comentario)
    VALUES (v_cod_pedido, 'PENDIENTE_PAGO', 'Pedido creado desde carrito');

    RETURN v_cod_pedido;
END;
$$;

-- ============================================================
-- PAGOS SIMULADOS
-- ============================================================


CREATE OR REPLACE FUNCTION fn_detectar_tipo_tarjeta_simulada(p_numero_tarjeta TEXT)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_num TEXT := regexp_replace(COALESCE(p_numero_tarjeta,''), '\D', '', 'g');
    v_bin6 TEXT := left(v_num, 6);
BEGIN
    -- Simulación razonable: en la vida real se consulta una base BIN/IIN del emisor.
    -- Aquí se determinan casos demo conocidos y algunos rangos habituales.
    IF v_bin6 IN ('400000','421765','422222','510510','520000','530000','601100') THEN
        RETURN 'DEBITO';
    END IF;

    IF v_num ~ '^4' THEN
        RETURN 'CREDITO';
    ELSIF v_num ~ '^(5[1-5]|2(2[2-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720))' THEN
        RETURN 'CREDITO';
    ELSIF v_num ~ '^3[47]' THEN
        RETURN 'CREDITO';
    ELSIF v_num ~ '^(6011|65|64[4-9])' THEN
        RETURN 'CREDITO';
    ELSIF v_num ~ '^3(0[0-5]|[68])' THEN
        RETURN 'CREDITO';
    ELSIF v_num ~ '^35(2[89]|[3-8][0-9])' THEN
        RETURN 'CREDITO';
    END IF;

    RETURN 'CREDITO';
END;
$$;

CREATE OR REPLACE FUNCTION fn_registrar_metodo_pago_simulado(
    p_cod_usuario BIGINT,
    p_numero_tarjeta TEXT,
    p_titular TEXT,
    p_exp_mes SMALLINT,
    p_exp_anio SMALLINT,
    p_cvv TEXT,
    p_saldo_disponible NUMERIC DEFAULT 1000,
    p_limite_diario NUMERIC DEFAULT 1000
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_num TEXT := regexp_replace(COALESCE(p_numero_tarjeta,''), '\D', '', 'g');
    v_marca TEXT;
    v_cod_metodo BIGINT;
    v_cvv_len SMALLINT;
BEGIN
    IF NOT fn_luhn_valid(v_num) THEN
        RAISE EXCEPTION 'Tarjeta inválida: no cumple Luhn o longitud';
    END IF;

    v_marca := fn_detectar_marca_tarjeta(v_num);
    IF v_marca = 'DESCONOCIDA' THEN
        RAISE EXCEPTION 'Marca de tarjeta no reconocida';
    END IF;

    v_cvv_len := fn_cvv_longitud_por_marca(v_marca);
    IF length(regexp_replace(COALESCE(p_cvv,''), '\D', '', 'g')) <> v_cvv_len THEN
        RAISE EXCEPTION 'CVV inválido para marca %, longitud requerida %', v_marca, v_cvv_len;
    END IF;

    IF make_date(p_exp_anio, p_exp_mes, 1) < date_trunc('month', current_date)::date THEN
        RAISE EXCEPTION 'Tarjeta expirada';
    END IF;

    INSERT INTO metodo_pago(
        cod_usuario, tipo, marca, bin6, ultimos4, titular, exp_mes, exp_anio
    )
    VALUES (
        p_cod_usuario, fn_detectar_tipo_tarjeta_simulada(v_num), v_marca, left(v_num, 6), right(v_num, 4),
        p_titular, p_exp_mes, p_exp_anio
    )
    RETURNING cod_metodo_pago INTO v_cod_metodo;

    INSERT INTO cuenta_simulada(cod_metodo_pago, saldo_disponible, limite_diario)
    VALUES (v_cod_metodo, p_saldo_disponible, p_limite_diario);

    RETURN v_cod_metodo;
END;
$$;



-- ============================================================
-- SOBRECARGAS DE COMPATIBILIDAD PARA LLAMADAS DESDE DATOS.SQL / DJANGO
-- PostgreSQL no resuelve automáticamente INTEGER -> SMALLINT en firmas de funciones.
-- Estas versiones aceptan INTEGER y redirigen a la versión principal segura.
-- ============================================================


CREATE OR REPLACE FUNCTION fn_registrar_metodo_pago_simulado(
    p_cod_usuario BIGINT,
    p_numero_tarjeta TEXT,
    p_titular TEXT,
    p_exp_mes INTEGER,
    p_exp_anio INTEGER,
    p_cvv TEXT,
    p_saldo_disponible NUMERIC DEFAULT 1000,
    p_limite_diario NUMERIC DEFAULT 1000
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN fn_registrar_metodo_pago_simulado(
        p_cod_usuario,
        p_numero_tarjeta,
        p_titular,
        p_exp_mes::SMALLINT,
        p_exp_anio::SMALLINT,
        p_cvv,
        p_saldo_disponible::NUMERIC,
        p_limite_diario::NUMERIC
    );
END;
$$;


CREATE OR REPLACE FUNCTION fn_registrar_metodo_pago_simulado(
    p_cod_usuario BIGINT,
    p_numero_tarjeta TEXT,
    p_titular TEXT,
    p_exp_mes INTEGER,
    p_exp_anio INTEGER,
    p_cvv TEXT,
    p_saldo_disponible INTEGER,
    p_limite_diario INTEGER
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN fn_registrar_metodo_pago_simulado(
        p_cod_usuario,
        p_numero_tarjeta,
        p_titular,
        p_exp_mes::SMALLINT,
        p_exp_anio::SMALLINT,
        p_cvv,
        p_saldo_disponible::NUMERIC,
        p_limite_diario::NUMERIC
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_autorizar_pago_simulado(
    p_cod_pedido BIGINT,
    p_cod_metodo_pago BIGINT,
    p_idempotency_key TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_existing BIGINT;
    v_pedido RECORD;
    v_cuenta RECORD;
    v_cod_transaccion BIGINT;
BEGIN
    SELECT cod_transaccion INTO v_existing
    FROM transaccion_pago
    WHERE idempotency_key = p_idempotency_key;

    IF v_existing IS NOT NULL THEN
        RETURN v_existing;
    END IF;

    SELECT *
    INTO v_pedido
    FROM pedido
    WHERE cod_pedido = p_cod_pedido
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado: %', p_cod_pedido;
    END IF;

    IF v_pedido.cod_estado_pedido <> 'PENDIENTE_PAGO' THEN
        RAISE EXCEPTION 'El pedido no está pendiente de pago. Estado actual: %', v_pedido.cod_estado_pedido;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM metodo_pago
        WHERE cod_metodo_pago = p_cod_metodo_pago
          AND cod_usuario = v_pedido.cod_usuario
          AND activo IS TRUE
    ) THEN
        RAISE EXCEPTION 'Método de pago inválido para el usuario';
    END IF;

    SELECT *
    INTO v_cuenta
    FROM cuenta_simulada
    WHERE cod_metodo_pago = p_cod_metodo_pago
    FOR UPDATE;

    IF v_cuenta.cod_cuenta IS NULL THEN
        RAISE EXCEPTION 'Cuenta simulada no encontrada';
    END IF;

    IF v_cuenta.fecha_uso < CURRENT_DATE THEN
        UPDATE cuenta_simulada
        SET monto_usado_hoy = 0,
            fecha_uso = CURRENT_DATE
        WHERE cod_cuenta = v_cuenta.cod_cuenta;

        v_cuenta.monto_usado_hoy := 0;
        v_cuenta.fecha_uso := CURRENT_DATE;
    END IF;

    IF v_cuenta.activa IS FALSE OR v_cuenta.bloqueada IS TRUE THEN
        INSERT INTO transaccion_pago(cod_pedido, cod_metodo_pago, idempotency_key, monto, cod_estado_pago, mensaje)
        VALUES (p_cod_pedido, p_cod_metodo_pago, p_idempotency_key, v_pedido.total, 'RECHAZADO', 'Tarjeta bloqueada o cuenta inactiva')
        RETURNING cod_transaccion INTO v_cod_transaccion;
        RETURN v_cod_transaccion;
    END IF;

    IF v_cuenta.saldo_disponible < v_pedido.total THEN
        INSERT INTO transaccion_pago(cod_pedido, cod_metodo_pago, idempotency_key, monto, cod_estado_pago, mensaje)
        VALUES (p_cod_pedido, p_cod_metodo_pago, p_idempotency_key, v_pedido.total, 'RECHAZADO', 'Saldo insuficiente')
        RETURNING cod_transaccion INTO v_cod_transaccion;
        RETURN v_cod_transaccion;
    END IF;

    IF v_cuenta.monto_usado_hoy + v_pedido.total > v_cuenta.limite_diario THEN
        INSERT INTO transaccion_pago(cod_pedido, cod_metodo_pago, idempotency_key, monto, cod_estado_pago, mensaje)
        VALUES (p_cod_pedido, p_cod_metodo_pago, p_idempotency_key, v_pedido.total, 'RECHAZADO', 'Límite diario superado')
        RETURNING cod_transaccion INTO v_cod_transaccion;
        RETURN v_cod_transaccion;
    END IF;

    INSERT INTO transaccion_pago(cod_pedido, cod_metodo_pago, idempotency_key, monto, cod_estado_pago, mensaje)
    VALUES (p_cod_pedido, p_cod_metodo_pago, p_idempotency_key, v_pedido.total, 'AUTORIZADO', 'Pago autorizado')
    RETURNING cod_transaccion INTO v_cod_transaccion;

    INSERT INTO autorizacion_pago(cod_transaccion, codigo_autorizacion, monto_autorizado)
    VALUES (v_cod_transaccion, fn_generar_codigo_autorizacion(), v_pedido.total);

    PERFORM fn_actualizar_estado_pedido(p_cod_pedido, 'PAGO_AUTORIZADO', 'Pago simulado autorizado');

    RETURN v_cod_transaccion;
END;
$$;

CREATE OR REPLACE FUNCTION fn_capturar_pago_simulado(
    p_cod_transaccion BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_tx RECORD;
    v_cuenta RECORD;
    v_next_estado VARCHAR(40);
BEGIN
    SELECT tp.*, p.requiere_abastecimiento
    INTO v_tx
    FROM transaccion_pago tp
    JOIN pedido p ON p.cod_pedido = tp.cod_pedido
    WHERE tp.cod_transaccion = p_cod_transaccion
    FOR UPDATE OF tp;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Transacción no encontrada: %', p_cod_transaccion;
    END IF;

    IF v_tx.cod_estado_pago <> 'AUTORIZADO' THEN
        RAISE EXCEPTION 'Solo se puede capturar una transacción AUTORIZADA. Estado actual: %', v_tx.cod_estado_pago;
    END IF;

    SELECT *
    INTO v_cuenta
    FROM cuenta_simulada
    WHERE cod_metodo_pago = v_tx.cod_metodo_pago
    FOR UPDATE;

    IF v_cuenta.saldo_disponible < v_tx.monto THEN
        UPDATE transaccion_pago
        SET cod_estado_pago = 'FALLIDO',
            mensaje = 'Saldo insuficiente al capturar',
            fecha_actualizacion = now()
        WHERE cod_transaccion = p_cod_transaccion;
        RAISE EXCEPTION 'Saldo insuficiente al capturar';
    END IF;

    UPDATE cuenta_simulada
    SET saldo_disponible = saldo_disponible - v_tx.monto,
        monto_usado_hoy = monto_usado_hoy + v_tx.monto,
        fecha_uso = CURRENT_DATE
    WHERE cod_cuenta = v_cuenta.cod_cuenta;

    UPDATE transaccion_pago
    SET cod_estado_pago = 'CAPTURADO',
        mensaje = 'Pago capturado correctamente',
        fecha_actualizacion = now()
    WHERE cod_transaccion = p_cod_transaccion;

    PERFORM fn_consumir_reservas_pedido(v_tx.cod_pedido);

    v_next_estado := CASE
        WHEN v_tx.requiere_abastecimiento THEN 'ESPERANDO_PROVEEDOR'
        ELSE 'PREPARANDO'
    END;

    PERFORM fn_actualizar_estado_pedido(v_tx.cod_pedido, v_next_estado, 'Pago capturado. Pedido en proceso.');

    -- Al capturar el pago ya existe o se crea el envío por trigger de cambio de estado.
    -- Registramos un evento visible de pago confirmado dentro del tracking del cliente.
    INSERT INTO tracking_evento(cod_envio, cod_tipo_evento, descripcion, ubicacion, visible_cliente)
    SELECT e.cod_envio, 'PAYMENT_CONFIRMED', 'Pago confirmado por RetailPay Secure', 'Pasarela RetailPay', TRUE
    FROM envio e
    WHERE e.cod_pedido = v_tx.cod_pedido
      AND NOT EXISTS (
          SELECT 1 FROM tracking_evento te
          WHERE te.cod_envio = e.cod_envio AND te.cod_tipo_evento = 'PAYMENT_CONFIRMED'
      );

    INSERT INTO factura(cod_pedido, numero_factura, subtotal, impuesto, total)
    SELECT cod_pedido, fn_generar_numero_factura(), subtotal, ROUND(subtotal * fn_obtener_tasa_impuesto() / 100, 2), total
    FROM pedido
    WHERE cod_pedido = v_tx.cod_pedido
    ON CONFLICT (cod_pedido) DO NOTHING;
END;
$$;

-- ============================================================
-- MEMBRESÍA PREMIUM
-- ============================================================

CREATE OR REPLACE FUNCTION fn_activar_membresia_usuario(
    p_cod_usuario BIGINT,
    p_cod_plan BIGINT,
    p_renovacion_automatica BOOLEAN DEFAULT TRUE
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan RECORD;
    v_cod_membresia BIGINT;
    v_cod_rol_premium BIGINT;
BEGIN
    SELECT *
    INTO v_plan
    FROM plan_membresia
    WHERE cod_plan = p_cod_plan
      AND activo IS TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Plan no existe o está inactivo';
    END IF;

    UPDATE membresia_usuario
    SET cod_estado_membresia = 'CANCELADA'
    WHERE cod_usuario = p_cod_usuario
      AND cod_estado_membresia = 'ACTIVA';

    INSERT INTO membresia_usuario(
        cod_usuario, cod_plan, cod_estado_membresia, fecha_inicio, fecha_fin,
        renovacion_automatica
    )
    VALUES (
        p_cod_usuario, p_cod_plan, 'ACTIVA', current_date,
        current_date + v_plan.duracion_dias, p_renovacion_automatica
    )
    RETURNING cod_membresia INTO v_cod_membresia;

    SELECT cod_rol INTO v_cod_rol_premium
    FROM rol
    WHERE nombre = 'PREMIUM_CUSTOMER';

    IF v_cod_rol_premium IS NOT NULL THEN
        INSERT INTO usuario_rol(cod_usuario, cod_rol)
        VALUES (p_cod_usuario, v_cod_rol_premium)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN v_cod_membresia;
END;
$$;


CREATE OR REPLACE FUNCTION fn_pagar_activar_membresia_simulada(
    p_cod_usuario BIGINT,
    p_cod_plan BIGINT,
    p_cod_metodo_pago BIGINT,
    p_idempotency_key TEXT,
    p_renovacion_automatica BOOLEAN DEFAULT TRUE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan RECORD;
    v_metodo RECORD;
    v_cuenta RECORD;
    v_cod_membresia BIGINT;
    v_cod_rol_premium BIGINT;
BEGIN
    SELECT * INTO v_plan
    FROM plan_membresia
    WHERE cod_plan = p_cod_plan
      AND activo IS TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'estado', 'RECHAZADO', 'mensaje', 'Plan Prime no existe o está inactivo');
    END IF;

    SELECT * INTO v_metodo
    FROM metodo_pago
    WHERE cod_metodo_pago = p_cod_metodo_pago
      AND cod_usuario = p_cod_usuario
      AND activo IS TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'estado', 'RECHAZADO', 'mensaje', 'Método de pago inválido para este usuario');
    END IF;

    SELECT * INTO v_cuenta
    FROM cuenta_simulada
    WHERE cod_metodo_pago = p_cod_metodo_pago
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'estado', 'RECHAZADO', 'mensaje', 'Cuenta simulada no encontrada');
    END IF;

    IF v_cuenta.fecha_uso < CURRENT_DATE THEN
        UPDATE cuenta_simulada
        SET monto_usado_hoy = 0,
            fecha_uso = CURRENT_DATE
        WHERE cod_cuenta = v_cuenta.cod_cuenta;
        v_cuenta.monto_usado_hoy := 0;
        v_cuenta.fecha_uso := CURRENT_DATE;
    END IF;

    IF v_cuenta.activa IS FALSE OR v_cuenta.bloqueada IS TRUE THEN
        RETURN jsonb_build_object('ok', false, 'estado', 'RECHAZADO', 'mensaje', 'Tarjeta bloqueada o cuenta inactiva');
    END IF;

    IF v_cuenta.saldo_disponible < v_plan.precio_mensual THEN
        RETURN jsonb_build_object('ok', false, 'estado', 'RECHAZADO', 'mensaje', 'Saldo insuficiente para pagar Prime', 'monto', v_plan.precio_mensual, 'saldo_disponible', v_cuenta.saldo_disponible);
    END IF;

    IF v_cuenta.monto_usado_hoy + v_plan.precio_mensual > v_cuenta.limite_diario THEN
        RETURN jsonb_build_object('ok', false, 'estado', 'RECHAZADO', 'mensaje', 'Límite diario superado para pagar Prime', 'monto', v_plan.precio_mensual, 'limite_diario', v_cuenta.limite_diario);
    END IF;

    UPDATE cuenta_simulada
    SET saldo_disponible = saldo_disponible - v_plan.precio_mensual,
        monto_usado_hoy = monto_usado_hoy + v_plan.precio_mensual,
        fecha_uso = CURRENT_DATE
    WHERE cod_cuenta = v_cuenta.cod_cuenta;

    UPDATE membresia_usuario
    SET cod_estado_membresia = 'CANCELADA'
    WHERE cod_usuario = p_cod_usuario
      AND cod_estado_membresia = 'ACTIVA';

    INSERT INTO membresia_usuario(
        cod_usuario, cod_plan, cod_estado_membresia, fecha_inicio, fecha_fin,
        renovacion_automatica
    )
    VALUES (
        p_cod_usuario, p_cod_plan, 'ACTIVA', CURRENT_DATE,
        CURRENT_DATE + v_plan.duracion_dias, p_renovacion_automatica
    )
    RETURNING cod_membresia INTO v_cod_membresia;

    INSERT INTO pago_membresia(cod_membresia, cod_transaccion, monto)
    VALUES (v_cod_membresia, NULL, v_plan.precio_mensual);

    SELECT cod_rol INTO v_cod_rol_premium FROM rol WHERE nombre = 'PREMIUM_CUSTOMER';
    IF v_cod_rol_premium IS NOT NULL THEN
        INSERT INTO usuario_rol(cod_usuario, cod_rol, activo)
        VALUES (p_cod_usuario, v_cod_rol_premium, TRUE)
        ON CONFLICT (cod_usuario, cod_rol) DO UPDATE SET activo = TRUE;
    END IF;

    PERFORM fn_crear_notificacion(
        p_cod_usuario,
        'PRIME_ACTIVADO',
        'Membresía Prime activada',
        'Tu membresía Prime fue pagada y activada correctamente.',
        '/perfil/'
    );

    RETURN jsonb_build_object(
        'ok', true,
        'estado', 'CAPTURADO',
        'mensaje', 'Membresía Prime pagada y activada',
        'cod_membresia', v_cod_membresia,
        'monto', v_plan.precio_mensual,
        'fecha_inicio', CURRENT_DATE,
        'fecha_fin', CURRENT_DATE + v_plan.duracion_dias,
        'saldo_restante', v_cuenta.saldo_disponible - v_plan.precio_mensual
    );
END;
$$;

-- ============================================================
-- DEVOLUCIONES Y REEMBOLSOS
-- ============================================================

CREATE OR REPLACE FUNCTION fn_solicitar_devolucion_total(
    p_cod_pedido BIGINT,
    p_motivo TEXT,
    p_descripcion TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_pedido RECORD;
    v_cod_devolucion BIGINT;
    r RECORD;
BEGIN
    SELECT *
    INTO v_pedido
    FROM pedido
    WHERE cod_pedido = p_cod_pedido;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado: %', p_cod_pedido;
    END IF;

    IF v_pedido.cod_estado_pedido <> 'ENTREGADO' THEN
        RAISE EXCEPTION 'Solo se puede devolver un pedido ENTREGADO. Estado actual: %', v_pedido.cod_estado_pedido;
    END IF;

    INSERT INTO devolucion(cod_pedido, cod_usuario, motivo, descripcion, monto_estimado)
    VALUES (p_cod_pedido, v_pedido.cod_usuario, p_motivo, p_descripcion, v_pedido.total)
    RETURNING cod_devolucion INTO v_cod_devolucion;

    FOR r IN
        SELECT * FROM pedido_detalle WHERE cod_pedido = p_cod_pedido
    LOOP
        INSERT INTO devolucion_detalle(
            cod_devolucion, cod_pedido_detalle, cantidad, monto_linea
        )
        VALUES (
            v_cod_devolucion, r.cod_pedido_detalle, r.cantidad, r.subtotal_linea
        );
    END LOOP;

    PERFORM fn_actualizar_estado_pedido(p_cod_pedido, 'DEVOLUCION_SOLICITADA', 'Cliente solicitó devolución total');

    RETURN v_cod_devolucion;
END;
$$;

CREATE OR REPLACE FUNCTION fn_aprobar_devolucion(
    p_cod_devolucion BIGINT,
    p_comentario TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_pedido BIGINT;
BEGIN
    UPDATE devolucion
    SET estado = 'APROBADA',
        fecha_actualizacion = now()
    WHERE cod_devolucion = p_cod_devolucion
    RETURNING cod_pedido INTO v_cod_pedido;

    IF v_cod_pedido IS NULL THEN
        RAISE EXCEPTION 'Devolución no encontrada: %', p_cod_devolucion;
    END IF;

    PERFORM fn_actualizar_estado_pedido(v_cod_pedido, 'DEVUELTO', COALESCE(p_comentario, 'Devolución aprobada'));
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_reembolso_simulado(
    p_cod_devolucion BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_dev RECORD;
    v_tx RECORD;
    v_cod_reembolso BIGINT;
BEGIN
    SELECT *
    INTO v_dev
    FROM devolucion
    WHERE cod_devolucion = p_cod_devolucion
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Devolución no encontrada: %', p_cod_devolucion;
    END IF;

    IF v_dev.estado NOT IN ('APROBADA','RECIBIDA') THEN
        RAISE EXCEPTION 'La devolución debe estar APROBADA o RECIBIDA para reembolso';
    END IF;

    SELECT *
    INTO v_tx
    FROM transaccion_pago
    WHERE cod_pedido = v_dev.cod_pedido
      AND cod_estado_pago = 'CAPTURADO'
    ORDER BY fecha_creacion DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe transacción capturada para reembolsar';
    END IF;

    INSERT INTO reembolso_pago(cod_transaccion, cod_devolucion, monto, estado)
    VALUES (v_tx.cod_transaccion, p_cod_devolucion, v_dev.monto_estimado, 'PROCESADO')
    RETURNING cod_reembolso INTO v_cod_reembolso;

    UPDATE cuenta_simulada
    SET saldo_disponible = saldo_disponible + v_dev.monto_estimado
    WHERE cod_metodo_pago = v_tx.cod_metodo_pago;

    UPDATE devolucion
    SET estado = 'REEMBOLSADA',
        fecha_actualizacion = now()
    WHERE cod_devolucion = p_cod_devolucion;

    UPDATE transaccion_pago
    SET cod_estado_pago = 'REEMBOLSADO',
        fecha_actualizacion = now()
    WHERE cod_transaccion = v_tx.cod_transaccion;

    PERFORM fn_actualizar_estado_pedido(v_dev.cod_pedido, 'REEMBOLSADO', 'Reembolso simulado generado');

    RETURN v_cod_reembolso;
END;
$$;

COMMIT;
-- ============================================================
-- 08_views_reports.sql
-- Vistas de BI, reportes y apoyo operativo
-- ============================================================

BEGIN;
CREATE OR REPLACE VIEW vw_producto_catalogo AS
SELECT
    p.cod_producto,
    p.sku,
    p.nombre AS producto,
    c.nombre AS categoria,
    m.nombre AS marca,
    p.precio_actual,
    p.cod_estado_producto,
    COALESCE(i.stock_propio_disponible,0) AS stock_propio_disponible,
    COALESCE(sp.stock_proveedor_disponible,0) AS stock_proveedor_disponible,
    COALESCE(i.stock_propio_disponible,0) + COALESCE(sp.stock_proveedor_disponible,0) AS stock_total_disponible,
    fn_contar_proveedores_activos_producto(p.cod_producto) AS proveedores_activos,
    img.url_imagen AS imagen_principal
FROM producto p
JOIN categoria c ON c.cod_categoria = p.cod_categoria
JOIN marca m ON m.cod_marca = p.cod_marca
LEFT JOIN LATERAL (
    SELECT SUM(stock_total - stock_reservado)::INTEGER AS stock_propio_disponible
    FROM inventario
    WHERE cod_producto = p.cod_producto
) i ON TRUE
LEFT JOIN LATERAL (
    SELECT SUM(ps.cantidad_disponible)::INTEGER AS stock_proveedor_disponible
    FROM producto_proveedor pp
    JOIN proveedor_stock ps ON ps.cod_producto_proveedor = pp.cod_producto_proveedor
    JOIN proveedor pr ON pr.cod_proveedor = pp.cod_proveedor
    WHERE pp.cod_producto = p.cod_producto
      AND pp.activo IS TRUE
      AND pr.activo IS TRUE
) sp ON TRUE
LEFT JOIN LATERAL (
    SELECT url_imagen
    FROM producto_imagen
    WHERE cod_producto = p.cod_producto AND es_principal IS TRUE
    LIMIT 1
) img ON TRUE;

CREATE OR REPLACE VIEW vw_stock_critico AS
SELECT
    p.cod_producto,
    p.sku,
    p.nombre AS producto,
    a.nombre AS almacen,
    i.stock_total,
    i.stock_reservado,
    (i.stock_total - i.stock_reservado) AS stock_disponible,
    i.stock_minimo,
    CASE
        WHEN (i.stock_total - i.stock_reservado) = 0 THEN 'SIN_STOCK'
        WHEN (i.stock_total - i.stock_reservado) <= i.stock_minimo THEN 'STOCK_BAJO'
        ELSE 'OK'
    END AS estado_stock
FROM inventario i
JOIN producto p ON p.cod_producto = i.cod_producto
JOIN almacen a ON a.cod_almacen = i.cod_almacen
WHERE (i.stock_total - i.stock_reservado) <= i.stock_minimo;

CREATE OR REPLACE VIEW vw_proveedor_cobertura_producto AS
SELECT
    p.cod_producto,
    p.sku,
    p.nombre AS producto,
    COUNT(pp.cod_producto_proveedor) FILTER (WHERE pp.activo IS TRUE AND pr.activo IS TRUE) AS proveedores_activos,
    SUM(ps.cantidad_disponible) FILTER (WHERE pp.activo IS TRUE AND pr.activo IS TRUE) AS stock_total_proveedores,
    MIN(pp.costo_unitario) FILTER (WHERE pp.activo IS TRUE AND pr.activo IS TRUE) AS costo_minimo,
    MIN(pp.tiempo_entrega_dias) FILTER (WHERE pp.activo IS TRUE AND pr.activo IS TRUE) AS menor_tiempo_entrega,
    CASE
        WHEN COUNT(pp.cod_producto_proveedor) FILTER (WHERE pp.activo IS TRUE AND pr.activo IS TRUE) >= 5 THEN 'CUMPLE'
        ELSE 'NO_CUMPLE'
    END AS regla_minimo_5_proveedores
FROM producto p
LEFT JOIN producto_proveedor pp ON pp.cod_producto = p.cod_producto
LEFT JOIN proveedor pr ON pr.cod_proveedor = pp.cod_proveedor
LEFT JOIN proveedor_stock ps ON ps.cod_producto_proveedor = pp.cod_producto_proveedor
GROUP BY p.cod_producto, p.sku, p.nombre;

CREATE OR REPLACE VIEW vw_pedido_resumen AS
SELECT
    p.cod_pedido,
    p.numero_pedido,
    u.email AS cliente_email,
    u.nombres || ' ' || u.apellidos AS cliente,
    p.cod_estado_pedido,
    p.subtotal,
    p.descuento,
    p.costo_envio,
    p.total,
    p.es_premium,
    p.requiere_abastecimiento,
    COUNT(pd.cod_pedido_detalle) AS total_lineas,
    SUM(pd.cantidad) AS total_unidades,
    p.fecha_creacion
FROM pedido p
JOIN usuario u ON u.cod_usuario = p.cod_usuario
LEFT JOIN pedido_detalle pd ON pd.cod_pedido = p.cod_pedido
GROUP BY
    p.cod_pedido, p.numero_pedido, u.email, u.nombres, u.apellidos,
    p.cod_estado_pedido, p.subtotal, p.descuento, p.costo_envio, p.total,
    p.es_premium, p.requiere_abastecimiento, p.fecha_creacion;

CREATE OR REPLACE VIEW vw_ventas_diarias AS
SELECT
    p.fecha_creacion::DATE AS fecha,
    COUNT(*) AS total_pedidos,
    COUNT(DISTINCT p.cod_usuario) AS clientes_unicos,
    SUM(p.total) AS total_ventas,
    ROUND(AVG(p.total),2) AS ticket_promedio,
    SUM(CASE WHEN p.es_premium THEN 1 ELSE 0 END) AS pedidos_premium
FROM pedido p
WHERE p.cod_estado_pedido IN ('PAGO_AUTORIZADO','PREPARANDO','ESPERANDO_PROVEEDOR','LISTO_ENVIO','ENVIADO','EN_TRANSITO','EN_REPARTO','ENTREGADO')
GROUP BY p.fecha_creacion::DATE
ORDER BY fecha DESC;

CREATE OR REPLACE VIEW vw_productos_mas_vendidos AS
SELECT
    pr.cod_producto,
    pr.sku,
    pr.nombre AS producto,
    c.nombre AS categoria,
    SUM(pd.cantidad) AS unidades_vendidas,
    SUM(pd.subtotal_linea) AS ventas_brutas,
    COUNT(DISTINCT pd.cod_pedido) AS pedidos
FROM pedido_detalle pd
JOIN pedido p ON p.cod_pedido = pd.cod_pedido
JOIN producto pr ON pr.cod_producto = pd.cod_producto
JOIN categoria c ON c.cod_categoria = pr.cod_categoria
WHERE p.cod_estado_pedido NOT IN ('CANCELADO','REEMBOLSADO')
GROUP BY pr.cod_producto, pr.sku, pr.nombre, c.nombre
ORDER BY unidades_vendidas DESC, ventas_brutas DESC;

CREATE OR REPLACE VIEW vw_clientes_premium AS
SELECT
    u.cod_usuario,
    u.email,
    u.nombres || ' ' || u.apellidos AS cliente,
    mu.cod_membresia,
    pm.nombre AS plan,
    mu.cod_estado_membresia,
    mu.fecha_inicio,
    mu.fecha_fin,
    mu.renovacion_automatica,
    CASE
        WHEN current_date BETWEEN mu.fecha_inicio AND mu.fecha_fin
             AND mu.cod_estado_membresia = 'ACTIVA'
        THEN TRUE ELSE FALSE
    END AS activa_real
FROM membresia_usuario mu
JOIN usuario u ON u.cod_usuario = mu.cod_usuario
JOIN plan_membresia pm ON pm.cod_plan = mu.cod_plan;

CREATE OR REPLACE VIEW vw_tracking_cliente AS
SELECT
    p.cod_pedido,
    p.numero_pedido,
    e.numero_tracking,
    te.cod_tipo_evento,
    te.nombre AS evento,
    tr.descripcion,
    tr.ubicacion,
    tr.fecha_evento,
    tr.visible_cliente
FROM pedido p
JOIN envio e ON e.cod_pedido = p.cod_pedido
JOIN tracking_evento tr ON tr.cod_envio = e.cod_envio
JOIN tipo_evento_tracking te ON te.cod_tipo_evento = tr.cod_tipo_evento
WHERE tr.visible_cliente IS TRUE
ORDER BY p.cod_pedido, tr.fecha_evento;

CREATE OR REPLACE VIEW vw_dashboard_admin AS
SELECT
    (SELECT COUNT(*) FROM usuario WHERE activo IS TRUE) AS usuarios_activos,
    (SELECT COUNT(*) FROM producto WHERE cod_estado_producto='PUBLICADO') AS productos_publicados,
    (SELECT COUNT(*) FROM proveedor WHERE activo IS TRUE) AS proveedores_activos,
    (SELECT COUNT(*) FROM pedido WHERE fecha_creacion::DATE = CURRENT_DATE) AS pedidos_hoy,
    (SELECT COALESCE(SUM(total),0) FROM pedido WHERE fecha_creacion::DATE = CURRENT_DATE AND cod_estado_pedido NOT IN ('CANCELADO','REEMBOLSADO')) AS ventas_hoy,
    (SELECT COUNT(*) FROM membresia_usuario WHERE cod_estado_membresia='ACTIVA' AND current_date BETWEEN fecha_inicio AND fecha_fin) AS membresias_activas,
    (SELECT COUNT(*) FROM vw_stock_critico) AS productos_stock_critico,
    (SELECT COUNT(*) FROM orden_abastecimiento WHERE estado='GENERADA') AS ordenes_abastecimiento_pendientes;

CREATE OR REPLACE FUNCTION fn_refrescar_resumen_venta_diaria(p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO resumen_venta_diaria(fecha, total_pedidos, total_ventas, total_clientes, ticket_promedio)
    SELECT
        p_fecha,
        COUNT(*)::INTEGER,
        COALESCE(SUM(total),0),
        COUNT(DISTINCT cod_usuario)::INTEGER,
        COALESCE(ROUND(AVG(total),2),0)
    FROM pedido
    WHERE fecha_creacion::DATE = p_fecha
      AND cod_estado_pedido NOT IN ('CANCELADO','REEMBOLSADO')
    ON CONFLICT (fecha)
    DO UPDATE SET
        total_pedidos = EXCLUDED.total_pedidos,
        total_ventas = EXCLUDED.total_ventas,
        total_clientes = EXCLUDED.total_clientes,
        ticket_promedio = EXCLUDED.ticket_promedio;
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_snapshot_kpis()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO snapshot_kpi(nombre_kpi, valor, unidad)
    VALUES
    ('usuarios_activos', (SELECT COUNT(*) FROM usuario WHERE activo IS TRUE), 'cantidad'),
    ('productos_publicados', (SELECT COUNT(*) FROM producto WHERE cod_estado_producto='PUBLICADO'), 'cantidad'),
    ('proveedores_activos', (SELECT COUNT(*) FROM proveedor WHERE activo IS TRUE), 'cantidad'),
    ('ventas_hoy', (SELECT COALESCE(SUM(total),0) FROM pedido WHERE fecha_creacion::DATE=CURRENT_DATE AND cod_estado_pedido NOT IN ('CANCELADO','REEMBOLSADO')), 'USD'),
    ('membresias_activas', (SELECT COUNT(*) FROM membresia_usuario WHERE cod_estado_membresia='ACTIVA' AND current_date BETWEEN fecha_inicio AND fecha_fin), 'cantidad'),
    ('stock_critico', (SELECT COUNT(*) FROM vw_stock_critico), 'cantidad');
END;
$$;

COMMIT;


-- ============================================================
-- 10_funciones_complementarias_retail_prime.sql
-- Ampliación de lógica en PostgreSQL: promociones, cupones,
-- notificaciones, soporte, biblioteca, wishlist, tracking extendido,
-- inventario avanzado, seguridad operativa y automatizaciones.
-- ============================================================

BEGIN;

-- Reemplazo robusto: obtiene la PK real de la tabla auditada, no asume cod_<tabla>.
CREATE OR REPLACE FUNCTION fn_auditar_cambios()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_pk_col TEXT;
    v_pk TEXT;
    v_row JSONB;
BEGIN
    SELECT a.attname
    INTO v_pk_col
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = TG_RELID
      AND i.indisprimary
    ORDER BY a.attnum
    LIMIT 1;

    IF TG_OP = 'DELETE' THEN
        v_row := to_jsonb(OLD);
        v_pk := COALESCE(v_row ->> v_pk_col, v_row::TEXT);
        INSERT INTO auditoria(tabla, operacion, cod_registro, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_pk, to_jsonb(OLD), NULL);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        v_row := to_jsonb(NEW);
        v_pk := COALESCE(v_row ->> v_pk_col, v_row::TEXT);
        INSERT INTO auditoria(tabla, operacion, cod_registro, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_pk, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSE
        v_row := to_jsonb(NEW);
        v_pk := COALESCE(v_row ->> v_pk_col, v_row::TEXT);
        INSERT INTO auditoria(tabla, operacion, cod_registro, datos_anteriores, datos_nuevos)
        VALUES (TG_TABLE_NAME, TG_OP, v_pk, NULL, to_jsonb(NEW));
        RETURN NEW;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_usuario_tiene_permiso(
    p_cod_usuario BIGINT,
    p_codigo_permiso TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM usuario_rol ur
        JOIN rol r ON r.cod_rol = ur.cod_rol AND r.activo IS TRUE
        JOIN rol_permiso rp ON rp.cod_rol = r.cod_rol
        JOIN permiso p ON p.cod_permiso = rp.cod_permiso AND p.activo IS TRUE
        WHERE ur.cod_usuario = p_cod_usuario
          AND p.codigo = p_codigo_permiso
    );
$$;

CREATE OR REPLACE FUNCTION fn_asignar_rol_usuario(
    p_cod_usuario BIGINT,
    p_nombre_rol TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_rol BIGINT;
BEGIN
    SELECT cod_rol INTO v_cod_rol FROM rol WHERE nombre = p_nombre_rol AND activo IS TRUE;
    IF v_cod_rol IS NULL THEN
        RAISE EXCEPTION 'Rol no existe o está inactivo: %', p_nombre_rol;
    END IF;

    INSERT INTO usuario_rol(cod_usuario, cod_rol)
    VALUES (p_cod_usuario, v_cod_rol)
    ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION fn_quitar_rol_usuario(
    p_cod_usuario BIGINT,
    p_nombre_rol TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM usuario_rol ur
    USING rol r
    WHERE r.cod_rol = ur.cod_rol
      AND ur.cod_usuario = p_cod_usuario
      AND r.nombre = p_nombre_rol;
END;
$$;

CREATE OR REPLACE FUNCTION fn_registrar_intento_login(
    p_email TEXT,
    p_ip_origen INET,
    p_user_agent TEXT,
    p_exitoso BOOLEAN,
    p_motivo TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_intento BIGINT;
BEGIN
    INSERT INTO intento_login(email, ip_origen, user_agent, exitoso, motivo)
    VALUES (fn_normalizar_email(p_email), p_ip_origen, p_user_agent, p_exitoso, p_motivo)
    RETURNING cod_intento INTO v_cod_intento;

    UPDATE usuario
    SET ultimo_login = CASE WHEN p_exitoso THEN now() ELSE ultimo_login END
    WHERE email = fn_normalizar_email(p_email);

    RETURN v_cod_intento;
END;
$$;

CREATE OR REPLACE FUNCTION fn_verificar_email_usuario(p_cod_usuario BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE usuario
    SET email_verificado = TRUE,
        fecha_actualizacion = now()
    WHERE cod_usuario = p_cod_usuario;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_cod_usuario;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_cambiar_password_simulado(
    p_cod_usuario BIGINT,
    p_password_hash TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF COALESCE(length(trim(p_password_hash)),0) < 20
       OR p_password_hash !~ '^pbkdf2_sha256\$[0-9]+\$[^$]+\$[^$]+$' THEN
        RAISE EXCEPTION 'El hash de contraseña no tiene formato Django PBKDF2 válido';
    END IF;

    UPDATE usuario
    SET password_hash = p_password_hash,
        fecha_actualizacion = now()
    WHERE cod_usuario = p_cod_usuario
      AND activo IS TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario no encontrado o inactivo: %', p_cod_usuario;
    END IF;
END;
$$;

-- Reemplazo: valida límite con cantidad final del carrito, no solo con la cantidad nueva.
CREATE OR REPLACE FUNCTION fn_agregar_producto_carrito(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_cantidad INTEGER
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_carrito BIGINT;
    v_precio NUMERIC(12,2);
    v_estado VARCHAR(30);
    v_cod_detalle BIGINT;
    v_cantidad_actual INTEGER := 0;
    v_cantidad_final INTEGER;
BEGIN
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a cero';
    END IF;

    SELECT precio_actual, cod_estado_producto
    INTO v_precio, v_estado
    FROM producto
    WHERE cod_producto = p_cod_producto;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto;
    END IF;

    IF v_estado <> 'PUBLICADO' THEN
        RAISE EXCEPTION 'El producto % no está publicado', p_cod_producto;
    END IF;

    v_cod_carrito := fn_obtener_o_crear_carrito_activo(p_cod_usuario);

    SELECT COALESCE(cantidad,0)
    INTO v_cantidad_actual
    FROM carrito_detalle
    WHERE cod_carrito = v_cod_carrito
      AND cod_producto = p_cod_producto;

    v_cantidad_final := COALESCE(v_cantidad_actual,0) + p_cantidad;
    PERFORM fn_validar_limite_retail(p_cod_usuario, p_cod_producto, v_cantidad_final);

    INSERT INTO carrito_detalle(cod_carrito, cod_producto, cantidad, precio_unitario_snapshot)
    VALUES (v_cod_carrito, p_cod_producto, p_cantidad, v_precio)
    ON CONFLICT (cod_carrito, cod_producto)
    DO UPDATE SET
        cantidad = v_cantidad_final,
        precio_unitario_snapshot = EXCLUDED.precio_unitario_snapshot,
        fecha_actualizacion = now()
    RETURNING cod_carrito_detalle INTO v_cod_detalle;

    UPDATE carrito SET fecha_actualizacion = now()
    WHERE cod_carrito = v_cod_carrito;

    RETURN v_cod_detalle;
END;
$$;

CREATE OR REPLACE FUNCTION fn_eliminar_producto_carrito(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_carrito BIGINT;
BEGIN
    SELECT cod_carrito INTO v_cod_carrito
    FROM carrito
    WHERE cod_usuario = p_cod_usuario
      AND estado = 'ACTIVO'
    LIMIT 1;

    IF v_cod_carrito IS NULL THEN
        RETURN;
    END IF;

    DELETE FROM carrito_detalle
    WHERE cod_carrito = v_cod_carrito
      AND cod_producto = p_cod_producto;

    UPDATE carrito SET fecha_actualizacion = now()
    WHERE cod_carrito = v_cod_carrito;
END;
$$;

CREATE OR REPLACE FUNCTION fn_validar_checkout_carrito(p_cod_usuario BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_carrito BIGINT;
    v_total NUMERIC(12,2);
    v_items INTEGER;
    v_errores JSONB := '[]'::jsonb;
    r RECORD;
    v_disponible_total INTEGER;
BEGIN
    SELECT cod_carrito INTO v_cod_carrito
    FROM carrito
    WHERE cod_usuario = p_cod_usuario AND estado = 'ACTIVO'
    LIMIT 1;

    IF v_cod_carrito IS NULL THEN
        RETURN jsonb_build_object('valido', FALSE, 'errores', jsonb_build_array('El usuario no tiene carrito activo'));
    END IF;

    SELECT COUNT(*), fn_total_carrito(v_cod_carrito)
    INTO v_items, v_total
    FROM carrito_detalle
    WHERE cod_carrito = v_cod_carrito;

    IF v_items = 0 THEN
        v_errores := v_errores || jsonb_build_array('El carrito está vacío');
    END IF;

    FOR r IN
        SELECT cd.cod_producto, p.nombre, cd.cantidad
        FROM carrito_detalle cd
        JOIN producto p ON p.cod_producto = cd.cod_producto
        WHERE cd.cod_carrito = v_cod_carrito
    LOOP
        BEGIN
            PERFORM fn_validar_limite_retail(p_cod_usuario, r.cod_producto, r.cantidad);
        EXCEPTION WHEN OTHERS THEN
            v_errores := v_errores || jsonb_build_array(SQLERRM);
        END;

        v_disponible_total := fn_stock_disponible_producto(r.cod_producto) + fn_stock_proveedor_disponible_producto(r.cod_producto);
        IF v_disponible_total < r.cantidad THEN
            v_errores := v_errores || jsonb_build_array('Stock insuficiente para ' || r.nombre || '. Disponible total: ' || v_disponible_total);
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'valido', jsonb_array_length(v_errores) = 0,
        'cod_carrito', v_cod_carrito,
        'items', v_items,
        'total_estimado', v_total,
        'errores', v_errores
    );
END;
$$;

CREATE OR REPLACE FUNCTION fn_cancelar_pedido(
    p_cod_pedido BIGINT,
    p_motivo TEXT DEFAULT 'Cancelación solicitada'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_estado VARCHAR(40);
BEGIN
    SELECT cod_estado_pedido INTO v_estado
    FROM pedido
    WHERE cod_pedido = p_cod_pedido
    FOR UPDATE;

    IF v_estado IS NULL THEN
        RAISE EXCEPTION 'Pedido no encontrado: %', p_cod_pedido;
    END IF;

    IF v_estado IN ('ENTREGADO','DEVUELTO','REEMBOLSADO') THEN
        RAISE EXCEPTION 'No se puede cancelar un pedido en estado %', v_estado;
    END IF;

    PERFORM fn_liberar_reservas_pedido(p_cod_pedido);
    PERFORM fn_actualizar_estado_pedido(p_cod_pedido, 'CANCELADO', p_motivo);
END;
$$;

CREATE OR REPLACE FUNCTION fn_registrar_evento_tracking(
    p_cod_pedido BIGINT,
    p_cod_tipo_evento VARCHAR,
    p_descripcion TEXT,
    p_ubicacion TEXT DEFAULT 'Centro de operación',
    p_visible_cliente BOOLEAN DEFAULT TRUE
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_envio BIGINT;
    v_cod_evento BIGINT;
BEGIN
    SELECT cod_envio INTO v_cod_envio
    FROM envio
    WHERE cod_pedido = p_cod_pedido;

    IF v_cod_envio IS NULL THEN
        v_cod_envio := fn_generar_tracking_inicial(p_cod_pedido, NULL);
    END IF;

    INSERT INTO tracking_evento(cod_envio, cod_tipo_evento, descripcion, ubicacion, visible_cliente)
    VALUES (v_cod_envio, p_cod_tipo_evento, p_descripcion, p_ubicacion, p_visible_cliente)
    RETURNING cod_tracking_evento INTO v_cod_evento;

    RETURN v_cod_evento;
END;
$$;

CREATE OR REPLACE FUNCTION fn_marcar_pedido_entregado(
    p_cod_pedido BIGINT,
    p_comentario TEXT DEFAULT 'Pedido entregado al cliente'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM fn_actualizar_estado_pedido(p_cod_pedido, 'ENTREGADO', p_comentario);
END;
$$;

CREATE OR REPLACE FUNCTION fn_recibir_orden_abastecimiento(
    p_cod_orden_abastecimiento BIGINT,
    p_cod_almacen BIGINT,
    p_observacion TEXT DEFAULT 'Recepción de orden de abastecimiento'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_estado TEXT;
BEGIN
    SELECT estado INTO v_estado
    FROM orden_abastecimiento
    WHERE cod_orden_abastecimiento = p_cod_orden_abastecimiento
    FOR UPDATE;

    IF v_estado IS NULL THEN
        RAISE EXCEPTION 'Orden de abastecimiento no encontrada: %', p_cod_orden_abastecimiento;
    END IF;

    IF v_estado = 'RECIBIDA' THEN
        RETURN;
    END IF;

    IF v_estado = 'CANCELADA' THEN
        RAISE EXCEPTION 'No se puede recibir una orden cancelada';
    END IF;

    FOR r IN
        SELECT cod_producto, cantidad
        FROM orden_abastecimiento_detalle
        WHERE cod_orden_abastecimiento = p_cod_orden_abastecimiento
    LOOP
        INSERT INTO inventario(cod_producto, cod_almacen, stock_total, stock_reservado, stock_minimo)
        VALUES (r.cod_producto, p_cod_almacen, 0, 0, 1)
        ON CONFLICT (cod_producto, cod_almacen) DO NOTHING;

        PERFORM fn_registrar_movimiento_inventario(
            r.cod_producto, p_cod_almacen, 'ENTRADA', r.cantidad,
            'ORDEN_ABASTECIMIENTO', p_cod_orden_abastecimiento, p_observacion
        );
    END LOOP;

    UPDATE orden_abastecimiento
    SET estado = 'RECIBIDA', fecha_actualizacion = now()
    WHERE cod_orden_abastecimiento = p_cod_orden_abastecimiento;
END;
$$;

CREATE OR REPLACE FUNCTION fn_cancelar_orden_abastecimiento(
    p_cod_orden_abastecimiento BIGINT,
    p_motivo TEXT DEFAULT 'Orden cancelada'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_proveedor BIGINT;
    v_estado TEXT;
    r RECORD;
BEGIN
    SELECT cod_proveedor, estado
    INTO v_cod_proveedor, v_estado
    FROM orden_abastecimiento
    WHERE cod_orden_abastecimiento = p_cod_orden_abastecimiento
    FOR UPDATE;

    IF v_cod_proveedor IS NULL THEN
        RAISE EXCEPTION 'Orden de abastecimiento no encontrada: %', p_cod_orden_abastecimiento;
    END IF;

    IF v_estado IN ('RECIBIDA','CANCELADA') THEN
        RAISE EXCEPTION 'No se puede cancelar una orden en estado %', v_estado;
    END IF;

    FOR r IN
        SELECT oad.cod_producto, oad.cantidad, pp.cod_producto_proveedor
        FROM orden_abastecimiento_detalle oad
        JOIN producto_proveedor pp ON pp.cod_producto = oad.cod_producto AND pp.cod_proveedor = v_cod_proveedor
        WHERE oad.cod_orden_abastecimiento = p_cod_orden_abastecimiento
    LOOP
        UPDATE proveedor_stock
        SET cantidad_disponible = cantidad_disponible + r.cantidad,
            fecha_actualizacion = now()
        WHERE cod_producto_proveedor = r.cod_producto_proveedor;
    END LOOP;

    UPDATE orden_abastecimiento
    SET estado = 'CANCELADA', fecha_actualizacion = now()
    WHERE cod_orden_abastecimiento = p_cod_orden_abastecimiento;

    INSERT INTO historial_proveedor(cod_proveedor, evento, descripcion)
    VALUES (v_cod_proveedor, 'ORDEN_CANCELADA', p_motivo);
END;
$$;

CREATE OR REPLACE FUNCTION fn_ajustar_inventario(
    p_cod_producto BIGINT,
    p_cod_almacen BIGINT,
    p_nuevo_stock_total INTEGER,
    p_observacion TEXT DEFAULT 'Ajuste manual controlado'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_inv RECORD;
BEGIN
    IF p_nuevo_stock_total < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo';
    END IF;

    SELECT * INTO v_inv
    FROM inventario
    WHERE cod_producto = p_cod_producto AND cod_almacen = p_cod_almacen
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO inventario(cod_producto, cod_almacen, stock_total, stock_reservado, stock_minimo)
        VALUES (p_cod_producto, p_cod_almacen, p_nuevo_stock_total, 0, 0);
    ELSE
        IF p_nuevo_stock_total < v_inv.stock_reservado THEN
            RAISE EXCEPTION 'El nuevo stock no puede ser menor que el stock reservado actual (%)', v_inv.stock_reservado;
        END IF;

        UPDATE inventario
        SET stock_total = p_nuevo_stock_total,
            fecha_actualizacion = now()
        WHERE cod_inventario = v_inv.cod_inventario;
    END IF;

    INSERT INTO movimiento_inventario(
        cod_producto, cod_almacen, cod_tipo_movimiento, cantidad,
        referencia_tipo, referencia_id, stock_total_resultante,
        stock_reservado_resultante, observacion
    )
    SELECT p_cod_producto, p_cod_almacen, 'AJUSTE', 1, 'AJUSTE_MANUAL', NULL,
           stock_total, stock_reservado, p_observacion
    FROM inventario
    WHERE cod_producto = p_cod_producto AND cod_almacen = p_cod_almacen;
END;
$$;

CREATE OR REPLACE FUNCTION fn_expirar_reservas_vencidas()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_total INTEGER := 0;
BEGIN
    FOR r IN
        SELECT * FROM reserva_inventario
        WHERE estado = 'ACTIVA' AND expira_en < now()
        FOR UPDATE
    LOOP
        PERFORM fn_registrar_movimiento_inventario(
            r.cod_producto, r.cod_almacen, 'LIBERACION', r.cantidad,
            'RESERVA_EXPIRADA', r.cod_reserva, 'Reserva vencida liberada automáticamente'
        );
        UPDATE reserva_inventario SET estado = 'EXPIRADA' WHERE cod_reserva = r.cod_reserva;
        v_total := v_total + 1;
    END LOOP;
    RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_bloquear_metodo_pago_simulado(
    p_cod_metodo_pago BIGINT,
    p_bloqueada BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE cuenta_simulada
    SET bloqueada = p_bloqueada
    WHERE cod_metodo_pago = p_cod_metodo_pago;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cuenta simulada no encontrada para método de pago %', p_cod_metodo_pago;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_ajustar_saldo_cuenta_simulada(
    p_cod_metodo_pago BIGINT,
    p_nuevo_saldo NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_nuevo_saldo < 0 THEN
        RAISE EXCEPTION 'El saldo no puede ser negativo';
    END IF;

    UPDATE cuenta_simulada
    SET saldo_disponible = p_nuevo_saldo
    WHERE cod_metodo_pago = p_cod_metodo_pago;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cuenta simulada no encontrada para método de pago %', p_cod_metodo_pago;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_cupon(
    p_codigo TEXT,
    p_nombre TEXT,
    p_tipo_descuento TEXT,
    p_valor NUMERIC,
    p_monto_minimo NUMERIC DEFAULT 0,
    p_usos_maximos INTEGER DEFAULT NULL,
    p_usos_por_usuario INTEGER DEFAULT 1,
    p_dias_vigencia INTEGER DEFAULT 30,
    p_descripcion TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_cupon BIGINT;
BEGIN
    INSERT INTO cupon(
        codigo, nombre, descripcion, tipo_descuento, valor, monto_minimo,
        usos_maximos, usos_por_usuario, fecha_inicio, fecha_fin, activo
    )
    VALUES (
        upper(trim(p_codigo)), p_nombre, p_descripcion, upper(trim(p_tipo_descuento)), p_valor,
        COALESCE(p_monto_minimo,0), p_usos_maximos, COALESCE(p_usos_por_usuario,1),
        now(), now() + make_interval(days => COALESCE(p_dias_vigencia,30)), TRUE
    )
    ON CONFLICT (codigo)
    DO UPDATE SET
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion,
        tipo_descuento = EXCLUDED.tipo_descuento,
        valor = EXCLUDED.valor,
        monto_minimo = EXCLUDED.monto_minimo,
        usos_maximos = EXCLUDED.usos_maximos,
        usos_por_usuario = EXCLUDED.usos_por_usuario,
        fecha_inicio = EXCLUDED.fecha_inicio,
        fecha_fin = EXCLUDED.fecha_fin,
        activo = TRUE
    RETURNING cod_cupon INTO v_cod_cupon;

    RETURN v_cod_cupon;
END;
$$;

CREATE OR REPLACE FUNCTION fn_calcular_descuento_cupon(
    p_codigo_cupon TEXT,
    p_cod_usuario BIGINT,
    p_subtotal NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_cupon RECORD;
    v_usos_total INTEGER;
    v_usos_usuario INTEGER;
    v_descuento NUMERIC(12,2);
BEGIN
    SELECT * INTO v_cupon
    FROM cupon
    WHERE codigo = upper(trim(p_codigo_cupon))
      AND activo IS TRUE
      AND now() BETWEEN fecha_inicio AND fecha_fin;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cupón inválido o vencido';
    END IF;

    IF p_subtotal < v_cupon.monto_minimo THEN
        RAISE EXCEPTION 'El cupón requiere monto mínimo de %', v_cupon.monto_minimo;
    END IF;

    SELECT COUNT(*) INTO v_usos_total FROM cupon_uso WHERE cod_cupon = v_cupon.cod_cupon;
    IF v_cupon.usos_maximos IS NOT NULL AND v_usos_total >= v_cupon.usos_maximos THEN
        RAISE EXCEPTION 'Cupón agotado';
    END IF;

    SELECT COUNT(*) INTO v_usos_usuario FROM cupon_uso WHERE cod_cupon = v_cupon.cod_cupon AND cod_usuario = p_cod_usuario;
    IF v_usos_usuario >= v_cupon.usos_por_usuario THEN
        RAISE EXCEPTION 'El usuario ya alcanzó el límite de uso del cupón';
    END IF;

    v_descuento := CASE
        WHEN v_cupon.tipo_descuento = 'PORCENTAJE' THEN ROUND(p_subtotal * v_cupon.valor / 100, 2)
        ELSE v_cupon.valor
    END;

    RETURN LEAST(v_descuento, p_subtotal);
END;
$$;

CREATE OR REPLACE FUNCTION fn_aplicar_cupon_pedido(
    p_cod_pedido BIGINT,
    p_codigo_cupon TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_pedido RECORD;
    v_cod_cupon BIGINT;
    v_descuento NUMERIC(12,2);
BEGIN
    SELECT * INTO v_pedido
    FROM pedido
    WHERE cod_pedido = p_cod_pedido
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido no encontrado: %', p_cod_pedido;
    END IF;

    IF v_pedido.cod_estado_pedido <> 'PENDIENTE_PAGO' THEN
        RAISE EXCEPTION 'Solo se puede aplicar cupón a pedidos pendientes de pago';
    END IF;

    SELECT cod_cupon INTO v_cod_cupon
    FROM cupon
    WHERE codigo = upper(trim(p_codigo_cupon));

    v_descuento := fn_calcular_descuento_cupon(p_codigo_cupon, v_pedido.cod_usuario, v_pedido.subtotal);

    UPDATE pedido
    SET descuento = descuento + v_descuento,
        fecha_actualizacion = now()
    WHERE cod_pedido = p_cod_pedido;

    PERFORM fn_recalcular_total_pedido(p_cod_pedido);

    INSERT INTO cupon_uso(cod_cupon, cod_usuario, cod_pedido, valor_aplicado)
    VALUES (v_cod_cupon, v_pedido.cod_usuario, p_cod_pedido, v_descuento)
    ON CONFLICT (cod_cupon, cod_pedido) DO NOTHING;

    RETURN v_descuento;
END;
$$;

-- Version vigente del cupon: persiste el descuento en detalle antes del recálculo.
CREATE OR REPLACE FUNCTION fn_aplicar_cupon_pedido(
    p_cod_pedido BIGINT,
    p_codigo_cupon TEXT
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_pedido RECORD;
    v_cod_cupon BIGINT;
    v_base NUMERIC;
    v_descuento NUMERIC;
BEGIN
    SELECT * INTO v_pedido FROM pedido WHERE cod_pedido = $1 FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Pedido no encontrado'; END IF;
    IF v_pedido.cod_estado_pedido <> 'PENDIENTE_PAGO' THEN
        RAISE EXCEPTION 'El cupon solo se puede aplicar a un pedido pendiente de pago';
    END IF;

    SELECT c.cod_cupon INTO v_cod_cupon
    FROM cupon c WHERE c.codigo = upper(trim($2));
    IF v_cod_cupon IS NULL THEN RAISE EXCEPTION 'Cupon no encontrado'; END IF;

    UPDATE pedido_detalle
    SET descuento_cupon_unitario = 0,
        precio_final_unitario = GREATEST(precio_base_unitario - descuento_promocion_unitario - descuento_prime_unitario, 0),
        precio_unitario = GREATEST(precio_base_unitario - descuento_promocion_unitario - descuento_prime_unitario, 0)
    WHERE cod_pedido = $1;

    SELECT COALESCE(SUM(cantidad * precio_final_unitario), 0)
    INTO v_base FROM pedido_detalle WHERE cod_pedido = $1;
    v_descuento := fn_calcular_descuento_cupon($2, v_pedido.cod_usuario, v_base);

    IF v_base > 0 AND v_descuento > 0 THEN
        UPDATE pedido_detalle pd
        SET descuento_cupon_unitario = LEAST(pd.precio_final_unitario,
                ROUND(v_descuento * pd.precio_final_unitario / v_base, 2)),
            precio_final_unitario = GREATEST(pd.precio_final_unitario - LEAST(pd.precio_final_unitario,
                ROUND(v_descuento * pd.precio_final_unitario / v_base, 2)), 0),
            precio_unitario = GREATEST(pd.precio_final_unitario - LEAST(pd.precio_final_unitario,
                ROUND(v_descuento * pd.precio_final_unitario / v_base, 2)), 0)
        WHERE pd.cod_pedido = $1;
    END IF;

    PERFORM fn_recalcular_total_pedido($1);
    SELECT descuento INTO v_descuento FROM pedido WHERE cod_pedido = $1;

    INSERT INTO cupon_uso(cod_cupon, cod_usuario, cod_pedido, valor_aplicado)
    VALUES(v_cod_cupon, v_pedido.cod_usuario, $1, v_descuento)
    ON CONFLICT (cod_cupon, cod_pedido) DO UPDATE SET valor_aplicado = EXCLUDED.valor_aplicado;
    RETURN v_descuento;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_promocion(
    p_codigo TEXT,
    p_nombre TEXT,
    p_tipo_descuento TEXT,
    p_valor NUMERIC,
    p_fecha_inicio TIMESTAMPTZ,
    p_fecha_fin TIMESTAMPTZ,
    p_descripcion TEXT DEFAULT NULL,
    p_acumulable BOOLEAN DEFAULT FALSE
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_promocion BIGINT;
BEGIN
    INSERT INTO promocion(codigo, nombre, descripcion, tipo_descuento, valor, fecha_inicio, fecha_fin, acumulable, activo)
    VALUES (upper(trim(p_codigo)), p_nombre, p_descripcion, upper(trim(p_tipo_descuento)), p_valor, p_fecha_inicio, p_fecha_fin, p_acumulable, TRUE)
    ON CONFLICT (codigo)
    DO UPDATE SET
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion,
        tipo_descuento = EXCLUDED.tipo_descuento,
        valor = EXCLUDED.valor,
        fecha_inicio = EXCLUDED.fecha_inicio,
        fecha_fin = EXCLUDED.fecha_fin,
        acumulable = EXCLUDED.acumulable,
        activo = TRUE
    RETURNING cod_promocion INTO v_cod_promocion;

    RETURN v_cod_promocion;
END;
$$;

CREATE OR REPLACE FUNCTION fn_asociar_promocion_producto(
    p_cod_promocion BIGINT,
    p_cod_producto BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO promocion_producto(cod_promocion, cod_producto)
    VALUES (p_cod_promocion, p_cod_producto)
    ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION fn_precio_producto_con_promocion(p_cod_producto BIGINT)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_precio NUMERIC(12,2);
    v_descuento NUMERIC(12,2) := 0;
    r RECORD;
BEGIN
    SELECT precio_actual INTO v_precio FROM producto WHERE cod_producto = p_cod_producto;
    IF v_precio IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado: %', p_cod_producto;
    END IF;

    FOR r IN
        SELECT pr.tipo_descuento, pr.valor
        FROM promocion pr
        JOIN promocion_producto pp ON pp.cod_promocion = pr.cod_promocion
        WHERE pp.cod_producto = p_cod_producto
          AND pr.activo IS TRUE
          AND now() BETWEEN pr.fecha_inicio AND pr.fecha_fin
        ORDER BY pr.valor DESC
    LOOP
        v_descuento := GREATEST(v_descuento,
            CASE WHEN r.tipo_descuento = 'PORCENTAJE' THEN ROUND(v_precio * r.valor / 100, 2) ELSE r.valor END
        );
    END LOOP;

    RETURN GREATEST(v_precio - COALESCE(v_descuento,0), 0)::NUMERIC(12,2);
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_notificacion(
    p_cod_usuario BIGINT,
    p_tipo TEXT,
    p_titulo TEXT,
    p_mensaje TEXT,
    p_url_accion TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_notificacion BIGINT;
BEGIN
    INSERT INTO notificacion(cod_usuario, tipo, titulo, mensaje, url_accion)
    VALUES (p_cod_usuario, upper(trim(p_tipo)), p_titulo, p_mensaje, p_url_accion)
    RETURNING cod_notificacion INTO v_cod_notificacion;
    RETURN v_cod_notificacion;
END;
$$;

CREATE OR REPLACE FUNCTION fn_encolar_email(
    p_cod_usuario BIGINT,
    p_destinatario TEXT,
    p_asunto TEXT,
    p_cuerpo TEXT,
    p_fecha_programada TIMESTAMPTZ DEFAULT now()
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_email BIGINT;
BEGIN
    INSERT INTO cola_email(cod_usuario, destinatario, asunto, cuerpo, fecha_programada)
    VALUES (p_cod_usuario, lower(trim(p_destinatario)), p_asunto, p_cuerpo, COALESCE(p_fecha_programada, now()))
    RETURNING cod_email INTO v_cod_email;
    RETURN v_cod_email;
END;
$$;

CREATE OR REPLACE FUNCTION fn_marcar_email_enviado(p_cod_email BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE cola_email
    SET estado = 'ENVIADO', fecha_envio = now(), error_ultimo = NULL
    WHERE cod_email = p_cod_email;
END;
$$;

CREATE OR REPLACE FUNCTION fn_marcar_email_fallido(
    p_cod_email BIGINT,
    p_error TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE cola_email
    SET estado = 'FALLIDO', intentos = intentos + 1, error_ultimo = p_error
    WHERE cod_email = p_cod_email;
END;
$$;

CREATE OR REPLACE FUNCTION fn_marcar_notificacion_leida(p_cod_notificacion BIGINT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE notificacion
    SET leida = TRUE, fecha_lectura = now()
    WHERE cod_notificacion = p_cod_notificacion;
END;
$$;

CREATE OR REPLACE FUNCTION fn_obtener_o_crear_wishlist_default(p_cod_usuario BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_wishlist BIGINT;
BEGIN
    SELECT cod_wishlist INTO v_cod_wishlist
    FROM wishlist
    WHERE cod_usuario = p_cod_usuario
      AND es_predeterminada IS TRUE
      AND activo IS TRUE
    LIMIT 1;

    IF v_cod_wishlist IS NOT NULL THEN
        RETURN v_cod_wishlist;
    END IF;

    -- Evita conflicto con el índice único parcial de lista predeterminada.
    UPDATE wishlist
    SET es_predeterminada = FALSE
    WHERE cod_usuario = p_cod_usuario
      AND activo IS TRUE;

    INSERT INTO wishlist(cod_usuario, nombre, es_predeterminada)
    VALUES (p_cod_usuario, 'Mi lista', TRUE)
    ON CONFLICT (cod_usuario, nombre)
    DO UPDATE SET es_predeterminada = TRUE, activo = TRUE
    RETURNING cod_wishlist INTO v_cod_wishlist;

    RETURN v_cod_wishlist;
END;
$$;

CREATE OR REPLACE FUNCTION fn_agregar_a_wishlist(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_cod_wishlist BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_wishlist BIGINT;
BEGIN
    v_cod_wishlist := COALESCE(p_cod_wishlist, fn_obtener_o_crear_wishlist_default(p_cod_usuario));

    INSERT INTO wishlist_detalle(cod_wishlist, cod_producto)
    VALUES (v_cod_wishlist, p_cod_producto)
    ON CONFLICT DO NOTHING;

    INSERT INTO producto_favorito(cod_usuario, cod_producto)
    VALUES (p_cod_usuario, p_cod_producto)
    ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION fn_quitar_de_wishlist(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_cod_wishlist BIGINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_wishlist BIGINT;
BEGIN
    v_cod_wishlist := COALESCE(p_cod_wishlist, fn_obtener_o_crear_wishlist_default(p_cod_usuario));

    DELETE FROM wishlist_detalle
    WHERE cod_wishlist = v_cod_wishlist
      AND cod_producto = p_cod_producto;

    DELETE FROM producto_favorito
    WHERE cod_usuario = p_cod_usuario
      AND cod_producto = p_cod_producto;
END;
$$;

CREATE OR REPLACE FUNCTION fn_registrar_pregunta_producto(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT,
    p_pregunta TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_pregunta BIGINT;
BEGIN
    INSERT INTO producto_pregunta(cod_usuario, cod_producto, pregunta)
    VALUES (p_cod_usuario, p_cod_producto, trim(p_pregunta))
    RETURNING cod_pregunta INTO v_cod_pregunta;
    RETURN v_cod_pregunta;
END;
$$;

CREATE OR REPLACE FUNCTION fn_responder_pregunta_producto(
    p_cod_pregunta BIGINT,
    p_cod_usuario BIGINT,
    p_respuesta TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_respuesta BIGINT;
BEGIN
    INSERT INTO producto_respuesta(cod_pregunta, cod_usuario, respuesta)
    VALUES (p_cod_pregunta, p_cod_usuario, trim(p_respuesta))
    ON CONFLICT (cod_pregunta)
    DO UPDATE SET respuesta = EXCLUDED.respuesta, cod_usuario = EXCLUDED.cod_usuario, fecha_creacion = now()
    RETURNING cod_respuesta INTO v_cod_respuesta;

    UPDATE producto_pregunta
    SET estado = 'RESPONDIDA'
    WHERE cod_pregunta = p_cod_pregunta;

    RETURN v_cod_respuesta;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_ticket_soporte(
    p_cod_usuario BIGINT,
    p_asunto TEXT,
    p_categoria TEXT,
    p_prioridad TEXT,
    p_mensaje TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_ticket BIGINT;
BEGIN
    INSERT INTO soporte_ticket(cod_usuario, asunto, categoria, prioridad)
    VALUES (p_cod_usuario, p_asunto, upper(trim(p_categoria)), upper(trim(p_prioridad)))
    RETURNING cod_ticket INTO v_cod_ticket;

    INSERT INTO soporte_ticket_mensaje(cod_ticket, cod_usuario, mensaje, interno)
    VALUES (v_cod_ticket, p_cod_usuario, p_mensaje, FALSE);

    RETURN v_cod_ticket;
END;
$$;

CREATE OR REPLACE FUNCTION fn_responder_ticket_soporte(
    p_cod_ticket BIGINT,
    p_cod_usuario BIGINT,
    p_mensaje TEXT,
    p_interno BOOLEAN DEFAULT FALSE,
    p_nuevo_estado TEXT DEFAULT 'EN_PROCESO'
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_mensaje BIGINT;
BEGIN
    INSERT INTO soporte_ticket_mensaje(cod_ticket, cod_usuario, mensaje, interno)
    VALUES (p_cod_ticket, p_cod_usuario, p_mensaje, p_interno)
    RETURNING cod_ticket_mensaje INTO v_cod_mensaje;

    UPDATE soporte_ticket
    SET estado = upper(trim(p_nuevo_estado)),
        fecha_actualizacion = now(),
        fecha_cierre = CASE WHEN upper(trim(p_nuevo_estado)) = 'CERRADO' THEN now() ELSE fecha_cierre END
    WHERE cod_ticket = p_cod_ticket;

    RETURN v_cod_mensaje;
END;
$$;

CREATE OR REPLACE FUNCTION fn_cerrar_ticket_soporte(
    p_cod_ticket BIGINT,
    p_cod_usuario BIGINT,
    p_mensaje TEXT DEFAULT 'Ticket cerrado'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM fn_responder_ticket_soporte(p_cod_ticket, p_cod_usuario, p_mensaje, FALSE, 'CERRADO');
END;
$$;

CREATE OR REPLACE FUNCTION fn_registrar_busqueda(
    p_cod_usuario BIGINT,
    p_termino TEXT,
    p_resultados INTEGER DEFAULT 0
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_log BIGINT;
BEGIN
    INSERT INTO log_busqueda(cod_usuario, termino, resultados)
    VALUES (p_cod_usuario, trim(p_termino), COALESCE(p_resultados,0))
    RETURNING cod_log_busqueda INTO v_cod_log;
    RETURN v_cod_log;
END;
$$;

CREATE OR REPLACE FUNCTION fn_registrar_producto_visto(
    p_cod_usuario BIGINT,
    p_cod_producto BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_log BIGINT;
BEGIN
    INSERT INTO log_producto_visto(cod_usuario, cod_producto)
    VALUES (p_cod_usuario, p_cod_producto)
    RETURNING cod_log_producto_visto INTO v_cod_log;
    RETURN v_cod_log;
END;
$$;

CREATE OR REPLACE FUNCTION fn_generar_recomendaciones_usuario(
    p_cod_usuario BIGINT,
    p_limite INTEGER DEFAULT 10
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total INTEGER := 0;
BEGIN
    INSERT INTO evento_recomendacion(cod_usuario, cod_producto_origen, cod_producto_recomendado, motivo)
    SELECT DISTINCT p_cod_usuario, lpv.cod_producto, p2.cod_producto, 'MISMA_CATEGORIA_VISITADA'
    FROM log_producto_visto lpv
    JOIN producto p1 ON p1.cod_producto = lpv.cod_producto
    JOIN producto p2 ON p2.cod_categoria = p1.cod_categoria
    WHERE lpv.cod_usuario = p_cod_usuario
      AND p2.cod_producto <> lpv.cod_producto
      AND p2.cod_estado_producto = 'PUBLICADO'
      AND NOT EXISTS (
          SELECT 1 FROM evento_recomendacion er
          WHERE er.cod_usuario = p_cod_usuario
            AND er.cod_producto_origen = lpv.cod_producto
            AND er.cod_producto_recomendado = p2.cod_producto
      )
    LIMIT COALESCE(p_limite,10);

    GET DIAGNOSTICS v_total = ROW_COUNT;
    RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_segmentar_clientes()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total INTEGER := 0;
BEGIN
    INSERT INTO segmento_cliente(cod_usuario, segmento, motivo)
    SELECT u.cod_usuario,
           CASE
               WHEN fn_usuario_tiene_membresia_activa(u.cod_usuario) THEN 'PREMIUM_ACTIVO'
               WHEN COALESCE(SUM(p.total),0) >= 500 THEN 'ALTO_VALOR'
               WHEN COUNT(p.cod_pedido) >= 2 THEN 'RECURRENTE'
               ELSE 'NUEVO'
           END AS segmento,
           'Segmentación automática por membresía, pedidos y ventas'
    FROM usuario u
    LEFT JOIN pedido p ON p.cod_usuario = u.cod_usuario AND p.cod_estado_pedido NOT IN ('CANCELADO','REEMBOLSADO')
    WHERE u.email NOT LIKE '%@retailprime.local'
    GROUP BY u.cod_usuario
    ON CONFLICT (cod_usuario, segmento) DO UPDATE SET motivo = EXCLUDED.motivo, fecha_segmentacion = now();

    GET DIAGNOSTICS v_total = ROW_COUNT;
    RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_crear_compra_recurrente(
    p_cod_usuario BIGINT,
    p_nombre TEXT,
    p_frecuencia_dias INTEGER,
    p_proxima_ejecucion DATE
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_compra BIGINT;
BEGIN
    INSERT INTO compra_recurrente(cod_usuario, nombre, frecuencia_dias, proxima_ejecucion, activa)
    VALUES (p_cod_usuario, p_nombre, p_frecuencia_dias, p_proxima_ejecucion, TRUE)
    RETURNING cod_compra_recurrente INTO v_cod_compra;
    RETURN v_cod_compra;
END;
$$;

CREATE OR REPLACE FUNCTION fn_agregar_producto_compra_recurrente(
    p_cod_compra_recurrente BIGINT,
    p_cod_producto BIGINT,
    p_cantidad INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO compra_recurrente_detalle(cod_compra_recurrente, cod_producto, cantidad)
    VALUES (p_cod_compra_recurrente, p_cod_producto, p_cantidad)
    ON CONFLICT (cod_compra_recurrente, cod_producto)
    DO UPDATE SET cantidad = EXCLUDED.cantidad;
END;
$$;

CREATE OR REPLACE FUNCTION fn_preparar_carrito_compra_recurrente(p_cod_compra_recurrente BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_usuario BIGINT;
    v_cod_carrito BIGINT;
    r RECORD;
BEGIN
    SELECT cod_usuario INTO v_cod_usuario
    FROM compra_recurrente
    WHERE cod_compra_recurrente = p_cod_compra_recurrente
      AND activa IS TRUE;

    IF v_cod_usuario IS NULL THEN
        RAISE EXCEPTION 'Compra recurrente no encontrada o inactiva';
    END IF;

    v_cod_carrito := fn_obtener_o_crear_carrito_activo(v_cod_usuario);
    PERFORM fn_limpiar_carrito(v_cod_carrito);

    FOR r IN SELECT cod_producto, cantidad FROM compra_recurrente_detalle WHERE cod_compra_recurrente = p_cod_compra_recurrente LOOP
        PERFORM fn_agregar_producto_carrito(v_cod_usuario, r.cod_producto, r.cantidad);
    END LOOP;

    UPDATE compra_recurrente
    SET proxima_ejecucion = proxima_ejecucion + frecuencia_dias
    WHERE cod_compra_recurrente = p_cod_compra_recurrente;

    RETURN v_cod_carrito;
END;
$$;

CREATE OR REPLACE FUNCTION fn_agregar_contenido_biblioteca(
    p_cod_usuario BIGINT,
    p_cod_contenido BIGINT,
    p_dias_acceso INTEGER DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_cod_biblioteca BIGINT;
BEGIN
    INSERT INTO biblioteca_usuario(cod_usuario, cod_contenido, fecha_expiracion)
    VALUES (p_cod_usuario, p_cod_contenido,
            CASE WHEN p_dias_acceso IS NULL THEN NULL ELSE current_date + p_dias_acceso END)
    ON CONFLICT (cod_usuario, cod_contenido)
    DO UPDATE SET fecha_expiracion = EXCLUDED.fecha_expiracion, fecha_agregado = now()
    RETURNING cod_biblioteca INTO v_cod_biblioteca;

    RETURN v_cod_biblioteca;
END;
$$;

-- Vistas complementarias para paneles de Django Templates/API interna.
CREATE OR REPLACE VIEW vw_cola_email_pendiente AS
SELECT cod_email, cod_usuario, destinatario, asunto, estado, intentos, fecha_programada, fecha_creacion
FROM cola_email
WHERE estado = 'PENDIENTE'
ORDER BY fecha_programada, cod_email;

CREATE OR REPLACE VIEW vw_notificaciones_usuario AS
SELECT n.cod_notificacion, n.cod_usuario, u.email, n.tipo, n.titulo, n.mensaje, n.url_accion,
       n.leida, n.fecha_creacion, n.fecha_lectura
FROM notificacion n
LEFT JOIN usuario u ON u.cod_usuario = n.cod_usuario;

CREATE OR REPLACE VIEW vw_promociones_activas AS
SELECT pr.cod_promocion, pr.codigo, pr.nombre, pr.tipo_descuento, pr.valor,
       pr.fecha_inicio, pr.fecha_fin, COUNT(pp.cod_producto) AS productos_asociados
FROM promocion pr
LEFT JOIN promocion_producto pp ON pp.cod_promocion = pr.cod_promocion
WHERE pr.activo IS TRUE AND now() BETWEEN pr.fecha_inicio AND pr.fecha_fin
GROUP BY pr.cod_promocion, pr.codigo, pr.nombre, pr.tipo_descuento, pr.valor, pr.fecha_inicio, pr.fecha_fin;

CREATE OR REPLACE VIEW vw_soporte_ticket_resumen AS
SELECT st.cod_ticket, st.cod_usuario, u.email, st.asunto, st.categoria, st.prioridad, st.estado,
       st.fecha_creacion, st.fecha_actualizacion, COUNT(stm.cod_ticket_mensaje) AS total_mensajes
FROM soporte_ticket st
JOIN usuario u ON u.cod_usuario = st.cod_usuario
LEFT JOIN soporte_ticket_mensaje stm ON stm.cod_ticket = st.cod_ticket
GROUP BY st.cod_ticket, st.cod_usuario, u.email, st.asunto, st.categoria, st.prioridad, st.estado, st.fecha_creacion, st.fecha_actualizacion;

CREATE OR REPLACE VIEW vw_biblioteca_usuario AS
SELECT bu.cod_biblioteca, bu.cod_usuario, u.email, cd.cod_contenido, cd.titulo, cd.tipo,
       cd.requiere_premium, bu.fecha_agregado, bu.fecha_expiracion
FROM biblioteca_usuario bu
JOIN usuario u ON u.cod_usuario = bu.cod_usuario
JOIN contenido_digital cd ON cd.cod_contenido = bu.cod_contenido;

COMMIT;

-- FASE A: las siguientes firmas se redeclaran al final para que las
-- implementaciones FIFO prevalezcan sobre las versiones heredadas anteriores.
BEGIN;
CREATE OR REPLACE FUNCTION fn_stock_disponible_producto(p_cod_producto BIGINT)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT CASE WHEN EXISTS(SELECT 1 FROM lote_inventario WHERE cod_producto=p_cod_producto)
      THEN COALESCE((SELECT SUM(cantidad_disponible-cantidad_reservada) FROM lote_inventario WHERE cod_producto=p_cod_producto AND estado='ACTIVO'),0)::INTEGER
      ELSE COALESCE((SELECT SUM(stock_total-stock_reservado) FROM inventario WHERE cod_producto=p_cod_producto),0)::INTEGER END;
$$;
CREATE OR REPLACE FUNCTION fn_reservar_stock(p_cod_usuario BIGINT,p_cod_producto BIGINT,p_cantidad INTEGER,p_cod_pedido BIGINT DEFAULT NULL)
RETURNS INTEGER LANGUAGE plpgsql AS $$ BEGIN RETURN fn_reservar_stock_por_lotes(p_cod_usuario,p_cod_producto,p_cantidad,p_cod_pedido,NULL); END; $$;
CREATE OR REPLACE FUNCTION fn_consumir_reservas_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN PERFORM fn_consumir_reservas_lote_pedido(p_cod_pedido); END; $$;
CREATE OR REPLACE FUNCTION fn_liberar_reservas_pedido(p_cod_pedido BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN PERFORM fn_liberar_reservas_lote_pedido(p_cod_pedido); END; $$;
CREATE OR REPLACE FUNCTION fn_expirar_reservas_vencidas()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_total INTEGER:=0;
BEGIN
 FOR r IN SELECT * FROM reserva_inventario WHERE estado_reserva='ACTIVA' AND fecha_expiracion<now() FOR UPDATE LOOP
   IF r.cod_lote IS NOT NULL THEN UPDATE lote_inventario SET cantidad_reservada=GREATEST(cantidad_reservada-r.cantidad,0),fecha_actualizacion=now() WHERE cod_lote=r.cod_lote; END IF;
   UPDATE reserva_inventario SET estado='EXPIRADA',estado_reserva='EXPIRADA' WHERE cod_reserva=r.cod_reserva; v_total:=v_total+1;
 END LOOP; PERFORM fn_recalcular_inventario_desde_lotes(NULL,NULL); RETURN v_total;
END; $$;
CREATE OR REPLACE FUNCTION fn_recibir_orden_abastecimiento(p_cod_orden_abastecimiento BIGINT,p_cod_almacen BIGINT,p_observacion TEXT DEFAULT 'Recepción de orden de abastecimiento')
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE r RECORD; v_proveedor BIGINT; v_estado TEXT;
BEGIN
 SELECT cod_proveedor,estado INTO v_proveedor,v_estado FROM orden_abastecimiento WHERE cod_orden_abastecimiento=p_cod_orden_abastecimiento FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Orden de abastecimiento no encontrada: %',p_cod_orden_abastecimiento; END IF;
 IF v_estado='RECIBIDA' THEN RETURN; END IF; IF v_estado='CANCELADA' THEN RAISE EXCEPTION 'No se puede recibir una orden cancelada'; END IF;
 FOR r IN SELECT * FROM orden_abastecimiento_detalle WHERE cod_orden_abastecimiento=p_cod_orden_abastecimiento LOOP
   PERFORM fn_crear_lote_inventario(r.cod_producto,p_cod_almacen,r.cantidad,r.costo_unitario,'OC-'||p_cod_orden_abastecimiento||'-DET-'||r.cod_orden_abastecimiento_detalle,v_proveedor,r.cod_orden_abastecimiento_detalle,now(),NULL);
 END LOOP;
 UPDATE orden_abastecimiento SET estado='RECIBIDA',cod_almacen=p_cod_almacen,fecha_actualizacion=now() WHERE cod_orden_abastecimiento=p_cod_orden_abastecimiento;
END; $$;
COMMIT;

-- FASE B: redefiniciones finales de contratos Django.
CREATE OR REPLACE FUNCTION fn_crear_pedido_desde_carrito(p_cod_usuario BIGINT,p_cod_direccion_envio BIGINT,p_cod_metodo_envio BIGINT DEFAULT NULL) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE car BIGINT; ped BIGINT; met BIGINT; zon BIGINT; r RECORD; q JSONB; f JSONB; env JSONB; tasa NUMERIC; es_prime BOOLEAN; base NUMERIC;
BEGIN
 SELECT cod_carrito INTO car FROM carrito WHERE cod_usuario=p_cod_usuario AND estado='ACTIVO' FOR UPDATE; IF car IS NULL OR NOT EXISTS(SELECT 1 FROM carrito_detalle WHERE cod_carrito=car) THEN RAISE EXCEPTION 'Carrito activo vacío o inexistente'; END IF;
 IF NOT EXISTS(SELECT 1 FROM direccion_usuario WHERE cod_direccion=p_cod_direccion_envio AND cod_usuario=p_cod_usuario AND activo) THEN RAISE EXCEPTION 'Dirección inválida'; END IF;
 SELECT COALESCE(p_cod_metodo_envio,(SELECT cod_metodo_envio FROM metodo_envio WHERE activo ORDER BY costo_base,cod_metodo_envio LIMIT 1)) INTO met;
 SELECT z.cod_zona INTO zon FROM direccion_usuario d JOIN zona_entrega z ON z.ciudad=d.ciudad AND z.provincia=d.provincia AND z.activo WHERE d.cod_direccion=p_cod_direccion_envio LIMIT 1;
 tasa:=fn_obtener_tasa_impuesto(); es_prime:=fn_usuario_tiene_membresia_activa(p_cod_usuario);
 INSERT INTO pedido(numero_pedido,cod_usuario,cod_direccion_envio,cod_estado_pedido,cod_metodo_envio,cod_zona_entrega,tasa_impuesto,es_premium) VALUES(fn_generar_numero_pedido(),p_cod_usuario,p_cod_direccion_envio,'PENDIENTE_PAGO',met,zon,tasa,es_prime) RETURNING cod_pedido INTO ped;
 FOR r IN SELECT cod_producto,cantidad FROM carrito_detalle WHERE cod_carrito=car LOOP
  PERFORM fn_validar_limite_retail(p_cod_usuario,r.cod_producto,r.cantidad); q:=fn_cotizar_producto_por_lotes(p_cod_usuario,r.cod_producto,r.cantidad); base:=CASE WHEN (q->>'cantidad_cubierta')::INTEGER=r.cantidad THEN ROUND((q->>'subtotal_total')::NUMERIC/r.cantidad,2) ELSE (SELECT precio_actual FROM producto WHERE cod_producto=r.cod_producto) END; f:=fn_calcular_precio_final_item(p_cod_usuario,r.cod_producto,r.cantidad,base,NULL);
  INSERT INTO pedido_detalle(cod_pedido,cod_producto,cantidad,precio_unitario,precio_base_unitario,descuento_promocion_unitario,descuento_prime_unitario,descuento_cupon_unitario,precio_final_unitario,subtotal_linea) VALUES(ped,r.cod_producto,r.cantidad,(f->>'precio_final_unitario')::NUMERIC,base,(f->>'descuento_promocion')::NUMERIC,(f->>'descuento_prime')::NUMERIC,(f->>'descuento_cupon')::NUMERIC,(f->>'precio_final_unitario')::NUMERIC,(f->>'subtotal')::NUMERIC);
  PERFORM fn_reservar_stock_por_lotes(p_cod_usuario,r.cod_producto,r.cantidad,ped,(SELECT cod_pedido_detalle FROM pedido_detalle WHERE cod_pedido=ped AND cod_producto=r.cod_producto));
 END LOOP;
 PERFORM fn_recalcular_total_pedido(ped); env:=fn_calcular_costo_envio(p_cod_usuario,met,zon,(SELECT subtotal-descuento FROM pedido WHERE cod_pedido=ped)); UPDATE pedido SET costo_envio=(env->>'costo_envio')::NUMERIC WHERE cod_pedido=ped; PERFORM fn_recalcular_total_pedido(ped); UPDATE carrito SET estado='CONVERTIDO',fecha_actualizacion=now() WHERE cod_carrito=car; INSERT INTO pedido_estado_historial(cod_pedido,cod_estado_pedido,comentario) VALUES(ped,'PENDIENTE_PAGO','Pedido creado con precio final recalculado'); RETURN ped;
END; $$;
CREATE OR REPLACE FUNCTION fn_capturar_pago_simulado(p_cod_transaccion BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE x RECORD; c RECORD;
BEGIN
 SELECT tp.*,p.cod_estado_pedido,p.total,p.subtotal,p.descuento,p.impuesto,p.tasa_impuesto,p.costo_envio,p.requiere_abastecimiento INTO x FROM transaccion_pago tp JOIN pedido p ON p.cod_pedido=tp.cod_pedido WHERE tp.cod_transaccion=p_cod_transaccion FOR UPDATE OF tp,p;
 IF NOT FOUND THEN RAISE EXCEPTION 'Transacción no encontrada'; END IF; IF x.cod_estado_pago='CAPTURADO' THEN RETURN; END IF;
 IF x.cod_estado_pedido='CANCELADO' OR x.cod_estado_pago<>'AUTORIZADO' OR x.monto<>x.total THEN RAISE EXCEPTION 'Captura no permitida'; END IF;
 SELECT * INTO c FROM cuenta_simulada WHERE cod_metodo_pago=x.cod_metodo_pago FOR UPDATE; IF c.saldo_disponible<x.monto THEN RAISE EXCEPTION 'Saldo insuficiente al capturar'; END IF;
 UPDATE cuenta_simulada SET saldo_disponible=saldo_disponible-x.monto,monto_usado_hoy=monto_usado_hoy+x.monto,fecha_uso=current_date WHERE cod_cuenta=c.cod_cuenta;
 UPDATE transaccion_pago SET cod_estado_pago='CAPTURADO',mensaje='Pago capturado correctamente',fecha_actualizacion=now() WHERE cod_transaccion=p_cod_transaccion;
 PERFORM fn_consumir_reservas_pedido(x.cod_pedido); PERFORM fn_actualizar_estado_pedido(x.cod_pedido,CASE WHEN x.requiere_abastecimiento THEN 'ESPERANDO_PROVEEDOR' ELSE 'PREPARANDO' END,'Pago capturado');
 INSERT INTO factura(cod_pedido,numero_factura,subtotal,descuento,impuesto,tasa_impuesto,costo_envio,total) VALUES(x.cod_pedido,fn_generar_numero_factura(),x.subtotal,x.descuento,x.impuesto,x.tasa_impuesto,x.costo_envio,x.total) ON CONFLICT(cod_pedido) DO NOTHING;
END; $$;
CREATE OR REPLACE FUNCTION fn_recalcular_total_pedido(p_cod_pedido BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE s NUMERIC; d NUMERIC; t NUMERIC; e NUMERIC;
BEGIN SELECT COALESCE(SUM(cantidad*precio_base_unitario),0),COALESCE(SUM(cantidad*(descuento_promocion_unitario+descuento_prime_unitario+descuento_cupon_unitario)),0) INTO s,d FROM pedido_detalle WHERE cod_pedido=p_cod_pedido; SELECT tasa_impuesto,costo_envio INTO t,e FROM pedido WHERE cod_pedido=p_cod_pedido FOR UPDATE; UPDATE pedido SET subtotal=s,descuento=LEAST(d,s),impuesto=ROUND(GREATEST(s-d,0)*COALESCE(t,0)/100,2),total=ROUND(GREATEST(s-d,0)+ROUND(GREATEST(s-d,0)*COALESCE(t,0)/100,2)+COALESCE(e,0),2),fecha_actualizacion=now() WHERE cod_pedido=p_cod_pedido; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_estado_pedido(p_cod_pedido BIGINT,p_cod_estado_pedido VARCHAR,p_comentario TEXT DEFAULT NULL) RETURNS VOID LANGUAGE plpgsql AS $$ DECLARE a TEXT; BEGIN SELECT cod_estado_pedido INTO a FROM pedido WHERE cod_pedido=p_cod_pedido FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Pedido no encontrado'; END IF; PERFORM fn_validar_transicion_pedido(a,p_cod_estado_pedido); UPDATE pedido SET cod_estado_pedido=p_cod_estado_pedido,observacion=COALESCE(p_comentario,observacion),fecha_actualizacion=now() WHERE cod_pedido=p_cod_pedido; END; $$;
CREATE OR REPLACE FUNCTION fn_cancelar_pedido(p_cod_pedido BIGINT,p_motivo TEXT DEFAULT 'Cancelación solicitada') RETURNS VOID LANGUAGE plpgsql AS $$ DECLARE a TEXT; BEGIN SELECT cod_estado_pedido INTO a FROM pedido WHERE cod_pedido=p_cod_pedido FOR UPDATE; IF NOT FOUND OR a IN ('ENTREGADO','DEVUELTO','REEMBOLSADO','CANCELADO') THEN RAISE EXCEPTION 'Pedido no cancelable'; END IF; PERFORM fn_liberar_reservas_pedido(p_cod_pedido); PERFORM fn_anular_autorizaciones_pedido(p_cod_pedido); PERFORM fn_actualizar_estado_pedido(p_cod_pedido,'CANCELADO',p_motivo); END; $$;

-- ============================================================
-- FASE C: TRACKING PERSISTENTE Y MANTENIMIENTO
-- ============================================================
-- FASE D: CRUD lógico reutilizable y operaciones administrativas seguras.
CREATE OR REPLACE FUNCTION fn_listar_entidad_administrable(p_entidad TEXT,p_solo_activos BOOLEAN DEFAULT TRUE) RETURNS JSONB LANGUAGE plpgsql STABLE AS $$
DECLARE q TEXT; r JSONB; BEGIN
 IF p_entidad NOT IN ('categoria','marca','producto','almacen','proveedor','transportista','metodo_envio','zona_entrega','plan_membresia','promocion','cupon','regla_precio','contenido_digital','rol','permiso','parametro_sistema') THEN RAISE EXCEPTION 'Entidad no administrable'; END IF;
 q:=format('SELECT COALESCE(jsonb_agg(to_jsonb(x)),''[]''::jsonb) FROM (SELECT * FROM %I %s) x',p_entidad,CASE WHEN p_solo_activos AND p_entidad IN ('categoria','marca','almacen','proveedor','transportista','metodo_envio','zona_entrega','plan_membresia','promocion','cupon','regla_precio','contenido_digital','rol','permiso') THEN 'WHERE activo IS TRUE' ELSE '' END); EXECUTE q INTO r; RETURN r; END; $$;
CREATE OR REPLACE FUNCTION fn_crear_regla_precio(p_cod_producto BIGINT,p_cod_categoria BIGINT,p_margen NUMERIC,p_operativo NUMERIC DEFAULT 0,p_fijo NUMERIC DEFAULT 0,p_impuesto NUMERIC DEFAULT NULL,p_prioridad INTEGER DEFAULT 100) RETURNS BIGINT LANGUAGE plpgsql AS $$ DECLARE x BIGINT; BEGIN INSERT INTO regla_precio(cod_producto,cod_categoria,margen_porcentaje,costo_operativo_porcentaje,costo_fijo_unitario,porcentaje_impuesto,prioridad) VALUES(p_cod_producto,p_cod_categoria,p_margen,p_operativo,p_fijo,p_impuesto,p_prioridad) RETURNING cod_regla_precio INTO x; RETURN x; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_regla_precio(p_cod_regla BIGINT,p_margen NUMERIC,p_operativo NUMERIC,p_fijo NUMERIC,p_impuesto NUMERIC,p_prioridad INTEGER,p_activo BOOLEAN) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE regla_precio SET margen_porcentaje=p_margen,costo_operativo_porcentaje=p_operativo,costo_fijo_unitario=p_fijo,porcentaje_impuesto=p_impuesto,prioridad=p_prioridad,activo=p_activo,fecha_actualizacion=now() WHERE cod_regla_precio=p_cod_regla; IF NOT FOUND THEN RAISE EXCEPTION 'Regla de precio no encontrada'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_regla_precio(p_cod_regla BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE regla_precio SET activo=FALSE,fecha_actualizacion=now() WHERE cod_regla_precio=p_cod_regla; END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_cupon(p_cod_cupon BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE cupon SET activo=FALSE WHERE cod_cupon=p_cod_cupon; IF NOT FOUND THEN RAISE EXCEPTION 'Cupón no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_cupon(p_cod_cupon BIGINT,p_nombre TEXT,p_valor NUMERIC,p_activo BOOLEAN) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE cupon SET nombre=p_nombre,valor=p_valor,activo=p_activo WHERE cod_cupon=p_cod_cupon; IF NOT FOUND THEN RAISE EXCEPTION 'Cupón no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_promocion(p_cod_promocion BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE promocion SET activo=FALSE WHERE cod_promocion=p_cod_promocion; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_promocion(p_cod_promocion BIGINT,p_nombre TEXT,p_valor NUMERIC,p_activo BOOLEAN) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE promocion SET nombre=p_nombre,valor=p_valor,activo=p_activo WHERE cod_promocion=p_cod_promocion; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_metodo_envio(p_cod_metodo BIGINT,p_nombre TEXT,p_dias_min INTEGER,p_dias_max INTEGER,p_costo NUMERIC,p_prime BOOLEAN,p_activo BOOLEAN) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE metodo_envio SET nombre=p_nombre,dias_min=p_dias_min,dias_max=p_dias_max,costo_base=p_costo,es_premium_gratis=p_prime,activo=p_activo WHERE cod_metodo_envio=p_cod_metodo; IF NOT FOUND THEN RAISE EXCEPTION 'Método de envío no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_metodo_envio_logico(p_cod_metodo BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE metodo_envio SET activo=FALSE WHERE cod_metodo_envio=p_cod_metodo; END; $$;
CREATE OR REPLACE FUNCTION fn_resolver_alerta_stock(p_cod_alerta BIGINT,p_observacion TEXT DEFAULT NULL) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE alerta_stock SET atendida=TRUE,mensaje=COALESCE(mensaje,'')||COALESCE(' | Resuelta: '||p_observacion,'') WHERE cod_alerta=p_cod_alerta; IF NOT FOUND THEN RAISE EXCEPTION 'Alerta no encontrada'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_crear_proveedor_contacto(p_cod_proveedor BIGINT,p_nombre TEXT,p_cargo TEXT DEFAULT NULL,p_email TEXT DEFAULT NULL,p_telefono TEXT DEFAULT NULL,p_principal BOOLEAN DEFAULT FALSE) RETURNS BIGINT LANGUAGE plpgsql AS $$ DECLARE x BIGINT; BEGIN INSERT INTO proveedor_contacto(cod_proveedor,nombre,cargo,email,telefono,principal) VALUES(p_cod_proveedor,p_nombre,p_cargo,p_email,p_telefono,p_principal) RETURNING cod_contacto INTO x; RETURN x; END; $$;
CREATE OR REPLACE FUNCTION fn_desasociar_producto_proveedor(p_cod_producto BIGINT,p_cod_proveedor BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN UPDATE producto_proveedor SET activo=FALSE WHERE cod_producto=p_cod_producto AND cod_proveedor=p_cod_proveedor; END; $$;
CREATE OR REPLACE FUNCTION fn_validar_transicion_envio(p_actual VARCHAR,p_nuevo VARCHAR) RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN
 IF p_actual=p_nuevo THEN RETURN; END IF;
 IF NOT ((p_actual='CREADO' AND p_nuevo IN ('PREPARANDO','CANCELADO')) OR (p_actual='PREPARANDO' AND p_nuevo='LISTO_ENVIO') OR (p_actual='LISTO_ENVIO' AND p_nuevo='ENVIADO') OR (p_actual='ENVIADO' AND p_nuevo='EN_TRANSITO') OR (p_actual='EN_TRANSITO' AND p_nuevo IN ('CENTRO_LOCAL','EN_REPARTO')) OR (p_actual='CENTRO_LOCAL' AND p_nuevo='EN_REPARTO') OR (p_actual='EN_REPARTO' AND p_nuevo='ENTREGADO')) THEN RAISE EXCEPTION 'Transición de envío inválida: % -> %',p_actual,p_nuevo; END IF;
END; $$;
CREATE OR REPLACE FUNCTION fn_programar_tracking_pedido(p_cod_pedido BIGINT) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE e BIGINT; d INTEGER:=3; n INTEGER:=0;
BEGIN
 SELECT cod_envio INTO e FROM envio WHERE cod_pedido=p_cod_pedido; IF e IS NULL THEN e:=fn_generar_tracking_inicial(p_cod_pedido,NULL); END IF;
 SELECT me.dias_max INTO d FROM envio en JOIN metodo_envio me ON me.cod_metodo_envio=en.cod_metodo_envio WHERE en.cod_envio=e; d:=COALESCE(d,3);
 INSERT INTO tracking_evento_programado(cod_envio,cod_tipo_evento,descripcion,ubicacion,fecha_programada,orden,visible_cliente) VALUES
 (e,'PAYMENT_CONFIRMED','Pago aprobado','Pasarela RetailPay',now(),1,TRUE),(e,'PREPARING_PACKAGE','Preparando pedido','Bodega',now()+interval '5 minutes',2,TRUE),(e,'PACKAGE_READY','Pedido listo para envío','Bodega',now()+interval '15 minutes',3,TRUE),(e,'PICKED_UP','Recogido por transportista','Centro de operación',now()+interval '30 minutes',4,TRUE),(e,'IN_TRANSIT','En tránsito','Ruta nacional',now()+interval '1 hour',5,TRUE),(e,'IN_TRANSIT','Llegó a centro local','Centro local',now()+make_interval(days=>GREATEST(d-1,1)),6,TRUE),(e,'OUT_FOR_DELIVERY','En reparto','Centro local',now()+make_interval(days=>GREATEST(d,1)),7,TRUE),(e,'DELIVERED','Entregado al cliente','Dirección de entrega',now()+make_interval(days=>GREATEST(d,1),mins=>30),8,TRUE)
 ON CONFLICT(cod_envio,orden) DO NOTHING; GET DIAGNOSTICS n=ROW_COUNT; RETURN n;
END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_envio_estado(p_cod_envio BIGINT,p_estado VARCHAR,p_comentario TEXT DEFAULT NULL) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE a TEXT; p BIGINT;
BEGIN SELECT COALESCE(estado_envio,estado),cod_pedido INTO a,p FROM envio WHERE cod_envio=p_cod_envio FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Envío no encontrado'; END IF; PERFORM fn_validar_transicion_envio(a,p_estado); UPDATE envio SET estado=p_estado,estado_envio=p_estado,fecha_entrega=CASE WHEN p_estado='ENTREGADO' THEN now() ELSE fecha_entrega END WHERE cod_envio=p_cod_envio; END; $$;
CREATE OR REPLACE FUNCTION fn_procesar_tracking_pendiente(p_fecha_hasta TIMESTAMPTZ DEFAULT now()) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE r RECORD; s TEXT; n INTEGER:=0;
BEGIN FOR r IN SELECT * FROM tracking_evento_programado WHERE procesado=FALSE AND fecha_programada<=p_fecha_hasta ORDER BY fecha_programada,cod_programacion FOR UPDATE SKIP LOCKED LOOP
 s:=CASE r.orden WHEN 2 THEN 'PREPARANDO' WHEN 3 THEN 'LISTO_ENVIO' WHEN 4 THEN 'ENVIADO' WHEN 5 THEN 'EN_TRANSITO' WHEN 6 THEN 'CENTRO_LOCAL' WHEN 7 THEN 'EN_REPARTO' WHEN 8 THEN 'ENTREGADO' ELSE NULL END;
 INSERT INTO tracking_evento(cod_envio,cod_tipo_evento,descripcion,ubicacion,visible_cliente,fecha_evento,orden) VALUES(r.cod_envio,r.cod_tipo_evento,r.descripcion,r.ubicacion,r.visible_cliente,r.fecha_programada,r.orden);
 IF s IS NOT NULL THEN PERFORM fn_actualizar_envio_estado(r.cod_envio,s,r.descripcion); IF s IN ('PREPARANDO','LISTO_ENVIO','ENVIADO','EN_TRANSITO','EN_REPARTO','ENTREGADO') THEN PERFORM fn_actualizar_estado_pedido((SELECT cod_pedido FROM envio WHERE cod_envio=r.cod_envio),s,r.descripcion); END IF; END IF;
 UPDATE tracking_evento_programado SET procesado=TRUE,fecha_procesado=now(),fecha_actualizacion=now() WHERE cod_programacion=r.cod_programacion; n:=n+1;
 END LOOP; RETURN n; END; $$;
CREATE OR REPLACE FUNCTION fn_registrar_carritos_abandonados(p_minutos INTEGER DEFAULT 1440) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE n INTEGER; BEGIN INSERT INTO log_carrito_abandonado(cod_carrito,total_estimado) SELECT c.cod_carrito,fn_total_carrito(c.cod_carrito) FROM carrito c WHERE c.estado='ACTIVO' AND c.fecha_actualizacion<now()-make_interval(mins=>p_minutos) AND NOT EXISTS(SELECT 1 FROM log_carrito_abandonado l WHERE l.cod_carrito=c.cod_carrito); GET DIAGNOSTICS n=ROW_COUNT; RETURN n; END; $$;
CREATE OR REPLACE FUNCTION fn_cancelar_pedidos_impagos_vencidos(p_minutos INTEGER DEFAULT 30) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE r RECORD; n INTEGER:=0; BEGIN FOR r IN SELECT cod_pedido FROM pedido WHERE cod_estado_pedido IN ('PENDIENTE_PAGO','PAGO_AUTORIZADO') AND fecha_creacion<now()-make_interval(mins=>p_minutos) FOR UPDATE SKIP LOCKED LOOP PERFORM fn_cancelar_pedido(r.cod_pedido,'Pago no completado dentro del plazo'); n:=n+1; END LOOP; RETURN n; END; $$;
CREATE OR REPLACE FUNCTION fn_generar_tracking_inicial(p_cod_pedido BIGINT,p_cod_metodo_envio BIGINT DEFAULT NULL) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE e BIGINT; m BIGINT; t BIGINT; d INTEGER;
BEGIN SELECT cod_envio INTO e FROM envio WHERE cod_pedido=p_cod_pedido; IF e IS NOT NULL THEN RETURN e; END IF; SELECT COALESCE(p_cod_metodo_envio,cod_metodo_envio,(SELECT cod_metodo_envio FROM metodo_envio WHERE activo ORDER BY costo_base LIMIT 1)) INTO m FROM pedido WHERE cod_pedido=p_cod_pedido; SELECT cod_transportista INTO t FROM transportista WHERE activo ORDER BY cod_transportista LIMIT 1; SELECT dias_max INTO d FROM metodo_envio WHERE cod_metodo_envio=m; INSERT INTO envio(cod_pedido,cod_transportista,cod_metodo_envio,numero_tracking,estado,estado_envio,fecha_estimada_entrega) VALUES(p_cod_pedido,t,m,fn_generar_numero_tracking(),'CREADO','CREADO',current_date+COALESCE(d,3)) RETURNING cod_envio INTO e; RETURN e; END; $$;
CREATE OR REPLACE FUNCTION fn_registrar_evento_tracking(p_cod_pedido BIGINT,p_cod_tipo_evento VARCHAR,p_descripcion TEXT,p_ubicacion TEXT DEFAULT 'Centro de operación',p_visible_cliente BOOLEAN DEFAULT TRUE) RETURNS BIGINT LANGUAGE plpgsql AS $$ DECLARE e BIGINT; x BIGINT; BEGIN e:=fn_generar_tracking_inicial(p_cod_pedido,NULL); INSERT INTO tracking_evento(cod_envio,cod_tipo_evento,descripcion,ubicacion,visible_cliente,orden) VALUES(e,p_cod_tipo_evento,p_descripcion,p_ubicacion,p_visible_cliente,COALESCE((SELECT MAX(orden)+1 FROM tracking_evento WHERE cod_envio=e),1)) RETURNING cod_tracking_evento INTO x; RETURN x; END; $$;
CREATE OR REPLACE FUNCTION fn_marcar_pedido_entregado(p_cod_pedido BIGINT,p_comentario TEXT DEFAULT 'Pedido entregado al cliente') RETURNS VOID LANGUAGE plpgsql AS $$ BEGIN PERFORM fn_actualizar_envio_estado((SELECT cod_envio FROM envio WHERE cod_pedido=p_cod_pedido),'ENTREGADO',p_comentario); PERFORM fn_actualizar_estado_pedido(p_cod_pedido,'ENTREGADO',p_comentario); END; $$;

-- FASE J: relación usuario/proveedor y CRUD DB-first pendiente de Fase D.
CREATE OR REPLACE FUNCTION fn_asociar_usuario_proveedor(p_cod_usuario BIGINT,p_cod_proveedor BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM usuario WHERE cod_usuario=p_cod_usuario AND activo) THEN RAISE EXCEPTION 'Usuario no encontrado o inactivo'; END IF;
  IF NOT EXISTS (SELECT 1 FROM proveedor WHERE cod_proveedor=p_cod_proveedor AND activo) THEN RAISE EXCEPTION 'Proveedor no encontrado o inactivo'; END IF;
  UPDATE usuario_proveedor SET activo=FALSE,fecha_actualizacion=now() WHERE cod_usuario=p_cod_usuario AND activo AND cod_proveedor<>p_cod_proveedor;
  INSERT INTO usuario_proveedor(cod_usuario,cod_proveedor,activo) VALUES(p_cod_usuario,p_cod_proveedor,TRUE)
  ON CONFLICT(cod_usuario,cod_proveedor) DO UPDATE SET activo=TRUE,fecha_actualizacion=now()
  RETURNING cod_usuario_proveedor INTO v_id;
  RETURN v_id;
END; $$;
CREATE OR REPLACE FUNCTION fn_desasociar_usuario_proveedor(p_cod_usuario BIGINT,p_cod_proveedor BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE usuario_proveedor SET activo=FALSE,fecha_actualizacion=now() WHERE cod_usuario=p_cod_usuario AND cod_proveedor=p_cod_proveedor; IF NOT FOUND THEN RAISE EXCEPTION 'Asociación usuario/proveedor no encontrada'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_crear_producto_atributo(p_nombre TEXT,p_tipo_dato VARCHAR DEFAULT 'TEXT') RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT; BEGIN INSERT INTO producto_atributo(nombre,tipo_dato,activo) VALUES(trim(p_nombre),upper(COALESCE(p_tipo_dato,'TEXT')),TRUE) RETURNING cod_atributo INTO v_id; RETURN v_id; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_producto_atributo(p_cod_atributo BIGINT,p_nombre TEXT,p_tipo_dato VARCHAR,p_activo BOOLEAN DEFAULT TRUE) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE producto_atributo SET nombre=trim(p_nombre),tipo_dato=upper(p_tipo_dato),activo=p_activo WHERE cod_atributo=p_cod_atributo; IF NOT FOUND THEN RAISE EXCEPTION 'Atributo no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_producto_atributo(p_cod_atributo BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE producto_atributo SET activo=FALSE WHERE cod_atributo=p_cod_atributo; IF NOT FOUND THEN RAISE EXCEPTION 'Atributo no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_asignar_producto_atributo_valor(p_cod_producto BIGINT,p_cod_atributo BIGINT,p_valor TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM producto WHERE cod_producto=p_cod_producto) THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
  IF NOT EXISTS(SELECT 1 FROM producto_atributo WHERE cod_atributo=p_cod_atributo AND activo) THEN RAISE EXCEPTION 'Atributo no encontrado o inactivo'; END IF;
  INSERT INTO producto_atributo_valor(cod_producto,cod_atributo,valor,activo) VALUES(p_cod_producto,p_cod_atributo,trim(p_valor),TRUE)
  ON CONFLICT(cod_producto,cod_atributo) DO UPDATE SET valor=EXCLUDED.valor,activo=TRUE;
END; $$;
CREATE OR REPLACE FUNCTION fn_desasociar_producto_atributo_valor(p_cod_producto BIGINT,p_cod_atributo BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE producto_atributo_valor SET activo=FALSE WHERE cod_producto=p_cod_producto AND cod_atributo=p_cod_atributo; IF NOT FOUND THEN RAISE EXCEPTION 'Valor técnico no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_imagen_producto(p_cod_imagen BIGINT,p_url_imagen TEXT,p_alt_text TEXT,p_orden INTEGER,p_activo BOOLEAN DEFAULT TRUE) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_orden<1 THEN RAISE EXCEPTION 'El orden debe ser positivo'; END IF;
  UPDATE producto_imagen SET url_imagen=trim(p_url_imagen),alt_text=NULLIF(trim(COALESCE(p_alt_text,'')),''),orden=p_orden,activo=p_activo WHERE cod_imagen=p_cod_imagen;
  IF NOT FOUND THEN RAISE EXCEPTION 'Imagen no encontrada'; END IF;
END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_imagen_producto(p_cod_imagen BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE producto_imagen SET activo=FALSE,es_principal=FALSE WHERE cod_imagen=p_cod_imagen; IF NOT FOUND THEN RAISE EXCEPTION 'Imagen no encontrada'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_ordenar_imagen_producto(p_cod_imagen BIGINT,p_orden INTEGER,p_es_principal BOOLEAN DEFAULT FALSE) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE p BIGINT; BEGIN IF p_orden<1 THEN RAISE EXCEPTION 'El orden debe ser positivo'; END IF; SELECT cod_producto INTO p FROM producto_imagen WHERE cod_imagen=p_cod_imagen AND activo; IF p IS NULL THEN RAISE EXCEPTION 'Imagen activa no encontrada'; END IF; IF p_es_principal THEN UPDATE producto_imagen SET es_principal=FALSE WHERE cod_producto=p; END IF; UPDATE producto_imagen SET orden=p_orden,es_principal=p_es_principal WHERE cod_imagen=p_cod_imagen; END; $$;
CREATE OR REPLACE FUNCTION fn_crear_beneficio_membresia(p_cod_plan BIGINT,p_codigo VARCHAR,p_nombre TEXT,p_valor NUMERIC DEFAULT NULL,p_descripcion TEXT DEFAULT NULL) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT; BEGIN IF NOT EXISTS(SELECT 1 FROM plan_membresia WHERE cod_plan=p_cod_plan AND activo) THEN RAISE EXCEPTION 'Plan no encontrado o inactivo'; END IF; INSERT INTO beneficio_membresia(cod_plan,codigo,nombre,valor,descripcion,activo) VALUES(p_cod_plan,upper(trim(p_codigo)),trim(p_nombre),p_valor,p_descripcion,TRUE) RETURNING cod_beneficio INTO v_id; RETURN v_id; END; $$;
CREATE OR REPLACE FUNCTION fn_actualizar_beneficio_membresia(p_cod_beneficio BIGINT,p_nombre TEXT,p_valor NUMERIC,p_descripcion TEXT,p_activo BOOLEAN DEFAULT TRUE) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE beneficio_membresia SET nombre=trim(p_nombre),valor=p_valor,descripcion=p_descripcion,activo=p_activo WHERE cod_beneficio=p_cod_beneficio; IF NOT FOUND THEN RAISE EXCEPTION 'Beneficio no encontrado'; END IF; END; $$;
CREATE OR REPLACE FUNCTION fn_desactivar_beneficio_membresia(p_cod_beneficio BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN UPDATE beneficio_membresia SET activo=FALSE WHERE cod_beneficio=p_cod_beneficio; IF NOT FOUND THEN RAISE EXCEPTION 'Beneficio no encontrado'; END IF; END; $$;

-- Última redefinición del wrapper de disponibilidad: combina almacenes ya
-- migrados a lotes con los que aún conservan inventario agregado.
CREATE OR REPLACE FUNCTION fn_stock_disponible_producto(p_cod_producto BIGINT)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT (
        COALESCE((SELECT SUM(cantidad_disponible-cantidad_reservada) FROM lote_inventario
                  WHERE cod_producto=p_cod_producto AND estado='ACTIVO'),0)
        + COALESCE((SELECT SUM(i.stock_total-i.stock_reservado) FROM inventario i
                    WHERE i.cod_producto=p_cod_producto
                      AND NOT EXISTS (SELECT 1 FROM lote_inventario l
                                      WHERE l.cod_producto=i.cod_producto AND l.cod_almacen=i.cod_almacen)),0)
    )::INTEGER;
$$;

-- Redefinición final y tolerante del procesador de tracking. Permite recuperar
-- pedidos históricos cuyo estado ya avanzó mientras estado_envio quedó en
-- CREADO, sin intentar regresar el pedido a una fase anterior.
CREATE OR REPLACE FUNCTION fn_procesar_tracking_pendiente(
    p_fecha_hasta TIMESTAMPTZ DEFAULT now()
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
    v_cod_pedido BIGINT;
    v_estado_envio TEXT;
    v_estado_pedido TEXT;
    v_estado_objetivo TEXT;
    v_rango_envio INTEGER;
    v_rango_pedido INTEGER;
    v_rango_objetivo INTEGER;
    v_procesados INTEGER := 0;
BEGIN
    FOR r IN
        SELECT *
        FROM tracking_evento_programado
        WHERE procesado = FALSE
          AND fecha_programada <= p_fecha_hasta
        ORDER BY fecha_programada, orden, cod_programacion
        FOR UPDATE SKIP LOCKED
    LOOP
        v_cod_pedido := NULL;
        v_estado_envio := NULL;
        v_estado_pedido := NULL;
        SELECT e.cod_pedido, COALESCE(e.estado_envio, e.estado), p.cod_estado_pedido
        INTO v_cod_pedido, v_estado_envio, v_estado_pedido
        FROM envio e
        JOIN pedido p ON p.cod_pedido = e.cod_pedido
        WHERE e.cod_envio = r.cod_envio;

        -- Conserva el historial de la programación aunque el envío de una
        -- carga antigua ya no exista; una fila huérfana no debe bloquear las demás.
        IF NOT FOUND THEN
            UPDATE tracking_evento_programado
            SET procesado = TRUE, fecha_procesado = now(), fecha_actualizacion = now()
            WHERE cod_programacion = r.cod_programacion;
            v_procesados := v_procesados + 1;
            CONTINUE;
        END IF;

        IF v_estado_pedido IN ('CANCELADO', 'DEVOLUCION_SOLICITADA', 'DEVUELTO', 'REEMBOLSADO') THEN
            UPDATE tracking_evento_programado
            SET procesado = TRUE, fecha_procesado = now(), fecha_actualizacion = now()
            WHERE cod_programacion = r.cod_programacion;
            v_procesados := v_procesados + 1;
            CONTINUE;
        END IF;

        v_estado_objetivo := CASE r.orden
            WHEN 2 THEN 'PREPARANDO'
            WHEN 3 THEN 'LISTO_ENVIO'
            WHEN 4 THEN 'ENVIADO'
            WHEN 5 THEN 'EN_TRANSITO'
            WHEN 6 THEN 'CENTRO_LOCAL'
            WHEN 7 THEN 'EN_REPARTO'
            WHEN 8 THEN 'ENTREGADO'
            ELSE NULL
        END;

        UPDATE tracking_evento
        SET orden = r.orden
        WHERE cod_tracking_evento = (
            SELECT te.cod_tracking_evento
            FROM tracking_evento te
            WHERE te.cod_envio = r.cod_envio
              AND te.cod_tipo_evento = r.cod_tipo_evento
              AND te.orden IS NULL
            ORDER BY te.fecha_evento, te.cod_tracking_evento
            LIMIT 1
        )
          AND NOT EXISTS (
              SELECT 1 FROM tracking_evento te
              WHERE te.cod_envio = r.cod_envio AND te.orden = r.orden
          );

        IF NOT FOUND AND NOT EXISTS (
            SELECT 1 FROM tracking_evento te
            WHERE te.cod_envio = r.cod_envio AND te.orden = r.orden
        ) THEN
            INSERT INTO tracking_evento(
                cod_envio, cod_tipo_evento, descripcion, ubicacion,
                visible_cliente, fecha_evento, orden
            ) VALUES (
                r.cod_envio, r.cod_tipo_evento, r.descripcion, r.ubicacion,
                r.visible_cliente, r.fecha_programada, r.orden
            );
        END IF;

        IF v_estado_objetivo IS NOT NULL THEN
            v_rango_objetivo := CASE v_estado_objetivo
                WHEN 'CREADO' THEN 0 WHEN 'PREPARANDO' THEN 2
                WHEN 'LISTO_ENVIO' THEN 3 WHEN 'ENVIADO' THEN 4
                WHEN 'EN_TRANSITO' THEN 5 WHEN 'CENTRO_LOCAL' THEN 6
                WHEN 'EN_REPARTO' THEN 7 WHEN 'ENTREGADO' THEN 8 ELSE 0 END;
            v_rango_envio := CASE v_estado_envio
                WHEN 'CREADO' THEN 0 WHEN 'PREPARANDO' THEN 2
                WHEN 'LISTO_ENVIO' THEN 3 WHEN 'ENVIADO' THEN 4
                WHEN 'EN_TRANSITO' THEN 5 WHEN 'CENTRO_LOCAL' THEN 6
                WHEN 'EN_REPARTO' THEN 7 WHEN 'ENTREGADO' THEN 8 ELSE 0 END;
            v_rango_pedido := CASE v_estado_pedido
                WHEN 'PENDIENTE_PAGO' THEN 0 WHEN 'PAGO_AUTORIZADO' THEN 1
                WHEN 'PREPARANDO' THEN 2 WHEN 'ESPERANDO_PROVEEDOR' THEN 2
                WHEN 'LISTO_ENVIO' THEN 3 WHEN 'ENVIADO' THEN 4
                WHEN 'EN_TRANSITO' THEN 5 WHEN 'EN_REPARTO' THEN 7
                WHEN 'ENTREGADO' THEN 8 ELSE 0 END;

            IF v_rango_envio < v_rango_objetivo THEN
                PERFORM fn_actualizar_envio_estado(r.cod_envio, v_estado_objetivo, r.descripcion);
                v_estado_envio := v_estado_objetivo;
            END IF;
            IF v_estado_objetivo <> 'CENTRO_LOCAL' AND v_rango_pedido < v_rango_objetivo THEN
                PERFORM fn_actualizar_estado_pedido(v_cod_pedido, v_estado_objetivo, r.descripcion);
                v_estado_pedido := v_estado_objetivo;
            END IF;
        END IF;

        UPDATE tracking_evento_programado
        SET procesado = TRUE, fecha_procesado = now(), fecha_actualizacion = now()
        WHERE cod_programacion = r.cod_programacion;
        v_procesados := v_procesados + 1;
    END LOOP;
    RETURN v_procesados;
END;
$$;

-- TECHTAIL: esta redefinición final mantiene la marca correcta después de
-- ejecutar de principio a fin todas las funciones históricas del proyecto.
CREATE OR REPLACE FUNCTION fn_crear_direccion_usuario(
    p_cod_usuario BIGINT, p_alias TEXT, p_receptor TEXT, p_linea1 TEXT,
    p_linea2 TEXT, p_ciudad TEXT, p_provincia TEXT, p_pais TEXT DEFAULT 'Ecuador',
    p_codigo_postal TEXT DEFAULT NULL, p_telefono_contacto TEXT DEFAULT NULL,
    p_es_predeterminada BOOLEAN DEFAULT FALSE
) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
    v_cod_direccion BIGINT;
    v_ciudad TEXT := trim(COALESCE(p_ciudad,''));
    v_provincia TEXT := trim(COALESCE(p_provincia,''));
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE cod_usuario=p_cod_usuario AND activo IS TRUE) THEN
        RAISE EXCEPTION 'Usuario no encontrado o inactivo';
    END IF;
    IF trim(COALESCE(p_linea1,''))='' THEN RAISE EXCEPTION 'La dirección principal es obligatoria'; END IF;
    IF NOT EXISTS (
        SELECT 1 FROM canton c JOIN provincia p ON p.cod_provincia=c.cod_provincia
        WHERE lower(p.nombre)=lower(v_provincia) AND lower(c.nombre)=lower(v_ciudad)
          AND p.activo IS TRUE AND c.activo IS TRUE
    ) THEN RAISE EXCEPTION 'Provincia/cantón inválidos: %, %',v_provincia,v_ciudad; END IF;
    IF p_es_predeterminada THEN
        UPDATE direccion_usuario SET es_predeterminada=FALSE
        WHERE cod_usuario=p_cod_usuario AND activo IS TRUE;
    END IF;
    INSERT INTO direccion_usuario(
        cod_usuario,alias,receptor,linea1,linea2,ciudad,provincia,pais,
        codigo_postal,telefono_contacto,es_predeterminada
    ) VALUES (
        p_cod_usuario,COALESCE(NULLIF(trim(p_alias),''),'Principal'),
        COALESCE(NULLIF(trim(p_receptor),''),'Cliente TechTail'),trim(p_linea1),
        NULLIF(trim(COALESCE(p_linea2,'')),''),v_ciudad,v_provincia,
        COALESCE(NULLIF(trim(p_pais),''),'Ecuador'),NULLIF(trim(COALESCE(p_codigo_postal,'')),''),
        NULLIF(trim(COALESCE(p_telefono_contacto,'')),''),p_es_predeterminada
    ) RETURNING cod_direccion INTO v_cod_direccion;
    RETURN v_cod_direccion;
END;
$$;

-- TECHTAIL: validación final de publicación con ficha técnica PDF.
CREATE OR REPLACE FUNCTION fn_validar_producto_publicable(p_cod_producto BIGINT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_producto RECORD;
    v_proveedores INTEGER;
    v_stock_total INTEGER;
    v_tiene_imagen BOOLEAN;
    v_tiene_regla BOOLEAN;
    v_ficha_url TEXT;
BEGIN
    SELECT * INTO v_producto FROM producto WHERE cod_producto=p_cod_producto;
    IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado: %',p_cod_producto; END IF;
    IF v_producto.cod_categoria IS NULL THEN RAISE EXCEPTION 'El producto no tiene categoría'; END IF;
    IF v_producto.cod_marca IS NULL THEN RAISE EXCEPTION 'El producto no tiene marca'; END IF;
    IF NULLIF(trim(v_producto.sku),'') IS NULL THEN RAISE EXCEPTION 'El producto no tiene SKU'; END IF;
    IF v_producto.precio_actual<=0 THEN RAISE EXCEPTION 'El producto % no tiene precio válido',p_cod_producto; END IF;
    v_ficha_url := COALESCE(v_producto.metadata->'ficha_tecnica'->>'url','');
    IF lower(split_part(v_ficha_url,'?',1)) NOT LIKE '%.pdf' THEN
        RAISE EXCEPTION 'Producto % no puede publicarse: falta ficha técnica PDF',p_cod_producto;
    END IF;
    v_proveedores := fn_contar_proveedores_activos_producto(p_cod_producto);
    IF v_proveedores<5 THEN
        RAISE EXCEPTION 'Producto % no puede publicarse: requiere mínimo 5 proveedores activos, tiene %',p_cod_producto,v_proveedores;
    END IF;
    v_tiene_imagen := fn_producto_tiene_imagen_principal(p_cod_producto);
    IF v_tiene_imagen IS FALSE THEN RAISE EXCEPTION 'Producto % no puede publicarse: falta imagen principal',p_cod_producto; END IF;
    SELECT EXISTS(
        SELECT 1 FROM regla_limite_compra r
        WHERE r.activo IS TRUE AND (r.cod_producto=p_cod_producto OR (r.cod_producto IS NULL AND r.cod_categoria=v_producto.cod_categoria))
    ) INTO v_tiene_regla;
    IF v_tiene_regla IS FALSE THEN RAISE EXCEPTION 'Producto % no puede publicarse: falta regla de límite retail',p_cod_producto; END IF;
    v_stock_total := fn_stock_disponible_producto(p_cod_producto)+fn_stock_proveedor_disponible_producto(p_cod_producto);
    IF v_stock_total<=0 THEN RAISE EXCEPTION 'Producto % no puede publicarse: sin stock propio ni de proveedores',p_cod_producto; END IF;
END;
$$;
