(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const csrf = () => document.cookie.split('; ').find(x => x.startsWith('csrftoken='))?.split('=').slice(1).join('=') || '';
  const manager = $('#admin-product-manager');
  if (!manager || document.body.dataset.isAdmin !== '1') return;
  const body = $('#admin-product-manager-body');
  const tabs = $('#admin-product-tabs');
  let productId = null;
  let data = null;
  let activeTab = 'general';

  function notify(message, error = false) {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('is-error', error);
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 3500);
  }
  async function json(url) {
    const response = await fetch(url, {credentials:'same-origin'});
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) throw new Error(payload.mensaje || 'No se pudo cargar la información.');
    return payload;
  }
  async function post(url, form) {
    const payload = form instanceof FormData ? form : new FormData(form);
    const response = await fetch(url, {method:'POST', credentials:'same-origin', headers:{'X-CSRFToken':csrf()}, body:payload});
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) throw new Error(result.mensaje || 'No se pudo guardar el cambio.');
    return result;
  }
  const options = (rows, key, label, selected) => rows.map(x => `<option value="${esc(x[key])}" ${String(x[key]) === String(selected) ? 'selected' : ''}>${esc(x[label])}</option>`).join('');
  const empty = (message) => `<p class="rp-enterprise-empty">${esc(message)}</p>`;

  function general() {
    const p = data.producto;
    return `<form class="rp-enterprise-form" data-enterprise-action="general">
      <div class="rp-enterprise-grid">
        <label>SKU<input name="sku" value="${esc(p.sku)}" required></label>
        <label>Nombre<input name="nombre" value="${esc(p.nombre)}" required></label>
        <label>Categoría<select name="cod_categoria" required>${options(data.categorias,'cod_categoria','nombre',p.cod_categoria)}</select></label>
        <label>Marca<select name="cod_marca" required>${options(data.marcas,'cod_marca','nombre',p.cod_marca)}</select></label>
        <label>Precio de exhibición<input name="precio_actual" type="number" min="0.01" step="0.01" value="${esc(p.precio)}" required></label>
        <label>Estado<input value="${esc(p.estado)}" disabled></label>
        <label>Peso (kg)<input name="peso_kg" type="number" min="0" step="0.001" value="${esc(p.peso_kg)}" required></label>
        <label>Largo (cm)<input name="largo_cm" type="number" min="0" step="0.01" value="${esc(p.largo_cm)}" required></label>
        <label>Ancho (cm)<input name="ancho_cm" type="number" min="0" step="0.01" value="${esc(p.ancho_cm)}" required></label>
        <label>Alto (cm)<input name="alto_cm" type="number" min="0" step="0.01" value="${esc(p.alto_cm)}" required></label>
        <label class="is-wide">Descripción<textarea name="descripcion" rows="6" required>${esc(p.descripcion)}</textarea></label>
      </div><footer><button class="rp-primary">Guardar datos comerciales</button></footer>
    </form>`;
  }

  function multimedia() {
    const images = data.imagenes.length ? data.imagenes.map(x => `<article class="rp-media-card ${x.principal?'is-main':''}"><img src="${esc(x.url)}" alt="${esc(x.alt_text || data.producto.nombre)}"><div><strong>${x.principal?'Imagen principal':'Imagen '+x.orden}</strong><small>${x.activo?'Activa':'Inactiva'}</small><form data-enterprise-action="image-order"><input type="hidden" name="cod_imagen" value="${x.cod_imagen}"><input name="orden" type="number" min="1" value="${x.orden}"><label><input name="es_principal" type="checkbox" ${x.principal?'checked':''}> Principal</label><button>Guardar</button><button type="button" data-remove-image="${x.cod_imagen}">Desactivar</button></form></div></article>`).join('') : empty('Aún no hay imágenes. Se requiere una principal para publicar.');
    const videos = (data.archivos.videos || []).length ? data.archivos.videos.map(x => `<article class="rp-file-row"><div><strong>${esc(x.titulo || 'Video')}</strong><a href="${esc(x.url)}" target="_blank" rel="noopener">Abrir archivo</a></div><button data-remove-file="VIDEO" data-url="${esc(x.url)}">Quitar</button></article>`).join('') : empty('No hay videos adjuntos.');
    return `<div class="rp-enterprise-columns"><section><h3>Galería de imágenes</h3><form class="rp-inline-upload" data-enterprise-action="image" enctype="multipart/form-data"><input name="archivo" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><span>o</span><input name="url_imagen" type="url" placeholder="URL externa"><input name="alt_text" placeholder="Texto alternativo"><label><input name="es_principal" type="checkbox"> Principal</label><button class="rp-primary">Agregar imagen</button></form><div class="rp-media-grid">${images}</div></section>
      <section><h3>Videos del producto</h3><p class="rp-section-help">Contenido opcional para demostrar instalación, uso o características.</p><form class="rp-inline-upload" data-enterprise-action="file"><input type="hidden" name="tipo" value="VIDEO"><input name="archivo" type="file" accept="video/mp4,video/webm,video/quicktime"><input name="url" type="url" placeholder="o URL del video"><input name="titulo" placeholder="Título"><button>Adjuntar video</button></form>${videos}</section></div>`;
  }

  function technical() {
    const sheet = data.archivos.ficha_tecnica;
    const viewer = sheet ? `<div class="rp-admin-pdf"><iframe src="${esc(sheet.url)}#toolbar=0&navpanes=0" title="${esc(sheet.titulo || 'Ficha técnica PDF')}"></iframe><footer><div><strong>${esc(sheet.titulo || 'Ficha técnica PDF')}</strong><small>Documento asociado al producto</small></div><a href="${esc(sheet.url)}" download>Descargar PDF</a><button data-remove-file="FICHA" data-url="${esc(sheet.url)}">Quitar PDF</button></footer></div>` : empty('Este producto todavía no tiene una ficha técnica PDF. Debes adjuntarla antes de publicar.');
    return `<div class="rp-pdf-manager"><section><div class="rp-wizard-heading"><span>Documento oficial</span><h3>Ficha técnica PDF</h3><p>Sube el documento original del fabricante. TechTail lo guardará como URL y el cliente podrá consultarlo sin salir de la página.</p></div><form class="rp-pdf-upload" data-enterprise-action="file"><input type="hidden" name="tipo" value="FICHA"><label><strong>Seleccionar PDF</strong><small>Máximo 15 MB</small><input name="archivo" type="file" accept="application/pdf"></label><span>o</span><label>URL directa al PDF<input name="url" type="url" placeholder="https://.../ficha.pdf"></label><label>Título<input name="titulo" value="Ficha técnica PDF"></label><button class="rp-primary">${sheet?'Reemplazar documento':'Adjuntar documento'}</button></form></section>${viewer}</div>`;
  }

  function commercial() {
    const l = data.limite || {};
    const publication = data.publicacion || {publicable:false,faltantes:[]};
    const publicationCard = `<article class="rp-publication-card ${publication.publicable?'is-ready':'is-pending'}"><div><span>${publication.publicable?'✓':'!'}</span><div><strong>${publication.publicable?'Listo para publicar':'Aún no se puede publicar'}</strong><p>${publication.publicable?'Todos los requisitos comerciales están completos.':esc((publication.faltantes||[]).join(' · '))}</p></div></div>${publication.publicable&&data.producto.estado!=='PUBLICADO'?'<button data-publish-product>Publicar ahora</button>':''}</article>`;
    const related = data.relacionados.length ? data.relacionados.map(x => `<article class="rp-file-row"><div><strong>${esc(x.nombre)}</strong><span>${esc(x.sku)} · ${esc(x.tipo)}</span></div><button data-remove-related="${x.cod_producto}">Quitar</button></article>`).join('') : empty('No hay productos relacionados.');
    const promotions = data.promociones.length ? data.promociones.map(x => `<article class="rp-file-row"><div><strong>${esc(x.codigo)} · ${esc(x.nombre)}</strong><span>${x.activo?'Activa':'Inactiva'}</span></div><button data-remove-promotion="${x.cod_promocion}">Quitar</button></article>`).join('') : empty('No hay promociones asociadas.');
    const suppliers = data.proveedores.length ? data.proveedores.map(x => `<article class="rp-file-row"><div><strong>${esc(x.proveedor)}</strong><span>Costo $${esc(x.costo)} · ${esc(x.plazo_dias)} días · stock ${esc(x.stock ?? 'sin reportar')}</span></div><span>${x.activo?'Activo':'Inactivo'}</span></article>`).join('') : empty('No hay proveedores asociados; se requieren al menos 5 activos para publicar.');
    return `${publicationCard}<div class="rp-enterprise-columns"><section><h3>Límite retail</h3><form class="rp-enterprise-form" data-enterprise-action="limit"><label>Por pedido<input name="limite_por_pedido" type="number" min="1" value="${esc(l.por_pedido || 1)}" required></label><label>Por día<input name="limite_por_dia" type="number" min="1" value="${esc(l.por_dia || '')}"></label><label>Por mes<input name="limite_por_mes" type="number" min="1" value="${esc(l.por_mes || '')}"></label><label><input name="requiere_revision" type="checkbox" ${l.requiere_revision?'checked':''}> Requiere revisión</label><input type="hidden" name="activo" value="1"><button class="rp-primary">Guardar límite</button></form><h3>Productos relacionados</h3><form class="rp-enterprise-form" data-enterprise-action="related"><select name="cod_producto_relacionado" required><option value="">Selecciona producto</option>${options(data.productos,'cod_producto','nombre')}</select><select name="tipo"><option value="RELACIONADO">Relacionado</option><option value="ACCESORIO">Accesorio</option><option value="ALTERNATIVA">Alternativa</option></select><button>Asociar</button></form>${related}</section>
      <section><h3>Promociones aplicables</h3><form class="rp-enterprise-form" data-enterprise-action="promotion"><select name="cod_promocion" required><option value="">Selecciona promoción</option>${options(data.promociones_disponibles,'cod_promocion','nombre')}</select><button>Asociar promoción</button></form>${promotions}<h3>Red de proveedores (${data.proveedores.filter(x=>x.activo).length} activos)</h3>${suppliers}</section></div>`;
  }

  function moderation() {
    const reviews = data.resenas.length ? data.resenas.map(x => `<article class="rp-moderation-card"><header><strong>${esc(x.cliente)} · ${x.calificacion}/5</strong><span>${x.aprobado?'Publicada':'Pendiente/oculta'}</span></header><h4>${esc(x.titulo || 'Sin título')}</h4><p>${esc(x.comentario || '')}</p><button data-review="${x.cod_resena}" data-approved="${x.aprobado?'0':'1'}">${x.aprobado?'Ocultar':'Aprobar'}</button></article>`).join('') : empty('No hay reseñas para este producto.');
    const questions = data.preguntas.length ? data.preguntas.map(x => `<article class="rp-moderation-card"><header><strong>${esc(x.cliente)}</strong><span>${esc(x.estado)}</span></header><p>${esc(x.pregunta)}</p>${x.respuesta?`<blockquote>${esc(x.respuesta)}</blockquote>`:`<form data-enterprise-action="answer"><input type="hidden" name="cod_pregunta" value="${x.cod_pregunta}"><textarea name="respuesta" required placeholder="Respuesta pública"></textarea><button>Responder</button></form>`}<button data-question="${x.cod_pregunta}" data-state="RECHAZADA">Rechazar</button></article>`).join('') : empty('No hay preguntas para este producto.');
    return `<div class="rp-enterprise-columns"><section><h3>Reseñas</h3>${reviews}</section><section><h3>Preguntas y respuestas</h3>${questions}</section></div>`;
  }

  const renderers = {general, multimedia, technical, commercial, moderation};
  function render() {
    const labels = {general:'Datos generales',multimedia:'Galería y video',technical:'Ficha PDF',commercial:'Venta y proveedores',moderation:'Moderación'};
    tabs.innerHTML = Object.entries(labels).map(([key,label]) => `<button type="button" data-product-tab="${key}" class="${key===activeTab?'is-active':''}">${label}</button>`).join('');
    body.innerHTML = renderers[activeTab]();
  }
  async function refresh() {
    data = await json(`/panel/api/productos/${productId}/gestion/`);
    $('#admin-product-manager-title').textContent = data.producto.nombre;
    $('#admin-product-manager-subtitle').textContent = `${data.producto.sku} · ${data.producto.categoria} · ${data.producto.marca}`;
    render();
  }
  async function open(id) {
    productId = Number(id);
    activeTab = 'general';
    body.innerHTML = '<p class="rp-enterprise-loading">Cargando gestión integral…</p>';
    manager.showModal();
    try { await refresh(); } catch (error) { body.innerHTML = empty(error.message); notify(error.message, true); }
  }
  function addManagerButtons() {
    document.querySelectorAll('[data-admin-edit="producto"]').forEach(edit => {
      if (edit.parentElement.querySelector('[data-manage-product]')) return;
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'rp-primary'; button.dataset.manageProduct = edit.dataset.id;
      button.textContent = 'Administrar';
      edit.parentElement.insertBefore(button, edit);
    });
  }
  new MutationObserver(addManagerButtons).observe(document.body, {subtree:true, childList:true});
  addManagerButtons();

  document.addEventListener('click', async event => {
    const manage = event.target.closest('[data-manage-product]');
    if (manage) { event.preventDefault(); return open(manage.dataset.manageProduct); }
    if (event.target.closest('[data-product-manager-close]')) return manager.close();
    const tab = event.target.closest('[data-product-tab]');
    if (tab) { activeTab = tab.dataset.productTab; return render(); }
    if (!manager.open) return;
    try {
      const image = event.target.closest('[data-remove-image]');
      if (image) { const fd=new FormData();fd.set('accion','desactivar');await post(`/panel/api/imagenes/${image.dataset.removeImage}/`,fd);await refresh();return notify('Imagen desactivada.'); }
      const file = event.target.closest('[data-remove-file]');
      if (file) { const fd=new FormData();fd.set('tipo',file.dataset.removeFile);fd.set('url',file.dataset.url);fd.set('eliminar','1');await post(`/panel/api/productos/${productId}/archivos/`,fd);await refresh();return notify('Archivo retirado.'); }
      const attr = event.target.closest('[data-remove-attribute]');
      if (attr) { const fd=new FormData();fd.set('cod_producto',productId);fd.set('cod_atributo',attr.dataset.removeAttribute);fd.set('desasociar','1');await post('/panel/api/atributos/valores/',fd);await refresh();return notify('Especificación retirada.'); }
      const related = event.target.closest('[data-remove-related]');
      if (related) { const fd=new FormData();fd.set('cod_producto_relacionado',related.dataset.removeRelated);fd.set('desasociar','1');await post(`/panel/api/productos/${productId}/relacionados/`,fd);await refresh();return notify('Relación retirada.'); }
      const promotion = event.target.closest('[data-remove-promotion]');
      if (promotion) { const fd=new FormData();fd.set('cod_producto',productId);fd.set('desasociar','1');await post(`/panel/api/promociones/${promotion.dataset.removePromotion}/productos/`,fd);await refresh();return notify('Promoción retirada.'); }
      const review = event.target.closest('[data-review]');
      if (review) { const fd=new FormData();fd.set('entidad','resena');fd.set('cod_resena',review.dataset.review);fd.set('aprobado',review.dataset.approved);await post(`/panel/api/productos/${productId}/moderacion/`,fd);await refresh();return notify('Reseña moderada.'); }
      const question = event.target.closest('[data-question]');
      if (question) { const fd=new FormData();fd.set('entidad','pregunta');fd.set('cod_pregunta',question.dataset.question);fd.set('estado',question.dataset.state);await post(`/panel/api/productos/${productId}/moderacion/`,fd);await refresh();return notify('Pregunta moderada.'); }
      if (event.target.closest('[data-publish-product]')) { await post(`/panel/api/productos/${productId}/publicar/`,new FormData());await refresh();window.dispatchEvent(new CustomEvent('techtail:product-created'));return notify('Producto publicado correctamente.'); }
    } catch (error) { notify(error.message, true); }
  });

  manager.addEventListener('submit', async event => {
    const form = event.target.closest('[data-enterprise-action]');
    if (!form) return;
    event.preventDefault();
    const action = form.dataset.enterpriseAction;
    const fd = new FormData(form);
    let url = '';
    if (action === 'general') url = `/panel/api/productos/${productId}/actualizar/`;
    if (action === 'image') url = `/panel/api/productos/${productId}/imagenes/`;
    if (action === 'file') url = `/panel/api/productos/${productId}/archivos/`;
    if (action === 'limit') url = `/panel/api/productos/${productId}/limite/`;
    if (action === 'related') url = `/panel/api/productos/${productId}/relacionados/`;
    if (action === 'attribute') url = '/panel/api/atributos/';
    if (action === 'attribute-value') { fd.set('cod_producto',productId); url = '/panel/api/atributos/valores/'; }
    if (action === 'promotion') { const promo=fd.get('cod_promocion');fd.delete('cod_promocion');fd.set('cod_producto',productId);url=`/panel/api/promociones/${promo}/productos/`; }
    if (action === 'answer') { fd.set('entidad','pregunta');url=`/panel/api/productos/${productId}/moderacion/`; }
    if (action === 'image-order') { const id=fd.get('cod_imagen');fd.delete('cod_imagen');fd.set('accion','ordenar');url=`/panel/api/imagenes/${id}/`; }
    try { const result=await post(url,fd);await refresh();notify(result.mensaje || 'Cambios guardados.'); }
    catch (error) { notify(error.message, true); }
  });
})();
