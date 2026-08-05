export interface AdminPromotionAssociation {
  promocion: string;
  producto: string;
  cod_promocion: number;
  cod_producto: number;
}

export interface AdminPromotionsResponse {
  asociaciones: AdminPromotionAssociation[];
}
