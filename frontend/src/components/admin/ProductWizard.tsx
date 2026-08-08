import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createIntegralAdminProduct } from '../../api/adminCatalog.api';
import type { ProductCatalogOptions, ProductIntegralDraft, ProductSupplierDraft } from '../../types/adminCatalog.types';
import { EntitySearchSelect } from './EntitySearchSelect';
import { MultiEntitySelect } from './MultiEntitySelect';
import { ProductMediaUploader } from './ProductMediaUploader';

interface ProductWizardProps { options: ProductCatalogOptions; onSuccess: (message: string) => void; }

const initialDraft = (): ProductIntegralDraft => ({
  cod_categoria: 0, cod_marca: 0, sku: '', nombre: '', descripcion: '', precio_actual: '',
  peso_kg: '', largo_cm: '', ancho_cm: '', alto_cm: '', limite_por_pedido: 10,
  requiere_revision: false, proveedores: [], atributos: [], relacionados: [], imagenes: [], videos: [], ficha_tecnica: null,
});

const steps = ['Información', 'Clasificación', 'Proveedores', 'Multimedia', 'Especificaciones', 'Revisión'];

export const ProductWizard: React.FC<ProductWizardProps> = ({ options, onSuccess }) => {
  const [draft, setDraft] = useState<ProductIntegralDraft>(initialDraft);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const patch = <K extends keyof ProductIntegralDraft>(key: K, value: ProductIntegralDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const selectedSupplierIds = draft.proveedores.map((supplier) => supplier.cod_proveedor);

  const supplierOptions = useMemo(() => options.proveedores.filter((supplier) => supplier.activo).map((supplier) => ({
    value: supplier.cod_proveedor, label: supplier.nombre, description: `${supplier.razon_social} · RUC ${supplier.ruc}`,
  })), [options.proveedores]);
  const productOptions = useMemo(() => options.productos.map((product) => ({ value: product.cod_producto, label: product.nombre, description: `${product.sku} · ${product.categoria}` })), [options.productos]);

  const selectSuppliers = (values: Array<number | string>) => {
    const ids = values.map(Number);
    patch('proveedores', ids.map((id, index) => draft.proveedores.find((supplier) => supplier.cod_proveedor === id) || {
      cod_proveedor: id, sku_proveedor: draft.sku, costo_unitario: '', tiempo_entrega_dias: 3,
      prioridad: index + 1, pedido_minimo: 1, cantidad_disponible: 0,
    }));
  };
  const updateSupplier = (id: number, field: keyof ProductSupplierDraft, value: string | number) => {
    patch('proveedores', draft.proveedores.map((supplier) => supplier.cod_proveedor === id ? { ...supplier, [field]: value } : supplier));
  };
  const validationErrors = () => {
    const errors: string[] = [];
    if (!draft.nombre.trim()) errors.push('Escribe el nombre del producto.');
    if (!draft.sku.trim()) errors.push('Define un Código / SKU.');
    if (!draft.cod_categoria) errors.push('Selecciona una categoría.');
    if (!draft.cod_marca) errors.push('Selecciona una marca.');
    if (!draft.precio_actual || Number(draft.precio_actual) <= 0) errors.push('Registra un precio base válido.');
    if (draft.proveedores.length < 5) errors.push('La regla DB exige al menos 5 proveedores activos para publicar.');
    if (draft.proveedores.some((supplier) => !supplier.costo_unitario || Number(supplier.costo_unitario) <= 0)) errors.push('Completa el costo unitario de cada proveedor.');
    if (!draft.proveedores.some((supplier) => Number(supplier.cantidad_disponible) > 0)) errors.push('Registra stock disponible en al menos un proveedor.');
    if (!draft.imagenes.length) errors.push('Agrega al menos una imagen.');
    if (!draft.ficha_tecnica) errors.push('Adjunta la ficha técnica PDF.');
    if (draft.limite_por_pedido < 1) errors.push('El límite por pedido debe ser mayor que cero.');
    return errors;
  };
  const submit = async () => {
    const errors = validationErrors();
    if (errors.length) { setError(errors.join(' ')); return; }
    setSubmitting(true); setError(null);
    try {
      const result = await createIntegralAdminProduct(draft);
      onSuccess(result.mensaje || 'Producto creado y publicado correctamente.');
      setDraft(initialDraft()); setStep(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible crear y publicar el producto.');
    } finally { setSubmitting(false); }
  };

  return <div className="admin-wizard">
    <ol className="admin-wizard__steps">{steps.map((label, index) => <li key={label} className={index === step ? 'is-active' : index < step ? 'is-complete' : ''}><span>{index < step ? <CheckCircle2 size={16} /> : index + 1}</span>{label}</li>)}</ol>
    {error ? <div className="admin-alert admin-alert-error" role="alert">{error}</div> : null}

    {step === 0 ? <section className="admin-form-section"><header><h3>Información general</h3><p>Datos humanos y comerciales básicos. Los importes oficiales siguen bajo PostgreSQL.</p></header><div className="admin-form-grid">
      <label className="admin-field"><span className="admin-field__label">Nombre *</span><input value={draft.nombre} onChange={(event) => patch('nombre', event.target.value)} required /></label>
      <label className="admin-field"><span className="admin-field__label">Código / SKU *</span><input value={draft.sku} onChange={(event) => patch('sku', event.target.value)} required /><small className="admin-field__helper">Código único utilizado para identificar el producto.</small></label>
      <label className="admin-field admin-field--full"><span className="admin-field__label">Descripción completa</span><textarea rows={5} value={draft.descripcion} onChange={(event) => patch('descripcion', event.target.value)} /></label>
      <label className="admin-field"><span className="admin-field__label">Precio base registrado *</span><input type="number" min="0.01" step="0.01" value={draft.precio_actual} onChange={(event) => patch('precio_actual', event.target.value)} /><small className="admin-field__helper">PostgreSQL aplicará reglas, descuentos e impuestos.</small></label>
      <label className="admin-field"><span className="admin-field__label">Peso (kg)</span><input type="number" min="0" step="0.001" value={draft.peso_kg} onChange={(event) => patch('peso_kg', event.target.value)} /></label>
      {(['largo_cm', 'ancho_cm', 'alto_cm'] as const).map((field) => <label className="admin-field" key={field}><span className="admin-field__label">{field === 'largo_cm' ? 'Largo' : field === 'ancho_cm' ? 'Ancho' : 'Alto'} (cm)</span><input type="number" min="0" step="0.01" value={draft[field]} onChange={(event) => patch(field, event.target.value)} /></label>)}
    </div></section> : null}

    {step === 1 ? <section className="admin-form-section"><header><h3>Clasificación y límites</h3><p>Selecciona entidades por nombre; sus códigos se envían internamente.</p></header><div className="admin-form-grid">
      <EntitySearchSelect label="Categoría" required value={draft.cod_categoria || null} onChange={(value) => patch('cod_categoria', Number(value || 0))} options={options.categorias.filter((item) => item.activo).map((item) => ({ value: item.cod_categoria, label: item.nombre, description: item.descripcion || undefined }))} />
      <EntitySearchSelect label="Marca" required value={draft.cod_marca || null} onChange={(value) => patch('cod_marca', Number(value || 0))} options={options.marcas.filter((item) => item.activo).map((item) => ({ value: item.cod_marca, label: item.nombre }))} />
      <label className="admin-field"><span className="admin-field__label">Límite por pedido *</span><input type="number" min="1" value={draft.limite_por_pedido} onChange={(event) => patch('limite_por_pedido', Number(event.target.value))} /></label>
      <label className="admin-field"><span className="admin-field__label">Límite por día</span><input type="number" min="1" value={draft.limite_por_dia || ''} onChange={(event) => patch('limite_por_dia', Number(event.target.value) || undefined)} /></label>
      <label className="admin-field"><span className="admin-field__label">Límite por mes</span><input type="number" min="1" value={draft.limite_por_mes || ''} onChange={(event) => patch('limite_por_mes', Number(event.target.value) || undefined)} /></label>
      <label className="admin-check"><input type="checkbox" checked={draft.requiere_revision} onChange={(event) => patch('requiere_revision', event.target.checked)} /><span>Requiere revisión en compras mayoristas</span></label>
    </div></section> : null}

    {step === 2 ? <section className="admin-form-section"><header><h3>Proveedores</h3><p>La regla de publicación existente exige cinco proveedores activos y stock disponible.</p></header>
      <MultiEntitySelect label="Proveedores" required values={selectedSupplierIds} onChange={selectSuppliers} options={supplierOptions} helperText={`${draft.proveedores.length}/5 proveedores mínimos seleccionados.`} />
      <div className="admin-supplier-drafts">{draft.proveedores.map((supplier, index) => { const entity = options.proveedores.find((item) => item.cod_proveedor === supplier.cod_proveedor); return <article key={supplier.cod_proveedor}><header><strong>{entity?.nombre || 'Proveedor'}</strong><span>{entity?.ruc}</span></header><div className="admin-form-grid admin-form-grid--compact">
        <label className="admin-field"><span className="admin-field__label">SKU del proveedor</span><input value={supplier.sku_proveedor} onChange={(event) => updateSupplier(supplier.cod_proveedor, 'sku_proveedor', event.target.value)} /></label>
        <label className="admin-field"><span className="admin-field__label">Costo unitario *</span><input type="number" min="0.01" step="0.01" value={supplier.costo_unitario} onChange={(event) => updateSupplier(supplier.cod_proveedor, 'costo_unitario', event.target.value)} /></label>
        <label className="admin-field"><span className="admin-field__label">Stock proveedor</span><input type="number" min="0" value={supplier.cantidad_disponible} onChange={(event) => updateSupplier(supplier.cod_proveedor, 'cantidad_disponible', Number(event.target.value))} /></label>
        <label className="admin-field"><span className="admin-field__label">Plazo (días)</span><input type="number" min="1" value={supplier.tiempo_entrega_dias} onChange={(event) => updateSupplier(supplier.cod_proveedor, 'tiempo_entrega_dias', Number(event.target.value))} /></label>
        <label className="admin-field"><span className="admin-field__label">Prioridad</span><input type="number" min="1" value={supplier.prioridad || index + 1} onChange={(event) => updateSupplier(supplier.cod_proveedor, 'prioridad', Number(event.target.value))} /></label>
        <label className="admin-field"><span className="admin-field__label">Pedido mínimo</span><input type="number" min="1" value={supplier.pedido_minimo} onChange={(event) => updateSupplier(supplier.cod_proveedor, 'pedido_minimo', Number(event.target.value))} /></label>
      </div></article>; })}</div>
    </section> : null}

    {step === 3 ? <section className="admin-form-section"><header><h3>Multimedia y ficha técnica</h3><p>Los archivos se suben mediante multipart y se almacenan físicamente en media.</p></header><ProductMediaUploader images={draft.imagenes} videos={draft.videos} pdf={draft.ficha_tecnica} onImagesChange={(files) => patch('imagenes', files)} onVideosChange={(files) => patch('videos', files)} onPdfChange={(file) => patch('ficha_tecnica', file)} /></section> : null}

    {step === 4 ? <section className="admin-form-section"><header><h3>Especificaciones y relacionados</h3><p>Añade únicamente los atributos que correspondan al producto.</p></header>
      <div className="admin-spec-grid">{options.atributos.filter((attribute) => attribute.activo).map((attribute) => <label className="admin-field" key={attribute.cod_atributo}><span className="admin-field__label">{attribute.nombre}</span><input value={draft.atributos.find((item) => item.cod_atributo === attribute.cod_atributo)?.valor || ''} onChange={(event) => { const rest = draft.atributos.filter((item) => item.cod_atributo !== attribute.cod_atributo); patch('atributos', event.target.value ? [...rest, { cod_atributo: attribute.cod_atributo, valor: event.target.value }] : rest); }} /></label>)}</div>
      <MultiEntitySelect label="Productos relacionados" values={draft.relacionados.map((item) => item.cod_producto)} onChange={(values) => patch('relacionados', values.map((value) => ({ cod_producto: Number(value), tipo: 'RELACIONADO' })))} options={productOptions} />
    </section> : null}

    {step === 5 ? <section className="admin-form-section"><header><h3>Revisión y publicación</h3><p>El backend creará las asociaciones y validará las reglas PostgreSQL antes de confirmar.</p></header><dl className="admin-review-grid">
      <div><dt>Producto</dt><dd>{draft.nombre || 'Sin nombre'} · {draft.sku || 'Sin SKU'}</dd></div>
      <div><dt>Clasificación</dt><dd>{options.categorias.find((item) => item.cod_categoria === draft.cod_categoria)?.nombre || 'Sin categoría'} · {options.marcas.find((item) => item.cod_marca === draft.cod_marca)?.nombre || 'Sin marca'}</dd></div>
      <div><dt>Proveedores</dt><dd>{draft.proveedores.length} seleccionados</dd></div><div><dt>Multimedia</dt><dd>{draft.imagenes.length} imágenes · {draft.videos.length} videos · {draft.ficha_tecnica ? 'PDF adjunto' : 'Sin PDF'}</dd></div>
      <div><dt>Especificaciones</dt><dd>{draft.atributos.length} atributos · {draft.relacionados.length} relacionados</dd></div><div><dt>Acción</dt><dd>Crear y publicar</dd></div>
    </dl></section> : null}

    <footer className="admin-form-actions"><button type="button" className="tt-btn tt-btn--secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0 || submitting}><ArrowLeft size={16} />Anterior</button>{step < steps.length - 1 ? <button type="button" className="tt-btn tt-btn--primary" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Siguiente<ArrowRight size={16} /></button> : <button type="button" className="tt-btn tt-btn--primary" onClick={submit} disabled={submitting}>{submitting ? 'Creando y publicando…' : 'Crear y publicar'}</button>}</footer>
  </div>;
};
