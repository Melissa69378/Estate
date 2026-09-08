/**
 * 3D Property Tour Integration
 * Binds property cards and featured banners to the immersive 3D viewer.
 * Loads 3D WebGL modules lazily on demand to avoid blocking initial page load.
 */

// Cache for fetched tour configs and dynamic tour module
const tourCache = new Map();
let propertyTourModulePromise = null;

async function getTourModule() {
  if (!propertyTourModulePromise) {
    propertyTourModulePromise = import('./components/property-tour/index.js');
  }
  return propertyTourModulePromise;
}

/**
 * Loads tour data from backend or cache.
 * @param {string|number} propertyId
 * @returns {Promise<any>}
 */
async function fetchTourData(propertyId) {
  if (tourCache.has(propertyId)) return tourCache.get(propertyId);

  try {
    const res = await fetch(`/api/tours/${encodeURIComponent(propertyId)}`);
    if (res.ok) {
      const data = await res.json();
      tourCache.set(propertyId, data);
      return data;
    }
  } catch (err) {
    console.warn(`[3D Tour] Could not fetch /api/tours/${propertyId}, using demo tour:`, err);
  }

  const mod = await getTourModule();
  return mod.DEFAULT_DEMO_TOUR;
}

/**
 * Opens the 3D property tour for a given property.
 * @param {string|number|Object} property - Property name, ID or object
 * @param {any} [explicitTourData] - Optional direct tour data
 */
export async function openVirtualTour(property, explicitTourData = null) {
  let propName = 'Propriété d\'Exception';
  let propId = '1';

  if (typeof property === 'number' || (typeof property === 'string' && /^\d+$/.test(property))) {
    propId = String(property);
    propName = `Propriété #${propId}`;
  } else if (typeof property === 'string') {
    propName = property;
    // Map common names if needed
    const cardMatch = document.querySelector(`.property-card[data-property="${property.replace(/"/g, '\\"')}"]`);
    if (cardMatch?.dataset.id) {
      propId = cardMatch.dataset.id;
    }
  } else if (property && typeof property === 'object') {
    propName = property.name || property.title || 'Propriété d\'Exception';
    propId = String(property.id || property.propertyId || '1');
  }

  // Close legacy modal if open
  document.querySelector('.tour-modal')?.classList.remove('open');
  document.querySelector('.tour-modal')?.setAttribute('aria-hidden', 'true');

  const [tourModule, tourData] = await Promise.all([
    getTourModule(),
    explicitTourData ? Promise.resolve(explicitTourData) : fetchTourData(propId),
  ]);

  return tourModule.PropertyTour.open({
    property: { id: propId, name: propName },
    tour: tourData,
  });
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.openVirtualTour = openVirtualTour;
  window.getPropertyTourModule = getTourModule;
}

// Click listener on property listing tour buttons and immersive features
document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('.tour-trigger, .featured-tour-trigger, .tour-modal-trigger, .btn-secondary-tour, .virtual-feature-art, [data-action="open-3d-tour"]');
  if (!trigger) return;

  event.preventDefault();
  event.stopPropagation();

  const card = trigger.closest('.property-card');
  const propertyName = trigger.dataset.property || card?.dataset.property || 'Hôtel Particulier Champ-de-Mars';
  const propertyId = trigger.dataset.propertyId || card?.dataset.id || '1';

  openVirtualTour({ id: propertyId, name: propertyName });
});
