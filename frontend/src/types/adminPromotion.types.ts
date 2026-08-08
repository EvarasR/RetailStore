export interface AdminPromotionAssociation {
  promocion: string;
  producto: string;
  cod_promocion: number;
  cod_producto: number;
}

export interface AdminPromotionCategoryAssociation {
  promocion: string;
  categoria: string;
  cod_promocion: number;
  cod_categoria: number;
}

export interface AdminPromotion {
  cod_promocion: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO';
  valor: string;
  inicio: string;
  fin: string;
  acumulable: boolean;
  activo: boolean;
}

export interface AdminPromotionProduct { cod_producto: number; nombre: string; sku: string; categoria: string; }
export interface AdminPromotionCategory { cod_categoria: number; nombre: string; activo: boolean; }

export interface AdminPromotionsResponse {
  promociones: AdminPromotion[];
  productos: AdminPromotionProduct[];
  categorias: AdminPromotionCategory[];
  asociaciones: AdminPromotionAssociation[];
  asociaciones_categorias: AdminPromotionCategoryAssociation[];
}
