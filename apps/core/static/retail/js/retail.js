(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const state = { session: {autenticado:false, es_prime:false, es_admin:false}, currentPage: 1 };
  let pendingRequests = 0;
  function setLoading(active){ pendingRequests += active ? 1 : -1; pendingRequests=Math.max(0,pendingRequests); document.body.classList.toggle('rp-is-loading',pendingRequests>0); }

  function esc(value){
    return String(value ?? '').replace(/[&<>"'`=\/]/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;', '`':'&#96;', '=':'&#61;', '/':'&#47;'
    }[ch]));
  }
  function num(value, fallback=0){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function money(value){ return esc(value ?? '0.00'); }
  function dateShort(value){ if(!value) return ''; try{return new Date(value).toLocaleString('es-EC',{dateStyle:'medium',timeStyle:'short'});}catch(e){return esc(value);} }
  function getCookie(name){ const value = `; ${document.cookie}`; const parts = value.split(`; ${name}=`); if(parts.length === 2) return parts.pop().split(';').shift(); return ''; }
  function toast(msg){ const box = $('#toast'); const text = msg || 'Operación completada.'; if(!box) return alert(text); box.textContent = text; box.classList.add('show'); setTimeout(()=>box.classList.remove('show'), 2600); }
  function setMessage(msg, isError=false){ const box = $('#cart-message'); if(!box) return; box.textContent = msg || ''; box.classList.toggle('is-error', Boolean(isError)); }

  async function getJSON(url){
    setLoading(true);
    const r = await fetch(url, {headers:{'X-Requested-With':'fetch'}});
    const data = await r.json().catch(()=>({ok:false,mensaje:'Respuesta inválida'}));
    if(!r.ok || data.ok === false){ setLoading(false); throw new Error(data.mensaje || 'Error de servidor'); }
    setLoading(false); return data;
  }
  async function postForm(url, obj){
    setLoading(true);
    const fd = obj instanceof FormData ? obj : new FormData();
    if(!(obj instanceof FormData)) Object.entries(obj || {}).forEach(([k,v])=>fd.append(k, v ?? ''));
    const r = await fetch(url, {method:'POST', body:fd, headers:{'X-CSRFToken':getCookie('csrftoken'), 'X-Requested-With':'fetch'}});
    const data = await r.json().catch(()=>({ok:false,mensaje:'Respuesta inválida'}));
    if(!r.ok || data.ok === false){ setLoading(false); const err = new Error(data.mensaje || 'Error de servidor'); err.payload = data; throw err; }
    setLoading(false); return data;
  }
  function setupTheme(){
    const saved = localStorage.getItem('rp-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    $$('#theme-toggle').forEach(btn=>btn.addEventListener('click',()=>{
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next); localStorage.setItem('rp-theme', next);
    }));
  }
  async function loadSession(){
    try{ state.session = await getJSON('/api/session/'); }catch(e){ state.session={autenticado:false,es_prime:false,es_admin:false}; }
    document.body.dataset.authState = state.session.autenticado ? (state.session.es_prime ? 'prime' : 'cliente') : 'visitante';
    const welcome = $('#rp-user-state');
    if(welcome){
      welcome.innerHTML = state.session.autenticado
        ? `<strong>${esc(state.session.usuario?.nombre_completo || 'Cliente')}</strong><span>${state.session.es_prime ? 'Prime activo' : 'Cliente registrado'}</span>`
        : `<strong>Hola, identifícate</strong><span>Compra, tracking y Prime</span>`;
    }
  }

  function setView(view){
    $$('[data-view-panel]').forEach(el=>el.classList.toggle('rp-hidden', el.dataset.viewPanel !== view));
    if(view === 'catalogo') loadCatalog().catch(err=>toast(err.message));
    if(view === 'pedidos') loadOrders();
    if(view === 'membresia') loadMembership();
  }

  function primeRibbon(p){
    if(p.es_prime) return `<div class="rp-prime-ribbon is-active">✓ Prime activo: envío preferente disponible</div>`;
    return `<div class="rp-prime-ribbon is-locked">🔒 Con Prime: envío elegible gratis, prioridad y ofertas exclusivas</div>`;
  }
  function productCard(p){
    const cod = num(p.cod_producto);
    const nombre = esc(p.nombre || 'Producto');
    const img = p.imagen ? `<img src="${esc(p.imagen)}" alt="${nombre}">` : `<span class="rp-muted">Sin imagen</span>`;
    const addBtn = state.session.autenticado
      ? `<button class="rp-primary" data-add-cart="${cod}">${p.stock_disponible === 0 ? 'Sin stock' : 'Agregar'}</button>`
      : `<a class="rp-primary" href="/login/?next=/">Inicia sesión para comprar</a>`;
    return `<article class="rp-product">
      <div class="rp-product-img">${img}</div>
      <div class="rp-card-topline"><span class="rp-chip">${esc(p.marca || 'Marca')}</span><span class="rp-stock ${p.stock_disponible === 0 ? 'is-out' : ''}">${esc(p.stock_label || 'Stock')}</span></div>
      <h3>${nombre}</h3>
      <p class="rp-muted">${esc(p.descripcion || '')}</p>
      <div class="rp-price">$${money(p.precio_final || p.precio_actual)}</div>
      ${primeRibbon(p)}
      <div class="rp-product-actions">
        <button class="rp-secondary" data-detail="${cod}">Producto detalle</button>
        ${addBtn}
      </div>
    </article>`;
  }

  async function loadCategories(){
    const data = await getJSON('/api/categorias/');
    const select = $('#category-select'); const grid = $('#category-grid');
    if(select) select.innerHTML = '<option value="">Todos los catálogos</option>' + data.categorias.map(c=>`<option value="${num(c.cod_categoria)}">${esc(c.nombre)}</option>`).join('');
    if(grid){
      grid.innerHTML = data.categorias.slice(0,10).map(c=>`<button class="rp-category" data-category="${num(c.cod_categoria)}"><p class="rp-kicker">Catálogo</p><strong>${esc(c.nombre)}</strong><p class="rp-muted">${esc(c.descripcion || 'Ver productos disponibles')}</p></button>`).join('');
      grid.addEventListener('click', e=>{ const btn=e.target.closest('[data-category]'); if(!btn) return; const sel=$('#category-select'); if(sel) sel.value=btn.dataset.category; state.currentPage=1; setView('catalogo'); });
    }
  }
  async function loadFeatured(){
    const data = await getJSON('/api/productos/destacados/');
    if($('#featured-products')) $('#featured-products').innerHTML = data.productos.map(productCard).join('');
    if($('#home-summary')) $('#home-summary').innerHTML = `<div class="rp-mini-item"><strong>${num(data.productos.length)}</strong><br><span class="rp-muted">productos recientes publicados</span></div><div class="rp-mini-item"><strong>${state.session.es_prime ? 'Prime activo' : 'Prime'}</strong><br><span class="rp-muted">envíos, tracking y beneficios visibles</span></div>`;
  }
  async function loadCatalog(){
    const q = encodeURIComponent($('#search-input')?.value || ''); const cat = encodeURIComponent($('#category-select')?.value || '');
    const data = await getJSON(`/api/productos/?q=${q}&categoria=${cat}&page=${state.currentPage}`);
    if($('#catalog-grid')) $('#catalog-grid').innerHTML = data.productos.map(productCard).join('') || '<div class="rp-card">No se encontraron productos.</div>';
    if($('#catalog-meta')) $('#catalog-meta').textContent = `${num(data.paginacion.total)} resultado(s)`;
    if($('#page-label')) $('#page-label').textContent = `Página ${num(data.paginacion.page,1)} de ${num(data.paginacion.num_pages,1)}`;
    if($('#prev-page')) $('#prev-page').disabled = !data.paginacion.has_previous;
    if($('#next-page')) $('#next-page').disabled = !data.paginacion.has_next;
  }

  function primeBenefitsHTML(p){
    const locked = !p.es_prime;
    return `<div class="rp-prime-benefits ${locked ? 'is-locked' : 'is-active'}">
      <div class="rp-prime-benefit-head"><strong>${locked ? 'Lo que podrías tener con Prime' : 'Beneficios Prime aplicables'}</strong><span>${locked ? 'Bloqueado' : 'Activo'}</span></div>
      ${(p.prime_preview||[]).map(b=>`<div class="rp-benefit-row"><span>${locked ? '🔒' : '✓'}</span><div><strong>${esc(b.nombre)}</strong><p class="rp-muted">${esc(b.descripcion)}</p></div></div>`).join('')}
      ${locked ? `<button class="rp-secondary" data-view="membresia" type="button">Ver planes Prime</button>` : ''}
    </div>`;
  }
  async function showProductDetail(cod){
    const data = await getJSON(`/api/productos/${num(cod)}/`); const p = data.producto;
    const nombre = esc(p.nombre || 'Producto'); const img = p.imagen ? `<img src="${esc(p.imagen)}" alt="${nombre}">` : '<span class="rp-muted">Sin imagen</span>';
    const resenas = (p.resenas||[]).map(r=>`<p>★ ${num(r.calificacion)} · ${esc(r.titulo || '')}<br><span class="rp-muted">${esc(r.comentario || '')}</span></p>`).join('') || '<p class="rp-muted">Sin reseñas todavía.</p>';
    const attrs=(p.atributos||[]).map(a=>`<div class="rp-mini-item"><strong>${esc(a.nombre)}</strong><br><span class="rp-muted">${esc(a.valor)}</span></div>`).join('') || '<p class="rp-muted">Sin atributos técnicos registrados.</p>';
    const related=(p.relacionados||[]).map(r=>`<button class="rp-secondary" data-detail="${num(r.cod_producto)}">${esc(r.nombre)} · desde $${money(r.precio_desde)}</button>`).join('') || '<p class="rp-muted">Sin productos relacionados.</p>';
    const buyArea = state.session.autenticado ? `<div class="rp-product-actions"><input id="detail-qty" type="number" min="1" value="1" class="rp-small-input"><button class="rp-secondary" data-quote-lots="${num(p.cod_producto)}">Cotizar por lotes</button><button class="rp-primary" data-add-cart="${num(p.cod_producto)}">Agregar al carrito</button><button class="rp-secondary" data-favorite="${num(p.cod_producto)}">${p.favorito ? 'Quitar favorito' : 'Favorito'}</button></div><div id="lot-quote" class="rp-mini-list"></div>` : `<div class="rp-alert">Para comprar, guardar favoritos o preguntar debes iniciar sesión.</div><a class="rp-primary" href="/login/?next=/">Iniciar sesión</a>`;
    $('#product-detail-content').innerHTML = `<div class="rp-detail">
      <div class="rp-detail-img">${img}</div>
      <div>
        <p class="rp-kicker">${esc(p.categoria)} · ${esc(p.marca)}</p>
        <h1>${nombre}</h1><p>${esc(p.descripcion)}</p>
        <div class="rp-price">$${money(p.precio_final)}</div>
        <p class="rp-muted">SKU: ${esc(p.sku)} · Stock: ${esc(p.stock_label)} ${p.stock_disponible !== null ? '('+esc(p.stock_disponible)+')' : ''}</p>
        ${primeBenefitsHTML(p)}
        ${buyArea}
        <div class="rp-card" style="margin-top:16px"><strong>Especificaciones técnicas</strong><div class="rp-mini-list">${attrs}</div></div>
        <div class="rp-card" style="margin-top:16px"><strong>Relacionados</strong><div class="rp-product-actions">${related}</div></div>
        <div class="rp-card" style="margin-top:16px"><strong>Reseñas recientes</strong>${resenas}</div>
      </div>
    </div>`;
    $('#product-modal').classList.add('is-open');
  }

  async function loadCart(){
    try{
      const data = await getJSON('/api/carrito/');
      if($('#cart-count')) $('#cart-count').textContent = num(data.cantidad_items);
      if($('#cart-total')) $('#cart-total').textContent = money(data.total);
      if($('#cart-items')) $('#cart-items').innerHTML = data.items.map(i=>`<div class="rp-list-item"><strong>${esc(i.nombre)}</strong><br><span class="rp-muted">${esc(i.marca)} · $${money(i.precio_unitario)}</span><div class="rp-form-row"><input type="number" min="1" value="${num(i.cantidad,1)}" data-cart-qty="${num(i.cod_producto)}"><button class="rp-secondary" data-remove-cart="${num(i.cod_producto)}">Quitar</button></div></div>`).join('') || '<div class="rp-list-item">Tu carrito está vacío.</div>';
    }catch(e){ if($('#cart-count')) $('#cart-count').textContent = '0'; }
  }
  async function loadShippingAndPayments(){
    try{ const envios = await getJSON('/operaciones/api/metodos-envio/'); const sel=$('#shipping-method'); if(sel) sel.innerHTML = envios.metodos.map(m=>`<option value="${num(m.cod_metodo_envio)}">${esc(m.nombre)} · ${m.es_premium_gratis && state.session.es_prime ? 'Gratis Prime' : '$'+money(m.costo_base)}</option>`).join(''); }catch(e){}
    try{ const dirs = await getJSON('/api/direcciones/'); const sel=$('#address-select'); if(sel) sel.innerHTML = dirs.direcciones.map(d=>`<option value="${num(d.cod_direccion)}">${esc(d.alias)} · ${esc(d.ciudad)}, ${esc(d.provincia)}</option>`).join('') || '<option value="">Agrega una dirección en Perfil</option>'; }catch(e){}
    try{ const pagos = await getJSON('/operaciones/api/metodos-pago/'); const sel=$('#payment-method'); if(sel) sel.innerHTML = pagos.metodos.map(m=>`<option value="${num(m.cod_metodo_pago)}">${esc(m.marca)} **** ${esc(m.ultimos4)} · ${esc(m.titular)}</option>`).join('') || '<option value="">Registra una tarjeta simulada</option>'; }catch(e){}
  }
  async function validarCarritoAntesDePedido(){ const data = await getJSON('/api/carrito/validar/'); const r=data.resultado||{}; if(r.valido===false){ const errores=Array.isArray(r.errores)?r.errores.join(' | '):'El carrito no está listo para checkout.'; throw new Error(errores); } return r; }
  function showGateway(codPedido){
    $('#payment-box')?.classList.remove('rp-hidden');
    if($('#payment-box')) $('#payment-box').dataset.pedido = codPedido;
    const label = $('#gateway-order-label'); if(label) label.textContent = `Pedido #${codPedido}`;
  }

  async function loadOrders(){
    try{
      const data = await getJSON('/api/mis-pedidos/'); const box=$('#orders-list');
      if(box) box.innerHTML = data.pedidos.map(p=>`<div class="rp-list-item rp-order-card"><div><strong>${esc(p.numero_pedido)}</strong><br><span class="rp-muted">${esc(p.estado_nombre)} · $${money(p.total)} · ${dateShort(p.fecha)}</span></div><div class="rp-product-actions"><button class="rp-secondary" data-track="${num(p.cod_pedido)}">Ver tracking</button><button class="rp-secondary" data-order-detail="${num(p.cod_pedido)}">Detalle</button></div><div id="track-${num(p.cod_pedido)}" class="rp-track-box"></div></div>`).join('') || '<div class="rp-list-item">Aún no tienes pedidos.</div>';
    }catch(e){ if($('#orders-list')) $('#orders-list').innerHTML = '<div class="rp-list-item">Inicia sesión para ver tus pedidos.</div>'; }
  }
  async function renderTracking(codPedido){
    const d=await getJSON(`/api/pedidos/${num(codPedido)}/tracking/`); const box=$(`#track-${num(codPedido)}`);
    if(box) box.innerHTML = `<div class="rp-progress"><div style="width:${num(d.envio.progreso)}%"></div></div><p class="rp-muted">Tracking: ${esc(d.envio.numero_tracking || 'por generar')} · ETA: ${esc(d.envio.fecha_estimada_entrega || '-')}</p><div class="rp-timeline">${d.eventos.map(ev=>`<div class="rp-timeline-item ${ev.completado?'is-done':'is-pending'}"><span></span><div><strong>${esc(ev.nombre)}</strong><p>${esc(ev.descripcion)}</p><small>${esc(ev.ubicacion || '')} · ${dateShort(ev.fecha)} ${ev.origen==='SIMULADO'?'· simulado':''}</small></div></div>`).join('') || '<div class="rp-mini-item">Sin tracking todavía.</div>'}</div>`;
  }
  async function loadMembership(targetSelector='#membership-box'){
    try{
      const data = await getJSON('/api/membresia/'); const box=$(targetSelector); if(!box) return;
      box.innerHTML = `<div class="rp-membership-status ${data.membresia.activa?'is-active':'is-locked'}"><h3>${data.membresia.activa ? 'Membresía Prime activa' : 'Aún no eres Prime'}</h3><p class="rp-muted">${data.membresia.activa ? 'Plan: '+esc(data.membresia.plan)+' · hasta '+esc(data.membresia.fecha_fin) : 'Activa Prime para ver beneficios aplicables en producto, carrito y envío.'}</p></div><div class="rp-product-grid">${data.planes.map(p=>`<div class="rp-card"><strong>${esc(p.nombre)}</strong><div class="rp-price">$${money(p.precio_mensual)}</div><p class="rp-muted">${num(p.duracion_dias)} días</p><div class="rp-mini-list">${(p.beneficios||[]).map(b=>`<div class="rp-mini-item"><strong>${esc(b.nombre)}</strong><br><span class="rp-muted">${esc(b.descripcion)}</span></div>`).join('')}</div>${data.membresia.cod_plan===p.cod_plan && data.membresia.activa ? '<span class="rp-chip">Plan actual</span>' : `<a class="rp-primary" href="/prime/checkout/${num(p.cod_plan)}/">Comprar membresía</a>`}</div>`).join('')}</div>`;
    }catch(e){ const box=$(targetSelector); if(box) box.innerHTML = '<p>Inicia sesión para ver tu membresía.</p>'; }
  }

  function setupClientEvents(){
    $$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
    $('#catalog-search')?.addEventListener('submit', e=>{e.preventDefault(); state.currentPage=1; setView('catalogo');});
    $('#prev-page')?.addEventListener('click',()=>{state.currentPage=Math.max(1,state.currentPage-1);loadCatalog().catch(err=>toast(err.message));});
    $('#next-page')?.addEventListener('click',()=>{state.currentPage++;loadCatalog().catch(err=>toast(err.message));});
    $('#btn-cart')?.addEventListener('click',()=>{ if(!state.session.autenticado){ location.href='/login/?next=/'; return; } $('#cart-drawer').classList.add('is-open'); loadCart(); loadShippingAndPayments(); });
    $('#close-cart')?.addEventListener('click',()=>$('#cart-drawer').classList.remove('is-open'));
    $('#close-product-modal')?.addEventListener('click',()=>$('#product-modal').classList.remove('is-open'));
    $('#toggle-payment-form')?.addEventListener('click',()=>$('#payment-register-form')?.classList.toggle('rp-hidden'));
    $('#payment-register-form')?.addEventListener('submit', async e=>{ e.preventDefault(); try{ const d=await postForm('/operaciones/api/metodos-pago/registrar/', new FormData(e.target)); toast(d.mensaje||'Método registrado.'); e.target.reset(); e.target.classList.add('rp-hidden'); await loadShippingAndPayments(); }catch(err){toast(err.message);} });
    document.addEventListener('click', async e=>{
      const detail=e.target.closest('[data-detail]'); if(detail){ showProductDetail(detail.dataset.detail).catch(err=>toast(err.message)); return; }
      const add=e.target.closest('[data-add-cart]'); if(add){ if(!state.session.autenticado){ location.href='/login/?next=/'; return; } const qty=$('#detail-qty')?.value||1; try{ await postForm('/api/carrito/agregar/', {cod_producto:add.dataset.addCart, cantidad:qty}); toast('Producto agregado'); loadCart(); }catch(err){toast(err.message);} return; }
      const quote=e.target.closest('[data-quote-lots]'); if(quote){ try{ const qty=$('#detail-qty')?.value||1, d=await getJSON(`/api/productos/${num(quote.dataset.quoteLots)}/cotizar/?cantidad=${encodeURIComponent(qty)}`); const box=$('#lot-quote'); if(box) box.innerHTML=`<div class="rp-mini-item"><strong>${num(d.cantidad_cubierta)} de ${num(d.cantidad_solicitada)} unidades cubiertas</strong><br><span class="rp-muted">Subtotal de lotes: $${money(d.subtotal_lotes)}${d.requiere_proveedor?' · requiere cobertura de proveedor':''}</span></div>`; }catch(err){toast(err.message);} return; }
      const remove=e.target.closest('[data-remove-cart]'); if(remove){ try{ await postForm('/api/carrito/eliminar/', {cod_producto:remove.dataset.removeCart}); loadCart(); }catch(err){toast(err.message);} return; }
      const fav=e.target.closest('[data-favorite]'); if(fav){ try{ const d=await postForm('/api/favoritos/toggle/', {cod_producto:fav.dataset.favorite}); toast(d.mensaje); }catch(err){toast(err.message);} return; }
      const track=e.target.closest('[data-track]'); if(track){ try{ await renderTracking(track.dataset.track); }catch(err){toast(err.message);} return; }
      const prime=e.target.closest('[data-activate-prime]'); if(prime){ try{ const d=await postForm('/api/membresia/activar/', {cod_plan:prime.dataset.activatePrime}); toast(d.mensaje); await loadSession(); loadMembership(); }catch(err){toast(err.message);} return; }
    });
    $('#cart-items')?.addEventListener('change', async e=>{ const input=e.target.closest('[data-cart-qty]'); if(!input) return; try{ await postForm('/api/carrito/actualizar/', {cod_producto:input.dataset.cartQty, cantidad:input.value}); loadCart(); }catch(err){toast(err.message);} });
    $('#btn-checkout')?.addEventListener('click', async()=>{ try{ await validarCarritoAntesDePedido(); location.href='/checkout/'; }catch(err){setMessage(err.message,true);toast(err.message);} });
  }
  async function setupClient(){ await loadSession(); await Promise.allSettled([loadCategories(), loadFeatured(), state.session.autenticado ? loadCart() : Promise.resolve(), state.session.autenticado ? loadShippingAndPayments() : Promise.resolve()]); setupClientEvents(); }

  async function loadUbicaciones(){
    const data = await getJSON('/api/ubicaciones/'); const prov=$('#address-provincia'); const cant=$('#address-canton'); if(!prov || !cant) return;
    prov.innerHTML = '<option value="">Provincia</option>' + data.provincias.map(p=>`<option value="${num(p.cod_provincia)}">${esc(p.nombre)}</option>`).join('');
    function fillCantones(cod){ const list=data.cantones.filter(c=>String(c.cod_provincia)===String(cod)); cant.innerHTML='<option value="">Cantón / ciudad</option>'+list.map(c=>`<option value="${num(c.cod_canton)}">${esc(c.nombre)}</option>`).join(''); }
    prov.addEventListener('change',()=>fillCantones(prov.value));
  }
  async function setupPerfil(){
    await loadSession();
    try{ const d=await getJSON('/api/perfil/'); $('#profile-nombres')&&( $('#profile-nombres').value=d.usuario.nombres||'' ); $('#profile-apellidos')&&( $('#profile-apellidos').value=d.usuario.apellidos||'' ); $('#profile-telefono')&&( $('#profile-telefono').value=d.usuario.telefono||'' ); $('#profile-documento')&&( $('#profile-documento').value=d.usuario.documento_identidad||'' ); if($('#profile-status')) $('#profile-status').innerHTML=`<div class="rp-mini-item"><strong>${esc(d.usuario.email)}</strong><br><span class="rp-muted">Email ${d.usuario.email_verificado?'verificado':'pendiente'}</span></div><div class="rp-mini-item"><strong>${state.session.es_prime?'Prime':'Cliente'}</strong><br><span class="rp-muted">Rol comercial actual</span></div>`; if($('#account-summary')) $('#account-summary').innerHTML=`<div class="rp-mini-item"><strong>${esc(d.usuario.nombres)} ${esc(d.usuario.apellidos)}</strong><br><span class="rp-muted">${esc(d.usuario.email)}</span></div><div class="rp-mini-item"><strong>${state.session.es_prime?'Prime activo':'Sin Prime'}</strong><br><span class="rp-muted">Suscripción</span></div>`; }catch(e){toast(e.message)}
    await loadUbicaciones().catch(e=>toast(e.message));
    async function loadAddr(){ const d=await getJSON('/api/direcciones/'); $('#address-list').innerHTML=d.direcciones.map(a=>`<div class="rp-list-item"><strong>${esc(a.alias)} ${a.es_predeterminada?'· Predeterminada':''}</strong><br><span class="rp-muted">${esc(a.linea1)}, ${esc(a.ciudad)}, ${esc(a.provincia)}</span><br><span class="rp-muted">Recibe: ${esc(a.receptor)} · ${esc(a.telefono_contacto||'sin teléfono')}</span><br><button class="rp-secondary" data-del-address="${num(a.cod_direccion)}">Eliminar</button></div>`).join('')||'<div class="rp-list-item">Sin direcciones.</div>'; }
    async function loadPayments(){ const d=await getJSON('/operaciones/api/metodos-pago/'); $('#payment-list').innerHTML=d.metodos.map(m=>`<div class="rp-list-item"><strong>${esc(m.marca)} **** ${esc(m.ultimos4)}</strong><br><span class="rp-muted">${esc(m.titular)} · vence ${esc(m.exp_mes)}/${esc(m.exp_anio)}</span><br><button class="rp-secondary" data-del-payment="${num(m.cod_metodo_pago)}">Eliminar</button></div>`).join('')||'<div class="rp-list-item">Sin métodos de pago.</div>'; }
    async function loadInvoices(){ const d=await getJSON('/operaciones/api/facturas/'); $('#invoice-list').innerHTML=d.facturas.map(f=>`<div class="rp-list-item"><strong>${esc(f.numero_factura)}</strong><br><span class="rp-muted">Pedido ${esc(f.numero_pedido)} · Total $${money(f.total)} · IVA $${money(f.impuesto)}</span><br><span class="rp-muted">${esc(f.estado)} · ${dateShort(f.fecha_emision)}</span></div>`).join('')||'<div class="rp-list-item">Aún no hay facturas. Se generan cuando un pago se captura correctamente.</div>'; }
    loadAddr().catch(e=>toast(e.message)); loadPayments().catch(()=>{}); loadInvoices().catch(()=>{}); loadMembership('#profile-membership-box').catch(()=>{});
    $$('[data-profile-tab]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-profile-panel]').forEach(p=>p.classList.toggle('rp-hidden',p.dataset.profilePanel!==btn.dataset.profileTab));}));
    $('#profile-form')?.addEventListener('submit',async e=>{e.preventDefault();try{const d=await postForm('/api/perfil/actualizar/', new FormData(e.target));toast(d.mensaje);}catch(err){toast(err.message)}});
    $('#address-form')?.addEventListener('submit',async e=>{e.preventDefault();try{const d=await postForm('/api/direcciones/crear/', new FormData(e.target));toast(d.mensaje);e.target.reset(); await loadUbicaciones(); loadAddr();}catch(err){toast(err.message)}});
    $('#profile-payment-form')?.addEventListener('submit',async e=>{e.preventDefault();try{const d=await postForm('/operaciones/api/metodos-pago/registrar/', new FormData(e.target));toast(d.mensaje);e.target.reset();loadPayments();}catch(err){toast(err.message)}});
    document.addEventListener('click', async e=>{ const b=e.target.closest('[data-del-address]'); if(b){try{const d=await postForm(`/api/direcciones/${num(b.dataset.delAddress)}/eliminar/`,{});toast(d.mensaje);loadAddr();}catch(err){toast(err.message)} return;} const pay=e.target.closest('[data-del-payment]'); if(pay){try{const d=await postForm(`/operaciones/api/metodos-pago/${num(pay.dataset.delPayment)}/desactivar/`,{});toast(d.mensaje);loadPayments();}catch(err){toast(err.message)} return;} const prime=e.target.closest('[data-activate-prime]'); if(prime){try{const d=await postForm('/api/membresia/activar/', {cod_plan:prime.dataset.activatePrime}); toast(d.mensaje); await loadSession(); loadMembership('#profile-membership-box');}catch(err){toast(err.message)}} });
  }

  function table(rows, cols){ if(!rows||!rows.length) return '<div class="rp-card">Sin datos.</div>'; return `<table class="rp-table"><thead><tr>${cols.map(c=>`<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${c.render?c.render(r):esc(r[c.key]??'')}</td>`).join('')}</tr>`).join('')}</tbody></table>`; }
  function bars(rows, labelKey, valueKey){ const max=Math.max(1,...rows.map(r=>Number(String(r[valueKey]||0).replace(/[^0-9.]/g,'')))); return rows.map(r=>{const v=Number(String(r[valueKey]||0).replace(/[^0-9.]/g,'')); return `<div class="rp-bar-row"><span>${esc(r[labelKey])}</span><div class="rp-bar-track"><div class="rp-bar-fill" style="width:${Math.max(3,(v/max)*100)}%"></div></div><strong>${esc(r[valueKey])}</strong></div>`}).join('') || '<p class="rp-muted">Sin datos.</p>'; }
  async function adminResumen(){ const d=await getJSON('/panel/api/resumen/'); const k=d.tarjetas; $('#admin-kpis').innerHTML=Object.entries(k).map(([name,val])=>`<div class="rp-kpi"><span class="rp-muted">${esc(name.replaceAll('_',' '))}</span><strong>${esc(val)}</strong></div>`).join(''); $('#sales-chart').innerHTML=bars(d.ventas_diarias,'fecha','total_ventas'); $('#orders-chart').innerHTML=bars(d.estados_pedido,'estado','total'); }
  async function adminProductos(){ const q=$('#admin-product-search')?.value||'', estado=$('#admin-product-state')?.value||''; const d=await getJSON(`/panel/api/productos/?q=${encodeURIComponent(q)}&estado=${encodeURIComponent(estado)}`); $('#admin-products').innerHTML=table(d.productos,[{key:'sku',label:'SKU'},{key:'nombre',label:'Producto'},{key:'marca',label:'Marca'},{key:'precio',label:'Precio'},{key:'stock',label:'Stock'},{key:'estado',label:'Estado'},{label:'Acciones',render:r=>`<button class="rp-secondary" data-publish="${num(r.cod_producto)}">Publicar</button> <button class="rp-secondary" data-pause="${num(r.cod_producto)}">Pausar</button> <button class="rp-secondary" data-disable="${num(r.cod_producto)}">Desactivar</button>`}]); }
  async function adminPedidos(){ const estado=$('#admin-order-state')?.value||''; const d=await getJSON(`/panel/api/pedidos/?estado=${encodeURIComponent(estado)}`); const sel=$('#admin-order-state'); if(sel && sel.options.length<=1){ sel.innerHTML='<option value="">Todos los estados</option>'+d.estados.map(e=>`<option value="${esc(e.cod_estado_pedido)}">${esc(e.nombre)}</option>`).join(''); } $('#admin-orders').innerHTML=table(d.pedidos,[{key:'numero_pedido',label:'Pedido'},{key:'cliente',label:'Cliente'},{key:'estado_nombre',label:'Estado'},{key:'total',label:'Total'},{key:'fecha',label:'Fecha'}]); }
  async function adminInventory(){ const d=await getJSON('/panel/api/inventario/'); $('#admin-inventory').innerHTML=table(d.inventario,[{key:'producto',label:'Producto'},{key:'almacen',label:'Almacén'},{key:'stock_total',label:'Total'},{key:'stock_reservado',label:'Reservado'},{key:'stock_disponible',label:'Disponible'},{key:'stock_minimo',label:'Mínimo'}]); }
  async function adminSuppliers(){ const d=await getJSON('/panel/api/proveedores/'); $('#admin-suppliers').innerHTML=table(d.proveedores,[{key:'ruc',label:'RUC'},{key:'razon_social',label:'Razón social'},{key:'email',label:'Email'},{key:'ciudad',label:'Ciudad'},{key:'calificacion',label:'Calificación'},{key:'activo',label:'Activo'}]); }
  async function adminReports(){ const d=await getJSON('/panel/api/reportes/ventas/'); $('#admin-reports').innerHTML=bars(d.ventas,'fecha','total_ventas'); }
  function listCards(rows, render){ return (rows||[]).map(render).join('') || '<p class="rp-muted">Sin datos.</p>'; }
  async function adminCatalog(){ const [c,b,r]=await Promise.all(['categoria','marca','regla_precio'].map(entidad=>getJSON(`/panel/api/catalogo/?entidad=${entidad}`))); $('#admin-categories').innerHTML=listCards(c.registros,x=>`<div class="rp-list-item"><strong>${esc(x.nombre)}</strong><br><span class="rp-muted">${esc(x.slug||'')}</span></div>`); $('#admin-brands').innerHTML=listCards(b.registros,x=>`<div class="rp-list-item"><strong>${esc(x.nombre)}</strong><br><span class="rp-muted">${esc(x.descripcion||'')}</span></div>`); $('#admin-price-rules').innerHTML=listCards(r.registros,x=>`<div class="rp-list-item"><strong>Regla #${num(x.cod_regla_precio)}</strong><br><span class="rp-muted">Margen ${esc(x.margen_porcentaje)}% · prioridad ${esc(x.prioridad)}</span></div>`); }
  async function adminInventoryDetail(){ const [lots,alerts]=await Promise.all([getJSON('/panel/api/inventario/lotes/'),getJSON('/panel/api/inventario/alertas/')]); $('#admin-lots').innerHTML=table(lots.lotes,[{key:'numero_lote',label:'Lote'},{key:'producto',label:'Producto'},{key:'disponible',label:'Disponible'},{key:'reservada',label:'Reservado'},{key:'pvp',label:'PVP'},{key:'estado',label:'Estado'}]); $('#admin-stock-alerts').innerHTML=listCards(alerts.alertas,a=>`<div class="rp-list-item"><strong>${esc(a.tipo)} · ${esc(a.producto)}</strong><br><span class="rp-muted">${esc(a.mensaje)}</span></div>`); }
  async function adminInventoryFull(){ await Promise.all([adminInventory(),adminInventoryDetail()]); }
  async function adminSupply(){ const d=await getJSON('/panel/api/abastecimiento/'); $('#admin-supply-orders').innerHTML=table(d.ordenes,[{key:'cod_orden_abastecimiento',label:'Orden'},{key:'proveedor',label:'Proveedor'},{key:'almacen',label:'Almacén'},{key:'estado',label:'Estado'},{key:'total_estimado',label:'Total'},{key:'fecha',label:'Fecha'}]); }
  async function adminMarketing(){ const [p,c]=await Promise.all(['promocion','cupon'].map(entidad=>getJSON(`/panel/api/catalogo/?entidad=${entidad}&activos=0`))); $('#admin-promotions').innerHTML=listCards(p.registros,x=>`<div class="rp-list-item"><strong>${esc(x.codigo)} · ${esc(x.nombre)}</strong><br><span class="rp-muted">${esc(x.tipo_descuento)} ${esc(x.valor)} · ${x.activo?'Activa':'Inactiva'}</span></div>`); $('#admin-coupons').innerHTML=listCards(c.registros,x=>`<div class="rp-list-item"><strong>${esc(x.codigo)} · ${esc(x.nombre)}</strong><br><span class="rp-muted">${esc(x.tipo_descuento)} ${esc(x.valor)} · ${x.activo?'Activo':'Inactivo'}</span></div>`); }
  async function adminPrime(){ const d=await getJSON('/panel/api/prime/'); $('#admin-prime-plans').innerHTML=listCards(d.planes,x=>`<div class="rp-list-item"><strong>${esc(x.nombre)}</strong><br><span class="rp-muted">$${money(x.precio_mensual)} / ${esc(x.duracion_dias)} días</span></div>`); $('#admin-memberships').innerHTML=listCards(d.membresias,x=>`<div class="rp-list-item"><strong>${esc(x.usuario)}</strong><br><span class="rp-muted">${esc(x.plan)} · ${esc(x.estado)} · hasta ${esc(x.fin)}</span></div>`); }
  async function adminPayments(){ const d=await getJSON('/panel/api/pagos/'); $('#admin-payments').innerHTML=table(d.transacciones,[{key:'cod_transaccion',label:'Transacción'},{key:'pedido',label:'Pedido'},{key:'monto',label:'Monto'},{key:'estado',label:'Estado'},{key:'fecha',label:'Fecha'}]); }
  async function adminTracking(){ const d=await getJSON('/panel/api/tracking/'); $('#admin-shipments').innerHTML=table(d.envios,[{key:'pedido',label:'Pedido'},{key:'tracking',label:'Tracking'},{key:'estado',label:'Estado'},{key:'transportista',label:'Transportista'}]); $('#admin-tracking-schedules').innerHTML=table(d.programaciones,[{key:'cod_envio',label:'Envío'},{key:'evento',label:'Evento'},{key:'fecha_programada',label:'Programado'},{key:'procesado',label:'Procesado'}]); }
  function setupAdmin(){ const load={dashboard:adminResumen,productos:adminProductos,catalogo:adminCatalog,pedidos:adminPedidos,inventario:adminInventoryFull,proveedores:adminSuppliers,abastecimiento:adminSupply,marketing:adminMarketing,prime:adminPrime,pagos:adminPayments,tracking:adminTracking,reportes:adminReports}; adminResumen().catch(e=>toast(e.message)); $$('[data-admin-section]').forEach(btn=>btn.addEventListener('click',()=>{const s=btn.dataset.adminSection; $$('[data-admin-panel]').forEach(p=>p.classList.toggle('rp-hidden',p.dataset.adminPanel!==s)); (load[s]||adminResumen)().catch(e=>toast(e.message));})); $('#admin-product-search')?.addEventListener('input',()=>adminProductos().catch(e=>toast(e.message))); $('#admin-product-state')?.addEventListener('change',()=>adminProductos().catch(e=>toast(e.message))); $('#admin-order-state')?.addEventListener('change',()=>adminPedidos().catch(e=>toast(e.message))); document.addEventListener('click', async e=>{ const pub=e.target.closest('[data-publish]'), pau=e.target.closest('[data-pause]'), dis=e.target.closest('[data-disable]'), tracking=e.target.closest('[data-process-tracking]'); try{ if(pub){await postForm(`/panel/api/productos/${num(pub.dataset.publish)}/publicar/`,{});toast('Producto publicado');adminProductos();} if(pau){await postForm(`/panel/api/productos/${num(pau.dataset.pause)}/pausar/`,{});toast('Producto pausado');adminProductos();} if(dis){await postForm(`/panel/api/productos/${num(dis.dataset.disable)}/desactivar/`,{});toast('Producto desactivado');adminProductos();} if(tracking){const d=await postForm('/panel/api/tracking/acciones/',{accion:'procesar'});toast(`${num(d.procesados)} eventos procesados`);adminTracking();} }catch(err){toast(err.message)} }); }

  async function loadSupplierPanel(){ const d=await getJSON('/proveedores/api/mi-panel/'); $('#supplier-name').textContent=d.proveedor.razon_social; $('#supplier-summary').innerHTML=`<div class="rp-mini-item"><strong>${esc(d.proveedor.calificacion)}</strong><br><span class="rp-muted">Calificación</span></div><div class="rp-mini-item"><strong>${num(d.productos.length)}</strong><br><span class="rp-muted">Productos asociados</span></div>`; $('#supplier-products').innerHTML=table(d.productos,[{key:'producto',label:'Producto'},{key:'sku_proveedor',label:'SKU proveedor'},{key:'stock_disponible',label:'Stock'},{key:'costo_unitario',label:'Costo'},{key:'tiempo_entrega_dias',label:'Entrega (días)'},{key:'prioridad',label:'Prioridad'}]); $('#supplier-orders').innerHTML=table(d.ordenes,[{key:'cod_orden_abastecimiento',label:'Orden'},{key:'estado',label:'Estado'},{key:'almacen',label:'Almacén'},{key:'total_estimado',label:'Total estimado'},{key:'fecha',label:'Fecha'}]); $('#supplier-history').innerHTML=listCards(d.historial,h=>`<div class="rp-list-item"><strong>${esc(h.evento)}</strong><br><span class="rp-muted">${esc(h.descripcion||'')} · ${dateShort(h.fecha)}</span></div>`); }
  function setupSupplier(){ loadSupplierPanel().catch(e=>toast(e.message)); $$('[data-supplier-tab]').forEach(btn=>btn.addEventListener('click',()=>$$('[data-supplier-panel]').forEach(panel=>panel.classList.toggle('rp-hidden',panel.dataset.supplierPanel!==btn.dataset.supplierTab)))); }

  document.addEventListener('DOMContentLoaded',()=>{ setupTheme(); const page=document.body.dataset.page; if(page==='cliente') setupClient().catch(e=>toast(e.message)); if(page==='perfil') setupPerfil().catch(e=>toast(e.message)); if(page==='admin') setupAdmin(); if(page==='proveedor') setupSupplier(); });
})();
