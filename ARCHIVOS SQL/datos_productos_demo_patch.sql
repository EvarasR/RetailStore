-- Retail Prime: catálogo técnico demostrativo.
-- Ejecutar manualmente DESPUÉS de estructura.sql, funciones.sql y datos.sql.
-- No ejecutar directamente en producción sin una revisión y respaldo previos.
BEGIN;

INSERT INTO categoria(nombre, slug, descripcion) VALUES
('Redes y conectividad','redes','Switches y routers para conectividad profesional'),
('Seguridad de red','seguridad-red','Seguridad perimetral y protección de red'),
('WiFi empresarial','wifi-empresarial','Access points y controladores inalámbricos'),
('Cableado estructurado','cableado','Cable, patch panels y organización física'),
('Energía y UPS','energia-ups','Continuidad eléctrica y protección de equipos'),
('Videovigilancia IP','videovigilancia-ip','Cámaras PoE, NVR y accesorios'),
('Servidores y cómputo empresarial','servidores','Cómputo empresarial en formato rack'),
('Almacenamiento','almacenamiento','NAS, SSD y discos para operación continua'),
('Periféricos profesionales','perifericos-profesionales','Monitores, teclados y dispositivos de productividad'),
('Herramientas de red','herramientas-red','Testers, crimpadoras y herramientas de instalación'),
('Racks y organización','racks','Gabinetes, bandejas y organizadores'),
('Fibra y transceptores','fibra-transceptores','Módulos SFP y conectividad óptica')
ON CONFLICT (slug) DO UPDATE SET nombre=EXCLUDED.nombre, descripcion=EXCLUDED.descripcion, activo=TRUE;

INSERT INTO marca(nombre, descripcion) VALUES
('PrimeNet','Conectividad profesional Retail Prime'),
('SecureEdge','Seguridad de red y videovigilancia'),
('VoltCore','Continuidad eléctrica empresarial'),
('DataForge','Cómputo y almacenamiento profesional'),
('LinkCraft','Cableado, fibra y herramientas de red')
ON CONFLICT (nombre) DO UPDATE SET descripcion=EXCLUDED.descripcion, activo=TRUE;

INSERT INTO producto(cod_categoria,cod_marca,sku,nombre,descripcion,precio_actual,peso_kg,largo_cm,ancho_cm,alto_cm,metadata)
VALUES
((SELECT cod_categoria FROM categoria WHERE slug='redes'),(SELECT cod_marca FROM marca WHERE nombre='PrimeNet'),'RP-SW-POE24','Switch administrable PoE+ de 24 puertos','Switch Gigabit administrable con 24 puertos PoE+, uplinks SFP y funciones VLAN para redes empresariales.',489.00,3.4,44,28,4.4,'{"puertos":"24 Gigabit PoE+","uplinks":"4 SFP","presupuesto_poe":"370 W"}'),
((SELECT cod_categoria FROM categoria WHERE slug='redes'),(SELECT cod_marca FROM marca WHERE nombre='PrimeNet'),'RP-RTR-DUALWAN','Router empresarial Dual WAN','Router para continuidad de enlace, VPN y segmentación segura de oficinas y sucursales.',329.00,1.2,28,19,4.4,'{"wan":"Dual Gigabit","vpn":"IPSec y SSL","throughput":"1.8 Gbps"}'),
((SELECT cod_categoria FROM categoria WHERE slug='seguridad-red'),(SELECT cod_marca FROM marca WHERE nombre='SecureEdge'),'RP-FW-1200','Firewall de próxima generación 1.2 Gbps','Gateway de seguridad con inspección, políticas, VPN y segmentación para empresas medianas.',799.00,2.1,43,25,4.4,'{"firewall":"1.2 Gbps","vpn":"500 Mbps","interfaces":"8 Gigabit"}'),
((SELECT cod_categoria FROM categoria WHERE slug='wifi-empresarial'),(SELECT cod_marca FROM marca WHERE nombre='PrimeNet'),'RP-AP-WIFI6','Access Point WiFi 6 PoE','Access point de techo con WiFi 6, roaming y alimentación PoE para oficinas de alta densidad.',219.00,.8,22,22,4,'{"estandar":"802.11ax","bandas":"2.4 y 5 GHz","alimentacion":"PoE+"}'),
((SELECT cod_categoria FROM categoria WHERE slug='cableado'),(SELECT cod_marca FROM marca WHERE nombre='LinkCraft'),'RP-CAT6-305','Bobina UTP Cat6 de 305 metros','Cable de cobre Cat6 para despliegues horizontales de datos en edificios comerciales.',189.00,11.5,38,38,24,'{"categoria":"Cat6","longitud":"305 m","conductor":"cobre sólido"}'),
((SELECT cod_categoria FROM categoria WHERE slug='cableado'),(SELECT cod_marca FROM marca WHERE nombre='LinkCraft'),'RP-PP-24','Patch panel Cat6 de 24 puertos','Panel de parcheo 1U con etiquetado frontal para racks de 19 pulgadas.',94.00,1.4,48,10,4.4,'{"puertos":"24","altura":"1U","montaje":"19 pulgadas"}'),
((SELECT cod_categoria FROM categoria WHERE slug='energia-ups'),(SELECT cod_marca FROM marca WHERE nombre='VoltCore'),'RP-UPS-2200','UPS online rack 2200 VA','UPS de doble conversión para proteger servidores, switches y almacenamiento en rack.',1149.00,24,44,58,8.8,'{"potencia":"2200 VA / 1980 W","topologia":"Online","formato":"2U"}'),
((SELECT cod_categoria FROM categoria WHERE slug='videovigilancia-ip'),(SELECT cod_marca FROM marca WHERE nombre='SecureEdge'),'RP-CAM-4KPOE','Cámara IP PoE 4K','Cámara tipo turret con resolución 4K, visión nocturna y alimentación PoE.',249.00,.9,15,15,12,'{"resolucion":"4K","vision_nocturna":"30 m","proteccion":"IP67"}'),
((SELECT cod_categoria FROM categoria WHERE slug='videovigilancia-ip'),(SELECT cod_marca FROM marca WHERE nombre='SecureEdge'),'RP-NVR-8','NVR PoE de 8 canales','Grabador de red con ocho canales PoE y soporte de almacenamiento local.',369.00,2.8,38,32,5,'{"canales":"8 PoE","salida":"HDMI 4K","discos":"2 bahías"}'),
((SELECT cod_categoria FROM categoria WHERE slug='servidores'),(SELECT cod_marca FROM marca WHERE nombre='DataForge'),'RP-SRV-1U','Servidor rack 1U empresarial','Servidor compacto para virtualización, servicios de red y aplicaciones internas.',2899.00,14,48,70,4.4,'{"procesador":"8 núcleos","memoria":"32 GB ECC","red":"Dual 10 GbE"}'),
((SELECT cod_categoria FROM categoria WHERE slug='almacenamiento'),(SELECT cod_marca FROM marca WHERE nombre='DataForge'),'RP-NAS-4B','NAS empresarial de 4 bahías','Almacenamiento en red para copias de seguridad, archivos y colaboración de equipos.',729.00,4.2,23,30,18,'{"bahias":"4","red":"2.5 GbE","raid":"0/1/5/6/10"}'),
((SELECT cod_categoria FROM categoria WHERE slug='almacenamiento'),(SELECT cod_marca FROM marca WHERE nombre='DataForge'),'RP-SSD-1TB','SSD empresarial de 1 TB','Unidad de estado sólido con alta resistencia para estaciones y servidores ligeros.',129.00,.08,10,7,1,'{"capacidad":"1 TB","interfaz":"SATA III","tipo":"TLC"}'),
((SELECT cod_categoria FROM categoria WHERE slug='perifericos-profesionales'),(SELECT cod_marca FROM marca WHERE nombre='DataForge'),'RP-MON-27QHD','Monitor profesional 27 pulgadas QHD','Monitor de productividad con resolución QHD, soporte ajustable y conectividad moderna.',389.00,6.8,62,22,52,'{"tamano":"27 pulgadas","resolucion":"2560 x 1440","panel":"IPS"}'),
((SELECT cod_categoria FROM categoria WHERE slug='herramientas-red'),(SELECT cod_marca FROM marca WHERE nombre='LinkCraft'),'RP-TEST-NET','Tester digital de cableado','Probador para continuidad, mapa de pares y longitud aproximada de enlaces de cobre.',149.00,.45,18,8,4,'{"pruebas":"continuidad y mapa","pantalla":"LCD","conectores":"RJ45/RJ11"}'),
((SELECT cod_categoria FROM categoria WHERE slug='racks'),(SELECT cod_marca FROM marca WHERE nombre='LinkCraft'),'RP-RACK-24U','Gabinete rack 24U de piso','Rack de 19 pulgadas con puertas ventiladas, laterales removibles y ruedas.',899.00,54,80,60,125,'{"altura":"24U","ancho":"19 pulgadas","carga":"600 kg"}'),
((SELECT cod_categoria FROM categoria WHERE slug='fibra-transceptores'),(SELECT cod_marca FROM marca WHERE nombre='LinkCraft'),'RP-SFP-10G','Transceptor SFP+ 10G SR','Módulo óptico multimodo para enlaces de 10 Gbps hasta 300 metros.',79.00,.03,6,1.4,1.2,'{"velocidad":"10 Gbps","fibra":"multimodo","alcance":"300 m"}')
ON CONFLICT (sku) DO UPDATE SET cod_categoria=EXCLUDED.cod_categoria,cod_marca=EXCLUDED.cod_marca,nombre=EXCLUDED.nombre,descripcion=EXCLUDED.descripcion,precio_actual=EXCLUDED.precio_actual,metadata=EXCLUDED.metadata,cod_estado_producto='BORRADOR',fecha_actualizacion=now();

-- La publicación final exige una ficha técnica PDF en metadata.
UPDATE producto
SET metadata = COALESCE(metadata, '{}'::jsonb) ||
    jsonb_build_object(
        'ficha_tecnica',
        jsonb_build_object(
            'url', '/media/productos/fichas/ficha-tecnica-demo.pdf',
            'nombre', 'Ficha técnica demo - ' || sku
        )
    )
WHERE sku LIKE 'RP-%'
  AND (
      COALESCE(metadata->'ficha_tecnica'->>'url', '') = ''
      OR lower(split_part(metadata->'ficha_tecnica'->>'url', '?', 1)) NOT LIKE '%.pdf'
  );

INSERT INTO regla_limite_compra(cod_categoria,limite_por_pedido,limite_por_dia,limite_por_mes,requiere_revision)
SELECT c.cod_categoria,10,20,60,FALSE FROM categoria c
WHERE c.slug IN ('redes','seguridad-red','wifi-empresarial','cableado','energia-ups','videovigilancia-ip','servidores','almacenamiento','perifericos-profesionales','herramientas-red','racks','fibra-transceptores')
AND NOT EXISTS (SELECT 1 FROM regla_limite_compra r WHERE r.cod_categoria=c.cod_categoria AND r.cod_producto IS NULL AND r.activo);

DO $$
DECLARE item RECORD; supplier RECORD; supplier_no INTEGER;
BEGIN
  FOR item IN SELECT cod_producto,sku,precio_actual FROM producto WHERE sku LIKE 'RP-%' LOOP
    supplier_no := 0;
    FOR supplier IN SELECT cod_proveedor FROM proveedor WHERE activo ORDER BY calificacion DESC,cod_proveedor LIMIT 5 LOOP
      supplier_no := supplier_no + 1;
      PERFORM fn_asociar_producto_proveedor(item.cod_producto,supplier.cod_proveedor,item.sku||'-P'||supplier_no,round(item.precio_actual*.68,2),item.precio_actual,2+supplier_no,supplier_no,1,50,12+supplier_no);
    END LOOP;
  END LOOP;
END $$;

COMMIT;
