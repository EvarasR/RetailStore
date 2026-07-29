(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const state = { cart:null, pedido:null, metodos:[], session:null };
  const esc = v => String(v ?? '').replace(/[&<>"'`=\/]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;','=':'&#61;','/':'&#47;'}[ch]));
  const num = (v, f=0) => { const n=Number(v); return Number.isFinite(n)?n:f; };
  const money = v => esc(v ?? '0.00');
  const getCookie = name => { const value=`; ${document.cookie}`; const parts=value.split(`; ${name}=`); return parts.length===2?parts.pop().split(';').shift():''; };
  function toast(msg){ const box=$('#toast'); if(!box) return alert(msg); box.textContent=msg||'Listo'; box.classList.add('show'); setTimeout(()=>box.classList.remove('show'),2800); }
  function setMsg(sel,msg,bad=false){ const el=$(sel); if(!el) return; el.textContent=msg||''; el.classList.toggle('is-error',!!bad); }
  async function getJSON(url){ const r=await fetch(url,{headers:{'X-Requested-With':'fetch'}}); const d=await r.json().catch(()=>({ok:false,mensaje:'Respuesta inválida'})); if(!r.ok||d.ok===false){const e=new Error(d.mensaje||'Error'); e.payload=d; throw e;} return d; }
  async function postForm(url,obj){ const fd=obj instanceof FormData?obj:new FormData(); if(!(obj instanceof FormData)) Object.entries(obj||{}).forEach(([k,v])=>fd.append(k,v??'')); const r=await fetch(url,{method:'POST',body:fd,headers:{'X-CSRFToken':getCookie('csrftoken'),'X-Requested-With':'fetch'}}); const d=await r.json().catch(()=>({ok:false,mensaje:'Respuesta inválida'})); if(!r.ok||d.ok===false){const e=new Error(d.mensaje||'Error'); e.payload=d; throw e;} return d; }

  function detectCard(number){
    const n=String(number||'').replace(/\D/g,'');
    let brand=null, logo='💳', maxLen=16, cvvLen=3;
    if(/^4/.test(n)){brand='VISA'; logo='💙'; maxLen=16;}
    else if(/^5[1-5]/.test(n)||/^2(2[2-9][1-9]|[3-6][0-9]{2}|7[01][0-9]|720)/.test(n)){brand='MASTERCARD'; logo='🔴'; maxLen=16;}
    else if(/^3[47]/.test(n)){brand='AMEX'; logo='🔷'; maxLen=15; cvvLen=4;}
    else if(/^6(011|5|4[4-9])/.test(n)){brand='DISCOVER'; logo='🟠'; maxLen=16;}
    else if(/^3(0[0-5]|[68])/.test(n)){brand='DINERS'; logo='⚪'; maxLen=14;}
    else if(/^35(2[89]|[3-8][0-9])/.test(n)){brand='JCB'; logo='🟢'; maxLen=16;}
    const bin6=n.slice(0,6);
    const debitBins=['400000','421765','422222','510510','520000','530000','601100'];
    const kind=debitBins.includes(bin6)?'DEBITO':'CREDITO';
    return brand?{brand,logo,maxLen,cvvLen,kind}:null;
  }
  function luhnCheck(raw){ const arr=String(raw||'').replace(/\D/g,'').split('').reverse().map(Number); if(arr.length<12) return false; let sum=0; arr.forEach((d,i)=>{ if(i%2===1){d*=2;if(d>9)d-=9;} sum+=d; }); return sum%10===0; }
  function formatCard(v,type){ const n=String(v||'').replace(/\D/g,'').slice(0,type?.maxLen||16); if(type?.maxLen===15) return n.replace(/(\d{4})(\d{0,6})(\d{0,5})/,(_,a,b,c)=>[a,b,c].filter(Boolean).join(' ')); return (n.match(/.{1,4}/g)||[]).join(' '); }
  function setupCardVisual(){
    const number=$('#pay-card-number'), name=$('#pay-card-name'), expiry=$('#pay-card-expiry'), cvv=$('#pay-card-cvv'), visual=$('#pay-card-visual');
    if(!number) return;
    number.addEventListener('input',e=>{ const type=detectCard(e.target.value); e.target.value=formatCard(e.target.value,type); $('#pay-display-number').textContent=e.target.value||'#### #### #### ####'; $('#pay-card-type').textContent=type?type.brand:'TARJETA'; $('#pay-card-logo').textContent=type?type.logo:'💳'; $('#pay-card-brand').textContent='Marca: '+(type?type.brand:'-'); $('#pay-card-kind').textContent='Tipo: '+(type?type.kind:'-'); cvv.maxLength=type?.cvvLen||3; validateCardForm(false); });
    name?.addEventListener('input',e=>{ e.target.value=e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ\s]/gi,''); $('#pay-display-name').textContent=e.target.value||'NOMBRE APELLIDO'; });
    expiry?.addEventListener('input',e=>{ let v=e.target.value.replace(/\D/g,'').slice(0,4); if(v.length>=3)v=v.slice(0,2)+'/'+v.slice(2); e.target.value=v; $('#pay-display-date').textContent=v||'MM/AA'; });
    cvv?.addEventListener('focus',()=>visual?.classList.add('flipped'));
    cvv?.addEventListener('blur',()=>visual?.classList.remove('flipped'));
    cvv?.addEventListener('input',e=>{ e.target.value=e.target.value.replace(/\D/g,''); $('#pay-display-cvv').textContent='•'.repeat(e.target.value.length)||'•••'; });
  }
  function validateCardForm(show=true){
    const number=$('#pay-card-number'), name=$('#pay-card-name'), expiry=$('#pay-card-expiry'), cvv=$('#pay-card-cvv'); if(!number) return false;
    const raw=number.value.replace(/\D/g,''); const type=detectCard(raw); let msg='';
    if(!type) msg='Número de tarjeta no reconocido.';
    else if(raw.length!==type.maxLen) msg='Número incompleto para '+type.brand+'.';
    else if(!luhnCheck(raw)) msg='Número inválido: no cumple algoritmo Luhn.';
    else if((name.value||'').trim().length<3) msg='Nombre del titular muy corto.';
    else if(!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value||'')) msg='Fecha inválida. Usa MM/AA.';
    else {
      const [mm,yy]=expiry.value.split('/').map(Number); const year=2000+yy; const now=new Date();
      if(year<now.getFullYear()||(year===now.getFullYear()&&mm<now.getMonth()+1)) msg='La tarjeta está vencida.';
      else if((cvv.value||'').length!==type.cvvLen) msg='CVV inválido. Debe tener '+type.cvvLen+' dígitos.';
    }
    if(show||msg) setMsg('#pay-card-error', msg, !!msg);
    return !msg;
  }
  async function saveNewCard(){
    if(!validateCardForm(true)) throw new Error('Corrige la tarjeta simulada antes de guardarla.');
    const [mm,yy]=$('#pay-card-expiry').value.split('/'); const fd=new FormData($('#new-card-form'));
    fd.set('numero_tarjeta',$('#pay-card-number').value.replace(/\D/g,'')); fd.set('exp_mes',mm); fd.set('exp_anio',String(2000+Number(yy))); fd.set('cvv',$('#pay-card-cvv').value);
    const d=await postForm('/operaciones/api/metodos-pago/registrar/',fd); toast(d.mensaje||'Tarjeta guardada.'); $('#new-card-form').reset(); $('#checkout-card-form')?.classList.add('rp-hidden'); await loadPaymentMethods(); return d.cod_metodo_pago;
  }
  async function loadPaymentMethods(target='#checkout-payment-method'){
    const d=await getJSON('/operaciones/api/metodos-pago/'); state.metodos=d.metodos||[];
    const html=state.metodos.map(m=>`<option value="${num(m.cod_metodo_pago)}">${esc(m.marca)} ${esc(m.tipo||'TARJETA')} **** ${esc(m.ultimos4)} · saldo $${money(m.saldo_disponible)}</option>`).join('') || '<option value="">Registra una tarjeta simulada</option>';
    $$(target).forEach(sel=>sel.innerHTML=html);
    return state.metodos;
  }
  async function setupCommonGateway(){
    setupCardVisual();
    $('#checkout-toggle-new-card')?.addEventListener('click',()=>$('#checkout-card-form')?.classList.toggle('rp-hidden'));
    $('#new-card-form')?.addEventListener('submit',async e=>{ e.preventDefault(); try{ await saveNewCard(); }catch(err){toast(err.message);} });
  }
  async function setupProductCheckout(){
    await setupCommonGateway();
    const session=await getJSON('/api/session/'); state.session=session;
    $('#checkout-account-box').innerHTML=`<div class="rp-mini-item"><strong>${esc(session.usuario?.nombre_completo||'Cliente')}</strong><br><span class="rp-muted">${session.es_prime?'Prime activo':'Cliente normal'}</span></div>`;
    const cart=await getJSON('/api/carrito/'); state.cart=cart; $('#checkout-cart-total').textContent=money(cart.total);
    $('#checkout-cart').innerHTML=(cart.items||[]).map(i=>`<div class="rp-list-item"><strong>${esc(i.nombre)}</strong><br><span class="rp-muted">${esc(i.marca)} · ${num(i.cantidad)} u. · $${money(i.subtotal)}</span></div>`).join('') || '<div class="rp-list-item">Tu carrito está vacío.</div>';
    try{ const val=await getJSON('/api/carrito/validar/'); const ok=val.resultado?.valido!==false; setMsg('#checkout-validation', ok?'Carrito validado: stock y límites retail correctos.':'El carrito tiene observaciones.', !ok); }catch(e){setMsg('#checkout-validation',e.message,true);}
    const dirs=await getJSON('/api/direcciones/'); $('#checkout-address').innerHTML=(dirs.direcciones||[]).map(d=>`<option value="${num(d.cod_direccion)}">${esc(d.alias)} · ${esc(d.ciudad)}, ${esc(d.provincia)} · ${esc(d.linea1)}</option>`).join('') || '<option value="">Agrega una dirección en Mi cuenta</option>';
    const env=await getJSON('/operaciones/api/metodos-envio/'); $('#checkout-shipping').innerHTML=(env.metodos||[]).map(m=>`<option value="${num(m.cod_metodo_envio)}">${esc(m.nombre)} · ${m.es_premium_gratis&&session.es_prime?'Gratis Prime':'$'+money(m.costo_base)} · ${num(m.dias_min)}-${num(m.dias_max)} días</option>`).join('');
    $('#checkout-prime-note').className='rp-prime-ribbon '+(session.es_prime?'is-active':'is-locked'); $('#checkout-prime-note').textContent=session.es_prime?'Prime activo: métodos elegibles gratis o preferentes.':'Sin Prime: puedes comprar, pero los beneficios premium permanecen bloqueados.';
    await loadPaymentMethods('#checkout-payment-method');
    $('#checkout-create-order').addEventListener('click',async()=>{ try{ if(!$('#checkout-address').value) throw new Error('Agrega o selecciona una dirección.'); setMsg('#checkout-order-message','Creando pedido pendiente de pago...'); const d=await postForm('/api/checkout/crear-pedido/',{cod_direccion_envio:$('#checkout-address').value,cod_metodo_envio:$('#checkout-shipping').value}); state.pedido=d.cod_pedido; $('#checkout-payment-section').classList.remove('rp-hidden'); $('#checkout-order-title').textContent='Pedido #'+d.cod_pedido; setMsg('#checkout-order-message','Pedido creado. Aún no tiene tracking: falta pagar.',false); toast(d.mensaje); }catch(err){setMsg('#checkout-order-message',err.message,true);toast(err.message);} });
    $('#checkout-pay').addEventListener('click',async()=>{ try{ if(!state.pedido) throw new Error('Primero confirma el pedido.'); let method=$('#checkout-payment-method').value; if(!method && !$('#checkout-card-form').classList.contains('rp-hidden')) method=await saveNewCard(); if(!method) throw new Error('Selecciona o registra una tarjeta simulada.'); setMsg('#checkout-pay-message','Autorizando pago...'); const auth=await postForm('/operaciones/api/pagos/autorizar/',{cod_pedido:state.pedido,cod_metodo_pago:method,idempotency_key:crypto.randomUUID?.()||String(Date.now())}); setMsg('#checkout-pay-message','Pago autorizado. Capturando fondos...'); const cap=await postForm('/operaciones/api/pagos/capturar/',{cod_transaccion:auth.cod_transaccion}); $('#checkout-result').classList.remove('rp-hidden'); $('#checkout-result-box').innerHTML=`<div class="rp-success rp-card"><strong>Pago aprobado</strong><p>Factura: ${esc(cap.numero_factura||'generada')} · Pedido: ${esc(cap.numero_pedido||state.pedido)}</p><a class="rp-primary" href="/" data-go-orders>Ver mis pedidos y tracking</a></div>`; setMsg('#checkout-pay-message','Pago capturado. Factura y tracking generados.',false); toast('Pago aprobado. Tracking generado.'); }catch(err){setMsg('#checkout-pay-message',err.message,true);toast(err.message);} });
    document.addEventListener('click',e=>{ if(e.target.closest('[data-go-orders]')){ e.preventDefault(); location.href='/?view=pedidos'; } });
  }
  async function setupPrimeCheckout(){
    await setupCommonGateway();
    const planId=document.body.dataset.planId; const mem=await getJSON('/api/membresia/'); const plan=(mem.planes||[]).find(p=>String(p.cod_plan)===String(planId));
    $('#prime-benefits-box').innerHTML=plan?(plan.beneficios||[]).map(b=>`<div class="rp-mini-item"><strong>${esc(b.nombre)}</strong><br><span class="rp-muted">${esc(b.descripcion)}</span></div>`).join(''):'<div class="rp-mini-item">Plan no encontrado.</div>';
    await loadPaymentMethods('#prime-payment-method');
    $('#prime-pay').addEventListener('click',async()=>{ try{ let method=$('#prime-payment-method').value; if(!method && !$('#checkout-card-form').classList.contains('rp-hidden')) method=await saveNewCard(); if(!method) throw new Error('Selecciona o registra una tarjeta simulada.'); setMsg('#prime-pay-message','Procesando pago de Prime...'); const d=await postForm('/operaciones/api/prime/pagar/',{cod_plan:planId,cod_metodo_pago:method,renovacion_automatica:$('#prime-renewal').checked?'true':'false',idempotency_key:crypto.randomUUID?.()||String(Date.now())}); $('#prime-result').classList.remove('rp-hidden'); $('#prime-result-box').innerHTML=`<div class="rp-success rp-card"><strong>Prime activo</strong><p>Vigencia hasta ${esc(d.resultado?.fecha_fin||'próxima fecha')} · monto $${money(d.resultado?.monto)}</p><a class="rp-primary" href="/perfil/">Ver mi membresía</a></div>`; setMsg('#prime-pay-message','Prime pagado y activado.',false); toast('Membresía Prime activada.'); }catch(err){setMsg('#prime-pay-message',err.message,true);toast(err.message);} });
  }
  document.addEventListener('DOMContentLoaded',()=>{ const page=document.body.dataset.page; if(page==='checkout') setupProductCheckout().catch(e=>toast(e.message)); if(page==='checkout-prime') setupPrimeCheckout().catch(e=>toast(e.message)); });
})();
