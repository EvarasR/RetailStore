import { getJSON } from './http';

export interface CategoryItem {
  cod_categoria: number;
  nombre: string;
  slug: string;
  descripcion?: string;
}

export interface CategoriesResponse {
  ok?: boolean;
  categorias?: CategoryItem[];
}

export function normalizeCategory(raw: any): CategoryItem {
  return {
    cod_categoria: Number(raw?.cod_categoria) || 0,
    nombre: String(raw?.nombre || 'Categoría Genérica'),
    slug: String(raw?.slug || 'general'),
    descripcion: raw?.descripcion ? String(raw.descripcion) : '',
  };
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const data = await getJSON<any>('/api/categorias/');
  const list = data?.categorias || data?.results || (Array.isArray(data) ? data : []);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeCategory);
}
