import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchProducts,
  fetchDestacados,
  fetchMasVendidos,
  fetchNuevos,
  fetchOfertas,
  fetchAutocomplete,
  type ProductItem,
  type PaginationMeta,
  type AutocompleteSuggestion,
} from '../api/products.api';
import { fetchCategories, type CategoryItem } from '../api/categories.api';

export function useProducts(params: {
  q?: string;
  categoria?: string;
  orden?: string;
  page?: number;
  per_page?: number;
} = {}) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [paginacion, setPaginacion] = useState<PaginationMeta>({
    page: 1,
    num_pages: 1,
    total: 0,
    has_next: false,
    has_previous: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { q, categoria, orden, page, per_page } = params;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchProducts({ q, categoria, orden, page, per_page });
      setProducts(res.productos);
      setPaginacion(res.paginacion);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [q, categoria, orden, page, per_page]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, paginacion, loading, error, refetch: load };
}

export function useProductCarousels() {
  const [destacados, setDestacados] = useState<ProductItem[]>([]);
  const [masVendidos, setMasVendidos] = useState<ProductItem[]>([]);
  const [nuevos, setNuevos] = useState<ProductItem[]>([]);
  const [ofertas, setOfertas] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCarousels = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const [dest, vend, nuev, ofer] = await Promise.all([
          fetchDestacados(),
          fetchMasVendidos(),
          fetchNuevos(),
          fetchOfertas(),
        ]);
        setDestacados(dest);
        setMasVendidos(vend);
        setNuevos(nuev);
        setOfertas(ofer);
      } catch (err: any) {
        setError(err.message || 'Error al cargar secciones de productos');
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    loadCarousels();
  }, [loadCarousels]);

  return { destacados, masVendidos, nuevos, ofertas, loading, error, refetch: loadCarousels };
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadCats() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCategories();
        if (mounted) {
          setCategories(data);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Error al cargar categorías');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadCats();
    return () => {
      mounted = false;
    };
  }, []);

  return { categories, loading, error };
}

export function useAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<any>(null);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (!newQuery.trim() || newQuery.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    setIsOpen(true);
    timerRef.current = setTimeout(async () => {
      try {
        const results = await fetchAutocomplete(newQuery);
        setSuggestions(results);
      } catch (err: unknown) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    suggestions,
    loading,
    isOpen,
    setIsOpen,
    close,
  };
}

export function useProductDetail(cod_producto: string | number | undefined) {
  const [product, setProduct] = useState<import('../api/products.api').ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cod_producto) {
      setProduct(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await import('../api/products.api').then((m) => m.fetchProductById(cod_producto));
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el detalle del producto.');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [cod_producto]);

  useEffect(() => {
    load();
  }, [load]);

  return { product, loading, error, refetch: load };
}

export function useProductQuestions(cod_producto: string | number | undefined) {
  const [questions, setQuestions] = useState<import('../api/products.api').ProductQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cod_producto) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await import('../api/products.api').then((m) => m.fetchProductQuestions(cod_producto));
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar preguntas.');
    } finally {
      setLoading(false);
    }
  }, [cod_producto]);

  useEffect(() => {
    load();
  }, [load]);

  return { questions, loading, error, refetch: load };
}

