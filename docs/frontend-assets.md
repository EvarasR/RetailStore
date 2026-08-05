# TechTail Marketplace — Catálogo Completo de Assets Vectoriales (FASE 2.1)

Todos los gráficos ilustrativos del storefront TechTail son SVGs vectoriales autogestionados, ligeros y libres de copyright creados específicamente en `frontend/src/assets/`.

## 1. Banners de Categorías Tecnológicas (`frontend/src/assets/`)

| Asset File | Categoría Tecnológica | Propósito y Estilo |
| :--- | :--- | :--- |
| `server-banner.svg` | **1. Servidores Enterprise** | Hero y banner principal de Servidores & Racks 2U/4U con gradiente Navy (#090e17) e iluminación cyan. |
| `network-banner.svg` | **2. Redes & Switches 10G** | Banner para conectividad y switches gestionados en gradiente Teal-Slate. |
| `ups-banner.svg` | **3. UPS & Energía** | Banner para sistemas UPS Online Doble Conversión y PDUs. |
| `cabling-banner.svg` | **4. Cableado & Fibra** | Banner de cableado estructurado Cat6A/Cat7 y fibra óptica certificada. |
| `video-banner.svg` | **5. Videovigilancia IP** | Banner de cámaras 4K PoE y grabadores NVR corporativos con analítica AI. |
| `storage-banner.svg` | **6. Almacenamiento NVMe/SAN** | Banner de cabinas SAN/NAS y discos de grado servidor. |
| `peripherals-banner.svg` | **7. Periféricos & KVM** | Banner para consolas KVM IP, bandejas y control de centros de datos. |
| `security-banner.svg` | **8. Ciberseguridad & UTM** | Banner para firewalls perimetrales y appliances VPN criptográficos. |

## 2. Placeholders y Estados del Sistema

| Asset File | Propósito | Descripción Visual |
| :--- | :--- | :--- |
| `product-placeholder.svg` | Imagen de respaldo (`onError` / vacía) para las ProductCards. | Iluminación cyan sobre chasis vectorial de servidor con LEDs de estado. |
| `empty-results.svg` | Ilustración para el componente `EmptyState`. | Lupa vectorial con interrogación sobre servidor en segundo plano. |

## 3. Uso en Componentes React (FASE 2.1)

- Las 8 categorías de tecnología del Home y del Catálogo usan esta iconografía vectorial.
- `ProductCard.tsx` aplica de forma automática y tolerante a fallos (`imgError` handler) el asset `product-placeholder.svg`.
- `EmptyState.tsx` utiliza `empty-results.svg` para estados sin productos o filtros excesivos.
