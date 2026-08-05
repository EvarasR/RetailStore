

-- ============================================================
-- datos.sql
-- Sistema Retail Prime - PostgreSQL 15
-- Contiene: datos estáticos, datos de prueba y escenarios demo.
-- Ejecutar al final.
-- ============================================================

-- ============================================================
-- 06_seed_static.sql
-- Datos estáticos del sistema Retail Prime
-- ============================================================

BEGIN;

-- Provincias y cantones de Ecuador para direcciones de entrega.
-- Fuente de referencia: división administrativa nacional Ecuador, 24 provincias y cantones.
INSERT INTO provincia(cod_provincia, nombre) VALUES
(1,'Azuay'),
(2,'Bolívar'),
(3,'Cañar'),
(4,'Carchi'),
(5,'Cotopaxi'),
(6,'Chimborazo'),
(7,'El Oro'),
(8,'Esmeraldas'),
(9,'Guayas'),
(10,'Imbabura'),
(11,'Loja'),
(12,'Los Ríos'),
(13,'Manabí'),
(14,'Morona Santiago'),
(15,'Napo'),
(16,'Pastaza'),
(17,'Pichincha'),
(18,'Tungurahua'),
(19,'Zamora Chinchipe'),
(20,'Galápagos'),
(21,'Sucumbíos'),
(22,'Orellana'),
(23,'Santo Domingo de los Tsáchilas'),
(24,'Santa Elena')
ON CONFLICT (cod_provincia) DO UPDATE SET nombre = EXCLUDED.nombre, activo = TRUE;

INSERT INTO canton(cod_provincia, nombre) VALUES
(1,'Cuenca'),
(1,'Girón'),
(1,'Gualaceo'),
(1,'Nabón'),
(1,'Paute'),
(1,'Pucará'),
(1,'San Fernando'),
(1,'Santa Isabel'),
(1,'Sígsig'),
(1,'Oña'),
(1,'Chordeleg'),
(1,'El Pan'),
(1,'Sevilla de Oro'),
(1,'Guachapala'),
(1,'Camilo Ponce Enríquez'),
(2,'Guaranda'),
(2,'Chillanes'),
(2,'Chimbo'),
(2,'Echeandía'),
(2,'San Miguel'),
(2,'Caluma'),
(2,'Las Naves'),
(3,'Azogues'),
(3,'Biblián'),
(3,'Cañar'),
(3,'La Troncal'),
(3,'El Tambo'),
(3,'Déleg'),
(3,'Suscal'),
(4,'Tulcán'),
(4,'Bolívar'),
(4,'Espejo'),
(4,'Mira'),
(4,'Montúfar'),
(4,'San Pedro de Huaca'),
(5,'Latacunga'),
(5,'La Maná'),
(5,'Pangua'),
(5,'Pujilí'),
(5,'Salcedo'),
(5,'Saquisilí'),
(5,'Sigchos'),
(6,'Riobamba'),
(6,'Alausí'),
(6,'Colta'),
(6,'Chambo'),
(6,'Chunchi'),
(6,'Guamote'),
(6,'Guano'),
(6,'Pallatanga'),
(6,'Penipe'),
(6,'Cumandá'),
(7,'Machala'),
(7,'Arenillas'),
(7,'Atahualpa'),
(7,'Balsas'),
(7,'Chilla'),
(7,'El Guabo'),
(7,'Huaquillas'),
(7,'Marcabelí'),
(7,'Pasaje'),
(7,'Piñas'),
(7,'Portovelo'),
(7,'Santa Rosa'),
(7,'Zaruma'),
(7,'Las Lajas'),
(8,'Esmeraldas'),
(8,'Eloy Alfaro'),
(8,'Muisne'),
(8,'Quinindé'),
(8,'San Lorenzo'),
(8,'Atacames'),
(8,'Rioverde'),
(9,'Guayaquil'),
(9,'Alfredo Baquerizo Moreno (Jujan)'),
(9,'Balao'),
(9,'Balzar'),
(9,'Colimes'),
(9,'Daule'),
(9,'Durán'),
(9,'El Empalme'),
(9,'El Triunfo'),
(9,'Milagro'),
(9,'Naranjal'),
(9,'Naranjito'),
(9,'Palestina'),
(9,'Pedro Carbo'),
(9,'Samborondón'),
(9,'Santa Lucía'),
(9,'Salitre'),
(9,'San Jacinto de Yaguachi'),
(9,'Playas'),
(9,'Simón Bolívar'),
(9,'Coronel Marcelino Maridueña'),
(9,'Lomas de Sargentillo'),
(9,'Nobol'),
(9,'General Antonio Elizalde (Bucay)'),
(9,'Isidro Ayora'),
(10,'Ibarra'),
(10,'Antonio Ante'),
(10,'Cotacachi'),
(10,'Otavalo'),
(10,'Pimampiro'),
(10,'San Miguel de Urcuquí'),
(11,'Loja'),
(11,'Calvas'),
(11,'Catamayo'),
(11,'Celica'),
(11,'Chaguarpamba'),
(11,'Espíndola'),
(11,'Gonzanamá'),
(11,'Macará'),
(11,'Paltas'),
(11,'Puyango'),
(11,'Saraguro'),
(11,'Sozoranga'),
(11,'Zapotillo'),
(11,'Pindal'),
(11,'Quilanga'),
(11,'Olmedo'),
(12,'Babahoyo'),
(12,'Baba'),
(12,'Montalvo'),
(12,'Puebloviejo'),
(12,'Quevedo'),
(12,'Urdaneta'),
(12,'Ventanas'),
(12,'Vinces'),
(12,'Palenque'),
(12,'Buena Fe'),
(12,'Valencia'),
(12,'Mocache'),
(12,'Quinsaloma'),
(13,'Portoviejo'),
(13,'Bolívar'),
(13,'Chone'),
(13,'El Carmen'),
(13,'Flavio Alfaro'),
(13,'Jipijapa'),
(13,'Junín'),
(13,'Manta'),
(13,'Montecristi'),
(13,'Paján'),
(13,'Pichincha'),
(13,'Rocafuerte'),
(13,'Santa Ana'),
(13,'Sucre'),
(13,'Tosagua'),
(13,'24 de Mayo'),
(13,'Pedernales'),
(13,'Olmedo'),
(13,'Puerto López'),
(13,'Jama'),
(13,'Jaramijó'),
(13,'San Vicente'),
(14,'Morona'),
(14,'Gualaquiza'),
(14,'Limón Indanza'),
(14,'Palora'),
(14,'Santiago'),
(14,'Sucúa'),
(14,'Huamboya'),
(14,'San Juan Bosco'),
(14,'Taisha'),
(14,'Logroño'),
(14,'Pablo Sexto'),
(14,'Tiwintza'),
(15,'Tena'),
(15,'Archidona'),
(15,'El Chaco'),
(15,'Quijos'),
(15,'Carlos Julio Arosemena Tola'),
(16,'Pastaza'),
(16,'Mera'),
(16,'Santa Clara'),
(16,'Arajuno'),
(17,'Quito'),
(17,'Cayambe'),
(17,'Mejía'),
(17,'Pedro Moncayo'),
(17,'Rumiñahui'),
(17,'San Miguel de los Bancos'),
(17,'Pedro Vicente Maldonado'),
(17,'Puerto Quito'),
(18,'Ambato'),
(18,'Baños de Agua Santa'),
(18,'Cevallos'),
(18,'Mocha'),
(18,'Patate'),
(18,'Quero'),
(18,'San Pedro de Pelileo'),
(18,'Santiago de Píllaro'),
(18,'Tisaleo'),
(19,'Zamora'),
(19,'Chinchipe'),
(19,'Nangaritza'),
(19,'Yacuambi'),
(19,'Yantzaza'),
(19,'El Pangui'),
(19,'Centinela del Cóndor'),
(19,'Palanda'),
(19,'Paquisha'),
(20,'San Cristóbal'),
(20,'Isabela'),
(20,'Santa Cruz'),
(21,'Lago Agrio'),
(21,'Gonzalo Pizarro'),
(21,'Putumayo'),
(21,'Shushufindi'),
(21,'Sucumbíos'),
(21,'Cascales'),
(21,'Cuyabeno'),
(22,'Francisco de Orellana'),
(22,'Aguarico'),
(22,'La Joya de los Sachas'),
(22,'Loreto'),
(23,'Santo Domingo'),
(23,'La Concordia'),
(24,'Santa Elena'),
(24,'La Libertad'),
(24,'Salinas')
ON CONFLICT (cod_provincia, nombre) DO UPDATE SET activo = TRUE;

-- Estados de producto
INSERT INTO estado_producto(cod_estado_producto, nombre, descripcion) VALUES
('BORRADOR','Borrador','Producto creado pero no visible'),
('EN_REVISION','En revisión','Producto pendiente de revisión'),
('PUBLICADO','Publicado','Producto visible para compra'),
('PAUSADO','Pausado','Producto temporalmente oculto'),
('DESACTIVADO','Desactivado','Producto retirado del catálogo')
ON CONFLICT (cod_estado_producto) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

-- Estados de pedido
INSERT INTO estado_pedido(cod_estado_pedido, nombre, orden, genera_tracking) VALUES
('PENDIENTE_PAGO','Pendiente de pago',10,TRUE),
('PAGO_AUTORIZADO','Pago autorizado',20,TRUE),
('PREPARANDO','Preparando pedido',30,TRUE),
('ESPERANDO_PROVEEDOR','Esperando proveedor',35,TRUE),
('LISTO_ENVIO','Listo para envío',40,TRUE),
('ENVIADO','Enviado',50,TRUE),
('EN_TRANSITO','En tránsito',60,TRUE),
('EN_REPARTO','En reparto',70,TRUE),
('ENTREGADO','Entregado',80,TRUE),
('CANCELADO','Cancelado',90,TRUE),
('DEVOLUCION_SOLICITADA','Devolución solicitada',100,TRUE),
('DEVUELTO','Devuelto',110,TRUE),
('REEMBOLSADO','Reembolsado',120,TRUE)
ON CONFLICT (cod_estado_pedido) DO UPDATE SET nombre = EXCLUDED.nombre, orden = EXCLUDED.orden, genera_tracking = EXCLUDED.genera_tracking;

-- Estados de pago
INSERT INTO estado_pago(cod_estado_pago, nombre) VALUES
('INICIADO','Iniciado'),
('AUTORIZADO','Autorizado'),
('RECHAZADO','Rechazado'),
('CAPTURADO','Capturado'),
('FALLIDO','Fallido'),
('REEMBOLSADO','Reembolsado'),
('ANULADO','Anulado')
ON CONFLICT (cod_estado_pago) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Estados membresía
INSERT INTO estado_membresia(cod_estado_membresia, nombre) VALUES
('ACTIVA','Activa'),
('EXPIRADA','Expirada'),
('CANCELADA','Cancelada'),
('SUSPENDIDA','Suspendida')
ON CONFLICT (cod_estado_membresia) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Tipos movimiento
INSERT INTO tipo_movimiento_inventario(cod_tipo_movimiento, nombre, signo) VALUES
('ENTRADA','Entrada de stock',1),
('SALIDA','Salida de stock',-1),
('RESERVA','Reserva de stock',0),
('LIBERACION','Liberación de reserva',0),
('CONSUMO_RESERVA','Consumo de reserva',-1),
('AJUSTE','Ajuste manual',0)
ON CONFLICT (cod_tipo_movimiento) DO UPDATE SET nombre = EXCLUDED.nombre, signo = EXCLUDED.signo;

-- Tipos tracking
INSERT INTO tipo_evento_tracking(cod_tipo_evento, nombre, descripcion) VALUES
('ORDER_RECEIVED','Pedido recibido','El pedido fue registrado en el sistema'),
('PAYMENT_CONFIRMED','Pago confirmado','El pago fue autorizado o confirmado'),
('PREPARING_PACKAGE','Preparando paquete','El pedido está siendo preparado'),
('SUPPLIER_PENDING','Esperando proveedor','El pedido requiere abastecimiento externo'),
('PACKAGE_READY','Paquete listo','El paquete está listo para retiro del transportista'),
('PICKED_UP','Retirado por transportista','El transportista recogió el paquete'),
('IN_TRANSIT','En tránsito','El paquete está en ruta'),
('ARRIVED_LOCAL_CENTER','Llegó a centro local','El paquete llegó al centro de distribución local'),
('OUT_FOR_DELIVERY','En reparto','El paquete salió a reparto'),
('DELIVERED','Entregado','El paquete fue entregado'),
('FAILED_DELIVERY','Entrega fallida','No se pudo completar la entrega'),
('ORDER_CANCELLED','Pedido cancelado','El pedido fue cancelado'),
('RETURNING','Retornando','El producto está en proceso de devolución'),
('RETURNED','Devuelto','El producto fue devuelto'),
('REFUNDED','Reembolsado','El pedido fue reembolsado')
ON CONFLICT (cod_tipo_evento) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

-- Roles
INSERT INTO rol(nombre, descripcion) VALUES
('CUSTOMER','Cliente retail final'),
('PREMIUM_CUSTOMER','Cliente con membresía premium tipo Prime'),
('ADMIN','Administrador general del sistema'),
('WAREHOUSE_MANAGER','Responsable de inventario y almacenes'),
('SUPPLIER_MANAGER','Responsable de proveedores y abastecimiento'),
('SUPPORT','Soporte al cliente')
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- Permisos base
INSERT INTO permiso(codigo, nombre, descripcion) VALUES
('usuarios.ver','Ver usuarios','Permite consultar usuarios'),
('usuarios.gestionar','Gestionar usuarios','Permite crear/editar/desactivar usuarios'),
('catalogo.ver','Ver catálogo','Permite consultar catálogo'),
('catalogo.gestionar','Gestionar catálogo','Permite gestionar productos, categorías y marcas'),
('inventario.ver','Ver inventario','Permite consultar inventario'),
('inventario.gestionar','Gestionar inventario','Permite modificar inventario'),
('proveedores.ver','Ver proveedores','Permite consultar proveedores'),
('proveedores.gestionar','Gestionar proveedores','Permite gestionar proveedores y abastecimiento'),
('pedidos.ver','Ver pedidos','Permite consultar pedidos'),
('pedidos.gestionar','Gestionar pedidos','Permite actualizar estados de pedidos'),
('pagos.simular','Simular pagos','Permite ejecutar pagos simulados'),
('reportes.ver','Ver reportes','Permite consultar dashboards y KPIs')
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

-- Asignación de permisos a roles
INSERT INTO rol_permiso(cod_rol, cod_permiso)
SELECT r.cod_rol, p.cod_permiso
FROM rol r
JOIN permiso p ON
    (r.nombre IN ('ADMIN') AND TRUE)
    OR (r.nombre = 'WAREHOUSE_MANAGER' AND p.codigo IN ('catalogo.ver','inventario.ver','inventario.gestionar','pedidos.ver'))
    OR (r.nombre = 'SUPPLIER_MANAGER' AND p.codigo IN ('proveedores.ver','proveedores.gestionar','catalogo.ver','pedidos.ver'))
    OR (r.nombre = 'SUPPORT' AND p.codigo IN ('usuarios.ver','pedidos.ver','pedidos.gestionar','catalogo.ver'))
    OR (r.nombre IN ('CUSTOMER','PREMIUM_CUSTOMER') AND p.codigo IN ('catalogo.ver','pedidos.ver','pagos.simular'))
ON CONFLICT DO NOTHING;

-- Parámetros de sistema
INSERT INTO parametro_sistema(clave, valor, descripcion) VALUES
('MONEDA_BASE','USD','Moneda base de la tienda'),
('IVA_PORCENTAJE','12','Impuesto simulado usado para facturación'),
('MIN_PROVEEDORES_PRODUCTO_PUBLICADO','5','Mínimo de proveedores activos para publicar producto'),
('CHECKOUT_RESERVA_MINUTOS','30','Minutos de reserva temporal de inventario'),
('RETAIL_LIMITE_DEFAULT_PEDIDO','10','Límite retail por defecto por pedido'),
('EMAIL_FROM','Retail Prime <no-reply@retailprime.local>','Remitente de correos simulados')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, descripcion = EXCLUDED.descripcion, fecha_actualizacion = now();

-- Categorías
INSERT INTO categoria(nombre, slug, descripcion) VALUES
('Electrónica','electronica','Dispositivos electrónicos de consumo'),
('Computación','computacion','Laptops, accesorios y periféricos'),
('Hogar','hogar','Artículos para el hogar'),
('Ropa','ropa','Prendas de vestir'),
('Alimentos','alimentos','Productos de consumo alimenticio'),
('Belleza','belleza','Cuidado personal y belleza'),
('Limpieza','limpieza','Productos de limpieza'),
('Juguetes','juguetes','Juguetes y entretenimiento'),
('Libros','libros','Libros físicos y digitales'),
('Mascotas','mascotas','Productos para mascotas')
ON CONFLICT (slug) DO UPDATE SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

-- Marcas
INSERT INTO marca(nombre, descripcion) VALUES
('Samsung','Marca de electrónica y tecnología'),
('Apple','Marca de dispositivos premium'),
('Lenovo','Marca de computación'),
('HP','Marca de computadoras e impresoras'),
('Sony','Marca de audio y entretenimiento'),
('LG','Marca de electrónica y hogar'),
('Xiaomi','Marca de electrónica de consumo'),
('Nike','Marca de ropa y calzado'),
('Adidas','Marca deportiva'),
('Nestlé','Marca de alimentos'),
('Colgate','Marca de higiene personal'),
('Generic Prime','Marca genérica de prueba'),
('Logitech','Marca de periféricos'),
('Kingston','Marca de memorias y almacenamiento'),
('Oster','Marca de electrodomésticos')
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- Reglas retail por categoría
INSERT INTO regla_limite_compra(cod_categoria, limite_por_pedido, limite_por_dia, limite_por_mes, requiere_revision)
SELECT cod_categoria,
       CASE slug
           WHEN 'electronica' THEN 2
           WHEN 'computacion' THEN 2
           WHEN 'ropa' THEN 10
           WHEN 'alimentos' THEN 20
           WHEN 'limpieza' THEN 25
           ELSE 10
       END,
       CASE slug
           WHEN 'electronica' THEN 3
           WHEN 'computacion' THEN 3
           WHEN 'ropa' THEN 20
           WHEN 'alimentos' THEN 40
           WHEN 'limpieza' THEN 50
           ELSE 20
       END,
       CASE slug
           WHEN 'electronica' THEN 5
           WHEN 'computacion' THEN 5
           WHEN 'ropa' THEN 60
           WHEN 'alimentos' THEN 120
           WHEN 'limpieza' THEN 150
           ELSE 60
       END,
       slug IN ('electronica','computacion')
FROM categoria
ON CONFLICT DO NOTHING;

-- Almacenes
INSERT INTO almacen(nombre, direccion, ciudad, provincia) VALUES
('Almacén Central Quito','Av. Simulada Norte N45-100','Quito','Pichincha'),
('Almacén Guayaquil','Puerto Seco Simulado Km 8','Guayaquil','Guayas'),
('Almacén Cuenca','Parque Logístico Demo 12','Cuenca','Azuay')
ON CONFLICT (nombre) DO NOTHING;

-- Transportistas
INSERT INTO transportista(nombre, telefono, email) VALUES
('Prime Express Ecuador','0990001111','operaciones@primeexpress.local'),
('Andes Courier','0990002222','contacto@andescourier.local'),
('Costa Delivery','0990003333','soporte@costadelivery.local')
ON CONFLICT (nombre) DO UPDATE SET telefono = EXCLUDED.telefono, email = EXCLUDED.email;

-- Métodos de envío
INSERT INTO metodo_envio(nombre, dias_min, dias_max, costo_base, es_premium_gratis) VALUES
('Estándar',3,5,4.99,TRUE),
('Express',1,2,9.99,TRUE),
('Same Day Simulado',0,1,14.99,FALSE)
ON CONFLICT (nombre) DO UPDATE SET dias_min=EXCLUDED.dias_min, dias_max=EXCLUDED.dias_max, costo_base=EXCLUDED.costo_base, es_premium_gratis=EXCLUDED.es_premium_gratis;

-- Zonas
INSERT INTO zona_entrega(ciudad, provincia, recargo) VALUES
('Quito','Pichincha',0),
('Guayaquil','Guayas',0),
('Cuenca','Azuay',1.50),
('Manta','Manabí',2.50),
('Loja','Loja',3.00),
('Ambato','Tungurahua',1.00)
ON CONFLICT (ciudad, provincia) DO UPDATE SET recargo = EXCLUDED.recargo;

-- Planes y beneficios premium
INSERT INTO plan_membresia(nombre, precio_mensual, duracion_dias) VALUES
('Prime Mensual',7.99,30),
('Prime Trimestral',20.99,90),
('Prime Anual',79.99,365)
ON CONFLICT (nombre) DO UPDATE SET precio_mensual=EXCLUDED.precio_mensual, duracion_dias=EXCLUDED.duracion_dias;

INSERT INTO beneficio_membresia(cod_plan, codigo, nombre, valor, descripcion)
SELECT p.cod_plan, b.codigo, b.nombre, b.valor, b.descripcion
FROM plan_membresia p
CROSS JOIN (VALUES
    ('ENVIO_GRATIS','Envío gratis',0,'Envío estándar/express sin costo cuando aplica'),
    ('DESCUENTO_EXCLUSIVO','Descuento exclusivo',5,'Descuento simulado porcentual o monto según campaña'),
    ('DEVOLUCION_EXTENDIDA','Devolución extendida',30,'Más días para solicitar devolución'),
    ('ACCESO_ANTICIPADO','Acceso anticipado',NULL,'Acceso anticipado a ofertas')
) AS b(codigo,nombre,valor,descripcion)
ON CONFLICT (cod_plan, codigo) DO UPDATE SET nombre=EXCLUDED.nombre, valor=EXCLUDED.valor, descripcion=EXCLUDED.descripcion;

-- BINs de tarjeta simulados
INSERT INTO bin_tarjeta(marca, prefijo, longitud_min, longitud_max, cvv_longitud) VALUES
('VISA','4',13,19,3),
('MASTERCARD','51',16,16,3),
('MASTERCARD','52',16,16,3),
('MASTERCARD','53',16,16,3),
('MASTERCARD','54',16,16,3),
('MASTERCARD','55',16,16,3),
('AMEX','34',15,15,4),
('AMEX','37',15,15,4),
('DISCOVER','6011',16,19,3),
('DISCOVER','65',16,19,3),
('DINERS','36',14,19,3),
('DINERS','38',14,19,3)
ON CONFLICT (prefijo) DO UPDATE SET marca=EXCLUDED.marca, longitud_min=EXCLUDED.longitud_min, longitud_max=EXCLUDED.longitud_max, cvv_longitud=EXCLUDED.cvv_longitud;

COMMIT;
-- ============================================================
-- 07_seed_test_data.sql
-- Datos de prueba abundantes para Retail Prime
-- ============================================================

BEGIN;
-- ============================================================
-- USUARIOS DE PRUEBA
-- Contraseña demo para todos los usuarios sembrados: RetailPrime2026*
-- El hash se genera en PostgreSQL con fn_generar_password_hash_django().
-- Formato compatible con Django: pbkdf2_sha256$iteraciones$salt$hash.
-- ============================================================

INSERT INTO usuario(email, password_hash, nombres, apellidos, telefono, documento_identidad, email_verificado)
VALUES
('admin@retailprime.local', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeAdmin2026',120000),'Admin','General','0991000001','ADM-001',TRUE),
('bodega@retailprime.local', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeBodega2026',120000),'Walter','Bodega','0991000002','BOD-001',TRUE),
('proveedores@retailprime.local', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeProveedor2026',120000),'Paula','Proveedores','0991000003','PRO-001',TRUE),
('soporte@retailprime.local', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeSoporte2026',120000),'Sofía','Soporte','0991000004','SOP-001',TRUE),
('ana.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeAna2026',120000),'Ana','Mendoza','0992000001','CLI-001',TRUE),
('bruno.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeBruno2026',120000),'Bruno','Salazar','0992000002','CLI-002',TRUE),
('carla.prime@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeCarla2026',120000),'Carla','Torres','0992000003','CLI-003',TRUE),
('diego.prime@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeDiego2026',120000),'Diego','Vera','0992000004','CLI-004',TRUE),
('elena.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeElena2026',120000),'Elena','Paz','0992000005','CLI-005',TRUE),
('fabian.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeFabian2026',120000),'Fabián','Castro','0992000006','CLI-006',TRUE),
('gabriela.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeGabriela2026',120000),'Gabriela','Ríos','0992000007','CLI-007',TRUE),
('hector.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeHector2026',120000),'Héctor','Naranjo','0992000008','CLI-008',TRUE),
('irene.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeIrene2026',120000),'Irene','Suárez','0992000009','CLI-009',TRUE),
('jose.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeJose2026',120000),'José','Villacís','0992000010','CLI-010',TRUE),
('karla.cliente@example.com', fn_generar_password_hash_django('RetailPrime2026*','RetailPrimeKarla2026',120000),'Karla','Molina','0992000011','CLI-011',TRUE)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos,
    telefono = EXCLUDED.telefono,
    email_verificado = EXCLUDED.email_verificado;

INSERT INTO perfil_usuario(cod_usuario)
SELECT cod_usuario FROM usuario
ON CONFLICT (cod_usuario) DO NOTHING;

-- Roles por usuario
INSERT INTO usuario_rol(cod_usuario, cod_rol)
SELECT u.cod_usuario, r.cod_rol
FROM usuario u
JOIN rol r ON
    (u.email = 'admin@retailprime.local' AND r.nombre = 'ADMIN')
    OR (u.email = 'bodega@retailprime.local' AND r.nombre = 'WAREHOUSE_MANAGER')
    OR (u.email = 'proveedores@retailprime.local' AND r.nombre = 'SUPPLIER_MANAGER')
    OR (u.email = 'soporte@retailprime.local' AND r.nombre = 'SUPPORT')
    OR (u.email NOT LIKE '%@retailprime.local' AND r.nombre = 'CUSTOMER')
ON CONFLICT DO NOTHING;

-- Direcciones
INSERT INTO direccion_usuario(cod_usuario, alias, receptor, linea1, ciudad, provincia, pais, codigo_postal, telefono_contacto, es_predeterminada)
SELECT u.cod_usuario, 'Casa', u.nombres || ' ' || u.apellidos,
       'Calle Demo ' || u.cod_usuario || ' y Avenida Ficticia',
       CASE (u.cod_usuario % 5)
           WHEN 0 THEN 'Quito'
           WHEN 1 THEN 'Guayaquil'
           WHEN 2 THEN 'Cuenca'
           WHEN 3 THEN 'Manta'
           ELSE 'Loja'
       END,
       CASE (u.cod_usuario % 5)
           WHEN 0 THEN 'Pichincha'
           WHEN 1 THEN 'Guayas'
           WHEN 2 THEN 'Azuay'
           WHEN 3 THEN 'Manabí'
           ELSE 'Loja'
       END,
       'Ecuador',
       'EC' || lpad(u.cod_usuario::text, 5, '0'),
       u.telefono,
       TRUE
FROM usuario u
WHERE u.email NOT LIKE '%@retailprime.local'
  AND NOT EXISTS (
      SELECT 1
      FROM direccion_usuario du
      WHERE du.cod_usuario = u.cod_usuario
        AND du.alias = 'Casa'
  );

-- ============================================================
-- PROVEEDORES
-- ============================================================

INSERT INTO proveedor(ruc, razon_social, nombre_comercial, email, telefono, direccion, ciudad, provincia, calificacion)
VALUES
('1790010001001','TecnoAndes S.A.','TecnoAndes','ventas@tecnoandes.local','022000101','Zona Industrial Norte','Quito','Pichincha',4.80),
('0990010002001','Importadora Pacífico S.A.','ImpPacífico','ventas@imppacifico.local','042000202','Puerto Seco Demo','Guayaquil','Guayas',4.60),
('0190010003001','Cuenca Distribuciones Cía. Ltda.','CuencaDist','contacto@cuencadist.local','072000303','Parque Industrial Demo','Cuenca','Azuay',4.50),
('1790010004001','MegaStock Ecuador S.A.','MegaStock','pedidos@megastock.local','022000404','Bodega Central 4','Quito','Pichincha',4.70),
('0990010005001','Proveedor Costa Norte S.A.','CostaNorte','ventas@costanorte.local','052000505','Av. Logística 12','Manta','Manabí',4.20),
('1790010006001','Prime Supply Group S.A.','PrimeSupply','supply@primesupply.local','022000606','Centro Mayorista 8','Quito','Pichincha',4.90),
('0990010007001','Distribuidora Hogar Total S.A.','HogarTotal','ventas@hogartotal.local','042000707','Bodega Sur 7','Guayaquil','Guayas',4.30),
('0190010008001','Alimentos Sierra S.A.','AlimSierra','pedidos@alimsierra.local','072000808','Vía Industrial 15','Cuenca','Azuay',4.40),
('1790010009001','Belleza y Salud S.A.','BYS','contacto@bys.local','022000909','Av. Cosmética 9','Quito','Pichincha',4.10),
('0990010010001','LimpioMax Distribuciones','LimpioMax','ventas@limpiomax.local','042001010','Sector Limpieza 10','Guayaquil','Guayas',4.50),
('1790010011001','Libros del Ande Cía. Ltda.','LibrosAnde','ventas@librosande.local','022001111','Calle Editorial 21','Quito','Pichincha',4.60),
('0990010012001','PetGlobal Ecuador S.A.','PetGlobal','ventas@petglobal.local','042001212','Bodega Pet 3','Guayaquil','Guayas',4.30)
ON CONFLICT (ruc) DO UPDATE SET
    razon_social = EXCLUDED.razon_social,
    nombre_comercial = EXCLUDED.nombre_comercial,
    email = EXCLUDED.email,
    telefono = EXCLUDED.telefono,
    calificacion = EXCLUDED.calificacion,
    activo = TRUE;

INSERT INTO proveedor_contacto(cod_proveedor, nombre, cargo, email, telefono, principal)
SELECT cod_proveedor, 'Contacto ' || nombre_comercial, 'Ejecutivo comercial', email, telefono, TRUE
FROM proveedor
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCTOS
-- ============================================================

INSERT INTO producto(cod_categoria, cod_marca, sku, nombre, descripcion, precio_actual, peso_kg, largo_cm, ancho_cm, alto_cm, metadata)
VALUES
((SELECT cod_categoria FROM categoria WHERE slug='electronica'),(SELECT cod_marca FROM marca WHERE nombre='Samsung'),'ELE-SAM-S24','Smartphone Samsung S24 Demo','Smartphone de prueba con alto rendimiento y cámara avanzada.',899.99,0.210,16,8,1,'{"color":"negro","memoria":"256GB"}'),
((SELECT cod_categoria FROM categoria WHERE slug='electronica'),(SELECT cod_marca FROM marca WHERE nombre='Apple'),'ELE-APP-IP15','iPhone 15 Demo','Teléfono premium simulado para pruebas de catálogo.',1099.99,0.190,15,8,1,'{"color":"azul","memoria":"128GB"}'),
((SELECT cod_categoria FROM categoria WHERE slug='electronica'),(SELECT cod_marca FROM marca WHERE nombre='Sony'),'ELE-SON-WH1000','Audífonos Sony Noise Cancel Demo','Audífonos bluetooth con cancelación de ruido simulada.',349.99,0.300,20,18,8,'{"tipo":"bluetooth"}'),
((SELECT cod_categoria FROM categoria WHERE slug='electronica'),(SELECT cod_marca FROM marca WHERE nombre='LG'),'ELE-LG-TV55','Televisor LG 55 4K Demo','Televisor 4K de 55 pulgadas para prueba retail.',599.99,12.500,130,80,15,'{"pulgadas":55,"resolucion":"4K"}'),
((SELECT cod_categoria FROM categoria WHERE slug='electronica'),(SELECT cod_marca FROM marca WHERE nombre='Xiaomi'),'ELE-XIA-BAND','Xiaomi Smart Band Demo','Pulsera inteligente de monitoreo básico.',49.99,0.050,12,8,4,'{"color":"negro"}'),

((SELECT cod_categoria FROM categoria WHERE slug='computacion'),(SELECT cod_marca FROM marca WHERE nombre='Lenovo'),'COM-LEN-IDEAPAD','Laptop Lenovo IdeaPad Demo','Laptop para estudio y trabajo.',699.99,1.700,36,25,2,'{"ram":"16GB","ssd":"512GB"}'),
((SELECT cod_categoria FROM categoria WHERE slug='computacion'),(SELECT cod_marca FROM marca WHERE nombre='HP'),'COM-HP-PAV15','Laptop HP Pavilion 15 Demo','Laptop de uso general con buen rendimiento.',749.99,1.800,36,25,2,'{"ram":"16GB","ssd":"1TB"}'),
((SELECT cod_categoria FROM categoria WHERE slug='computacion'),(SELECT cod_marca FROM marca WHERE nombre='Logitech'),'COM-LOG-MX','Mouse Logitech MX Demo','Mouse inalámbrico ergonómico.',79.99,0.120,12,7,4,'{"conexion":"inalambrica"}'),
((SELECT cod_categoria FROM categoria WHERE slug='computacion'),(SELECT cod_marca FROM marca WHERE nombre='Kingston'),'COM-KIN-SSD1TB','SSD Kingston 1TB Demo','Unidad SSD de 1TB para pruebas.',89.99,0.060,10,7,1,'{"capacidad":"1TB"}'),
((SELECT cod_categoria FROM categoria WHERE slug='computacion'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'COM-GEN-TECLADO','Teclado Mecánico Prime Demo','Teclado mecánico RGB simulado.',59.99,0.900,45,16,4,'{"switch":"blue"}'),

((SELECT cod_categoria FROM categoria WHERE slug='hogar'),(SELECT cod_marca FROM marca WHERE nombre='Oster'),'HOG-OST-LIC','Licuadora Oster Demo','Licuadora para cocina con vaso resistente.',64.99,2.300,30,20,25,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='hogar'),(SELECT cod_marca FROM marca WHERE nombre='LG'),'HOG-LG-MICRO','Microondas LG Demo','Microondas familiar de 30 litros.',149.99,10.000,50,40,30,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='hogar'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'HOG-GEN-SILLA','Silla Ergonómica Prime Demo','Silla de oficina ergonómica.',129.99,8.500,70,60,120,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='hogar'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'HOG-GEN-LAMP','Lámpara LED Escritorio Demo','Lámpara LED con brazo ajustable.',24.99,0.750,25,15,40,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='hogar'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'HOG-GEN-ORG','Organizador Modular Demo','Organizador plástico modular.',19.99,1.200,40,30,20,'{}'),

((SELECT cod_categoria FROM categoria WHERE slug='ropa'),(SELECT cod_marca FROM marca WHERE nombre='Nike'),'ROP-NIK-CAM','Camiseta Nike Demo','Camiseta deportiva de prueba.',29.99,0.200,30,25,2,'{"talla":"M"}'),
((SELECT cod_categoria FROM categoria WHERE slug='ropa'),(SELECT cod_marca FROM marca WHERE nombre='Adidas'),'ROP-ADI-ZAP','Zapatillas Adidas Demo','Zapatillas deportivas simuladas.',89.99,0.800,35,22,12,'{"talla":"42"}'),
((SELECT cod_categoria FROM categoria WHERE slug='ropa'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'ROP-GEN-JEAN','Jean Clásico Prime Demo','Jean casual de prueba.',39.99,0.600,35,28,5,'{"talla":"32"}'),

((SELECT cod_categoria FROM categoria WHERE slug='alimentos'),(SELECT cod_marca FROM marca WHERE nombre='Nestlé'),'ALI-NES-CAF','Café Nestlé Demo','Café soluble de prueba.',8.99,0.250,10,8,15,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='alimentos'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'ALI-GEN-AVENA','Avena Prime Demo','Avena en hojuelas simulada.',4.99,0.500,15,8,20,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='alimentos'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'ALI-GEN-ARROZ','Arroz Prime 5kg Demo','Arroz de 5kg para prueba retail.',7.49,5.000,35,25,10,'{}'),

((SELECT cod_categoria FROM categoria WHERE slug='belleza'),(SELECT cod_marca FROM marca WHERE nombre='Colgate'),'BEL-COL-PASTA','Pasta Dental Colgate Demo','Pasta dental simulada.',3.99,0.150,20,5,4,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='belleza'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'BEL-GEN-SHAM','Shampoo Prime Demo','Shampoo familiar simulado.',6.99,0.750,25,8,8,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='belleza'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'BEL-GEN-CREMA','Crema Hidratante Prime Demo','Crema hidratante de prueba.',9.99,0.250,12,8,8,'{}'),

((SELECT cod_categoria FROM categoria WHERE slug='limpieza'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'LIM-GEN-DETER','Detergente Prime 3kg Demo','Detergente familiar de prueba.',10.99,3.000,30,20,10,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='limpieza'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'LIM-GEN-DESINF','Desinfectante Prime Demo','Desinfectante multiuso simulado.',5.99,1.000,28,9,9,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='limpieza'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'LIM-GEN-PAPEL','Papel Higiénico Pack Demo','Pack familiar de papel higiénico.',8.49,1.500,40,30,20,'{}'),

((SELECT cod_categoria FROM categoria WHERE slug='libros'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'LIB-GEN-DJANGO','Libro Django Seguro Demo','Libro ficticio sobre Django y seguridad.',24.99,0.600,22,15,3,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='juguetes'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'JUG-GEN-BLOQ','Bloques Creativos Demo','Juego de bloques creativos.',34.99,1.200,30,25,20,'{}'),
((SELECT cod_categoria FROM categoria WHERE slug='mascotas'),(SELECT cod_marca FROM marca WHERE nombre='Generic Prime'),'MAS-GEN-CROQ','Croquetas Mascota 10kg Demo','Alimento para mascotas de prueba.',22.99,10.000,50,35,15,'{}')
ON CONFLICT (sku) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio_actual = EXCLUDED.precio_actual,
    metadata = EXCLUDED.metadata,
    cod_estado_producto = 'BORRADOR';

-- Imagen principal para todos los productos
INSERT INTO producto_imagen(cod_producto, url_imagen, alt_text, es_principal, orden)
SELECT cod_producto,
       'https://img.retailprime.local/productos/' || lower(sku) || '.jpg',
       nombre,
       TRUE,
       1
FROM producto
ON CONFLICT DO NOTHING;

-- Atributos base
INSERT INTO producto_atributo(nombre, tipo_dato) VALUES
('Color','texto'),
('Memoria','texto'),
('Talla','texto'),
('Capacidad','texto'),
('Conexión','texto'),
('Resolución','texto')
ON CONFLICT (nombre) DO NOTHING;

-- Inventario propio en almacenes
INSERT INTO inventario(cod_producto, cod_almacen, stock_total, stock_reservado, stock_minimo, stock_maximo)
SELECT p.cod_producto,
       a.cod_almacen,
       CASE
           WHEN c.slug IN ('electronica','computacion') THEN 3 + ((p.cod_producto + a.cod_almacen) % 8)
           WHEN c.slug IN ('alimentos','limpieza') THEN 30 + ((p.cod_producto + a.cod_almacen) % 50)
           ELSE 10 + ((p.cod_producto + a.cod_almacen) % 20)
       END,
       0,
       CASE
           WHEN c.slug IN ('electronica','computacion') THEN 2
           ELSE 5
       END,
       NULL
FROM producto p
JOIN categoria c ON c.cod_categoria = p.cod_categoria
CROSS JOIN almacen a
ON CONFLICT (cod_producto, cod_almacen)
DO UPDATE SET stock_total = EXCLUDED.stock_total, stock_minimo = EXCLUDED.stock_minimo, fecha_actualizacion = now();

-- Relación producto-proveedor: mínimo 6 proveedores por producto
DO $$
DECLARE
    r_producto RECORD;
    r_proveedor RECORD;
    v_i INTEGER;
    v_costo NUMERIC(12,2);
    v_stock INTEGER;
BEGIN
    FOR r_producto IN SELECT cod_producto, sku, precio_actual FROM producto ORDER BY cod_producto LOOP
        v_i := 0;
        FOR r_proveedor IN
            SELECT cod_proveedor
            FROM proveedor
            WHERE activo IS TRUE
            ORDER BY ((cod_proveedor + r_producto.cod_producto) % 12), cod_proveedor
            LIMIT 6
        LOOP
            v_i := v_i + 1;
            v_costo := ROUND((r_producto.precio_actual * (0.55 + (v_i::numeric * 0.03)))::numeric, 2);
            v_stock := 20 + ((r_producto.cod_producto::integer * v_i * 7) % 90);

            PERFORM fn_asociar_producto_proveedor(
                r_producto.cod_producto,
                r_proveedor.cod_proveedor,
                r_producto.sku || '-PRV-' || r_proveedor.cod_proveedor,
                v_costo,
                ROUND((v_costo * 1.25)::numeric, 2),
                1 + (v_i % 5),
                v_i,
                1,
                200,
                v_stock
            );
        END LOOP;
    END LOOP;
END $$;

-- Reglas específicas para productos de alto valor
INSERT INTO regla_limite_compra(cod_producto, limite_por_pedido, limite_por_dia, limite_por_mes, requiere_revision)
SELECT cod_producto, 2, 2, 4, TRUE
FROM producto
WHERE sku IN ('ELE-SAM-S24','ELE-APP-IP15','ELE-LG-TV55','COM-LEN-IDEAPAD','COM-HP-PAV15')
ON CONFLICT DO NOTHING;

-- Fichas técnicas demo requeridas por la validación final de publicación.
-- La función fn_validar_producto_publicable exige metadata.ficha_tecnica.url
-- con extensión .pdf. Se utiliza un PDF local de demostración para que el
-- seed sea coherente; en producción debe reemplazarse por la ficha real.
UPDATE producto
SET metadata = COALESCE(metadata, '{}'::jsonb) ||
    jsonb_build_object(
        'ficha_tecnica',
        jsonb_build_object(
            'url', '/media/productos/fichas/ficha-tecnica-demo.pdf',
            'nombre', 'Ficha técnica demo - ' || sku
        )
    )
WHERE COALESCE(metadata->'ficha_tecnica'->>'url', '') = ''
   OR lower(split_part(metadata->'ficha_tecnica'->>'url', '?', 1)) NOT LIKE '%.pdf';

-- Publicar productos luego de cumplir requisitos
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT cod_producto FROM producto WHERE cod_estado_producto <> 'PUBLICADO' LOOP
        PERFORM fn_publicar_producto(r.cod_producto);
    END LOOP;
END $$;

-- Métodos de pago simulados y cuentas
DO $$
DECLARE
    v_user BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='ana.cliente@example.com';
    IF v_user IS NOT NULL AND NOT EXISTS (SELECT 1 FROM metodo_pago WHERE cod_usuario=v_user AND ultimos4='1111') THEN
        PERFORM fn_registrar_metodo_pago_simulado(v_user, '4111111111111111', 'ANA MENDOZA', 12::SMALLINT, 2030::SMALLINT, '123', 1500::NUMERIC, 1200::NUMERIC);
    END IF;

    SELECT cod_usuario INTO v_user FROM usuario WHERE email='bruno.cliente@example.com';
    IF v_user IS NOT NULL AND NOT EXISTS (SELECT 1 FROM metodo_pago WHERE cod_usuario=v_user AND ultimos4='4444') THEN
        PERFORM fn_registrar_metodo_pago_simulado(v_user, '5555555555554444', 'BRUNO SALAZAR', 11::SMALLINT, 2031::SMALLINT, '456', 300::NUMERIC, 500::NUMERIC);
    END IF;

    SELECT cod_usuario INTO v_user FROM usuario WHERE email='carla.prime@example.com';
    IF v_user IS NOT NULL AND NOT EXISTS (SELECT 1 FROM metodo_pago WHERE cod_usuario=v_user AND ultimos4='0005') THEN
        PERFORM fn_registrar_metodo_pago_simulado(v_user, '378282246310005', 'CARLA TORRES', 10::SMALLINT, 2032::SMALLINT, '1234', 2500::NUMERIC, 2000::NUMERIC);
    END IF;

    SELECT cod_usuario INTO v_user FROM usuario WHERE email='diego.prime@example.com';
    IF v_user IS NOT NULL AND NOT EXISTS (SELECT 1 FROM metodo_pago WHERE cod_usuario=v_user AND ultimos4='1117') THEN
        PERFORM fn_registrar_metodo_pago_simulado(v_user, '6011111111111117', 'DIEGO VERA', 9::SMALLINT, 2030::SMALLINT, '789', 800::NUMERIC, 800::NUMERIC);
    END IF;
END $$;

-- Membresías premium para usuarios de prueba
DO $$
DECLARE
    v_plan BIGINT;
    v_user BIGINT;
BEGIN
    SELECT cod_plan INTO v_plan FROM plan_membresia WHERE nombre='Prime Mensual';

    SELECT cod_usuario INTO v_user FROM usuario WHERE email='carla.prime@example.com';
    IF v_user IS NOT NULL AND NOT EXISTS (SELECT 1 FROM membresia_usuario WHERE cod_usuario=v_user AND cod_estado_membresia='ACTIVA') THEN
        PERFORM fn_activar_membresia_usuario(v_user, v_plan, TRUE);
    END IF;

    SELECT cod_usuario INTO v_user FROM usuario WHERE email='diego.prime@example.com';
    IF v_user IS NOT NULL AND NOT EXISTS (SELECT 1 FROM membresia_usuario WHERE cod_usuario=v_user AND cod_estado_membresia='ACTIVA') THEN
        PERFORM fn_activar_membresia_usuario(v_user, v_plan, TRUE);
    END IF;
END $$;

-- Favoritos, reseñas y logs
INSERT INTO producto_favorito(cod_usuario, cod_producto)
SELECT u.cod_usuario, p.cod_producto
FROM usuario u
JOIN producto p ON p.sku IN ('ELE-SON-WH1000','COM-LOG-MX','LIB-GEN-DJANGO')
WHERE u.email IN ('ana.cliente@example.com','carla.prime@example.com','diego.prime@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO producto_resena(cod_usuario, cod_producto, calificacion, titulo, comentario, aprobado)
SELECT u.cod_usuario, p.cod_producto, 5, 'Muy buen producto demo', 'Reseña de prueba para validar el módulo de reseñas.', TRUE
FROM usuario u
JOIN producto p ON p.sku IN ('COM-LOG-MX','ALI-NES-CAF','LIB-GEN-DJANGO')
WHERE u.email IN ('ana.cliente@example.com','bruno.cliente@example.com','carla.prime@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO log_busqueda(cod_usuario, termino, resultados)
SELECT u.cod_usuario, x.termino, x.resultados
FROM usuario u
CROSS JOIN (VALUES
    ('laptop',2),
    ('audífonos bluetooth',1),
    ('café',1),
    ('django seguridad',1),
    ('detergente',2)
) AS x(termino,resultados)
WHERE u.email IN ('ana.cliente@example.com','carla.prime@example.com','diego.prime@example.com');

INSERT INTO log_producto_visto(cod_usuario, cod_producto)
SELECT u.cod_usuario, p.cod_producto
FROM usuario u
JOIN producto p ON p.cod_estado_producto='PUBLICADO'
WHERE u.email IN ('ana.cliente@example.com','bruno.cliente@example.com','carla.prime@example.com')
  AND p.cod_producto % 4 = u.cod_usuario % 4;

-- Carritos de prueba
DO $$
DECLARE
    v_user BIGINT;
    v_prod BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='ana.cliente@example.com';
    SELECT cod_producto INTO v_prod FROM producto WHERE sku='COM-LOG-MX';
    PERFORM fn_agregar_producto_carrito(v_user, v_prod, 1);
    SELECT cod_producto INTO v_prod FROM producto WHERE sku='ALI-NES-CAF';
    PERFORM fn_agregar_producto_carrito(v_user, v_prod, 3);

    SELECT cod_usuario INTO v_user FROM usuario WHERE email='carla.prime@example.com';
    SELECT cod_producto INTO v_prod FROM producto WHERE sku='ELE-SON-WH1000';
    PERFORM fn_agregar_producto_carrito(v_user, v_prod, 1);
    SELECT cod_producto INTO v_prod FROM producto WHERE sku='LIB-GEN-DJANGO';
    PERFORM fn_agregar_producto_carrito(v_user, v_prod, 1);

    SELECT cod_usuario INTO v_user FROM usuario WHERE email='diego.prime@example.com';
    SELECT cod_producto INTO v_prod FROM producto WHERE sku='LIM-GEN-DETER';
    PERFORM fn_agregar_producto_carrito(v_user, v_prod, 4);
    SELECT cod_producto INTO v_prod FROM producto WHERE sku='MAS-GEN-CROQ';
    PERFORM fn_agregar_producto_carrito(v_user, v_prod, 1);
END $$;

COMMIT;
-- ============================================================
-- 09_demo_scenarios.sql
-- Escenarios demostrativos end-to-end
-- ============================================================

BEGIN;
-- Escenario 1: Ana crea pedido desde carrito y paga correctamente
DO $$
DECLARE
    v_user BIGINT;
    v_dir BIGINT;
    v_method BIGINT;
    v_order BIGINT;
    v_tx BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='ana.cliente@example.com';
    SELECT cod_direccion INTO v_dir FROM direccion_usuario WHERE cod_usuario=v_user AND es_predeterminada IS TRUE LIMIT 1;
    SELECT cod_metodo_pago INTO v_method FROM metodo_pago WHERE cod_usuario=v_user AND activo IS TRUE LIMIT 1;

    IF EXISTS (SELECT 1 FROM carrito WHERE cod_usuario=v_user AND estado='ACTIVO') THEN
        v_order := fn_crear_pedido_desde_carrito(v_user, v_dir, (SELECT cod_metodo_envio FROM metodo_envio WHERE nombre='Estándar'));
        v_tx := fn_autorizar_pago_simulado(v_order, v_method, 'IDEMP-ANA-' || v_order);
        PERFORM fn_capturar_pago_simulado(v_tx);
        PERFORM fn_actualizar_estado_pedido(v_order, 'LISTO_ENVIO', 'Pedido preparado para entrega');
        PERFORM fn_actualizar_estado_pedido(v_order, 'ENVIADO', 'Pedido retirado por transportista');
        PERFORM fn_actualizar_estado_pedido(v_order, 'EN_TRANSITO', 'Pedido en tránsito nacional');
    END IF;
END $$;

-- Escenario 2: Carla Prime crea pedido con envío gratis y se entrega
DO $$
DECLARE
    v_user BIGINT;
    v_dir BIGINT;
    v_method BIGINT;
    v_order BIGINT;
    v_tx BIGINT;
    v_dev BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='carla.prime@example.com';
    SELECT cod_direccion INTO v_dir FROM direccion_usuario WHERE cod_usuario=v_user AND es_predeterminada IS TRUE LIMIT 1;
    SELECT cod_metodo_pago INTO v_method FROM metodo_pago WHERE cod_usuario=v_user AND activo IS TRUE LIMIT 1;

    IF EXISTS (SELECT 1 FROM carrito WHERE cod_usuario=v_user AND estado='ACTIVO') THEN
        v_order := fn_crear_pedido_desde_carrito(v_user, v_dir, (SELECT cod_metodo_envio FROM metodo_envio WHERE nombre='Express'));
        v_tx := fn_autorizar_pago_simulado(v_order, v_method, 'IDEMP-CARLA-' || v_order);
        PERFORM fn_capturar_pago_simulado(v_tx);
        PERFORM fn_actualizar_estado_pedido(v_order, 'LISTO_ENVIO', 'Pedido listo para entrega Prime');
        PERFORM fn_actualizar_estado_pedido(v_order, 'ENVIADO', 'Transportista retiró el paquete');
        PERFORM fn_actualizar_estado_pedido(v_order, 'EN_TRANSITO', 'Paquete en tránsito');
        PERFORM fn_actualizar_estado_pedido(v_order, 'EN_REPARTO', 'Paquete en reparto');
        PERFORM fn_actualizar_estado_pedido(v_order, 'ENTREGADO', 'Pedido entregado al cliente');

        -- Demostración de devolución total y reembolso simulado
        v_dev := fn_solicitar_devolucion_total(v_order, 'Producto de prueba', 'Escenario académico de devolución total');
        PERFORM fn_aprobar_devolucion(v_dev, 'Devolución aprobada para demo');
        PERFORM fn_generar_reembolso_simulado(v_dev);
    END IF;
END $$;

-- Escenario 3: Diego Prime compra productos de limpieza/mascotas
DO $$
DECLARE
    v_user BIGINT;
    v_dir BIGINT;
    v_method BIGINT;
    v_order BIGINT;
    v_tx BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='diego.prime@example.com';
    SELECT cod_direccion INTO v_dir FROM direccion_usuario WHERE cod_usuario=v_user AND es_predeterminada IS TRUE LIMIT 1;
    SELECT cod_metodo_pago INTO v_method FROM metodo_pago WHERE cod_usuario=v_user AND activo IS TRUE LIMIT 1;

    IF EXISTS (SELECT 1 FROM carrito WHERE cod_usuario=v_user AND estado='ACTIVO') THEN
        v_order := fn_crear_pedido_desde_carrito(v_user, v_dir, (SELECT cod_metodo_envio FROM metodo_envio WHERE nombre='Estándar'));
        v_tx := fn_autorizar_pago_simulado(v_order, v_method, 'IDEMP-DIEGO-' || v_order);
        PERFORM fn_capturar_pago_simulado(v_tx);
    END IF;
END $$;

-- Refrescar reportes
SELECT fn_refrescar_resumen_venta_diaria(CURRENT_DATE);
SELECT fn_generar_snapshot_kpis();

-- Consultas útiles de verificación
SELECT * FROM vw_dashboard_admin;
SELECT * FROM vw_pedido_resumen ORDER BY cod_pedido DESC;
SELECT * FROM vw_tracking_cliente ORDER BY cod_pedido DESC, fecha_evento;
SELECT * FROM vw_productos_mas_vendidos LIMIT 10;
SELECT * FROM vw_stock_critico LIMIT 20;

COMMIT;


-- ============================================================
-- 10_seed_extra_data.sql
-- Datos complementarios: promociones, cupones, notificaciones,
-- soporte, preguntas, biblioteca digital, wishlist y automatizaciones BI.
-- ============================================================

BEGIN;

-- Promociones activas de prueba
DO $$
DECLARE
    v_promo_electro BIGINT;
    v_promo_hogar BIGINT;
    r RECORD;
BEGIN
    v_promo_electro := fn_crear_promocion(
        'ELECTRO10', 'Electrónica 10% OFF', 'PORCENTAJE', 10,
        now() - interval '1 day', now() + interval '45 days',
        'Promoción simulada para productos electrónicos', FALSE
    );

    v_promo_hogar := fn_crear_promocion(
        'HOGAR5', 'Hogar $5 OFF', 'MONTO', 5,
        now() - interval '1 day', now() + interval '30 days',
        'Promoción simulada para productos de hogar', FALSE
    );

    FOR r IN SELECT cod_producto FROM producto WHERE sku LIKE 'ELE-%' LOOP
        PERFORM fn_asociar_promocion_producto(v_promo_electro, r.cod_producto);
    END LOOP;

    FOR r IN SELECT cod_producto FROM producto WHERE sku LIKE 'HOG-%' LOOP
        PERFORM fn_asociar_promocion_producto(v_promo_hogar, r.cod_producto);
    END LOOP;
END $$;

-- Cupones de prueba
SELECT fn_crear_cupon('BIENVENIDA10','Cupón de bienvenida','PORCENTAJE',10,20,100,1,60,'10% para primeras compras simuladas');
SELECT fn_crear_cupon('PRIME15','Cupón Prime','PORCENTAJE',15,50,50,2,45,'Cupón para clientes premium');
SELECT fn_crear_cupon('AHORRO5','Ahorro fijo de 5 USD','MONTO',5,25,200,3,90,'Descuento fijo de prueba');

-- Wishlist/listas de deseos
DO $$
DECLARE
    r_user RECORD;
    r_prod RECORD;
BEGIN
    FOR r_user IN SELECT cod_usuario FROM usuario WHERE email IN ('ana.cliente@example.com','carla.prime@example.com','diego.prime@example.com','elena.cliente@example.com') LOOP
        PERFORM fn_obtener_o_crear_wishlist_default(r_user.cod_usuario);
        FOR r_prod IN SELECT cod_producto FROM producto WHERE cod_estado_producto='PUBLICADO' ORDER BY cod_producto LIMIT 5 LOOP
            PERFORM fn_agregar_a_wishlist(r_user.cod_usuario, r_prod.cod_producto);
        END LOOP;
    END LOOP;
END $$;

-- Contenido digital tipo biblioteca/Prime
INSERT INTO contenido_digital(titulo, tipo, descripcion, url_contenido, cod_producto, requiere_premium)
VALUES
('Guía rápida de compras seguras', 'GUIA', 'Contenido digital simulado para miembros Prime.', 'https://contenido.retailprime.local/guias/compras-seguras.pdf', NULL, TRUE),
('Video: cómo usar el tracking', 'VIDEO', 'Tutorial de seguimiento de pedidos.', 'https://contenido.retailprime.local/videos/tracking.mp4', NULL, FALSE),
('Ebook Django Seguro para E-commerce', 'EBOOK', 'Ebook relacionado con el producto Libro Django Seguro Demo.', 'https://contenido.retailprime.local/ebooks/django-seguro.pdf', (SELECT cod_producto FROM producto WHERE sku='LIB-GEN-DJANGO'), TRUE),
('Audio resumen beneficios Prime', 'AUDIO', 'Audio de beneficios de membresía.', 'https://contenido.retailprime.local/audio/prime.mp3', NULL, TRUE)
ON CONFLICT DO NOTHING;

-- Asignar biblioteca a usuarios premium
DO $$
DECLARE
    r_user RECORD;
    r_content RECORD;
BEGIN
    FOR r_user IN
        SELECT cod_usuario FROM usuario
        WHERE email IN ('carla.prime@example.com','diego.prime@example.com')
    LOOP
        FOR r_content IN SELECT cod_contenido FROM contenido_digital WHERE activo IS TRUE LOOP
            PERFORM fn_agregar_contenido_biblioteca(r_user.cod_usuario, r_content.cod_contenido, NULL);
        END LOOP;
    END LOOP;
END $$;

-- Preguntas y respuestas de producto
DO $$
DECLARE
    v_user BIGINT;
    v_admin BIGINT;
    v_prod BIGINT;
    v_preg BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='ana.cliente@example.com';
    SELECT cod_usuario INTO v_admin FROM usuario WHERE email='soporte@retailprime.local';
    SELECT cod_producto INTO v_prod FROM producto WHERE sku='ELE-SON-WH1000';

    IF v_user IS NOT NULL AND v_admin IS NOT NULL AND v_prod IS NOT NULL THEN
        v_preg := fn_registrar_pregunta_producto(v_user, v_prod, '¿Los audífonos incluyen estuche de transporte?');
        PERFORM fn_responder_pregunta_producto(v_preg, v_admin, 'Sí, el producto demo incluye estuche de transporte simulado.');
    END IF;
END $$;

-- Tickets de soporte demo
DO $$
DECLARE
    v_user BIGINT;
    v_support BIGINT;
    v_ticket BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='bruno.cliente@example.com';
    SELECT cod_usuario INTO v_support FROM usuario WHERE email='soporte@retailprime.local';

    IF v_user IS NOT NULL THEN
        v_ticket := fn_crear_ticket_soporte(v_user, 'Consulta sobre pago rechazado', 'PAGOS', 'MEDIA', 'Necesito ayuda con una tarjeta simulada rechazada.');
        IF v_support IS NOT NULL THEN
            PERFORM fn_responder_ticket_soporte(v_ticket, v_support, 'Se revisará la cuenta simulada y el límite diario.', FALSE, 'EN_PROCESO');
        END IF;
    END IF;
END $$;

-- Compra recurrente demo para Prime
DO $$
DECLARE
    v_user BIGINT;
    v_compra BIGINT;
    v_prod BIGINT;
BEGIN
    SELECT cod_usuario INTO v_user FROM usuario WHERE email='diego.prime@example.com';
    IF v_user IS NOT NULL THEN
        v_compra := fn_crear_compra_recurrente(v_user, 'Reposición mensual limpieza y mascotas', 30, CURRENT_DATE + 30);
        SELECT cod_producto INTO v_prod FROM producto WHERE sku='LIM-GEN-DETER';
        IF v_prod IS NOT NULL THEN
            PERFORM fn_agregar_producto_compra_recurrente(v_compra, v_prod, 2);
        END IF;
        SELECT cod_producto INTO v_prod FROM producto WHERE sku='MAS-GEN-CROQ';
        IF v_prod IS NOT NULL THEN
            PERFORM fn_agregar_producto_compra_recurrente(v_compra, v_prod, 1);
        END IF;
    END IF;
END $$;

-- Logs y recomendaciones extendidas
DO $$
DECLARE
    r_user RECORD;
    r_prod RECORD;
BEGIN
    FOR r_user IN SELECT cod_usuario FROM usuario WHERE email NOT LIKE '%@retailprime.local' LIMIT 8 LOOP
        PERFORM fn_registrar_busqueda(r_user.cod_usuario, 'prime ofertas', 6);
        FOR r_prod IN SELECT cod_producto FROM producto WHERE cod_estado_producto='PUBLICADO' ORDER BY cod_producto DESC LIMIT 3 LOOP
            PERFORM fn_registrar_producto_visto(r_user.cod_usuario, r_prod.cod_producto);
        END LOOP;
        PERFORM fn_generar_recomendaciones_usuario(r_user.cod_usuario, 8);
    END LOOP;
END $$;

-- Notificaciones manuales demo
INSERT INTO notificacion(cod_usuario, tipo, titulo, mensaje, url_accion)
SELECT cod_usuario, 'PROMOCION', 'Promociones activas', 'Tienes promociones simuladas disponibles en el catálogo.', '/promociones'
FROM usuario
WHERE email IN ('ana.cliente@example.com','carla.prime@example.com','diego.prime@example.com')
ON CONFLICT DO NOTHING;

-- Segmentación y KPIs finales
SELECT fn_segmentar_clientes();
SELECT fn_generar_snapshot_kpis();

COMMIT;


-- ============================================================
-- CONSOLIDADO FASES A-D: RETAIL TÉCNICO, LOTES, PRIME Y TRACKING
-- Se agrega al seed histórico; no elimina escenarios ni catálogos existentes.
-- ============================================================
BEGIN;

-- Parámetros y estado requeridos por las fases B y C.
INSERT INTO parametro_sistema(clave, valor, descripcion) VALUES
('IVA_PORCENTAJE', '15', 'Tasa de impuesto configurable'),
('CHECKOUT_RESERVA_MINUTOS', '30', 'Minutos de reserva temporal'),
('MIN_PROVEEDORES_PRODUCTO_PUBLICADO', '5', 'Mínimo de proveedores activos')
ON CONFLICT (clave) DO UPDATE
SET valor = EXCLUDED.valor, descripcion = EXCLUDED.descripcion, fecha_actualizacion = now();

INSERT INTO estado_pago(cod_estado_pago, nombre)
VALUES ('ANULADO', 'Autorización anulada')
ON CONFLICT (cod_estado_pago) DO NOTHING;

-- Catálogo estrictamente técnico adicional. No elimina los datos históricos.
INSERT INTO categoria(nombre, slug, descripcion) VALUES
('Redes y conectividad', 'redes', 'Switches, routers y conectividad'),
('Seguridad de red', 'seguridad-red', 'Firewalls y protección de red'),
('Cableado estructurado', 'cableado', 'Cableado, patch panels y conectores'),
('Servidores y cómputo empresarial', 'servidores', 'Infraestructura de cómputo'),
('Almacenamiento', 'almacenamiento', 'NAS, SSD y almacenamiento empresarial'),
('Energía y UPS', 'energia-ups', 'Protección eléctrica'),
('Videovigilancia IP', 'videovigilancia-ip', 'Cámaras IP y NVR'),
('Racks y organización', 'racks', 'Racks y organización técnica'),
('Herramientas de red', 'herramientas-red', 'Herramientas de instalación')
ON CONFLICT (slug) DO UPDATE
SET nombre = EXCLUDED.nombre, descripcion = EXCLUDED.descripcion;

INSERT INTO marca(nombre, descripcion) VALUES
('Cisco', 'Redes'), ('Ubiquiti', 'Redes'), ('MikroTik', 'Redes'),
('TP-Link', 'Redes'), ('Fortinet', 'Seguridad'), ('Hikvision', 'Videovigilancia'),
('Dahua', 'Videovigilancia'), ('APC', 'UPS'), ('Dell', 'Servidores'),
('Panduit', 'Cableado'), ('Synology', 'NAS'), ('QNAP', 'NAS')
ON CONFLICT (nombre) DO NOTHING;

-- Reglas de precio de Fase A: categoría técnica y global de respaldo.
INSERT INTO regla_precio(cod_categoria, margen_porcentaje, costo_operativo_porcentaje, costo_fijo_unitario, prioridad)
SELECT cod_categoria, 35, 5, 0.10, 50
FROM categoria WHERE slug = 'computacion'
ON CONFLICT DO NOTHING;

INSERT INTO regla_precio(margen_porcentaje, costo_operativo_porcentaje, costo_fijo_unitario, prioridad)
VALUES (30, 5, 0.10, 100)
ON CONFLICT DO NOTHING;

-- Beneficios Prime explícitos de Fase B.
INSERT INTO beneficio_membresia(cod_plan, codigo, nombre, valor, descripcion)
SELECT cod_plan, 'DESCUENTO_PORCENTAJE', 'Descuento Prime 5%', 5,
       'Descuento aplicable sin alterar stock, límites ni validación de pago'
FROM plan_membresia WHERE nombre = 'Prime Mensual'
ON CONFLICT (cod_plan, codigo) DO UPDATE SET valor = EXCLUDED.valor, activo = TRUE;

-- Caso obligatorio Fase A: teclado, dos lotes FIFO 30 + 10.
DO $$
DECLARE
    v_producto BIGINT;
    v_almacen BIGINT;
    v_proveedor BIGINT;
    v_usuario BIGINT;
BEGIN
    SELECT cod_producto INTO v_producto
    FROM producto
    WHERE sku = 'COM-GEN-TECLADO'
    LIMIT 1;

    SELECT cod_almacen INTO v_almacen
    FROM almacen
    ORDER BY cod_almacen
    LIMIT 1;

    SELECT pp.cod_proveedor INTO v_proveedor
    FROM producto_proveedor pp
    WHERE pp.cod_producto = v_producto AND pp.activo IS TRUE
    ORDER BY pp.prioridad, pp.cod_proveedor
    LIMIT 1;

    IF v_producto IS NULL OR v_almacen IS NULL THEN
        RAISE EXCEPTION 'Falta el producto o almacén para el caso FIFO de teclado';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM lote_inventario WHERE numero_lote = 'TEC-KEY-A-30-C2') THEN
        PERFORM fn_crear_lote_inventario(
            v_producto, v_almacen, 30, 2.0000, 'TEC-KEY-A-30-C2',
            v_proveedor, NULL, now() - interval '4 days', NULL
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM lote_inventario WHERE numero_lote = 'TEC-KEY-B-10-C3') THEN
        PERFORM fn_crear_lote_inventario(
            v_producto, v_almacen, 10, 3.0000, 'TEC-KEY-B-10-C3',
            v_proveedor, NULL, now() - interval '3 days', NULL
        );
    END IF;

    INSERT INTO regla_limite_compra(
        cod_producto, limite_por_pedido, limite_por_dia, limite_por_mes, requiere_revision
    )
    SELECT v_producto, 50, 50, 200, FALSE
    WHERE NOT EXISTS (
        SELECT 1 FROM regla_limite_compra WHERE cod_producto = v_producto
    );

    SELECT cod_usuario INTO v_usuario
    FROM usuario
    WHERE email = 'ana.cliente@example.com'
    LIMIT 1;

    IF v_usuario IS NOT NULL THEN
        PERFORM fn_cotizar_producto_por_lotes(v_usuario, v_producto, 40);
    END IF;
END;
$$;

-- Mantenimiento C: deja evidencia sin borrar ningún carrito.
SELECT fn_registrar_carritos_abandonados(1440);

COMMIT;

BEGIN;
SELECT fn_asociar_usuario_proveedor(
    (SELECT cod_usuario FROM usuario WHERE email = 'proveedores@retailprime.local'),
    (SELECT cod_proveedor FROM proveedor WHERE activo ORDER BY cod_proveedor LIMIT 1)
);
COMMIT;
