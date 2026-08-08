import React, { useEffect, useState } from 'react';
import { CalendarClock, Play, Power } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { AdminMutationForm } from '../../components/admin/AdminMutationForm';
import { useRecurringPurchases } from '../../hooks/useRecurringPurchases';
import { fetchProducts, type ProductItem } from '../../api/products.api';

export const RecurringPurchasesPage: React.FC = () => {
  const { purchases, enabled, loading, error, create, update, addProduct, execute } = useRecurringPurchases();
  const [message, setMessage] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<ProductItem[]>([]);
  useEffect(() => { fetchProducts({ page: 1 }).then((response) => setCatalog(response.productos || [])).catch(() => setCatalog([])); }, []);
  return (
    <AccountLayout title="Compras recurrentes" subtitle="Programa reposiciones Prime; stock, límites y valores se validan nuevamente al ejecutar.">
      {error && <Alert variant="error">{error}</Alert>}
      {!loading && !enabled && <Alert variant="warning">Necesitas una membresía Prime activa para crear o ejecutar compras recurrentes.</Alert>}
      {enabled && <AdminMutationForm
        title="Nueva compra recurrente" description="Define la frecuencia y próxima ejecución oficial." submitLabel="Crear programación"
        fields={[{ name: 'nombre', label: 'Nombre', required: true }, { name: 'frecuencia_dias', label: 'Frecuencia en días', type: 'number', required: true }, { name: 'proxima_ejecucion', label: 'Próxima ejecución', type: 'date', required: true }]}
        onSubmit={async (values) => (await create(values)) as { mensaje?: string }}
      />}
      {message && <Alert variant="success">{message}</Alert>}
      {loading ? <Skeleton height="240px" /> : purchases.length === 0 ? (
        <div className="tt-card tt-account-empty"><CalendarClock size={40} /><p>No tienes compras recurrentes configuradas.</p></div>
      ) : <div className="tt-recurring-grid">{purchases.map((purchase) => (
        <article className="tt-card tt-recurring-card" key={purchase.cod_compra}>
          <header><div><h2>{purchase.nombre}</h2><p>Cada {purchase.frecuencia_dias} días · Próxima: {purchase.proxima_ejecucion}</p></div><span className={`status-badge ${purchase.activa ? 'status-active' : 'status-inactive'}`}>{purchase.activa ? 'ACTIVA' : 'PAUSADA'}</span></header>
          <ul>{purchase.productos.map((product) => <li key={product.cod_producto}><span>{product.producto} × {product.cantidad}</span><strong>{product.precio}</strong></li>)}</ul>
          <form className="tt-recurring-inline" onSubmit={async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { const result = await addProduct(purchase.cod_compra, { cod_producto: form.get('cod_producto'), cantidad: form.get('cantidad') }) as { mensaje?: string }; setMessage(result.mensaje || 'Producto agregado.'); event.currentTarget.reset(); } catch (reason) { setMessage(reason instanceof Error ? reason.message : 'No se pudo agregar el producto.'); } }}>
            <label>Producto<select name="cod_producto" required defaultValue=""><option value="" disabled>Selecciona un producto</option>{catalog.filter((product) => !purchase.productos.some((current) => current.cod_producto === product.cod_producto)).map((product) => <option key={product.cod_producto} value={product.cod_producto}>{product.nombre} · {product.sku}</option>)}</select></label><label>Cantidad<input name="cantidad" type="number" min="1" required /></label><button className="tt-btn tt-btn--secondary" type="submit" disabled={!enabled || !purchase.activa}>Agregar producto</button>
          </form>
          <footer>
            <button className="tt-btn tt-btn--secondary" type="button" onClick={async () => { const result = await update(purchase.cod_compra, { activa: !purchase.activa, nombre: purchase.nombre, frecuencia_dias: purchase.frecuencia_dias, proxima_ejecucion: purchase.proxima_ejecucion }) as { mensaje?: string }; setMessage(result.mensaje || 'Programación actualizada.'); }}><Power size={15} />{purchase.activa ? 'Pausar' : 'Activar'}</button>
            <button className="tt-btn tt-btn--primary" type="button" disabled={!enabled || !purchase.activa || purchase.productos.length === 0} onClick={async () => { const result = await execute(purchase.cod_compra) as { mensaje?: string }; setMessage(result.mensaje || 'Carrito preparado.'); }}><Play size={15} />Preparar carrito</button>
          </footer>
        </article>
      ))}</div>}
    </AccountLayout>
  );
};
