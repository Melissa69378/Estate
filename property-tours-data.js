// Comprehensive property tour data mapping real properties to authentic 360° walkthroughs

const ASSET_BASE = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG';

function pano(name) {
  return `${ASSET_BASE}/${name}.jpg`;
}

function thumb(name) {
  return `/tours/thumbs/${name}.jpg`;
}

const PROPERTY_TOURS = {
  // 1. Hôtel Particulier Champ-de-Mars (Paris 7e)
  '1': {
    startingSceneId: 'vestibule',
    floorPlan: {
      imageUrl: '/tours/plans/hotel-particulier.svg',
      markers: [
        { sceneId: 'vestibule', label: 'Vestibule d\'Honneur', x: 20, y: 50 },
        { sceneId: 'grand-salon', label: 'Grand Salon de Réception', x: 49, y: 40 },
        { sceneId: 'suite-maitre', label: 'Suite de Maître', x: 79, y: 38 },
        { sceneId: 'salle-de-bains', label: 'Bains & Spa Marbre', x: 79, y: 73 },
        { sceneId: 'jardin', label: 'Jardin & Pavillon', x: 33, y: 78 },
      ],
    },
    scenes: [
      {
        id: 'vestibule',
        name: 'Vestibule d\'Honneur & Escalier Monumental',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('entrance_hall'),
        thumbnailUrl: thumb('entrance_hall'),
        initialView: { yaw: 0.1, pitch: -0.02, fov: 75 },
        hotspots: [
          { id: 'vest-to-salon', type: 'navigation', label: 'Grand Salon de Réception', yaw: 0.1, pitch: -0.05, targetSceneId: 'grand-salon' },
          { id: 'vest-to-jardin', type: 'navigation', label: 'Jardin Privatif & Pavillon', yaw: 2.8, pitch: -0.08, targetSceneId: 'jardin' },
          { id: 'vest-info-1', type: 'info', label: 'Architecture & Finitions', title: 'Architecture Classique du XVIIIe', description: 'Vestibule d\'apparat avec dallage à cabochons de marbre noir, trumeaux sculptés et rampe d\'escalier en fer forgé doré à la feuille.', yaw: -1.2, pitch: 0.12 },
          { id: 'vest-info-2', type: 'info', label: 'Hauteur sous Plafond', title: 'Volumes d\'Exception', description: '4m40 de hauteur sous plafond avec moulures d\'origine restaurées par des artisans d\'art.', yaw: 0.9, pitch: 0.35 },
        ],
      },
      {
        id: 'grand-salon',
        name: 'Grand Salon de Réception',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('ballroom'),
        thumbnailUrl: thumb('ballroom'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-vest', type: 'navigation', label: 'Vestibule d\'Honneur', yaw: 3.1, pitch: -0.05, targetSceneId: 'vestibule' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Monter à la Suite de Maître', yaw: 1.2, pitch: 0.08, targetSceneId: 'suite-maitre' },
          { id: 'salon-info-1', type: 'info', label: 'Boiseries d\'Époque', title: 'Boiseries Régence & Trumeau', description: 'Boiseries sculptées d\'époque Régence avec cheminée monumentale en marbre brèche d\'Alep.', yaw: -1.4, pitch: 0.05 },
          { id: 'salon-info-2', type: 'info', label: 'Lustres d\'Apparat', title: 'Cristal de Baccarat', description: 'Lustre monumental à pampilles en cristal de Baccarat d\'origine du XIXe siècle.', yaw: 0.0, pitch: 0.42 },
        ],
      },
      {
        id: 'suite-maitre',
        name: 'Suite de Maître Champ-de-Mars',
        floor: 'Premier Étage',
        panoramaUrl: pano('en_suite'),
        thumbnailUrl: thumb('en_suite'),
        initialView: { yaw: 0.2, pitch: -0.02, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Grand Salon', yaw: -3.0, pitch: -0.08, targetSceneId: 'grand-salon' },
          { id: 'suite-to-bains', type: 'navigation', label: 'Salle de Bains & Spa Privé', yaw: 1.5, pitch: -0.05, targetSceneId: 'salle-de-bains' },
          { id: 'suite-info-1', type: 'info', label: 'Vue Tour Eiffel', title: 'Balcon Privatif', description: 'Balcon en fer forgé surplombant les arbres de l\'Avenue Émile-Deschanel et la Tour Eiffel.', yaw: -0.8, pitch: 0.08 },
          { id: 'suite-info-2', type: 'info', label: 'Dressing Intégré', title: 'Dressing sur Mesure', description: 'Dressing linéaire en chêne teinté avec éclairage indirect LED intégré et penderies télescopiques.', yaw: 2.1, pitch: 0.02 },
        ],
      },
      {
        id: 'salle-de-bains',
        name: 'Bains & Spa Privé en Marbre',
        floor: 'Premier Étage',
        panoramaUrl: pano('modern_bathroom'),
        thumbnailUrl: thumb('modern_bathroom'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'bains-to-suite', type: 'navigation', label: 'Suite de Maître', yaw: -3.1, pitch: -0.05, targetSceneId: 'suite-maitre' },
          { id: 'bains-info-1', type: 'info', label: 'Marbre Calacatta Oro', title: 'Calacatta & Robinetterie Dorée', description: 'Parois et vasques sculptées dans un bloc unique de marbre blanc Calacatta Oro avec douche ciel de pluie.', yaw: 1.57, pitch: 0.08 },
        ],
      },
      {
        id: 'jardin',
        name: 'Jardin Privatif & Pavillon d\'Hiver',
        floor: 'Extérieur',
        panoramaUrl: pano('residential_garden'),
        thumbnailUrl: thumb('residential_garden'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'jardin-to-vest', type: 'navigation', label: 'Entrer dans l\'Hôtel Particulier', yaw: -0.05, pitch: 0.05, targetSceneId: 'vestibule' },
          { id: 'jardin-info-1', type: 'info', label: 'Jardin Clos de Murs', title: 'Havre de Paix Privatif', description: 'Parc privatif de 180 m² entièrement clos de murs anciens, arboré de buis centenaires et d\'un magnolia sans aucun vis-à-vis.', yaw: 1.8, pitch: 0.05 },
        ],
      },
    ],
  },

  // 2. Villa Belle Époque "Le Roc Fleuri" (Nice)
  '2': {
    startingSceneId: 'terrasse-mer',
    floorPlan: {
      imageUrl: '/tours/plans/villa-riviera.svg',
      markers: [
        { sceneId: 'terrasse-mer', label: 'Terrasse Baie des Anges', x: 27, y: 73 },
        { sceneId: 'grand-salon', label: 'Grand Salon Riviera', x: 57, y: 53 },
        { sceneId: 'suite-royale', label: 'Suite Royale Face Mer', x: 82, y: 53 },
        { sceneId: 'piscine', label: 'Piscine & Solarium', x: 25, y: 30 },
      ],
    },
    scenes: [
      {
        id: 'terrasse-mer',
        name: 'Terrasse Panoramique Baie des Anges',
        floor: 'Terrasse Haute',
        panoramaUrl: pano('lythwood_terrace'),
        thumbnailUrl: thumb('lythwood_terrace'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'terrasse-to-salon', type: 'navigation', label: 'Entrer dans le Grand Salon', yaw: -0.1, pitch: 0.0, targetSceneId: 'grand-salon' },
          { id: 'terrasse-to-piscine', type: 'navigation', label: 'Descendre à la Piscine & Solarium', yaw: -1.8, pitch: -0.1, targetSceneId: 'piscine' },
          { id: 'terrasse-info-1', type: 'info', label: 'Panorama Côte d\'Azur', title: 'Vue Mer à 180°', description: 'Surplombant la Baie des Anges et le Cap de Nice, avec une vue dégagée jusqu\'aux îles de Lérins par temps clair.', yaw: 1.4, pitch: 0.02 },
        ],
      },
      {
        id: 'grand-salon',
        name: 'Grand Salon Riviera & Colonnes Doriques',
        floor: 'Rez-de-jardin',
        panoramaUrl: pano('mirrored_hall'),
        thumbnailUrl: thumb('mirrored_hall'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-terrasse', type: 'navigation', label: 'Sortir sur la Terrasse Panoramique', yaw: 3.1, pitch: -0.02, targetSceneId: 'terrasse-mer' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Monter à la Suite Royale', yaw: 1.4, pitch: 0.05, targetSceneId: 'suite-royale' },
          { id: 'salon-info-1', type: 'info', label: 'Architecture Belle Époque', title: 'Stucs & Colonnes 1900', description: 'Colonnes doriques d\'époque, stucs vénitiens, marbre blanc de Carrare et baies cintrées toute hauteur.', yaw: -1.3, pitch: 0.08 },
        ],
      },
      {
        id: 'suite-royale',
        name: 'Suite Royale Face Mer',
        floor: 'Premier Étage',
        panoramaUrl: pano('relax_inn_seaview_suite'),
        thumbnailUrl: thumb('relax_inn_seaview_suite'),
        initialView: { yaw: 0.1, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Grand Salon', yaw: -3.0, pitch: -0.08, targetSceneId: 'grand-salon' },
          { id: 'suite-info-1', type: 'info', label: 'Chambre de Maître', title: 'Vue Méditerranée', description: 'Vaste chambre de 52 m² avec terrasse privative face aux reflets turquoise de la Méditerranée.', yaw: -0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'piscine',
        name: 'Piscine à Débordement & Solarium',
        floor: 'Extérieur',
        panoramaUrl: pano('pool'),
        thumbnailUrl: thumb('pool'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'piscine-to-terrasse', type: 'navigation', label: 'Remonter vers la Terrasse', yaw: 0.1, pitch: 0.08, targetSceneId: 'terrasse-mer' },
          { id: 'piscine-info-1', type: 'info', label: 'Bassin Miroir au Sel', title: 'Piscine Chauffée', description: 'Bassin à débordement de 12 x 5 mètres chauffé au sel avec plage immergée et solarium en teck de Birmanie.', yaw: 1.6, pitch: -0.05 },
        ],
      },
    ],
  },

  // 3. Château & Vignoble de Saint-Émilion (Gironde)
  '3': {
    startingSceneId: 'cour-honneur',
    floorPlan: {
      imageUrl: '/tours/plans/chateau-vignoble.svg',
      markers: [
        { sceneId: 'cour-honneur', label: 'Cour d\'Honneur', x: 23, y: 53 },
        { sceneId: 'grand-salon', label: 'Salon des Tapisseries', x: 55, y: 36 },
        { sceneId: 'chais', label: 'Chais & Dégustation', x: 55, y: 73 },
        { sceneId: 'suite-seigneuriale', label: 'Suite du Domaine', x: 82, y: 53 },
      ],
    },
    scenes: [
      {
        id: 'cour-honneur',
        name: 'Cour d\'Honneur du Château',
        floor: 'Extérieur',
        panoramaUrl: pano('courtyard'),
        thumbnailUrl: thumb('courtyard'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'cour-to-salon', type: 'navigation', label: 'Entrer dans le Salon des Tapisseries', yaw: 0.05, pitch: 0.0, targetSceneId: 'grand-salon' },
          { id: 'cour-to-chais', type: 'navigation', label: 'Descendre aux Chais Historiques', yaw: -1.7, pitch: -0.1, targetSceneId: 'chais' },
          { id: 'cour-info-1', type: 'info', label: 'Domaine Viticole Classé', title: 'Grand Cru de Saint-Émilion', description: 'Propriété viticole de 4,5 hectares entourant le château XVIIIe avec vue sur le clocher monolithe.', yaw: 1.5, pitch: 0.05 },
        ],
      },
      {
        id: 'grand-salon',
        name: 'Grand Salon des Tapisseries XVIIIe',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('ballroom'),
        thumbnailUrl: thumb('ballroom'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-cour', type: 'navigation', label: 'Sortir vers la Cour d\'Honneur', yaw: 3.1, pitch: -0.05, targetSceneId: 'cour-honneur' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Accéder à la Suite Seigneuriale', yaw: 1.3, pitch: 0.05, targetSceneId: 'suite-seigneuriale' },
          { id: 'salon-info-1', type: 'info', label: 'Salons d\'Apparat', title: 'Tapisseries & Poutres', description: 'Tapisseries d\'Aubusson d\'époque, parquet Versailles en chêne de Tronçais et cheminée monumentale en pierre dorée.', yaw: -1.4, pitch: 0.08 },
        ],
      },
      {
        id: 'chais',
        name: 'Chais Historiques & Salle de Dégustation',
        floor: 'Sous-sol Voûté',
        panoramaUrl: pano('drachenfels_cellar'),
        thumbnailUrl: thumb('drachenfels_cellar'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'chais-to-cour', type: 'navigation', label: 'Remonter à la Cour d\'Honneur', yaw: 3.14, pitch: 0.1, targetSceneId: 'cour-honneur' },
          { id: 'chais-info-1', type: 'info', label: 'Élevage en Barriques', title: 'Cave de Vieillissement', description: 'Cave voûtée du XVIIe siècle taillée dans le calcaire coquillier, maintenant une hygrométrie et température constantes pour 15 000 flacons.', yaw: 0.8, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-seigneuriale',
        name: 'Suite Seigneuriale du Domaine',
        floor: 'Premier Étage',
        panoramaUrl: pano('hotel_room'),
        thumbnailUrl: thumb('hotel_room'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Grand Salon', yaw: -3.0, pitch: -0.08, targetSceneId: 'grand-salon' },
          { id: 'suite-info-1', type: 'info', label: 'Vue Vignes', title: 'Panorama sur le Vignoble', description: 'Suite de maître de 58 m² dominant les rangs de vigne du domaine et le parc aux cèdres séculaires.', yaw: -0.8, pitch: 0.05 },
        ],
      },
    ],
  },

  // 4. Appartement de Réception Place des Vosges (Paris 4e)
  '4': {
    startingSceneId: 'salon-traversant',
    floorPlan: {
      imageUrl: '/tours/plans/appartement-prestige.svg',
      markers: [
        { sceneId: 'salon-traversant', label: 'Grand Salon Traversant', x: 33, y: 50 },
        { sceneId: 'bibliotheque', label: 'Bibliothèque en Noyer', x: 33, y: 78 },
        { sceneId: 'suite-vosges', label: 'Suite de Maître', x: 75, y: 46 },
        { sceneId: 'bains-vosges', label: 'Bains en Marbre', x: 75, y: 76 },
      ],
    },
    scenes: [
      {
        id: 'salon-traversant',
        name: 'Grand Salon Traversant Place des Vosges',
        floor: '2e Étage Noble',
        panoramaUrl: pano('aft_lounge'),
        thumbnailUrl: thumb('aft_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-biblio', type: 'navigation', label: 'Entrer dans la Bibliothèque en Noyer', yaw: 1.5, pitch: -0.03, targetSceneId: 'bibliotheque' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Vers la Suite de Maître', yaw: -1.7, pitch: -0.02, targetSceneId: 'suite-vosges' },
          { id: 'salon-info-1', type: 'info', label: 'Vue Place Royale', title: 'Place des Vosges', description: 'Perspective directe sur les arcades et les toits d\'ardoise de la plus ancienne place royale de Paris.', yaw: 0.0, pitch: 0.05 },
          { id: 'salon-info-2', type: 'info', label: 'Parquet d\'Époque', title: 'Point de Hongrie', description: 'Parquet en chêne massif point de Hongrie d\'origine et cheminée sculptée d\'époque Louis XIII.', yaw: -0.8, pitch: -0.2 },
        ],
      },
      {
        id: 'bibliotheque',
        name: 'Bibliothèque en Noyer & Cabinet de Travail',
        floor: '2e Étage Noble',
        panoramaUrl: pano('reading_room'),
        thumbnailUrl: thumb('reading_room'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'biblio-to-salon', type: 'navigation', label: 'Retour au Grand Salon', yaw: -3.0, pitch: -0.02, targetSceneId: 'salon-traversant' },
          { id: 'biblio-info-1', type: 'info', label: 'Menuiseries d\'Art', title: 'Bibliothèque sur Mesure', description: 'Rayonnages toute hauteur en noyer de France massif réalisés par les Compagnons du Devoir avec échelle laiton.', yaw: 0.8, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-vosges',
        name: 'Suite de Maître sur Cour Royale',
        floor: '2e Étage Noble',
        panoramaUrl: pano('lythwood_room'),
        thumbnailUrl: thumb('lythwood_room'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Retour au Salon Principal', yaw: 3.1, pitch: -0.02, targetSceneId: 'salon-traversant' },
          { id: 'suite-to-bains', type: 'navigation', label: 'Salle de Bains Privative', yaw: 1.2, pitch: -0.05, targetSceneId: 'bains-vosges' },
          { id: 'suite-info-1', type: 'info', label: 'Calme Absolu', title: 'Chambre sur Cour Classée', description: 'Orientée sur la cour d\'honneur pavée classée, offrant une quiétude absolue au cœur du Marais.', yaw: -0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'bains-vosges',
        name: 'Bains en Marbre & Baignoire Îlot',
        floor: '2e Étage Noble',
        panoramaUrl: pano('modern_bathroom'),
        thumbnailUrl: thumb('modern_bathroom'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'bains-to-suite', type: 'navigation', label: 'Retour à la Suite', yaw: -3.1, pitch: -0.02, targetSceneId: 'suite-vosges' },
          { id: 'bains-info-1', type: 'info', label: 'Matériaux Haut de Gamme', title: 'Marbre & Robinetterie Vola', description: 'Baignoire monobloc sculptée dans la pierre, double vasque et douche à l\'italienne ciel de pluie.', yaw: 1.4, pitch: 0.05 },
        ],
      },
    ],
  },

  // 5. Bastide Provençale en Pierre du Luberon (Gordes)
  '5': {
    startingSceneId: 'cour-calade',
    floorPlan: {
      imageUrl: '/tours/plans/bastide-luberon.svg',
      markers: [
        { sceneId: 'cour-calade', label: 'Cour en Calade', x: 23, y: 70 },
        { sceneId: 'salon-voute', label: 'Salon Voûté en Pierre', x: 53, y: 53 },
        { sceneId: 'veranda-ete', label: 'Véranda & Salle d\'Été', x: 23, y: 34 },
        { sceneId: 'suite-luberon', label: 'Suite du Luberon', x: 80, y: 36 },
        { sceneId: 'bassin-restanques', label: 'Bassin & Restanques', x: 80, y: 72 },
      ],
    },
    scenes: [
      {
        id: 'cour-calade',
        name: 'Cour en Calade sous les Mûriers',
        floor: 'Extérieur',
        panoramaUrl: pano('courtyard'),
        thumbnailUrl: thumb('courtyard'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'cour-to-salon', type: 'navigation', label: 'Entrer dans la Bastide', yaw: 0.1, pitch: 0.0, targetSceneId: 'salon-voute' },
          { id: 'cour-to-bassin', type: 'navigation', label: 'Aller au Bassin de Nage', yaw: 1.8, pitch: -0.05, targetSceneId: 'bassin-restanques' },
          { id: 'cour-info-1', type: 'info', label: 'Pierres & Calades', title: 'Fontaine Provençale', description: 'Cour pavée de pierres de calade traditionnelles, fontaine à tête de lion et ombre des mûriers centenaires.', yaw: -1.2, pitch: 0.05 },
        ],
      },
      {
        id: 'salon-voute',
        name: 'Salon Voûté en Pierre du Luberon',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('lythwood_lounge'),
        thumbnailUrl: thumb('lythwood_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-cour', type: 'navigation', label: 'Sortir dans la Cour en Calade', yaw: -3.1, pitch: -0.02, targetSceneId: 'cour-calade' },
          { id: 'salon-to-veranda', type: 'navigation', label: 'Vers la Véranda & Salle d\'Été', yaw: 1.4, pitch: 0.0, targetSceneId: 'veranda-ete' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Monter à la Suite Principale', yaw: -1.3, pitch: 0.08, targetSceneId: 'suite-luberon' },
          { id: 'salon-info-1', type: 'info', label: 'Murs en Pierre Sèche', title: 'Cheminée Rustique', description: 'Murs de pierre du Luberon de 80 cm d\'épaisseur assurant une fraîcheur naturelle, grand foyer ouvert d\'époque.', yaw: 0.2, pitch: 0.05 },
        ],
      },
      {
        id: 'veranda-ete',
        name: 'Véranda & Salle à Manger d\'Été',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('veranda'),
        thumbnailUrl: thumb('veranda'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'veranda-to-salon', type: 'navigation', label: 'Retour au Salon Voûté', yaw: -3.0, pitch: -0.02, targetSceneId: 'salon-voute' },
          { id: 'veranda-info-1', type: 'info', label: 'Vue Luberon', title: 'Verrière Forgée', description: 'Vue panoramique sur les restanques d\'oliviers et les crêtes du massif du Luberon.', yaw: 0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-luberon',
        name: 'Suite Principale sous Charpente Blanchie',
        floor: 'Premier Étage',
        panoramaUrl: pano('en_suite'),
        thumbnailUrl: thumb('en_suite'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Salon', yaw: -3.1, pitch: -0.08, targetSceneId: 'salon-voute' },
          { id: 'suite-info-1', type: 'info', label: 'Tomettes de Salernes', title: 'Ambiance Provençale', description: 'Tomettes anciennes polies à la cire, poutres apparentes blanchies à la chaux et salle de bains privative.', yaw: 0.3, pitch: 0.05 },
        ],
      },
      {
        id: 'bassin-restanques',
        name: 'Bassin de Nage & Restanques d\'Oliviers',
        floor: 'Extérieur',
        panoramaUrl: pano('pool'),
        thumbnailUrl: thumb('pool'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'bassin-to-cour', type: 'navigation', label: 'Retour à la Cour', yaw: -1.7, pitch: 0.05, targetSceneId: 'cour-calade' },
          { id: 'bassin-info-1', type: 'info', label: 'Bassin & Borie', title: 'Bassin de Nage 15m', description: 'Bassin chauffé en pierre naturelle s\'intégrant aux restanques plantées de 80 oliviers séculaires avec borie restaurée.', yaw: 1.2, pitch: -0.05 },
        ],
      },
    ],
  },

  // 6. Chalet d'Alpage "Le Grand Cerf" (Megève)
  '6': {
    startingSceneId: 'salon-cathedrale',
    floorPlan: {
      imageUrl: '/tours/plans/chalet-megeve.svg',
      markers: [
        { sceneId: 'salon-cathedrale', label: 'Salon Cathédrale en Vieux Bois', x: 36, y: 39 },
        { sceneId: 'terrasse-neige', label: 'Terrasse Mont-Blanc', x: 26, y: 74 },
        { sceneId: 'suite-cimes', label: 'Master Suite des Cimes', x: 78, y: 35 },
        { sceneId: 'spa-megeve', label: 'Spa & Sauna Norvégien', x: 78, y: 71 },
      ],
    },
    scenes: [
      {
        id: 'salon-cathedrale',
        name: 'Grand Salon Cathédrale en Vieux Bois',
        floor: 'Rez-de-chaussée Haut',
        panoramaUrl: pano('wooden_lounge'),
        thumbnailUrl: thumb('wooden_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-terrasse', type: 'navigation', label: 'Sortir sur la Terrasse Mont-Blanc', yaw: 1.5, pitch: -0.05, targetSceneId: 'terrasse-neige' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Master Suite des Cimes', yaw: -1.6, pitch: 0.08, targetSceneId: 'suite-cimes' },
          { id: 'salon-to-spa', type: 'navigation', label: 'Descendre au Spa & Sauna', yaw: 3.1, pitch: -0.1, targetSceneId: 'spa-megeve' },
          { id: 'salon-info-1', type: 'info', label: 'Vieux Mélèze Brossé', title: 'Fuste Artisanale', description: 'Fuste authentique en vieux mélèze de pays, cheminée centrale suspendue et hauteur sous faîtage de 6 mètres.', yaw: 0.1, pitch: 0.05 },
          { id: 'salon-info-2', type: 'info', label: 'Vue Mont-Blanc', title: 'Panorama Alpin', description: 'Vitrage panoramique thermique offrant une perspective directe sur le Mont-d\'Arbois et la chaîne du Mont-Blanc.', yaw: -1.2, pitch: 0.08 },
        ],
      },
      {
        id: 'terrasse-neige',
        name: 'Terrasse Panoramique Mont-Blanc',
        floor: 'Extérieur',
        panoramaUrl: pano('lythwood_terrace'),
        thumbnailUrl: thumb('lythwood_terrace'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'terrasse-to-salon', type: 'navigation', label: 'Entrer dans le Salon Cathédrale', yaw: -0.1, pitch: 0.0, targetSceneId: 'salon-cathedrale' },
          { id: 'terrasse-info-1', type: 'info', label: 'Terrasse Plein Sud', title: 'Decking & Braséro', description: '70 m² de terrasse en vieux bois équipée de braséros d\'ambiance et chauffage infrarouge extérieur pour l\'après-ski.', yaw: 1.3, pitch: 0.02 },
        ],
      },
      {
        id: 'suite-cimes',
        name: 'Master Suite des Cimes & Balcon',
        floor: 'Dernier Étage',
        panoramaUrl: pano('lythwood_room'),
        thumbnailUrl: thumb('lythwood_room'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Salon', yaw: -3.0, pitch: -0.08, targetSceneId: 'salon-cathedrale' },
          { id: 'suite-info-1', type: 'info', label: 'Cocon Alpin', title: 'Suite Panoramique', description: 'Ambiance refuge d\'exception avec fourrure d\'alpage, dressing en mélèze massif et balcon privé face aux cimes.', yaw: -0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'spa-megeve',
        name: 'Espace Bien-être Spa, Piscine & Sauna',
        floor: 'Rez-de-jardin',
        panoramaUrl: pano('indoor_pool'),
        thumbnailUrl: thumb('indoor_pool'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'spa-to-salon', type: 'navigation', label: 'Remonter au Salon Cathédrale', yaw: 0.05, pitch: 0.1, targetSceneId: 'salon-cathedrale' },
          { id: 'spa-info-1', type: 'info', label: 'Spa Privé', title: 'Bain Chaud & Sauna Norvégien', description: 'Bassin chauffé avec nage à contre-courant, sauna norvégien en pin polaire et hammam en mosaïque nacrée.', yaw: 1.5, pitch: -0.05 },
        ],
      },
    ],
  },

  // 7. Manoir Anglo-Normand du Triangle d'Or (Deauville)
  '7': {
    startingSceneId: 'hall-colombages',
    floorPlan: {
      imageUrl: '/tours/plans/manoir-ocean.svg',
      markers: [
        { sceneId: 'hall-colombages', label: 'Hall d\'Honneur', x: 20, y: 53 },
        { sceneId: 'salon-reception', label: 'Salon de Réception', x: 54, y: 38 },
        { sceneId: 'veranda-parc', label: 'Véranda & Parc', x: 54, y: 73 },
        { sceneId: 'suite-deauville', label: 'Suite Parentale', x: 83, y: 53 },
      ],
    },
    scenes: [
      {
        id: 'hall-colombages',
        name: 'Hall d\'Honneur aux Colombages d\'Époque',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('entrance_hall'),
        thumbnailUrl: thumb('entrance_hall'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'hall-to-salon', type: 'navigation', label: 'Vers le Salon de Réception', yaw: 0.1, pitch: -0.02, targetSceneId: 'salon-reception' },
          { id: 'hall-to-veranda', type: 'navigation', label: 'Vers la Véranda & Parc', yaw: 2.7, pitch: -0.05, targetSceneId: 'veranda-parc' },
          { id: 'hall-info-1', type: 'info', label: 'Style Anglo-Normand', title: 'Pans de Bois Ciselés', description: 'Colombages authentiques en chêne de Normandie, escalier hélicoïdal sculpté et carrelage d\'époque.', yaw: -1.2, pitch: 0.08 },
        ],
      },
      {
        id: 'salon-reception',
        name: 'Salon de Réception avec Cheminée',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('lythwood_lounge'),
        thumbnailUrl: thumb('lythwood_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-hall', type: 'navigation', label: 'Retour au Hall d\'Honneur', yaw: 3.1, pitch: -0.02, targetSceneId: 'hall-colombages' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Monter à la Suite Parentale', yaw: 1.3, pitch: 0.08, targetSceneId: 'suite-deauville' },
          { id: 'salon-info-1', type: 'info', label: 'Cheminée Normande', title: 'Foyer Monumental', description: 'Cheminée en briques de pays surmontée d\'un manteau de chêne massif patiné et bow-window sur jardin.', yaw: 0.2, pitch: 0.05 },
        ],
      },
      {
        id: 'veranda-parc',
        name: 'Véranda & Jardin d\'Hiver sur Parc',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('veranda'),
        thumbnailUrl: thumb('veranda'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'veranda-to-hall', type: 'navigation', label: 'Retour au Hall', yaw: -3.0, pitch: -0.02, targetSceneId: 'hall-colombages' },
          { id: 'veranda-info-1', type: 'info', label: 'Parc Arboré', title: 'Hortensias & Pommiers', description: 'Vue sur le parc privé de 2 400 m² orné d\'hortensias bleus de Normandie et de pommiers centenaires.', yaw: 0.8, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-deauville',
        name: 'Suite Parentale avec Bow-Window',
        floor: 'Premier Étage',
        panoramaUrl: pano('hotel_room'),
        thumbnailUrl: thumb('hotel_room'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Salon', yaw: -3.1, pitch: -0.08, targetSceneId: 'salon-reception' },
          { id: 'suite-info-1', type: 'info', label: 'Triangle d\'Or', title: 'Vue Villas Historiques', description: 'Chambre de maître avec coin lecture aménagé dans le bow-window surplombant les propriétés classées.', yaw: -0.6, pitch: 0.05 },
        ],
      },
    ],
  },

  // 8. Penthouse Panoramique Parc Tête d'Or (Lyon 6e)
  '8': {
    startingSceneId: 'sejour-panoramique',
    floorPlan: {
      imageUrl: '/tours/plans/appartement-prestige.svg',
      markers: [
        { sceneId: 'sejour-panoramique', label: 'Séjour Traversant 100 m²', x: 33, y: 50 },
        { sceneId: 'espace-reception', label: 'Espace Réception & Cuisine', x: 33, y: 78 },
        { sceneId: 'rooftop-jardin', label: 'Toit-Terrasse Panoramique', x: 50, y: 24 },
        { sceneId: 'suite-lyon', label: 'Suite Panoramique', x: 75, y: 46 },
      ],
    },
    scenes: [
      {
        id: 'sejour-panoramique',
        name: 'Séjour Traversant 100 m² Vue Parc',
        floor: 'Dernier Étage',
        panoramaUrl: pano('anniversary_lounge'),
        thumbnailUrl: thumb('anniversary_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'sejour-to-espace', type: 'navigation', label: 'Vers l\'Espace Réception & Cuisine', yaw: 1.5, pitch: -0.02, targetSceneId: 'espace-reception' },
          { id: 'sejour-to-rooftop', type: 'navigation', label: 'Sortir sur le Toit-Terrasse', yaw: -1.7, pitch: 0.0, targetSceneId: 'rooftop-jardin' },
          { id: 'sejour-to-suite', type: 'navigation', label: 'Vers la Suite Panoramique', yaw: 3.0, pitch: -0.02, targetSceneId: 'suite-lyon' },
          { id: 'sejour-info-1', type: 'info', label: 'Vue Parc de la Tête d\'Or', title: 'Panorama Exceptionnel', description: 'Vue plongeante sur le lac et la canopée du Parc de la Tête d\'Or ainsi que sur la colline de Fourvière.', yaw: -0.4, pitch: 0.05 },
          { id: 'sejour-info-2', type: 'info', label: 'Prestations Contemporaines', title: 'Béton Ciré & Domotique', description: 'Sol en béton ciré grand format, baies coulissantes minimalistes sans seuil et domotique intégrale.', yaw: 0.8, pitch: -0.1 },
        ],
      },
      {
        id: 'espace-reception',
        name: 'Espace Réception & Cuisine Minimaliste',
        floor: 'Dernier Étage',
        panoramaUrl: pano('photo_studio_loft_hall'),
        thumbnailUrl: thumb('photo_studio_loft_hall'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'espace-to-sejour', type: 'navigation', label: 'Retour au Séjour Principal', yaw: -3.0, pitch: -0.02, targetSceneId: 'sejour-panoramique' },
          { id: 'espace-info-1', type: 'info', label: 'Îlot en Quartz', title: 'Cuisine d\'Architecte', description: 'Îlot central monobloc de 4 mètres en quartz noir mat, cave à vin Gaggenau et électroménager encastré.', yaw: 0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'rooftop-jardin',
        name: 'Toit-Terrasse Panoramique Végétalisé',
        floor: 'Rooftop',
        panoramaUrl: pano('roof_garden'),
        thumbnailUrl: thumb('roof_garden'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'rooftop-to-sejour', type: 'navigation', label: 'Rentrer dans le Séjour', yaw: 0.05, pitch: -0.05, targetSceneId: 'sejour-panoramique' },
          { id: 'rooftop-info-1', type: 'info', label: 'Jardin Suspendu & Spa', title: 'Toit-Terrasse 140 m²', description: 'Terrasse plein ciel paysagée d\'oliviers en bacs, pergola bioclimatique et jacuzzi 6 places face à la ville.', yaw: 1.4, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-lyon',
        name: 'Suite Panoramique avec Dressing',
        floor: 'Dernier Étage',
        panoramaUrl: pano('en_suite'),
        thumbnailUrl: thumb('en_suite'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-sejour', type: 'navigation', label: 'Retour au Séjour', yaw: 3.1, pitch: -0.02, targetSceneId: 'sejour-panoramique' },
          { id: 'suite-info-1', type: 'info', label: 'Vue Fourvière', title: 'Couchers de Soleil', description: 'Suite parentale avec baie vitrée orientée ouest pour admirer les couchers de soleil sur la basilique.', yaw: -0.5, pitch: 0.05 },
        ],
      },
    ],
  },

  // 9. Maison de Maître & Pavillon d'Amis (Biarritz Le Phare)
  '9': {
    startingSceneId: 'terrasse-ocean',
    floorPlan: {
      imageUrl: '/tours/plans/manoir-ocean.svg',
      markers: [
        { sceneId: 'terrasse-ocean', label: 'Terrasse Face Océan', x: 20, y: 53 },
        { sceneId: 'double-salon', label: 'Double Salon Ouvert', x: 54, y: 38 },
        { sceneId: 'suite-imperatrice', label: 'Suite de l\'Impératrice', x: 83, y: 53 },
        { sceneId: 'jardin-pavillon', label: 'Jardin & Pavillon d\'Amis', x: 54, y: 73 },
      ],
    },
    scenes: [
      {
        id: 'terrasse-ocean',
        name: 'Terrasse Face à l\'Océan Atlantique & Phare',
        floor: 'Extérieur Haut',
        panoramaUrl: pano('illovo_beach_balcony'),
        thumbnailUrl: thumb('illovo_beach_balcony'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'terrasse-to-salon', type: 'navigation', label: 'Entrer dans le Double Salon', yaw: -0.1, pitch: 0.0, targetSceneId: 'double-salon' },
          { id: 'terrasse-to-jardin', type: 'navigation', label: 'Descendre au Jardin Paysager', yaw: 1.8, pitch: -0.1, targetSceneId: 'jardin-pavillon' },
          { id: 'terrasse-info-1', type: 'info', label: 'Vue Phare & Océan', title: 'Panorama Basque', description: 'Surplombant l\'océan Atlantique et la plage du Miramar avec vue emblématique sur le phare de Biarritz.', yaw: 1.3, pitch: 0.02 },
        ],
      },
      {
        id: 'double-salon',
        name: 'Double Salon Ouvert sur les Flots',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('aft_lounge'),
        thumbnailUrl: thumb('aft_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-terrasse', type: 'navigation', label: 'Sortir sur la Terrasse Océan', yaw: 3.1, pitch: -0.02, targetSceneId: 'terrasse-ocean' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Monter à la Suite de l\'Impératrice', yaw: 1.4, pitch: 0.05, targetSceneId: 'suite-imperatrice' },
          { id: 'salon-info-1', type: 'info', label: 'Lumière Océanique', title: 'Salons de Réception', description: 'Double séjour de 75 m² baigné de lumière marine, cheminée en marbre des Pyrénées et parquets anciens.', yaw: -1.2, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-imperatrice',
        name: 'Suite Océane de l\'Impératrice',
        floor: 'Premier Étage',
        panoramaUrl: pano('relax_inn_seaview_suite'),
        thumbnailUrl: thumb('relax_inn_seaview_suite'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Double Salon', yaw: -3.0, pitch: -0.08, targetSceneId: 'double-salon' },
          { id: 'suite-info-1', type: 'info', label: 'Chambre de Maître', title: 'Face aux Vagues', description: 'Chambre de maître avec loggia privée pour s\'endormir au rythme des vagues de l\'Atlantique.', yaw: -0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'jardin-pavillon',
        name: 'Jardin Paysager Atlantique & Pavillon d\'Amis',
        floor: 'Extérieur',
        panoramaUrl: pano('studio_garden'),
        thumbnailUrl: thumb('studio_garden'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'jardin-to-terrasse', type: 'navigation', label: 'Remonter à la Terrasse Principale', yaw: -1.8, pitch: 0.08, targetSceneId: 'terrasse-ocean' },
          { id: 'jardin-info-1', type: 'info', label: 'Pavillon Indépendant', title: 'Maison d\'Amis 80 m²', description: 'Jardin planté de pins maritimes et d\'hortensias menant au pavillon d\'invités avec 2 suites et salon indépendant.', yaw: 1.5, pitch: 0.05 },
        ],
      },
    ],
  },

  // 10. Hôtel Particulier du Quartier Mazarin (Aix-en-Provence)
  '10': {
    startingSceneId: 'jardin-secret',
    floorPlan: {
      imageUrl: '/tours/plans/hotel-particulier.svg',
      markers: [
        { sceneId: 'jardin-secret', label: 'Jardin Secret & Fontaine', x: 33, y: 78 },
        { sceneId: 'salon-gypseries', label: 'Grand Salon aux Gypseries', x: 49, y: 40 },
        { sceneId: 'bibliotheque-aix', label: 'Cabinet de Lecture', x: 20, y: 50 },
        { sceneId: 'suite-mazarin', label: 'Suite Bourgeoise', x: 79, y: 38 },
      ],
    },
    scenes: [
      {
        id: 'jardin-secret',
        name: 'Jardin Secret aux Oliviers & Fontaine',
        floor: 'Extérieur',
        panoramaUrl: pano('sunny_rose_garden'),
        thumbnailUrl: thumb('sunny_rose_garden'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'jardin-to-salon', type: 'navigation', label: 'Entrer dans le Grand Salon Régence', yaw: 0.05, pitch: 0.0, targetSceneId: 'salon-gypseries' },
          { id: 'jardin-info-1', type: 'info', label: 'Havre de Sérénité Aixois', title: 'Fontaine en Calissanne', description: 'Jardin clos de 200 m² à l\'abri des regards, orné d\'oliviers taillés et d\'une fontaine en pierre de Calissanne.', yaw: 1.5, pitch: 0.05 },
        ],
      },
      {
        id: 'salon-gypseries',
        name: 'Grand Salon aux Gypseries & Cheminée Régence',
        floor: 'Rez-de-chaussée Noble',
        panoramaUrl: pano('ballroom'),
        thumbnailUrl: thumb('ballroom'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-jardin', type: 'navigation', label: 'Sortir vers le Jardin Secret', yaw: 3.1, pitch: -0.02, targetSceneId: 'jardin-secret' },
          { id: 'salon-to-biblio', type: 'navigation', label: 'Vers le Cabinet de Lecture', yaw: 1.2, pitch: 0.0, targetSceneId: 'bibliotheque-aix' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Monter à la Suite Bourgeoise', yaw: -1.4, pitch: 0.08, targetSceneId: 'suite-mazarin' },
          { id: 'salon-info-1', type: 'info', label: 'Gypseries Ciselées', title: 'Décor XVIIIe Siècle', description: 'Splendides gypseries aixoises représentant les quatre saisons, cheminée d\'époque en marbre de Saint-Antonin.', yaw: -0.8, pitch: 0.05 },
        ],
      },
      {
        id: 'bibliotheque-aix',
        name: 'Cabinet de Lecture & Bibliothèque Boisée',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('reading_room'),
        thumbnailUrl: thumb('reading_room'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'biblio-to-salon', type: 'navigation', label: 'Retour au Grand Salon', yaw: -3.0, pitch: -0.02, targetSceneId: 'salon-gypseries' },
          { id: 'biblio-info-1', type: 'info', label: 'Boiseries d\'Art', title: 'Noyer Ciré & Ouvrages Rares', description: 'Boiseries murales en noyer de Provence et rayonnages d\'angle sur mesure abritant des éditions rares.', yaw: 0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-mazarin',
        name: 'Suite Bourgeoise sous Plafonds à la Française',
        floor: 'Premier Étage',
        panoramaUrl: pano('hotel_room'),
        thumbnailUrl: thumb('hotel_room'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Grand Salon', yaw: -3.1, pitch: -0.08, targetSceneId: 'salon-gypseries' },
          { id: 'suite-info-1', type: 'info', label: 'Plafonds à la Française', title: 'Hauteur 3m80 & Balconnet', description: 'Tomettes aixoises cirées, poutres apparentes peintes et balconnet en fer forgé sur la rue Cardinale.', yaw: -0.5, pitch: 0.05 },
        ],
      },
    ],
  },

  // 11. Villa d'Architecte en Cèdre & Accès Bassin (Cap-Ferret)
  '11': {
    startingSceneId: 'deck-pins',
    floorPlan: {
      imageUrl: '/tours/plans/villa-riviera.svg',
      markers: [
        { sceneId: 'deck-pins', label: 'Decking sous les Pins', x: 27, y: 73 },
        { sceneId: 'salon-cabane', label: 'Salon Esprit Cabane', x: 57, y: 53 },
        { sceneId: 'suite-dune', label: 'Suite Dune & Bassin', x: 82, y: 53 },
        { sceneId: 'couloir-nage', label: 'Couloir de Nage en Bois', x: 25, y: 30 },
      ],
    },
    scenes: [
      {
        id: 'deck-pins',
        name: 'Decking en Bois sous les Pins Maritimes',
        floor: 'Extérieur',
        panoramaUrl: pano('qwantani_patio'),
        thumbnailUrl: thumb('qwantani_patio'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'deck-to-salon', type: 'navigation', label: 'Entrer dans le Salon Traversant', yaw: 0.05, pitch: 0.0, targetSceneId: 'salon-cabane' },
          { id: 'deck-to-couloir', type: 'navigation', label: 'Aller au Couloir de Nage', yaw: 1.8, pitch: -0.05, targetSceneId: 'couloir-nage' },
          { id: 'deck-info-1', type: 'info', label: 'Esprit Cap-Ferret', title: 'Terrasse en Pin d\'Oregon', description: 'Terrasse de 150 m² suspendue sous les pins parasols, à 50 mètres de la plage du Bassin d\'Arcachon.', yaw: 1.2, pitch: 0.05 },
        ],
      },
      {
        id: 'salon-cabane',
        name: 'Salon Traversant Esprit Cabane & Poêle à Bois',
        floor: 'Rez-de-jardin',
        panoramaUrl: pano('wooden_lounge'),
        thumbnailUrl: thumb('wooden_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salon-to-deck', type: 'navigation', label: 'Sortir sur le Decking', yaw: 3.1, pitch: -0.02, targetSceneId: 'deck-pins' },
          { id: 'salon-to-suite', type: 'navigation', label: 'Vers la Suite Principale', yaw: 1.3, pitch: 0.05, targetSceneId: 'suite-dune' },
          { id: 'salon-info-1', type: 'info', label: 'Architecture Bioclimatique', title: 'Cèdre Rouge & Baies Galandage', description: 'Bardage en cèdre rouge imputrescible, poêle suspendu Focus et baies vitrées à effacement total dans les murs.', yaw: -0.8, pitch: 0.05 },
        ],
      },
      {
        id: 'suite-dune',
        name: 'Suite Principale avec Accès Direct à la Dune',
        floor: 'Premier Étage',
        panoramaUrl: pano('relax_inn_seaview_suite'),
        thumbnailUrl: thumb('relax_inn_seaview_suite'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'suite-to-salon', type: 'navigation', label: 'Descendre au Salon', yaw: -3.0, pitch: -0.08, targetSceneId: 'salon-cabane' },
          { id: 'suite-info-1', type: 'info', label: 'Passerelle Privée', title: 'Accès Direct à la Plage', description: 'Suite de maître ouvrant sur une passerelle privée en bois serpentant à travers les oyats jusqu\'à la plage.', yaw: -0.5, pitch: 0.05 },
        ],
      },
      {
        id: 'couloir-nage',
        name: 'Couloir de Nage en Bois Immergé dans la Végétation',
        floor: 'Extérieur',
        panoramaUrl: pano('pool'),
        thumbnailUrl: thumb('pool'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'couloir-to-deck', type: 'navigation', label: 'Retour au Decking Principal', yaw: -1.7, pitch: 0.05, targetSceneId: 'deck-pins' },
          { id: 'couloir-info-1', type: 'info', label: 'Bassin Éco-Conçu', title: 'Couloir de Nage 18m', description: 'Couloir de nage bordé de cèdre naturel avec filtration biologique et pompe à chaleur dissimulée dans les dunes.', yaw: 1.4, pitch: -0.05 },
        ],
      },
    ],
  },

  // 12. Manoir Breton des Marais & Dépendances (Guérande)
  '12': {
    startingSceneId: 'cour-granit',
    floorPlan: {
      imageUrl: '/tours/plans/chateau-vignoble.svg',
      markers: [
        { sceneId: 'cour-granit', label: 'Cour Médiévale en Granit', x: 23, y: 53 },
        { sceneId: 'grand-foyer', label: 'Salon au Foyer Monumental', x: 55, y: 36 },
        { sceneId: 'salle-basse', label: 'Salle Basse Voûtée', x: 55, y: 73 },
        { sceneId: 'parc-seculaire', label: 'Parc Boisé de 2 Hectares', x: 82, y: 53 },
      ],
    },
    scenes: [
      {
        id: 'cour-granit',
        name: 'Cour Médiévale en Granit & Tourelles',
        floor: 'Extérieur',
        panoramaUrl: pano('courtyard'),
        thumbnailUrl: thumb('courtyard'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'cour-to-foyer', type: 'navigation', label: 'Entrer dans le Grand Salon au Foyer Monumental', yaw: 0.05, pitch: 0.0, targetSceneId: 'grand-foyer' },
          { id: 'cour-to-salle', type: 'navigation', label: 'Descendre à la Salle Basse Voûtée', yaw: -1.7, pitch: -0.1, targetSceneId: 'salle-basse' },
          { id: 'cour-info-1', type: 'info', label: 'Patrimoine Historique XVe', title: 'Granit Breton & Tourelles', description: 'Façade en moellons de granit taillés à la main, échauguette d\'angle et puits médiéval aux armoiries préservées.', yaw: 1.4, pitch: 0.05 },
        ],
      },
      {
        id: 'grand-foyer',
        name: 'Grand Salon au Foyer Monumental en Granit',
        floor: 'Rez-de-chaussée',
        panoramaUrl: pano('lythwood_lounge'),
        thumbnailUrl: thumb('lythwood_lounge'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'foyer-to-cour', type: 'navigation', label: 'Sortir vers la Cour Médiévale', yaw: 3.1, pitch: -0.02, targetSceneId: 'cour-granit' },
          { id: 'foyer-to-parc', type: 'navigation', label: 'Aller au Parc Boisé de 2 Hectares', yaw: 1.4, pitch: -0.02, targetSceneId: 'parc-seculaire' },
          { id: 'foyer-info-1', type: 'info', label: 'Foyer Monumental', title: 'Cheminée Renaissance', description: 'Foyer monumental de 3 mètres de large en granit bleu de Guérande avec manteau armorié d\'époque.', yaw: 0.2, pitch: 0.05 },
        ],
      },
      {
        id: 'salle-basse',
        name: 'Salle Basse Voûtée & Cave Historique',
        floor: 'Rez-de-jardin',
        panoramaUrl: pano('drachenfels_cellar'),
        thumbnailUrl: thumb('drachenfels_cellar'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'salle-to-cour', type: 'navigation', label: 'Remonter à la Cour Médiévale', yaw: 3.14, pitch: 0.1, targetSceneId: 'cour-granit' },
          { id: 'salle-info-1', type: 'info', label: 'Crypte & Dégustation', title: 'Voûtes en Granit', description: 'Voûtes en berceau abritant un espace de dégustation et une cave de garde séculaire.', yaw: 0.8, pitch: 0.05 },
        ],
      },
      {
        id: 'parc-seculaire',
        name: 'Parc Boisé Séculaire de 2 Hectares & Étang',
        floor: 'Extérieur',
        panoramaUrl: pano('symmetrical_garden'),
        thumbnailUrl: thumb('symmetrical_garden'),
        initialView: { yaw: 0.0, pitch: 0.0, fov: 75 },
        hotspots: [
          { id: 'parc-to-foyer', type: 'navigation', label: 'Retourner au Manoir', yaw: -1.5, pitch: 0.05, targetSceneId: 'grand-foyer' },
          { id: 'parc-info-1', type: 'info', label: 'Parc Classé & Étang', title: 'Chênes Tricentenaires', description: 'Allées cavalières bordées de chênes séculaires, étang naturel d\'eau douce et dépendances en pierre.', yaw: 1.2, pitch: 0.05 },
        ],
      },
    ],
  },
};

function getPropertyTour(propertyId, property) {
  const key = String(propertyId);
  const customTour = PROPERTY_TOURS[key] || PROPERTY_TOURS['1'];
  const propName = property?.name || `Propriété #${propertyId}`;
  const propLoc = property?.location || 'France';

  return {
    id: `tour-${propertyId}`,
    propertyId: String(propertyId),
    propertyName: propName,
    propertyLocation: propLoc,
    enabled: true,
    tourType: '360',
    externalUrl: '',
    startingSceneId: customTour.startingSceneId,
    floorPlan: customTour.floorPlan,
    scenes: customTour.scenes,
  };
}

module.exports = {
  PROPERTY_TOURS,
  getPropertyTour,
};
