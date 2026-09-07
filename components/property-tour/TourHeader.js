/**
 * TourHeader - Top navigation bar with property title, current scene/floor, fullscreen and close buttons
 */
import { escapeHtml } from './tour.utils.js';

export class TourHeader {
  /**
   * @param {Object} options
   * @param {string} options.propertyName
   * @param {string} [options.sceneName]
   * @param {string} [options.floorName]
   * @param {() => void} [options.onClose]
   * @param {() => void} [options.onToggleFullscreen]
   */
  constructor(options = {}) {
    this.propertyName = options.propertyName || 'Property Tour';
    this.sceneName = options.sceneName || '';
    this.floorName = options.floorName || '';
    this.onClose = options.onClose;
    this.onToggleFullscreen = options.onToggleFullscreen;

    this.element = document.createElement('header');
    this.element.className = 'ptour-header';
    this.render();
  }

  render() {
    this.element.innerHTML = `
      <div class="ptour-header-info">
        <div class="ptour-badge">3D PROPERTY TOUR</div>
        <h2 class="ptour-property-title">${escapeHtml(this.propertyName)}</h2>
        <div class="ptour-scene-breadcrumbs">
          ${this.floorName ? `<span class="ptour-floor-badge">${escapeHtml(this.floorName)}</span>` : ''}
          ${this.sceneName ? `<span class="ptour-scene-badge">◉ ${escapeHtml(this.sceneName)}</span>` : ''}
        </div>
      </div>
      <div class="ptour-header-actions">
        <button type="button" class="ptour-icon-btn ptour-fs-btn" aria-label="Toggle fullscreen" title="Fullscreen">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
        <button type="button" class="ptour-icon-btn ptour-close-btn" aria-label="Close 3D Tour" title="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;

    this.element.querySelector('.ptour-close-btn')?.addEventListener('click', () => {
      if (typeof this.onClose === 'function') this.onClose();
    });

    this.element.querySelector('.ptour-fs-btn')?.addEventListener('click', () => {
      if (typeof this.onToggleFullscreen === 'function') this.onToggleFullscreen();
    });
  }

  updateScene(sceneName, floorName) {
    this.sceneName = sceneName;
    this.floorName = floorName;
    const breadcrumbs = this.element.querySelector('.ptour-scene-breadcrumbs');
    if (breadcrumbs) {
      breadcrumbs.innerHTML = `
        ${this.floorName ? `<span class="ptour-floor-badge">${escapeHtml(this.floorName)}</span>` : ''}
        ${this.sceneName ? `<span class="ptour-scene-badge">◉ ${escapeHtml(this.sceneName)}</span>` : ''}
      `;
    }
  }

  destroy() {
    this.element.remove();
  }
}
