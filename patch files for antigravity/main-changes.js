/* ═══════════════════════════════════════════════════════════
   Lartica Bakehouse — PATCH FILE
   Drop these functions into main.js, replacing the old ones.
   Also update the CATALOG 'special' items as shown at top.
   ═══════════════════════════════════════════════════════════ */

// ─── 1. CATALOG PATCH ────────────────────────────────────
// In your CATALOG object, replace the 'special' items array with:
/*
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
*/

// ─── 2. CONSTANTS (add near top of IIFE, before CATALOG) ─
const WEIGHT_STOPS_G = [250, 500, 750, 1000, 1500, 2000];
const WEIGHT_LABELS  = ['250g', '500g', '750g', '1 kg', '1.5 kg', '2 kg', 'Sur mesure'];
const EVENT_PERSON_STOPS  = [5, 10, 15, 20, 25, 30];
const EVENT_PERSON_LABELS = ['5', '10', '15', '20', '25', '30', 'Plus'];


// ─── 3. UNIT-BASED RENDERER ───────────────────────────────
// Replaces old renderUnitBasedProducts.
// ALL items get the stepper — no isPlaceholder special case.
// Placeholder items just show "—" and "0 DH" until you fill them in.

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
      // Update just the count span — no full re-render needed
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


// ─── 4. WEIGHT SLIDER (Classiques Marocains) ─────────────
// Replaces old renderWeightBasedProducts + attachWeightProductListeners.

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


// ─── 5. SPECIAL ITEMS (Mariage + Événements) ─────────────
// Replaces old renderPortionBasedProducts + attachPortionProductListeners.

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


// ─── 6. UPDATED calculateItemPrice ───────────────────────
// Add this AFTER the CATALOG definition, replacing the old one.

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


// ─── 7. UPDATED WhatsApp message snippet ─────────────────
// Inside handleCheckoutSubmit, replace the items.forEach loop with:
/*
items.forEach(item => {
  const price = calculateItemPrice(item);

  if (item.pricingType === PRICING_TYPES.WEIGHT) {
    const pkgStr = (item.pricePerKg || CATALOG[item.categoryKey].defaultPricePerKg) + ' DH/kg';
    msg += `• ${item.name}\n`;
    msg += `  └ ${formatWeight(item.weight)} @ ${pkgStr} = ${price} DH\n`;
    fixedTotal += price;

  } else if (item.uiType === 'marriage') {
    msg += `• ${item.name}\n`;
    msg += `  └ 👥 ${item.persons || '?'} invités\n`;
    msg += `  └ 💰 SUR DEVIS — tarif à confirmer\n`;

  } else if (item.uiType === 'events') {
    msg += `• ${item.name}\n`;
    msg += `  └ 👥 ${item.persons || '?'} personnes\n`;
    msg += `  └ 💰 SUR DEVIS — tarif selon création\n`;

  } else if (item.surDevis) {
    msg += `• ${item.name} — SUR DEVIS\n`;

  } else {
    msg += `• ${item.name}`;
    if (item.quantity > 1) msg += ` × ${item.quantity}`;
    msg += ` = ${price} DH\n`;
    fixedTotal += price;
  }
});
*/


// ─── 8. UPDATED renderCartItemsList snippet ───────────────
// Inside renderCartItemsList, in the details block, replace:
/*
  if (item.pricingType === PRICING_TYPES.WEIGHT) {
    details = ` — ${formatWeight(item.weight)}`;
  } else if (item.uiType === 'marriage' || item.uiType === 'events') {
    details = ` — ${item.persons || '?'} personnes`;
  } else if (item.quantity > 1) {
    details = ` × ${item.quantity}`;
  }
*/
