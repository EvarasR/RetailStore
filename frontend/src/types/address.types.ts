export interface Address {
  cod_direccion: number;
  alias: string;
  receptor: string;
  linea1: string;
  linea2?: string | null;
  ciudad: string;
  provincia: string;
  cod_provincia?: number | null;
  cod_canton?: number | null;
  pais: string;
  codigo_postal?: string | null;
  telefono_contacto?: string | null;
  es_predeterminada: boolean;
}

export interface ProvinciaItem {
  cod_provincia: number;
  nombre: string;
}

export interface CantonItem {
  cod_canton: number;
  cod_provincia: number;
  provincia: string;
  nombre: string;
}

export interface UbicacionesData {
  ok: boolean;
  provincias: ProvinciaItem[];
  cantones: CantonItem[];
}
