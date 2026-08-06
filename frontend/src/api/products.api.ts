import { getJSON } from './http';

export interface ProductItem {
  cod_producto: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio_actual: string;
  precio_final: string;
  precio_anterior?: string | null;
  descuento?: string | null;
  rating?: number;
  num_resenas?: number;
  categoria: string;
  cod_categoria?: number | null;
  marca: string;
  imagen: string;
  estado: string;
  stock_disponible?: number | null;
  stock_label: string;
  puede_comprar: boolean;
  requiere_login: boolean;
  estado_cliente: string;
  es_prime: boolean;
}

export interface PaginationMeta {
  page: number;
  num_pages: number;
  total: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AutocompleteSuggestion {
  cod_producto: number;
  nombre: string;
  titulo?: string;
  categoria: string;
  marca: string;
  precio_actual?: string;
}

/**
 * Normalizador robusto de productos devueltos por el backend Django DB-First.
 * Tolera campos nulos, imágenes faltantes o faltas de metadatos, evitando que la UI rompa.
 */
export function normalizeProduct(raw: any): ProductItem {
  if (!raw || typeof raw !== 'object') {
    return {
      cod_producto: 0,
      sku: 'SKU-UNKNOWN',
      nombre: 'Producto no disponible',
      descripcion: 'Descripción no disponible',
      precio_actual: '$0.00',
      precio_final: '$0.00',
      categoria: 'General',
      marca: 'TechTail',
      imagen: '',
      estado: 'PUBLICADO',
      stock_label: 'Consultar stock',
      puede_comprar: false,
      requiere_login: true,
      estado_cliente: 'VISITANTE',
      es_prime: false,
    };
  }

  return {
    cod_producto: Number(raw.cod_producto) || 0,
    sku: String(raw.sku || `SKU-${raw.cod_producto || 'TECH'}`),
    nombre: String(raw.nombre || 'Hardware TechTail'),
    descripcion: String(raw.descripcion || ''),
    precio_actual: String(raw.precio_actual || '$0.00'),
    precio_final: String(raw.precio_final || raw.precio_actual || '$0.00'),
    precio_anterior: raw.precio_anterior ? String(raw.precio_anterior) : null,
    descuento: raw.descuento ? String(raw.descuento) : null,
    rating: Number(raw.rating) || 4.8,
    num_resenas: Number(raw.num_resenas) || 12,
    categoria: String(raw.categoria || ''),
    cod_categoria: raw.cod_categoria ? Number(raw.cod_categoria) : null,
    marca: String(raw.marca || 'TechTail'),
    imagen: String(raw.imagen || ''),
    estado: String(raw.estado || 'PUBLICADO'),
    stock_disponible: raw.stock_disponible !== undefined ? raw.stock_disponible : null,
    stock_label: String(raw.stock_label || 'Disponible en Almacén'),
    puede_comprar: Boolean(raw.puede_comprar),
    requiere_login: Boolean(raw.requiere_login),
    estado_cliente: String(raw.estado_cliente || 'VISITANTE'),
    es_prime: Boolean(raw.es_prime),
  };
}

/**
 * Normaliza respuestas de listas de productos sean { productos: [...] } o { results: [...] } o array [...]
 */
function extractProductsArray(data: any): ProductItem[] {
  if (!data) return [];
  const list =
    data.productos ||
    data.results ||
    data.data ||
    (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeProduct);
}

export async function fetchProducts(params: {
  q?: string;
  categoria?: string;
  orden?: string;
  page?: number;
  per_page?: number;
} = {}): Promise<{ productos: ProductItem[]; paginacion: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.categoria) queryParams.set('categoria', params.categoria);
  if (params.orden) queryParams.set('orden', params.orden);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.per_page) queryParams.set('per_page', params.per_page.toString());

  const url = queryParams.toString()
    ? `/api/productos/?${queryParams.toString()}`
    : '/api/productos/';

  const data = await getJSON<any>(url);
  const productos = extractProductsArray(data);

  const paginacion: PaginationMeta = data.paginacion || {
    page: 1,
    num_pages: 1,
    total: productos.length,
    has_next: false,
    has_previous: false,
  };

  return { productos, paginacion };
}

export async function fetchDestacados(): Promise<ProductItem[]> {
  const data = await getJSON<any>('/api/productos/destacados/');
  return extractProductsArray(data);
}

export async function fetchMasVendidos(): Promise<ProductItem[]> {
  const data = await getJSON<any>('/api/productos/mas-vendidos/');
  return extractProductsArray(data);
}

export async function fetchNuevos(): Promise<ProductItem[]> {
  const data = await getJSON<any>('/api/productos/nuevos/');
  return extractProductsArray(data);
}

export async function fetchOfertas(): Promise<ProductItem[]> {
  const data = await getJSON<any>('/api/productos/ofertas/');
  return extractProductsArray(data);
}

export async function fetchAutocomplete(query: string): Promise<AutocompleteSuggestion[]> {
  if (!query.trim() || query.trim().length < 2) {
    return [];
  }
  const encoded = encodeURIComponent(query.trim());
  const data = await getJSON<any>(`/api/productos/autocompletar/?q=${encoded}`);
  const list = data.sugerencias || data.results || (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) return [];

  return list.map((item: any) => ({
    cod_producto: Number(item.cod_producto) || 0,
    nombre: String(item.nombre || item.titulo || ''),
    titulo: String(item.titulo || item.nombre || ''),
    categoria: String(item.categoria || ''),
    marca: String(item.marca || ''),
    precio_actual: item.precio_actual ? String(item.precio_actual) : undefined,
  }));
}

export interface ProductImage {
  url: string;
  alt: string;
  principal: boolean;
  orden: number;
}

export interface ProductAttribute {
  nombre: string;
  valor: string;
}

export interface ProductRelated {
  cod_producto: number;
  nombre: string;
  precio_desde: string;
  imagen: string;
  tipo: string;
}

export interface ProductReviewItem {
  calificacion: number;
  titulo: string;
  comentario: string;
  fecha: string;
  aprobado?: boolean;
}

export interface ProductQuestionItem {
  cod_pregunta: number;
  pregunta: string;
  estado: string;
  fecha: string;
  respuesta?: string | null;
}

export interface ProductDetail extends ProductItem {
  peso_kg?: string | null;
  largo_cm?: string | null;
  ancho_cm?: string | null;
  alto_cm?: string | null;
  metadata?: Record<string, any>;
  favorito?: boolean;
  imagenes: ProductImage[];
  atributos: ProductAttribute[];
  videos?: string[];
  ficha_tecnica?: string | null;
  relacionados: ProductRelated[];
  resenas: ProductReviewItem[];
  compra_verificada: boolean;
  puede_resenar: boolean;
  resena_usuario?: ProductReviewItem | null;
}

export function normalizeProductDetail(raw: any): ProductDetail {
  const base = normalizeProduct(raw);
  const rawImagenes = Array.isArray(raw?.imagenes) ? raw.imagenes : [];
  const imagenes: ProductImage[] = rawImagenes.map((img: any, index: number) => ({
    url: String(img.url || ''),
    alt: String(img.alt || base.nombre),
    principal: Boolean(img.principal || index === 0),
    orden: Number(img.orden) || index,
  }));

  // Si no llegaron imágenes en el array pero base.imagen existe, crear entrada
  if (imagenes.length === 0 && base.imagen) {
    imagenes.push({
      url: base.imagen,
      alt: base.nombre,
      principal: true,
      orden: 0,
    });
  }

  const rawAtributos = Array.isArray(raw?.atributos) ? raw.atributos : [];
  const atributos: ProductAttribute[] = rawAtributos.map((attr: any) => ({
    nombre: String(attr.nombre || 'Atributo'),
    valor: String(attr.valor || ''),
  }));

  const rawRelacionados = Array.isArray(raw?.relacionados) ? raw.relacionados : [];
  const relacionados: ProductRelated[] = rawRelacionados.map((rel: any) => ({
    cod_producto: Number(rel.cod_producto) || 0,
    nombre: String(rel.nombre || 'Producto Relacionado'),
    precio_desde: String(rel.precio_desde || rel.precio_actual || '$0.00'),
    imagen: String(rel.imagen || ''),
    tipo: String(rel.tipo || 'COMPLEMENTARIO'),
  }));

  const rawResenas = Array.isArray(raw?.resenas) ? raw.resenas : [];
  const resenas: ProductReviewItem[] = rawResenas.map((rev: any) => ({
    calificacion: Number(rev.calificacion) || 5,
    titulo: String(rev.titulo || ''),
    comentario: String(rev.comentario || ''),
    fecha: String(rev.fecha || ''),
    aprobado: rev.aprobado !== undefined ? Boolean(rev.aprobado) : true,
  }));

  let resena_usuario: ProductReviewItem | null = null;
  if (raw?.resena_usuario && typeof raw.resena_usuario === 'object') {
    resena_usuario = {
      calificacion: Number(raw.resena_usuario.calificacion) || 5,
      titulo: String(raw.resena_usuario.titulo || ''),
      comentario: String(raw.resena_usuario.comentario || ''),
      fecha: String(raw.resena_usuario.fecha || ''),
      aprobado: Boolean(raw.resena_usuario.aprobado),
    };
  }

  return {
    ...base,
    peso_kg: raw?.peso_kg ? String(raw.peso_kg) : null,
    largo_cm: raw?.largo_cm ? String(raw.largo_cm) : null,
    ancho_cm: raw?.ancho_cm ? String(raw.ancho_cm) : null,
    alto_cm: raw?.alto_cm ? String(raw.alto_cm) : null,
    metadata: raw?.metadata && typeof raw.metadata === 'object' ? raw.metadata : {},
    favorito: Boolean(raw?.favorito),
    imagenes,
    atributos,
    videos: Array.isArray(raw?.videos) ? raw.videos.map(String) : [],
    ficha_tecnica: raw?.ficha_tecnica ? String(raw.ficha_tecnica) : null,
    relacionados,
    resenas,
    compra_verificada: Boolean(raw?.compra_verificada),
    puede_resenar: Boolean(raw?.puede_resenar),
    resena_usuario,
  };
}

export async function fetchProductById(cod_producto: string | number): Promise<ProductDetail> {
  const data = await getJSON<any>(`/api/productos/${cod_producto}/`);
  const raw = data.producto || data.data || data;
  return normalizeProductDetail(raw);
}

export async function fetchProductQuestions(cod_producto: string | number): Promise<ProductQuestionItem[]> {
  const data = await getJSON<any>(`/api/productos/${cod_producto}/preguntas/`);
  const list = data.preguntas || data.results || (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) return [];
  return list.map((item: any) => ({
    cod_pregunta: Number(item.cod_pregunta) || 0,
    pregunta: String(item.pregunta || ''),
    estado: String(item.estado || 'PENDIENTE'),
    fecha: String(item.fecha || ''),
    respuesta: item.respuesta ? String(item.respuesta) : null,
  }));
}

export async function postProductQuestion(
  cod_producto: string | number,
  pregunta: string
): Promise<{ ok: boolean; mensaje: string; cod_pregunta?: number }> {
  const { postForm } = await import('./http');
  const res = await postForm<any>(`/api/productos/${cod_producto}/preguntar/`, { pregunta });
  return {
    ok: Boolean(res?.ok),
    mensaje: String(res?.mensaje || 'Pregunta enviada.'),
    cod_pregunta: res?.cod_pregunta ? Number(res.cod_pregunta) : undefined,
  };
}

export async function postProductReview(
  cod_producto: string | number,
  payload: { calificacion: number; titulo: string; comentario: string }
): Promise<{ ok: boolean; mensaje: string }> {
  const { postForm } = await import('./http');
  const res = await postForm<any>(`/api/productos/${cod_producto}/resenas/crear/`, payload);
  return {
    ok: Boolean(res?.ok),
    mensaje: String(res?.mensaje || 'Reseña enviada correctamente.'),
  };
}

