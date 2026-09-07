(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  function googleTranslateElementInit() {
    if (typeof google === 'undefined' || !google.translate || !google.translate.TranslateElement) return;

    new google.translate.TranslateElement({
      pageLanguage: 'fr',
      includedLanguages: 'af,ar,bg,ca,cs,da,de,el,en,es,et,fa,fi,fr,he,hi,hr,hu,id,it,ja,ko,lt,lv,nl,no,pl,pt,ro,ru,sk,sl,sr,sv,sw,th,tr,uk,ur,vi,zh-CN,zh-TW',
      autoDisplay: false,
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    }, 'google_translate_element');
  }

  window.googleTranslateElementInit = googleTranslateElementInit;

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const searchForm = document.querySelector('.search-form');
  const searchTabs = document.querySelectorAll('.search-tab');
  const searchFeedback = document.querySelector('.search-feedback');
  let currentPropertiesList = [];

  async function apiRequest(path, options = {}) {
    const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    return response.json();
  }

  function getActiveMode() {
    const activeTab = document.querySelector('.search-tab.active');
    return activeTab ? activeTab.dataset.mode.toLowerCase() : 'acheter';
  }

  if (searchTabs.length) {
    searchTabs.forEach((tab) => tab.addEventListener('click', () => {
      if (tab.classList.contains('search-tab-link')) return;
      searchTabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      if (searchFeedback) searchFeedback.textContent = '';
      updateCatalogDisplayMode();
      filterListings();
    }));
  }

  // Advanced search filters toggle
  const btnToggleFilters = document.querySelector('.btn-toggle-filters');
  const advancedFiltersPanel = document.querySelector('.advanced-filters');
  const btnResetFilters = document.querySelector('.btn-reset-filters');

  if (btnToggleFilters && advancedFiltersPanel) {
    btnToggleFilters.addEventListener('click', () => {
      const isHidden = advancedFiltersPanel.hidden;
      advancedFiltersPanel.hidden = !isHidden;
      btnToggleFilters.setAttribute('aria-expanded', String(!isHidden));
      btnToggleFilters.innerHTML = !isHidden 
        ? '<span class="filter-icon">⚙</span> Masquer les filtres' 
        : '<span class="filter-icon">⚙</span> Filtres avancés (DPE, 3D, Atouts...)';
    });
  }

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      const maxPrice = document.querySelector('#filter-max-price');
      const minSurface = document.querySelector('#filter-min-surface');
      const dpe = document.querySelector('#filter-dpe');
      const chkTour = document.querySelector('#chk-tour-only');
      const chkFavoriz = document.querySelector('#chk-favoriz-only');
      const searchInput = searchForm?.querySelector('input');
      const searchSelect = searchForm?.querySelector('select');

      if (maxPrice) maxPrice.value = '';
      if (minSurface) minSurface.value = '';
      if (dpe) dpe.value = '';
      if (chkTour) chkTour.checked = false;
      if (chkFavoriz) chkFavoriz.checked = false;
      if (searchInput) searchInput.value = '';
      if (searchSelect) searchSelect.value = '';

      filterListings();
    });
  }

  ['#filter-max-price', '#filter-min-surface', '#filter-dpe', '#chk-tour-only', '#chk-favoriz-only'].forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) el.addEventListener('change', filterListings);
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const mode = getActiveMode();
      const locationInput = searchForm.querySelector('input');
      const location = (locationInput ? locationInput.value.trim() : '') || 'toute la France';
      if (searchFeedback) searchFeedback.textContent = `Voici les biens en ${mode === 'louer' ? 'location' : 'vente'} disponibles pour "${location}".`;
      filterListings();
    });
  }

  async function syncPublicContent() {
    let content;
    try {
      content = await apiRequest('/api/content/homepage');
    } catch (error) {
      try { content = JSON.parse(localStorage.getItem('laforet-admin-content') || '{}'); } catch (storageError) { content = {}; }
    }

    const heroTitle = document.querySelector('.hero h1');
    const heroIntro = document.querySelector('.hero-intro');
    if (content.title && heroTitle) heroTitle.textContent = content.title;
    if (content.intro && heroIntro) heroIntro.textContent = content.intro;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\'\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function parseNumericPrice(priceStr) {
    if (!priceStr) return 0;
    const clean = String(priceStr).replace(/\s/g, '').replace(',', '.');
    const num = Number.parseFloat(clean);
    if (isNaN(num)) return 0;
    return clean.includes('M€') ? Math.round(num * 1000000) : Math.round(num);
  }

  function updateCatalogDisplayMode() {
    const mode = getActiveMode();
    const isRent = mode === 'louer';
    document.querySelectorAll('.property-card').forEach((card) => {
      const statusBadge = card.querySelector('.property-image > span');
      const priceElement = card.querySelector('.property-info > strong');
      if (statusBadge) statusBadge.textContent = isRent ? 'À louer' : 'À vendre';
      if (priceElement) {
        priceElement.textContent = isRent ? card.dataset.rentPrice || '12 500 € / mois' : card.dataset.price;
      }
    });
  }

  async function syncPublicCatalog() {
    const grid = document.querySelector('.property-grid');
    if (!grid) return;

    let properties = null;
    try {
      properties = await apiRequest('/api/properties?status=published');
    } catch (error) {
      try {
        const storedProperties = JSON.parse(localStorage.getItem('laforet-admin-properties') || '[]');
        if (Array.isArray(storedProperties) && storedProperties.length) properties = storedProperties.filter((property) => property.status === 'published');
      } catch (storageError) {
        properties = null;
      }
    }

    if (!properties) return;
    currentPropertiesList = properties;

    const isRent = getActiveMode() === 'louer';

    grid.innerHTML = properties.map((property, index) => {
      const image = property.imageClass || property.image_class || `image-${(index % 3) + 1}`;
      const name = escapeHtml(property.name);
      const location = escapeHtml(property.location);
      const price = escapeHtml(property.price);
      const rentPrice = escapeHtml(property.rent_price || '12 500 € / mois');
      const type = escapeHtml(property.type || 'Maison');
      const dpe = escapeHtml(property.dpe || 'B');
      const favoriz = Boolean(property.favoriz);
      const numericPrice = parseNumericPrice(price);
      const area = property.area || 120;
      const rooms = property.rooms || 4;
      const bedrooms = property.bedrooms || 3;
      const hasTour = property.tour === true || Boolean(property.tourUrl);
      const tourBtn = hasTour ? `<button class="tour-trigger" type="button" aria-label="Explore ${name} in 3D"><span aria-hidden="true">◉</span> EXPLORE IN 3D</button>` : '';

      return `
        <article class="property-card" 
          data-id="${property.id || index + 1}" 
          data-type="${type}" 
          data-property="${name}" 
          data-location="${location}" 
          data-coordinates="${escapeHtml(property.coordinates || '2.3522,48.8566')}" 
          data-price="${price}"
          data-numeric-price="${numericPrice}"
          data-rent-price="${rentPrice}"
          data-area="${area}"
          data-rooms="${rooms}"
          data-dpe="${dpe}"
          data-favoriz="${favoriz}"
          data-has-tour="${hasTour}">
          <div class="property-image ${image}">
            <span>${isRent ? 'À louer' : 'À vendre'}</span>
            <button class="property-favorite" type="button" aria-label="Ajouter ${name} aux favoris" aria-pressed="false">♡</button>
          </div>
          <div class="property-info">
            <div class="property-badges-row">
              ${favoriz ? '<span class="favoriz-badge">★ Mandat Favoriz</span>' : ''}
              <span class="dpe-pill dpe-${dpe.toLowerCase()}">DPE ${dpe}</span>
            </div>
            <p>${type} · ${location}</p>
            <h3>${name}</h3>
            <strong>${isRent ? rentPrice : price}</strong>
            <div class="property-meta">
              <span>${rooms} pièces</span>
              <span>${area} m²</span>
              <span>${bedrooms} chambres</span>
            </div>
            <div class="property-actions">
              ${tourBtn}
              <button class="map-trigger" type="button"><span aria-hidden="true">◈</span> Carte</button>
              <button class="btn-simulate-card" type="button" data-price="${numericPrice}"><span aria-hidden="true">€</span> Simuler</button>
              <button class="cart-add" type="button"><span aria-hidden="true">+</span> Réserver</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function filterListings() {
    const searchInput = searchForm ? searchForm.querySelector('input') : document.querySelector('.search-form input');
    const searchSelect = searchForm ? searchForm.querySelector('select') : document.querySelector('.search-form select');
    const maxPriceSelect = document.querySelector('#filter-max-price');
    const minSurfaceSelect = document.querySelector('#filter-min-surface');
    const dpeSelect = document.querySelector('#filter-dpe');
    const chkTour = document.querySelector('#chk-tour-only');
    const chkFavoriz = document.querySelector('#chk-favoriz-only');

    const query = (searchInput?.value || '').trim().toLowerCase();
    const selectedType = (searchSelect?.value || '').toLowerCase().trim();
    const cleanType = selectedType.replace(/^(un|une)\s+/i, '').trim();

    const maxPriceVal = maxPriceSelect?.value ? Number(maxPriceSelect.value) : Infinity;
    const minSurfaceVal = minSurfaceSelect?.value ? Number(minSurfaceSelect.value) : 0;
    const selectedDpe = dpeSelect?.value || '';
    const tourOnly = chkTour?.checked || false;
    const favorizOnly = chkFavoriz?.checked || false;

    const cards = [...document.querySelectorAll('.property-card')];
    let visibleCount = 0;

    cards.forEach((card) => {
      const cardType = (card.dataset.type || '').toLowerCase();
      const cardName = (card.dataset.property || '').toLowerCase();
      const cardLoc = (card.dataset.location || '').toLowerCase();
      const cardPrice = Number(card.dataset.numericPrice || 0);
      const cardArea = Number(card.dataset.area || 0);
      const cardDpe = (card.dataset.dpe || '').toUpperCase();
      const cardFavoriz = card.dataset.favoriz === 'true';
      const cardHasTour = card.dataset.hasTour === 'true';

      const matchesLocation = !query || `${cardName} ${cardLoc}`.includes(query);
      const matchesType = !selectedType || selectedType.includes('tous') || cardType.includes(cleanType) || cleanType.includes(cardType);
      const matchesPrice = isNaN(cardPrice) || cardPrice <= maxPriceVal;
      const matchesSurface = cardArea >= minSurfaceVal;

      let matchesDpe = true;
      if (selectedDpe === 'A') matchesDpe = cardDpe === 'A';
      else if (selectedDpe === 'B') matchesDpe = ['A', 'B'].includes(cardDpe);
      else if (selectedDpe === 'C') matchesDpe = ['A', 'B', 'C'].includes(cardDpe);

      const matchesTour = !tourOnly || cardHasTour;
      const matchesFavoriz = !favorizOnly || cardFavoriz;

      const visible = matchesLocation && matchesType && matchesPrice && matchesSurface && matchesDpe && matchesTour && matchesFavoriz;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    const countNode = document.querySelector('.listing-count');
    const emptyState = document.querySelector('.listing-empty');
    if (countNode) countNode.textContent = `${visibleCount} bien${visibleCount > 1 ? 's' : ''}`;
    if (emptyState) emptyState.hidden = visibleCount > 0;
  }

  function priceInMillions(price) {
    const normalizedPrice = String(price).replace(/\s/g, '').replace(',', '.');
    const amount = Number.parseFloat(normalizedPrice);
    return normalizedPrice.includes('M€') ? amount : amount / 1000000;
  }

  function sortListings() {
    const grid = document.querySelector('.property-grid');
    if (!grid) return;

    const sort = document.querySelector('#listing-sort')?.value ?? 'featured';
    const cards = [...grid.querySelectorAll('.property-card')];
    cards.sort((first, second) => {
      if (sort === 'featured') {
        const firstFav = first.dataset.favoriz === 'true' ? 1 : 0;
        const secondFav = second.dataset.favoriz === 'true' ? 1 : 0;
        if (firstFav !== secondFav) return secondFav - firstFav;
        return Number(first.dataset.index || 0) - Number(second.dataset.index || 0);
      }
      if (sort === 'price-low' || sort === 'price-high') {
        const difference = Number(first.dataset.numericPrice || 0) - Number(second.dataset.numericPrice || 0);
        return sort === 'price-low' ? difference : -difference;
      }
      if (sort === 'name') return first.dataset.property.localeCompare(second.dataset.property, 'fr');
      return Number(first.dataset.index || 0) - Number(second.dataset.index || 0);
    });
    cards.forEach((card) => grid.append(card));
  }

  function setupListingControls() {
    const cards = document.querySelectorAll('.property-card');
    if (!cards.length) return;

    cards.forEach((card, index) => {
      card.dataset.index = index;
      const favorite = card.querySelector('.property-favorite');
      if (favorite) {
        favorite.addEventListener('click', () => {
          const isFavorite = favorite.getAttribute('aria-pressed') === 'true';
          favorite.setAttribute('aria-pressed', String(!isFavorite));
          favorite.textContent = isFavorite ? '♡' : '♥';
        });
      }

      const simulateBtn = card.querySelector('.btn-simulate-card');
      if (simulateBtn) {
        simulateBtn.addEventListener('click', () => {
          const price = Number(simulateBtn.dataset.price || card.dataset.numericPrice || 2500000);
          setSimulatorPrice(price);
          const simSection = document.querySelector('#simulateur');
          if (simSection) {
            simSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    });

    const listingSort = document.querySelector('#listing-sort');
    if (listingSort) listingSort.addEventListener('change', sortListings);
  }

  async function initializeListings() {
    await syncPublicContent();
    await syncPublicCatalog();
    setupListingControls();
    filterListings();
  }

  initializeListings();

  const cartDrawer = document.querySelector('.cart-drawer');
  const cartBackdrop = document.querySelector('.cart-backdrop');
  const cartItems = document.querySelector('.cart-items');
  const cartEmpty = document.querySelector('.cart-empty');
  const cartCheckout = document.querySelector('.cart-checkout');
  const cartCount = document.querySelector('.cart-count');
  const cartTotal = document.querySelector('.cart-total-value');
  let cart = [];

  try {
    const storedCart = JSON.parse(localStorage.getItem('laforet-cart') || '[]');
    if (Array.isArray(storedCart)) cart = storedCart;
  } catch (error) {
    localStorage.removeItem('laforet-cart');
  }

  function saveCart() {
    localStorage.setItem('laforet-cart', JSON.stringify(cart));
  }

  function renderCart() {
    if (!cartItems || !cartEmpty || !cartCheckout || !cartCount || !cartTotal) return;

    cartCount.textContent = String(cart.length);
    cartItems.innerHTML = cart.map((item) => `<div class="cart-item"><div class="cart-item-image ${item.image}"></div><div><strong>${item.name}</strong><small>${item.location}</small><b>${item.price}</b></div><button class="cart-remove" type="button" data-remove="${item.id}" aria-label="Retirer ${item.name}">×</button></div>`).join('');
    cartEmpty.hidden = cart.length > 0;
    cartCheckout.hidden = cart.length === 0;
    const total = cart.reduce((sum, item) => sum + priceInMillions(item.price), 0);
    cartTotal.textContent = `${total.toFixed(2).replace('.', ',')} M€`;

    document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => {
      cart = cart.filter((item) => item.id !== button.dataset.remove);
      saveCart();
      renderCart();
    }));
  }

  function toggleCart(isOpen) {
    if (!cartDrawer || !cartBackdrop) return;

    cartDrawer.classList.toggle('open', isOpen);
    cartBackdrop.classList.toggle('open', isOpen);
    cartDrawer.setAttribute('aria-hidden', String(!isOpen));
    const cartButton = document.querySelector('.cart-button');
    if (cartButton) cartButton.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('cart-open', isOpen);
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.cart-add');
    if (!button) return;
      const card = button.closest('.property-card');
      if (!card) return;

      const id = card.dataset.property;
      if (!cart.some((item) => item.id === id)) {
        cart.push({
          id,
          name: card.dataset.property,
          location: card.dataset.location,
          price: card.dataset.price,
          image: card.querySelector('.property-image')?.classList[1] || 'image-one',
        });
      }

      saveCart();
      renderCart();
      toggleCart(true);
      button.classList.add('added');
      button.innerHTML = '<span aria-hidden="true">✓</span> Ajouté';
  });

  const cartButton = document.querySelector('.cart-button');
  if (cartButton) cartButton.addEventListener('click', () => toggleCart(true));
  if (document.querySelector('.cart-close')) document.querySelector('.cart-close').addEventListener('click', () => toggleCart(false));
  if (cartBackdrop) cartBackdrop.addEventListener('click', () => toggleCart(false));

  document.querySelectorAll('input[name="payment"]').forEach((option) => option.addEventListener('change', () => {
    const cardFields = document.querySelector('.card-fields');
    if (cardFields) cardFields.hidden = option.value !== 'card' || !option.checked;
  }));

  const checkoutForm = document.querySelector('.checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = checkoutForm.querySelector('input[type="email"]')?.value.trim();
      const paymentMethod = checkoutForm.querySelector('input[name="payment"]:checked')?.value;
      try {
        await apiRequest('/api/inquiries', { method: 'POST', body: JSON.stringify({ email, paymentMethod, propertyIds: cart.map((item) => item.id) }) });
        checkoutForm.innerHTML = '<div class="checkout-success"><span>✓</span><strong>Demande reçue</strong><p>Un conseiller LaForêt vous recontactera pour confirmer votre réservation et le mode de paiement choisi.</p><button class="checkout-button" type="button">Retour au catalogue</button></div>';
      } catch (error) {
        const message = checkoutForm.querySelector('.checkout-error') || document.createElement('p');
        message.className = 'checkout-error';
        message.textContent = 'Votre demande n’a pas pu être enregistrée. Réessayez dans un instant.';
        checkoutForm.prepend(message);
        return;
      }
      const checkoutButton = document.querySelector('.checkout-success button');
      if (checkoutButton) checkoutButton.addEventListener('click', () => toggleCart(false));
    });
  }

  renderCart();

  const mapModal = document.querySelector('.map-modal');
  const mapCanvas = document.querySelector('.map-canvas');
  const mapTitle = document.querySelector('#map-title');
  const mapLocation = document.querySelector('.map-location');
  let propertyMap;
  let propertyMarker;

  function placePropertyMarker(coordinates) {
    if (!propertyMap || !maplibregl) return;
    if (propertyMarker) propertyMarker.remove();
    propertyMarker = new maplibregl.Marker({ color: '#e4a347' }).setLngLat(coordinates).addTo(propertyMap);
  }

  function closeMap() {
    if (!mapModal) return;
    mapModal.classList.remove('open');
    mapModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  if (mapModal) {
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('.map-trigger');
      if (!trigger) return;
      const card = trigger.closest('.property-card');
      if (!card || !card.dataset.coordinates) return;

      const [longitude, latitude] = card.dataset.coordinates.split(',').map(Number);
      if (mapTitle) mapTitle.textContent = card.dataset.property;
      if (mapLocation) mapLocation.textContent = `${card.dataset.location} · emplacement indicatif`;
      mapModal.classList.add('open');
      mapModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      if (typeof maplibregl === 'undefined') {
        if (mapCanvas) {
          mapCanvas.innerHTML = `<div class="map-fallback"><strong>Carte temporairement indisponible</strong><span>Explorez ${card.dataset.location} avec votre conseiller LaForêt.</span></div>`;
        }
        return;
      }

      if (!propertyMap) {
        propertyMap = new maplibregl.Map({
          container: mapCanvas,
          style: 'https://tiles.openfreemap.org/styles/liberty',
          center: [longitude, latitude],
          zoom: 15.5,
          pitch: 58,
          bearing: -18,
          attributionControl: true,
        });
        propertyMap.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
      } else {
        propertyMap.flyTo({ center: [longitude, latitude], zoom: 15.5, pitch: 58, bearing: -18, duration: 900 });
      }

      if (propertyMap.loaded()) placePropertyMarker([longitude, latitude]);
      else propertyMap.once('load', () => placePropertyMarker([longitude, latitude]));
      window.setTimeout(() => propertyMap.resize(), 150);
    });

    const mapClose = document.querySelector('.map-close');
    const mapBackdrop = document.querySelector('.map-backdrop');
    if (mapClose) mapClose.addEventListener('click', closeMap);
    if (mapBackdrop) mapBackdrop.addEventListener('click', closeMap);
  }

  // -------------------------------------------------------------
  // SIMULATEUR DE CRÉDIT IMMOBILIER (Loan & Mortgage Calculator)
  // -------------------------------------------------------------
  let mortgageRates = { 10: 3.15, 15: 3.30, 20: 3.45, 25: 3.60 };
  let selectedYears = 20;

  async function initMortgageRates() {
    try {
      const data = await apiRequest('/api/mortgage-rates');
      if (data && data.rates) {
        mortgageRates = data.rates;
        const rateInput = document.querySelector('#calc-rate');
        if (rateInput && mortgageRates[selectedYears]) {
          rateInput.value = mortgageRates[selectedYears];
        }
      }
    } catch (err) {
      // Use defaults
    }
    calculateMortgage();
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  }

  function setSimulatorPrice(price) {
    const priceInput = document.querySelector('#calc-price');
    const depositInput = document.querySelector('#calc-deposit');
    if (priceInput) priceInput.value = Math.round(price);
    if (depositInput) depositInput.value = Math.round(price * 0.2); // 20% standard deposit
    calculateMortgage();
  }

  function calculateMortgage() {
    const priceInput = document.querySelector('#calc-price');
    const depositInput = document.querySelector('#calc-deposit');
    const rateInput = document.querySelector('#calc-rate');
    const insuranceInput = document.querySelector('#calc-insurance');

    if (!priceInput || !depositInput || !rateInput) return;

    const propertyPrice = Math.max(0, Number(priceInput.value) || 0);
    const deposit = Math.max(0, Number(depositInput.value) || 0);
    const annualInterestRate = Math.max(0, Number(rateInput.value) || 0);
    const annualInsuranceRate = Math.max(0, Number(insuranceInput?.value) || 0.35);

    const borrowed = Math.max(0, propertyPrice - deposit);
    const months = selectedYears * 12;

    let monthlyPaymentWithoutInsurance = 0;
    if (borrowed > 0 && months > 0) {
      if (annualInterestRate > 0) {
        const monthlyRate = (annualInterestRate / 100) / 12;
        monthlyPaymentWithoutInsurance = borrowed * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)));
      } else {
        monthlyPaymentWithoutInsurance = borrowed / months;
      }
    }

    const monthlyInsurance = (borrowed * (annualInsuranceRate / 100)) / 12;
    const totalMonthlyPayment = Math.round(monthlyPaymentWithoutInsurance + monthlyInsurance);
    const totalInterests = Math.max(0, Math.round((monthlyPaymentWithoutInsurance * months) - borrowed));
    const totalInsurance = Math.max(0, Math.round(monthlyInsurance * months));
    const notaryFees = Math.round(propertyPrice * 0.075); // French notary fees ~7.5% for luxury older estates

    const outMonthly = document.querySelector('#out-monthly');
    const outBorrowed = document.querySelector('#out-borrowed');
    const outInterest = document.querySelector('#out-interest');
    const outTotalInsurance = document.querySelector('#out-total-insurance');
    const outNotary = document.querySelector('#out-notary');

    if (outMonthly) outMonthly.textContent = `${totalMonthlyPayment.toLocaleString('fr-FR')} € / mois`;
    if (outBorrowed) outBorrowed.textContent = formatCurrency(borrowed);
    if (outInterest) outInterest.textContent = formatCurrency(totalInterests);
    if (outTotalInsurance) outTotalInsurance.textContent = formatCurrency(totalInsurance);
    if (outNotary) outNotary.textContent = formatCurrency(notaryFees);
  }

  const durationBtns = document.querySelectorAll('.btn-duration');
  if (durationBtns.length) {
    durationBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        durationBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedYears = Number(btn.dataset.years) || 20;

        const rateInput = document.querySelector('#calc-rate');
        if (rateInput && mortgageRates[selectedYears]) {
          rateInput.value = mortgageRates[selectedYears];
        }
        calculateMortgage();
      });
    });
  }

  ['#calc-price', '#calc-deposit', '#calc-rate', '#calc-insurance'].forEach((selector) => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener('input', calculateMortgage);
      el.addEventListener('change', calculateMortgage);
    }
  });

  initMortgageRates();

  // -------------------------------------------------------------
  // OUTIL D'ESTIMATION EN LIGNE (Multi-Step Online Valuation)
  // -------------------------------------------------------------
  const estimationForm = document.querySelector('#estimation-form');
  const estimateSteps = document.querySelectorAll('.estimate-step');
  const estimationResult = document.querySelector('#estimation-result');

  function validateStep(stepNum) {
    const currentStep = document.querySelector(`.estimate-step[data-step="${stepNum}"]`);
    if (!currentStep) return true;
    const requiredInputs = currentStep.querySelectorAll('input[required], select[required]');
    for (const input of requiredInputs) {
      if (!input.value.trim()) {
        input.focus();
        return false;
      }
    }
    return true;
  }

  document.querySelectorAll('.btn-next-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const currentStepNum = btn.closest('.estimate-step')?.dataset.step;
      if (currentStepNum && !validateStep(currentStepNum)) return;

      const targetStepNum = btn.dataset.target;
      estimateSteps.forEach((step) => {
        step.hidden = step.dataset.step !== targetStepNum;
      });
    });
  });

  document.querySelectorAll('.btn-prev-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetStepNum = btn.dataset.target;
      estimateSteps.forEach((step) => {
        step.hidden = step.dataset.step !== targetStepNum;
      });
    });
  });

  if (estimationForm) {
    estimationForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(estimationForm);
      const features = formData.getAll('features');

      const payload = {
        propertyType: formData.get('propertyType'),
        city: formData.get('city'),
        postalCode: formData.get('postalCode'),
        surface: Number(formData.get('surface')),
        rooms: Number(formData.get('rooms')),
        bedrooms: Number(formData.get('bedrooms')),
        condition: formData.get('condition'),
        features: features,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
      };

      const submitBtn = estimationForm.querySelector('.btn-calc-estimate');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Calcul de la cote LaForêt en cours...';
      }

      try {
        const result = await apiRequest('/api/estimates', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (result && result.estimate && estimationResult) {
          const { estimate, localAgency } = result;

          const medianEl = estimationResult.querySelector('.val-median');
          const minEl = estimationResult.querySelector('.val-min');
          const maxEl = estimationResult.querySelector('.val-max');
          const m2El = estimationResult.querySelector('.val-m2');

          if (medianEl) medianEl.textContent = formatCurrency(estimate.median);
          if (minEl) minEl.textContent = formatCurrency(estimate.low);
          if (maxEl) maxEl.textContent = formatCurrency(estimate.high);
          if (m2El) m2El.textContent = `${estimate.pricePerM2.toLocaleString('fr-FR')} € / m²`;

          if (localAgency) {
            const agName = estimationResult.querySelector('.agency-name');
            const agAddr = estimationResult.querySelector('.agency-address');
            const agDir = estimationResult.querySelector('.agency-director');
            const agPhone = estimationResult.querySelector('.agency-phone-link');

            if (agName) agName.textContent = localAgency.name;
            if (agAddr) agAddr.textContent = `${localAgency.address}, ${localAgency.postalCode} ${localAgency.city}`;
            if (agDir) agDir.textContent = localAgency.director;
            if (agPhone) {
              agPhone.textContent = `📞 ${localAgency.phone}`;
              agPhone.href = `tel:${localAgency.phone.replace(/\s+/g, '')}`;
            }
          }

          estimationResult.hidden = false;
          estimationResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (err) {
        alert('Une erreur est survenue lors du calcul. Veuillez réessayer.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }

  // -------------------------------------------------------------
  // RÉSEAU D'AGENCES LAFORÊT (Agency Directory & Region Filter)
  // -------------------------------------------------------------
  let allAgencies = [];
  let selectedRegion = 'all';

  async function loadAgencies() {
    try {
      allAgencies = await apiRequest('/api/agencies');
    } catch (err) {
      allAgencies = [];
    }
    renderAgencies();
  }

  function renderAgencies() {
    const directoryGrid = document.querySelector('#agencies-directory');
    const searchInput = document.querySelector('#agency-search-input');
    if (!directoryGrid) return;

    const query = (searchInput?.value || '').trim().toLowerCase();

    const filtered = allAgencies.filter((agency) => {
      const matchesRegion = selectedRegion === 'all' || agency.region === selectedRegion;
      const matchesQuery = !query || 
        agency.name.toLowerCase().includes(query) || 
        agency.city.toLowerCase().includes(query) || 
        agency.postalCode.includes(query) ||
        agency.director.toLowerCase().includes(query);
      return matchesRegion && matchesQuery;
    });

    if (!filtered.length) {
      directoryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 8px; border: 1px solid var(--line);">
          <p style="font-size: 16px; color: var(--forest); font-weight: 600; margin-bottom: 8px;">Aucune agence trouvée pour votre recherche.</p>
          <p style="font-size: 13px; color: #777;">Essayez un autre mot-clé ou sélectionnez "Toutes les agences".</p>
        </div>
      `;
      return;
    }

    directoryGrid.innerHTML = filtered.map((agency) => {
      const tags = (agency.services || []).map((s) => `<span class="agency-tag">${escapeHtml(s)}</span>`).join('');
      return `
        <article class="agency-card">
          <div>
            <div class="agency-card-top">
              <span class="agency-card-badge">${escapeHtml(agency.region)}</span>
              <span class="agency-rating-score">★ ${agency.rating} <small style="color: #888;">(${agency.reviews})</small></span>
            </div>
            <h3>${escapeHtml(agency.name)}</h3>
            <p class="agency-card-addr">📍 ${escapeHtml(agency.address)}<br/>${agency.postalCode} ${escapeHtml(agency.city)}</p>
            <div class="agency-card-meta">
              <span><strong>Directeur :</strong> ${escapeHtml(agency.director)}</span>
              <span><strong>Horaires :</strong> ${escapeHtml(agency.hours)}</span>
            </div>
            <div class="agency-services-tags">${tags}</div>
          </div>
          <div class="agency-card-actions">
            <a class="agency-btn-call" href="tel:${agency.phone.replace(/\s+/g, '')}">📞 ${agency.phone}</a>
            <button class="agency-btn-appointment trigger-alert-modal" type="button" data-location="${escapeHtml(agency.city)}">Prendre RDV</button>
          </div>
        </article>
      `;
    }).join('');
  }

  const regionChips = document.querySelectorAll('.btn-region-chip');
  if (regionChips.length) {
    regionChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        regionChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        selectedRegion = chip.dataset.region || 'all';
        renderAgencies();
      });
    });
  }

  const agencySearchInput = document.querySelector('#agency-search-input');
  if (agencySearchInput) {
    agencySearchInput.addEventListener('input', renderAgencies);
  }

  loadAgencies();

  // -------------------------------------------------------------
  // MODALE D'ALERTE LAFORÊT (Property Alert Subscription)
  // -------------------------------------------------------------
  const alertModal = document.querySelector('#alert-modal');
  const alertForm = document.querySelector('#alert-form');
  const alertFeedback = document.querySelector('.alert-feedback');

  function openAlertModal(presetLocation = '') {
    if (!alertModal) return;
    if (presetLocation && alertForm) {
      const locInput = alertForm.querySelector('input[name="location"]');
      if (locInput) locInput.value = presetLocation;
    }
    alertModal.classList.add('open');
    alertModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeAlertModal() {
    if (!alertModal) return;
    alertModal.classList.remove('open');
    alertModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (alertFeedback) {
      alertFeedback.textContent = '';
      alertFeedback.className = 'alert-feedback';
    }
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.trigger-alert-modal, .btn-open-alert');
    if (trigger) {
      event.preventDefault();
      const presetLoc = trigger.dataset.location || '';
      openAlertModal(presetLoc);
    }
  });

  const alertClose = document.querySelector('.alert-close');
  const alertBackdrop = document.querySelector('.alert-backdrop');
  if (alertClose) alertClose.addEventListener('click', closeAlertModal);
  if (alertBackdrop) alertBackdrop.addEventListener('click', closeAlertModal);

  if (alertForm) {
    alertForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(alertForm);
      const payload = {
        email: formData.get('email'),
        phone: formData.get('phone'),
        projectType: formData.get('projectType'),
        propertyType: formData.get('propertyType'),
        location: formData.get('location'),
        maxBudget: formData.get('maxBudget'),
      };

      const submitBtn = alertForm.querySelector('.btn-submit-alert');
      if (submitBtn) submitBtn.disabled = true;

      try {
        await apiRequest('/api/alerts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (alertFeedback) {
          alertFeedback.className = 'alert-feedback success';
          alertFeedback.textContent = '✓ Votre alerte LaForêt a été enregistrée avec succès ! Vous recevrez nos opportunités en avant-première.';
        }
        alertForm.reset();
        setTimeout(() => closeAlertModal(), 2800);
      } catch (err) {
        if (alertFeedback) {
          alertFeedback.className = 'alert-feedback error';
          alertFeedback.textContent = 'Erreur lors de l’enregistrement de l’alerte. Veuillez vérifier vos données.';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mapModal && mapModal.classList.contains('open')) closeMap();
    if (event.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) toggleCart(false);
    if (event.key === 'Escape' && alertModal && alertModal.classList.contains('open')) closeAlertModal();
  });
})();

