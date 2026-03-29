/* ═══════════════════════════════════════════════════════════
   Lartica Bakehouse — Main JavaScript (Enhanced Cart System)
   Pâtisserie artisanale franco-marocaine · Fès
   ═══════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const WHATSAPP_NUMBER = '212664727887';

  // ═══════════════════════════════════════════════════════════
  // SECTION 1: EXISTING FUNCTIONALITY (PRESERVED)
  // ═══════════════════════════════════════════════════════════

  // ─── DOM REFERENCES ──────────────────────────────────
  const header = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  // ─── HEADER SHADOW ON SCROLL (Debounced) ─────────────
  let scrollTicking = false;
  window.addEventListener('scroll', function() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function() {
        const y = window.scrollY;
        if (header) {
          header.classList.toggle('scrolled', y > 20);
        }
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
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-up').forEach(function(el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-up').forEach(function(el) {
      el.classList.add('visible');
    });
  }

  // ─── PERFORMANCE: SHIMMER TICK & GPU LAYERS ──────────
  const heroImgs = document.querySelectorAll('.hero-main, .hero-tall, .hero-side');
  heroImgs.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });

  const heroImagesContainer = document.querySelector('.hero-images');
  if (heroImagesContainer) {
    heroImagesContainer.addEventListener('mouseenter', () => {
      heroImgs.forEach(img => img.style.willChange = 'transform');
    });
    heroImagesContainer.addEventListener('mouseleave', () => {
      heroImgs.forEach(img => img.style.willChange = 'auto');
    });
  }

  // ─── SMOOTH SCROLL FOR ANCHOR LINKS ──────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ─── STICKY CTA VISIBILITY ──────────────────────────
  const stickyCta = document.querySelector('.sticky-cta');
  const heroSection = document.getElementById('hero');
  if (stickyCta && heroSection) {
    const stickyObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        stickyCta.style.display = e.isIntersecting ? 'none' : '';
      });
    }, { threshold: 0 });
    stickyObserver.observe(heroSection);
  }

  // ═══════════════════════════════════════════════════════════
  // SECTION 2: ENHANCED CART SYSTEM (NEW)
  // ═══════════════════════════════════════════════════════════

  // ─── CATALOG DEFINITION (6 CATEGORIES, 3 PRICING TYPES) ─

  // ─── PORTION / WEIGHT CONSTANTS ───────────────────────
  const WEIGHT_STOPS_G = [250, 500, 750, 1000, 1500, 2000];
  const WEIGHT_LABELS  = ['250g', '500g', '750g', '1 kg', '1.5 kg', '2 kg', 'Sur mesure'];
  const EVENT_PERSON_STOPS  = [5, 10, 15, 20, 25, 30];
  const EVENT_PERSON_LABELS = ['5', '10', '15', '20', '25', '30', 'Plus'];

  const PRICING_TYPES = {
    UNIT: 'unit',           // Fixed price per item
    WEIGHT: 'weight',       // Price per kg, selectable weights
    PORTION: 'portion',     // Price per person, tiered pricing
    FIXED: 'fixed'          // Bundle price (boxes)
  };

  const CATALOG = {
    'viennoiseries-trad': {
      name: "Viennoiseries Traditionnelles",
      pricingType: PRICING_TYPES.UNIT,
      items: [
        { id: "vt-pain-choc", name: "Pain au chocolat", price: 7 },
        { id: "vt-croissant", name: "Croissant", price: 6 },
        { id: "vt-pain-brise", name: "Pain brisé", price: 6 },
        { id: "vt-pain-suisse", name: "Pain Suisse", price: 7 },
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
      weightOptions: [250, 500, 750, 1000, 2000],
      customMin: 1000,
      customMax: 5000,
      customStep: 100,
      items: [
        {
          id: "cm-kaab-ghzal",
          name: "Kaab Ghzal",
          pricePerKg: 120,
          description: "Cornes de gazelle aux amandes"
        },
        {
          id: "cm-fekkas-amande",
          name: "Fekkas Amande",
          pricePerKg: 100,
          description: "Biscuits croquants aux amandes"
        },
        {
          id: "cm-ghraybe",
          name: "Ghraybe",
          pricePerKg: 110,
          description: "Shortbread fondant"
        },
        {
          id: "cm-ghriba-noix",
          name: "Ghriba Noix",
          pricePerKg: 130,
          description: "Craquelé au sucre glace"
        },
        {
          id: "cm-placeholder-1",
          name: "XX",
          pricePerKg: 100,
          isPlaceholder: true
        },
        {
          id: "cm-placeholder-2",
          name: "XX",
          pricePerKg: 100,
          isPlaceholder: true
        },
        {
          id: "cm-placeholder-3",
          name: "XX",
          pricePerKg: 100,
          isPlaceholder: true
        },
        {
          id: "cm-placeholder-4",
          name: "XX",
          pricePerKg: 100,
          isPlaceholder: true
        },
        {
          id: "cm-placeholder-5",
          name: "XX",
          pricePerKg: 100,
          isPlaceholder: true
        }
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
      items: [
        {
          id: "sp-mariage",
          name: "Forfait Mariage",
          surDevis: true,
          uiType: 'marriage',
          description: "Wedding cake sur mesure + service complet"
        },
        {
          id: "sp-gateau-mesure",
          name: "Gâteau sur Mesure",
          surDevis: true,
          uiType: 'events',
          description: "Création personnalisée pour votre événement"
        }
      ]
    }
  };

  // Pre-compute flat dictionary for quick access
  const ITEMS_DICT = {};
  Object.entries(CATALOG).forEach(([catKey, cat]) => {
    cat.items.forEach(item => {
      ITEMS_DICT[item.id] = { ...item, categoryKey: catKey, category: cat };
    });
  });

  // ─── CART STATE MANAGEMENT ───────────────────────────

  let cart = []; // Array of cart items with full details

  function generateCartId() {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function addToCart(itemData) {
    const cartItem = {
      cartId: generateCartId(),
      ...itemData
    };
    cart.push(cartItem);
    updateCartUI();
    return cartItem;
  }

  function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    updateCartUI();
  }

  function updateCartItem(cartId, updates) {
    const item = cart.find(i => i.cartId === cartId);
    if (item) {
      Object.assign(item, updates);
      updateCartUI();
    }
  }

  function clearCart() {
    cart = [];
    updateCartUI();
  }

  // ─── PRICE CALCULATION ENGINE ────────────────────────

  function calculateItemPrice(item) {
    const category = CATALOG[item.categoryKey];
    switch (category.pricingType) {
      case PRICING_TYPES.UNIT:
      case PRICING_TYPES.FIXED:
        return (item.price || 0) * (item.quantity || 1);
      case PRICING_TYPES.WEIGHT: {
        const kg = (item.weight || 0) / 1000;
        return Math.round(kg * (item.pricePerKg || category.defaultPricePerKg || 0));
      }
      case PRICING_TYPES.PORTION:
        if (item.surDevis) return 0;
        if (category.portionConfig) {
          const cfg = category.portionConfig;
          const portions = item.portions || cfg.min;
          const extra = Math.max(0, Math.ceil((portions - cfg.min) / cfg.step));
          return cfg.basePrice + extra * cfg.incrementPrice;
        }
        return 0;
      default:
        return 0;
    }
  }

  function calculateCartTotals() {
    let fixedTotal = 0;
    let devisItems = [];

    cart.forEach(item => {
      if (item.surDevis) {
        devisItems.push(item);
      } else {
        fixedTotal += calculateItemPrice(item);
      }
    });

    return {
      fixedTotal,
      devisItems,
      itemCount: cart.length
    };
  }

  function formatPrice(price, surDevis) {
    if (surDevis) return "Sur devis";
    return price + " DH";
  }

  function formatWeight(grams) {
    if (grams >= 1000) {
      return (grams / 1000).toFixed(1).replace('.0', '') + " kg";
    }
    return grams + " g";
  }

  // ─── MODAL DOM REFERENCES ──────────────────────────

  const modal = document.getElementById('order-modal');
  const modalClose = document.getElementById('modal-close');
  const viewCats = document.getElementById('view-categories');
  const viewProds = document.getElementById('view-products');
  const viewCheck = document.getElementById('view-checkout');

  const productListContainer = document.getElementById('product-list-container');
  const weightProductListContainer = document.getElementById('weight-product-list-container');
  const portionProductListContainer = document.getElementById('portion-product-list-container');

  const activeCategoryTitle = document.getElementById('active-category-title');
  const btnBackCats = document.getElementById('btn-back-categories');
  const btnBackCart = document.getElementById('btn-back-cart');
  const btnNextStep = document.getElementById('btn-next-step');

  const cartExpandBtn = document.getElementById('cart-expand-btn');
  const cartPreview = document.getElementById('cart-preview');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');

  // Track which category is currently being viewed for re-rendering
  let currentCategoryKey = null;

  // ─── VIEW NAVIGATION ────────────────────────────────

  function switchView(viewId) {
    document.querySelectorAll('.modal-view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    const isCheckout = viewId === 'view-checkout';
    btnNextStep.textContent = isCheckout ? "Confirmer la commande" : "Suivant";

    // Reset product list visibility
    productListContainer.style.display = '';
    weightProductListContainer.style.display = 'none';
    portionProductListContainer.style.display = 'none';
  }

  btnBackCats.addEventListener('click', () => switchView('view-categories'));
  btnBackCart.addEventListener('click', () => {
    if (currentCategoryKey) {
      renderCategoryProducts(currentCategoryKey);
    } else {
      switchView('view-products');
    }
  });

  // ─── CATEGORY SELECTION ─────────────────────────────

  document.querySelectorAll('.category-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const catKey = btn.getAttribute('data-category');
      renderCategoryProducts(catKey);
    });
  });

  function renderCategoryProducts(catKey) {
    const category = CATALOG[catKey];
    currentCategoryKey = catKey;
    activeCategoryTitle.textContent = category.name;

    // Switch view FIRST so that renderer display settings aren't overridden
    switchView('view-products');

    // Route to appropriate renderer based on pricing type
    switch (category.pricingType) {
      case PRICING_TYPES.WEIGHT:
        renderWeightBasedProducts(catKey);
        break;
      case PRICING_TYPES.PORTION:
        renderPortionBasedProducts(catKey);
        break;
      default:
        renderUnitBasedProducts(catKey);
        break;
    }
  }

  // ─── UNIT PRODUCTS RENDERER (Unit/Fixed) ───────

  function renderUnitBasedProducts(catKey) {
    const category = CATALOG[catKey];
    productListContainer.style.display = 'block';
    weightProductListContainer.style.display = 'none';
    portionProductListContainer.style.display = 'none';
    productListContainer.innerHTML = '';

    category.items.forEach(function(product) {
      const existing = cart.find(c => c.id === product.id);
      const qty = existing ? existing.quantity : 0;

      const row = document.createElement('div');
      row.className = 'product-row';
      row.innerHTML = `
        <div class="product-info">
          <strong>${product.name || '—'}</strong>
          <span>${product.price ? product.price + ' DH' : ''}</span>
        </div>
        <div class="product-stepper">
          <button type="button" class="stepper-dec" data-id="${product.id}" aria-label="Diminuer">−</button>
          <span class="stepper-count" data-id="${product.id}">${qty}</span>
          <button type="button" class="stepper-inc" data-id="${product.id}" aria-label="Augmenter">+</button>
        </div>
      `;
      productListContainer.appendChild(row);
    });

    attachUnitProductListeners(catKey);
  }

  function attachUnitProductListeners(catKey) {
    const category = CATALOG[catKey];

    productListContainer.querySelectorAll('.stepper-inc').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.dataset.id;
        const product = ITEMS_DICT[id];
        const existing = cart.find(c => c.id === id);
        if (existing) {
          updateCartItem(existing.cartId, { quantity: existing.quantity + 1 });
        } else {
          addToCart({ id, name: product.name, price: product.price || 0, quantity: 1, categoryKey: catKey, pricingType: category.pricingType });
        }
        const countEl = productListContainer.querySelector(`.stepper-count[data-id="${id}"]`);
        const updated = cart.find(c => c.id === id);
        if (countEl && updated) countEl.textContent = updated.quantity;
      });
    });

    productListContainer.querySelectorAll('.stepper-dec').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.dataset.id;
        const existing = cart.find(c => c.id === id);
        if (!existing) return;
        if (existing.quantity <= 1) {
          removeFromCart(existing.cartId);
          const countEl = productListContainer.querySelector(`.stepper-count[data-id="${id}"]`);
          if (countEl) countEl.textContent = 0;
        } else {
          updateCartItem(existing.cartId, { quantity: existing.quantity - 1 });
          const countEl = productListContainer.querySelector(`.stepper-count[data-id="${id}"]`);
          const updated = cart.find(c => c.id === id);
          if (countEl && updated) countEl.textContent = updated.quantity;
        }
      });
    });
  }

  // ─── WEIGHT-BASED PRODUCTS RENDERER ────────────────

  function renderWeightBasedProducts(catKey) {
    const category = CATALOG[catKey];
    productListContainer.style.display = 'none';
    weightProductListContainer.style.display = 'block';
    portionProductListContainer.style.display = 'none';
    weightProductListContainer.innerHTML = '';

    category.items.forEach(function(product) {
      const existing = cart.find(c => c.id === product.id);
      const selWeight  = existing ? existing.weight : null;
      const pricePerKg = product.pricePerKg || category.defaultPricePerKg;

      const stopIdx = selWeight !== null ? WEIGHT_STOPS_G.indexOf(selWeight) : -1;
      const isCustom  = selWeight !== null && stopIdx === -1;
      const sliderVal = isCustom ? WEIGHT_STOPS_G.length : (stopIdx >= 0 ? stopIdx : 0);
      const hasSelection = selWeight !== null;

      const card = document.createElement('div');
      card.className = 'weight-product-card';
      card.innerHTML = `
        <div class="weight-product-header">
          <strong>${product.name || '—'}</strong>
          ${product.description ? `<span class="wp-desc">${product.description}</span>` : ''}
          <span class="price-per-kg">${pricePerKg} DH / kg</span>
        </div>

        <div class="ws-wrap">
          <div class="ws-labels" aria-hidden="true">
            ${WEIGHT_LABELS.map((l, i) => `<span class="${i === sliderVal ? 'ws-label-active' : ''}">${l}</span>`).join('')}
          </div>
          <div class="ws-track-wrap">
            <input type="range" class="ws-slider"
              min="0" max="${WEIGHT_STOPS_G.length}" step="1"
              value="${sliderVal}"
              data-id="${product.id}" data-cat="${catKey}"
              aria-label="Quantité de ${product.name || 'produit'}">
            <div class="ws-dots" aria-hidden="true">
              ${WEIGHT_LABELS.map((_, i) => `<span class="ws-dot${i === WEIGHT_STOPS_G.length ? ' ws-dot-custom' : ''}${i === sliderVal ? ' ws-dot-on' : ''}"></span>`).join('')}
            </div>
          </div>
        </div>

        <div class="ws-custom${isCustom ? ' ws-custom-open' : ''}" id="wsc-${product.id}">
          <input type="number" class="ws-custom-input"
            placeholder="Poids en grammes…"
            min="100" max="10000" step="50"
            value="${isCustom ? selWeight : ''}"
            data-id="${product.id}"
            aria-label="Poids personnalisé en grammes">
          <span class="ws-custom-unit">g</span>
        </div>

        <div class="ws-preview" id="wsp-${product.id}">
          ${hasSelection
            ? `<span class="ws-qty">${formatWeight(selWeight)}</span><span class="ws-arrow">→</span><span class="ws-price">${Math.round(selWeight / 1000 * pricePerKg)} DH</span>`
            : `<span class="ws-hint">Déplacez le curseur pour voir le prix</span>`}
        </div>

        ${existing ? `<div class="weight-actions"><button type="button" class="btn-remove-weight" data-id="${product.id}">Retirer du panier</button></div>` : ''}
      `;

      weightProductListContainer.appendChild(card);
    });

    attachWeightSliderListeners(catKey);
  }

  function attachWeightSliderListeners(catKey) {
    const category = CATALOG[catKey];

    weightProductListContainer.querySelectorAll('.ws-slider').forEach(function(slider) {
      const id         = slider.dataset.id;
      const product    = ITEMS_DICT[id];
      const pricePerKg = product.pricePerKg || category.defaultPricePerKg;
      const card       = slider.closest('.weight-product-card');
      const customDiv  = document.getElementById('wsc-' + id);
      const preview    = document.getElementById('wsp-' + id);
      const labels     = card.querySelectorAll('.ws-labels span');
      const dots       = card.querySelectorAll('.ws-dot');

      function setPreview(grams) {
        preview.innerHTML = `<span class="ws-qty">${formatWeight(grams)}</span><span class="ws-arrow">→</span><span class="ws-price">${Math.round(grams / 1000 * pricePerKg)} DH</span>`;
      }

      function syncCart(grams) {
        const ex = cart.find(c => c.id === id);
        if (ex) {
          updateCartItem(ex.cartId, { weight: grams });
        } else {
          addToCart({ id, name: product.name, weight: grams, pricePerKg, categoryKey: catKey, pricingType: PRICING_TYPES.WEIGHT });
        }
      }

      slider.addEventListener('input', function() {
        const val      = parseInt(slider.value);
        const isCustom = val === WEIGHT_STOPS_G.length;

        labels.forEach((l, i) => l.classList.toggle('ws-label-active', i === val));
        dots.forEach((d, i)   => d.classList.toggle('ws-dot-on', i === val));
        customDiv.classList.toggle('ws-custom-open', isCustom);

        if (isCustom) {
          preview.innerHTML = '<span class="ws-hint">Entrez un poids ci-dessous</span>';
          setTimeout(function() { customDiv.querySelector('input').focus(); }, 60);
        } else {
          const grams = WEIGHT_STOPS_G[val];
          setPreview(grams);
          syncCart(grams);
        }
      });

      customDiv.querySelector('input').addEventListener('input', function(e) {
        const grams = parseInt(e.target.value);
        if (!grams || grams < 100) {
          preview.innerHTML = '<span class="ws-hint">Poids minimum : 100g</span>';
          return;
        }
        setPreview(grams);
        syncCart(grams);
      });
    });

    weightProductListContainer.querySelectorAll('.btn-remove-weight').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const ex = cart.find(c => c.id === btn.dataset.id);
        if (ex) { removeFromCart(ex.cartId); renderWeightBasedProducts(catKey); }
      });
    });
  }

  // ─── SPECIAL ITEMS RENDERER ──────────────────────────

  function renderPortionBasedProducts(catKey) {
    const category = CATALOG[catKey];
    productListContainer.style.display = 'none';
    weightProductListContainer.style.display = 'none';
    portionProductListContainer.style.display = 'block';
    portionProductListContainer.innerHTML = '';

    category.items.forEach(function(product) {
      const existing = cart.find(c => c.id === product.id);
      const card = document.createElement('div');
      card.className = 'portion-product-card';

      if (product.uiType === 'marriage') {
        renderMarriageCard(card, product, existing);
      } else if (product.uiType === 'events') {
        renderEventsCard(card, product, existing);
      } else {
        // Fallback: generic portion UI for any future items
        card.innerHTML = `
          <div class="portion-product-header">
            <strong>${product.name || '—'}</strong>
            ${product.description ? `<span>${product.description}</span>` : ''}
          </div>
          <div class="devis-notice"><span>⚠️ Devis personnalisé — contactez-nous par WhatsApp</span></div>
        `;
      }

      portionProductListContainer.appendChild(card);
    });

    attachSpecialListeners(catKey);
  }

  function renderMarriageCard(card, product, existing) {
    const savedPersons = existing ? existing.persons : '';
    card.innerHTML = `
      <div class="portion-product-header">
        <strong>${product.name}</strong>
        ${product.description ? `<span>${product.description}</span>` : ''}
      </div>
      <div class="marriage-wrap">
        <label class="marriage-label" for="mg-${product.id}">Nombre d'invités</label>
        <div class="marriage-input-row">
          <input type="number"
                 id="mg-${product.id}"
                 class="marriage-guests"
                 placeholder="Ex : 80"
                 min="2"
                 value="${savedPersons}"
                 data-id="${product.id}"
                 inputmode="numeric"
                 aria-label="Nombre d'invités pour le mariage">
          <span class="marriage-unit">personnes</span>
        </div>
      </div>
      <div class="devis-notice"><span>Devis personnalisé · Confirmation sous 2h par WhatsApp</span></div>
      ${existing ? `<div class="portion-actions"><button type="button" class="btn-remove-portion" data-id="${product.id}">Retirer</button></div>` : ''}
    `;
  }

  function renderEventsCard(card, product, existing) {
    const savedPersons = existing ? existing.persons : null;
    const stopIdx  = savedPersons !== null ? EVENT_PERSON_STOPS.indexOf(savedPersons) : -1;
    const isCustom = savedPersons !== null && stopIdx === -1;
    const sliderVal = isCustom ? EVENT_PERSON_STOPS.length : (stopIdx >= 0 ? stopIdx : 0);
    const hasSelection = savedPersons !== null;

    card.innerHTML = `
      <div class="portion-product-header">
        <strong>${product.name}</strong>
        ${product.description ? `<span>${product.description}</span>` : ''}
      </div>

      <div class="ps-wrap">
        <div class="ps-labels" aria-hidden="true">
          ${EVENT_PERSON_LABELS.map((l, i) => `<span class="${i === sliderVal ? 'ps-label-active' : ''}">${l}</span>`).join('')}
        </div>
        <div class="ps-track-wrap">
          <input type="range" class="ps-slider"
            min="0" max="${EVENT_PERSON_STOPS.length}" step="1"
            value="${sliderVal}"
            data-id="${product.id}"
            aria-label="Nombre de personnes">
          <div class="ps-dots" aria-hidden="true">
            ${EVENT_PERSON_LABELS.map((_, i) => `<span class="ps-dot${i === EVENT_PERSON_STOPS.length ? ' ps-dot-custom' : ''}${i === sliderVal ? ' ps-dot-on' : ''}"></span>`).join('')}
          </div>
        </div>
      </div>

      <div class="ps-custom${isCustom ? ' ps-custom-open' : ''}" id="psc-${product.id}">
        <input type="number" class="ps-custom-input"
          placeholder="Nombre de personnes…"
          min="31"
          value="${isCustom ? savedPersons : ''}"
          data-id="${product.id}"
          inputmode="numeric"
          aria-label="Nombre de personnes personnalisé">
        <span class="ps-custom-unit">personnes</span>
      </div>

      <div class="ps-preview" id="psp-${product.id}">
        ${hasSelection
          ? `<span class="ps-persons">${savedPersons} personnes</span><span class="ps-devis-tag">Sur devis</span>`
          : `<span class="ps-hint">Sélectionnez le nombre d'invités</span>`}
      </div>
      <div class="devis-notice"><span>Tarif selon le type de gâteau · Devis sous 2h</span></div>

      ${existing ? `<div class="portion-actions"><button type="button" class="btn-remove-portion" data-id="${product.id}">Retirer</button></div>` : ''}
    `;
  }

  function attachSpecialListeners(catKey) {
    // — Marriage: number input —
    portionProductListContainer.querySelectorAll('.marriage-guests').forEach(function(input) {
      const id      = input.dataset.id;
      const product = ITEMS_DICT[id];

      input.addEventListener('input', function() {
        const persons = parseInt(input.value);
        if (!persons || persons < 2) return;
        const existing = cart.find(c => c.id === id);
        if (existing) {
          updateCartItem(existing.cartId, { persons });
        } else {
          addToCart({ id, name: product.name, persons, surDevis: true, uiType: 'marriage', categoryKey: catKey, pricingType: PRICING_TYPES.PORTION });
        }
      });
    });

    // — Events: precision slider —
    portionProductListContainer.querySelectorAll('.ps-slider').forEach(function(slider) {
      const id       = slider.dataset.id;
      const product  = ITEMS_DICT[id];
      const card     = slider.closest('.portion-product-card');
      const customDiv = document.getElementById('psc-' + id);
      const preview   = document.getElementById('psp-' + id);
      const labels    = card.querySelectorAll('.ps-labels span');
      const dots      = card.querySelectorAll('.ps-dot');

      function setPreview(persons) {
        preview.innerHTML = `<span class="ps-persons">${persons} personnes</span><span class="ps-devis-tag">Sur devis</span>`;
      }

      function syncCart(persons) {
        const existing = cart.find(c => c.id === id);
        if (existing) {
          updateCartItem(existing.cartId, { persons });
        } else {
          addToCart({ id, name: product.name, persons, surDevis: true, uiType: 'events', categoryKey: catKey, pricingType: PRICING_TYPES.PORTION });
        }
      }

      slider.addEventListener('input', function() {
        const val      = parseInt(slider.value);
        const isCustom = val === EVENT_PERSON_STOPS.length;

        labels.forEach((l, i) => l.classList.toggle('ps-label-active', i === val));
        dots.forEach((d, i)   => d.classList.toggle('ps-dot-on', i === val));
        customDiv.classList.toggle('ps-custom-open', isCustom);

        if (isCustom) {
          preview.innerHTML = '<span class="ps-hint">Entrez le nombre ci-dessous</span>';
          setTimeout(function() { customDiv.querySelector('input').focus(); }, 60);
        } else {
          const persons = EVENT_PERSON_STOPS[val];
          setPreview(persons);
          syncCart(persons);
        }
      });

      customDiv.querySelector('input').addEventListener('input', function(e) {
        const persons = parseInt(e.target.value);
        if (!persons || persons < 1) return;
        setPreview(persons);
        syncCart(persons);
      });
    });

    // — Remove buttons —
    portionProductListContainer.querySelectorAll('.btn-remove-portion').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const ex = cart.find(c => c.id === btn.dataset.id);
        if (ex) { removeFromCart(ex.cartId); renderPortionBasedProducts(catKey); }
      });
    });
  }

  // ─── CART UI UPDATES ────────────────────────────────

  function updateCartUI() {
    const totals = calculateCartTotals();

    // Update badge and total
    cartCount.textContent = totals.itemCount;

    let totalText = formatPrice(totals.fixedTotal);
    if (totals.devisItems.length > 0) {
      totalText = totals.fixedTotal > 0 ? totals.fixedTotal + ' DH + devis' : 'Sur devis';
    }
    cartTotal.textContent = totalText;

    // Enable/disable next button
    btnNextStep.disabled = totals.itemCount === 0;

    // Render cart items list
    renderCartItemsList();
  }

  function renderCartItemsList() {
    if (cart.length === 0) {
      cartItemsList.innerHTML = '<li class="empty-cart">Votre panier est vide</li>';
      return;
    }

    // Group by category
    const grouped = {};
    cart.forEach(item => {
      const catName = CATALOG[item.categoryKey].name;
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(item);
    });

    let html = '';
    Object.entries(grouped).forEach(([catName, items]) => {
      html += `<li class="cart-category-header">${catName}</li>`;
      items.forEach(item => {
        const price = calculateItemPrice(item);
        let details = '';

        if (item.pricingType === PRICING_TYPES.WEIGHT) {
          const w = item.weight || 0;
          details = ` — ${w >= 1000 ? (w/1000) + ' kg' : w + 'g'}`;
        } else if (item.pricingType === PRICING_TYPES.PORTION) {
          details = ` — ${item.persons || item.portions} personnes`;
        } else if (item.quantity > 1) {
          details = ` × ${item.quantity}`;
        }

        html += `
          <li class="cart-item">
            <span class="li-title">${item.name}${details}</span>
            <span class="li-price">${formatPrice(price, item.surDevis)}</span>
            <button type="button" class="btn-remove-item" data-cart-id="${item.cartId}" aria-label="Retirer">×</button>
          </li>
        `;
      });
    });

    // Add totals
    const totals = calculateCartTotals();
    html += `<li class="cart-divider"></li>`;
    if (totals.fixedTotal > 0) {
      html += `<li class="cart-subtotal"><span>Total fixe</span><span>${totals.fixedTotal} DH</span></li>`;
    }
    if (totals.devisItems.length > 0) {
      html += `<li class="cart-devis-notice"><span>⚠️ ${totals.devisItems.length} article(s) sur devis</span></li>`;
    }

    cartItemsList.innerHTML = html;

    // Attach remove listeners
    cartItemsList.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cartId = e.currentTarget.getAttribute('data-cart-id');
        removeFromCart(cartId);
        // Re-render current product view if visible
        if (currentCategoryKey && document.getElementById('view-products').classList.contains('active')) {
          renderCategoryProducts(currentCategoryKey);
        }
      });
    });
  }

  // Toggle cart expansion
  cartExpandBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    const isExpanded = cartPreview.classList.toggle('open');
    cartExpandBtn.setAttribute('aria-expanded', isExpanded);
  });

  // ─── CHECKOUT FLOW ─────────────────────────────────

  btnNextStep.addEventListener('click', () => {
    if (document.getElementById('view-checkout').classList.contains('active')) {
      handleCheckoutSubmit();
    } else {
      switchView('view-checkout');
    }
  });

  // Validation (preserved from original)
  var validators = {
    'order-name': function(val) {
      if (!val || val.trim().length < 2) return 'Veuillez entrer votre nom';
      return '';
    },
    'order-phone': function(val) {
      var cleaned = val.replace(/[\s\-\.]/g, '');
      if (!cleaned) return 'Veuillez entrer votre numéro';
      var pattern = /^(\+212|0)(5|6|7)\d{8}$/;
      if (!pattern.test(cleaned)) return 'Format : 06XXXXXXXX';
      return '';
    },
    'order-date': function(val) {
      if (!val) return 'Veuillez choisir une date';
      var selected = new Date(val);
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) return 'La date doit être aujourd\'hui ou après';
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
      if (errorEl) {
        errorEl.textContent = errorMsg;
        errorEl.classList.add('visible');
      }
      return false;
    } else {
      field.classList.remove('error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }
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

  // Real-time validation
  Object.keys(validators).forEach(function(fieldId) {
    var field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('blur', () => validateField(fieldId));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(fieldId);
      });
    }
  });

  function handleCheckoutSubmit() {
    if (!validateAllFields()) {
      var firstError = document.querySelector('.error');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Gather form data
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const date = document.getElementById('order-date').value;
    const notes = document.getElementById('order-notes').value.trim();

    // Format date
    let dateFormatted = '';
    if (date) {
      dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }

    // Build WhatsApp message
    let msg = 'Bonjour Lartica Bakehouse 👋\n\n';
    msg += '📋 *Nouvelle Commande*\n';
    msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    msg += `👤 *Nom:* ${name}\n`;
    msg += `📞 *Téléphone:* ${phone}\n`;
    if (dateFormatted) msg += `📅 *Date de retrait:* ${dateFormatted}\n`;
    if (notes) msg += `📝 *Notes:* ${notes}\n`;

    msg += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    msg += '📦 *DÉTAIL DES ARTICLES*\n\n';

    // Group by category for clarity
    const grouped = {};
    cart.forEach(item => {
      const catName = CATALOG[item.categoryKey].name;
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(item);
    });

    let fixedTotal = 0;

    Object.entries(grouped).forEach(([catName, items]) => {
      msg += `*${catName.toUpperCase()}*\n`;

      items.forEach(item => {
        const price = calculateItemPrice(item);

        if (item.pricingType === PRICING_TYPES.WEIGHT) {
          const pricePerKg = item.pricePerKg || CATALOG[item.categoryKey].defaultPricePerKg;
          const w = item.weight || 0;
          const wStr = w >= 1000 ? (w/1000) + ' kg' : w + 'g';
          // Check if custom (not in precision stops)
          const isCustom = !WEIGHT_STOPS_G.includes(w);

          msg += `• ${item.name}\n`;
          if (isCustom) {
            msg += `  └ ⚖️ Sur mesure : ${wStr} @ ${pricePerKg} DH/kg = ${price} DH\n`;
          } else {
            msg += `  └ ${wStr} @ ${pricePerKg} DH/kg = ${price} DH\n`;
          }
          fixedTotal += price;

        } else if (item.pricingType === PRICING_TYPES.PORTION) {
          msg += `• ${item.name}\n`;
          msg += `  └ 👥 ${item.persons || item.portions} personnes · SUR DEVIS\n`;
        } else {
          // Unit/Fixed
          const lineTotal = price;
          msg += `• ${item.name}`;
          if (item.quantity > 1) msg += ` × ${item.quantity}`;
          msg += ` = ${lineTotal} DH\n`;
          fixedTotal += lineTotal;
        }
      });

      msg += '\n';
    });

    msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    // Totals
    const totals = calculateCartTotals();
    if (totals.fixedTotal > 0) {
      msg += `💰 *Total articles:* ${totals.fixedTotal} DH\n`;
    }
    if (totals.devisItems.length > 0) {
      msg += `⚠️ *Articles sur devis:* ${totals.devisItems.length}\n`;
      totals.devisItems.forEach(item => {
        msg += `   - ${item.name} (${item.persons || item.portions} personnes)\n`;
      });
    }

    msg += '\nMerci de confirmer la disponibilité ! 🙏\n';
    msg += 'À très bientôt chez Lartica Bakehouse ✨';

    // Open WhatsApp
    const waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
    window.open(waUrl, '_blank', 'noopener');
  }

  // ─── MODAL OPEN/CLOSE (PRESERVED + ENHANCED) ───────

  function openModal(productHint) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Reset to categories view
    switchView('view-categories');

    // Auto-route if hint provided
    if (productHint) {
      const hint = productHint.toLowerCase();
      let matchedCat = null;

      if (hint.includes('tradition')) matchedCat = 'viennoiseries-trad';
      else if (hint.includes('moderne')) matchedCat = 'viennoiseries-modernes';
      else if (hint.includes('croissant') || hint.includes('pain')) matchedCat = 'viennoiseries-trad';
      else if (hint.includes('crokies') || hint.includes('croquant') || hint.includes('dubai')) matchedCat = 'viennoiseries-modernes';
      else if (hint.includes('marocain') || hint.includes('kaab') || hint.includes('ghzal') || hint.includes('fekkas') || hint.includes('ghraybe') || hint.includes('ghriba')) matchedCat = 'marocains';
      else if (hint.includes('box') || hint.includes('plateau') || hint.includes('formule')) matchedCat = 'formules';
      else if (hint.includes('cake') || hint.includes('tarte')) matchedCat = 'cakes';
      else if (hint.includes('mariage') || hint.includes('special') || hint.includes('evenement') || hint.includes('événement')) matchedCat = 'special';

      if (matchedCat && CATALOG[matchedCat]) {
        setTimeout(() => renderCategoryProducts(matchedCat), 100);
      }
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Attach to all order buttons
  document.querySelectorAll('[data-open-order]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var product = this.getAttribute('data-product') || '';
      openModal(product);
    });
  });

  // Set minimum date to today
  const dateInput = document.getElementById('order-date');
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
  }

  // Prevent form default submit
  document.getElementById('order-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCheckoutSubmit();
  });

  // Expose globally for debugging
  window.openOrderModal = openModal;
  window.getCart = () => cart;
  window.clearCart = clearCart;

  // ─── ANTIGRAVITY HERO PARALLAX ─────────────────────────
  function initAntigravity() {
    const heroDom = document.querySelector('.hero-images');
    if (!heroDom) return;

    const main = heroDom.querySelector('.hero-main');
    const tall = heroDom.querySelector('.hero-tall');
    const side = heroDom.querySelector('.hero-side');
    if (!main || !tall || !side) return;

    // Ambient floating state variables
    let tick = 0;
    
    // Performance optimized scroll loop
    let lastScrollY = window.scrollY;
    let ticking = false;

    function renderParallax() {
      tick += 0.05; // Ambient time

      // Calculates how far down the page we've scrolled
      // If we scroll past hero (say 800px), limit calculation to avoid pointless math
      const sy = Math.min(lastScrollY, 800);

      // Core parameters:
      // Translate Z and diffuses shadow based on scroll
      const zMain = 10 + (sy * 0.15); // Pops up
      const zTall = 5 + (sy * 0.1); 
      const zSide = 15 + (sy * 0.2); // Pops up the most

      // Ambient floats
      const fMain = Math.sin(tick) * 8;
      const fTall = Math.cos(tick * 0.8) * 12;
      const fSide = Math.sin(tick * 1.2) * 6;

      // Rotations on scroll (parallax tilting)
      const rX = sy * 0.02;
      
      // Apply transforms
      main.style.transform = `translate3d(0, ${fMain - sy * 0.1}px, ${zMain}px) rotateX(${rX}deg) rotateY(-2deg)`;
      tall.style.transform = `translate3d(0, ${fTall - sy * 0.05}px, ${zTall}px) rotateX(${-rX}deg) rotateY(3deg)`;
      side.style.transform = `translate3d(0, ${fSide - sy * 0.15}px, ${zSide}px) rotateX(${rX * 1.5}deg) rotateY(-1deg)`;

      // Dynamic shadow diffusion
      const diffMain = 25 + (sy * 0.1);
      const diffTall = 20 + (sy * 0.05);
      const diffSide = 30 + (sy * 0.15);
      
      main.style.boxShadow = `0 ${15 + (sy * 0.05)}px ${diffMain}px rgba(181, 84, 26, ${0.25 - (sy * 0.0002)})`;
      tall.style.boxShadow = `0 ${10 + (sy * 0.05)}px ${diffTall}px rgba(181, 84, 26, ${0.25 - (sy * 0.0002)})`;
      side.style.boxShadow = `0 ${20 + (sy * 0.05)}px ${diffSide}px rgba(181, 84, 26, ${0.25 - (sy * 0.0002)})`;

      ticking = false;
      requestAnimationFrame(renderParallax);
    }

    // Start loop
    requestAnimationFrame(renderParallax);

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
    }, { passive: true });
  }

  // Small timeout to let entry animations finish before injecting persistent JS transforms
  setTimeout(initAntigravity, 1000);

})();
