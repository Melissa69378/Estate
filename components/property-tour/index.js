/**
 * 3D Property Tour - Module Entry Point
 */
import { PropertyTour } from './PropertyTour.js';
import { TourViewer } from './TourViewer.js';
import { DEFAULT_DEMO_TOUR, normalizeTourData } from './tour.types.js';

export { PropertyTour, TourViewer, DEFAULT_DEMO_TOUR, normalizeTourData };

// Attach to window for easy access in non-module scripts
if (typeof window !== 'undefined') {
  window.PropertyTour = PropertyTour;
}

export default PropertyTour;
