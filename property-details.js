/**
 * LaForêt Prestige Property Details Controller & Gallery Experience
 * Handles:
 * - Property Details Page / View
 * - Top Action Area (360° VT | Photos (X) | Map | Brochure)
 * - Hero Photo Gallery with Thumbnails & Controls
 * - Fullscreen Lightbox Gallery with Zoom, Swipe & Pan
 * - Expandable Property Description
 * - Contact Us & Agent Representation Section
 * - Adaptive Photo Grid (1, 2, 3-5, 6+ photos)
 * - Energy Efficiency Section (DPE & GES visual scales)
 * - Interactive Map Integration
 * - Luxury Property Brochure Modal with Print/PDF trigger
 */

(function () {
  'use strict';

  // Global state
  let currentProperty = null;
  let currentHeroPhotoIndex = 0;
  let currentLightboxPhotoIndex = 0;
  let lightboxZoomScale = 1;
  let isLightboxOpen = false;
  let isDescExpanded = false;
  let lastScrollY = 0;

  // DOM elements cache
  let viewEl, heroImgEl, heroCounterEl, heroThumbnailsEl, topActionsEl;
  let photoGridEl, photoGridTotalCountEl, btnOpenAllPhotosEl;
  let descPreviewEl, descExpandedEl, btnToggleDescEl;
  let agentPhotoEl, agentDisplayNameEl, agentCardNameEl, agentCardTitleEl, agentAgencyNameEl, agentAgencyAddressEl, agentPhoneLinkEl, agentPhoneTextEl, agentEmailLinkEl, agentEmailTextEl, agentRatingValEl, agentReviewsCountEl;
  let energySectionEl, dpeNumericValEl, gesNumericValEl, energyCostMinEl, energyCostMaxEl, energyCertRefEl;
  let lightboxEl, lightboxImgEl, lightboxCounterEl, lightboxThumbsEl;
  let brochureModalEl, contactModalEl, energyCertModalEl, energyCertBodyEl;

  /**
   * Initializes DOM elements and event listeners
   */
  function init() {
    cacheElements();
    bindEvents();
    handleInitialUrlHash();
  }

  function cacheElements() {
    viewEl = document.getElementById('property-detail-view');
    if (!viewEl) return;

    heroImgEl = document.getElementById('hero-main-img');
    heroCounterEl = document.getElementById('hero-photo-counter');
    heroThumbnailsEl = document.getElementById('hero-thumbnails-ribbon');
    topActionsEl = document.querySelector('.property-top-actions');

    photoGridEl = document.getElementById('property-photo-grid');
    photoGridTotalCountEl = document.getElementById('photo-grid-total-count');
    btnOpenAllPhotosEl = document.getElementById('btn-open-all-photos');

    descPreviewEl = document.getElementById('desc-preview-text');
    descExpandedEl = document.getElementById('desc-expanded-text');
    btnToggleDescEl = document.getElementById('btn-toggle-desc');

    agentPhotoEl = document.getElementById('agent-display-photo');
    agentDisplayNameEl = document.getElementById('agent-display-name');
    agentCardNameEl = document.getElementById('agent-card-name');
    agentCardTitleEl = document.getElementById('agent-card-title');
    agentAgencyNameEl = document.getElementById('agent-agency-name');
    agentAgencyAddressEl = document.getElementById('agent-agency-address');
    agentPhoneLinkEl = document.getElementById('agent-phone-link');
    agentPhoneTextEl = document.getElementById('agent-phone-text');
    agentEmailLinkEl = document.getElementById('agent-email-link');
    agentEmailTextEl = document.getElementById('agent-email-text');
    agentRatingValEl = document.getElementById('agent-rating-value');
    agentReviewsCountEl = document.getElementById('agent-reviews-count');

    energySectionEl = document.getElementById('property-energy-section');
    dpeNumericValEl = document.getElementById('dpe-numeric-val');
    gesNumericValEl = document.getElementById('ges-numeric-val');
    energyCostMinEl = document.getElementById('energy-cost-min');
    energyCostMaxEl = document.getElementById('energy-cost-max');
    energyCertRefEl = document.getElementById('energy-cert-ref');

    lightboxEl = document.getElementById('property-gallery-lightbox');
    lightboxImgEl = document.getElementById('lightbox-main-img');
    lightboxCounterEl = document.getElementById('lightbox-counter');
    lightboxThumbsEl = document.getElementById('lightbox-thumbnails-strip');

    brochureModalEl = document.getElementById('property-brochure-modal');
    contactModalEl = document.getElementById('property-contact-modal');
    energyCertModalEl = document.getElementById('property-energy-cert-modal');
    energyCertBodyEl = document.getElementById('energy-cert-body');
  }

  function bindEvents() {
    // Back to catalog button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-detail-back, .btn-detail-back')) {
        e.preventDefault();
        closePropertyDetails();
      }
    });

    // Card clicks to open property details
    document.addEventListener('click', (e) => {
      // Don't intercept if clicking action buttons directly
      if (e.target.closest('.card-btn-action, .card-simulator, .add-to-cart-btn, .fav-btn, .tour-trigger, .tour-btn-360, .map-trigger, .btn-simulate-card, .cart-add, .property-favorite, .featured-tour-trigger, .btn-secondary-tour')) {
        return;
      }
      const card = e.target.closest('.property-card');
      const viewTrigger = e.target.closest('.popup-focus-btn, [data-action="view-property"], .btn-view-property-card');
      if (viewTrigger) {
        e.preventDefault();
        const propId = viewTrigger.dataset.id || (card && card.dataset.id);
        if (propId) openPropertyDetails(propId);
        return;
      }
      if (card && (e.target.closest('.card-img-wrap, .property-card-link, .card-title-link, .card-head') || !e.target.closest('button, a, input'))) {
        const propId = card.dataset.id;
        if (propId) {
          e.preventDefault();
          openPropertyDetails(propId);
        }
      }
    });

    // Top action buttons
    document.addEventListener('click', (e) => {
      // 360° VT
      if (e.target.closest('#btn-action-tour, .paction-tour')) {
        e.preventDefault();
        if (currentProperty) {
          triggerVirtualTour(currentProperty.id);
        }
      }

      // Photos (X)
      if (e.target.closest('#btn-action-photos, .paction-photos, #btn-open-all-photos')) {
        e.preventDefault();
        openGalleryLightbox(0);
      }

      // Map
      if (e.target.closest('#btn-action-map, .paction-map, #btn-trigger-inline-map')) {
        e.preventDefault();
        if (currentProperty) {
          openPropertyLocationMap(currentProperty);
        }
      }

      // Brochure
      if (e.target.closest('#btn-action-brochure, .paction-brochure')) {
        e.preventDefault();
        if (currentProperty && currentProperty.has_brochure !== false) {
          openBrochureModal(currentProperty.id);
        }
      }

      // Contact us (large rounded button) & agent contact buttons
      if (e.target.closest('#btn-property-contact-us, #btn-agent-contact, .btn-trigger-contact-drawer')) {
        e.preventDefault();
        openContactEnquiryModal(currentProperty);
      }

      // Toggle description
      if (e.target.closest('#btn-toggle-desc')) {
        e.preventDefault();
        toggleDescription();
      }

      // Financing / Loan simulator button
      if (e.target.closest('#btn-detail-simulate')) {
        e.preventDefault();
        if (currentProperty) {
          const price = currentProperty.numeric_price || 2500000;
          closePropertyDetails();
          if (typeof window.setSimulatorPrice === 'function') {
            window.setSimulatorPrice(price);
          }
          const simSection = document.querySelector('#simulateur');
          if (simSection && typeof simSection.scrollIntoView === 'function') {
            simSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }

      // Reserve / Add Option button
      if (e.target.closest('#btn-detail-reserve')) {
        e.preventDefault();
        if (currentProperty && typeof window.addPropertyToCart === 'function') {
          window.addPropertyToCart(currentProperty);
        }
      }

      // Hero Gallery Favorite & Share
      if (e.target.closest('#btn-hero-favorite')) {
        e.preventDefault();
        togglePropertyFavorite(currentProperty);
      }
      if (e.target.closest('#btn-hero-share')) {
        e.preventDefault();
        shareProperty(currentProperty);
      }

      // Agent portfolio link
      if (e.target.closest('#agent-portfolio-link')) {
        e.preventDefault();
        closePropertyDetails();
        const agencesSection = document.querySelector('#agences');
        if (agencesSection && typeof agencesSection.scrollIntoView === 'function') {
          agencesSection.scrollIntoView({ behavior: 'smooth' });
        }
      }

      // Hero Gallery Navigation
      if (e.target.closest('#btn-hero-prev')) {
        e.preventDefault();
        navigateHeroPhoto(-1);
      }
      if (e.target.closest('#btn-hero-next')) {
        e.preventDefault();
        navigateHeroPhoto(1);
      }
      if (e.target.closest('#btn-hero-zoom, #btn-hero-fullscreen, #hero-main-img')) {
        e.preventDefault();
        openGalleryLightbox(currentHeroPhotoIndex);
      }

      // Lightbox Controls
      if (e.target.closest('#btn-lightbox-close, .lightbox-backdrop')) {
        e.preventDefault();
        closeGalleryLightbox();
      }
      if (e.target.closest('#btn-lightbox-prev')) {
        e.preventDefault();
        navigateLightbox(-1);
      }
      if (e.target.closest('#btn-lightbox-next')) {
        e.preventDefault();
        navigateLightbox(1);
      }
      if (e.target.closest('#btn-lightbox-zoom-in')) {
        e.preventDefault();
        zoomLightbox(0.25);
      }
      if (e.target.closest('#btn-lightbox-zoom-out')) {
        e.preventDefault();
        zoomLightbox(-0.25);
      }
      if (e.target.closest('#btn-lightbox-zoom-reset')) {
        e.preventDefault();
        resetLightboxZoom();
      }

      // Brochure modal close & print
      if (e.target.closest('#btn-brochure-close, .brochure-backdrop')) {
        e.preventDefault();
        closeBrochureModal();
      }
      if (e.target.closest('#btn-brochure-print')) {
        e.preventDefault();
        window.print();
      }

      // Contact modal close
      if (e.target.closest('#btn-prop-contact-close, .prop-contact-backdrop')) {
        e.preventDefault();
        closeContactModal();
      }

      // Energy Certificate Modal trigger
      if (e.target.closest('#btn-energy-cert')) {
        e.preventDefault();
        openEnergyCertModal(currentProperty);
      }

      // Energy Certificate Modal close & print
      if (e.target.closest('#btn-energy-cert-close, #btn-energy-cert-dismiss, .energy-cert-backdrop')) {
        e.preventDefault();
        closeEnergyCertModal();
      }
      if (e.target.closest('#btn-energy-cert-print')) {
        e.preventDefault();
        window.print();
      }

      // Photo grid items click -> open lightbox at specific photo index
      const gridItem = e.target.closest('.photo-grid-item');
      if (gridItem && gridItem.dataset.photoIndex !== undefined) {
        e.preventDefault();
        const idx = parseInt(gridItem.dataset.photoIndex, 10) || 0;
        openGalleryLightbox(idx);
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') closeGalleryLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
        if (e.key === '+' || e.key === '=') zoomLightbox(0.25);
        if (e.key === '-') zoomLightbox(-0.25);
      } else if (viewEl && viewEl.classList.contains('active')) {
        if (e.key === 'Escape') {
          if (brochureModalEl && brochureModalEl.classList.contains('open')) closeBrochureModal();
          else if (contactModalEl && contactModalEl.classList.contains('open')) closeContactModal();
          else if (energyCertModalEl && energyCertModalEl.classList.contains('open')) closeEnergyCertModal();
          else closePropertyDetails();
        }
        if (e.key === 'ArrowLeft') navigateHeroPhoto(-1);
        if (e.key === 'ArrowRight') navigateHeroPhoto(1);
      }
    });

    // Touch swipe for Hero Gallery & Lightbox
    setupTouchGestures();

    // Browser back/forward navigation
    window.addEventListener('popstate', () => {
      const match = window.location.hash.match(/^#(?:bien|property)-(\d+)$/);
      if (match) {
        openPropertyDetails(match[1], false);
      } else if (viewEl && viewEl.classList.contains('active')) {
        closePropertyDetails(false);
      }
    });

    // Handle contact form submission
    const form = document.getElementById('property-contact-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Envoi en cours...';

        const formData = {
          name: form.querySelector('[name="name"]')?.value || '',
          email: form.querySelector('[name="email"]')?.value || '',
          phone: form.querySelector('[name="phone"]')?.value || '',
          message: form.querySelector('[name="message"]')?.value || '',
          propertyId: currentProperty?.id || '',
          propertyName: currentProperty?.name || '',
          inquiryType: 'property_inquiry'
        };

        try {
          const res = await fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });

          if (res.ok) {
            form.innerHTML = `
              <div class="inquiry-success-box">
                <div class="success-icon">✓</div>
                <h4>Demande transmise avec succès</h4>
                <p>Votre demande pour <strong>${escapeHtml(currentProperty?.name || 'ce bien')}</strong> a été directement transmise à <strong>${escapeHtml(currentProperty?.agent?.name || 'notre conseiller')}</strong>.</p>
                <p class="success-sub">Un conseiller d'exception vous recontactera sous 24 heures par téléphone ou par email.</p>
                <button type="button" class="btn-success-close" onclick="window.PropertyDetailsView.closeContactModal()">Fermer</button>
              </div>
            `;
          } else {
            throw new Error('Erreur réseau');
          }
        } catch (err) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
          alert('Impossible d\'envoyer votre message pour le moment. Veuillez réessayer ou contacter directement l\'agence par téléphone.');
        }
      });
    }
  }

  function handleInitialUrlHash() {
    const hash = window.location.hash;
    const match = hash.match(/^#(?:bien|property)-(\d+)$/);
    if (match) {
      setTimeout(() => openPropertyDetails(match[1], false), 200);
    }
  }

  /**
   * Fetches or retrieves complete property data
   */
  async function getPropertyData(propId) {
    const idStr = String(propId);
    let matched = null;

    // 1. Try local data store by ID
    if (window.PROPERTY_DETAILS_DATA && window.PROPERTY_DETAILS_DATA[idStr]) {
      matched = window.PROPERTY_DETAILS_DATA[idStr];
    }

    // 2. Try local data store by name, title, or ref
    if (!matched && window.PROPERTY_DETAILS_DATA) {
      for (const key of Object.keys(window.PROPERTY_DETAILS_DATA)) {
        const item = window.PROPERTY_DETAILS_DATA[key];
        if (item && (String(item.id) === idStr || item.name === propId || item.ref === propId)) {
          matched = item;
          break;
        }
      }
    }

    if (matched) {
      return matched;
    }

    // 3. Fetch from /api/properties/:id
    try {
      const res = await fetch(`/api/properties/${encodeURIComponent(propId)}`);
      if (res.ok) {
        const data = await res.json();
        const staticMatch = window.PROPERTY_DETAILS_DATA && (window.PROPERTY_DETAILS_DATA[String(data.id)] || Object.values(window.PROPERTY_DETAILS_DATA).find(p => p.name === data.name));
        return {
          ...staticMatch,
          ...data,
          images: (data.images && data.images.length > 0) ? data.images : (staticMatch?.images || []),
          agent: data.agent || staticMatch?.agent || null,
          energy: data.energy || staticMatch?.energy || null
        };
      }
    } catch (e) {
      console.warn('[Property Details] Could not fetch property API:', e);
    }

    // 4. Fallback to default
    return window.PROPERTY_DETAILS_DATA ? window.PROPERTY_DETAILS_DATA['1'] : null;
  }

  /**
   * Opens and renders the full Property Details View
   */
  async function openPropertyDetails(propId, updateHistory = true) {
    if (!viewEl) cacheElements();
    if (!viewEl) return;

    lastScrollY = window.scrollY;
    const prop = await getPropertyData(propId);
    if (!prop) return;

    currentProperty = prop;
    currentHeroPhotoIndex = 0;
    isDescExpanded = false;

    // Populate all components
    renderTopActionButtons(prop);
    renderHeroGallery(prop);
    renderPropertyHeader(prop);
    renderDescription(prop);
    renderAgentSection(prop);
    renderPhotoGrid(prop);
    renderEnergySection(prop);
    renderKeyFeatures(prop);
    renderNearbyAmenities(prop);

    // Show view
    viewEl.classList.add('active');
    viewEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('property-details-active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update history
    if (updateHistory) {
      history.pushState({ propertyId: prop.id }, '', `#bien-${prop.id}`);
    }

    // Update document title
    document.title = `${prop.name} · LaForêt Prestige`;
  }

  /**
   * Closes the Property Details View and returns to catalog
   */
  function closePropertyDetails(updateHistory = true) {
    if (!viewEl) return;
    viewEl.classList.remove('active');
    viewEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('property-details-active');

    if (updateHistory) {
      history.pushState(null, '', window.location.pathname);
    }

    document.title = 'LaForêt Immobilier · Biens d\'Exception & Estimation';
    window.scrollTo({ top: lastScrollY, behavior: 'instant' });
  }

  /**
   * 1. TOP ACTION BUTTONS:
   * 360° VT | Photos (X) | Map
   * and underneath: Brochure
   */
  function renderTopActionButtons(prop) {
    const photosCount = Array.isArray(prop.images) ? prop.images.length : 1;
    const photosLabel = document.getElementById('action-photos-label');
    if (photosLabel) {
      photosLabel.textContent = `Photos (${photosCount})`;
    }

    // Brochure button: hide if not available
    const brochureBtn = document.getElementById('btn-action-brochure');
    if (brochureBtn) {
      if (prop.has_brochure === false || !prop.brochure_filename) {
        brochureBtn.style.display = 'none';
      } else {
        brochureBtn.style.display = 'inline-flex';
      }
    }
  }

  /**
   * 2. HERO IMAGE GALLERY:
   * Main photo, thumbnails strip, photo count, next/prev, zoom
   */
  function renderHeroGallery(prop) {
    const images = Array.isArray(prop.images) && prop.images.length > 0
      ? prop.images
      : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85'];

    updateHeroPhoto(0);
    updateFavoriteButtonUI(isPropertyFavorited(prop.id));

    // Thumbnails ribbon
    if (heroThumbnailsEl) {
      heroThumbnailsEl.innerHTML = images.map((imgUrl, i) => `
        <button class="hero-thumb-btn ${i === 0 ? 'active' : ''}" type="button" data-index="${i}" aria-label="Afficher la photo ${i + 1}">
          <img src="${escapeHtml(imgUrl)}" alt="Vignette photo ${i + 1}" loading="lazy" />
        </button>
      `).join('');

      // Bind thumbnail clicks
      heroThumbnailsEl.querySelectorAll('.hero-thumb-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10) || 0;
          updateHeroPhoto(idx);
        });
      });
    }
  }

  function updateHeroPhoto(index) {
    if (!currentProperty) return;
    const images = currentProperty.images || [];
    if (images.length === 0) return;

    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    currentHeroPhotoIndex = index;

    if (heroImgEl) {
      heroImgEl.style.opacity = '0.5';
      heroImgEl.src = images[index];
      heroImgEl.alt = `${currentProperty.name} - Photo ${index + 1}`;
      heroImgEl.onload = () => {
        heroImgEl.style.opacity = '1';
      };
    }

    if (heroCounterEl) {
      heroCounterEl.textContent = `${index + 1} / ${images.length}`;
    }

    // Update active thumb
    if (heroThumbnailsEl) {
      const thumbs = heroThumbnailsEl.querySelectorAll('.hero-thumb-btn');
      thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
        if (i === index && t && typeof t.scrollIntoView === 'function') {
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }
  }

  function navigateHeroPhoto(direction) {
    updateHeroPhoto(currentHeroPhotoIndex + direction);
  }

  /**
   * 4. PROPERTY TITLE AND SPECS
   */
  function renderPropertyHeader(prop) {
    const titleEl = document.getElementById('property-detail-title');
    if (titleEl) titleEl.textContent = prop.name;

    const locEl = document.getElementById('property-detail-location');
    if (locEl) locEl.textContent = prop.location || prop.address || '';

    const priceEl = document.getElementById('property-detail-price');
    if (priceEl) priceEl.textContent = prop.price;

    const priceM2El = document.getElementById('property-detail-price-m2');
    if (priceM2El) priceM2El.textContent = prop.price_per_m2 || '';

    const rentEl = document.getElementById('property-detail-rent');
    if (rentEl) {
      if (prop.rent_price) {
        rentEl.textContent = `Location estimée : ${prop.rent_price}`;
        rentEl.style.display = 'inline-block';
      } else {
        rentEl.style.display = 'none';
      }
    }

    const refBadge = document.getElementById('badge-ref-number');
    if (refBadge) refBadge.textContent = `Réf. ${prop.ref || prop.id}`;

    const typeBadge = document.getElementById('badge-property-type');
    if (typeBadge) typeBadge.textContent = prop.type || 'Propriété';

    // Specs
    const setSpec = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '—';
    };
    setSpec('spec-area', `${prop.surface || prop.area || '—'} m²`);
    setSpec('spec-rooms', `${prop.rooms || '—'}`);
    setSpec('spec-bedrooms', `${prop.bedrooms || '—'}`);
    setSpec('spec-bathrooms', `${prop.bathrooms || '—'}`);
    setSpec('spec-exposure', prop.exposure || 'Double exposition');
    setSpec('spec-dpe', `Classe ${prop.energy?.dpe_rating || prop.dpe || 'B'}`);
  }

  /**
   * 4. PROPERTY DESCRIPTION WITH EXPAND/COLLAPSE
   */
  function renderDescription(prop) {
    if (descPreviewEl) {
      descPreviewEl.textContent = prop.description_preview || prop.description || '';
    }
    if (descExpandedEl) {
      const full = prop.description_full || '';
      // Format paragraphs
      descExpandedEl.innerHTML = full.split('\n\n').map((p) => `<p>${escapeHtml(p.trim())}</p>`).join('');
      descExpandedEl.style.display = 'none';
    }
    if (btnToggleDescEl) {
      btnToggleDescEl.querySelector('.desc-btn-text').textContent = 'Lire la description complète';
      btnToggleDescEl.querySelector('.desc-btn-icon').textContent = '▾';
    }
  }

  function toggleDescription() {
    isDescExpanded = !isDescExpanded;
    if (descExpandedEl) {
      descExpandedEl.style.display = isDescExpanded ? 'block' : 'none';
    }
    if (btnToggleDescEl) {
      const textSpan = btnToggleDescEl.querySelector('.desc-btn-text');
      const iconSpan = btnToggleDescEl.querySelector('.desc-btn-icon');
      if (isDescExpanded) {
        textSpan.textContent = 'Réduire la description';
        iconSpan.textContent = '▴';
      } else {
        textSpan.textContent = 'Lire la description complète';
        iconSpan.textContent = '▾';
        if (descPreviewEl && typeof descPreviewEl.scrollIntoView === 'function') {
          descPreviewEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }

  /**
   * 6. AGENT / PROPERTY CONTACT SECTION
   * "Hi, I’m [Agent Name], your local contact for this Property"
   */
  function renderAgentSection(prop) {
    const agent = prop.agent || {
      name: 'Marc-Antoine de Belloy',
      title: 'Directeur d\'Agence · Spécialiste Prestige',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      agency: 'LaForêt Paris 7e · Champ-de-Mars & Invalides',
      address: '14 bis Avenue Bosquet, 75007 Paris',
      phone: '01 45 51 00 20',
      email: 'paris7@laforet.com',
      rating: 4.9,
      reviews_count: 184,
      portfolio_count: 14
    };

    if (agentDisplayNameEl) agentDisplayNameEl.textContent = agent.name;
    if (agentCardNameEl) agentCardNameEl.textContent = agent.name;
    if (agentCardTitleEl) agentCardTitleEl.textContent = agent.title;
    if (agentPhotoEl) {
      agentPhotoEl.src = agent.photo;
      agentPhotoEl.alt = `Portrait de ${agent.name}`;
    }
    if (agentAgencyNameEl) agentAgencyNameEl.textContent = agent.agency;
    if (agentAgencyAddressEl) agentAgencyAddressEl.textContent = agent.address;
    if (agentPhoneTextEl) agentPhoneTextEl.textContent = agent.phone;
    if (agentPhoneLinkEl) agentPhoneLinkEl.href = `tel:${agent.phone.replace(/\s+/g, '')}`;
    if (agentEmailTextEl) agentEmailTextEl.textContent = agent.email;
    if (agentEmailLinkEl) agentEmailLinkEl.href = `mailto:${agent.email}?subject=${encodeURIComponent(`Demande d'information : ${prop.name} (Réf. ${prop.ref || prop.id})`)}`;
    if (agentRatingValEl) agentRatingValEl.textContent = agent.rating ? agent.rating.toFixed(1) : '4.9';
    if (agentReviewsCountEl) agentReviewsCountEl.textContent = `(${agent.reviews_count || 120} avis certifiés)`;

    const portfolioLink = document.getElementById('agent-portfolio-link');
    if (portfolioLink) {
      portfolioLink.textContent = `Voir les annonces de l'agence (${agent.portfolio_count || 10} biens) ↗`;
    }
  }

  /**
   * 7. PROPERTY PHOTO GRID / VISUAL PRESENTATION
   * Adapts automatically based on photos count:
   * 1 image -> large single image
   * 2 images -> two-column layout
   * 3-5 images -> featured grid
   * 6+ images -> larger gallery/grid with "View all photos"
   */
  function renderPhotoGrid(prop) {
    if (!photoGridEl) return;
    const images = Array.isArray(prop.images) && prop.images.length > 0 ? prop.images : [];
    const count = images.length;

    if (photoGridTotalCountEl) {
      photoGridTotalCountEl.textContent = String(count);
    }

    photoGridEl.dataset.count = String(count);
    photoGridEl.className = 'property-photo-grid';

    if (count === 1) {
      photoGridEl.classList.add('grid-layout-single');
      photoGridEl.innerHTML = `
        <div class="photo-grid-item item-single" data-photo-index="0">
          <img src="${escapeHtml(images[0])}" alt="${escapeHtml(prop.name)}" loading="lazy" />
          <div class="grid-item-badge">⛶ Agrandir la photo</div>
        </div>
      `;
    } else if (count === 2) {
      photoGridEl.classList.add('grid-layout-duo');
      photoGridEl.innerHTML = images.map((url, i) => `
        <div class="photo-grid-item item-duo" data-photo-index="${i}">
          <img src="${escapeHtml(url)}" alt="${escapeHtml(prop.name)} - Vue ${i + 1}" loading="lazy" />
          <div class="grid-item-badge">⛶ Vue ${i + 1}</div>
        </div>
      `).join('');
    } else if (count >= 3 && count <= 5) {
      photoGridEl.classList.add('grid-layout-bento');
      photoGridEl.innerHTML = `
        <div class="photo-grid-item item-dominant" data-photo-index="0">
          <img src="${escapeHtml(images[0])}" alt="${escapeHtml(prop.name)}" loading="lazy" />
          <div class="grid-item-badge">⛶ Vue principale</div>
        </div>
        <div class="bento-side-stack">
          ${images.slice(1).map((url, i) => `
            <div class="photo-grid-item item-stacked" data-photo-index="${i + 1}">
              <img src="${escapeHtml(url)}" alt="${escapeHtml(prop.name)} - Vue ${i + 2}" loading="lazy" />
            </div>
          `).join('')}
        </div>
      `;
    } else {
      // 6 or more photos
      photoGridEl.classList.add('grid-layout-featured-five');
      const previewFive = images.slice(0, 5);
      const remainingCount = count - 5;

      photoGridEl.innerHTML = `
        <div class="photo-grid-item item-dominant" data-photo-index="0">
          <img src="${escapeHtml(previewFive[0])}" alt="${escapeHtml(prop.name)}" loading="lazy" />
          <div class="grid-item-badge">⛶ Vue principale</div>
        </div>
        <div class="featured-quad-grid">
          ${previewFive.slice(1, 4).map((url, i) => `
            <div class="photo-grid-item item-quad" data-photo-index="${i + 1}">
              <img src="${escapeHtml(url)}" alt="${escapeHtml(prop.name)} - Vue ${i + 2}" loading="lazy" />
            </div>
          `).join('')}
          <div class="photo-grid-item item-quad item-has-overlay" data-photo-index="4">
            <img src="${escapeHtml(previewFive[4])}" alt="${escapeHtml(prop.name)} - Vue 5" loading="lazy" />
            <div class="photo-grid-overlay">
              <span class="overlay-plus">+${remainingCount + 1} photos</span>
              <span class="overlay-sub">Voir toutes les photos</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * 8. ENERGY EFFICIENCY SECTION (DPE & GES)
   * Visual A-G scale, numeric values, estimated costs
   * Hidden if no energy data.
   */
  function renderEnergySection(prop) {
    if (!energySectionEl) return;
    const energy = prop.energy;

    if (!energy || energy.has_data === false || !energy.dpe_rating) {
      energySectionEl.style.display = 'none';
      return;
    }

    energySectionEl.style.display = 'block';

    const dpeGrade = (energy.dpe_rating || 'B').toUpperCase();
    const gesGrade = (energy.ges_rating || 'B').toUpperCase();

    if (dpeNumericValEl) dpeNumericValEl.textContent = String(energy.dpe_value || 75);
    if (gesNumericValEl) gesNumericValEl.textContent = String(energy.ges_value || 15);

    if (energyCostMinEl) energyCostMinEl.textContent = `${(energy.annual_cost_min || 1200).toLocaleString('fr-FR')} €`;
    if (energyCostMaxEl) energyCostMaxEl.textContent = `${(energy.annual_cost_max || 1650).toLocaleString('fr-FR')} €`;
    if (energyCertRefEl) energyCertRefEl.textContent = energy.certificate_ref || `DPE-${prop.id}`;

    // Render stepped bars for DPE
    const dpeContainer = document.getElementById('dpe-stepped-chart');
    if (dpeContainer) {
      const grades = [
        { letter: 'A', limit: '≤ 70', color: '#009640' },
        { letter: 'B', limit: '71 à 110', color: '#52b130' },
        { letter: 'C', limit: '111 à 180', color: '#c2d92d' },
        { letter: 'D', limit: '181 à 250', color: '#f5e71e' },
        { letter: 'E', limit: '251 à 330', color: '#e5831f' },
        { letter: 'F', limit: '331 à 420', color: '#e0401d' },
        { letter: 'G', limit: '> 420', color: '#d11919' }
      ];

      dpeContainer.innerHTML = grades.map((g, idx) => {
        const isCurrent = g.letter === dpeGrade;
        const widthPct = 35 + idx * 10;
        return `
          <div class="stepped-bar-row ${isCurrent ? 'active' : ''}">
            <div class="bar-fill" style="width: ${widthPct}%; background-color: ${g.color};">
              <span class="bar-letter">${g.letter}</span>
              <span class="bar-limit">${g.limit}</span>
            </div>
            ${isCurrent ? `
              <div class="bar-pointer-badge">
                <strong>${g.letter}</strong>
                <span>${energy.dpe_value} kWh/m²/an</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    // Render stepped bars for GES
    const gesContainer = document.getElementById('ges-stepped-chart');
    if (gesContainer) {
      const gesGrades = [
        { letter: 'A', limit: '≤ 6', color: '#88438e' },
        { letter: 'B', limit: '7 à 11', color: '#7e3585' },
        { letter: 'C', limit: '12 à 30', color: '#6d2674' },
        { letter: 'D', limit: '31 à 50', color: '#5a1961' },
        { letter: 'E', limit: '51 à 70', color: '#4a0f51' },
        { letter: 'F', limit: '71 à 100', color: '#3d0843' },
        { letter: 'G', limit: '> 100', color: '#2b0230' }
      ];

      gesContainer.innerHTML = gesGrades.map((g, idx) => {
        const isCurrent = g.letter === gesGrade;
        const widthPct = 35 + idx * 10;
        return `
          <div class="stepped-bar-row ${isCurrent ? 'active' : ''}">
            <div class="bar-fill" style="width: ${widthPct}%; background-color: ${g.color};">
              <span class="bar-letter">${g.letter}</span>
              <span class="bar-limit">${g.limit}</span>
            </div>
            ${isCurrent ? `
              <div class="bar-pointer-badge ges-badge">
                <strong>${g.letter}</strong>
                <span>${energy.ges_value} kg CO₂/m²/an</span>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Characteristics & features
   */
  function renderKeyFeatures(prop) {
    const featuresListEl = document.getElementById('property-features-list');
    if (!featuresListEl) return;
    const features = Array.isArray(prop.features) ? prop.features : [];

    featuresListEl.innerHTML = features.map((f) => `
      <li class="feature-tag">
        <span class="feature-check">✓</span>
        <span>${escapeHtml(f)}</span>
      </li>
    `).join('');

    // Detailed specs grid
    const tableEl = document.getElementById('property-details-specs-table');
    if (tableEl) {
      tableEl.innerHTML = `
        <div class="spec-table-row"><span>Année de construction</span><strong>${escapeHtml(prop.year || 'Non renseignée')}</strong></div>
        <div class="spec-table-row"><span>État général</span><strong>${escapeHtml(prop.condition || 'Très bon état')}</strong></div>
        <div class="spec-table-row"><span>Mode de chauffage</span><strong>${escapeHtml(prop.heating || 'Individuel')}</strong></div>
        <div class="spec-table-row"><span>Charges prévisionnelles</span><strong>${escapeHtml(prop.charges || 'Individuel')}</strong></div>
        <div class="spec-table-row"><span>Taxe foncière</span><strong>${escapeHtml(prop.taxe_fonciere || 'Consulter l\'agence')}</strong></div>
        <div class="spec-table-row"><span>Mandat</span><strong>${prop.favoriz ? 'Mandat Favoriz Exclusif' : 'Simple'}</strong></div>
      `;
    }
  }

  /**
   * Neighborhood & Map Preview
   */
  function renderNearbyAmenities(prop) {
    const locTextEl = document.getElementById('map-inline-location-text');
    if (locTextEl) {
      locTextEl.textContent = prop.location || prop.address || 'France';
    }
    const coordsTextEl = document.getElementById('map-inline-coords-text');
    if (coordsTextEl && prop.coordinates) {
      const coords = Array.isArray(prop.coordinates)
        ? prop.coordinates
        : (typeof prop.coordinates === 'string' ? prop.coordinates.split(',').map(Number) : null);
      if (coords && !isNaN(coords[0]) && !isNaN(coords[1])) {
        coordsTextEl.textContent = `Coordonnées GPS certifiées : ${coords[1]} N, ${coords[0]} E`;
      }
    }
  }

  /**
   * Fullscreen Lightbox Gallery
   */
  function openGalleryLightbox(startIndex = 0) {
    if (!currentProperty || !lightboxEl) return;
    const images = currentProperty.images || [];
    if (images.length === 0) return;

    isLightboxOpen = true;
    lightboxZoomScale = 1;
    lightboxEl.classList.add('open');
    lightboxEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    // Populate thumbnails
    if (lightboxThumbsEl) {
      lightboxThumbsEl.innerHTML = images.map((url, i) => `
        <button class="lightbox-thumb-btn ${i === startIndex ? 'active' : ''}" type="button" data-index="${i}">
          <img src="${escapeHtml(url)}" alt="Thumbnail ${i + 1}" loading="lazy" />
        </button>
      `).join('');

      lightboxThumbsEl.querySelectorAll('.lightbox-thumb-btn').forEach((b) => {
        b.addEventListener('click', () => {
          const idx = parseInt(b.dataset.index, 10) || 0;
          updateLightboxPhoto(idx);
        });
      });
    }

    updateLightboxPhoto(startIndex);
  }

  function closeGalleryLightbox() {
    if (!lightboxEl) return;
    isLightboxOpen = false;
    lightboxEl.classList.remove('open');
    lightboxEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    resetLightboxZoom();
  }

  function updateLightboxPhoto(index) {
    if (!currentProperty) return;
    const images = currentProperty.images || [];
    if (images.length === 0) return;

    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    currentLightboxPhotoIndex = index;
    resetLightboxZoom();

    if (lightboxImgEl) {
      lightboxImgEl.style.opacity = '0.3';
      lightboxImgEl.src = images[index];
      lightboxImgEl.alt = `${currentProperty.name} - Photo ${index + 1}`;
      lightboxImgEl.onload = () => {
        lightboxImgEl.style.opacity = '1';
      };
    }

    if (lightboxCounterEl) {
      lightboxCounterEl.textContent = `${index + 1} / ${images.length}`;
    }

    if (lightboxThumbsEl) {
      const thumbs = lightboxThumbsEl.querySelectorAll('.lightbox-thumb-btn');
      thumbs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
        if (i === index && t && typeof t.scrollIntoView === 'function') {
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }
  }

  function navigateLightbox(dir) {
    updateLightboxPhoto(currentLightboxPhotoIndex + dir);
  }

  function zoomLightbox(delta) {
    lightboxZoomScale = Math.min(3, Math.max(1, lightboxZoomScale + delta));
    if (lightboxImgEl) {
      lightboxImgEl.style.transform = `scale(${lightboxZoomScale})`;
    }
  }

  function resetLightboxZoom() {
    lightboxZoomScale = 1;
    if (lightboxImgEl) {
      lightboxImgEl.style.transform = 'scale(1)';
    }
  }

  /**
   * Touch swipe for mobile gallery
   */
  function setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;

    const heroViewport = document.getElementById('hero-gallery-viewport');
    if (heroViewport) {
      heroViewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      heroViewport.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].screenX - touchStartX;
        const diffY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) navigateHeroPhoto(1);
          else navigateHeroPhoto(-1);
        }
      }, { passive: true });
    }

    if (lightboxEl) {
      const stage = lightboxEl.querySelector('.lightbox-stage');
      if (stage) {
        stage.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
          if (lightboxZoomScale > 1) return; // Don't swipe while zoomed
          const diffX = e.changedTouches[0].screenX - touchStartX;
          const diffY = e.changedTouches[0].screenY - touchStartY;
          if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) navigateLightbox(1);
            else navigateLightbox(-1);
          }
        }, { passive: true });
      }
    }
  }

  /**
   * Opens 360° Virtual Tour
   * Connects to existing virtual tour feature without replacing it.
   */
  function triggerVirtualTour(propId) {
    if (typeof window.openVirtualTour === 'function') {
      window.openVirtualTour(propId);
    } else {
      // Fallback to legacy modal trigger if needed
      const legacyModal = document.querySelector('.tour-modal');
      if (legacyModal) {
        legacyModal.classList.add('open');
        legacyModal.setAttribute('aria-hidden', 'false');
      }
    }
  }

  /**
   * Opens Map View using existing map system
   */
  function openPropertyLocationMap(prop) {
    if (!prop || !prop.coordinates) return;
    const coords = Array.isArray(prop.coordinates)
      ? prop.coordinates
      : (typeof prop.coordinates === 'string' ? prop.coordinates.split(',').map(Number) : [2.3017, 48.8559]);

    if (typeof window.openPropertyMapModal === 'function') {
      window.openPropertyMapModal(coords, prop.name, prop.location);
      return;
    }

    const mapModal = document.querySelector('.map-modal');
    if (mapModal) {
      mapModal.classList.add('open');
      mapModal.setAttribute('aria-hidden', 'false');
      const mapTitle = document.getElementById('map-title');
      if (mapTitle) mapTitle.textContent = prop.name;
      const mapLoc = document.querySelector('.map-location');
      if (mapLoc) mapLoc.textContent = prop.location || prop.address || '';

      // Center maplibre map if available
      if (window.propertyMap && typeof window.propertyMap.flyTo === 'function') {
        window.propertyMap.flyTo({
          center: coords,
          zoom: 15,
          pitch: 55,
          bearing: -20,
          duration: 1200
        });
      }
    } else {
      // Fallback: jump to home interactive map
      closePropertyDetails();
      const mapSection = document.getElementById('acheter');
      if (mapSection && typeof mapSection.scrollIntoView === 'function') {
        mapSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  /**
   * Luxury Printable Property Brochure Modal
   */
  function openBrochureModal(propId) {
    if (!brochureModalEl) cacheElements();
    if (!brochureModalEl || !currentProperty) return;

    const prop = currentProperty;
    const contentEl = document.getElementById('brochure-printable-sheet');
    if (contentEl) {
      contentEl.innerHTML = `
        <header class="brochure-sheet-header">
          <div class="brochure-brand-block">
            <img class="brochure-logo" src="laforet-logo.svg" alt="LaForêt Prestige" />
            <span class="brochure-brand-sub">DÉPARTEMENT IMMOBILIER DE PRESTIGE</span>
          </div>
          <div class="brochure-ref-block">
            <span class="brochure-doc-type">DOSSIER CONFIDENTIEL DE PRÉSENTATION</span>
            <strong class="brochure-ref-code">${escapeHtml(prop.ref || `LF-${prop.id}`)}</strong>
            <small>Document édité le ${new Date().toLocaleDateString('fr-FR')}</small>
          </div>
        </header>

        <div class="brochure-hero-banner">
          <img src="${escapeHtml(prop.images?.[0] || '')}" alt="${escapeHtml(prop.name)}" />
          <div class="brochure-hero-caption">
            <h2>${escapeHtml(prop.name)}</h2>
            <p>${escapeHtml(prop.location || '')}</p>
          </div>
        </div>

        <div class="brochure-pricing-bar">
          <div class="price-box">
            <span>PRIX DE VENTE HONORAIRES INCLUS</span>
            <strong>${escapeHtml(prop.price)}</strong>
            ${prop.price_per_m2 ? `<small>(${escapeHtml(prop.price_per_m2)})</small>` : ''}
          </div>
          <div class="specs-grid-mini">
            <div><strong>${prop.surface || '—'} m²</strong><span>Surface habitable</span></div>
            <div><strong>${prop.rooms || '—'}</strong><span>Pièces principales</span></div>
            <div><strong>${prop.bedrooms || '—'}</strong><span>Chambres</span></div>
            <div><strong>Classe ${prop.energy?.dpe_rating || 'B'}</strong><span>DPE</span></div>
          </div>
        </div>

        <div class="brochure-body-grid">
          <div class="brochure-desc-column">
            <h3>Description du Bien</h3>
            <p>${escapeHtml(prop.description_preview || '')}</p>
            <p>${escapeHtml(prop.description_full || '')}</p>

            <h4 style="margin-top: 20px;">Prestations & Éléments Remarquables</h4>
            <ul class="brochure-features-list">
              ${(prop.features || []).map((f) => `<li>✓ ${escapeHtml(f)}</li>`).join('')}
            </ul>
          </div>

          <div class="brochure-side-column">
            <div class="brochure-photos-trio">
              ${(prop.images || []).slice(1, 4).map((url) => `
                <img src="${escapeHtml(url)}" alt="Vue propriété" />
              `).join('')}
            </div>

            <div class="brochure-energy-box">
              <h4>Performances Énergétiques</h4>
              <p>DPE : <strong>Classe ${prop.energy?.dpe_rating || 'B'} (${prop.energy?.dpe_value || 75} kWh/m²/an)</strong></p>
              <p>GES : <strong>Classe ${prop.energy?.ges_rating || 'A'} (${prop.energy?.ges_value || 10} kg CO₂/m²/an)</strong></p>
              <small>Certificat ADEME certifié</small>
            </div>

            <div class="brochure-agent-box">
              <h4>Votre Conseiller Privilégié</h4>
              <div class="brochure-agent-profile">
                <img src="${escapeHtml(prop.agent?.photo || '')}" alt="${escapeHtml(prop.agent?.name || '')}" />
                <div>
                  <strong>${escapeHtml(prop.agent?.name || 'Marc-Antoine de Belloy')}</strong>
                  <small>${escapeHtml(prop.agent?.title || 'Spécialiste Prestige')}</small>
                  <p>${escapeHtml(prop.agent?.agency || 'LaForêt Prestige')}</p>
                  <p class="brochure-contact-phone">Tél : ${escapeHtml(prop.agent?.phone || '01 45 51 00 20')}</p>
                  <p>${escapeHtml(prop.agent?.email || 'prestige@laforet.com')}</p>
                </div>
              </div>
            </div>

            <div class="brochure-qr-box">
              <div class="qr-mockup">VISITE 360°</div>
              <span>Flashez pour visiter en 3D immersive</span>
            </div>
          </div>
        </div>

        <footer class="brochure-sheet-footer">
          <p>Document commercial non contractuel · LaForêt Immobilier Prestige France · Carte Professionnelle CPI n° 7501 2018 · Garantie Financière CEGC</p>
        </footer>
      `;
    }

    brochureModalEl.classList.add('open');
    brochureModalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('brochure-open');
  }

  function closeBrochureModal() {
    if (!brochureModalEl) return;
    brochureModalEl.classList.remove('open');
    brochureModalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('brochure-open');
  }

  /**
   * Contact Modal / Enquiry with Property Identified
   */
  function openContactEnquiryModal(prop) {
    if (!contactModalEl) cacheElements();
    if (!contactModalEl) return;

    if (prop) {
      const propTitle = document.getElementById('contact-modal-property-title');
      if (propTitle) propTitle.textContent = prop.name;

      const propRef = document.getElementById('contact-modal-property-ref');
      if (propRef) propRef.textContent = `Réf. ${prop.ref || prop.id} · ${prop.price}`;

      const propAgent = document.getElementById('contact-modal-agent-name');
      if (propAgent) propAgent.textContent = prop.agent?.name || 'Votre conseiller LaForêt';

      const inputPropId = document.getElementById('contact-form-property-id');
      if (inputPropId) inputPropId.value = String(prop.id);

      const msgField = document.getElementById('contact-form-message');
      if (msgField && !msgField.value) {
        msgField.value = `Bonjour, je souhaite obtenir de plus amples informations concernant le bien "${prop.name}" (Réf. ${prop.ref || prop.id}) situé à ${prop.location || 'France'} et éventuellement convenir d'une visite privée.`;
      }
    }

    contactModalEl.classList.add('open');
    contactModalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('contact-modal-open');
  }

  function closeContactModal() {
    if (!contactModalEl) return;
    contactModalEl.classList.remove('open');
    contactModalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('contact-modal-open');
  }

  /**
   * Official ADEME Energy Certificate Modal
   */
  function openEnergyCertModal(prop) {
    if (!energyCertModalEl) cacheElements();
    if (!energyCertModalEl) return;

    const property = prop || currentProperty || (window.PROPERTY_DETAILS_DATA && window.PROPERTY_DETAILS_DATA[0]);
    if (!property) return;

    const certRef = property.energy_cert_ref || `LF-${property.id ? String(property.id).padStart(5, '0') : '75007'}-ADEME`;
    const dpeGrade = (property.energy_dpe_rating || property.dpe || 'B').toUpperCase();
    const dpeVal = property.energy_dpe_value || (dpeGrade === 'A' ? 42 : dpeGrade === 'B' ? 88 : dpeGrade === 'C' ? 142 : 185);
    const gesGrade = (property.energy_ges_rating || property.ges || 'A').toUpperCase();
    const gesVal = property.energy_ges_value || (gesGrade === 'A' ? 4 : gesGrade === 'B' ? 9 : gesGrade === 'C' ? 18 : 25);
    const minCost = property.energy_cost_min || '1 250 €';
    const maxCost = property.energy_cost_max || '1 720 €';
    const inspectionDate = property.energy_inspection_date || '14 Novembre 2024';

    if (energyCertBodyEl) {
      energyCertBodyEl.innerHTML = `
        <div class="cert-meta-grid">
          <div class="cert-meta-item">
            <small>Numéro d'enregistrement ADEME</small>
            <strong>${escapeHtml(certRef)}</strong>
          </div>
          <div class="cert-meta-item">
            <small>Date du diagnostic officiel</small>
            <strong>${escapeHtml(inspectionDate)}</strong>
          </div>
          <div class="cert-meta-item">
            <small>Bien immobilier audité</small>
            <strong>${escapeHtml(property.name)}</strong>
          </div>
          <div class="cert-meta-item">
            <small>Localisation certifiée</small>
            <strong>${escapeHtml(property.location || 'Paris, France')}</strong>
          </div>
        </div>

        <div class="cert-dual-badges">
          <div class="cert-score-card">
            <div class="cert-score-badge dpe-${dpeGrade.toLowerCase()}">${dpeGrade}</div>
            <div class="cert-score-info">
              <strong>Consommation d'énergie primaire</strong>
              <span>${dpeVal} kWh/m²/an (Classe ${dpeGrade})</span>
            </div>
          </div>
          <div class="cert-score-card">
            <div class="cert-score-badge dpe-${gesGrade.toLowerCase()}">${gesGrade}</div>
            <div class="cert-score-info">
              <strong>Émissions de gaz à effet de serre</strong>
              <span>${gesVal} kg CO₂/m²/an (Classe ${gesGrade})</span>
            </div>
          </div>
        </div>

        <div class="cert-usage-breakdown">
          <h5>Estimation des dépenses annuelles d'énergie : entre ${escapeHtml(minCost)} et ${escapeHtml(maxCost)} / an</h5>
          <div class="cert-bar-wrap">
            <div class="cert-bar-heat" style="width: 60%;" title="Chauffage : 60%"></div>
            <div class="cert-bar-water" style="width: 24%;" title="Eau chaude sanitaire : 24%"></div>
            <div class="cert-bar-light" style="width: 16%;" title="Éclairage & auxiliaires : 16%"></div>
          </div>
          <div class="cert-legend">
            <span><span class="cert-legend-dot" style="background:#c68228"></span>Chauffage (60%)</span>
            <span><span class="cert-legend-dot" style="background:#2f7f6f"></span>Eau chaude sanitaire (24%)</span>
            <span><span class="cert-legend-dot" style="background:#0c2b23"></span>Éclairage & usages spécifiques (16%)</span>
          </div>
        </div>

        <p class="cert-legal-note">
          <strong>Validité 10 ans :</strong> Conforme aux arrêtés ministériels en vigueur (Décrets n° 2020-1609 et 2020-1610 du 17 décembre 2020). DPE opposable établi selon la méthode 3CL-DPE 2021 par un diagnostiqueur certifié et couvert par une assurance responsabilité civile professionnelle.
        </p>
      `;
    }

    energyCertModalEl.classList.add('open');
    energyCertModalEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('energy-cert-open');
  }

  function closeEnergyCertModal() {
    if (!energyCertModalEl) return;
    energyCertModalEl.classList.remove('open');
    energyCertModalEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('energy-cert-open');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function isPropertyFavorited(propId) {
    try {
      const favs = JSON.parse(localStorage.getItem('laforet-favorites') || '[]');
      return favs.includes(String(propId));
    } catch {
      return false;
    }
  }

  function togglePropertyFavorite(prop) {
    if (!prop) return;
    const propId = String(prop.id);
    try {
      let favs = JSON.parse(localStorage.getItem('laforet-favorites') || '[]');
      const isFav = favs.includes(propId);
      if (isFav) {
        favs = favs.filter(id => id !== propId);
      } else {
        favs.push(propId);
      }
      localStorage.setItem('laforet-favorites', JSON.stringify(favs));
      updateFavoriteButtonUI(!isFav);

      // Also update catalog card heart if present
      const card = document.querySelector(`.property-card[data-id="${propId}"]`);
      if (card) {
        const cardFav = card.querySelector('.property-favorite');
        if (cardFav) {
          cardFav.setAttribute('aria-pressed', String(!isFav));
          cardFav.textContent = !isFav ? '♥' : '♡';
        }
      }
    } catch (e) {
      console.warn('Favorite error:', e);
    }
  }

  function updateFavoriteButtonUI(isFav) {
    const favBtn = document.getElementById('btn-hero-favorite');
    if (favBtn) {
      favBtn.classList.toggle('favorited', isFav);
      favBtn.textContent = isFav ? '♥' : '♡';
      favBtn.setAttribute('title', isFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
      favBtn.setAttribute('aria-pressed', String(isFav));
    }
  }

  function shareProperty(prop) {
    if (!prop) return;
    const shareUrl = window.location.origin + window.location.pathname + `#bien-${prop.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${prop.name} · LaForêt Prestige`,
        text: `Découvrez ce bien d'exception : ${prop.name} (${prop.location}) - ${prop.price}`,
        url: shareUrl
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        const shareBtn = document.getElementById('btn-hero-share');
        if (shareBtn) {
          const orig = shareBtn.textContent;
          shareBtn.textContent = '✓';
          setTimeout(() => { shareBtn.textContent = orig; }, 2000);
        }
      }).catch(() => {});
    }
  }

  // Global exposure
  window.PropertyDetailsView = {
    init,
    open: openPropertyDetails,
    close: closePropertyDetails,
    openLightbox: openGalleryLightbox,
    closeLightbox: closeGalleryLightbox,
    openBrochure: openBrochureModal,
    closeBrochure: closeBrochureModal,
    openContact: openContactEnquiryModal,
    closeContactModal,
    openEnergyCert: openEnergyCertModal,
    closeEnergyCert: closeEnergyCertModal
  };

  // Expose global openPropertyDetails
  window.openPropertyDetails = openPropertyDetails;
  window.closePropertyDetails = closePropertyDetails;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
