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
      portionConfig: {
        min: 5,
        max: 30,
        step: 5,
        basePrice: 500,
        incrementPrice: 400,
        unitLabel: "personnes"
      },
      items: [
        {
          id: "sp-mariage",
          name: "Forfait Mariage",
          surDevis: true,
          description: "Wedding cake sur mesure + service complet"
        },
        {
          id: "sp-gateau-mesure",
          name: "Gâteau sur Mesure",
          surDevis: true,
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

      case PRICING_TYPES.WEIGHT:
        const weightKg = (item.weight || 0) / 1000;
        return Math.round(weightKg * (item.pricePerKg || category.defaultPricePerKg || 0));

      case PRICING_TYPES.PORTION:
        const config = category.portionConfig;
        const portions = item.portions || config.min;
        const additionalBlocks = Math.max(0, Math.ceil((portions - config.min) / config.step));
        return config.basePrice + (additionalBlocks * config.incrementPrice);

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
        renderStandardProducts(catKey);
        break;
    }
  }

  // ─── STANDARD PRODUCTS RENDERER (Unit/Fixed) ───────

  function renderStandardProducts(catKey) {
    const category = CATALOG[catKey];
    productListContainer.style.display = 'block';
    weightProductListContainer.style.display = 'none';
    portionProductListContainer.style.display = 'none';

    productListContainer.innerHTML = '';

    category.items.forEach(product => {
      const row = document.createElement('div');
      row.className = 'product-row' + (product.isPlaceholder ? ' placeholder' : '');

      const existingCartItem = cart.find(c => c.id === product.id);
      const qty = existingCartItem ? existingCartItem.quantity : 0;

      const priceText = product.isPlaceholder ?
        "Prix à définir" :
        (product.surDevis ? "Sur devis" : `${product.price} DH`);

      row.innerHTML = `
        <div class="product-info">
          <strong>${product.name}</strong>
          ${product.description ? `<span>${product.description}</span>` : ''}
          <span class="price">${priceText}</span>
        </div>
        ${!product.isPlaceholder ? `
        <div class="product-stepper">
          <button type="button" aria-label="Retirer" data-action="dec" data-id="${product.id}" ${qty === 0 ? 'disabled' : ''}>−</button>
          <span class="qty-display">${qty}</span>
          <button type="button" aria-label="Ajouter" data-action="inc" data-id="${product.id}">+</button>
        </div>
        ` : '<span class="placeholder-badge">Bientôt disponible</span>'}
      `;

      productListContainer.appendChild(row);
    });

    attachStandardProductListeners(catKey);
  }

  function attachStandardProductListeners(catKey) {
    productListContainer.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');
        const product = ITEMS_DICT[id];

        const existingItem = cart.find(c => c.id === id);

        if (action === 'inc') {
          if (existingItem) {
            existingItem.quantity++;
          } else {
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              categoryKey: catKey,
              pricingType: CATALOG[catKey].pricingType
            });
          }
        } else if (action === 'dec' && existingItem) {
          existingItem.quantity--;
          if (existingItem.quantity <= 0) {
            removeFromCart(existingItem.cartId);
          }
        }

        updateCartUI();
        renderStandardProducts(catKey); // Re-render to update UI
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

    category.items.forEach(product => {
      const card = document.createElement('div');
      card.className = 'weight-product-card' + (product.isPlaceholder ? ' placeholder' : '');

      const existingCartItem = cart.find(c => c.id === product.id);
      const selectedWeight = existingCartItem ? existingCartItem.weight : null;

      const pricePerKg = product.pricePerKg || category.defaultPricePerKg;

      card.innerHTML = `
        <div class="weight-product-header">
          <strong>${product.name}</strong>
          ${product.description ? `<span>${product.description}</span>` : ''}
          <span class="price-per-kg">${pricePerKg} DH/kg</span>
        </div>

        ${!product.isPlaceholder ? `
        <div class="weight-selector">
          <p>Choisissez le poids :</p>
          <div class="weight-options">
            ${category.weightOptions.map(g => {
              const price = Math.round((g / 1000) * pricePerKg);
              const isSelected = selectedWeight === g;
              return `
                <button type="button"
                  class="weight-btn ${isSelected ? 'selected' : ''}"
                  data-weight="${g}"
                  data-id="${product.id}">
                  <span class="weight-label">${formatWeight(g)}</span>
                  <span class="weight-price">${price} DH</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="custom-weight-section">
            <button type="button" class="custom-weight-toggle" data-id="${product.id}">
              ${selectedWeight && !category.weightOptions.includes(selectedWeight) ? 'Modifier poids personnalisé' : 'Poids personnalisé (min 1kg)'}
            </button>

            <div class="custom-weight-input" style="display: ${selectedWeight && !category.weightOptions.includes(selectedWeight) ? 'flex' : 'none'}">
              <input type="number"
                id="custom-weight-${product.id}"
                placeholder="Grammes"
                min="${category.customMin}"
                max="${category.customMax}"
                step="${category.customStep}"
                value="${selectedWeight && !category.weightOptions.includes(selectedWeight) ? selectedWeight : ''}">
              <button type="button" class="btn-apply-custom" data-id="${product.id}">Appliquer</button>
            </div>
            ${selectedWeight && !category.weightOptions.includes(selectedWeight) ? `
              <div class="custom-price-preview">
                Prix: ${calculateItemPrice({ ...product, weight: selectedWeight, categoryKey: catKey })} DH
              </div>
            ` : ''}
          </div>

          ${selectedWeight ? `
          <div class="weight-actions">
            <button type="button" class="btn-remove-weight" data-id="${product.id}">
              Retirer du panier
            </button>
          </div>
          ` : ''}
        </div>
        ` : '<span class="placeholder-badge">Bientôt disponible</span>'}
      `;

      weightProductListContainer.appendChild(card);
    });

    attachWeightProductListeners(catKey);
  }

  function attachWeightProductListeners(catKey) {
    // Preset weight buttons
    weightProductListContainer.querySelectorAll('.weight-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const weight = parseInt(e.currentTarget.getAttribute('data-weight'));
        const product = ITEMS_DICT[id];

        // Remove existing item if present
        const existing = cart.find(c => c.id === id);
        if (existing) {
          removeFromCart(existing.cartId);
        }

        // Add new with selected weight
        addToCart({
          id: product.id,
          name: product.name,
          pricePerKg: product.pricePerKg || CATALOG[catKey].defaultPricePerKg,
          weight: weight,
          categoryKey: catKey,
          pricingType: PRICING_TYPES.WEIGHT
        });

        renderWeightBasedProducts(catKey);
      });
    });

    // Custom weight toggle
    weightProductListContainer.querySelectorAll('.custom-weight-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const inputSection = e.currentTarget.nextElementSibling;
        const isVisible = inputSection.style.display === 'flex';
        inputSection.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
          setTimeout(() => document.getElementById(`custom-weight-${id}`).focus(), 100);
        }
      });
    });

    // Apply custom weight
    weightProductListContainer.querySelectorAll('.btn-apply-custom').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const input = document.getElementById(`custom-weight-${id}`);
        const weight = parseInt(input.value);
        const product = ITEMS_DICT[id];
        const category = CATALOG[catKey];

        // Validation
        if (isNaN(weight) || weight < category.customMin) {
          alert(`Poids minimum: ${formatWeight(category.customMin)}`);
          return;
        }
        if (weight > category.customMax) {
          alert(`Poids maximum: ${formatWeight(category.customMax)}`);
          return;
        }

        // Remove existing
        const existing = cart.find(c => c.id === id);
        if (existing) {
          removeFromCart(existing.cartId);
        }

        // Add custom weight item
        addToCart({
          id: product.id,
          name: product.name,
          pricePerKg: product.pricePerKg || category.defaultPricePerKg,
          weight: weight,
          categoryKey: catKey,
          pricingType: PRICING_TYPES.WEIGHT,
          isCustomWeight: true
        });

        renderWeightBasedProducts(catKey);
      });
    });

    // Remove from cart
    weightProductListContainer.querySelectorAll('.btn-remove-weight').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const existing = cart.find(c => c.id === id);
        if (existing) {
          removeFromCart(existing.cartId);
          renderWeightBasedProducts(catKey);
        }
      });
    });
  }

  // ─── PORTION-BASED PRODUCTS RENDERER ───────────────

  function renderPortionBasedProducts(catKey) {
    const category = CATALOG[catKey];
    productListContainer.style.display = 'none';
    weightProductListContainer.style.display = 'none';
    portionProductListContainer.style.display = 'block';

    portionProductListContainer.innerHTML = '';

    category.items.forEach(product => {
      const card = document.createElement('div');
      card.className = 'portion-product-card';

      const existingCartItem = cart.find(c => c.id === product.id);
      const selectedPortions = existingCartItem ? existingCartItem.portions : null;
      const config = category.portionConfig;

      card.innerHTML = `
        <div class="portion-product-header">
          <strong>${product.name}</strong>
          ${product.description ? `<span>${product.description}</span>` : ''}
          <span class="portion-pricing-info">
            À partir de ${config.basePrice} DH (${config.min} ${config.unitLabel})
          </span>
        </div>

        <div class="portion-selector">
          <p>Nombre de ${config.unitLabel} :</p>
          <div class="portion-options">
            ${[5, 10, 15, 20, 25, 30].map(num => {
              const isSelected = selectedPortions === num;
              const price = calculatePortionPrice(num, config);
              return `
                <button type="button"
                  class="portion-btn ${isSelected ? 'selected' : ''}"
                  data-portions="${num}"
                  data-id="${product.id}">
                  <span class="portion-number">${num}</span>
                  <span class="portion-price">${formatPrice(price, product.surDevis)}</span>
                </button>
              `;
            }).join('')}
          </div>

          ${product.surDevis ? `
          <div class="devis-notice">
            <span>⚠️ Ce produit nécessite un devis personnalisé</span>
          </div>
          ` : ''}

          ${selectedPortions ? `
          <div class="portion-actions">
            <button type="button" class="btn-remove-portion" data-id="${product.id}">
              Retirer du panier
            </button>
          </div>
          ` : ''}
        </div>
      `;

      portionProductListContainer.appendChild(card);
    });

    attachPortionProductListeners(catKey);
  }

  function calculatePortionPrice(portions, config) {
    const additionalBlocks = Math.max(0, Math.ceil((portions - config.min) / config.step));
    return config.basePrice + (additionalBlocks * config.incrementPrice);
  }

  function attachPortionProductListeners(catKey) {
    portionProductListContainer.querySelectorAll('.portion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const portions = parseInt(e.currentTarget.getAttribute('data-portions'));
        const product = ITEMS_DICT[id];

        // Remove existing
        const existing = cart.find(c => c.id === id);
        if (existing) {
          removeFromCart(existing.cartId);
        }

        // Add new
        addToCart({
          id: product.id,
          name: product.name,
          portions: portions,
          surDevis: product.surDevis,
          categoryKey: catKey,
          pricingType: PRICING_TYPES.PORTION
        });

        renderPortionBasedProducts(catKey);
      });
    });

    portionProductListContainer.querySelectorAll('.btn-remove-portion').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const existing = cart.find(c => c.id === id);
        if (existing) {
          removeFromCart(existing.cartId);
          renderPortionBasedProducts(catKey);
        }
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
          details = ` — ${formatWeight(item.weight)}`;
        } else if (item.pricingType === PRICING_TYPES.PORTION) {
          details = ` — ${item.portions} personnes`;
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
          msg += `• ${item.name}\n`;
          msg += `  └ ${formatWeight(item.weight)} @ ${pricePerKg} DH/kg = ${price} DH\n`;
          fixedTotal += price;

        } else if (item.pricingType === PRICING_TYPES.PORTION) {
          const config = CATALOG[item.categoryKey].portionConfig;
          msg += `• ${item.name}\n`;
          msg += `  └ ${item.portions} personnes\n`;
          if (item.surDevis) {
            msg += `  └ 💰 *SUR DEVIS* (à confirmer)\n`;
          } else {
            msg += `  └ ${price} DH\n`;
            fixedTotal += price;
          }

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
        msg += `   - ${item.name} (${item.portions} personnes)\n`;
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

})();
