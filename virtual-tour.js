/**
 * 3D Property Tour Integration
 * Binds property cards and featured banners to the immersive 3D viewer.
 */
import { PropertyTour, DEFAULT_DEMO_TOUR } from './components/property-tour/index.js';

// Cache for fetched tour configs
const tourCache = new Map();

/**
 * Loads tour data from backend or cache.
 * @param {string|number} propertyId
 * @returns {Promise<any>}
 */
async function fetchTourData(propertyId) {
  if (!propertyId) return DEFAULT_DEMO_TOUR;
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

  return DEFAULT_DEMO_TOUR;
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

  let tourData = explicitTourData;
  if (!tourData) {
    tourData = await fetchTourData(propId);
  }

  return PropertyTour.open({
    property: { id: propId, name: propName },
    tour: tourData,
  });
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.openVirtualTour = openVirtualTour;
  window.PropertyTour = PropertyTour;
}

// Click listener on property listing tour buttons
document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('.tour-trigger, .featured-tour-trigger, [data-action="open-3d-tour"]');
  if (!trigger) return;

  event.preventDefault();
  event.stopPropagation();

  const card = trigger.closest('.property-card');
  const propertyName = trigger.dataset.property || card?.dataset.property || 'Hôtel Particulier Champ-de-Mars';
  const propertyId = trigger.dataset.propertyId || card?.dataset.id || '1';

  const tourData = await fetchTourData(propertyId);
  openVirtualTour({ id: propertyId, name: propertyName }, tourData);
});
