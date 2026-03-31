/* ═══════════════════════════════════════════════════════════
   Lartica Bakehouse — Main JavaScript (Rebuilt)
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const WHATSAPP_NUMBER = '212664727887';

  // ─── DOM REFERENCES ──────────────────────────────────
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  // ─── HEADER SHADOW ON SCROLL ─────────────────────────
  let scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function() {
        if (header) header.classList.toggle('scrolled', window.scrollY > 20);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ─── HAMBURGER TOGGLE ────────────────────────────────
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ─── SCROLL-TRIGGERED FADE-UP ────────────────────────
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-up').forEach(function(el) { observer.observe(el); });
  } else {
    document.querySelectorAll('.fade-up').forEach(function(el) { el.classList.add('visible'); });
  }

  // ─── HERO IMAGE LOADING ──────────────────────────────
  const heroImgs = document.querySelectorAll('.hero-main, .hero-tall, .hero-side');
  heroImgs.forEach(function(img) {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', function() { img.classList.add('loaded'); });
  });

  // ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
      }
    });
  });

  // ─── STICKY CTA VISIBILITY ──────────────────────────
  const stickyCta = document.querySelector('.sticky-cta');
  const heroSection = document.getElementById('hero');
  if (stickyCta && heroSection) {
    const stickyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { stickyCta.style.display = e.isIntersecting ? 'none' : ''; });
    }, { threshold: 0 });
    stickyObserver.observe(heroSection);
  }

  // ═══════════════════════════════════════════════════════════
  // CATALOG
  // ═══════════════════════════════════════════════════════════

  const WEIGHT_STOPS_G = [250, 500, 750, 1000, 1500, 2000];
  const WEIGHT_LABELS  = ['250g', '500g', '750g', '1 kg', '1.5 kg', '2 kg', 'Sur mesure'];

  const PRICING_TYPES = { UNIT: 'unit', WEIGHT: 'weight', PORTION: 'portion', FIXED: 'fixed' };

  const CATALOG = {
    'viennoiseries-trad': {
      name: "Viennoiseries Traditionnelles",
      pricingType: PRICING_TYPES.UNIT,
      items: [
        { id: "vt-croissant", name: "Croissant", price: 6 },
        { id: "vt-pain-choc", name: "Pain au chocolat", price: 7 },
        { id: "vt-pain-suisse", name: "Pain Suisse", price: 7 },
        { id: "vt-pain-brise", name: "Pain brisé", price: 6 },
        { id: "vt-chausson-fromage", name: "Chausson Fromage", price: 7 },
        { id: "vt-placeholder-1", name: "XX", price: 0, isPlaceholder: true },
        { id: "vt-placeholder-2", name: "XX", price: 0, isPlaceholder: true },
        { id: "vt-placeholder-3", name: "XX", price: 0, isPlaceholder: true },
        { id: "vt-placeholder-4", name: "XX", price: 0, isPlaceholder: true },
        { id: "vt-placeholder-5", name: "XX", price: 0, isPlaceholder: true }
      ]
    },
    'viennoiseries-modernes': {
      name: "Viennoiseries Modernes",
      pricingType: PRICING_TYPES.UNIT,
      items: [
        { id: "vm-creme-amande", name: "Fourrée à la crème amande", price: 10 },
        { id: "vm-crokies-pistache", name: "Les Crokies Pistaches", price: 15 },
        { id: "vm-crokies-lotus", name: "Les Crokies Lotus", price: 15 },
        { id: "vm-crokies-classique", name: "Les Crokies Classique", price: 15 },
        { id: "vm-crokies-noisette", name: "Les Crokies Noisette", price: 15 },
        { id: "vm-crokies-brownie", name: "Crokies Brownie", price: 15 },
        { id: "vm-croquets-pistache", name: "Les Croquets Pistaches", price: 15 },
        { id: "vm-croissant-dubai", name: "Croissant Dubai", price: 18 },
        { id: "vm-placeholder-1", name: "XX", price: 0, isPlaceholder: true },
        { id: "vm-placeholder-2", name: "XX", price: 0, isPlaceholder: true },
        { id: "vm-placeholder-3", name: "XX", price: 0, isPlaceholder: true },
        { id: "vm-placeholder-4", name: "XX", price: 0, isPlaceholder: true },
        { id: "vm-placeholder-5", name: "XX", price: 0, isPlaceholder: true },
        { id: "vm-placeholder-6", name: "XX", price: 0, isPlaceholder: true },
        { id: "vm-placeholder-7", name: "XX", price: 0, isPlaceholder: true }
      ]
    },
    'marocains': {
      name: "Classiques Marocains",
      pricingType: PRICING_TYPES.WEIGHT,
      defaultPricePerKg: 120,
      items: [
        { id: "cm-kaab-ghzal", name: "Kaab Ghzal", pricePerKg: 120, description: "Cornes de gazelle aux amandes" },
        { id: "cm-fekkas-amande", name: "Fekkas Amande", pricePerKg: 100, description: "Biscuits croquants aux amandes" },
        { id: "cm-ghraybe", name: "Ghraybe", pricePerKg: 110, description: "Shortbread fondant" },
        { id: "cm-ghriba-noix", name: "Ghriba Noix", pricePerKg: 130, description: "Craquelé au sucre glace" },
        { id: "cm-placeholder-1", name: "XX", pricePerKg: 100, isPlaceholder: true },
        { id: "cm-placeholder-2", name: "XX", pricePerKg: 100, isPlaceholder: true },
        { id: "cm-placeholder-3", name: "XX", pricePerKg: 100, isPlaceholder: true },
        { id: "cm-placeholder-4", name: "XX", pricePerKg: 100, isPlaceholder: true },
        { id: "cm-placeholder-5", name: "XX", pricePerKg: 100, isPlaceholder: true }
      ]
    },
    'formules': {
      name: "Formules & Box",
      pricingType: PRICING_TYPES.FIXED,
      items: [
        { id: "fb-box-petit-dej", name: "Box Petit-Déjeuner (6 pcs)", price: 70, description: "Assortiment de 6 viennoiseries" },
        { id: "fb-plateau-event", name: "Plateau Événement (15 pcs)", price: 250, description: "15 pièces assorties, livraison incluse" },
        { id: "fb-placeholder-1", name: "XX", price: 0, isPlaceholder: true },
        { id: "fb-placeholder-2", name: "XX", price: 0, isPlaceholder: true },
        { id: "fb-placeholder-3", name: "XX", price: 0, isPlaceholder: true },
        { id: "fb-placeholder-4", name: "XX", price: 0, isPlaceholder: true },
        { id: "fb-placeholder-5", name: "XX", price: 0, isPlaceholder: true }
      ]
    },
    'cakes': {
      name: "Cakes & Petites Tartes",
      pricingType: PRICING_TYPES.UNIT,
      items: [
        { id: "cake-placeholder-1", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-2", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-3", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-4", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-5", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-6", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-7", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-8", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-9", name: "XX", price: 0, isPlaceholder: true },
        { id: "cake-placeholder-10", name: "XX", price: 0, isPlaceholder: true }
      ]
    },
    'special': {
      name: "Commandes Spéciales",
      pricingType: PRICING_TYPES.PORTION,
      subCategories: [
        { key: 'mariage', emoji: '🎂', name: 'Mariage', desc: 'Wedding cake & service complet' },
        { key: 'anniversaire', emoji: '🎉', name: 'Anniversaire', desc: 'Gâteau sur mesure pour votre fête' },
        { key: 'evenement', emoji: '🌟', name: 'Événement', desc: 'Plateaux & créations pour vos invités' }
      ],
      items: []
    }
  };

  const ITEMS_DICT = {};
  Object.entries(CATALOG).forEach(function([catKey, cat]) {
    cat.items.forEach(function(item) {
      ITEMS_DICT[item.id] = Object.assign({}, item, { categoryKey: catKey, category: cat });
    });
  });

  // ─── CART STATE ──────────────────────────────────────
  let cart = [];

  function generateCartId() {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function addToCart(itemData) {
    const cartItem = Object.assign({ cartId: generateCartId() }, itemData);
    cart.push(cartItem);
    updateCartUI();
    triggerCartFlash();
    return cartItem;
  }

  function removeFromCart(cartId) {
    cart = cart.filter(function(item) { return item.cartId !== cartId; });
    updateCartUI();
  }

  function updateCartItem(cartId, updates) {
    const item = cart.find(function(i) { return i.cartId === cartId; });
    if (item) { Object.assign(item, updates); updateCartUI(); triggerCartFlash(); }
  }

  function clearCart() {
    cart = [];
    updateCartUI();
  }

  function triggerCartFlash() {
    const pill = document.getElementById('cart-pill-btn');
    if (!pill) return;
    pill.classList.remove('cart-flash');
    void pill.offsetWidth;
    pill.classList.add('cart-flash');
    setTimeout(function() { pill.classList.remove('cart-flash'); }, 600);
  }

  // ─── PRICE ENGINE ───────────────────────────────────
  function calculateItemPrice(item) {
    var category = CATALOG[item.categoryKey];
    switch (category.pricingType) {
      case PRICING_TYPES.UNIT:
      case PRICING_TYPES.FIXED:
        return (item.price || 0) * (item.quantity || 1);
      case PRICING_TYPES.WEIGHT:
        return Math.round((item.weight || 0) / 1000 * (item.pricePerKg || category.defaultPricePerKg || 0));
      case PRICING_TYPES.PORTION:
        return 0;
      default:
        return 0;
    }
  }

  function calculateCartTotals() {
    var fixedTotal = 0, devisItems = [];
    cart.forEach(function(item) {
      if (item.surDevis || item.pricingType === PRICING_TYPES.PORTION) devisItems.push(item);
      else fixedTotal += calculateItemPrice(item);
    });
    return { fixedTotal: fixedTotal, devisItems: devisItems, itemCount: cart.length };
  }

  function formatPrice(price, surDevis) {
    if (surDevis) return "Sur devis";
    return price + " DH";
  }

  function formatWeight(grams) {
    if (grams >= 1000) return (grams / 1000).toFixed(1).replace('.0', '') + " kg";
    return grams + " g";
  }

  // ─── MODAL DOM REFERENCES ──────────────────────────
  const modal = document.getElementById('order-modal');
  const modalClose = document.getElementById('modal-close');
  const viewCats = document.getElementById('view-categories');
  const viewProds = document.getElementById('view-products');
  const viewCheck = document.getElementById('view-checkout');
  const productListContainer = document.getElementById('product-list-container');
  const activeCategoryTitle = document.getElementById('active-category-title');
  const btnBackCats = document.getElementById('btn-back-categories');
  const btnBackCart = document.getElementById('btn-back-cart');
  const btnNextStep = document.getElementById('btn-next-step');
  const cartPillBtn = document.getElementById('cart-pill-btn');
  const cartPreview = document.getElementById('cart-preview');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  const headerCartBadge = document.getElementById('header-cart-badge');

  let currentCategoryKey = null;

  // ─── VIEW NAVIGATION ────────────────────────────────
  function switchView(viewId) {
    document.querySelectorAll('.modal-view').forEach(function(v) { v.classList.remove('active'); });
    document.getElementById(viewId).classList.add('active');
    var isCheckout = viewId === 'view-checkout';
    btnNextStep.textContent = isCheckout ? "Confirmer la commande" : "Suivant";
  }

  btnBackCats.addEventListener('click', function() { switchView('view-categories'); });
  btnBackCart.addEventListener('click', function() {
    if (currentCategoryKey) renderCategoryProducts(currentCategoryKey);
    else switchView('view-categories');
  });

  // ─── CATEGORY SELECTION ─────────────────────────────
  document.querySelectorAll('.category-cat-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      renderCategoryProducts(btn.getAttribute('data-category'));
    });
  });

  function renderCategoryProducts(catKey) {
    var category = CATALOG[catKey];
    currentCategoryKey = catKey;
    activeCategoryTitle.textContent = category.name;
    switchView('view-products');

    switch (category.pricingType) {
      case PRICING_TYPES.WEIGHT:
        renderWeightProducts(catKey); break;
      case PRICING_TYPES.PORTION:
        renderSpecialProducts(catKey); break;
      default:
        renderUnitProducts(catKey); break;
    }
  }

  // ─── UNIT PRODUCTS (card grid) ─────────────────────
  function renderUnitProducts(catKey) {
    var category = CATALOG[catKey];
    var html = '<div class="product-grid">';
    category.items.forEach(function(product) {
      var existing = cart.find(function(c) { return c.id === product.id; });
      var qty = existing ? existing.quantity : 0;
      var isPlaceholder = product.isPlaceholder;
      var imgSrc = 'images/products/' + product.id + '.webp';

      html += '<div class="product-card' + (isPlaceholder ? ' placeholder-card' : '') + '">';
      html += '<div class="product-card-img">';
      html += '<img src="' + imgSrc + '" alt="' + (product.name || '') + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" loading="lazy" />';
      html += '<span class="product-initial" style="display:none">' + (product.name ? product.name.charAt(0) : '?') + '</span>';
      html += '</div>';
      html += '<div class="product-card-body">';
      html += '<span class="pc-name">' + (product.name || '—') + '</span>';
      if (product.price) html += '<span class="pc-price">' + product.price + ' DH</span>';
      if (product.description) html += '<span class="pc-desc">' + product.description + '</span>';
      html += '<div class="pc-stepper">';
      html += '<button type="button" class="stepper-dec" data-id="' + product.id + '"' + (isPlaceholder ? ' disabled' : '') + ' aria-label="Diminuer">−</button>';
      html += '<span class="pc-qty" data-id="' + product.id + '">' + qty + '</span>';
      html += '<button type="button" class="stepper-inc" data-id="' + product.id + '"' + (isPlaceholder ? ' disabled' : '') + ' aria-label="Augmenter">+</button>';
      html += '</div></div>';
      html += '<button type="button" class="product-card-ajouter" data-id="' + product.id + '"' + (isPlaceholder ? ' disabled' : '') + '>Ajouter</button>';
      html += '</div>';
    });
    html += '</div>';
    productListContainer.innerHTML = html;
    attachUnitListeners(catKey);
  }

  function attachUnitListeners(catKey) {
    var category = CATALOG[catKey];

    productListContainer.querySelectorAll('.stepper-inc').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var product = ITEMS_DICT[id];
        if (!product || product.isPlaceholder) return;
        var existing = cart.find(function(c) { return c.id === id; });
        if (existing) updateCartItem(existing.cartId, { quantity: existing.quantity + 1 });
        else addToCart({ id: id, name: product.name, price: product.price || 0, quantity: 1, categoryKey: catKey, pricingType: category.pricingType });
        var updated = cart.find(function(c) { return c.id === id; });
        var countEl = productListContainer.querySelector('.pc-qty[data-id="' + id + '"]');
        if (countEl && updated) countEl.textContent = updated.quantity;
      });
    });

    productListContainer.querySelectorAll('.stepper-dec').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var existing = cart.find(function(c) { return c.id === id; });
        if (!existing) return;
        if (existing.quantity <= 1) {
          removeFromCart(existing.cartId);
          var countEl = productListContainer.querySelector('.pc-qty[data-id="' + id + '"]');
          if (countEl) countEl.textContent = 0;
        } else {
          updateCartItem(existing.cartId, { quantity: existing.quantity - 1 });
          var updated = cart.find(function(c) { return c.id === id; });
          var countEl2 = productListContainer.querySelector('.pc-qty[data-id="' + id + '"]');
          if (countEl2 && updated) countEl2.textContent = updated.quantity;
        }
      });
    });

    productListContainer.querySelectorAll('.product-card-ajouter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var product = ITEMS_DICT[id];
        if (!product || product.isPlaceholder) return;
        var existing = cart.find(function(c) { return c.id === id; });
        if (existing) updateCartItem(existing.cartId, { quantity: existing.quantity + 1 });
        else addToCart({ id: id, name: product.name, price: product.price || 0, quantity: 1, categoryKey: catKey, pricingType: category.pricingType });
        var updated = cart.find(function(c) { return c.id === id; });
        var countEl = productListContainer.querySelector('.pc-qty[data-id="' + id + '"]');
        if (countEl && updated) countEl.textContent = updated.quantity;
        btn.classList.add('added');
        btn.textContent = '✓ Ajouté';
        setTimeout(function() { btn.classList.remove('added'); btn.textContent = 'Ajouter'; }, 800);
      });
    });
  }

  // ─── WEIGHT PRODUCTS (pill selector) ───────────────
  function renderWeightProducts(catKey) {
    var category = CATALOG[catKey];
    var html = '';
    category.items.forEach(function(product) {
      var existing = cart.find(function(c) { return c.id === product.id; });
      var selWeight = existing ? existing.weight : null;
      var pricePerKg = product.pricePerKg || category.defaultPricePerKg;
      var isPlaceholder = product.isPlaceholder;
      var imgSrc = 'images/products/' + product.id + '.webp';

      html += '<div class="weight-product-card' + (isPlaceholder ? ' placeholder-card' : '') + '">';
      html += '<div style="display:flex;gap:1rem;align-items:flex-start;margin-bottom:0.8rem">';
      html += '<div style="width:80px;height:60px;border-radius:8px;overflow:hidden;flex-shrink:0;background:var(--cream)">';
      html += '<img src="' + imgSrc + '" alt="' + (product.name || '') + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'" loading="lazy" />';
      html += '</div>';
      html += '<div class="weight-product-header" style="margin-bottom:0">';
      html += '<strong>' + (product.name || '—') + '</strong>';
      if (product.description) html += '<span class="wp-desc">' + product.description + '</span>';
      html += '<span class="price-per-kg">' + pricePerKg + ' DH / kg</span>';
      html += '</div></div>';

      if (!isPlaceholder) {
        html += '<div class="weight-pill-row" data-id="' + product.id + '">';
        WEIGHT_LABELS.forEach(function(label, i) {
          var isActive = false;
          if (i < WEIGHT_STOPS_G.length && selWeight === WEIGHT_STOPS_G[i]) isActive = true;
          if (i === WEIGHT_STOPS_G.length && selWeight && !WEIGHT_STOPS_G.includes(selWeight)) isActive = true;
          var grams = i < WEIGHT_STOPS_G.length ? WEIGHT_STOPS_G[i] : 'custom';
          html += '<button type="button" class="weight-pill' + (isActive ? ' active' : '') + '" data-grams="' + grams + '" data-product="' + product.id + '">' + label + '</button>';
        });
        html += '</div>';

        var isCustomOpen = selWeight && !WEIGHT_STOPS_G.includes(selWeight);
        html += '<div class="ws-custom-wrap' + (isCustomOpen ? ' open' : '') + '" id="wsc-' + product.id + '">';
        html += '<input type="number" placeholder="Poids en grammes" min="100" step="50" value="' + (isCustomOpen ? selWeight : '') + '" data-id="' + product.id + '" />';
        html += '<span>g</span></div>';

        html += '<div id="wsp-' + product.id + '">';
        if (selWeight) {
          html += '<div class="weight-price-preview"><span>' + formatWeight(selWeight) + '</span><span>→</span><span class="wpp-price">' + Math.round(selWeight / 1000 * pricePerKg) + ' DH</span></div>';
        }
        html += '</div>';

        html += '<button type="button" class="weight-card-ajouter" data-id="' + product.id + '">' + (existing ? '✓ Dans le panier' : 'Ajouter') + '</button>';
      }
      html += '</div>';
    });
    productListContainer.innerHTML = html;
    attachWeightListeners(catKey);
  }

  function attachWeightListeners(catKey) {
    var category = CATALOG[catKey];

    productListContainer.querySelectorAll('.weight-pill').forEach(function(pill) {
      pill.addEventListener('click', function() {
        var id = pill.dataset.product;
        var grams = pill.dataset.grams;
        var product = ITEMS_DICT[id];
        var pricePerKg = product.pricePerKg || category.defaultPricePerKg;
        var row = pill.closest('.weight-pill-row');
        var customDiv = document.getElementById('wsc-' + id);
        var preview = document.getElementById('wsp-' + id);

        row.querySelectorAll('.weight-pill').forEach(function(p) { p.classList.remove('active'); });
        pill.classList.add('active');

        if (grams === 'custom') {
          customDiv.classList.add('open');
          preview.innerHTML = '';
          setTimeout(function() { customDiv.querySelector('input').focus(); }, 60);
        } else {
          customDiv.classList.remove('open');
          var g = parseInt(grams);
          preview.innerHTML = '<div class="weight-price-preview"><span>' + formatWeight(g) + '</span><span>→</span><span class="wpp-price">' + Math.round(g / 1000 * pricePerKg) + ' DH</span></div>';
          syncWeightCart(id, g, pricePerKg, catKey);
        }
      });
    });

    productListContainer.querySelectorAll('.ws-custom-wrap input').forEach(function(input) {
      input.addEventListener('input', function() {
        var id = input.dataset.id;
        var product = ITEMS_DICT[id];
        var pricePerKg = product.pricePerKg || category.defaultPricePerKg;
        var g = parseInt(input.value);
        var preview = document.getElementById('wsp-' + id);
        if (!g || g < 100) { preview.innerHTML = ''; return; }
        preview.innerHTML = '<div class="weight-price-preview"><span>' + formatWeight(g) + '</span><span>→</span><span class="wpp-price">' + Math.round(g / 1000 * pricePerKg) + ' DH</span></div>';
        syncWeightCart(id, g, pricePerKg, catKey);
      });
    });

    productListContainer.querySelectorAll('.weight-card-ajouter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var existing = cart.find(function(c) { return c.id === id; });
        if (!existing) {
          var orig = btn.textContent;
          btn.textContent = 'Choisissez un poids';
          btn.style.background = 'var(--muted)';
          setTimeout(function() { btn.textContent = orig; btn.style.background = ''; }, 1200);
          return;
        }
        btn.classList.add('added');
        btn.textContent = '✓ Ajouté';
        setTimeout(function() { btn.classList.remove('added'); btn.textContent = '✓ Dans le panier'; }, 800);
      });
    });
  }

  function syncWeightCart(id, grams, pricePerKg, catKey) {
    var existing = cart.find(function(c) { return c.id === id; });
    if (existing) updateCartItem(existing.cartId, { weight: grams });
    else addToCart({ id: id, name: ITEMS_DICT[id].name, weight: grams, pricePerKg: pricePerKg, categoryKey: catKey, pricingType: PRICING_TYPES.WEIGHT });
  }

  // ─── SPECIAL ORDERS (sub-category architecture) ────
  var specialSubView = null; // track sub-view state

  function renderSpecialProducts(catKey) {
    var category = CATALOG[catKey];
    specialSubView = null;
    var html = '<div class="sub-category-grid">';
    category.subCategories.forEach(function(sub) {
      html += '<button type="button" class="sub-category-tile" data-sub="' + sub.key + '">';
      html += '<span class="sct-emoji">' + sub.emoji + '</span>';
      html += '<span class="sct-name">' + sub.name + '</span>';
      html += '<span class="sct-desc">' + sub.desc + '</span>';
      html += '</button>';
    });
    html += '</div>';
    productListContainer.innerHTML = html;

    productListContainer.querySelectorAll('.sub-category-tile').forEach(function(tile) {
      tile.addEventListener('click', function() {
        var subKey = tile.dataset.sub;
        renderSpecialOrderCard(catKey, subKey);
      });
    });
  }

  function renderSpecialOrderCard(catKey, subKey) {
    var category = CATALOG[catKey];
    var sub = category.subCategories.find(function(s) { return s.key === subKey; });
    specialSubView = subKey;

    var html = '<button type="button" class="btn-back" id="btn-back-sub">← Retour</button>';
    html += '<div class="special-order-card">';
    html += '<h4>' + sub.emoji + ' ' + sub.name + '</h4>';
    html += '<p class="soc-desc">' + sub.desc + '</p>';
    html += '<label for="soc-persons">Nombre de personnes</label>';
    html += '<input type="number" id="soc-persons" placeholder="Ex : 50" min="2" inputmode="numeric" /> ';
    html += '<label for="soc-notes">Notes / précisions</label>';
    html += '<textarea id="soc-notes" placeholder="Détails, préférences, allergies..."></textarea>';
    html += '<button type="button" class="soc-wa-btn" id="soc-send">Envoyer sur WhatsApp</button>';
    html += '<p class="soc-notice">Confirmation et tarif sous 2h par WhatsApp.</p>';
    html += '</div>';

    productListContainer.innerHTML = html;

    document.getElementById('btn-back-sub').addEventListener('click', function() {
      renderSpecialProducts(catKey);
    });

    document.getElementById('soc-send').addEventListener('click', function() {
      var persons = document.getElementById('soc-persons').value;
      var notes = document.getElementById('soc-notes').value.trim();
      var msg = 'Bonjour Lartica 👋\n\nDemande de devis — ' + sub.name + '\n';
      if (persons) msg += '👥 ' + persons + ' personnes\n';
      if (notes) msg += '📝 ' + notes + '\n';
      msg += '\nMerci de me contacter pour discuter les détails.';
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
      window.open(url, '_blank', 'noopener');
    });
  }

  // ─── CART UI UPDATES ────────────────────────────────
  function updateCartUI() {
    var totals = calculateCartTotals();
    cartCount.textContent = totals.itemCount;

    var totalText = formatPrice(totals.fixedTotal);
    if (totals.devisItems.length > 0) {
      totalText = totals.fixedTotal > 0 ? totals.fixedTotal + ' DH + devis' : 'Sur devis';
    }
    cartTotal.textContent = totalText;
    btnNextStep.disabled = totals.itemCount === 0;

    // Header badge
    if (headerCartBadge) {
      if (totals.itemCount > 0) {
        headerCartBadge.textContent = totals.itemCount;
        headerCartBadge.classList.add('visible');
      } else {
        headerCartBadge.classList.remove('visible');
      }
    }

    renderCartItemsList();
  }

  function renderCartItemsList() {
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<li class="empty-cart">Votre panier est vide</li>';
      return;
    }

    var grouped = {};
    cart.forEach(function(item) {
      var catName = CATALOG[item.categoryKey].name;
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(item);
    });

    var html = '';
    Object.entries(grouped).forEach(function([catName, items]) {
      html += '<li class="cart-category-header">' + catName + '</li>';
      items.forEach(function(item) {
        var price = calculateItemPrice(item);
        var details = '';
        if (item.pricingType === PRICING_TYPES.WEIGHT) {
          var w = item.weight || 0;
          details = ' — ' + (w >= 1000 ? (w/1000) + ' kg' : w + 'g');
        } else if (item.pricingType === PRICING_TYPES.PORTION) {
          details = ' — ' + (item.persons || '') + ' personnes';
        } else if (item.quantity > 1) {
          details = ' × ' + item.quantity;
        }
        html += '<li class="cart-item"><span class="li-title">' + item.name + details + '</span>';
        html += '<span class="li-price">' + formatPrice(price, item.surDevis) + '</span>';
        html += '<button type="button" class="btn-remove-item" data-cart-id="' + item.cartId + '" aria-label="Retirer">×</button></li>';
      });
    });

    var totals = calculateCartTotals();
    html += '<li class="cart-divider"></li>';
    if (totals.fixedTotal > 0) html += '<li class="cart-subtotal"><span>Total</span><span>' + totals.fixedTotal + ' DH</span></li>';
    if (totals.devisItems.length > 0) html += '<li class="cart-devis-notice"><span>⚠️ ' + totals.devisItems.length + ' article(s) sur devis</span></li>';
    html += '<li><button type="button" class="cart-clear-link" id="cart-clear-btn">Vider le panier</button></li>';

    cartItemsList.innerHTML = html;

    cartItemsList.querySelectorAll('.btn-remove-item').forEach(function(btn) {
      btn.addEventListener('click', function() {
        removeFromCart(btn.getAttribute('data-cart-id'));
        if (currentCategoryKey && viewProds.classList.contains('active')) renderCategoryProducts(currentCategoryKey);
      });
    });

    var clearBtn = document.getElementById('cart-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', function() {
      clearCart();
      if (currentCategoryKey && viewProds.classList.contains('active')) renderCategoryProducts(currentCategoryKey);
    });
  }

  // Cart pill toggle
  cartPillBtn.addEventListener('click', function() {
    if (cart.length === 0) return;
    var isExpanded = cartPreview.classList.toggle('open');
    cartPillBtn.setAttribute('aria-expanded', isExpanded);
  });

  // ─── CHECKOUT FLOW ─────────────────────────────────
  btnNextStep.addEventListener('click', function() {
    if (viewCheck.classList.contains('active')) handleCheckoutSubmit();
    else switchView('view-checkout');
  });

  var validators = {
    'order-date': function(val) {
      if (!val) return 'Veuillez choisir une date';
      var selected = new Date(val);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) return "La date doit être aujourd'hui ou après";
      return '';
    }
  };

  function validateField(fieldId) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById(fieldId + '-error');
    if (!field || !validators[fieldId]) return true;
    var errorMsg = validators[fieldId](field.value);
    if (errorMsg) {
      field.classList.add('error');
      if (errorEl) { errorEl.textContent = errorMsg; errorEl.classList.add('visible'); }
      return false;
    } else {
      field.classList.remove('error');
      if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('visible'); }
      return true;
    }
  }

  function validateAllFields() {
    var allValid = true;
    Object.keys(validators).forEach(function(fieldId) {
      if (!validateField(fieldId)) allValid = false;
    });
    return allValid;
  }

  Object.keys(validators).forEach(function(fieldId) {
    var field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', function() { validateField(fieldId); });
      field.addEventListener('input', function() { if (field.classList.contains('error')) validateField(fieldId); });
    }
  });

  function handleCheckoutSubmit() {
    if (!validateAllFields()) {
      var firstError = document.querySelector('.error');
      if (firstError) { firstError.focus(); firstError.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }

    var date = document.getElementById('order-date').value;
    var notes = document.getElementById('order-notes').value.trim();

    var dateFormatted = '';
    if (date) {
      dateFormatted = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }

    var msg = 'Bonjour Lartica 👋 — Voici ma commande :\n\n';
    msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    if (dateFormatted) msg += '📅 *Date de retrait:* ' + dateFormatted + '\n';
    if (notes) msg += '📝 *Notes:* ' + notes + '\n';
    msg += '\n📦 *DÉTAIL DES ARTICLES*\n\n';

    var grouped = {};
    cart.forEach(function(item) {
      var catName = CATALOG[item.categoryKey].name;
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(item);
    });

    var fixedTotal = 0;
    Object.entries(grouped).forEach(function([catName, items]) {
      msg += '*' + catName.toUpperCase() + '*\n';
      items.forEach(function(item) {
        var price = calculateItemPrice(item);
        if (item.pricingType === PRICING_TYPES.WEIGHT) {
          var pricePerKg = item.pricePerKg || CATALOG[item.categoryKey].defaultPricePerKg;
          var w = item.weight || 0;
          var wStr = w >= 1000 ? (w/1000) + ' kg' : w + 'g';
          msg += '• ' + item.name + '\n  └ ' + wStr + ' @ ' + pricePerKg + ' DH/kg = ' + price + ' DH\n';
          fixedTotal += price;
        } else if (item.pricingType === PRICING_TYPES.PORTION) {
          msg += '• ' + item.name + '\n  └ 👥 ' + (item.persons || '') + ' personnes · SUR DEVIS\n';
        } else {
          msg += '• ' + item.name;
          if (item.quantity > 1) msg += ' × ' + item.quantity;
          msg += ' = ' + price + ' DH\n';
          fixedTotal += price;
        }
      });
      msg += '\n';
    });

    msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    var totals = calculateCartTotals();
    if (totals.fixedTotal > 0) msg += '💰 *Total:* ' + totals.fixedTotal + ' DH\n';
    if (totals.devisItems.length > 0) msg += '⚠️ *Articles sur devis:* ' + totals.devisItems.length + '\n';
    msg += '\nMerci de confirmer la disponibilité ! 🙏';

    var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    window.open(waUrl, '_blank', 'noopener');

    // Success: close modal after 400ms, clear cart, show toast
    setTimeout(function() {
      closeModal();
      clearCart();
      showToast('✓ Commande envoyée sur WhatsApp');
    }, 400);
  }

  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'order-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('fade-out'); }, 2500);
    setTimeout(function() { toast.remove(); }, 3000);
  }

  // ─── MODAL OPEN/CLOSE ──────────────────────────────
  function openModal(productHint) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    switchView('view-categories');

    // If cart has items and opened from header cart btn with items, go to checkout
    if (productHint === '__cart_checkout__' && cart.length > 0) {
      switchView('view-checkout');
      return;
    }

    if (productHint && productHint !== '__cart_checkout__') {
      var hint = productHint.toLowerCase();
      var matchedCat = null;
      if (hint.includes('tradition')) matchedCat = 'viennoiseries-trad';
      else if (hint.includes('moderne')) matchedCat = 'viennoiseries-modernes';
      else if (hint.includes('croissant') || hint.includes('pain')) matchedCat = 'viennoiseries-trad';
      else if (hint.includes('crokies') || hint.includes('croquant') || hint.includes('dubai')) matchedCat = 'viennoiseries-modernes';
      else if (hint.includes('marocain') || hint.includes('kaab') || hint.includes('ghzal') || hint.includes('fekkas') || hint.includes('ghraybe') || hint.includes('ghriba')) matchedCat = 'marocains';
      else if (hint.includes('box') || hint.includes('plateau') || hint.includes('formule')) matchedCat = 'formules';
      else if (hint.includes('cake') || hint.includes('tarte')) matchedCat = 'cakes';
      else if (hint.includes('mariage') || hint.includes('special') || hint.includes('evenement') || hint.includes('événement')) matchedCat = 'special';

      if (matchedCat && CATALOG[matchedCat]) {
        setTimeout(function() { renderCategoryProducts(matchedCat); }, 100);
      }
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
  });

  // Header cart btn special behavior
  var headerCartBtn = document.getElementById('header-cart-btn');
  if (headerCartBtn) {
    headerCartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (cart.length > 0) openModal('__cart_checkout__');
      else openModal('');
    });
  }

  // All other order buttons
  document.querySelectorAll('[data-open-order]').forEach(function(btn) {
    if (btn.id === 'header-cart-btn') return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      openModal(this.getAttribute('data-product') || '');
    });
  });

  // Set min date
  var dateInput = document.getElementById('order-date');
  if (dateInput) {
    var today = new Date();
    dateInput.setAttribute('min', today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0'));
  }

  var orderForm = document.getElementById('order-form');
  if (orderForm) orderForm.addEventListener('submit', function(e) { e.preventDefault(); handleCheckoutSubmit(); });

  // ─── ANTIGRAVITY HERO PARALLAX (gated by IntersectionObserver) ──
  function initAntigravity() {
    var heroDom = document.querySelector('.hero-images');
    if (!heroDom) return;

    var main = heroDom.querySelector('.hero-main');
    var tall = heroDom.querySelector('.hero-tall');
    var side = heroDom.querySelector('.hero-side');
    if (!main || !tall || !side) return;

    var tick = 0;
    var lastScrollY = window.scrollY;
    var rafId = null;
    var heroObserver = null;

    function renderParallax() {
      tick += 0.05;
      var sy = Math.min(lastScrollY, 800);
      var zMain = 10 + (sy * 0.15);
      var zTall = 5 + (sy * 0.1);
      var zSide = 15 + (sy * 0.2);
      var fMain = Math.sin(tick) * 8;
      var fTall = Math.cos(tick * 0.8) * 12;
      var fSide = Math.sin(tick * 1.2) * 6;
      var rX = sy * 0.02;

      main.style.transform = 'translate3d(0, ' + (fMain - sy * 0.1) + 'px, ' + zMain + 'px) rotateX(' + rX + 'deg) rotateY(-2deg)';
      tall.style.transform = 'translate3d(0, ' + (fTall - sy * 0.05) + 'px, ' + zTall + 'px) rotateX(' + (-rX) + 'deg) rotateY(3deg)';
      side.style.transform = 'translate3d(0, ' + (fSide - sy * 0.15) + 'px, ' + zSide + 'px) rotateX(' + (rX * 1.5) + 'deg) rotateY(-1deg)';

      var diffMain = 25 + (sy * 0.1);
      var diffTall = 20 + (sy * 0.05);
      var diffSide = 30 + (sy * 0.15);
      main.style.boxShadow = '0 ' + (15 + sy * 0.05) + 'px ' + diffMain + 'px rgba(181,84,26,' + (0.25 - sy * 0.0002) + ')';
      tall.style.boxShadow = '0 ' + (10 + sy * 0.05) + 'px ' + diffTall + 'px rgba(181,84,26,' + (0.25 - sy * 0.0002) + ')';
      side.style.boxShadow = '0 ' + (20 + sy * 0.05) + 'px ' + diffSide + 'px rgba(181,84,26,' + (0.25 - sy * 0.0002) + ')';

      rafId = requestAnimationFrame(renderParallax);
    }

    function startLoop() {
      if (rafId) return;
      main.style.willChange = 'transform';
      tall.style.willChange = 'transform';
      side.style.willChange = 'transform';
      rafId = requestAnimationFrame(renderParallax);
    }

    function stopLoop() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      main.style.willChange = 'auto';
      tall.style.willChange = 'auto';
      side.style.willChange = 'auto';
    }

    heroObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) startLoop();
        else stopLoop();
      });
    }, { threshold: 0 });

    heroObserver.observe(heroDom);

    window.addEventListener('scroll', function() { lastScrollY = window.scrollY; }, { passive: true });
  }

  setTimeout(initAntigravity, 1000);

  // Expose for debugging
  window.openOrderModal = openModal;
  window.getCart = function() { return cart; };
  window.clearCart = clearCart;

})();

