export interface CatalogCategory {
  cod_categoria: number;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  activo: boolean;
  total_productos?: number;
}

export interface CatalogBrand {
  cod_marca: number;
  nombre: string;
  activo: boolean;
}

export interface CatalogSupplier {
  cod_proveedor: number;
  nombre: string;
  razon_social: string;
  ruc: string;
  activo: boolean;
}

export interface CatalogAttribute {
  cod_atributo: number;
  nombre: string;
  tipo_dato: string;
  activo: boolean;
}

export interface CatalogProductOption {
  cod_producto: number;
  nombre: string;
  sku: string;
  categoria: string;
}

export interface ProductCatalogOptions {
  categorias: CatalogCategory[];
  marcas: CatalogBrand[];
  proveedores: CatalogSupplier[];
  atributos: CatalogAttribute[];
  productos: CatalogProductOption[];
}

export interface ProductSupplierDraft {
  cod_proveedor: number;
  sku_proveedor: string;
  costo_unitario: string;
  precio_sugerido?: string;
  tiempo_entrega_dias: number;
  prioridad: number;
  pedido_minimo: number;
  pedido_maximo?: number;
  cantidad_disponible: number;
}

export interface ProductIntegralDraft {
  cod_categoria: number;
  cod_marca: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio_actual: string;
  peso_kg: string;
  largo_cm: string;
  ancho_cm: string;
  alto_cm: string;
  limite_por_pedido: number;
  limite_por_dia?: number;
  limite_por_mes?: number;
  requiere_revision: boolean;
  proveedores: ProductSupplierDraft[];
  atributos: Array<{ cod_atributo: number; valor: string }>;
  relacionados: Array<{ cod_producto: number; tipo: string }>;
  imagenes: File[];
  videos: File[];
  ficha_tecnica: File | null;
}

export interface ProductManagementImage {
  cod_imagen: number;
  url: string;
  alt_text?: string | null;
  principal: boolean;
  orden: number;
  activo: boolean;
}

export interface ProductManagementData {
  producto: {
    cod_producto: number;
    sku: string;
    nombre: string;
    descripcion: string;
    precio: string;
    cod_categoria: number;
    categoria: string;
    cod_marca: number;
    marca: string;
    estado: string;
    peso_kg: string;
    largo_cm: string;
    ancho_cm: string;
    alto_cm: string;
  };
  publicacion: { publicable: boolean; faltantes: string[]; completitud: number };
  imagenes: ProductManagementImage[];
  archivos: {
    videos: Array<{ url: string; titulo?: string }>;
    ficha_tecnica?: { url: string; titulo?: string } | null;
  };
  proveedores: Array<{
    cod_producto_proveedor: number;
    cod_proveedor: number;
    proveedor: string;
    costo: string;
    plazo_dias: number;
    prioridad: number;
    stock?: number | null;
    activo: boolean;
  }>;
  valores: Array<{ cod_atributo: number; atributo: string; valor: string; activo: boolean }>;
  relacionados: Array<{ cod_producto: number; nombre: string; sku: string; tipo: string }>;
}
