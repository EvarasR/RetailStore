import React from 'react';
import { Truck, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { ProductDetail } from '../../api/products.api';

export interface ProductDeliveryPanelProps {
  product: ProductDetail;
}

export const ProductDeliveryPanel: React.FC<ProductDeliveryPanelProps> = ({ product }) => {
  const isAvailable = product.puede_comprar;
  const stockCount = typeof product.stock_disponible === 'number' ? product.stock_disponible : null;
  const esPrime = product.es_prime;
  const isLowStock = stockCount !== null && stockCount > 0 && stockCount <= 5;
  const isOutOfStock = stockCount === 0;

  return (
    <div className="tt-delivery-panel">
      {/* Estado de Disponibilidad */}
      <div className="tt-delivery-panel__status">
        {isOutOfStock ? (
          <div className="tt-delivery-panel__status-badge tt-delivery-panel__status-badge--out">
            <AlertTriangle size={18} />
            <span>Consultar disponibilidad / Bajo pedido</span>
          </div>
        ) : isLowStock ? (
          <div className="tt-delivery-panel__status-badge tt-delivery-panel__status-badge--low">
            <Clock size={18} />
            <span>{product.stock_label || `Stock limitado: ${stockCount} disponibles`}</span>
          </div>
        ) : isAvailable ? (
          <div className="tt-delivery-panel__status-badge tt-delivery-panel__status-badge--in">
            <CheckCircle2 size={18} />
            <span>{product.stock_label || 'Disponible para envío inmediato'}</span>
          </div>
        ) : (
          <div className="tt-delivery-panel__status-badge tt-delivery-panel__status-badge--check">
            <Clock size={18} />
            <span>{product.stock_label || 'Stock sujeto a confirmación'}</span>
          </div>
        )}
      </div>

      {/* Envío y Garantías */}
      <div className="tt-delivery-panel__info-list">
        <div className="tt-delivery-panel__item">
          <Truck size={18} className="tt-delivery-panel__icon" />
          <div className="tt-delivery-panel__text">
            <strong>{esPrime ? 'Envío prioritario GRATIS' : 'Envío nacional asegurado'}</strong>
            <span>
              {esPrime
                ? 'Entrega rápida garantizada a tu dirección Prime.'
                : 'Despacho corporativo terrestre o aéreo nacional.'}
            </span>
          </div>
        </div>

        <div className="tt-delivery-panel__item">
          <ShieldCheck size={18} className="tt-delivery-panel__icon" />
          <div className="tt-delivery-panel__text">
            <strong>Garantía corporativa TechTail</strong>
            <span>30 días de reemplazo exprés • Soporte técnico oficial.</span>
          </div>
        </div>
      </div>

      {/* Información de Proveedor / Logística de Almacén */}
      <div className="tt-delivery-panel__vendor-info">
        <span>Enviado por: <strong>TechTail Warehouse</strong></span>
        <span>Vendido por: <strong>{product.marca || 'TechTail Direct'}</strong></span>
      </div>
    </div>
  );
};
