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
    SELECT cod_pedido, fn_generar_numero_factura(), subtotal, ROUND(subtotal * 0.12, 2), total
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
