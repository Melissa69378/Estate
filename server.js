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
  ['Hôtel Particulier Champ-de-Mars', 'Paris 7e · Avenue Émile-Deschanel', '9,85 M€', 'Hôtel particulier', 9, 385, 5, '2.2982,48.8558', 'image-one'],
  ['Villa Belle Époque "Le Roc Fleuri"', 'Nice · Boulevard Carnot, Cap de Nice', '6,90 M€', 'Villa', 8, 320, 5, '7.2915,43.6890', 'image-two'],
  ['Château & Vignoble de Saint-Émilion', 'Saint-Émilion · Route des Châteaux, Gironde', '4,45 M€', 'Château', 12, 540, 7, '-0.1558,44.8943', 'image-three'],
  ['Appartement de Réception Place des Vosges', 'Paris 4e · Place des Vosges, Le Marais', '4,85 M€', 'Appartement', 5, 195, 3, '2.3662,48.8555', 'image-four'],
  ['Bastide Provençale en Pierre du Luberon', 'Gordes · Chemin des Bories, Luberon', '3,75 M€', 'Maison', 7, 290, 4, '5.2001,43.9126', 'image-five'],
  ['Chalet d\'Alpage "Le Grand Cerf"', 'Megève · Route du Mont-d\'Arbois, Haute-Savoie', '7,80 M€', 'Chalet', 8, 340, 5, '6.6342,45.8569', 'image-six'],
  ['Manoir Anglo-Normand du Triangle d\'Or', 'Deauville · Avenue de la République, Calvados', '2,15 M€', 'Manoir', 8, 260, 5, '0.0750,49.3592', 'image-seven'],
  ['Penthouse Panoramique Parc Tête d\'Or', 'Lyon 6e · Boulevard des Belges, Rhône', '2,65 M€', 'Appartement', 6, 215, 4, '4.8512,45.7725', 'image-eight'],
  ['Maison de Maître & Pavillon d\'Amis', 'Biarritz · Avenue de l\'Impératrice, Le Phare', '3,90 M€', 'Maison', 9, 310, 6, '-1.5540,43.4905', 'image-nine'],
  ['Hôtel Particulier du Quartier Mazarin', 'Aix-en-Provence · Rue Cardinale, Bouches-du-Rhône', '3,20 M€', 'Hôtel particulier', 7, 275, 4, '5.4497,43.5246', 'image-ten'],
  ['Villa d\'Architecte en Cèdre & Accès Bassin', 'Lège-Cap-Ferret · Boulevard de la Plage, Gironde', '4,20 M€', 'Villa', 7, 230, 4, '-1.2464,44.6291', 'image-eleven'],
  ['Manoir Breton des Marais & Dépendances', 'Guérande · Presqu\'île Guérandaise, Loire-Atlantique', '1,89 M€', 'Manoir', 10, 350, 6, '-2.4285,47.3283', 'image-twelve'],
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

