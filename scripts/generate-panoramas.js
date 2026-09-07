const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const W = 1536;
const H = 768;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function renderEquirectangular(sceneFn, outJpgPath, thumbJpgPath) {
  const buffer = Buffer.alloc(W * H * 3);

  for (let y = 0; y < H; y++) {
    const phi = (0.5 - y / H) * Math.PI; // pitch: +pi/2 to -pi/2
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let x = 0; x < W; x++) {
      const theta = (x / W - 0.5) * 2 * Math.PI; // yaw: -pi to +pi
      const dx = cosPhi * Math.sin(theta);
      const dy = sinPhi;
      const dz = -cosPhi * Math.cos(theta);

      const [r, g, b] = sceneFn(dx, dy, dz);

      const idx = (y * W + x) * 3;
      buffer[idx] = clamp(Math.round(r), 0, 255);
      buffer[idx + 1] = clamp(Math.round(g), 0, 255);
      buffer[idx + 2] = clamp(Math.round(b), 0, 255);
    }
  }

  const ppmPath = outJpgPath.replace(/\.jpg$/, '.ppm');
  const header = Buffer.from(`P6\n${W} ${H}\n255\n`);
  fs.writeFileSync(ppmPath, Buffer.concat([header, buffer]));
  execSync(`convert "${ppmPath}" -quality 92 "${outJpgPath}" && rm -f "${ppmPath}"`);
  console.log(`Rendered: ${outJpgPath} (${fs.statSync(outJpgPath).size} bytes)`);

  if (thumbJpgPath) {
    execSync(`convert "${outJpgPath}" -resize 240x120 -quality 85 "${thumbJpgPath}"`);
    console.log(`Rendered thumb: ${thumbJpgPath} (${fs.statSync(thumbJpgPath).size} bytes)`);
  }
}

// Ray-box intersection
function intersectBox(dx, dy, dz, halfX, height, halfZ, camY) {
  // Box bounds: x in [-halfX, halfX], y in [0, height], z in [-halfZ, halfZ]
  // Ray origin is (0, camY, 0)
  const hits = [];

  // Floor y = 0
  if (dy < -1e-5) {
    const t = -camY / dy;
    if (t > 0) {
      const hx = dx * t;
      const hz = dz * t;
      if (Math.abs(hx) <= halfX + 0.01 && Math.abs(hz) <= halfZ + 0.01) {
        hits.push({ t, surface: 'floor', x: hx, y: 0, z: hz, normal: [0, 1, 0] });
      }
    }
  }
  // Ceiling y = height
  if (dy > 1e-5) {
    const t = (height - camY) / dy;
    if (t > 0) {
      const hx = dx * t;
      const hz = dz * t;
      if (Math.abs(hx) <= halfX + 0.01 && Math.abs(hz) <= halfZ + 0.01) {
        hits.push({ t, surface: 'ceiling', x: hx, y: height, z: hz, normal: [0, -1, 0] });
      }
    }
  }
  // Left wall x = -halfX
  if (dx < -1e-5) {
    const t = -halfX / dx;
    if (t > 0) {
      const hy = camY + dy * t;
      const hz = dz * t;
      if (hy >= 0 && hy <= height && Math.abs(hz) <= halfZ + 0.01) {
        hits.push({ t, surface: 'wall-left', x: -halfX, y: hy, z: hz, normal: [1, 0, 0] });
      }
    }
  }
  // Right wall x = halfX
  if (dx > 1e-5) {
    const t = halfX / dx;
    if (t > 0) {
      const hy = camY + dy * t;
      const hz = dz * t;
      if (hy >= 0 && hy <= height && Math.abs(hz) <= halfZ + 0.01) {
        hits.push({ t, surface: 'wall-right', x: halfX, y: hy, z: hz, normal: [-1, 0, 0] });
      }
    }
  }
  // Front wall z = -halfZ
  if (dz < -1e-5) {
    const t = -halfZ / dz;
    if (t > 0) {
      const hx = dx * t;
      const hy = camY + dy * t;
      if (hy >= 0 && hy <= height && Math.abs(hx) <= halfX + 0.01) {
        hits.push({ t, surface: 'wall-front', x: hx, y: hy, z: -halfZ, normal: [0, 0, 1] });
      }
    }
  }
  // Back wall z = halfZ
  if (dz > 1e-5) {
    const t = halfZ / dz;
    if (t > 0) {
      const hx = dx * t;
      const hy = camY + dy * t;
      if (hy >= 0 && hy <= height && Math.abs(hx) <= halfX + 0.01) {
        hits.push({ t, surface: 'wall-back', x: hx, y: hy, z: halfZ, normal: [0, 0, -1] });
      }
    }
  }

  hits.sort((a, b) => a.t - b.t);
  return hits[0] || null;
}

// 1. KITCHEN
function kitchenScene(dx, dy, dz) {
  const hit = intersectBox(dx, dy, dz, 3.2, 2.9, 3.8, 1.5);
  if (!hit) return [20, 20, 25];

  const { surface, x, y, z } = hit;

  if (surface === 'floor') {
    // Charcoal porcelain tile 60x60 with light grout
    const tx = Math.abs(x) % 0.6;
    const tz = Math.abs(z) % 0.6;
    const isGrout = tx < 0.015 || tz < 0.015;
    if (isGrout) return [70, 72, 75];
    // Marble sheen with subtle variation
    const noise = Math.sin(x * 5) * Math.cos(z * 5) * 8;
    return [48 + noise, 52 + noise, 56 + noise];
  }

  if (surface === 'ceiling') {
    // Soft architectural white with recessed spotlights
    let base = [242, 243, 245];
    // Spotlights at (±1.2, ±1.5)
    for (const sx of [-1.2, 1.2]) {
      for (const sz of [-1.5, 0, 1.5]) {
        const d = Math.hypot(x - sx, z - sz);
        if (d < 0.15) return [255, 250, 230];
        if (d < 0.45) {
          const glow = (0.45 - d) / 0.3 * 40;
          base = [base[0] + glow, base[1] + glow * 0.9, base[2] + glow * 0.7];
        }
      }
    }
    return base;
  }

  if (surface === 'wall-back') { // z = 3.8
    // Modern cabinetry in dark charcoal-green oak with under-cabinet warm LED
    if (y < 0.9) {
      // Lower cabinets
      const door = Math.abs(x % 0.6);
      const isSeam = door < 0.01;
      return isSeam ? [25, 30, 28] : [40, 52, 46];
    } else if (y >= 0.9 && y < 1.5) {
      // Backsplash: white subway tiles with warm under-cabinet strip light
      const tileX = Math.abs(x % 0.3);
      const tileY = Math.abs((y - 0.9) % 0.15);
      const isTileEdge = tileX < 0.008 || tileY < 0.008;
      let col = isTileEdge ? [180, 180, 180] : [235, 235, 232];
      // Under cabinet glow near y=1.5
      const glow = Math.max(0, (y - 1.2) / 0.3) * 35;
      return [col[0] + glow, col[1] + glow * 0.95, col[2] + glow * 0.7];
    } else if (y >= 1.5 && y < 2.5) {
      // Upper cabinets in matching dark forest green oak
      const door = Math.abs(x % 0.6);
      const isSeam = door < 0.01;
      return isSeam ? [25, 30, 28] : [42, 55, 48];
    } else {
      return [230, 230, 232];
    }
  }

  if (surface === 'wall-front') { // z = -3.8 -> passage to Living Room!
    // Open architectural doorway in center
    if (Math.abs(x) < 1.3 && y < 2.4) {
      // View into adjacent Living Room!
      // Parquet floor and living room background
      if (y < 0.6) return [175, 125, 80]; // parquet warmth
      return [215, 205, 195]; // soft warm living room wall
    }
    // Doorway trim
    if (Math.abs(Math.abs(x) - 1.3) < 0.08 && y <= 2.45) return [55, 40, 30]; // wood frame
    if (Math.abs(x) <= 1.3 && Math.abs(y - 2.4) < 0.08) return [55, 40, 30];
    return [232, 230, 226];
  }

  if (surface === 'wall-right') { // x = 3.2
    // Kitchen window above sink looking to garden + shelves
    if (Math.abs(z) < 1.4 && y > 1.1 && y < 2.2) {
      // Garden window
      const frame = Math.abs(z) > 1.3 || Math.abs(y - 1.65) > 0.5 || Math.abs(z) < 0.03;
      if (frame) return [40, 42, 45];
      // Garden green & sunlight
      return [110, 165, 95];
    }
    return [230, 228, 224];
  }

  if (surface === 'wall-left') { // x = -3.2
    // High-end stainless steel double refrigerator and breakfast bar
    if (Math.abs(z - 1.2) < 0.7 && y < 2.2) {
      // Brushed stainless fridge with soft vertical reflection
      const sheen = Math.sin(z * 20) * 15;
      return [170 + sheen, 175 + sheen, 180 + sheen];
    }
    return [228, 226, 222];
  }

  return [200, 200, 200];
}

// 2. BEDROOM
function bedroomScene(dx, dy, dz) {
  const hit = intersectBox(dx, dy, dz, 3.6, 2.8, 3.8, 1.4);
  if (!hit) return [25, 25, 30];

  const { surface, x, y, z } = hit;

  if (surface === 'floor') {
    // Herringbone French oak parquet with cozy area rug under bed
    const inRug = Math.abs(x) < 1.8 && z > 0.2 && z < 3.4;
    if (inRug) {
      // Ivory plush wool rug with soft weave texture
      const weave = Math.sin(x * 40) * Math.cos(z * 40) * 8;
      return [235 + weave, 230 + weave, 220 + weave];
    }
    // French golden oak parquet
    const plank = Math.abs(Math.sin((x + z * 1.5) * 10)) * 20;
    return [180 + plank, 135 + plank * 0.8, 85 + plank * 0.6];
  }

  if (surface === 'ceiling') {
    return [245, 244, 240];
  }

  if (surface === 'wall-back') { // z = 3.8 -> Master Bed & Headboard
    // Fluted vertical walnut slat accent wall behind bed
    const isBedArea = Math.abs(x) < 1.5;
    if (isBedArea && y < 1.3) {
      // Sand bouclé upholstered king headboard
      const texture = Math.sin(x * 30) * Math.cos(y * 30) * 10;
      return [215 + texture, 205 + texture, 190 + texture];
    }
    if (y < 2.6) {
      // Vertical walnut acoustic wood slats
      const slat = Math.sin(x * 45) > 0;
      return slat ? [110, 75, 50] : [55, 35, 25];
    }
    return [230, 228, 222];
  }

  if (surface === 'wall-left') { // x = -3.6 -> Balcony Glass Sliding Doors
    if (y > 0.1 && y < 2.5 && Math.abs(z) < 2.2) {
      // Big glass balcony doors
      const frame = Math.abs(y - 1.3) > 1.15 || Math.abs(z) > 2.1 || Math.abs(z % 1.0) < 0.04;
      if (frame) return [45, 45, 48];
      // Sunlit terrace view with blue sky gradient
      const sky = y / 2.5;
      return [140 + sky * 50, 180 + sky * 40, 230];
    }
    return [232, 230, 225];
  }

  if (surface === 'wall-right') { // x = 3.6 -> Door to Ensuite Bathroom
    if (Math.abs(z - 1.0) < 0.55 && y < 2.2) {
      // Modern frosted fluted glass pocket door to ensuite bathroom!
      if (y < 0.05 || y > 2.15 || Math.abs(z - 1.0) > 0.5) return [50, 45, 40];
      // Soft glowing interior light from bathroom
      return [230, 225, 210];
    }
    // Wardrobe closet with warm brass strip handles
    return [232, 229, 224];
  }

  if (surface === 'wall-front') { // z = -3.8 -> Doorway to living/hallway & modern art
    if (Math.abs(x + 1.2) < 0.6 && y < 2.2) {
      // Door to hallway/living
      return [210, 195, 180];
    }
    // Contemporary framed art print on wall
    if (Math.abs(x - 1.0) < 0.8 && y > 1.1 && y < 2.1) {
      const artFrame = Math.abs(x - 1.0) > 0.75 || Math.abs(y - 1.6) > 0.45;
      if (artFrame) return [30, 30, 32];
      return [195, 160, 130];
    }
    return [235, 232, 227];
  }

  return [220, 220, 220];
}

// 3. BATHROOM
function bathroomScene(dx, dy, dz) {
  const hit = intersectBox(dx, dy, dz, 2.8, 2.7, 3.0, 1.4);
  if (!hit) return [20, 25, 30];

  const { surface, x, y, z } = hit;

  if (surface === 'floor') {
    // Italian Carrara marble slab with subtle charcoal veins
    const vein = Math.sin(x * 6 + z * 8) + Math.cos(x * 12 - z * 4) * 0.5;
    const isVein = Math.abs(vein) < 0.15;
    return isVein ? [160, 165, 170] : [235, 238, 240];
  }

  if (surface === 'ceiling') {
    return [245, 246, 248];
  }

  if (surface === 'wall-back') { // z = 3.0 -> Walk-in shower wetroom
    // Large format grey stone tile with recessed niche
    const tileY = Math.abs(y % 0.6);
    const tileX = Math.abs(x % 1.2);
    const isGrout = tileY < 0.015 || tileX < 0.015;
    if (isGrout) return [130, 132, 135];
    // Illuminated niche at center
    if (Math.abs(x) < 0.6 && y > 1.2 && y < 1.6) {
      return [255, 240, 205]; // warm LED niche glow
    }
    return [195, 200, 205];
  }

  if (surface === 'wall-left') { // x = -2.8 -> Floating double vanity & LED mirror
    if (y > 0.6 && y < 0.9 && Math.abs(z) < 1.4) {
      // Natural smoked oak vanity drawer
      return [115, 80, 55];
    }
    if (y >= 0.9 && y < 0.95 && Math.abs(z) < 1.45) {
      // White quartz vanity top
      return [245, 246, 248];
    }
    if (y >= 1.1 && y < 2.0 && Math.abs(z) < 1.1) {
      // Round illuminated backlit mirror
      const r = Math.hypot(z, y - 1.55);
      if (r < 0.55) {
        // Mirror reflection with bathroom tones
        return [225, 230, 235];
      }
      if (r < 0.62) {
        // Halo LED ring
        return [255, 250, 220];
      }
    }
    return [230, 232, 235];
  }

  if (surface === 'wall-right') { // x = 2.8 -> Freestanding tub & privacy window
    if (y > 1.2 && y < 2.0 && Math.abs(z) < 0.8) {
      // Frosted privacy window with soft outdoor daylight
      const frame = Math.abs(z) > 0.75 || Math.abs(y - 1.6) > 0.35;
      if (frame) return [60, 60, 65];
      return [240, 248, 255];
    }
    if (y < 0.75 && Math.abs(z) < 0.9) {
      // Freestanding soaking bathtub curve
      return [245, 247, 250];
    }
    return [228, 230, 233];
  }

  if (surface === 'wall-front') { // z = -3.0 -> Doorway back to Master Bedroom
    if (Math.abs(x) < 0.6 && y < 2.2) {
      // Open pocket door view into Bedroom
      if (y < 0.6) return [180, 135, 85]; // oak parquet
      return [215, 205, 190]; // bedroom warmth
    }
    return [232, 233, 236];
  }

  return [220, 220, 220];
}

// Generate all rooms
console.log('Generating demo tour panoramas...');

renderEquirectangular(kitchenScene, 'tours/demo-property/kitchen.jpg', 'tours/demo-property/kitchen-thumb.jpg');
renderEquirectangular(bedroomScene, 'tours/demo-property/bedroom.jpg', 'tours/demo-property/bedroom-thumb.jpg');
renderEquirectangular(bathroomScene, 'tours/demo-property/bathroom.jpg', 'tours/demo-property/bathroom-thumb.jpg');

// Also generate living-room-thumb.jpg from living-room.jpg
if (fs.existsSync('tours/demo-property/living-room.jpg')) {
  execSync('convert tours/demo-property/living-room.jpg -resize 240x120 -quality 85 tours/demo-property/living-room-thumb.jpg');
  console.log('Generated living-room-thumb.jpg');
}

console.log('Done generating panoramas!');
