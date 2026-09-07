/**
 * 3D Property Tour - Utility functions
 */

/**
 * Escapes HTML characters to prevent XSS.
 * @param {any} val
 * @returns {string}
 */
export function escapeHtml(val) {
  return String(val ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[char]));
}

/**
 * Validates external tour URLs (e.g. Matterport) to ensure only safe HTTPS embeds are loaded.
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch (err) {
    return false;
  }
}

/**
 * Clamps a number within range.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * Converts yaw and pitch (in radians) to 3D coordinates on a unit sphere.
 * Yaw = azimuth (-PI to PI), Pitch = elevation (-PI/2 to PI/2).
 * @param {number} yaw
 * @param {number} pitch
 * @param {number} [radius=1]
 * @returns {{ x: number, y: number, z: number }}
 */
export function sphericalToCartesian(yaw, pitch, radius = 1) {
  const cosPitch = Math.cos(pitch);
  return {
    x: radius * cosPitch * Math.sin(yaw),
    y: radius * Math.sin(pitch),
    z: -radius * cosPitch * Math.cos(yaw),
  };
}

/**
 * Normalizes an angle into the [-PI, PI] range.
 * @param {number} angle
 * @returns {number}
 */
export function normalizeAngle(angle) {
  let a = angle % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

/**
 * Checks if the browser is currently in fullscreen mode.
 * @returns {boolean}
 */
export function isFullscreen() {
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Requests or exits fullscreen on an element.
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
export async function toggleFullscreen(element) {
  try {
    if (!isFullscreen()) {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    }
  } catch (err) {
    console.warn('Fullscreen request failed:', err);
  }
}

/**
 * Detects if touch input is supported.
 * @returns {boolean}
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
