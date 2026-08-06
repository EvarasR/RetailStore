export interface AdminProductItem {
  cod_producto: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  cod_categoria?: number;
  categoria: string;
  cod_marca?: number;
  marca: string;
  precio: string;
  peso_kg?: string;
  largo_cm?: string;
  ancho_cm?: string;
  alto_cm?: string;
  estado: string;
  stock?: number | null;
  imagen?: string;
  publicable: boolean;
  faltantes: string[];
  completitud: number;
  fecha?: string | null;
}

export interface AdminProductsResponse {
  ok: boolean;
  productos: AdminProductItem[];
}

export interface AdminProductActionResponse {
  ok: boolean;
  mensaje: string;
}
