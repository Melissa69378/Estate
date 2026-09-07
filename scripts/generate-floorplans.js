const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../tours/plans');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function baseSvg(title, sqm, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 640" width="100%" height="100%">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1"/>
    </pattern>
    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="900" height="640" fill="#121815" rx="14"/>
  <rect width="900" height="640" fill="url(#grid)" rx="14"/>

  <!-- Compass Rose -->
  <g transform="translate(820, 75)" opacity="0.75">
    <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
    <polygon points="0,-19 5,-5 0,0 -5,-5" fill="#e4a347"/>
    <polygon points="0,19 5,5 0,0 -5,5" fill="rgba(255,255,255,0.25)"/>
    <text x="0" y="-23" fill="#e4a347" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" text-anchor="middle">N</text>
  </g>

  <!-- Title Badge -->
  <g transform="translate(45, 55)">
    <text x="0" y="0" fill="#e4a347" font-family="'DM Sans', sans-serif" font-size="10" font-weight="700" letter-spacing="2">PLAN ARCHITECTURAL D'EXCEPTION</text>
    <text x="0" y="24" fill="#ffffff" font-family="'Playfair Display', serif" font-size="20" font-weight="500">${title}</text>
    <text x="0" y="44" fill="#8ca094" font-family="'DM Sans', sans-serif" font-size="12">${sqm}</text>
  </g>

  <g filter="url(#soft-glow)">
    ${content}
  </g>
</svg>`;
}

// 1. Hotel Particulier (Paris 7e & Aix-en-Provence)
const hotelParticulier = baseSvg('Hôtel Particulier & Jardin Privatif', 'Superficie habitable : 480 m² · Parcelle : 620 m²', `
  <!-- Jardin / Cour -->
  <rect x="70" y="110" width="760" height="460" fill="#17221d" stroke="#2c3a32" stroke-width="2" rx="4"/>
  
  <!-- Jardin privatif (bas) -->
  <path d="M 70 420 L 520 420 L 520 570 L 70 570 Z" fill="#14261c" stroke="#375543" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="295" y="500" fill="#88c29e" font-family="'DM Sans', sans-serif" font-size="13" font-weight="600" text-anchor="middle" letter-spacing="1">JARDIN PRIVATIF &amp; PAVILLON</text>
  <text x="295" y="520" fill="#69947a" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">180 m² · Arbres Séculaires</text>

  <!-- Vestibule / Entrée -->
  <rect x="70" y="210" width="220" height="210" fill="#1c2b23" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="180" y="310" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">VESTIBULE D'HONNEUR</text>
  <text x="180" y="330" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">38 m² · Escalier Classé</text>

  <!-- Grand Salon de Réception -->
  <rect x="290" y="110" width="300" height="310" fill="#203229" stroke="#e4a347" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="440" y="255" fill="#fef3c7" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700" text-anchor="middle">GRAND SALON DE RÉCEPTION</text>
  <text x="440" y="278" fill="#e5e7eb" font-family="'DM Sans', sans-serif" font-size="12" text-anchor="middle">75 m² · Boiseries Dorées &amp; Foyer</text>

  <!-- Suite de Maître (Haut-Droit) -->
  <rect x="590" y="110" width="240" height="260" fill="#1e2c24" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="710" y="235" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">SUITE DE MAÎTRE</text>
  <text x="710" y="255" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">45 m² · Balcon Privatif</text>

  <!-- Salle de Bains en Marbre (Bas-Droit) -->
  <rect x="590" y="370" width="240" height="200" fill="#1a2720" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="710" y="465" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">BAINS &amp; SPA MARBRE</text>
  <text x="710" y="485" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">24 m² · Douche Ciel de Pluie</text>

  <!-- Thick structural walls -->
  <path d="M 290 110 L 290 420" stroke="#4b5563" stroke-width="6"/>
  <path d="M 590 110 L 590 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 590 370 L 830 370" stroke="#4b5563" stroke-width="5"/>
  <path d="M 70 210 L 290 210" stroke="#4b5563" stroke-width="5"/>
  <path d="M 70 420 L 590 420" stroke="#4b5563" stroke-width="6"/>
`);

// 2. Villa Riviera (Nice & Cap-Ferret)
const villaRiviera = baseSvg('Villa Belle Époque & Terrasse Mer', 'Superficie : 390 m² · Terrain paysager : 1 850 m²', `
  <!-- Outer boundary -->
  <rect x="70" y="110" width="760" height="460" fill="#16221c" stroke="#2a3930" stroke-width="2" rx="4"/>

  <!-- Piscine à débordement (Haut-Gauche) -->
  <path d="M 70 110 L 370 110 L 370 270 L 70 270 Z" fill="#0d2e38" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="220" y="185" fill="#7dd3fc" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">PISCINE À DÉBORDEMENT &amp; SOLARIUM</text>
  <text x="220" y="205" fill="#38bdf8" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Bassin Miroir Chauffé au Sel · 12 x 5 m</text>

  <!-- Terrasse Panoramique (Bas-Gauche) -->
  <rect x="70" y="370" width="350" height="200" fill="#1b2821" stroke="#e4a347" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="245" y="465" fill="#fef3c7" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle">TERRASSE BAIE DES ANGES</text>
  <text x="245" y="485" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">85 m² · Vue Panoramique Mer</text>

  <!-- Grand Salon Riviera (Centre) -->
  <rect x="370" y="220" width="280" height="250" fill="#203328" stroke="#4ade80" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="510" y="340" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700" text-anchor="middle">GRAND SALON RIVIERA</text>
  <text x="510" y="362" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">68 m² · Marbre &amp; Colonnes Doriques</text>

  <!-- Suite Royale Mer (Droite) -->
  <rect x="650" y="110" width="180" height="460" fill="#1e2c24" stroke="#4ade80" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="740" y="330" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle" transform="rotate(-90 740 330)">SUITE ROYALE FACE MER</text>
  <text x="740" y="355" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle" transform="rotate(-90 740 355)">52 m² · Vue Mer &amp; Dressing</text>

  <!-- Structural walls -->
  <path d="M 370 110 L 370 470" stroke="#4b5563" stroke-width="6"/>
  <path d="M 650 110 L 650 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 70 370 L 650 370" stroke="#4b5563" stroke-width="6"/>
`);

// 3. Chateau & Vignoble (Saint-Émilion & Guérande)
const chateauVignoble = baseSvg('Château & Vignoble de Prestige', 'Domaine viticole de 4,5 hectares · 650 m² bâtis', `
  <rect x="70" y="110" width="760" height="460" fill="#17221d" stroke="#2c3a32" stroke-width="2" rx="4"/>

  <!-- Cour d'Honneur (Gauche) -->
  <rect x="70" y="110" width="280" height="460" fill="#1a2820" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="210" y="330" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700" text-anchor="middle">COUR D'HONNEUR</text>
  <text x="210" y="352" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Pavés d'Époque &amp; Allée des Cyprès</text>

  <!-- Grand Salon des Tapisseries (Centre Haut) -->
  <rect x="350" y="110" width="290" height="230" fill="#203328" stroke="#e4a347" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="495" y="215" fill="#fef3c7" font-family="'DM Sans', sans-serif" font-size="15" font-weight="700" text-anchor="middle">SALON DES TAPISSERIES</text>
  <text x="495" y="235" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">90 m² · Poutres Sculptées XVIIIe</text>

  <!-- Chais & Dégustation (Centre Bas) -->
  <rect x="350" y="340" width="290" height="230" fill="#1b2520" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="495" y="445" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle">CHAIS &amp; DÉGUSTATION</text>
  <text x="495" y="465" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Cave Voûtée Climatisée · Barriques</text>

  <!-- Suite Seigneuriale (Droite) -->
  <rect x="640" y="110" width="190" height="460" fill="#1e2c24" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="735" y="330" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle" transform="rotate(-90 735 330)">SUITE DU DOMAINE</text>
  <text x="735" y="355" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle" transform="rotate(-90 735 355)">Vue Vignobles Classés · 58 m²</text>

  <!-- Thick walls -->
  <path d="M 350 110 L 350 570" stroke="#4b5563" stroke-width="7"/>
  <path d="M 640 110 L 640 570" stroke="#4b5563" stroke-width="7"/>
  <path d="M 350 340 L 640 340" stroke="#4b5563" stroke-width="6"/>
`);

// 4. Appartement & Penthouse (Place des Vosges & Lyon)
const appartementPrestige = baseSvg('Appartement de Réception Traversant', 'Surface Carrez : 265 m² · Hauteur sous plafond : 3m90', `
  <rect x="70" y="110" width="760" height="460" fill="#16221c" stroke="#2a3930" stroke-width="2" rx="4"/>

  <!-- Rooftop / Balcon (Haut) -->
  <rect x="70" y="110" width="760" height="90" fill="#12241b" stroke="#375543" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="450" y="155" fill="#88c29e" font-family="'DM Sans', sans-serif" font-size="13" font-weight="600" text-anchor="middle" letter-spacing="1">BALCON FILANT &amp; VUE PANORAMIQUE</text>

  <!-- Salon Traversant (Centre) -->
  <rect x="70" y="200" width="450" height="230" fill="#203328" stroke="#e4a347" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="295" y="305" fill="#fef3c7" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700" text-anchor="middle">SALON TRAVERSANT</text>
  <text x="295" y="328" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="12" text-anchor="middle">82 m² · Parquet Point de Hongrie &amp; Cheminées</text>

  <!-- Bibliothèque / Bureau (Bas Gauche) -->
  <rect x="70" y="430" width="450" height="140" fill="#1b2721" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="295" y="495" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">BIBLIOTHÈQUE EN NOYER &amp; BUREAU</text>
  <text x="295" y="515" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">35 m² · Menuiseries Sur Mesure</text>

  <!-- Suite de Maître (Droite Haut) -->
  <rect x="520" y="200" width="310" height="190" fill="#1e2c24" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="675" y="290" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">SUITE DE MAÎTRE</text>
  <text x="675" y="310" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">42 m² · Calme Absolu sur Cour Royale</text>

  <!-- Bains & Dressing (Droite Bas) -->
  <rect x="520" y="390" width="310" height="180" fill="#192620" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="675" y="475" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">BAINS EN MARBRE &amp; DRESSING</text>
  <text x="675" y="495" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">22 m² · Baignoire Îlot Sculpturale</text>

  <!-- Walls -->
  <path d="M 70 200 L 830 200" stroke="#4b5563" stroke-width="6"/>
  <path d="M 520 200 L 520 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 70 430 L 520 430" stroke="#4b5563" stroke-width="5"/>
  <path d="M 520 390 L 830 390" stroke="#4b5563" stroke-width="5"/>
`);

// 5. Bastide Provençale (Gordes Luberon)
const bastideLuberon = baseSvg('Bastide en Pierre & Borie du Luberon', 'Surface bâtie : 360 m² · Parc en restanques : 5 400 m²', `
  <rect x="70" y="110" width="760" height="460" fill="#16221c" stroke="#2a3930" stroke-width="2" rx="4"/>

  <!-- Cour en Calade (Gauche) -->
  <rect x="70" y="330" width="280" height="240" fill="#1a2720" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="210" y="440" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle">COUR EN CALADE</text>
  <text x="210" y="460" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Fontaine en Pierre &amp; Mûriers</text>

  <!-- Véranda d'Été (Gauche Haut) -->
  <rect x="70" y="110" width="280" height="220" fill="#17241e" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="210" y="210" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">VÉRANDA &amp; SALLE D'ÉTÉ</text>
  <text x="210" y="230" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">32 m² · Vue Luberon</text>

  <!-- Salon Voûté (Centre) -->
  <rect x="350" y="170" width="260" height="340" fill="#203328" stroke="#e4a347" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="480" y="325" fill="#fef3c7" font-family="'DM Sans', sans-serif" font-size="15" font-weight="700" text-anchor="middle">SALON VOÛTÉ EN PIERRE</text>
  <text x="480" y="347" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">62 m² · Foyer d'Époque &amp; Voûtains</text>

  <!-- Suite Principale (Droite Haut) -->
  <rect x="610" y="110" width="220" height="240" fill="#1e2c24" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="720" y="225" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">SUITE DU LUBERON</text>
  <text x="720" y="245" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">40 m² · Poutres Blanchies</text>

  <!-- Bassin & Restanques (Droite Bas) -->
  <path d="M 610 350 L 830 350 L 830 570 L 610 570 Z" fill="#0e2a34" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="720" y="450" fill="#7dd3fc" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">BASSIN &amp; RESTANQUES</text>
  <text x="720" y="470" fill="#38bdf8" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Bassin de Nage · Borie du XVIIIe</text>

  <!-- Walls -->
  <path d="M 350 110 L 350 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 610 110 L 610 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 70 330 L 350 330" stroke="#4b5563" stroke-width="5"/>
  <path d="M 610 350 L 830 350" stroke="#4b5563" stroke-width="5"/>
`);

// 6. Chalet Alpage (Megève)
const chaletMegeve = baseSvg('Chalet d\'Alpage "Le Grand Cerf"', 'Surface habitable : 510 m² · Exposition plein sud face Mont-Blanc', `
  <rect x="70" y="110" width="760" height="460" fill="#18231c" stroke="#2c3a32" stroke-width="2" rx="4"/>

  <!-- Terrasse Enneigée (Bas-Gauche) -->
  <path d="M 70 380 L 400 380 L 400 570 L 70 570 Z" fill="#13261e" stroke="#6ee7b7" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="235" y="470" fill="#a7f3d0" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">TERRASSE MONT-BLANC</text>
  <text x="235" y="490" fill="#6ee7b7" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">70 m² de Decking Vieux Mélèze</text>

  <!-- Grand Salon Cathédrale (Centre-Gauche Haut) -->
  <rect x="70" y="110" width="510" height="270" fill="#243429" stroke="#e4a347" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="325" y="235" fill="#fef3c7" font-family="'DM Sans', sans-serif" font-size="17" font-weight="700" text-anchor="middle">SALON CATHÉDRALE EN VIEUX BOIS</text>
  <text x="325" y="258" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="12" text-anchor="middle">110 m² · Cheminée Centrale en Granit · Charpente Brossée</text>

  <!-- Master Suite Cimes (Droite Haut) -->
  <rect x="580" y="110" width="250" height="220" fill="#1e2c24" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="705" y="210" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">MASTER SUITE DES CIMES</text>
  <text x="705" y="230" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">48 m² · Balcon Privatif Vue Pistes</text>

  <!-- Espace Spa & Bien-Être (Droite Bas) -->
  <rect x="580" y="330" width="250" height="240" fill="#122a2e" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="705" y="440" fill="#7dd3fc" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle">SPA &amp; SAUNA NORVÉGIEN</text>
  <text x="705" y="460" fill="#38bdf8" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Jacuzzi Encastré · Hammam &amp; Sauna</text>

  <!-- Walls -->
  <path d="M 70 380 L 580 380" stroke="#4b5563" stroke-width="6"/>
  <path d="M 580 110 L 580 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 580 330 L 830 330" stroke="#4b5563" stroke-width="5"/>
`);

// 7. Manoir Océan (Deauville & Biarritz)
const manoirOcean = baseSvg('Manoir d\'Exception & Pavillon d\'Amis', 'Propriété de caractère : 420 m² · Parc côtier : 2 400 m²', `
  <rect x="70" y="110" width="760" height="460" fill="#16221c" stroke="#2a3930" stroke-width="2" rx="4"/>

  <!-- Hall d'Honneur (Gauche) -->
  <rect x="70" y="110" width="230" height="460" fill="#1c2b23" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="185" y="330" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle">HALL D'HONNEUR</text>
  <text x="185" y="350" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Colombages &amp; Escalier Ciselé</text>

  <!-- Double Salon Océan (Centre Haut) -->
  <rect x="300" y="110" width="370" height="260" fill="#203328" stroke="#e4a347" stroke-opacity="0.35" stroke-width="1.5"/>
  <text x="485" y="235" fill="#fef3c7" font-family="'DM Sans', sans-serif" font-size="16" font-weight="700" text-anchor="middle">DOUBLE SALON FACE OCÉAN</text>
  <text x="485" y="258" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="12" text-anchor="middle">72 m² · Bow-Windows &amp; Cheminée d'Époque</text>

  <!-- Jardin & Pavillon (Centre Bas) -->
  <rect x="300" y="370" width="370" height="200" fill="#17261e" stroke="#375543" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="485" y="465" fill="#88c29e" font-family="'DM Sans', sans-serif" font-size="14" font-weight="600" text-anchor="middle">JARDIN PAYSAGER &amp; PAVILLON</text>
  <text x="485" y="485" fill="#69947a" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle">Pavillon Indépendant pour Invités</text>

  <!-- Suite de l'Impératrice (Droite) -->
  <rect x="670" y="110" width="160" height="460" fill="#1e2c24" stroke="#4ade80" stroke-opacity="0.25" stroke-width="1.5"/>
  <text x="750" y="330" fill="#f3f4f6" font-family="'DM Sans', sans-serif" font-size="15" font-weight="600" text-anchor="middle" transform="rotate(-90 750 330)">SUITE OCÉANE</text>
  <text x="750" y="355" fill="#9ca3af" font-family="'DM Sans', sans-serif" font-size="11" text-anchor="middle" transform="rotate(-90 750 355)">Vue Vagues &amp; Phare · 48 m²</text>

  <!-- Walls -->
  <path d="M 300 110 L 300 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 670 110 L 670 570" stroke="#4b5563" stroke-width="6"/>
  <path d="M 300 370 L 670 370" stroke="#4b5563" stroke-width="6"/>
`);

fs.writeFileSync(path.join(outDir, 'hotel-particulier.svg'), hotelParticulier);
fs.writeFileSync(path.join(outDir, 'villa-riviera.svg'), villaRiviera);
fs.writeFileSync(path.join(outDir, 'chateau-vignoble.svg'), chateauVignoble);
fs.writeFileSync(path.join(outDir, 'appartement-prestige.svg'), appartementPrestige);
fs.writeFileSync(path.join(outDir, 'bastide-luberon.svg'), bastideLuberon);
fs.writeFileSync(path.join(outDir, 'chalet-megeve.svg'), chaletMegeve);
fs.writeFileSync(path.join(outDir, 'manoir-ocean.svg'), manoirOcean);

console.log('All architectural floor plans generated in tours/plans/ !');
