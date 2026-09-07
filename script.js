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

  async function apiRequest(path, options = {}) {
    const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    return response.json();
  }

  if (searchTabs.length) {
    searchTabs.forEach((tab) => tab.addEventListener('click', () => {
      searchTabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      if (searchFeedback) searchFeedback.textContent = '';
    }));
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const activeTab = document.querySelector('.search-tab.active');
      const mode = activeTab ? activeTab.dataset.mode.toLowerCase() : 'acheter';
      const locationInput = searchForm.querySelector('input');
      const location = (locationInput ? locationInput.value.trim() : '') || 'toute la France';
      if (searchFeedback) searchFeedback.textContent = `Voici les biens ${mode} disponibles pour ${location}.`;
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

    grid.innerHTML = properties.map((property, index) => {
      const image = property.imageClass || property.image_class || `image-${(index % 3) + 1}`;
      const name = escapeHtml(property.name);
      const location = escapeHtml(property.location);
      const price = escapeHtml(property.price);
      const type = escapeHtml(property.type || 'Maison');
      const hasTour = property.tour === true || Boolean(property.tourUrl);
      const tourBtn = hasTour ? `<button class="tour-trigger" type="button" aria-label="Explore ${name} in 3D"><span aria-hidden="true">◉</span> EXPLORE IN 3D</button>` : '';
      return `<article class="property-card" data-id="${property.id || ''}" data-type="${type}" data-property="${name}" data-location="${location}" data-coordinates="${escapeHtml(property.coordinates || '2.3522,48.8566')}" data-price="${price}"><div class="property-image ${image}"><span>À vendre</span><button class="property-favorite" type="button" aria-label="Ajouter ${name} aux favoris" aria-pressed="false">♡</button></div><div class="property-info"><p>${type} · ${location}</p><h3>${name}</h3><strong>${price}</strong><div class="property-meta"><span>${property.rooms || 4} pièces</span><span>${property.area || 120} m²</span><span>${property.bedrooms || 3} chambres</span></div><div class="property-actions">${tourBtn}<button class="map-trigger" type="button"><span aria-hidden="true">◈</span> Carte</button><button class="cart-add" type="button"><span aria-hidden="true">+</span> Réserver</button></div></div></article>`;
    }).join('');
  }

  function filterListings() {
    const searchInput = searchForm ? searchForm.querySelector('input') : document.querySelector('.search-form input');
    const searchSelect = searchForm ? searchForm.querySelector('select') : document.querySelector('.search-form select');
    if (!searchInput || !searchSelect) return;

    const query = searchInput.value.trim().toLowerCase();
    const selectedType = searchSelect.value.toLowerCase().trim();
    const cleanType = selectedType.replace(/^(un|une)\s+/i, '').trim();
    const cards = [...document.querySelectorAll('.property-card')];
    let visibleCount = 0;

    cards.forEach((card) => {
      const cardType = (card.dataset.type || '').toLowerCase();
      const cardName = (card.dataset.property || '').toLowerCase();
      const cardLoc = (card.dataset.location || '').toLowerCase();
      const matchesLocation = !query || `${cardName} ${cardLoc}`.includes(query);
      const matchesType = !selectedType || selectedType.includes('tous') || cardType.includes(cleanType) || cleanType.includes(cardType);
      const visible = matchesLocation && matchesType;
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
      if (sort === 'price-low' || sort === 'price-high') {
        const difference = priceInMillions(first.dataset.price) - priceInMillions(second.dataset.price);
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
      if (!favorite) return;
      favorite.addEventListener('click', () => {
        const isFavorite = favorite.getAttribute('aria-pressed') === 'true';
        favorite.setAttribute('aria-pressed', String(!isFavorite));
        favorite.textContent = isFavorite ? '♡' : '♥';
      });
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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mapModal && mapModal.classList.contains('open')) closeMap();
    if (event.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) toggleCart(false);
  });
})();
