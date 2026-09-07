const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { getPropertyTour } = require('./property-tours-data');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const databaseUrl = process.env.DATABASE_URL;
let pool = null;
if (databaseUrl) {
  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 3000,
    });
  } catch (err) {
    console.warn('[AI Studio] Could not initialize PostgreSQL pool:', err.message);
    pool = null;
  }
}

const seedProperties = [
  ['Hôtel Particulier Champ-de-Mars', 'Paris 7e · Avenue Émile-Deschanel', '9,85 M€', 'Hôtel particulier', 9, 385, 5, '2.2982,48.8558', 'image-one', 'A', 48, 'A', 9, '24 500 € / mois', true],
  ['Villa Belle Époque "Le Roc Fleuri"', 'Nice · Boulevard Carnot, Cap de Nice', '6,90 M€', 'Villa', 8, 320, 5, '7.2915,43.6890', 'image-two', 'B', 82, 'B', 16, '18 000 € / mois', true],
  ['Château & Vignoble de Saint-Émilion', 'Saint-Émilion · Route des Châteaux, Gironde', '4,45 M€', 'Château', 12, 540, 7, '-0.1558,44.8943', 'image-three', 'C', 135, 'C', 28, '14 000 € / mois', true],
  ['Appartement de Réception Place des Vosges', 'Paris 4e · Place des Vosges, Le Marais', '4,85 M€', 'Appartement', 5, 195, 3, '2.3662,48.8555', 'image-four', 'B', 78, 'A', 8, '12 500 € / mois', true],
  ['Bastide Provençale en Pierre du Luberon', 'Gordes · Chemin des Bories, Luberon', '3,75 M€', 'Maison', 7, 290, 4, '5.2001,43.9126', 'image-five', 'C', 122, 'B', 19, '9 500 € / mois', true],
  ['Chalet d\'Alpage "Le Grand Cerf"', 'Megève · Route du Mont-d\'Arbois, Haute-Savoie', '7,80 M€', 'Chalet', 8, 340, 5, '6.6342,45.8569', 'image-six', 'B', 88, 'B', 18, '22 000 € / mois', true],
  ['Manoir Anglo-Normand du Triangle d\'Or', 'Deauville · Avenue de la République, Calvados', '2,15 M€', 'Manoir', 8, 260, 5, '0.0750,49.3592', 'image-seven', 'D', 188, 'C', 29, '6 800 € / mois', true],
  ['Penthouse Panoramique Parc Tête d\'Or', 'Lyon 6e · Boulevard des Belges, Rhône', '2,65 M€', 'Appartement', 6, 215, 4, '4.8512,45.7725', 'image-eight', 'B', 72, 'A', 7, '7 500 € / mois', true],
  ['Maison de Maître & Pavillon d\'Amis', 'Biarritz · Avenue de l\'Impératrice, Le Phare', '3,90 M€', 'Maison', 9, 310, 6, '-1.5540,43.4905', 'image-nine', 'C', 118, 'B', 22, '11 000 € / mois', true],
  ['Hôtel Particulier du Quartier Mazarin', 'Aix-en-Provence · Rue Cardinale, Bouches-du-Rhône', '3,20 M€', 'Hôtel particulier', 7, 275, 4, '5.4497,43.5246', 'image-ten', 'C', 130, 'C', 25, '8 900 € / mois', true],
  ['Villa d\'Architecte en Cèdre & Accès Bassin', 'Lège-Cap-Ferret · Boulevard de la Plage, Gironde', '4,20 M€', 'Villa', 7, 230, 4, '-1.2464,44.6291', 'image-eleven', 'A', 42, 'A', 5, '13 500 € / mois', true],
  ['Manoir Breton des Marais & Dépendances', 'Guérande · Presqu\'île Guérandaise, Loire-Atlantique', '1,89 M€', 'Manoir', 10, 350, 6, '-2.4285,47.3283', 'image-twelve', 'D', 195, 'D', 38, '5 500 € / mois', true],
];

const laforetAgencies = [
  {
    id: 1,
    name: 'LaForêt Paris 7e · Champ-de-Mars & Invalides',
    address: '14 bis Avenue Bosquet, 75007 Paris',
    city: 'Paris',
    postalCode: '75007',
    region: 'Île-de-France',
    phone: '01 45 51 00 20',
    email: 'paris7@laforet.com',
    director: 'Marc-Antoine de Belloy',
    hours: 'Lun - Sam : 9h00 - 19h30',
    rating: 4.9,
    reviewsCount: 182,
    services: ['Mandat Favoriz', 'Visite 3D Matterport', 'Estimation offerte 48h', 'Gestion locative', 'Service Prestige'],
  },
  {
    id: 2,
    name: 'LaForêt Paris 4e · Le Marais & Place des Vosges',
    address: '28 Rue Saint-Antoine, 75004 Paris',
    city: 'Paris',
    postalCode: '75004',
    region: 'Île-de-France',
    phone: '01 42 77 40 10',
    email: 'paris4@laforet.com',
    director: 'Éléonore Vasseur',
    hours: 'Lun - Sam : 9h00 - 19h00',
    rating: 4.8,
    reviewsCount: 146,
    services: ['Mandat Favoriz', 'Estimation en ligne', 'i-SUIVI 24/7', 'Biens d\'exception'],
  },
  {
    id: 3,
    name: 'LaForêt Nice · Mont-Boron & Cap de Nice',
    address: '42 Boulevard Carnot, 06300 Nice',
    city: 'Nice',
    postalCode: '06300',
    region: 'Provence-Alpes-Côte d\'Azur',
    phone: '04 93 89 22 10',
    email: 'nice-est@laforet.com',
    director: 'Jean-Christophe Mura',
    hours: 'Lun - Sam : 9h00 - 19h00',
    rating: 4.9,
    reviewsCount: 214,
    services: ['Mandat Favoriz', 'Villas vue mer', 'Garantie Après-Vente', 'Visite 3D'],
  },
  {
    id: 4,
    name: 'LaForêt Saint-Émilion & Grands Vignobles',
    address: '6 Place du Marché, 33330 Saint-Émilion',
    city: 'Saint-Émilion',
    postalCode: '33330',
    region: 'Nouvelle-Aquitaine',
    phone: '05 57 24 70 80',
    email: 'saint-emilion@laforet.com',
    director: 'Bertrand Castéra',
    hours: 'Lun - Sam : 9h00 - 18h30',
    rating: 4.9,
    reviewsCount: 98,
    services: ['Mandat Favoriz', 'Châteaux & Vignobles', 'Estimation patrimoniale', 'Accompagnement notarial'],
  },
  {
    id: 5,
    name: 'LaForêt Luberon · Gordes & Pays d\'Apt',
    address: 'Place du Château, 84220 Gordes',
    city: 'Gordes',
    postalCode: '84220',
    region: 'Provence-Alpes-Côte d\'Azur',
    phone: '04 90 72 05 50',
    email: 'gordes@laforet.com',
    director: 'Claire de Rochegude',
    hours: 'Lun - Sam : 9h30 - 19h00',
    rating: 4.8,
    reviewsCount: 115,
    services: ['Mandat Favoriz', 'Bastides & Mas provençaux', 'Visite 3D', 'i-SUIVI 24/7'],
  },
  {
    id: 6,
    name: 'LaForêt Megève · Mont-d\'Arbois & Cimes',
    address: '112 Rue Ambroise Martin, 74120 Megève',
    city: 'Megève',
    postalCode: '74120',
    region: 'Auvergne-Rhône-Alpes',
    phone: '04 50 21 33 00',
    email: 'megeve@laforet.com',
    director: 'Guillaume Perret',
    hours: 'Lun - Dim : 9h00 - 19h00',
    rating: 4.9,
    reviewsCount: 130,
    services: ['Mandat Favoriz', 'Chalets de prestige', 'Chasse immobilière alpine', 'Garantie Revente'],
  },
  {
    id: 7,
    name: 'LaForêt Deauville · Triangle d\'Or & Côte Fleurie',
    address: '34 Rue Gambetta, 14800 Deauville',
    city: 'Deauville',
    postalCode: '14800',
    region: 'Normandie',
    phone: '02 31 88 50 60',
    email: 'deauville@laforet.com',
    director: 'Sophie Malherbe',
    hours: 'Lun - Sam : 9h00 - 19h00',
    rating: 4.8,
    reviewsCount: 165,
    services: ['Mandat Favoriz', 'Manoirs & Haras', 'Estimation 48h', 'Signature électronique'],
  },
  {
    id: 8,
    name: 'LaForêt Lyon 6e · Boulevard des Belges & Tête d\'Or',
    address: '58 Boulevard des Belges, 69006 Lyon',
    city: 'Lyon',
    postalCode: '69006',
    region: 'Auvergne-Rhône-Alpes',
    phone: '04 78 89 44 20',
    email: 'lyon6@laforet.com',
    director: 'Alexandre Berchet',
    hours: 'Lun - Sam : 9h00 - 19h30',
    rating: 4.9,
    reviewsCount: 190,
    services: ['Mandat Favoriz', 'Penthouses & Réception', 'Garantie Après-Vente 24 mois', 'i-SUIVI'],
  },
  {
    id: 9,
    name: 'LaForêt Biarritz · Le Phare & Côte Basque',
    address: '18 Avenue Reine Victoria, 64200 Biarritz',
    city: 'Biarritz',
    postalCode: '64200',
    region: 'Nouvelle-Aquitaine',
    phone: '05 59 22 15 30',
    email: 'biarritz@laforet.com',
    director: 'Maïtena Etcheverry',
    hours: 'Lun - Sam : 9h00 - 19h00',
    rating: 4.8,
    reviewsCount: 174,
    services: ['Mandat Favoriz', 'Maisons de maître', 'Vues océan', 'Estimation confidentielle'],
  },
  {
    id: 10,
    name: 'LaForêt Aix-en-Provence · Quartier Mazarin',
    address: '12 Rue d\'Italie, 13100 Aix-en-Provence',
    city: 'Aix-en-Provence',
    postalCode: '13100',
    region: 'Provence-Alpes-Côte d\'Azur',
    phone: '04 42 26 80 00',
    email: 'aix-mazarin@laforet.com',
    director: 'Laurent Fabre',
    hours: 'Lun - Sam : 9h00 - 19h00',
    rating: 4.9,
    reviewsCount: 205,
    services: ['Mandat Favoriz', 'Hôtels particuliers', 'Visite 3D', 'Club Favoriz'],
  },
  {
    id: 11,
    name: 'LaForêt Cap-Ferret & Bassin d\'Arcachon',
    address: '68 Boulevard de la Plage, 33970 Lège-Cap-Ferret',
    city: 'Lège-Cap-Ferret',
    postalCode: '33970',
    region: 'Nouvelle-Aquitaine',
    phone: '05 56 60 72 40',
    email: 'capferret@laforet.com',
    director: 'Nicolas Dujardin',
    hours: 'Lun - Sam : 9h00 - 19h00',
    rating: 4.9,
    reviewsCount: 142,
    services: ['Mandat Favoriz', 'Villas bois & première ligne', 'Garantie Revente', 'i-SUIVI'],
  },
  {
    id: 12,
    name: 'LaForêt Guérande · Presqu\'île & Baie de La Baule',
    address: '5 Place Sainte-Anne, 44350 Guérande',
    city: 'Guérande',
    postalCode: '44350',
    region: 'Pays de la Loire',
    phone: '02 40 42 90 10',
    email: 'guerande@laforet.com',
    director: 'Yann Le Goff',
    hours: 'Lun - Sam : 9h00 - 18h30',
    rating: 4.8,
    reviewsCount: 112,
    services: ['Mandat Favoriz', 'Manoirs bretons', 'Propriétés équestres', 'Estimation 48h'],
  },
];

// In-memory data store for standalone/offline mode
let inMemoryProperties = seedProperties.map((p, index) => ({
  id: index + 1,
  name: p[0],
  location: p[1],
  price: p[2],
  type: p[3],
  rooms: p[4],
  area: p[5],
  bedrooms: p[6],
  coordinates: p[7],
  image_class: p[8],
  dpe: p[9] || 'B',
  dpe_value: p[10] || 75,
  ges: p[11] || 'B',
  ges_value: p[12] || 15,
  rent_price: p[13] || '8 000 € / mois',
  favoriz: p[14] !== false,
  status: 'published',
  tour: true,
  created_at: new Date(Date.now() - (seedProperties.length - index) * 3600000).toISOString(),
  updated_at: new Date().toISOString(),
}));

let inMemoryContent = {
  title: 'Des adresses d\'exception qui vous ressemblent.',
  intro: 'Depuis plus de 30 ans, nous sélectionnons les plus prestigieuses propriétés à travers la France : hôtels particuliers parisiens, bastides provençales, villas de la Riviera et chalets d\'alpage.',
};

const inMemoryInquiries = [];
const inMemoryEstimates = [];
const inMemoryAlerts = [];

async function initializeDatabase() {
  if (!pool) return false;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        price TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'Maison',
        rooms INTEGER NOT NULL DEFAULT 4,
        area INTEGER NOT NULL DEFAULT 120,
        bedrooms INTEGER NOT NULL DEFAULT 3,
        coordinates TEXT NOT NULL DEFAULT '2.3522,48.8566',
        image_class TEXT NOT NULL DEFAULT 'image-one',
        status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
        tour BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        intro TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS inquiries (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        property_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const count = await pool.query('SELECT COUNT(*)::int AS count FROM properties');
    if (count.rows[0].count === 0) {
      for (const property of seedProperties) {
        await pool.query(`INSERT INTO properties (name, location, price, type, rooms, area, bedrooms, coordinates, image_class)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, property);
      }
    }
    await pool.query(`INSERT INTO site_content (key, title, intro) VALUES ('homepage', $1, $2) ON CONFLICT (key) DO NOTHING`, [
      inMemoryContent.title,
      inMemoryContent.intro,
    ]);
    return true;
  } catch (error) {
    console.warn(`[AI Studio] Database connection unavailable (${error.message}); activating in-memory mock.`);
    pool = null;
    return false;
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error('Request body too large'));
    });
    request.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
    request.on('error', reject);
  });
}

function propertyResponse(row) {
  return { ...row, tour: Boolean(row.tour) };
}

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(response, 200, { ok: true, database: Boolean(pool), mode: pool ? 'postgres' : 'in-memory' });
  }

  if (request.method === 'GET' && url.pathname === '/api/properties') {
    const status = url.searchParams.get('status');
    if (pool) {
      try {
        const result = status ? await pool.query('SELECT * FROM properties WHERE status = $1 ORDER BY created_at ASC', [status]) : await pool.query('SELECT * FROM properties ORDER BY created_at ASC');
        return sendJson(response, 200, result.rows.map(propertyResponse));
      } catch (err) {
        console.warn('Postgres query error, using in-memory store:', err.message);
      }
    }
    const filtered = status ? inMemoryProperties.filter((p) => p.status === status) : inMemoryProperties;
    return sendJson(response, 200, filtered.map(propertyResponse));
  }

  if (request.method === 'GET' && url.pathname === '/api/content/homepage') {
    if (pool) {
      try {
        const result = await pool.query("SELECT title, intro FROM site_content WHERE key = 'homepage'");
        if (result.rows[0]) return sendJson(response, 200, result.rows[0]);
      } catch (err) {
        console.warn('Postgres query error, using in-memory store:', err.message);
      }
    }
    return sendJson(response, 200, inMemoryContent);
  }

  if (request.method === 'PUT' && url.pathname === '/api/content/homepage') {
    const body = await parseBody(request);
    if (!String(body.title || '').trim() || !String(body.intro || '').trim()) return sendJson(response, 400, { error: 'Title and intro are required.' });
    const title = String(body.title).trim();
    const intro = String(body.intro).trim();
    inMemoryContent = { title, intro };
    if (pool) {
      try {
        const result = await pool.query(`UPDATE site_content SET title = $1, intro = $2, updated_at = NOW() WHERE key = 'homepage' RETURNING title, intro`, [title, intro]);
        if (result.rows[0]) return sendJson(response, 200, result.rows[0]);
      } catch (err) {
        console.warn('Postgres update error, saved in-memory:', err.message);
      }
    }
    return sendJson(response, 200, inMemoryContent);
  }

  if (request.method === 'POST' && url.pathname === '/api/inquiries') {
    const body = await parseBody(request);
    const email = String(body.email || '').trim();
    const paymentMethod = String(body.paymentMethod || '').trim();
    const propertyIds = Array.isArray(body.propertyIds) ? body.propertyIds : [];
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !paymentMethod) return sendJson(response, 400, { error: 'A valid email and payment method are required.' });
    inMemoryInquiries.push({ id: Date.now(), email, paymentMethod, propertyIds, createdAt: new Date().toISOString() });
    if (pool) {
      try {
        await pool.query('INSERT INTO inquiries (email, payment_method, property_ids) VALUES ($1, $2, $3)', [email, paymentMethod, JSON.stringify(propertyIds)]);
      } catch (err) {
        console.warn('Postgres inquiry error, saved in-memory:', err.message);
      }
    }
    return sendJson(response, 201, { received: true });
  }

  const propertyMatch = url.pathname.match(/^\/api\/properties\/(\d+)$/);
  if ((request.method === 'POST' && url.pathname === '/api/properties') || (request.method === 'PATCH' && propertyMatch)) {
    const body = await parseBody(request);
    const values = [
      String(body.name || '').trim(),
      String(body.location || '').trim(),
      String(body.price || '').trim(),
      String(body.type || 'Maison').trim(),
      Number(body.rooms) || 4,
      Number(body.area) || 120,
      Number(body.bedrooms) || 3,
      String(body.coordinates || '2.3522,48.8566'),
      String(body.imageClass || body.image_class || 'image-one'),
      String(body.status || 'published') === 'draft' ? 'draft' : 'published',
    ];
    if (!values[0] || !values[1] || !values[2]) return sendJson(response, 400, { error: 'Name, location and price are required.' });

    if (request.method === 'POST') {
      const newProperty = {
        id: Date.now(),
        name: values[0],
        location: values[1],
        price: values[2],
        type: values[3],
        rooms: values[4],
        area: values[5],
        bedrooms: values[6],
        coordinates: values[7],
        image_class: values[8],
        status: values[9],
        tour: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      inMemoryProperties.push(newProperty);

      if (pool) {
        try {
          const result = await pool.query(`INSERT INTO properties (name, location, price, type, rooms, area, bedrooms, coordinates, image_class, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, values);
          return sendJson(response, 201, propertyResponse(result.rows[0]));
        } catch (err) {
          console.warn('Postgres insert error, created in-memory:', err.message);
        }
      }
      return sendJson(response, 201, propertyResponse(newProperty));
    }

    const targetId = Number(propertyMatch[1]);
    const memIndex = inMemoryProperties.findIndex((p) => p.id === targetId);
    let updatedMem = null;
    if (memIndex !== -1) {
      inMemoryProperties[memIndex] = {
        ...inMemoryProperties[memIndex],
        name: values[0],
        location: values[1],
        price: values[2],
        type: values[3],
        rooms: values[4],
        area: values[5],
        bedrooms: values[6],
        coordinates: values[7],
        image_class: values[8],
        status: values[9],
        updated_at: new Date().toISOString(),
      };
      updatedMem = inMemoryProperties[memIndex];
    }

    if (pool) {
      try {
        const result = await pool.query(`UPDATE properties SET name=$1, location=$2, price=$3, type=$4, rooms=$5, area=$6, bedrooms=$7, coordinates=$8, image_class=$9, status=$10, updated_at=NOW() WHERE id=$11 RETURNING *`, [...values, targetId]);
        if (result.rows[0]) return sendJson(response, 200, propertyResponse(result.rows[0]));
      } catch (err) {
        console.warn('Postgres update error, updated in-memory:', err.message);
      }
    }

    return updatedMem ? sendJson(response, 200, propertyResponse(updatedMem)) : sendJson(response, 404, { error: 'Property not found.' });
  }

  const tourMatch = url.pathname.match(/^\/api\/tours\/([a-zA-Z0-9_-]+)$/);
  if (request.method === 'GET' && tourMatch) {
    const tourId = tourMatch[1];
    let property = inMemoryProperties.find((p) => String(p.id) === tourId);
    if (!property && pool) {
      try {
        const dbRes = await pool.query('SELECT * FROM properties WHERE id = $1', [tourId]);
        if (dbRes.rows.length > 0) property = dbRes.rows[0];
      } catch (e) {
        // ignore
      }
    }
    if (!property) {
      property = inMemoryProperties[0];
    }

    const isMatterport = tourId === 'matterport-demo';
    if (isMatterport) {
      return sendJson(response, 200, {
        id: 'tour-matterport-demo',
        propertyId: 'matterport-demo',
        propertyName: property.name,
        propertyLocation: property.location,
        enabled: true,
        tourType: 'matterport',
        externalUrl: 'https://my.matterport.com/show/?m=JGPnGQ6hosj',
        startingSceneId: '',
        floorPlan: { imageUrl: '', markers: [] },
        scenes: [],
      });
    }

    const tourData = getPropertyTour(tourId, property);
    return sendJson(response, 200, tourData);
  }

  if (request.method === 'GET' && url.pathname === '/api/agencies') {
    const query = (url.searchParams.get('q') || '').trim().toLowerCase();
    const region = (url.searchParams.get('region') || '').trim().toLowerCase();
    let agencies = laforetAgencies;
    if (query) {
      agencies = agencies.filter((a) =>
        a.name.toLowerCase().includes(query) ||
        a.city.toLowerCase().includes(query) ||
        a.postalCode.includes(query) ||
        a.region.toLowerCase().includes(query) ||
        a.address.toLowerCase().includes(query)
      );
    }
    if (region) {
      agencies = agencies.filter((a) => a.region.toLowerCase().includes(region));
    }
    return sendJson(response, 200, {
      total: agencies.length,
      networkTotal: 720,
      agencies,
    });
  }

  if (request.method === 'GET' && url.pathname === '/api/mortgage-rates') {
    return sendJson(response, 200, {
      rates: [
        { durationYears: 10, ratePercent: 3.10 },
        { durationYears: 15, ratePercent: 3.25 },
        { durationYears: 20, ratePercent: 3.45 },
        { durationYears: 25, ratePercent: 3.65 },
      ],
      defaultDuration: 20,
      defaultRate: 3.45,
      insuranceRatePercent: 0.34,
      notaryFeePercent: 7.5,
      updatedAt: '2026-09-01',
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/estimates') {
    const body = await parseBody(request);
    const propertyType = String(body.propertyType || 'Appartement').trim();
    const city = String(body.city || 'Paris').trim();
    const postalCode = String(body.postalCode || '').trim();
    const surface = Math.max(15, Number(body.surface) || 80);
    const rooms = Math.max(1, Number(body.rooms) || 3);
    const bedrooms = Math.max(1, Number(body.bedrooms) || 2);
    const condition = String(body.condition || 'bon'); // 'neuf', 'excellent', 'bon', 'a_renover'
    const features = Array.isArray(body.features) ? body.features : [];
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const clientName = String(body.name || '').trim();

    // Baseline prices per m² based on French market averages
    const cityLower = city.toLowerCase();
    let baseM2 = 4800; // default French average
    if (cityLower.includes('paris') || postalCode.startsWith('75')) {
      baseM2 = 12500;
    } else if (cityLower.includes('nice') || cityLower.includes('cannes') || postalCode.startsWith('06')) {
      baseM2 = 7200;
    } else if (cityLower.includes('lyon') || postalCode.startsWith('69')) {
      baseM2 = 5600;
    } else if (cityLower.includes('meg') || postalCode.startsWith('74')) {
      baseM2 = 10500;
    } else if (cityLower.includes('biarritz') || postalCode.startsWith('64')) {
      baseM2 = 8900;
    } else if (cityLower.includes('aix') || cityLower.includes('marseille') || postalCode.startsWith('13')) {
      baseM2 = 6400;
    } else if (cityLower.includes('cap') || cityLower.includes('bassin') || postalCode.startsWith('33')) {
      baseM2 = 9800;
    } else if (cityLower.includes('deauville') || postalCode.startsWith('14')) {
      baseM2 = 6800;
    } else if (cityLower.includes('luberon') || cityLower.includes('gordes') || postalCode.startsWith('84')) {
      baseM2 = 7100;
    } else if (cityLower.includes('guérande') || cityLower.includes('baule') || postalCode.startsWith('44')) {
      baseM2 = 4900;
    }

    // Adjust for prestige property type
    if (propertyType === 'Hôtel particulier') baseM2 *= 1.45;
    else if (propertyType === 'Château') baseM2 *= 1.25;
    else if (propertyType === 'Villa') baseM2 *= 1.18;
    else if (propertyType === 'Chalet') baseM2 *= 1.22;
    else if (propertyType === 'Manoir') baseM2 *= 1.15;

    // Adjust for condition
    let conditionMultiplier = 1.0;
    if (condition === 'neuf') conditionMultiplier = 1.18;
    else if (condition === 'excellent') conditionMultiplier = 1.10;
    else if (condition === 'a_renover') conditionMultiplier = 0.82;

    let calculatedPrice = surface * baseM2 * conditionMultiplier;

    // Adjust for premium features
    if (features.includes('pool')) calculatedPrice += 55000;
    if (features.includes('garden')) calculatedPrice += calculatedPrice * 0.09;
    if (features.includes('terrace')) calculatedPrice += calculatedPrice * 0.06;
    if (features.includes('parking')) calculatedPrice += 30000;
    if (features.includes('elevator')) calculatedPrice += calculatedPrice * 0.04;
    if (features.includes('sea_view') || features.includes('exceptional_view')) calculatedPrice += calculatedPrice * 0.14;

    // Calculate valuation brackets
    const priceMedian = Math.round(calculatedPrice / 1000) * 1000;
    const priceMin = Math.round((priceMedian * 0.92) / 1000) * 1000;
    const priceMax = Math.round((priceMedian * 1.08) / 1000) * 1000;
    const avgPriceM2 = Math.round(priceMedian / surface);

    // Find nearest matching LaForêt agency
    const matchedAgency = laforetAgencies.find((a) =>
      a.city.toLowerCase() === cityLower ||
      (postalCode && a.postalCode.startsWith(postalCode.slice(0, 2)))
    ) || laforetAgencies[0];

    const estimateRecord = {
      id: Date.now(),
      propertyType,
      city,
      postalCode,
      surface,
      rooms,
      bedrooms,
      condition,
      features,
      priceMin,
      priceMedian,
      priceMax,
      avgPriceM2,
      agency: matchedAgency,
      clientName,
      email,
      phone,
      createdAt: new Date().toISOString(),
    };

    inMemoryEstimates.push(estimateRecord);

    return sendJson(response, 201, {
      success: true,
      estimate: {
        priceMin,
        priceMedian,
        priceMax,
        avgPriceM2,
        surface,
        currency: 'EUR',
        formattedMedian: `${(priceMedian / 1000000 >= 1) ? (priceMedian / 1000000).toFixed(2).replace('.', ',') + ' M€' : priceMedian.toLocaleString('fr-FR') + ' €'}`,
        formattedMin: `${(priceMin / 1000000 >= 1) ? (priceMin / 1000000).toFixed(2).replace('.', ',') + ' M€' : priceMin.toLocaleString('fr-FR') + ' €'}`,
        formattedMax: `${(priceMax / 1000000 >= 1) ? (priceMax / 1000000).toFixed(2).replace('.', ',') + ' M€' : priceMax.toLocaleString('fr-FR') + ' €'}`,
        marketTrend: '+2.4% sur 12 mois',
        confidenceScore: '94%',
        agency: {
          name: matchedAgency.name,
          phone: matchedAgency.phone,
          address: matchedAgency.address,
          director: matchedAgency.director,
          rating: matchedAgency.rating,
        },
      },
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/alerts') {
    const body = await parseBody(request);
    const email = String(body.email || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return sendJson(response, 400, { error: 'Adresse email valide obligatoire.' });
    }
    const alertRecord = {
      id: Date.now(),
      email,
      phone: String(body.phone || '').trim(),
      projectType: String(body.projectType || 'Acheter'),
      propertyType: String(body.propertyType || 'Tous'),
      location: String(body.location || 'France'),
      maxBudget: Number(body.maxBudget) || 0,
      minSurface: Number(body.minSurface) || 0,
      createdAt: new Date().toISOString(),
    };
    inMemoryAlerts.push(alertRecord);
    return sendJson(response, 201, {
      success: true,
      message: 'Votre alerte LaForêt a été enregistrée avec succès. Vous recevrez les nouveaux biens en avant-première.',
    });
  }

  return sendJson(response, 404, { error: 'API route not found.' });
}

function serveStatic(request, response, url) {
  let requested;
  try {
    requested = decodeURIComponent(url.pathname);
  } catch (error) {
    return sendJson(response, 400, { error: 'Invalid path.' });
  }
  if (requested === '/') requested = '/index.html';
  const filePath = path.resolve(root, `.${requested}`);
  const relativePath = path.relative(root, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return sendJson(response, 404, { error: 'Not found.' });
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
  };
  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  try {
    const rawPath = String(request.url || '').split('?')[0];
    if (/%2e|%5c/i.test(rawPath)) return sendJson(response, 404, { error: 'Not found.' });
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) await handleApi(request, response, url);
    else if (request.method === 'GET') serveStatic(request, response, url);
    else sendJson(response, 405, { error: 'Method not allowed.' });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: 'Internal server error.' });
  }
});

initializeDatabase().then((databaseReady) => {
  if (!databaseReady) console.warn('DATABASE_URL is not configured or offline; the site is running with in-memory mock data.');
  server.listen(port, '0.0.0.0', () => console.log(`LaForêt server listening on http://0.0.0.0:${port}`));
}).catch((error) => {
  console.warn(`Database initialization notice: ${error.message}. Running in-memory mode.`);
  server.listen(port, '0.0.0.0', () => console.log(`LaForêt server listening on http://0.0.0.0:${port}`));
});

