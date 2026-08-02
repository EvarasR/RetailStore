/* TechTail visual interactions. No pricing, stock or business rules live here. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function setupCarousel(root) {
    if (!root || root.dataset.carouselReady) return;
    const track = $('.rp-carousel-track', root);
    const previous = $('[data-carousel-prev]', root);
    const next = $('[data-carousel-next]', root);
    if (!track) return;
    root.dataset.carouselReady = 'true';
    const distance = () => Math.max(240, Math.min(track.clientWidth * .84, 720));
    const update = () => {
      const max = Math.max(0, track.scrollWidth - track.clientWidth - 2);
      if (previous) previous.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    previous?.addEventListener('click', () => track.scrollBy({ left: -distance(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: distance(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    new MutationObserver(update).observe(track, { childList: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function setupHero() {
    const root = $('[data-hero-slider]');
    if (!root) return;
    const track = $('.rp-hero-track', root);
    const slides = $$('.rp-hero-slide', root);
    const dots = $('[data-hero-dots]', root);
    if (!track || slides.length < 2) return;
    let index = 0;
    let timer;
    dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Mostrar banner ${i + 1}"></button>`).join('');
    const render = nextIndex => {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      $$('button', dots).forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };
    const autoplay = () => { clearInterval(timer); timer = setInterval(() => render(index + 1), 6500); };
    $('[data-hero-prev]', root)?.addEventListener('click', () => { render(index - 1); autoplay(); });
    $('[data-hero-next]', root)?.addEventListener('click', () => { render(index + 1); autoplay(); });
    dots.addEventListener('click', event => { const dot = event.target.closest('button'); if (!dot) return; render($$('button', dots).indexOf(dot)); autoplay(); });
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', autoplay);
    root.addEventListener('focusin', () => clearInterval(timer));
    root.addEventListener('focusout', autoplay);
    render(0);
    autoplay();
  }

  function setupNavigation() {
    $('[data-mobile-menu]')?.addEventListener('click', event => {
      const actions = $('.rp-header-actions');
      const nav = $('[data-mobile-nav]');
      const open = !actions?.classList.contains('is-open');
      actions?.classList.toggle('is-open', open);
      nav?.classList.toggle('is-open', open);
      event.currentTarget.setAttribute('aria-expanded', String(open));
    });
    $('[data-admin-menu]')?.addEventListener('click', () => $('.rp-admin-sidebar')?.classList.toggle('is-open'));
  }

  function setupActiveStates() {
    document.addEventListener('click', event => {
      const profile = event.target.closest('[data-profile-tab]');
      if (profile) $$('[data-profile-tab]').forEach(item => item.classList.toggle('is-active', item.dataset.profileTab === profile.dataset.profileTab));
      const admin = event.target.closest('[data-admin-section]');
      if (admin) {
        $$('[data-admin-section]').forEach(item => item.classList.toggle('is-active', item === admin));
        $('.rp-admin-sidebar')?.classList.remove('is-open');
      }
      const supplier = event.target.closest('[data-supplier-tab]');
      if (supplier) $$('[data-supplier-tab]').forEach(item => item.classList.toggle('is-active', item === supplier));
    });
  }

  function setupImageFallback() {
    document.addEventListener('error', event => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
      if (!image.closest('.tt-product-card,.rp-product-gallery,.tt-cart-item')) return;
      image.dataset.fallbackApplied = 'true';
      image.src = '/static/retail/img/products/fallback-product.svg';
    }, true);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupHero();
    $$('[data-carousel]').forEach(setupCarousel);
    setupNavigation();
    setupActiveStates();
    setupImageFallback();
  });
})();
