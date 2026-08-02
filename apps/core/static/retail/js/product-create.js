(() => {
  'use strict';
  if (document.body.dataset.isAdmin !== '1') return;
  const dialog = document.querySelector('#admin-product-create');
  const form = document.querySelector('#admin-product-create-form');
  if (!dialog || !form) return;
  const csrf = () => document.cookie.split('; ').find(x => x.startsWith('csrftoken='))?.split('=').slice(1).join('=') || '';
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const steps = [...form.querySelectorAll('[data-create-step]')];
  const stepButtons = [...form.querySelectorAll('[data-create-step-button]')];
  const back = form.querySelector('[data-create-back]');
  const next = form.querySelector('[data-create-next]');
  const submit = form.querySelector('[data-create-submit]');
  const suppliersRoot = form.querySelector('#product-create-suppliers');
  const summary = form.querySelector('#product-create-summary');
  const message = form.querySelector('#product-create-message');
  const previews = form.querySelector('#product-create-previews');
  let current = 0;
  let references = {categoria:[], marca:[], proveedor:[]};
  let previewUrls = [];

  function notify(text, error = false) {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.toggle('is-error', error);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4200);
  }
  async function getJSON(url) {
    const response = await fetch(url, {credentials:'same-origin'});
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.mensaje || 'No se pudo cargar la configuración.');
    return data;
  }
  async function loadReferences() {
    const names = ['categoria','marca','proveedor'];
    const result = await Promise.all(names.map(name => getJSON(`/panel/api/catalogo/?entidad=${name}&activos=0`)));
    references = Object.fromEntries(names.map((name,index) => [name,(result[index].registros || []).filter(x => x.activo !== false)]));
    form.querySelector('[data-create-categories]').insertAdjacentHTML('beforeend', references.categoria.map(x => `<option value="${x.cod_categoria}">${esc(x.nombre)}</option>`).join(''));
    form.querySelector('[data-create-brands]').insertAdjacentHTML('beforeend', references.marca.map(x => `<option value="${x.cod_marca}">${esc(x.nombre)}</option>`).join(''));
  }
  const providerOptions = () => `<option value="">Selecciona proveedor</option>${references.proveedor.map(x => `<option value="${x.cod_proveedor}">${esc(x.razon_social)}</option>`).join('')}`;
  function addSupplier(values = {}) {
    const row = document.createElement('div');
    row.className = 'rp-create-supplier';
    row.innerHTML = `<span class="rp-supplier-index"></span><label>Proveedor<select data-supplier="cod_proveedor">${providerOptions()}</select></label><label>SKU proveedor<input data-supplier="sku_proveedor" placeholder="SKU alterno"></label><label>Costo<input type="number" min="0.01" step="0.01" data-supplier="costo_unitario" placeholder="0.00"></label><label>Entrega (días)<input type="number" min="1" data-supplier="tiempo_entrega_dias" value="3"></label><label>Stock disponible<input type="number" min="0" data-supplier="cantidad_disponible" value="0"></label><button type="button" data-remove-create-supplier aria-label="Quitar proveedor">×</button>`;
    Object.entries(values).forEach(([key,value]) => { const input=row.querySelector(`[data-supplier="${key}"]`);if(input)input.value=value; });
    suppliersRoot.appendChild(row);
    renumberSuppliers();
  }
  function renumberSuppliers() {
    [...suppliersRoot.children].forEach((row,index) => { row.querySelector('.rp-supplier-index').textContent=String(index+1).padStart(2,'0'); });
  }
  function supplierData() {
    return [...suppliersRoot.querySelectorAll('.rp-create-supplier')].map((row,index) => {
      const value = key => row.querySelector(`[data-supplier="${key}"]`)?.value || '';
      return {cod_proveedor:value('cod_proveedor'),sku_proveedor:value('sku_proveedor'),costo_unitario:value('costo_unitario'),tiempo_entrega_dias:value('tiempo_entrega_dias'),cantidad_disponible:value('cantidad_disponible'),prioridad:index+1,pedido_minimo:1};
    }).filter(x => x.cod_proveedor);
  }
  function validateStep(index) {
    message.textContent = '';
    const invalid = [...steps[index].querySelectorAll('input,select,textarea')].find(input => !input.checkValidity());
    if (invalid) {
      if (current !== index) showStep(index);
      window.setTimeout(() => invalid.reportValidity(), 0);
      return false;
    }
    if (index === 1) {
      const images = form.elements.imagenes.files.length;
      const imageUrls = form.elements.imagenes_url.value.trim();
      if (!images && !imageUrls) { message.textContent='Agrega al menos una imagen o una URL de imagen.'; return false; }
      const pdf = form.elements.ficha_tecnica.files[0];
      const pdfUrl = form.elements.ficha_url.value.trim();
      if (!pdf && !pdfUrl) { message.textContent='Adjunta la ficha técnica PDF o indica su URL directa.'; return false; }
      if (pdf && pdf.type !== 'application/pdf' && !pdf.name.toLowerCase().endsWith('.pdf')) { message.textContent='La ficha técnica debe ser un archivo PDF.'; return false; }
      if (pdfUrl && !pdfUrl.toLowerCase().split('?')[0].endsWith('.pdf')) { message.textContent='La URL de ficha técnica debe terminar en .pdf.'; return false; }
    }
    return true;
  }
  function showStep(index) {
    current = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((section,i) => section.hidden = i !== current);
    stepButtons.forEach((button,i) => { button.classList.toggle('is-active',i===current);button.classList.toggle('is-complete',i<current); });
    back.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    submit.hidden = current !== steps.length - 1;
    if (current === steps.length - 1) renderSummary();
    form.querySelector('.rp-wizard-content').scrollTop = 0;
  }
  function renderSummary() {
    const providers = supplierData();
    const providerIds = new Set(providers.map(x => x.cod_proveedor));
    const providerStock = providers.reduce((sum,x) => sum + Number(x.cantidad_disponible || 0), 0);
    const imageCount = form.elements.imagenes.files.length + form.elements.imagenes_url.value.trim().split(/\r?\n/).filter(Boolean).length;
    const pdfName = form.elements.ficha_tecnica.files[0]?.name || form.elements.ficha_url.value || 'Sin PDF';
    const category = form.elements.cod_categoria.selectedOptions[0]?.textContent || '—';
    const brand = form.elements.cod_marca.selectedOptions[0]?.textContent || '—';
    const checks = [
      ['Categoría y marca',Boolean(form.elements.cod_categoria.value && form.elements.cod_marca.value)],
      ['SKU, descripción y precio',Boolean(form.elements.sku.value && form.elements.descripcion.value && Number(form.elements.precio_actual.value)>0)],
      [`Galería (${imageCount} imagen${imageCount===1?'':'es'})`,imageCount>0],
      ['Ficha técnica PDF',pdfName!=='Sin PDF'],
      ['Límite retail',Number(form.elements.limite_por_pedido.value)>0],
      [`Proveedores activos (${providerIds.size}/5)`,providerIds.size>=5],
      [`Stock de proveedores (${providerStock})`,providerStock>0],
    ];
    summary.innerHTML = `<article class="rp-review-product"><div><span>${esc(brand)} · ${esc(category)}</span><h4>${esc(form.elements.nombre.value || 'Producto sin nombre')}</h4><p>${esc(form.elements.sku.value)} · $${esc(form.elements.precio_actual.value || '0.00')}</p></div><strong>${esc(pdfName)}</strong></article><div class="rp-review-checks">${checks.map(([label,ok])=>`<div class="${ok?'is-ok':'is-pending'}"><span>${ok?'✓':'!'}</span><strong>${esc(label)}</strong><small>${ok?'Listo':'Pendiente'}</small></div>`).join('')}</div>`;
    const pending = checks.filter(([,ok])=>!ok).length;
    message.textContent = pending ? `${pending} requisito${pending===1?'':'s'} pendiente${pending===1?'':'s'}. Puedes guardar el borrador o completarlos para publicar ahora.` : 'Todo listo para publicar.';
    message.classList.toggle('is-ready',pending===0);
  }
  function reset() {
    previewUrls.forEach(URL.revokeObjectURL);previewUrls=[];
    form.reset();previews.innerHTML='';suppliersRoot.innerHTML='';message.textContent='';
    for(let i=0;i<5;i++)addSupplier();
    showStep(0);
  }
  async function open() {
    reset();
    if (!references.categoria.length) {
      message.textContent='Cargando categorías, marcas y proveedores…';
      try { await loadReferences(); suppliersRoot.innerHTML='';for(let i=0;i<5;i++)addSupplier();message.textContent=''; }
      catch(error) { message.textContent=error.message;notify(error.message,true); }
    }
    dialog.showModal();
  }
  function close() { if(dialog.open)dialog.close(); }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-admin-create="producto"]');
    if (!trigger) return;
    event.preventDefault();event.stopImmediatePropagation();open();
  }, true);
  form.addEventListener('click', event => {
    if (event.target.closest('[data-product-create-close]')) return close();
    if (event.target.closest('[data-create-next]') && validateStep(current)) return showStep(current+1);
    if (event.target.closest('[data-create-back]')) return showStep(current-1);
    if (event.target.closest('[data-add-create-supplier]')) return addSupplier();
    const remove = event.target.closest('[data-remove-create-supplier]');
    if (remove) { remove.closest('.rp-create-supplier').remove();renumberSuppliers(); }
  });
  stepButtons.forEach(button => button.addEventListener('click', () => { const target=Number(button.dataset.createStepButton);if(target<=current||validateStep(current))showStep(target); }));
  form.querySelector('[data-create-images]').addEventListener('change', event => {
    previewUrls.forEach(URL.revokeObjectURL);previewUrls=[];
    previews.innerHTML=[...event.target.files].map((file,index)=>{const url=URL.createObjectURL(file);previewUrls.push(url);return `<figure><img src="${url}" alt=""><figcaption>${index===0?'Principal':'Imagen '+(index+1)}</figcaption></figure>`;}).join('');
  });
  form.addEventListener('input', () => { if(current===steps.length-1)renderSummary(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    for (const index of [0, 1, 2]) {
      if (!validateStep(index)) {
        showStep(index);
        return;
      }
    }
    const data = new FormData(form);data.set('proveedores',JSON.stringify(supplierData()));
    submit.disabled=true;submit.textContent='Creando producto…';message.textContent='Guardando archivos y aplicando reglas comerciales…';
    try {
      const response=await fetch('/panel/api/productos/crear-integral/',{method:'POST',credentials:'same-origin',headers:{'X-CSRFToken':csrf()},body:data});
      const result=await response.json().catch(()=>({}));
      if(!response.ok||result.ok===false)throw new Error(result.mensaje||'No se pudo crear el producto.');
      const pending=result.publicacion?.faltantes||[];
      notify(result.mensaje,result.publicado===false&&form.elements.publicar.checked);
      window.dispatchEvent(new CustomEvent('techtail:product-created',{detail:result}));
      if(pending.length)message.innerHTML=`<strong>${esc(result.mensaje)}</strong><ul>${pending.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
      setTimeout(close,pending.length?1800:700);
    } catch(error) { message.textContent=error.message;notify(error.message,true); }
    finally { submit.disabled=false;submit.textContent='Crear producto'; }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault();close(); });
})();
