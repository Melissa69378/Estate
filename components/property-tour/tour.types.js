/**
 * 3D Property Tour - Type definitions and data normalization
 * Supports 360° equirectangular panoramas and Matterport embeds.
 */

/**
 * @typedef {'360' | 'matterport' | 'external'} TourType
 *
 * @typedef {Object} TourHotspot
 * @property {string} id - Unique hotspot identifier
 * @property {'navigation' | 'info'} type - Hotspot interaction type
 * @property {string} label - Display label (e.g. 'Kitchen')
 * @property {number} yaw - Azimuth angle in radians (-PI to PI) or degrees
 * @property {number} pitch - Elevation angle in radians (-PI/2 to PI/2) or degrees
 * @property {string} [targetSceneId] - Required for 'navigation' type
 * @property {string} [title] - Title for 'info' type modal
 * @property {string} [description] - Body text for 'info' type modal
 *
 * @typedef {Object} TourScene
 * @property {string} id - Unique scene identifier (e.g. 'living-room')
 * @property {string} name - Friendly name (e.g. 'Living Room')
 * @property {string} [floor] - Floor grouping (e.g. 'Ground Floor')
 * @property {string} panoramaUrl - Equirectangular 360 image URL
 * @property {string} [thumbnailUrl] - Room thumbnail image URL
 * @property {TourHotspot[]} [hotspots] - Clickable markers in this scene
 *
 * @typedef {Object} FloorPlanMarker
 * @property {string} sceneId - Target scene ID
 * @property {string} label - Room name
 * @property {number} x - Percentage from left (0 to 100)
 * @property {number} y - Percentage from top (0 to 100)
 *
 * @typedef {Object} FloorPlanData
 * @property {string} imageUrl - Floor plan image URL (SVG/PNG/JPG)
 * @property {FloorPlanMarker[]} [markers] - Clickable room pins on the plan
 *
 * @typedef {Object} TourData
 * @property {string} id - Tour identifier
 * @property {string} [propertyId] - Associated property ID
 * @property {boolean} [enabled=true] - Whether tour is active
 * @property {TourType} [tourType='360'] - Tour rendering engine
 * @property {string} [startingSceneId] - ID of initial scene to display
 * @property {string} [externalUrl] - URL for Matterport or external iframe
 * @property {TourScene[]} [scenes] - List of 360 scenes (for '360' type)
 * @property {FloorPlanData} [floorPlan] - Optional floor plan data
 */

export const DEFAULT_DEMO_TOUR = {
  id: 'tour-demo-001',
  propertyId: '1',
  enabled: true,
  tourType: '360',
  startingSceneId: 'living-room',
  floorPlan: {
    imageUrl: '/tours/demo-property/floor-plan.svg',
    markers: [
      { sceneId: 'living-room', label: 'Salon Principal', x: 31, y: 44 },
      { sceneId: 'kitchen', label: 'Cuisine & Réception', x: 23, y: 25 },
      { sceneId: 'bedroom', label: 'Suite Principale', x: 69, y: 35 },
      { sceneId: 'bathroom', label: 'Bains & Bien-être', x: 69, y: 72 },
    ],
  },
  scenes: [
    {
      id: 'living-room',
      name: 'Salon Principal',
      floor: 'Rez-de-chaussée',
      panoramaUrl: '/tours/demo-property/living-room.jpg',
      thumbnailUrl: '/tours/demo-property/living-room-thumb.jpg',
      hotspots: [
        {
          id: 'living-to-kitchen',
          type: 'navigation',
          label: 'Cuisine',
          yaw: 0.35,
          pitch: -0.06,
          targetSceneId: 'kitchen',
        },
        {
          id: 'living-to-bedroom',
          type: 'navigation',
          label: 'Suite Principale',
          yaw: 1.85,
          pitch: -0.02,
          targetSceneId: 'bedroom',
        },
        {
          id: 'living-info-architecture',
          type: 'info',
          label: 'Architecture & Finitions',
          title: 'Moulures d\'Époque & Parquet Point de Hongrie',
          description: 'Double séjour lumineux aux volumes spectaculaires, cheminée en marbre sculpté et parquets anciens préservés.',
          yaw: -1.2,
          pitch: 0.12,
        },
        {
          id: 'living-info-terrace',
          type: 'info',
          label: 'Accès Extérieur',
          title: 'Accès Terrasse & Jardin d\'Hiver',
          description: 'Portes-fenêtres toute hauteur ouvrant sur un jardin privatif arboré de 35 m² à l\'abri des regards.',
          yaw: -2.4,
          pitch: 0.05,
        },
      ],
    },
    {
      id: 'kitchen',
      name: 'Cuisine & Salle à Manger',
      floor: 'Rez-de-chaussée',
      panoramaUrl: '/tours/demo-property/kitchen.jpg',
      thumbnailUrl: '/tours/demo-property/kitchen-thumb.jpg',
      hotspots: [
        {
          id: 'kitchen-to-living',
          type: 'navigation',
          label: 'Salon Principal',
          yaw: -3.14,
          pitch: -0.05,
          targetSceneId: 'living-room',
        },
        {
          id: 'kitchen-info-appliances',
          type: 'info',
          label: 'Équipements Gastronomie',
          title: 'Cuisine d\'Artisan & Électroménager Haut de Gamme',
          description: 'Îlot en marbre Calacatta, piano de cuisson sur mesure, cave à vin climatisée et rangements intégrés en chêne brossé.',
          yaw: 0.05,
          pitch: 0.1,
        },
      ],
    },
    {
      id: 'bedroom',
      name: 'Suite Principale',
      floor: 'Premier Étage',
      panoramaUrl: '/tours/demo-property/bedroom.jpg',
      thumbnailUrl: '/tours/demo-property/bedroom-thumb.jpg',
      hotspots: [
        {
          id: 'bedroom-to-living',
          type: 'navigation',
          label: 'Salon Principal',
          yaw: -2.8,
          pitch: -0.05,
          targetSceneId: 'living-room',
        },
        {
          id: 'bedroom-to-bathroom',
          type: 'navigation',
          label: 'Salle de Bains',
          yaw: 1.55,
          pitch: -0.04,
          targetSceneId: 'bathroom',
        },
        {
          id: 'bedroom-info-suite',
          type: 'info',
          label: 'Suite de Maître',
          title: 'Vaste Suite avec Dressing',
          description: 'Tête de lit acoustique en noyer cannelé, dressing sur mesure traversant et balcon privé plein sud.',
          yaw: 0.02,
          pitch: 0.08,
        },
      ],
    },
    {
      id: 'bathroom',
      name: 'Salle de Bains & Spa',
      floor: 'Premier Étage',
      panoramaUrl: '/tours/demo-property/bathroom.jpg',
      thumbnailUrl: '/tours/demo-property/bathroom-thumb.jpg',
      hotspots: [
        {
          id: 'bathroom-to-bedroom',
          type: 'navigation',
          label: 'Suite Principale',
          yaw: -3.14,
          pitch: -0.05,
          targetSceneId: 'bedroom',
        },
        {
          id: 'bathroom-info-features',
          type: 'info',
          label: 'Espace Bains & Bien-être',
          title: 'Salle d\'Eau d\'Inspiration Spa',
          description: 'Dalles de marbre italien, douche à l\'italienne effet pluie, baignoire îlot sculpturale et double vasque suspendue.',
          yaw: 1.57,
          pitch: 0.05,
        },
      ],
    },
  ],
};

/**
 * Validates and normalizes tour data, falling back to defaults where safe.
 * @param {any} rawData
 * @param {string} [propertyName]
 * @returns {TourData}
 */
export function normalizeTourData(rawData, propertyName = 'Property') {
  if (!rawData || typeof rawData !== 'object') {
    return { ...DEFAULT_DEMO_TOUR, propertyName };
  }

  const tourType = rawData.tourType === 'matterport' || rawData.tourType === 'external' ? rawData.tourType : '360';
  const scenes = Array.isArray(rawData.scenes) && rawData.scenes.length > 0
    ? rawData.scenes
    : DEFAULT_DEMO_TOUR.scenes;

  const startingSceneId = rawData.startingSceneId && scenes.some((s) => s.id === rawData.startingSceneId)
    ? rawData.startingSceneId
    : (scenes[0]?.id || 'living-room');

  return {
    id: rawData.id || `tour-${Date.now()}`,
    propertyId: rawData.propertyId || '',
    propertyName: rawData.propertyName || propertyName || 'Propriété d\'Exception',
    propertyLocation: rawData.propertyLocation || '',
    enabled: rawData.enabled !== false,
    tourType,
    externalUrl: rawData.externalUrl || '',
    startingSceneId,
    floorPlan: rawData.floorPlan || DEFAULT_DEMO_TOUR.floorPlan,
    scenes,
  };
}
