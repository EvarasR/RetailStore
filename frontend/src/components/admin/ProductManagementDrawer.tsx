import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, FileText, ImagePlus, Star, Trash2, Video } from 'lucide-react';
import {
  associateProductSupplier, fetchProductManagement, removeProductFile, removeProductSupplier,
  updateAdminProduct, updateProductAttribute, updateProductImage, updateRelatedProduct,
  uploadProductFile, uploadProductImages,
} from '../../api/adminCatalog.api';
import type { ProductCatalogOptions, ProductManagementData } from '../../types/adminCatalog.types';
import { AdminDrawer } from './AdminDrawer';
import { ConfirmDialog } from './ConfirmDialog';
import { EntitySearchSelect } from './EntitySearchSelect';
import { FileDropzone } from './FileDropzone';

interface ProductManagementDrawerProps {
  productId: number | null;
  options: ProductCatalogOptions;
  onClose: () => void;
  onChanged: (message: string) => void;
  initialTab?: ProductManagementTab;
}

export type ProductManagementTab = 'datos' | 'multimedia' | 'proveedores' | 'especificaciones';

export const ProductManagementDrawer: React.FC<ProductManagementDrawerProps> = ({ productId, options, onClose, onChanged, initialTab = 'datos' }) => {
  const [data, setData] = useState<ProductManagementData | null>(null);
  const [tab, setTab] = useState<ProductManagementTab>('datos');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File[]>([]);
  const [pdf, setPdf] = useState<File[]>([]);
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [attributeId, setAttributeId] = useState<number | null>(null);
  const [attributeValue, setAttributeValue] = useState('');
  const [relatedId, setRelatedId] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; message: string; run: () => Promise<unknown> } | null>(null);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true); setError(null);
    try { setData(await fetchProductManagement(productId)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar el producto.'); }
    finally { setLoading(false); }
  }, [productId]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (productId) { setTab(initialTab); setImages([]); setVideo([]); setPdf([]); } }, [productId, initialTab]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true); setError(null);
    try { await action(); await load(); onChanged(success); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible guardar los cambios.'); }
    finally { setBusy(false); setConfirm(null); }
  };
  const productOptions = useMemo(() => options.productos.filter((product) => product.cod_producto !== productId).map((product) => ({ value: product.cod_producto, label: product.nombre, description: `${product.sku} · ${product.categoria}` })), [options.productos, productId]);

  return <AdminDrawer open={Boolean(productId)} title={data ? `Gestionar ${data.producto.nombre}` : 'Gestionar producto'} onClose={onClose} wide>
    {loading ? <div className="admin-loading-state">Cargando producto…</div> : null}
    {error ? <div className="admin-alert admin-alert-error" role="alert">{error}</div> : null}
    {data ? <>
      <nav className="admin-tabs" aria-label="Secciones del producto">{([['datos', 'Datos'], ['multimedia', 'Multimedia y PDF'], ['proveedores', 'Proveedores'], ['especificaciones', 'Especificaciones']] as Array<[ProductManagementTab, string]>).map(([value, label]) => <button type="button" key={value} className={tab === value ? 'is-active' : ''} onClick={() => setTab(value)}>{label}</button>)}</nav>

      {tab === 'datos' ? <form className="admin-form-section" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); run(() => updateAdminProduct(data.producto.cod_producto, Object.fromEntries(form.entries())), 'Producto actualizado.'); }}>
        <header><h3>Datos del producto</h3><p>Edita utilizando nombres y selectores; precio y stock siguen siendo oficiales.</p></header><div className="admin-form-grid">
          <label className="admin-field"><span className="admin-field__label">Nombre *</span><input name="nombre" defaultValue={data.producto.nombre} required /></label>
          <label className="admin-field"><span className="admin-field__label">Código / SKU *</span><input name="sku" defaultValue={data.producto.sku} required /></label>
          <EntitySearchSelect label="Categoría" required value={data.producto.cod_categoria} onChange={(value) => setData((current) => current ? { ...current, producto: { ...current.producto, cod_categoria: Number(value) } } : current)} options={options.categorias.filter((item) => item.activo).map((item) => ({ value: item.cod_categoria, label: item.nombre }))} />
          <input type="hidden" name="cod_categoria" value={data.producto.cod_categoria} />
          <EntitySearchSelect label="Marca" required value={data.producto.cod_marca} onChange={(value) => setData((current) => current ? { ...current, producto: { ...current.producto, cod_marca: Number(value) } } : current)} options={options.marcas.filter((item) => item.activo).map((item) => ({ value: item.cod_marca, label: item.nombre }))} />
          <input type="hidden" name="cod_marca" value={data.producto.cod_marca} />
          <label className="admin-field admin-field--full"><span className="admin-field__label">Descripción</span><textarea name="descripcion" rows={5} defaultValue={data.producto.descripcion} /></label>
          <label className="admin-field"><span className="admin-field__label">Precio base registrado</span><input name="precio_actual" type="number" min="0.01" step="0.01" defaultValue={data.producto.precio} /></label>
          {(['peso_kg', 'largo_cm', 'ancho_cm', 'alto_cm'] as const).map((field) => <label className="admin-field" key={field}><span className="admin-field__label">{field === 'peso_kg' ? 'Peso (kg)' : `${field.replace('_cm', '')} (cm)`}</span><input name={field} type="number" min="0" step="0.01" defaultValue={data.producto[field]} /></label>)}
        </div><footer className="admin-form-actions"><button type="submit" className="tt-btn tt-btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></footer>
      </form> : null}

      {tab === 'multimedia' ? <section className="admin-form-section"><header><h3>Galería, videos y ficha técnica</h3><p>Sube archivos reales; nunca necesitas pegar rutas o URLs.</p></header>
        <div className="admin-existing-media"><h4>Imágenes</h4>{data.imagenes.length ? data.imagenes.filter((item) => item.activo).map((image) => <article key={image.cod_imagen}><img src={image.url} alt={image.alt_text || data.producto.nombre} /><span>{image.principal ? <strong><Star size={14} /> Principal</strong> : `Posición ${image.orden}`}</span><div>
          <button type="button" title="Subir" onClick={() => run(() => updateProductImage(image.cod_imagen, { accion: 'ordenar', orden: Math.max(1, image.orden - 1), es_principal: image.principal }), 'Galería reordenada.')}><ArrowUp size={15} /></button>
          <button type="button" title="Bajar" onClick={() => run(() => updateProductImage(image.cod_imagen, { accion: 'ordenar', orden: image.orden + 1, es_principal: image.principal }), 'Galería reordenada.')}><ArrowDown size={15} /></button>
          {!image.principal ? <button type="button" title="Marcar principal" onClick={() => run(() => updateProductImage(image.cod_imagen, { accion: 'ordenar', orden: 1, es_principal: true }), 'Imagen principal actualizada.')}><Star size={15} /></button> : null}
          <button type="button" title="Eliminar" onClick={() => setConfirm({ title: 'Eliminar imagen', message: 'La imagen dejará de estar disponible y se retirará del almacenamiento local.', run: () => updateProductImage(image.cod_imagen, { accion: 'desactivar' }) })}><Trash2 size={15} /></button>
        </div></article>) : <div className="admin-empty-inline">Este producto todavía no tiene imágenes.</div>}</div>
        <FileDropzone label="Añadir imágenes" files={images} onChange={setImages} accept="image/jpeg,image/png,image/webp" multiple />
        <button type="button" className="tt-btn tt-btn--secondary" disabled={!images.length || busy} onClick={() => run(() => uploadProductImages(data.producto.cod_producto, images), 'Imágenes subidas.').then(() => setImages([]))}><ImagePlus size={16} />Subir imágenes</button>
        <div className="admin-existing-files"><article><h4><Video size={18} /> Videos</h4>{data.archivos.videos.length ? data.archivos.videos.map((item) => <div key={item.url}><video src={item.url} controls preload="metadata" /><span>{item.titulo || 'Video del producto'}</span><button type="button" onClick={() => setConfirm({ title: 'Eliminar video', message: 'El video se retirará del producto.', run: () => removeProductFile(data.producto.cod_producto, 'VIDEO', item.url) })}><Trash2 size={15} />Eliminar</button></div>) : <p>No hay videos.</p>}<FileDropzone label="Añadir video" files={video} onChange={setVideo} accept="video/mp4,video/webm" /><button type="button" className="tt-btn tt-btn--secondary" disabled={!video[0] || busy} onClick={() => run(() => uploadProductFile(data.producto.cod_producto, 'VIDEO', video[0]), 'Video subido.').then(() => setVideo([]))}>Subir video</button></article>
          <article><h4><FileText size={18} /> Ficha técnica</h4>{data.archivos.ficha_tecnica ? <div><a href={data.archivos.ficha_tecnica.url} target="_blank" rel="noreferrer">{data.archivos.ficha_tecnica.titulo || 'Ver PDF actual'}</a><button type="button" onClick={() => setConfirm({ title: 'Eliminar ficha técnica', message: 'El PDF actual dejará de estar disponible.', run: () => removeProductFile(data.producto.cod_producto, 'FICHA', data.archivos.ficha_tecnica?.url || '') })}><Trash2 size={15} />Eliminar</button></div> : <p>No hay ficha técnica.</p>}<FileDropzone label={data.archivos.ficha_tecnica ? 'Reemplazar PDF' : 'Subir PDF'} files={pdf} onChange={setPdf} accept="application/pdf" /><button type="button" className="tt-btn tt-btn--secondary" disabled={!pdf[0] || busy} onClick={() => run(() => uploadProductFile(data.producto.cod_producto, 'FICHA', pdf[0]), 'Ficha técnica actualizada.').then(() => setPdf([]))}>Guardar PDF</button></article>
        </div>
      </section> : null}

      {tab === 'proveedores' ? <section className="admin-form-section"><header><h3>Proveedores asociados</h3><p>Selecciona por nombre comercial y RUC.</p></header><div className="admin-relation-list">{data.proveedores.map((supplier) => <article key={supplier.cod_producto_proveedor}><span><strong>{supplier.proveedor}</strong><small>Costo ${supplier.costo} · stock {supplier.stock ?? 'N/D'} · {supplier.plazo_dias} días</small></span><button type="button" onClick={() => setConfirm({ title: 'Quitar proveedor', message: `Se desactivará la relación con ${supplier.proveedor}.`, run: () => removeProductSupplier(data.producto.cod_producto, supplier.cod_proveedor) })}><Trash2 size={15} />Quitar</button></article>)}</div>
        <form className="admin-inline-relation" onSubmit={(event) => { event.preventDefault(); if (!supplierId) return; const form = new FormData(event.currentTarget); run(() => associateProductSupplier({ ...Object.fromEntries(form.entries()), cod_producto: data.producto.cod_producto, cod_proveedor: supplierId }), 'Proveedor asociado.'); }}>
          <EntitySearchSelect label="Nuevo proveedor" value={supplierId} onChange={(value) => setSupplierId(Number(value) || null)} options={options.proveedores.filter((item) => item.activo && !data.proveedores.some((current) => current.cod_proveedor === item.cod_proveedor)).map((item) => ({ value: item.cod_proveedor, label: item.nombre, description: `RUC ${item.ruc}` }))} />
          <label className="admin-field"><span className="admin-field__label">SKU proveedor *</span><input name="sku_proveedor" required /></label><label className="admin-field"><span className="admin-field__label">Costo *</span><input name="costo_unitario" type="number" min="0.01" step="0.01" required /></label><label className="admin-field"><span className="admin-field__label">Stock</span><input name="cantidad_disponible" type="number" min="0" defaultValue="0" /></label><label className="admin-field"><span className="admin-field__label">Plazo días</span><input name="tiempo_entrega_dias" type="number" min="1" defaultValue="3" /></label><input name="prioridad" type="hidden" value={data.proveedores.length + 1} /><input name="pedido_minimo" type="hidden" value="1" /><button className="tt-btn tt-btn--primary" type="submit" disabled={!supplierId || busy}>Asociar proveedor</button>
        </form>
      </section> : null}

      {tab === 'especificaciones' ? <section className="admin-form-section"><header><h3>Atributos y productos relacionados</h3><p>Las relaciones se guardan con funciones PostgreSQL.</p></header><div className="admin-relation-list">{data.valores.filter((item) => item.activo).map((item) => <article key={item.cod_atributo}><span><strong>{item.atributo}</strong><small>{item.valor}</small></span><button type="button" onClick={() => setConfirm({ title: 'Quitar atributo', message: `Se retirará ${item.atributo} del producto.`, run: () => updateProductAttribute(data.producto.cod_producto, item.cod_atributo, '', true) })}><Trash2 size={15} />Quitar</button></article>)}</div>
        <form className="admin-inline-relation" onSubmit={(event) => { event.preventDefault(); if (!attributeId || !attributeValue.trim()) return; run(() => updateProductAttribute(data.producto.cod_producto, attributeId, attributeValue), 'Especificación guardada.').then(() => { setAttributeId(null); setAttributeValue(''); }); }}><EntitySearchSelect label="Atributo" value={attributeId} onChange={(value) => setAttributeId(Number(value) || null)} options={options.atributos.filter((item) => item.activo).map((item) => ({ value: item.cod_atributo, label: item.nombre, description: item.tipo_dato }))} /><label className="admin-field"><span className="admin-field__label">Valor</span><input value={attributeValue} onChange={(event) => setAttributeValue(event.target.value)} /></label><button type="submit" className="tt-btn tt-btn--primary" disabled={!attributeId || !attributeValue.trim() || busy}>Guardar atributo</button></form>
        <div className="admin-relation-list">{data.relacionados.map((item) => <article key={item.cod_producto}><span><strong>{item.nombre}</strong><small>{item.sku}</small></span><button type="button" onClick={() => setConfirm({ title: 'Quitar relacionado', message: `Se retirará la relación con ${item.nombre}.`, run: () => updateRelatedProduct(data.producto.cod_producto, item.cod_producto, true) })}><Trash2 size={15} />Quitar</button></article>)}</div>
        <div className="admin-inline-relation"><EntitySearchSelect label="Producto relacionado" value={relatedId} onChange={(value) => setRelatedId(Number(value) || null)} options={productOptions} /><button type="button" className="tt-btn tt-btn--primary" disabled={!relatedId || busy} onClick={() => relatedId && run(() => updateRelatedProduct(data.producto.cod_producto, relatedId), 'Producto relacionado añadido.').then(() => setRelatedId(null))}>Añadir relacionado</button></div>
      </section> : null}
    </> : null}
    <ConfirmDialog open={Boolean(confirm)} title={confirm?.title || ''} message={confirm?.message || ''} busy={busy} onCancel={() => setConfirm(null)} onConfirm={() => confirm && run(confirm.run, 'Cambio aplicado.')} />
  </AdminDrawer>;
};
