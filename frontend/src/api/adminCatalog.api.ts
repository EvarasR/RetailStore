import { getJSON, postForm } from './http';
import type {
  CatalogCategory,
  ProductCatalogOptions,
  ProductIntegralDraft,
  ProductManagementData,
} from '../types/adminCatalog.types';

export async function fetchProductCatalogOptions(): Promise<ProductCatalogOptions> {
  return getJSON<ProductCatalogOptions>('/panel/api/catalogo/?entidad=opciones_producto&activos=0');
}

export async function fetchAdminCategories(): Promise<CatalogCategory[]> {
  const data = await getJSON<{ registros?: CatalogCategory[] }>('/panel/api/catalogo/?entidad=categoria&activos=0');
  return data.registros || [];
}

export function createAdminCategory(values: { nombre: string; slug?: string; descripcion?: string }): Promise<{ mensaje: string; cod_categoria: number }> {
  return postForm('/panel/api/categorias/', values);
}

export function updateAdminCategory(codCategoria: number, values: Record<string, unknown>): Promise<{ mensaje: string }> {
  return postForm(`/panel/api/categorias/${codCategoria}/`, values);
}

export async function createIntegralAdminProduct(draft: ProductIntegralDraft): Promise<{ mensaje: string; cod_producto: number; publicado: boolean }> {
  const form = new FormData();
  const scalarFields: Record<string, unknown> = {
    cod_categoria: draft.cod_categoria,
    cod_marca: draft.cod_marca,
    sku: draft.sku,
    nombre: draft.nombre,
    descripcion: draft.descripcion,
    precio_actual: draft.precio_actual,
    peso_kg: draft.peso_kg || '0',
    largo_cm: draft.largo_cm || '0',
    ancho_cm: draft.ancho_cm || '0',
    alto_cm: draft.alto_cm || '0',
    limite_por_pedido: draft.limite_por_pedido,
    limite_por_dia: draft.limite_por_dia || '',
    limite_por_mes: draft.limite_por_mes || '',
    requiere_revision: draft.requiere_revision,
    proveedores: JSON.stringify(draft.proveedores),
    atributos: JSON.stringify(draft.atributos),
    relacionados: JSON.stringify(draft.relacionados),
    publicar: true,
  };
  Object.entries(scalarFields).forEach(([key, value]) => form.append(key, String(value ?? '')));
  draft.imagenes.forEach((file) => form.append('imagenes', file));
  draft.videos.forEach((file) => form.append('videos', file));
  if (draft.ficha_tecnica) form.append('ficha_tecnica', draft.ficha_tecnica);
  return postForm('/panel/api/productos/crear-integral/', form);
}

export function fetchProductManagement(codProducto: number): Promise<ProductManagementData> {
  return getJSON<ProductManagementData>(`/panel/api/productos/${codProducto}/gestion/`);
}

export function updateAdminProduct(codProducto: number, values: Record<string, unknown>): Promise<{ mensaje: string }> {
  return postForm(`/panel/api/productos/${codProducto}/actualizar/`, values);
}

export async function uploadProductImages(codProducto: number, files: File[]): Promise<void> {
  for (const [index, file] of files.entries()) {
    const form = new FormData();
    form.append('archivo', file);
    form.append('orden', String(index + 1));
    form.append('es_principal', String(index === 0));
    await postForm(`/panel/api/productos/${codProducto}/imagenes/`, form);
  }
}

export function updateProductImage(codImagen: number, values: Record<string, unknown>): Promise<{ mensaje: string }> {
  return postForm(`/panel/api/imagenes/${codImagen}/`, values);
}

export function uploadProductFile(codProducto: number, tipo: 'VIDEO' | 'FICHA', file: File): Promise<{ mensaje: string; url: string }> {
  const form = new FormData();
  form.append('tipo', tipo);
  form.append('archivo', file);
  return postForm(`/panel/api/productos/${codProducto}/archivos/`, form);
}

export function removeProductFile(codProducto: number, tipo: 'VIDEO' | 'FICHA', url: string): Promise<{ mensaje: string }> {
  return postForm(`/panel/api/productos/${codProducto}/archivos/`, { tipo, url, eliminar: true });
}

export function associateProductSupplier(values: Record<string, unknown>): Promise<{ mensaje: string }> {
  return postForm('/panel/api/producto-proveedor/', values);
}

export function removeProductSupplier(codProducto: number, codProveedor: number): Promise<{ mensaje: string }> {
  return postForm('/panel/api/producto-proveedor/', {
    desasociar: true, cod_producto: codProducto, cod_proveedor: codProveedor,
  });
}

export function updateProductAttribute(codProducto: number, codAtributo: number, valor: string, desasociar = false): Promise<{ mensaje: string }> {
  return postForm('/panel/api/atributos/valores/', {
    cod_producto: codProducto, cod_atributo: codAtributo, valor, desasociar,
  });
}

export function updateRelatedProduct(codProducto: number, codRelacionado: number, desasociar = false): Promise<{ mensaje: string }> {
  return postForm(`/panel/api/productos/${codProducto}/relacionados/`, {
    cod_producto_relacionado: codRelacionado, tipo: 'RELACIONADO', desasociar,
  });
}
