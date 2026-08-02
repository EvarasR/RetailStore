-- ============================================================
-- estructura.sql
-- Sistema Retail Prime - PostgreSQL 15
-- Contiene: extensión, tablas, constraints, FK e índices en el esquema public.
-- Ejecutar primero.
-- ============================================================

-- ============================================================
-- 01_estructura.sql
-- Sistema Retail Prime - PostgreSQL 15
-- Estructura normalizada en 3FN con IDs cod_*
-- ============================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- DROPS DE TABLAS - ESQUEMA PUBLIC
-- Ejecutar antes de crear la estructura para reiniciar la BD.
-- Nota: CASCADE elimina dependencias como FK, triggers y vistas.
-- ============================================================
DROP TABLE IF EXISTS biblioteca_usuario CASCADE;
DROP TABLE IF EXISTS contenido_digital CASCADE;
DROP TABLE IF EXISTS wishlist_detalle CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS producto_respuesta CASCADE;
DROP TABLE IF EXISTS producto_pregunta CASCADE;
DROP TABLE IF EXISTS soporte_ticket_mensaje CASCADE;
DROP TABLE IF EXISTS soporte_ticket CASCADE;
DROP TABLE IF EXISTS cola_email CASCADE;
DROP TABLE IF EXISTS notificacion CASCADE;
DROP TABLE IF EXISTS cupon_uso CASCADE;
DROP TABLE IF EXISTS cupon CASCADE;
DROP TABLE IF EXISTS promocion_producto CASCADE;
DROP TABLE IF EXISTS promocion CASCADE;
DROP TABLE IF EXISTS historial_precio_producto CASCADE;
DROP TABLE IF EXISTS segmento_cliente CASCADE;
DROP TABLE IF EXISTS snapshot_kpi CASCADE;
DROP TABLE IF EXISTS resumen_venta_diaria CASCADE;
DROP TABLE IF EXISTS evento_recomendacion CASCADE;
DROP TABLE IF EXISTS log_carrito_abandonado CASCADE;
DROP TABLE IF EXISTS log_producto_visto CASCADE;
DROP TABLE IF EXISTS log_busqueda CASCADE;
DROP TABLE IF EXISTS uso_beneficio CASCADE;
DROP TABLE IF EXISTS compra_recurrente_detalle CASCADE;
DROP TABLE IF EXISTS compra_recurrente CASCADE;
DROP TABLE IF EXISTS pago_membresia CASCADE;
DROP TABLE IF EXISTS membresia_usuario CASCADE;
DROP TABLE IF EXISTS beneficio_membresia CASCADE;
DROP TABLE IF EXISTS plan_membresia CASCADE;
DROP TABLE IF EXISTS tracking_evento CASCADE;
DROP TABLE IF EXISTS envio CASCADE;
DROP TABLE IF EXISTS zona_entrega CASCADE;
DROP TABLE IF EXISTS metodo_envio CASCADE;
DROP TABLE IF EXISTS transportista CASCADE;
DROP TABLE IF EXISTS reembolso_pago CASCADE;
DROP TABLE IF EXISTS autorizacion_pago CASCADE;
DROP TABLE IF EXISTS transaccion_pago CASCADE;
DROP TABLE IF EXISTS cuenta_simulada CASCADE;
DROP TABLE IF EXISTS metodo_pago CASCADE;
DROP TABLE IF EXISTS bin_tarjeta CASCADE;
DROP TABLE IF EXISTS devolucion_detalle CASCADE;
DROP TABLE IF EXISTS devolucion CASCADE;
DROP TABLE IF EXISTS factura CASCADE;
DROP TABLE IF EXISTS pedido_estado_historial CASCADE;
DROP TABLE IF EXISTS pedido_detalle CASCADE;
DROP TABLE IF EXISTS pedido CASCADE;
DROP TABLE IF EXISTS carrito_detalle CASCADE;
DROP TABLE IF EXISTS carrito CASCADE;
DROP TABLE IF EXISTS historial_proveedor CASCADE;
DROP TABLE IF EXISTS orden_abastecimiento_detalle CASCADE;
DROP TABLE IF EXISTS orden_abastecimiento CASCADE;
DROP TABLE IF EXISTS proveedor_stock CASCADE;
DROP TABLE IF EXISTS producto_proveedor CASCADE;
DROP TABLE IF EXISTS proveedor_contacto CASCADE;
DROP TABLE IF EXISTS proveedor CASCADE;
DROP TABLE IF EXISTS alerta_stock CASCADE;
DROP TABLE IF EXISTS reserva_inventario CASCADE;
DROP TABLE IF EXISTS movimiento_inventario CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS almacen CASCADE;
DROP TABLE IF EXISTS regla_limite_compra CASCADE;
DROP TABLE IF EXISTS producto_resena CASCADE;
DROP TABLE IF EXISTS producto_favorito CASCADE;
DROP TABLE IF EXISTS producto_relacionado CASCADE;
DROP TABLE IF EXISTS producto_atributo_valor CASCADE;
DROP TABLE IF EXISTS producto_atributo CASCADE;
DROP TABLE IF EXISTS producto_imagen CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS marca CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS parametro_sistema CASCADE;
DROP TABLE IF EXISTS auditoria CASCADE;
DROP TABLE IF EXISTS intento_login CASCADE;
DROP TABLE IF EXISTS direccion_usuario CASCADE;
DROP TABLE IF EXISTS canton CASCADE;
DROP TABLE IF EXISTS provincia CASCADE;
DROP TABLE IF EXISTS perfil_usuario CASCADE;
DROP TABLE IF EXISTS usuario_rol CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS rol_permiso CASCADE;
DROP TABLE IF EXISTS permiso CASCADE;
DROP TABLE IF EXISTS rol CASCADE;
DROP TABLE IF EXISTS tipo_evento_tracking CASCADE;
DROP TABLE IF EXISTS tipo_movimiento_inventario CASCADE;
DROP TABLE IF EXISTS estado_membresia CASCADE;
DROP TABLE IF EXISTS estado_pago CASCADE;
DROP TABLE IF EXISTS estado_pedido CASCADE;
DROP TABLE IF EXISTS estado_producto CASCADE;

-- ============================================================
-- TABLAS MAESTRAS / CATÁLOGOS TÉCNICOS
-- ============================================================

CREATE TABLE IF NOT EXISTS estado_producto (
    cod_estado_producto VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS estado_pedido (
    cod_estado_pedido VARCHAR(40) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    orden INTEGER NOT NULL UNIQUE,
    genera_tracking BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS estado_pago (
    cod_estado_pago VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS estado_membresia (
    cod_estado_membresia VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS tipo_movimiento_inventario (
    cod_tipo_movimiento VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL,
    signo SMALLINT NOT NULL CHECK (signo IN (-1,0,1))
);

CREATE TABLE IF NOT EXISTS tipo_evento_tracking (
    cod_tipo_evento VARCHAR(40) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- ============================================================
-- SEGURIDAD, USUARIOS, ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS rol (
    cod_rol BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permiso (
    cod_permiso BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(100) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS rol_permiso (
    cod_rol BIGINT NOT NULL REFERENCES rol(cod_rol) ON DELETE CASCADE,
    cod_permiso BIGINT NOT NULL REFERENCES permiso(cod_permiso) ON DELETE CASCADE,
    PRIMARY KEY (cod_rol, cod_permiso)
);

CREATE TABLE IF NOT EXISTS usuario (
    cod_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(180) NOT NULL,
    password_hash TEXT NOT NULL,
    nombres VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    telefono VARCHAR(30),
    documento_identidad VARCHAR(40),
    email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultimo_login TIMESTAMPTZ,
    CONSTRAINT uk_usuario_email UNIQUE (email),
    CONSTRAINT uk_usuario_documento UNIQUE (documento_identidad),
    CONSTRAINT chk_usuario_email CHECK (position('@' in email) > 1)
);

CREATE TABLE IF NOT EXISTS usuario_rol (
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    cod_rol BIGINT NOT NULL REFERENCES rol(cod_rol) ON DELETE RESTRICT,
    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (cod_usuario, cod_rol)
);

CREATE TABLE IF NOT EXISTS perfil_usuario (
    cod_perfil BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL UNIQUE REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    acepta_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    idioma_preferido VARCHAR(10) NOT NULL DEFAULT 'es',
    moneda_preferida VARCHAR(10) NOT NULL DEFAULT 'USD',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS direccion_usuario (
    cod_direccion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    alias VARCHAR(80) NOT NULL DEFAULT 'Principal',
    receptor VARCHAR(180) NOT NULL,
    linea1 VARCHAR(200) NOT NULL,
    linea2 VARCHAR(200),
    ciudad VARCHAR(120) NOT NULL,
    provincia VARCHAR(120) NOT NULL,
    pais VARCHAR(80) NOT NULL DEFAULT 'Ecuador',
    codigo_postal VARCHAR(20),
    telefono_contacto VARCHAR(30),
    es_predeterminada BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_direccion_predeterminada_usuario
ON direccion_usuario(cod_usuario)
WHERE es_predeterminada IS TRUE AND activo IS TRUE;


CREATE TABLE IF NOT EXISTS provincia (
    cod_provincia INTEGER PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS canton (
    cod_canton INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_provincia INTEGER NOT NULL REFERENCES provincia(cod_provincia) ON DELETE RESTRICT,
    nombre VARCHAR(120) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_canton_provincia_nombre UNIQUE (cod_provincia, nombre)
);

CREATE INDEX IF NOT EXISTS ix_canton_provincia ON canton(cod_provincia);

CREATE TABLE IF NOT EXISTS intento_login (
    cod_intento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(180) NOT NULL,
    ip_origen INET,
    user_agent TEXT,
    exitoso BOOLEAN NOT NULL,
    motivo TEXT,
    fecha_intento TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auditoria (
    cod_auditoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla VARCHAR(120) NOT NULL,
    operacion VARCHAR(20) NOT NULL CHECK (operacion IN ('INSERT','UPDATE','DELETE')),
    cod_registro TEXT,
    usuario_bd TEXT NOT NULL DEFAULT current_user,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parametro_sistema (
    clave VARCHAR(120) PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion TEXT,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CATÁLOGO
-- ============================================================

CREATE TABLE IF NOT EXISTS categoria (
    cod_categoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_categoria_padre BIGINT REFERENCES categoria(cod_categoria) ON DELETE SET NULL,
    nombre VARCHAR(120) NOT NULL,
    slug VARCHAR(140) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_categoria_padre_nombre UNIQUE (cod_categoria_padre, nombre)
);

CREATE TABLE IF NOT EXISTS marca (
    cod_marca BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS producto (
    cod_producto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_categoria BIGINT NOT NULL REFERENCES categoria(cod_categoria) ON DELETE RESTRICT,
    cod_marca BIGINT NOT NULL REFERENCES marca(cod_marca) ON DELETE RESTRICT,
    sku VARCHAR(80) NOT NULL UNIQUE,
    nombre VARCHAR(180) NOT NULL,
    descripcion TEXT NOT NULL,
    precio_actual NUMERIC(12,2) NOT NULL,
    peso_kg NUMERIC(10,3) NOT NULL DEFAULT 0,
    largo_cm NUMERIC(10,2) NOT NULL DEFAULT 0,
    ancho_cm NUMERIC(10,2) NOT NULL DEFAULT 0,
    alto_cm NUMERIC(10,2) NOT NULL DEFAULT 0,
    cod_estado_producto VARCHAR(30) NOT NULL DEFAULT 'BORRADOR' REFERENCES estado_producto(cod_estado_producto) ON DELETE RESTRICT,
    requiere_revision_mayorista BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_producto_precio CHECK (precio_actual > 0),
    CONSTRAINT chk_producto_dimensiones CHECK (peso_kg >= 0 AND largo_cm >= 0 AND ancho_cm >= 0 AND alto_cm >= 0)
);

CREATE INDEX IF NOT EXISTS ix_producto_categoria ON producto(cod_categoria);
CREATE INDEX IF NOT EXISTS ix_producto_marca ON producto(cod_marca);
CREATE INDEX IF NOT EXISTS ix_producto_estado ON producto(cod_estado_producto);

CREATE TABLE IF NOT EXISTS producto_imagen (
    cod_imagen BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    alt_text VARCHAR(180),
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    orden INTEGER NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fase J: soporte para baja lógica y ordenación de imágenes/valores técnicos.
ALTER TABLE producto_imagen ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uk_producto_imagen_principal
ON producto_imagen(cod_producto)
WHERE es_principal IS TRUE;

CREATE TABLE IF NOT EXISTS producto_atributo (
    cod_atributo BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo_dato VARCHAR(30) NOT NULL DEFAULT 'texto',
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS producto_atributo_valor (
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    cod_atributo BIGINT NOT NULL REFERENCES producto_atributo(cod_atributo) ON DELETE RESTRICT,
    valor TEXT NOT NULL,
    PRIMARY KEY (cod_producto, cod_atributo)
);

ALTER TABLE producto_atributo_valor ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS producto_relacionado (
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    cod_producto_relacionado BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    tipo_relacion VARCHAR(40) NOT NULL DEFAULT 'RELACIONADO',
    PRIMARY KEY (cod_producto, cod_producto_relacionado),
    CONSTRAINT chk_producto_relacionado_diferente CHECK (cod_producto <> cod_producto_relacionado)
);

CREATE TABLE IF NOT EXISTS producto_favorito (
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (cod_usuario, cod_producto)
);

CREATE TABLE IF NOT EXISTS producto_resena (
    cod_resena BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    titulo VARCHAR(160),
    comentario TEXT,
    aprobado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_resena_usuario_producto UNIQUE (cod_usuario, cod_producto)
);

CREATE TABLE IF NOT EXISTS regla_limite_compra (
    cod_regla BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_categoria BIGINT REFERENCES categoria(cod_categoria) ON DELETE CASCADE,
    cod_producto BIGINT REFERENCES producto(cod_producto) ON DELETE CASCADE,
    limite_por_pedido INTEGER NOT NULL,
    limite_por_dia INTEGER,
    limite_por_mes INTEGER,
    requiere_revision BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_regla_limites CHECK (
        limite_por_pedido > 0
        AND (limite_por_dia IS NULL OR limite_por_dia >= limite_por_pedido)
        AND (limite_por_mes IS NULL OR limite_por_mes >= limite_por_pedido)
    ),
    CONSTRAINT chk_regla_objetivo CHECK (
        cod_categoria IS NOT NULL OR cod_producto IS NOT NULL
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_regla_limite_producto
ON regla_limite_compra(cod_producto)
WHERE cod_producto IS NOT NULL AND activo IS TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uk_regla_limite_categoria
ON regla_limite_compra(cod_categoria)
WHERE cod_categoria IS NOT NULL AND cod_producto IS NULL AND activo IS TRUE;

-- ============================================================
-- INVENTARIO
-- ============================================================

CREATE TABLE IF NOT EXISTS almacen (
    cod_almacen BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(120) NOT NULL,
    provincia VARCHAR(120) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inventario (
    cod_inventario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cod_almacen BIGINT NOT NULL REFERENCES almacen(cod_almacen) ON DELETE RESTRICT,
    stock_total INTEGER NOT NULL DEFAULT 0,
    stock_reservado INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    stock_maximo INTEGER,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_inventario_producto_almacen UNIQUE (cod_producto, cod_almacen),
    CONSTRAINT chk_inventario_stock CHECK (
        stock_total >= 0
        AND stock_reservado >= 0
        AND stock_reservado <= stock_total
        AND stock_minimo >= 0
        AND (stock_maximo IS NULL OR stock_maximo >= stock_minimo)
    )
);

CREATE INDEX IF NOT EXISTS ix_inventario_producto ON inventario(cod_producto);

CREATE TABLE IF NOT EXISTS movimiento_inventario (
    cod_movimiento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cod_almacen BIGINT NOT NULL REFERENCES almacen(cod_almacen) ON DELETE RESTRICT,
    cod_tipo_movimiento VARCHAR(30) NOT NULL REFERENCES tipo_movimiento_inventario(cod_tipo_movimiento) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    referencia_tipo VARCHAR(60),
    referencia_id BIGINT,
    stock_total_resultante INTEGER NOT NULL,
    stock_reservado_resultante INTEGER NOT NULL,
    observacion TEXT,
    fecha_movimiento TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reserva_inventario (
    cod_reserva BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cod_almacen BIGINT NOT NULL REFERENCES almacen(cod_almacen) ON DELETE RESTRICT,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE RESTRICT,
    cod_pedido BIGINT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA','CONSUMIDA','LIBERADA','EXPIRADA')),
    expira_en TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerta_stock (
    cod_alerta BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    cod_almacen BIGINT NOT NULL REFERENCES almacen(cod_almacen) ON DELETE CASCADE,
    tipo_alerta VARCHAR(40) NOT NULL CHECK (tipo_alerta IN ('STOCK_BAJO','SIN_STOCK','SOBRESTOCK')),
    mensaje TEXT NOT NULL,
    atendida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PROVEEDORES
-- ============================================================

CREATE TABLE IF NOT EXISTS proveedor (
    cod_proveedor BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ruc VARCHAR(40) NOT NULL UNIQUE,
    razon_social VARCHAR(180) NOT NULL,
    nombre_comercial VARCHAR(180),
    email VARCHAR(180) NOT NULL,
    telefono VARCHAR(30),
    direccion TEXT,
    ciudad VARCHAR(120),
    provincia VARCHAR(120),
    calificacion NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (calificacion BETWEEN 0 AND 5),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_proveedor_email CHECK (position('@' in email) > 1)
);

CREATE TABLE IF NOT EXISTS proveedor_contacto (
    cod_contacto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_proveedor BIGINT NOT NULL REFERENCES proveedor(cod_proveedor) ON DELETE CASCADE,
    nombre VARCHAR(160) NOT NULL,
    cargo VARCHAR(100),
    email VARCHAR(180),
    telefono VARCHAR(30),
    principal BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_proveedor_contacto_principal
ON proveedor_contacto(cod_proveedor)
WHERE principal IS TRUE;

CREATE TABLE IF NOT EXISTS producto_proveedor (
    cod_producto_proveedor BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    cod_proveedor BIGINT NOT NULL REFERENCES proveedor(cod_proveedor) ON DELETE CASCADE,
    sku_proveedor VARCHAR(100) NOT NULL,
    costo_unitario NUMERIC(12,2) NOT NULL,
    precio_sugerido NUMERIC(12,2),
    tiempo_entrega_dias INTEGER NOT NULL DEFAULT 3,
    prioridad INTEGER NOT NULL DEFAULT 100,
    pedido_minimo INTEGER NOT NULL DEFAULT 1,
    pedido_maximo INTEGER,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_producto_proveedor UNIQUE (cod_producto, cod_proveedor),
    CONSTRAINT chk_producto_proveedor_costos CHECK (
        costo_unitario > 0
        AND (precio_sugerido IS NULL OR precio_sugerido >= costo_unitario)
        AND tiempo_entrega_dias >= 0
        AND pedido_minimo > 0
        AND (pedido_maximo IS NULL OR pedido_maximo >= pedido_minimo)
    )
);

CREATE INDEX IF NOT EXISTS ix_producto_proveedor_producto ON producto_proveedor(cod_producto);
CREATE INDEX IF NOT EXISTS ix_producto_proveedor_proveedor ON producto_proveedor(cod_proveedor);

-- Relación explícita de acceso al portal proveedor. No se infiere desde email
-- ni desde JSON de perfil: una cuenta puede estar asociada a un proveedor.
CREATE TABLE IF NOT EXISTS usuario_proveedor (
    cod_usuario_proveedor BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE RESTRICT,
    cod_proveedor BIGINT NOT NULL REFERENCES proveedor(cod_proveedor) ON DELETE RESTRICT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_usuario_proveedor UNIQUE (cod_usuario, cod_proveedor)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_usuario_proveedor_activo
ON usuario_proveedor(cod_usuario)
WHERE activo IS TRUE;

CREATE TABLE IF NOT EXISTS proveedor_stock (
    cod_proveedor_stock BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto_proveedor BIGINT NOT NULL UNIQUE REFERENCES producto_proveedor(cod_producto_proveedor) ON DELETE CASCADE,
    cantidad_disponible INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_disponible >= 0),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orden_abastecimiento (
    cod_orden_abastecimiento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_proveedor BIGINT NOT NULL REFERENCES proveedor(cod_proveedor) ON DELETE RESTRICT,
    cod_pedido BIGINT,
    estado VARCHAR(30) NOT NULL DEFAULT 'GENERADA' CHECK (estado IN ('GENERADA','ENVIADA','ACEPTADA','RECIBIDA','CANCELADA')),
    total_estimado NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_estimado >= 0),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orden_abastecimiento_detalle (
    cod_orden_abastecimiento_detalle BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_orden_abastecimiento BIGINT NOT NULL REFERENCES orden_abastecimiento(cod_orden_abastecimiento) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(12,2) NOT NULL CHECK (costo_unitario > 0),
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED
);

CREATE TABLE IF NOT EXISTS historial_proveedor (
    cod_historial BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_proveedor BIGINT NOT NULL REFERENCES proveedor(cod_proveedor) ON DELETE CASCADE,
    evento VARCHAR(120) NOT NULL,
    descripcion TEXT,
    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- CARRITO, PEDIDOS, FACTURACIÓN, DEVOLUCIONES
-- ============================================================

CREATE TABLE IF NOT EXISTS carrito (
    cod_carrito BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    estado VARCHAR(30) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','CONVERTIDO','ABANDONADO','CANCELADO')),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_carrito_activo_usuario
ON carrito(cod_usuario)
WHERE estado = 'ACTIVO';

CREATE TABLE IF NOT EXISTS carrito_detalle (
    cod_carrito_detalle BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_carrito BIGINT NOT NULL REFERENCES carrito(cod_carrito) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_snapshot NUMERIC(12,2) NOT NULL CHECK (precio_unitario_snapshot > 0),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_carrito_producto UNIQUE (cod_carrito, cod_producto)
);

CREATE TABLE IF NOT EXISTS pedido (
    cod_pedido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_pedido VARCHAR(40) NOT NULL UNIQUE,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE RESTRICT,
    cod_direccion_envio BIGINT NOT NULL REFERENCES direccion_usuario(cod_direccion) ON DELETE RESTRICT,
    cod_estado_pedido VARCHAR(40) NOT NULL DEFAULT 'PENDIENTE_PAGO' REFERENCES estado_pedido(cod_estado_pedido) ON DELETE RESTRICT,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    descuento NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    costo_envio NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (costo_envio >= 0),
    total NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    es_premium BOOLEAN NOT NULL DEFAULT FALSE,
    requiere_abastecimiento BOOLEAN NOT NULL DEFAULT FALSE,
    observacion TEXT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_pedido_usuario ON pedido(cod_usuario);
CREATE INDEX IF NOT EXISTS ix_pedido_estado ON pedido(cod_estado_pedido);

CREATE TABLE IF NOT EXISTS pedido_detalle (
    cod_pedido_detalle BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pedido BIGINT NOT NULL REFERENCES pedido(cod_pedido) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal_linea NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (subtotal_linea >= 0),
    CONSTRAINT uk_pedido_producto UNIQUE (cod_pedido, cod_producto)
);

CREATE TABLE IF NOT EXISTS pedido_estado_historial (
    cod_historial BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pedido BIGINT NOT NULL REFERENCES pedido(cod_pedido) ON DELETE CASCADE,
    cod_estado_pedido VARCHAR(40) NOT NULL REFERENCES estado_pedido(cod_estado_pedido) ON DELETE RESTRICT,
    comentario TEXT,
    fecha_estado TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS factura (
    cod_factura BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pedido BIGINT NOT NULL UNIQUE REFERENCES pedido(cod_pedido) ON DELETE RESTRICT,
    numero_factura VARCHAR(40) NOT NULL UNIQUE,
    subtotal NUMERIC(12,2) NOT NULL,
    impuesto NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    fecha_emision TIMESTAMPTZ NOT NULL DEFAULT now(),
    estado VARCHAR(30) NOT NULL DEFAULT 'EMITIDA' CHECK (estado IN ('EMITIDA','ANULADA'))
);

CREATE TABLE IF NOT EXISTS devolucion (
    cod_devolucion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pedido BIGINT NOT NULL REFERENCES pedido(cod_pedido) ON DELETE RESTRICT,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE RESTRICT,
    motivo VARCHAR(160) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(30) NOT NULL DEFAULT 'SOLICITADA' CHECK (estado IN ('SOLICITADA','APROBADA','RECHAZADA','RECIBIDA','REEMBOLSADA')),
    monto_estimado NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_estimado >= 0),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devolucion_detalle (
    cod_devolucion_detalle BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_devolucion BIGINT NOT NULL REFERENCES devolucion(cod_devolucion) ON DELETE CASCADE,
    cod_pedido_detalle BIGINT NOT NULL REFERENCES pedido_detalle(cod_pedido_detalle) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    monto_linea NUMERIC(12,2) NOT NULL CHECK (monto_linea >= 0)
);

-- ============================================================
-- PAGOS SIMULADOS
-- ============================================================

CREATE TABLE IF NOT EXISTS bin_tarjeta (
    cod_bin BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    marca VARCHAR(40) NOT NULL,
    prefijo VARCHAR(10) NOT NULL UNIQUE,
    longitud_min SMALLINT NOT NULL DEFAULT 13,
    longitud_max SMALLINT NOT NULL DEFAULT 19,
    cvv_longitud SMALLINT NOT NULL DEFAULT 3,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_bin_longitudes CHECK (
        longitud_min > 0 AND longitud_max >= longitud_min AND cvv_longitud IN (3,4)
    )
);

CREATE TABLE IF NOT EXISTS metodo_pago (
    cod_metodo_pago BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL DEFAULT 'CREDITO' CHECK (tipo IN ('CREDITO','DEBITO','TARJETA')),
    marca VARCHAR(40) NOT NULL,
    bin6 VARCHAR(6) NOT NULL,
    ultimos4 VARCHAR(4) NOT NULL,
    token_simulado UUID NOT NULL DEFAULT gen_random_uuid(),
    titular VARCHAR(180) NOT NULL,
    exp_mes SMALLINT NOT NULL CHECK (exp_mes BETWEEN 1 AND 12),
    exp_anio SMALLINT NOT NULL CHECK (exp_anio BETWEEN 2024 AND 2100),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cuenta_simulada (
    cod_cuenta BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_metodo_pago BIGINT NOT NULL UNIQUE REFERENCES metodo_pago(cod_metodo_pago) ON DELETE CASCADE,
    saldo_disponible NUMERIC(12,2) NOT NULL CHECK (saldo_disponible >= 0),
    limite_diario NUMERIC(12,2) NOT NULL DEFAULT 1000 CHECK (limite_diario > 0),
    monto_usado_hoy NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_usado_hoy >= 0),
    fecha_uso DATE NOT NULL DEFAULT CURRENT_DATE,
    bloqueada BOOLEAN NOT NULL DEFAULT FALSE,
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS transaccion_pago (
    cod_transaccion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pedido BIGINT NOT NULL REFERENCES pedido(cod_pedido) ON DELETE RESTRICT,
    cod_metodo_pago BIGINT NOT NULL REFERENCES metodo_pago(cod_metodo_pago) ON DELETE RESTRICT,
    idempotency_key VARCHAR(120) NOT NULL UNIQUE,
    monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    cod_estado_pago VARCHAR(30) NOT NULL DEFAULT 'INICIADO' REFERENCES estado_pago(cod_estado_pago) ON DELETE RESTRICT,
    mensaje TEXT,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_transaccion_pedido ON transaccion_pago(cod_pedido);

CREATE TABLE IF NOT EXISTS autorizacion_pago (
    cod_autorizacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_transaccion BIGINT NOT NULL UNIQUE REFERENCES transaccion_pago(cod_transaccion) ON DELETE CASCADE,
    codigo_autorizacion VARCHAR(50) NOT NULL UNIQUE,
    monto_autorizado NUMERIC(12,2) NOT NULL CHECK (monto_autorizado > 0),
    fecha_autorizacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reembolso_pago (
    cod_reembolso BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_transaccion BIGINT NOT NULL REFERENCES transaccion_pago(cod_transaccion) ON DELETE RESTRICT,
    cod_devolucion BIGINT REFERENCES devolucion(cod_devolucion) ON DELETE SET NULL,
    monto NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    estado VARCHAR(30) NOT NULL DEFAULT 'PROCESADO' CHECK (estado IN ('PENDIENTE','PROCESADO','FALLIDO')),
    fecha_reembolso TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ENVÍOS Y TRACKING
-- ============================================================

CREATE TABLE IF NOT EXISTS transportista (
    cod_transportista BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    email VARCHAR(180),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS metodo_envio (
    cod_metodo_envio BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    dias_min INTEGER NOT NULL,
    dias_max INTEGER NOT NULL,
    costo_base NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (costo_base >= 0),
    es_premium_gratis BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_metodo_envio_dias CHECK (dias_min >= 0 AND dias_max >= dias_min)
);

CREATE TABLE IF NOT EXISTS zona_entrega (
    cod_zona BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ciudad VARCHAR(120) NOT NULL,
    provincia VARCHAR(120) NOT NULL,
    recargo NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (recargo >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_zona_entrega UNIQUE (ciudad, provincia)
);

CREATE TABLE IF NOT EXISTS envio (
    cod_envio BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pedido BIGINT NOT NULL UNIQUE REFERENCES pedido(cod_pedido) ON DELETE CASCADE,
    cod_transportista BIGINT REFERENCES transportista(cod_transportista) ON DELETE SET NULL,
    cod_metodo_envio BIGINT NOT NULL REFERENCES metodo_envio(cod_metodo_envio) ON DELETE RESTRICT,
    numero_tracking VARCHAR(60) NOT NULL UNIQUE,
    estado VARCHAR(40) NOT NULL DEFAULT 'CREADO',
    fecha_estimada_entrega DATE,
    fecha_entrega TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tracking_evento (
    cod_tracking_evento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_envio BIGINT NOT NULL REFERENCES envio(cod_envio) ON DELETE CASCADE,
    cod_tipo_evento VARCHAR(40) NOT NULL REFERENCES tipo_evento_tracking(cod_tipo_evento) ON DELETE RESTRICT,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(160),
    visible_cliente BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MEMBRESÍAS PREMIUM
-- ============================================================

CREATE TABLE IF NOT EXISTS plan_membresia (
    cod_plan BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    precio_mensual NUMERIC(12,2) NOT NULL CHECK (precio_mensual >= 0),
    duracion_dias INTEGER NOT NULL DEFAULT 30 CHECK (duracion_dias > 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS beneficio_membresia (
    cod_beneficio BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_plan BIGINT NOT NULL REFERENCES plan_membresia(cod_plan) ON DELETE CASCADE,
    codigo VARCHAR(80) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    valor NUMERIC(12,2),
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_beneficio_plan_codigo UNIQUE (cod_plan, codigo)
);

CREATE TABLE IF NOT EXISTS membresia_usuario (
    cod_membresia BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    cod_plan BIGINT NOT NULL REFERENCES plan_membresia(cod_plan) ON DELETE RESTRICT,
    cod_estado_membresia VARCHAR(30) NOT NULL DEFAULT 'ACTIVA' REFERENCES estado_membresia(cod_estado_membresia) ON DELETE RESTRICT,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NOT NULL,
    renovacion_automatica BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_membresia_fechas CHECK (fecha_fin >= fecha_inicio)
);

CREATE INDEX IF NOT EXISTS ix_membresia_usuario ON membresia_usuario(cod_usuario, cod_estado_membresia);

CREATE TABLE IF NOT EXISTS pago_membresia (
    cod_pago_membresia BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_membresia BIGINT NOT NULL REFERENCES membresia_usuario(cod_membresia) ON DELETE CASCADE,
    cod_transaccion BIGINT REFERENCES transaccion_pago(cod_transaccion) ON DELETE SET NULL,
    monto NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    fecha_pago TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compra_recurrente (
    cod_compra_recurrente BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    frecuencia_dias INTEGER NOT NULL CHECK (frecuencia_dias > 0),
    proxima_ejecucion DATE NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compra_recurrente_detalle (
    cod_compra_recurrente_detalle BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_compra_recurrente BIGINT NOT NULL REFERENCES compra_recurrente(cod_compra_recurrente) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    CONSTRAINT uk_compra_recurrente_producto UNIQUE (cod_compra_recurrente, cod_producto)
);

CREATE TABLE IF NOT EXISTS uso_beneficio (
    cod_uso_beneficio BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    cod_beneficio BIGINT NOT NULL REFERENCES beneficio_membresia(cod_beneficio) ON DELETE RESTRICT,
    cod_pedido BIGINT REFERENCES pedido(cod_pedido) ON DELETE SET NULL,
    valor_aplicado NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha_uso TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ANALÍTICA Y BI
-- ============================================================

CREATE TABLE IF NOT EXISTS log_busqueda (
    cod_log_busqueda BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT REFERENCES usuario(cod_usuario) ON DELETE SET NULL,
    termino VARCHAR(200) NOT NULL,
    resultados INTEGER NOT NULL DEFAULT 0,
    fecha_busqueda TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS log_producto_visto (
    cod_log_producto_visto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT REFERENCES usuario(cod_usuario) ON DELETE SET NULL,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    fecha_vista TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS log_carrito_abandonado (
    cod_log_carrito_abandonado BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_carrito BIGINT NOT NULL REFERENCES carrito(cod_carrito) ON DELETE CASCADE,
    total_estimado NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evento_recomendacion (
    cod_evento_recomendacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT REFERENCES usuario(cod_usuario) ON DELETE SET NULL,
    cod_producto_origen BIGINT REFERENCES producto(cod_producto) ON DELETE SET NULL,
    cod_producto_recomendado BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    motivo VARCHAR(120) NOT NULL,
    fecha_evento TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resumen_venta_diaria (
    fecha DATE PRIMARY KEY,
    total_pedidos INTEGER NOT NULL DEFAULT 0,
    total_ventas NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_clientes INTEGER NOT NULL DEFAULT 0,
    ticket_promedio NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS snapshot_kpi (
    cod_snapshot BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_kpi VARCHAR(120) NOT NULL,
    valor NUMERIC(14,2) NOT NULL,
    unidad VARCHAR(40),
    fecha_snapshot TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS segmento_cliente (
    cod_segmento BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    segmento VARCHAR(80) NOT NULL,
    motivo TEXT,
    fecha_segmentacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_segmento_usuario UNIQUE (cod_usuario, segmento)
);


-- ============================================================
-- MÓDULOS COMPLEMENTARIOS RETAIL PRIME
-- Promociones, cupones, notificaciones, soporte, biblioteca digital y listas.
-- ============================================================

CREATE TABLE IF NOT EXISTS historial_precio_producto (
    cod_historial_precio BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    precio_anterior NUMERIC(12,2) NOT NULL CHECK (precio_anterior >= 0),
    precio_nuevo NUMERIC(12,2) NOT NULL CHECK (precio_nuevo >= 0),
    motivo TEXT,
    fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_historial_precio_producto
ON historial_precio_producto(cod_producto, fecha_cambio DESC);

CREATE TABLE IF NOT EXISTS promocion (
    cod_promocion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(60) NOT NULL UNIQUE,
    nombre VARCHAR(160) NOT NULL,
    descripcion TEXT,
    tipo_descuento VARCHAR(20) NOT NULL CHECK (tipo_descuento IN ('PORCENTAJE','MONTO')),
    valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    acumulable BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_promocion_fechas CHECK (fecha_fin > fecha_inicio),
    CONSTRAINT chk_promocion_valor CHECK (
        (tipo_descuento = 'PORCENTAJE' AND valor <= 100)
        OR tipo_descuento = 'MONTO'
    )
);

CREATE TABLE IF NOT EXISTS promocion_producto (
    cod_promocion BIGINT NOT NULL REFERENCES promocion(cod_promocion) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    PRIMARY KEY (cod_promocion, cod_producto)
);

CREATE TABLE IF NOT EXISTS cupon (
    cod_cupon BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR(60) NOT NULL UNIQUE,
    nombre VARCHAR(160) NOT NULL,
    descripcion TEXT,
    tipo_descuento VARCHAR(20) NOT NULL CHECK (tipo_descuento IN ('PORCENTAJE','MONTO')),
    valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    monto_minimo NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_minimo >= 0),
    usos_maximos INTEGER CHECK (usos_maximos IS NULL OR usos_maximos > 0),
    usos_por_usuario INTEGER NOT NULL DEFAULT 1 CHECK (usos_por_usuario > 0),
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_cupon_fechas CHECK (fecha_fin > fecha_inicio),
    CONSTRAINT chk_cupon_valor CHECK (
        (tipo_descuento = 'PORCENTAJE' AND valor <= 100)
        OR tipo_descuento = 'MONTO'
    )
);

CREATE TABLE IF NOT EXISTS cupon_uso (
    cod_cupon_uso BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_cupon BIGINT NOT NULL REFERENCES cupon(cod_cupon) ON DELETE RESTRICT,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE RESTRICT,
    cod_pedido BIGINT NOT NULL REFERENCES pedido(cod_pedido) ON DELETE CASCADE,
    valor_aplicado NUMERIC(12,2) NOT NULL CHECK (valor_aplicado >= 0),
    fecha_uso TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_cupon_pedido UNIQUE (cod_cupon, cod_pedido)
);

CREATE INDEX IF NOT EXISTS ix_cupon_uso_usuario ON cupon_uso(cod_usuario, cod_cupon);

CREATE TABLE IF NOT EXISTS notificacion (
    cod_notificacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    tipo VARCHAR(60) NOT NULL,
    titulo VARCHAR(180) NOT NULL,
    mensaje TEXT NOT NULL,
    url_accion TEXT,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_lectura TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_notificacion_usuario_leida
ON notificacion(cod_usuario, leida, fecha_creacion DESC);

CREATE TABLE IF NOT EXISTS cola_email (
    cod_email BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT REFERENCES usuario(cod_usuario) ON DELETE SET NULL,
    destinatario VARCHAR(180) NOT NULL,
    asunto VARCHAR(220) NOT NULL,
    cuerpo TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','ENVIADO','FALLIDO','CANCELADO')),
    intentos INTEGER NOT NULL DEFAULT 0 CHECK (intentos >= 0),
    error_ultimo TEXT,
    fecha_programada TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_envio TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_cola_email_destinatario CHECK (position('@' in destinatario) > 1)
);

CREATE INDEX IF NOT EXISTS ix_cola_email_estado_programada
ON cola_email(estado, fecha_programada);

CREATE TABLE IF NOT EXISTS soporte_ticket (
    cod_ticket BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    asunto VARCHAR(180) NOT NULL,
    categoria VARCHAR(80) NOT NULL DEFAULT 'GENERAL',
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA','MEDIA','ALTA','CRITICA')),
    estado VARCHAR(30) NOT NULL DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO','EN_PROCESO','ESPERANDO_CLIENTE','CERRADO','CANCELADO')),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_soporte_ticket_usuario_estado
ON soporte_ticket(cod_usuario, estado, fecha_creacion DESC);

CREATE TABLE IF NOT EXISTS soporte_ticket_mensaje (
    cod_ticket_mensaje BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_ticket BIGINT NOT NULL REFERENCES soporte_ticket(cod_ticket) ON DELETE CASCADE,
    cod_usuario BIGINT REFERENCES usuario(cod_usuario) ON DELETE SET NULL,
    mensaje TEXT NOT NULL,
    interno BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS producto_pregunta (
    cod_pregunta BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    pregunta TEXT NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','RESPONDIDA','OCULTA')),
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS producto_respuesta (
    cod_respuesta BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pregunta BIGINT NOT NULL UNIQUE REFERENCES producto_pregunta(cod_pregunta) ON DELETE CASCADE,
    cod_usuario BIGINT REFERENCES usuario(cod_usuario) ON DELETE SET NULL,
    respuesta TEXT NOT NULL,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlist (
    cod_wishlist BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL DEFAULT 'Mi lista',
    es_predeterminada BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_wishlist_usuario_nombre UNIQUE (cod_usuario, nombre)
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_wishlist_predeterminada_usuario
ON wishlist(cod_usuario)
WHERE es_predeterminada IS TRUE AND activo IS TRUE;

CREATE TABLE IF NOT EXISTS wishlist_detalle (
    cod_wishlist BIGINT NOT NULL REFERENCES wishlist(cod_wishlist) ON DELETE CASCADE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE CASCADE,
    fecha_agregado TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (cod_wishlist, cod_producto)
);

CREATE TABLE IF NOT EXISTS contenido_digital (
    cod_contenido BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    tipo VARCHAR(40) NOT NULL CHECK (tipo IN ('EBOOK','VIDEO','GUIA','AUDIO')),
    descripcion TEXT,
    url_contenido TEXT NOT NULL,
    cod_producto BIGINT REFERENCES producto(cod_producto) ON DELETE SET NULL,
    requiere_premium BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS biblioteca_usuario (
    cod_biblioteca BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_usuario BIGINT NOT NULL REFERENCES usuario(cod_usuario) ON DELETE CASCADE,
    cod_contenido BIGINT NOT NULL REFERENCES contenido_digital(cod_contenido) ON DELETE CASCADE,
    fecha_agregado TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_expiracion DATE,
    CONSTRAINT uk_biblioteca_usuario_contenido UNIQUE (cod_usuario, cod_contenido)
);

-- ============================================================
-- FASE A: PRECIO POR LOTE, FIFO Y REPOSICIÓN
-- ============================================================
CREATE TABLE IF NOT EXISTS regla_precio (
    cod_regla_precio BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_producto BIGINT REFERENCES producto(cod_producto) ON DELETE CASCADE,
    cod_categoria BIGINT REFERENCES categoria(cod_categoria) ON DELETE CASCADE,
    margen_porcentaje NUMERIC(8,4) NOT NULL DEFAULT 0,
    costo_operativo_porcentaje NUMERIC(8,4) NOT NULL DEFAULT 0,
    costo_fijo_unitario NUMERIC(12,4) NOT NULL DEFAULT 0,
    porcentaje_impuesto NUMERIC(8,4),
    prioridad INTEGER NOT NULL DEFAULT 100,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_regla_precio_objetivo CHECK (num_nonnulls(cod_producto, cod_categoria) <= 1),
    CONSTRAINT chk_regla_precio_importes CHECK (
        margen_porcentaje >= 0 AND costo_operativo_porcentaje >= 0
        AND costo_fijo_unitario >= 0 AND (porcentaje_impuesto IS NULL OR porcentaje_impuesto >= 0)
    ),
    CONSTRAINT chk_regla_precio_fechas CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin > fecha_inicio)
);

-- La regla global no tiene producto ni categoría. Los índices parciales
-- evitan dos reglas activas ambiguas con igual prioridad y mismo objetivo.
CREATE UNIQUE INDEX IF NOT EXISTS uk_regla_precio_producto_prioridad_activa
ON regla_precio(cod_producto, prioridad)
WHERE activo IS TRUE AND cod_producto IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_regla_precio_categoria_prioridad_activa
ON regla_precio(cod_categoria, prioridad)
WHERE activo IS TRUE AND cod_categoria IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uk_regla_precio_global_prioridad_activa
ON regla_precio(prioridad)
WHERE activo IS TRUE AND cod_producto IS NULL AND cod_categoria IS NULL;

CREATE TABLE IF NOT EXISTS lote_inventario (
    cod_lote BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_lote VARCHAR(80) NOT NULL UNIQUE,
    cod_producto BIGINT NOT NULL REFERENCES producto(cod_producto) ON DELETE RESTRICT,
    cod_almacen BIGINT NOT NULL REFERENCES almacen(cod_almacen) ON DELETE RESTRICT,
    cod_proveedor BIGINT REFERENCES proveedor(cod_proveedor) ON DELETE SET NULL,
    cod_orden_abastecimiento_detalle BIGINT REFERENCES orden_abastecimiento_detalle(cod_orden_abastecimiento_detalle) ON DELETE SET NULL,
    cantidad_recibida INTEGER NOT NULL,
    cantidad_disponible INTEGER NOT NULL,
    cantidad_reservada INTEGER NOT NULL DEFAULT 0,
    costo_unitario NUMERIC(12,4) NOT NULL,
    margen_porcentaje_aplicado NUMERIC(8,4) NOT NULL DEFAULT 0,
    costo_operativo_aplicado NUMERIC(8,4) NOT NULL DEFAULT 0,
    porcentaje_impuesto_aplicado NUMERIC(8,4) NOT NULL DEFAULT 0,
    pvp_unitario NUMERIC(12,2) NOT NULL,
    fecha_recepcion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_vencimiento TIMESTAMPTZ,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_lote_cantidades CHECK (
        cantidad_recibida >= 0 AND cantidad_disponible >= 0 AND cantidad_reservada >= 0
        AND cantidad_disponible <= cantidad_recibida AND cantidad_reservada <= cantidad_disponible
    ),
    CONSTRAINT chk_lote_costo_pvp CHECK (costo_unitario > 0 AND pvp_unitario > 0),
    CONSTRAINT chk_lote_estado CHECK (estado IN ('ACTIVO','AGOTADO','BLOQUEADO','ANULADO')),
    CONSTRAINT chk_lote_vencimiento CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento >= fecha_recepcion)
);
CREATE INDEX IF NOT EXISTS ix_lote_inventario_fifo
ON lote_inventario(cod_producto, cod_almacen, estado, fecha_recepcion, cod_lote);

CREATE TABLE IF NOT EXISTS pedido_detalle_lote (
    cod_pedido_detalle_lote BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_pedido_detalle BIGINT NOT NULL REFERENCES pedido_detalle(cod_pedido_detalle) ON DELETE RESTRICT,
    cod_lote BIGINT NOT NULL REFERENCES lote_inventario(cod_lote) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    costo_unitario_historico NUMERIC(12,4) NOT NULL CHECK (costo_unitario_historico > 0),
    pvp_unitario_historico NUMERIC(12,2) NOT NULL CHECK (pvp_unitario_historico > 0),
    descuento_unitario NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (descuento_unitario >= 0),
    precio_final_unitario NUMERIC(12,2) NOT NULL CHECK (precio_final_unitario > 0),
    subtotal_linea_lote NUMERIC(12,2) GENERATED ALWAYS AS (ROUND(cantidad * precio_final_unitario, 2)) STORED,
    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_pedido_detalle_lote UNIQUE (cod_pedido_detalle, cod_lote)
);

ALTER TABLE reserva_inventario
    ADD COLUMN IF NOT EXISTS cod_lote BIGINT,
    ADD COLUMN IF NOT EXISTS cod_pedido_detalle BIGINT,
    ADD COLUMN IF NOT EXISTS estado_reserva VARCHAR(30) NOT NULL DEFAULT 'ACTIVA',
    ADD COLUMN IF NOT EXISTS fecha_expiracion TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes');
ALTER TABLE reserva_inventario
    ADD CONSTRAINT fk_reserva_inventario_lote FOREIGN KEY (cod_lote) REFERENCES lote_inventario(cod_lote) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_reserva_inventario_pedido_detalle FOREIGN KEY (cod_pedido_detalle) REFERENCES pedido_detalle(cod_pedido_detalle) ON DELETE SET NULL,
    ADD CONSTRAINT chk_reserva_inventario_estado_reserva CHECK (estado_reserva IN ('ACTIVA','CONSUMIDA','LIBERADA','EXPIRADA'));
CREATE INDEX IF NOT EXISTS ix_reserva_inventario_lote_estado ON reserva_inventario(cod_lote, estado_reserva);
CREATE INDEX IF NOT EXISTS ix_reserva_inventario_pedido_estado ON reserva_inventario(cod_pedido, estado_reserva);

ALTER TABLE orden_abastecimiento
    ADD COLUMN IF NOT EXISTS cod_almacen BIGINT,
    ADD CONSTRAINT fk_orden_abastecimiento_almacen FOREIGN KEY (cod_almacen) REFERENCES almacen(cod_almacen) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS ix_orden_abastecimiento_abierta_reposicion
ON orden_abastecimiento(cod_almacen, cod_proveedor, estado)
WHERE estado IN ('GENERADA','ENVIADA','ACEPTADA');
CREATE INDEX IF NOT EXISTS ix_orden_abastecimiento_detalle_producto
ON orden_abastecimiento_detalle(cod_producto, cod_orden_abastecimiento);

-- ============================================================
-- FASE B: PRECIO FINAL, ENVÍO, IMPUESTO, FACTURA Y PAGOS
-- ============================================================
ALTER TABLE pedido
    ADD COLUMN IF NOT EXISTS cod_metodo_envio BIGINT,
    ADD COLUMN IF NOT EXISTS cod_zona_entrega BIGINT,
    ADD COLUMN IF NOT EXISTS impuesto NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tasa_impuesto NUMERIC(8,4) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS fecha_estimada_entrega TIMESTAMPTZ;
ALTER TABLE pedido
    ADD CONSTRAINT fk_pedido_metodo_envio FOREIGN KEY (cod_metodo_envio) REFERENCES metodo_envio(cod_metodo_envio) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_pedido_zona_entrega FOREIGN KEY (cod_zona_entrega) REFERENCES zona_entrega(cod_zona) ON DELETE RESTRICT,
    ADD CONSTRAINT chk_pedido_impuesto CHECK (impuesto >= 0 AND tasa_impuesto >= 0);

ALTER TABLE pedido_detalle
    ADD COLUMN IF NOT EXISTS precio_base_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS descuento_promocion_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS descuento_prime_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS descuento_cupon_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS precio_final_unitario NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE pedido_detalle
    ADD CONSTRAINT chk_pedido_detalle_descuentos CHECK (
        precio_base_unitario >= 0 AND descuento_promocion_unitario >= 0
        AND descuento_prime_unitario >= 0 AND descuento_cupon_unitario >= 0
        AND precio_final_unitario >= 0
    );

ALTER TABLE factura
    ADD COLUMN IF NOT EXISTS descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tasa_impuesto NUMERIC(8,4) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS costo_envio NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE factura
    ADD CONSTRAINT chk_factura_importes_fase_b CHECK (descuento >= 0 AND impuesto >= 0 AND tasa_impuesto >= 0 AND costo_envio >= 0 AND total >= 0);

CREATE INDEX IF NOT EXISTS ix_pedido_metodo_zona ON pedido(cod_metodo_envio, cod_zona_entrega);

-- ============================================================
-- FASE C: TRACKING PERSISTENTE Y MANTENIMIENTO
-- ============================================================
CREATE TABLE IF NOT EXISTS tracking_evento_programado (
    cod_programacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cod_envio BIGINT NOT NULL REFERENCES envio(cod_envio) ON DELETE RESTRICT,
    cod_tipo_evento VARCHAR(40) NOT NULL REFERENCES tipo_evento_tracking(cod_tipo_evento) ON DELETE RESTRICT,
    descripcion TEXT NOT NULL,
    ubicacion TEXT,
    fecha_programada TIMESTAMPTZ NOT NULL,
    procesado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_procesado TIMESTAMPTZ,
    orden INTEGER NOT NULL,
    visible_cliente BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_tracking_programado_envio_orden UNIQUE (cod_envio, orden),
    CONSTRAINT chk_tracking_programado_orden CHECK (orden > 0),
    CONSTRAINT chk_tracking_programado_procesado CHECK ((procesado IS FALSE AND fecha_procesado IS NULL) OR (procesado IS TRUE AND fecha_procesado IS NOT NULL))
);
ALTER TABLE tracking_evento ADD COLUMN IF NOT EXISTS orden INTEGER;
ALTER TABLE envio ADD COLUMN IF NOT EXISTS estado_envio VARCHAR(40);
ALTER TABLE envio ADD CONSTRAINT chk_envio_estado_fase_c CHECK (estado_envio IS NULL OR estado_envio IN ('CREADO','PREPARANDO','LISTO_ENVIO','ENVIADO','EN_TRANSITO','CENTRO_LOCAL','EN_REPARTO','ENTREGADO','CANCELADO'));
CREATE INDEX IF NOT EXISTS ix_tracking_programado_pendiente ON tracking_evento_programado(procesado, fecha_programada);
CREATE INDEX IF NOT EXISTS ix_tracking_programado_envio_orden ON tracking_evento_programado(cod_envio, orden);
CREATE INDEX IF NOT EXISTS ix_reserva_estado_expiracion ON reserva_inventario(estado_reserva, fecha_expiracion);
CREATE INDEX IF NOT EXISTS ix_pedido_impago_vencido ON pedido(cod_estado_pedido, fecha_creacion) WHERE cod_estado_pedido IN ('PENDIENTE_PAGO','PAGO_AUTORIZADO');
CREATE INDEX IF NOT EXISTS ix_carrito_abandono ON carrito(estado, fecha_actualizacion) WHERE estado='ACTIVO';

-- Claves foráneas diferidas por orden de creación de tablas base.
ALTER TABLE reserva_inventario
    ADD CONSTRAINT fk_reserva_inventario_pedido
    FOREIGN KEY (cod_pedido) REFERENCES pedido(cod_pedido) ON DELETE SET NULL;

ALTER TABLE orden_abastecimiento
    ADD CONSTRAINT fk_orden_abastecimiento_pedido
    FOREIGN KEY (cod_pedido) REFERENCES pedido(cod_pedido) ON DELETE SET NULL;

COMMIT;
