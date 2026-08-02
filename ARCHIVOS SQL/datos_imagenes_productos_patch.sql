-- Retail Prime: galería SVG local para productos técnicos.
-- Ejecutar manualmente DESPUÉS de datos_productos_demo_patch.sql.
-- No ejecutar directamente en producción sin una revisión y respaldo previos.
BEGIN;

WITH mapping(sku,url,alt_text,orden) AS (VALUES
('RP-SW-POE24','/media/productos/switches/switch-poe-24p-01.svg','Switch PoE+ 24 puertos, vista frontal',1),('RP-SW-POE24','/media/productos/switches/switch-poe-24p-02.svg','Switch PoE+ instalado en rack',2),
('RP-RTR-DUALWAN','/media/productos/routers/router-empresarial-01.svg','Router empresarial Dual WAN',1),('RP-RTR-DUALWAN','/media/productos/routers/router-empresarial-02.svg','Cobertura del router empresarial',2),
('RP-FW-1200','/media/productos/firewalls/firewall-empresa-01.svg','Firewall empresarial, vista frontal',1),('RP-FW-1200','/media/productos/firewalls/firewall-empresa-02.svg','Protección de red del firewall',2),
('RP-AP-WIFI6','/media/productos/access-points/access-point-wifi6-01.svg','Access point WiFi 6 de techo',1),
('RP-CAT6-305','/media/productos/cableado/cable-utp-cat6-01.svg','Bobina de cable UTP Cat6',1),
('RP-PP-24','/media/productos/cableado/patch-panel-24p-01.svg','Patch panel Cat6 de 24 puertos',1),
('RP-UPS-2200','/media/productos/ups/ups-rack-01.svg','UPS online de 2200 VA',1),('RP-UPS-2200','/media/productos/ups/ups-rack-02.svg','UPS online instalado en rack',2),
('RP-CAM-4KPOE','/media/productos/camaras/camara-ip-poe-01.svg','Cámara IP PoE 4K',1),
('RP-NVR-8','/media/productos/camaras/nvr-8-canales-01.svg','NVR PoE de ocho canales',1),
('RP-SRV-1U','/media/productos/servidores/servidor-rack-01.svg','Servidor empresarial de rack',1),
('RP-NAS-4B','/media/productos/servidores/nas-4-bahias-01.svg','NAS empresarial de cuatro bahías',1),
('RP-SSD-1TB','/media/productos/almacenamiento/ssd-1tb-01.svg','SSD empresarial de 1 TB',1),
('RP-MON-27QHD','/media/productos/perifericos/monitor-27-01.svg','Monitor profesional QHD de 27 pulgadas',1),
('RP-TEST-NET','/media/productos/herramientas/tester-red-01.svg','Tester digital de cableado',1),
('RP-RACK-24U','/media/productos/racks/rack-24u-01.svg','Gabinete rack 24U',1),
('RP-SFP-10G','/media/productos/switches/switch-poe-24p-02.svg','Transceptor instalado en infraestructura de red',1)
)
UPDATE producto_imagen pi SET es_principal=FALSE
FROM producto p WHERE p.cod_producto=pi.cod_producto AND p.sku LIKE 'RP-%';

WITH mapping(sku,url,alt_text,orden) AS (VALUES
('RP-SW-POE24','/media/productos/switches/switch-poe-24p-01.svg','Switch PoE+ 24 puertos, vista frontal',1),('RP-SW-POE24','/media/productos/switches/switch-poe-24p-02.svg','Switch PoE+ instalado en rack',2),('RP-RTR-DUALWAN','/media/productos/routers/router-empresarial-01.svg','Router empresarial Dual WAN',1),('RP-RTR-DUALWAN','/media/productos/routers/router-empresarial-02.svg','Cobertura del router empresarial',2),('RP-FW-1200','/media/productos/firewalls/firewall-empresa-01.svg','Firewall empresarial, vista frontal',1),('RP-FW-1200','/media/productos/firewalls/firewall-empresa-02.svg','Protección de red del firewall',2),('RP-AP-WIFI6','/media/productos/access-points/access-point-wifi6-01.svg','Access point WiFi 6 de techo',1),('RP-CAT6-305','/media/productos/cableado/cable-utp-cat6-01.svg','Bobina de cable UTP Cat6',1),('RP-PP-24','/media/productos/cableado/patch-panel-24p-01.svg','Patch panel Cat6 de 24 puertos',1),('RP-UPS-2200','/media/productos/ups/ups-rack-01.svg','UPS online de 2200 VA',1),('RP-UPS-2200','/media/productos/ups/ups-rack-02.svg','UPS online instalado en rack',2),('RP-CAM-4KPOE','/media/productos/camaras/camara-ip-poe-01.svg','Cámara IP PoE 4K',1),('RP-NVR-8','/media/productos/camaras/nvr-8-canales-01.svg','NVR PoE de ocho canales',1),('RP-SRV-1U','/media/productos/servidores/servidor-rack-01.svg','Servidor empresarial de rack',1),('RP-NAS-4B','/media/productos/servidores/nas-4-bahias-01.svg','NAS empresarial de cuatro bahías',1),('RP-SSD-1TB','/media/productos/almacenamiento/ssd-1tb-01.svg','SSD empresarial de 1 TB',1),('RP-MON-27QHD','/media/productos/perifericos/monitor-27-01.svg','Monitor profesional QHD de 27 pulgadas',1),('RP-TEST-NET','/media/productos/herramientas/tester-red-01.svg','Tester digital de cableado',1),('RP-RACK-24U','/media/productos/racks/rack-24u-01.svg','Gabinete rack 24U',1),('RP-SFP-10G','/media/productos/switches/switch-poe-24p-02.svg','Transceptor instalado en infraestructura de red',1))
INSERT INTO producto_imagen(cod_producto,url_imagen,alt_text,es_principal,orden,activo)
SELECT p.cod_producto,m.url,m.alt_text,FALSE,m.orden,TRUE FROM mapping m JOIN producto p ON p.sku=m.sku
WHERE NOT EXISTS (SELECT 1 FROM producto_imagen x WHERE x.cod_producto=p.cod_producto AND x.url_imagen=m.url);

WITH preferred(sku,url) AS (VALUES
('RP-SW-POE24','/media/productos/switches/switch-poe-24p-01.svg'),('RP-RTR-DUALWAN','/media/productos/routers/router-empresarial-01.svg'),('RP-FW-1200','/media/productos/firewalls/firewall-empresa-01.svg'),('RP-AP-WIFI6','/media/productos/access-points/access-point-wifi6-01.svg'),('RP-CAT6-305','/media/productos/cableado/cable-utp-cat6-01.svg'),('RP-PP-24','/media/productos/cableado/patch-panel-24p-01.svg'),('RP-UPS-2200','/media/productos/ups/ups-rack-01.svg'),('RP-CAM-4KPOE','/media/productos/camaras/camara-ip-poe-01.svg'),('RP-NVR-8','/media/productos/camaras/nvr-8-canales-01.svg'),('RP-SRV-1U','/media/productos/servidores/servidor-rack-01.svg'),('RP-NAS-4B','/media/productos/servidores/nas-4-bahias-01.svg'),('RP-SSD-1TB','/media/productos/almacenamiento/ssd-1tb-01.svg'),('RP-MON-27QHD','/media/productos/perifericos/monitor-27-01.svg'),('RP-TEST-NET','/media/productos/herramientas/tester-red-01.svg'),('RP-RACK-24U','/media/productos/racks/rack-24u-01.svg'),('RP-SFP-10G','/media/productos/switches/switch-poe-24p-02.svg'))
UPDATE producto_imagen pi SET es_principal=TRUE,activo=TRUE,orden=1
FROM preferred m JOIN producto p ON p.sku=m.sku
WHERE pi.cod_producto=p.cod_producto AND pi.url_imagen=m.url;

-- La publicación se hace al final, cuando ya existen imagen principal,
-- cinco proveedores activos, stock proveedor y regla de límite retail.
DO $$
DECLARE item RECORD;
BEGIN
  FOR item IN SELECT cod_producto FROM producto WHERE sku LIKE 'RP-%' LOOP
    PERFORM fn_publicar_producto(item.cod_producto);
  END LOOP;
END $$;

COMMIT;
