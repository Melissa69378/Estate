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

export const PROPERTY_TOURS_MAP = {
  // Property 1: Hôtel Particulier Champ-de-Mars, Paris 7e
  '1': {
    id: 'tour-paris-001',
    propertyId: '1',
    propertyName: 'Hôtel Particulier Champ-de-Mars',
    propertyLocation: 'Paris 7e · Avenue Émile-Deschanel',
    enabled: true,
    tourType: '360',
    startingSceneId: 'living-room',
    floorPlan: {
      imageUrl: '/tours/plans/hotel-particulier.svg',
      markers: [
        { sceneId: 'entrance-hall', label: 'Vestibule d\'Honneur', x: 20, y: 48 },
        { sceneId: 'living-room', label: 'Grand Salon de Réception', x: 49, y: 39 },
        { sceneId: 'kitchen', label: 'Cuisine d\'Artisan', x: 24, y: 22 },
        { sceneId: 'bedroom', label: 'Suite de Maître', x: 79, y: 37 },
        { sceneId: 'bathroom', label: 'Bains & Spa Marbre', x: 79, y: 73 },
        { sceneId: 'wine-cellar', label: 'Cave de Dégustation', x: 20, y: 78 },
        { sceneId: 'courtyard', label: 'Jardin & Cour d\'Honneur', x: 49, y: 80 },
      ],
    },
    scenes: [
      {
        id: 'living-room',
        name: 'Grand Salon de Réception',
        floor: 'Rez-de-chaussée',
        panoramaUrl: '/tours/demo-property/living-room.jpg',
        thumbnailUrl: '/tours/demo-property/living-room-thumb.jpg',
        hotspots: [
          // Blinking Detail Hotspots
          {
            id: 'living-detail-parquet',
            type: 'detail',
            isBlinking: true,
            label: 'Parquet Point de Hongrie',
            title: 'Parquet Ancien en Chêne Massif Point de Hongrie',
            category: 'Sols & Boiseries Nobles',
            artisan: 'Ébénisterie Parisienne · XIXe Siècle',
            materials: 'Chêne de Bourgogne 22 mm, finition cire d\'abeille naturelle, incrustation laiton',
            specifications: 'Sous-couche acoustique résiliente 19 dB · Motif chevron d\'époque préservé',
            description: 'Parquet d\'origine du XIXe siècle assemblé à onglet avec frises d\'encadrement en acajou et cabochons en laiton. Lustrage traditionnel à la cire chaude.',
            detailImageUrl: '/tours/details/parquet_point_hongrie.jpg',
            yaw: -0.42,
            pitch: -0.58,
            zoomFov: 32,
          },
          {
            id: 'living-detail-cheminee',
            type: 'detail',
            isBlinking: true,
            label: 'Cheminée Marbre de Carrare',
            title: 'Cheminée en Marbre Blanc de Carrare Sculpté',
            category: 'Sculpture & Manteaux Historiques',
            artisan: 'Atelier de Sculpture d\'Époque Louis XV',
            materials: 'Marbre statuaire de Carrare taillé d\'une seule masse, foyer réfractaire en fonte fleurdelisée',
            specifications: 'Conduit ramoné aux normes actuelles, insert invisible haute performance',
            description: 'Manteau d\'époque sculpté à la main orné de feuilles d\'acanthe, de coquilles asymétriques et de jambages galbés. Foyer d\'origine avec plaques de fonte moulée.',
            detailImageUrl: '/tours/details/cheminee_marbre_sculpte.jpg',
            yaw: 1.12,
            pitch: -0.12,
            zoomFov: 30,
          },
          {
            id: 'living-detail-moulures',
            type: 'detail',
            isBlinking: true,
            label: 'Moulures à la Feuille d\'Or',
            title: 'Corniches & Stucs Rehaussés à la Feuille d\'Or',
            category: 'Décors Plâtrerie & Dorure d\'Art',
            artisan: 'Doreur ornemaniste du Patrimoine Historique',
            materials: 'StucStaff armé, or 23,75 carats posé à la mixtion à l\'huile',
            specifications: 'Hauteur sous plafond spectaculaire : 4,20 m · Rosace centrale ajourée',
            description: 'Corniches moulurées sur quatre niveaux avec rais-de-cœur, oves et denticules, rehaussées de dorures artisanales exécutées à la feuille d\'or fine.',
            detailImageUrl: '/tours/details/boiseries_moulures_or.jpg',
            yaw: 0.16,
            pitch: 0.46,
            zoomFov: 34,
          },
          {
            id: 'living-detail-lustre',
            type: 'detail',
            isBlinking: true,
            label: 'Lustre Cristal de Murano',
            title: 'Lustre d\'Apparat en Cristal de Murano Soufflé',
            category: 'Luminaires d\'Exception',
            artisan: 'Maîtres verriers de Murano (Venise)',
            materials: 'Cristal soufflé bouche à inclusions de poussière d\'or 24k, armature en laiton doré',
            specifications: '18 lumières LED blanc chaud dimmables · Hauteur 140 cm · Diamètre 110 cm',
            description: 'Pièce magistrale à pampilles taillées en diamant et branches en volute torsadée, créant une réfraction lumineuse chaleureuse dans tout le grand salon.',
            detailImageUrl: '/tours/details/lustre_cristal_salon.jpg',
            yaw: -0.14,
            pitch: 0.62,
            zoomFov: 30,
          },
          {
            id: 'living-detail-terrasse',
            type: 'detail',
            isBlinking: true,
            label: 'Baies Vitrées Plein Sud',
            title: 'Menuiseries d\'Artisan Cintrées Ouvrant sur Jardin',
            category: 'Menuiserie & Ouvertures Classées',
            artisan: 'Compagnons du Devoir · Restauration Bâtiments de France',
            materials: 'Chêne de France lamellé-collé, crémones en bronze ciselé d\'époque',
            specifications: 'Double vitrage thermique et acoustique 44.2 Silence · Anti-effraction niveau 3',
            description: 'Portes-fenêtres toute hauteur de 3,80 m ouvrant de plain-pied sur la terrasse en pierre de taille et le jardin privatif arboré.',
            detailImageUrl: '/tours/details/portes_fenetres_jardin.jpg',
            yaw: -2.35,
            pitch: 0.04,
            zoomFov: 35,
          },
          // Navigation Hotspots
          {
            id: 'living-to-entrance',
            type: 'navigation',
            label: 'Vestibule d\'Honneur',
            yaw: -3.12,
            pitch: -0.04,
            targetSceneId: 'entrance-hall',
          },
          {
            id: 'living-to-kitchen',
            type: 'navigation',
            label: 'Cuisine d\'Artisan',
            yaw: 0.38,
            pitch: -0.06,
            targetSceneId: 'kitchen',
          },
          {
            id: 'living-to-bedroom',
            type: 'navigation',
            label: 'Suite de Maître',
            yaw: 1.88,
            pitch: -0.02,
            targetSceneId: 'bedroom',
          },
          {
            id: 'living-to-courtyard',
            type: 'navigation',
            label: 'Jardin & Cour',
            yaw: -2.05,
            pitch: -0.1,
            targetSceneId: 'courtyard',
          },
        ],
      },
      {
        id: 'entrance-hall',
        name: 'Vestibule d\'Honneur',
        floor: 'Rez-de-chaussée',
        panoramaUrl: '/tours/panoramas/entrance_hall.jpg',
        thumbnailUrl: '/tours/thumbs/entrance_hall.jpg',
        hotspots: [
          {
            id: 'entrance-detail-escalier',
            type: 'detail',
            isBlinking: true,
            label: 'Rampe Fer Forgé Classée',
            title: 'Escalier Monumental & Rampe en Fer Forgé Époque',
            category: 'Ferronnerie d\'Art Classée',
            artisan: 'Maître Ferronnier Parisien · XVIIIe Siècle',
            materials: 'Fer forgé martelé main, patine médaille, main courante en laiton massif ciré',
            specifications: 'Marches en pierre de Saint-Leu monobloc · Éclairage architectural rasoir',
            description: 'Escalier monumental hélicoïdal à limon sans crémaillère, pièce maîtresse du vestibule ouvrant vers les étages de réception.',
            detailImageUrl: '/tours/details/boiseries_moulures_or.jpg',
            yaw: 0.45,
            pitch: 0.15,
            zoomFov: 32,
          },
          {
            id: 'entrance-to-living',
            type: 'navigation',
            label: 'Grand Salon de Réception',
            yaw: 0.05,
            pitch: -0.02,
            targetSceneId: 'living-room',
          },
          {
            id: 'entrance-to-cellar',
            type: 'navigation',
            label: 'Cave de Dégustation',
            yaw: -1.75,
            pitch: -0.22,
            targetSceneId: 'wine-cellar',
          },
          {
            id: 'entrance-to-courtyard',
            type: 'navigation',
            label: 'Cour d\'Honneur Pavée',
            yaw: 3.05,
            pitch: -0.05,
            targetSceneId: 'courtyard',
          },
        ],
      },
      {
        id: 'kitchen',
        name: 'Cuisine d\'Artisan & Réception',
        floor: 'Rez-de-chaussée',
        panoramaUrl: '/tours/demo-property/kitchen.jpg',
        thumbnailUrl: '/tours/demo-property/kitchen-thumb.jpg',
        hotspots: [
          {
            id: 'kitchen-detail-ilot',
            type: 'detail',
            isBlinking: true,
            label: 'Îlot Central Marbre Calacatta',
            title: 'Îlot Monobloc en Marbre Calacatta Gold',
            category: 'Marbrerie de Haute Gastronomie',
            artisan: 'Atelier de Marbrerie Milanaise & Menuiserie d\'Agencement',
            materials: 'Marbre Calacatta Oro adouci anti-tache, chêne brossé teinté noir mat',
            specifications: 'Longueur 3,60 m · Table de cuisson à induction affleurante Gaggenau avec hotte intégrée',
            description: 'Îlot sculptural monobloc taillé d\'une seule masse de marbre blanc aux veines dorées continues façon bookmatch, avec cave de service intégrée et tiroirs à fermeture amortie.',
            detailImageUrl: '/tours/details/ilot_cuisine_marbre.jpg',
            yaw: 0.08,
            pitch: -0.24,
            zoomFov: 32,
          },
          {
            id: 'kitchen-detail-cave',
            type: 'detail',
            isBlinking: true,
            label: 'Cave à Vin Triple Température',
            title: 'Cave Sommelier Triple Zone EuroCave',
            category: 'Œnologie & Conservation des Vins',
            artisan: 'EuroCave France · Intégration sur mesure',
            materials: 'Porte vitrée traitée anti-UV, clayettes en hêtre massif montées sur roulements',
            specifications: 'Capacité 178 bouteilles · Contrôle d\'hygrométrie constante 70% · Filtre charbon actif',
            description: 'Espace de dégustation intégré permettant le chambrage simultané des grands crus de Bourgogne, Bordeaux et champagnes de garde.',
            detailImageUrl: '/tours/details/cave_vin_reception.jpg',
            yaw: 1.25,
            pitch: 0.05,
            zoomFov: 30,
          },
          {
            id: 'kitchen-to-living',
            type: 'navigation',
            label: 'Grand Salon de Réception',
            yaw: -3.14,
            pitch: -0.05,
            targetSceneId: 'living-room',
          },
        ],
      },
      {
        id: 'bedroom',
        name: 'Suite de Maître',
        floor: 'Premier Étage',
        panoramaUrl: '/tours/demo-property/bedroom.jpg',
        thumbnailUrl: '/tours/demo-property/bedroom-thumb.jpg',
        hotspots: [
          {
            id: 'bedroom-detail-tete-lit',
            type: 'detail',
            isBlinking: true,
            label: 'Tête de Lit Noyer Cannelé',
            title: 'Tête de Lit Acoustique en Noyer d\'Amérique Massif',
            category: 'Ébénisterie Contemporaine & Confort',
            artisan: 'Studio de Création Mobilier Parisien',
            materials: 'Noyer US massif flûté, feutre acoustique de laine mérinos 4 mm, liseuses laiton',
            specifications: 'Absorption acoustique certifiée classe A · Commandes d\'ambiance domotiques tactiles',
            description: 'Panneautage mural sur mesure intégrant des cannelures sculpturales en noyer massif avec rétro-éclairage indirect chaleureux et interrupteurs en laiton brossé.',
            detailImageUrl: '/tours/details/tete_lit_noyer.jpg',
            yaw: 0.02,
            pitch: 0.06,
            zoomFov: 32,
          },
          {
            id: 'bedroom-detail-dressing',
            type: 'detail',
            isBlinking: true,
            label: 'Dressing Traversant en Noyer',
            title: 'Dressing de Haute Couture Rétro-éclairé',
            category: 'Rangements & Dressing de Maître',
            artisan: 'Agencement de Luxe Italien',
            materials: 'Structure noyer huilé, portes verre fumé bronze, tiroirs gainés de cuir pleine fleur',
            specifications: 'Capteurs d\'ouverture magnétiques invisibles · Penderies basculantes assistées',
            description: 'Dressing traversant de 18 m² offrant des penderies toute hauteur, îlot central pour maroquinerie et joaillerie avec vitrine sécurisée.',
            detailImageUrl: '/tours/details/dressing_suite_parentale.jpg',
            yaw: 2.15,
            pitch: 0.02,
            zoomFov: 32,
          },
          {
            id: 'bedroom-to-living',
            type: 'navigation',
            label: 'Grand Salon',
            yaw: -2.8,
            pitch: -0.05,
            targetSceneId: 'living-room',
          },
          {
            id: 'bedroom-to-bathroom',
            type: 'navigation',
            label: 'Bains & Spa en Marbre',
            yaw: 1.55,
            pitch: -0.04,
            targetSceneId: 'bathroom',
          },
        ],
      },
      {
        id: 'bathroom',
        name: 'Bains & Spa en Marbre Statuario',
        floor: 'Premier Étage',
        panoramaUrl: '/tours/demo-property/bathroom.jpg',
        thumbnailUrl: '/tours/demo-property/bathroom-thumb.jpg',
        hotspots: [
          {
            id: 'bathroom-detail-baignoire',
            type: 'detail',
            isBlinking: true,
            label: 'Baignoire Îlot Pierre Reconstituée',
            title: 'Baignoire Îlot Sculpturale & Robinetterie Laiton',
            category: 'Sanitaire de Prestige & Espace Bien-Être',
            artisan: 'Dornbracht & Antonio Lupi',
            materials: 'Pierre reconstituée Cristalplant blanche au toucher soyeux, robinetterie laiton brossé PVD',
            specifications: 'Maintien de chaleur prolongé · Remplissage par le trop-plein invisible',
            description: 'Baignoire ovale sculptée aux lignes douces posée au centre de la pièce face au calepinage en marbre Statuario en livre ouvert.',
            detailImageUrl: '/tours/details/baignoire_ilot_statuario.jpg',
            yaw: 1.57,
            pitch: -0.22,
            zoomFov: 32,
          },
          {
            id: 'bathroom-detail-douche',
            type: 'detail',
            isBlinking: true,
            label: 'Douche Ciel de Pluie Encastrée',
            title: 'Douche à l\'Italienne & Plafonnier Cascade 60 cm',
            category: 'Hydrothérapie Privée',
            artisan: 'Ingénierie Balnéo Dornbracht',
            materials: 'Verre trempé optiwhite 12 mm sans profilés visibles, receveur monobloc sans joint',
            specifications: 'Double mitigeur thermostatique de précision · Buses de brumisation aromatique',
            description: 'Espace douche à l\'italienne généreux revêtu de dalles grand format 120x280 cm en marbre blanc de Carrare veiné gris perle.',
            detailImageUrl: '/tours/details/douche_italienne_pluie.jpg',
            yaw: -0.45,
            pitch: -0.1,
            zoomFov: 32,
          },
          {
            id: 'bathroom-to-bedroom',
            type: 'navigation',
            label: 'Suite de Maître',
            yaw: -3.14,
            pitch: -0.05,
            targetSceneId: 'bedroom',
          },
        ],
      },
      {
        id: 'wine-cellar',
        name: 'Cave de Dégustation Voûtée',
        floor: 'Sous-sol Historique',
        panoramaUrl: '/tours/panoramas/drachenfels_cellar.jpg',
        thumbnailUrl: '/tours/thumbs/drachenfels_cellar.jpg',
        hotspots: [
          {
            id: 'cellar-detail-voute',
            type: 'detail',
            isBlinking: true,
            label: 'Voûte en Pierre de Taille',
            title: 'Voûte Souterraine en Pierre de Taille du XVIIe',
            category: 'Patrimoine Bâti Souterrain',
            artisan: 'Tailleurs de pierre de Paris · Époque Louis XIV',
            materials: 'Calcaire lutétien franc de banc, sol en tomettes anciennes cirées',
            specifications: 'Température naturelle constante 12-14°C · Hygrométrie idéale 75-80%',
            description: 'Cave de vieillissement voûtée offrant un écrin minéral authentique pour les collections de vins rares et champagnes d\'exception.',
            detailImageUrl: '/tours/details/cave_voutee_pierre.jpg',
            yaw: 0.12,
            pitch: 0.08,
            zoomFov: 32,
          },
          {
            id: 'cellar-to-entrance',
            type: 'navigation',
            label: 'Vestibule d\'Honneur',
            yaw: 3.1,
            pitch: 0.1,
            targetSceneId: 'entrance-hall',
          },
        ],
      },
      {
        id: 'courtyard',
        name: 'Cour d\'Honneur & Jardin Privatif',
        floor: 'Extérieur',
        panoramaUrl: '/tours/panoramas/courtyard.jpg',
        thumbnailUrl: '/tours/thumbs/courtyard.jpg',
        hotspots: [
          {
            id: 'court-to-entrance',
            type: 'navigation',
            label: 'Vestibule d\'Honneur',
            yaw: 0.08,
            pitch: -0.02,
            targetSceneId: 'entrance-hall',
          },
          {
            id: 'court-to-living',
            type: 'navigation',
            label: 'Grand Salon de Réception',
            yaw: 1.45,
            pitch: -0.02,
            targetSceneId: 'living-room',
          },
        ],
      },
    ],
  },

  // Property 2: Villa Belle Époque "Le Roc Fleuri", Nice
  '2': {
    id: 'tour-nice-002',
    propertyId: '2',
    propertyName: 'Villa Belle Époque "Le Roc Fleuri"',
    propertyLocation: 'Nice · Boulevard Carnot, Cap de Nice',
    enabled: true,
    tourType: '360',
    startingSceneId: 'terrace-sea',
    floorPlan: {
      imageUrl: '/tours/plans/villa-riviera.svg',
      markers: [
        { sceneId: 'terrace-sea', label: 'Terrasse Panoramique', x: 50, y: 30 },
        { sceneId: 'pool-deck', label: 'Piscine & Solarium', x: 50, y: 75 },
        { sceneId: 'sea-suite', label: 'Suite Royale Vue Mer', x: 80, y: 35 },
        { sceneId: 'modern-bath', label: 'Salle de Bains Marbre', x: 80, y: 70 },
      ],
    },
    scenes: [
      {
        id: 'terrace-sea',
        name: 'Terrasse Panoramique Face Mer',
        floor: 'Étage Principal',
        panoramaUrl: '/tours/panoramas/illovo_beach_balcony.jpg',
        thumbnailUrl: '/tours/thumbs/illovo_beach_balcony.jpg',
        hotspots: [
          {
            id: 'nice-detail-view',
            type: 'detail',
            isBlinking: true,
            label: 'Panorama Méditerranée & Cap Ferrat',
            title: 'Vue Imprenable sur la Baie des Anges et Saint-Jean-Cap-Ferrat',
            category: 'Vue & Emplacement Remarquable',
            artisan: 'Garde-corps en verre trempé extra-clair Saint-Gobain 21,5 mm',
            materials: 'Verre sans montants verticaux, platines inox 316L qualité marine polies miroir',
            specifications: 'Exposition plein sud · Ensoleillement exceptionnel 300 jours/an',
            description: 'Terrasse suspendue de 85 m² offrant un panorama à 180° du Cap de Nice jusqu\'aux falaises d\'Èze et de Monaco.',
            detailImageUrl: '/tours/details/vue_panoramique_mer.jpg',
            yaw: 0.15,
            pitch: -0.05,
            zoomFov: 32,
          },
          {
            id: 'terrace-to-pool',
            type: 'navigation',
            label: 'Piscine & Solarium',
            yaw: -1.75,
            pitch: -0.25,
            targetSceneId: 'pool-deck',
          },
          {
            id: 'terrace-to-suite',
            type: 'navigation',
            label: 'Suite Royale Vue Mer',
            yaw: 2.15,
            pitch: -0.02,
            targetSceneId: 'sea-suite',
          },
        ],
      },
      {
        id: 'pool-deck',
        name: 'Piscine & Solarium Paysager',
        floor: 'Jardin & Piscine',
        panoramaUrl: '/tours/panoramas/pool.jpg',
        thumbnailUrl: '/tours/thumbs/pool.jpg',
        hotspots: [
          {
            id: 'pool-detail-infinity',
            type: 'detail',
            isBlinking: true,
            label: 'Bassin à Débordement & Teck',
            title: 'Piscine Chauffée à Débordement en Pierre de Bali',
            category: 'Équipements Extérieurs de Luxe',
            artisan: 'Architecte Paysagiste & Piscinier d\'Art Côte d\'Azur',
            materials: 'Pierre de lave naturelle Green Sukabumi, deck en teck de Birmanie massif',
            specifications: 'Bassin 14 x 5 m chauffé par pompe à chaleur inverter · Traitement au sel automatique',
            description: 'L\'eau turquoise de la piscine se confond optiquement avec l\'azur de la mer Méditerranée, bordée d\'oliviers taillés en nuage.',
            detailImageUrl: '/tours/details/piscine_solarium_riviera.jpg',
            yaw: 0.22,
            pitch: -0.15,
            zoomFov: 30,
          },
          {
            id: 'pool-to-terrace',
            type: 'navigation',
            label: 'Terrasse Panoramique',
            yaw: 3.1,
            pitch: 0.15,
            targetSceneId: 'terrace-sea',
          },
        ],
      },
      {
        id: 'sea-suite',
        name: 'Suite Royale Vue Mer',
        floor: 'Étage Principal',
        panoramaUrl: '/tours/panoramas/relax_inn_seaview_suite.jpg',
        thumbnailUrl: '/tours/thumbs/relax_inn_seaview_suite.jpg',
        hotspots: [
          {
            id: 'suite-to-bath',
            type: 'navigation',
            label: 'Salle de Bains Marbre',
            yaw: 1.65,
            pitch: -0.05,
            targetSceneId: 'modern-bath',
          },
          {
            id: 'suite-to-terrace',
            type: 'navigation',
            label: 'Terrasse Panoramique',
            yaw: -3.05,
            pitch: -0.02,
            targetSceneId: 'terrace-sea',
          },
        ],
      },
      {
        id: 'modern-bath',
        name: 'Salle de Bains Contemporaine en Marbre',
        floor: 'Étage Principal',
        panoramaUrl: '/tours/panoramas/modern_bathroom.jpg',
        thumbnailUrl: '/tours/thumbs/modern_bathroom.jpg',
        hotspots: [
          {
            id: 'bath-to-suite',
            type: 'navigation',
            label: 'Suite Royale',
            yaw: 3.12,
            pitch: -0.05,
            targetSceneId: 'sea-suite',
          },
        ],
      },
    ],
  },

  // Property 3: Château & Vignoble de Saint-Émilion
  '3': {
    id: 'tour-chateau-003',
    propertyId: '3',
    propertyName: 'Château & Vignoble de Saint-Émilion',
    propertyLocation: 'Saint-Émilion · Gironde',
    enabled: true,
    tourType: '360',
    startingSceneId: 'ballroom',
    floorPlan: {
      imageUrl: '/tours/plans/chateau-vignoble.svg',
      markers: [
        { sceneId: 'ballroom', label: 'Galerie des Glaces & Réception', x: 50, y: 35 },
        { sceneId: 'cellar', label: 'Chai & Cave Voûtée', x: 25, y: 65 },
        { sceneId: 'garden', label: 'Parterre à la Française', x: 75, y: 65 },
      ],
    },
    scenes: [
      {
        id: 'ballroom',
        name: 'Galerie des Glaces & Grand Salon',
        floor: 'Rez-de-chaussée Noble',
        panoramaUrl: '/tours/panoramas/ballroom.jpg',
        thumbnailUrl: '/tours/thumbs/ballroom.jpg',
        hotspots: [
          {
            id: 'chateau-detail-glaces',
            type: 'detail',
            isBlinking: true,
            label: 'Glaces au Mercure XVIIIe',
            title: 'Miroirs au Mercure d\'Époque & Boiseries Patinées',
            category: 'Patrimoine Historique d\'Exception',
            artisan: 'Manufacture Royale des Glaces · XVIIIe Siècle',
            materials: 'Verre au mercure d\'époque, cadres sculptés en chêne à feuilles d\'or',
            specifications: 'Restauration minutieuse sous la direction des Monuments Historiques',
            description: 'Spectaculaire galerie de réception ornée de miroirs au mercure originaux reflétant la lumière du parc arboré.',
            detailImageUrl: '/tours/details/galerie_glaces_bal.jpg',
            yaw: 0.1,
            pitch: 0.05,
            zoomFov: 32,
          },
          {
            id: 'ballroom-to-cellar',
            type: 'navigation',
            label: 'Chai Historique',
            yaw: -2.1,
            pitch: -0.15,
            targetSceneId: 'cellar',
          },
          {
            id: 'ballroom-to-garden',
            type: 'navigation',
            label: 'Parterre à la Française',
            yaw: 2.1,
            pitch: -0.05,
            targetSceneId: 'garden',
          },
        ],
      },
      {
        id: 'cellar',
        name: 'Chai Souterrain & Barriques de Chêne',
        floor: 'Caves Historiques',
        panoramaUrl: '/tours/panoramas/drachenfels_cellar.jpg',
        thumbnailUrl: '/tours/thumbs/drachenfels_cellar.jpg',
        hotspots: [
          {
            id: 'chateau-detail-fut',
            type: 'detail',
            isBlinking: true,
            label: 'Barriques Chêne de Tronçais',
            title: 'Fûts de Chêne Français pour Élevage Grand Cru',
            category: 'Art du Vin & Tonnellerie d\'Élite',
            artisan: 'Tonnellerie Radoux & Taransaud',
            materials: 'Chêne de la forêt de Tronçais fendu à la main, chauffe moyenne',
            specifications: 'Chai thermo-régulé · Capacité d\'élevage 120 barriques',
            description: 'Cave de vinification séculaire taillée à même la roche calcaire de Saint-Émilion.',
            detailImageUrl: '/tours/details/cave_voutee_pierre.jpg',
            yaw: 0.2,
            pitch: -0.08,
            zoomFov: 32,
          },
          {
            id: 'cellar-to-ballroom',
            type: 'navigation',
            label: 'Galerie des Glaces',
            yaw: 3.14,
            pitch: 0.1,
            targetSceneId: 'ballroom',
          },
        ],
      },
      {
        id: 'garden',
        name: 'Parterre à la Française',
        floor: 'Parc du Château',
        panoramaUrl: '/tours/panoramas/symmetrical_garden.jpg',
        thumbnailUrl: '/tours/thumbs/symmetrical_garden.jpg',
        hotspots: [
          {
            id: 'garden-to-ballroom',
            type: 'navigation',
            label: 'Galerie des Glaces',
            yaw: 0.05,
            pitch: -0.02,
            targetSceneId: 'ballroom',
          },
        ],
      },
    ],
  },

  // Property 6: Chalet d'Alpage "Le Grand Cerf", Megève
  '6': {
    id: 'tour-megeve-006',
    propertyId: '6',
    propertyName: 'Chalet d\'Alpage "Le Grand Cerf"',
    propertyLocation: 'Megève · Route du Mont-d\'Arbois',
    enabled: true,
    tourType: '360',
    startingSceneId: 'chalet-lounge',
    floorPlan: {
      imageUrl: '/tours/plans/chalet-megeve.svg',
      markers: [
        { sceneId: 'chalet-lounge', label: 'Grand Salon Cathédrale', x: 50, y: 35 },
        { sceneId: 'chalet-suite', label: 'Suite Sous Charpente', x: 80, y: 40 },
        { sceneId: 'chalet-spa', label: 'Bassin Balnéo Alpin', x: 30, y: 70 },
      ],
    },
    scenes: [
      {
        id: 'chalet-lounge',
        name: 'Grand Salon Cathédrale en Vieux Bois',
        floor: 'Rez-de-Chaussée Supérieur',
        panoramaUrl: '/tours/panoramas/wooden_lounge.jpg',
        thumbnailUrl: '/tours/thumbs/wooden_lounge.jpg',
        hotspots: [
          {
            id: 'chalet-detail-charpente',
            type: 'detail',
            isBlinking: true,
            label: 'Charpente Vieux Bois Équarri',
            title: 'Charpente Traditionnelle en Mélèze Centenaire',
            category: 'Artisanat Alpin & Charpente d\'Art',
            artisan: 'Maîtres Charpentiers du Val d\'Arly',
            materials: 'Mélèze ancien brossé à la main, chevilles de bois et ferrures forgées',
            specifications: 'Hauteur faîtière 6,50 m · Cheminée monumentale en granit du Mont-Blanc',
            description: 'Poutres séculaires récupérées d\'anciens alpages de Savoie, traitées et sculptées à la main pour créer un cocon montagnard incomparable.',
            detailImageUrl: '/tours/details/charpente_chalet_megeve.jpg',
            yaw: 0.18,
            pitch: 0.25,
            zoomFov: 32,
          },
          {
            id: 'chalet-to-suite',
            type: 'navigation',
            label: 'Suite Sous Charpente',
            yaw: 2.05,
            pitch: 0.05,
            targetSceneId: 'chalet-suite',
          },
          {
            id: 'chalet-to-spa',
            type: 'navigation',
            label: 'Bassin Balnéo & Spa',
            yaw: -2.05,
            pitch: -0.15,
            targetSceneId: 'chalet-spa',
          },
        ],
      },
      {
        id: 'chalet-suite',
        name: 'Suite Sous Charpente Face Mont-Blanc',
        floor: 'Dernier Étage',
        panoramaUrl: '/tours/panoramas/hotel_room.jpg',
        thumbnailUrl: '/tours/thumbs/hotel_room.jpg',
        hotspots: [
          {
            id: 'suite-to-lounge',
            type: 'navigation',
            label: 'Grand Salon Cathédrale',
            yaw: -3.05,
            pitch: -0.05,
            targetSceneId: 'chalet-lounge',
          },
        ],
      },
      {
        id: 'chalet-spa',
        name: 'Bassin Balnéo & Spa Alpin',
        floor: 'Rez-de-Jardin',
        panoramaUrl: '/tours/panoramas/indoor_pool.jpg',
        thumbnailUrl: '/tours/thumbs/indoor_pool.jpg',
        hotspots: [
          {
            id: 'spa-to-lounge',
            type: 'navigation',
            label: 'Grand Salon',
            yaw: 0.15,
            pitch: 0.1,
            targetSceneId: 'chalet-lounge',
          },
        ],
      },
    ],
  },
};

export const DEFAULT_DEMO_TOUR = PROPERTY_TOURS_MAP['1'];

/**
 * Returns tour for given property ID or fallback
 * @param {string|number} propertyId
 * @param {string} [propertyName]
 * @returns {TourData}
 */
export function getTourForProperty(propertyId, propertyName = '') {
  const idStr = String(propertyId || '1');
  if (PROPERTY_TOURS_MAP[idStr]) {
    return PROPERTY_TOURS_MAP[idStr];
  }

  // Name or category matching
  const pName = (propertyName || '').toLowerCase();
  if (pName.includes('nice') || pName.includes('cannes') || pName.includes('mer') || pName.includes('côte') || pName.includes('villa')) {
    return { ...PROPERTY_TOURS_MAP['2'], propertyName };
  }
  if (pName.includes('château') || pName.includes('vignoble') || pName.includes('saint-émilion')) {
    return { ...PROPERTY_TOURS_MAP['3'], propertyName };
  }
  if (pName.includes('megève') || pName.includes('chalet') || pName.includes('alpin')) {
    return { ...PROPERTY_TOURS_MAP['6'], propertyName };
  }

  // Fallback to Property 1
  return { ...PROPERTY_TOURS_MAP['1'], propertyName: propertyName || PROPERTY_TOURS_MAP['1'].propertyName };
}

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
