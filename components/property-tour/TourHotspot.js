/**
 * TourHotspot - Minimal circular floating navigation & info markers
 */
import { escapeHtml } from './tour.utils.js';

export class TourHotspot {
  /**
   * @param {Object} options
   * @param {import('./tour.types.js').TourHotspot} options.data
   * @param {(targetSceneId: string) => void} [options.onNavigate]
   * @param {(info: { title: string, description: string, label: string }) => void} [options.onInfo]
   */
  constructor(options) {
    this.data = options.data;
    this.onNavigate = options.onNavigate;
    this.onInfo = options.onInfo;

    this.element = document.createElement('div');
    this.element.className = `ptour-hotspot ptour-hotspot-${this.data.type || 'navigation'}`;
    this.element.setAttribute('data-id', this.data.id);
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('tabindex', '0');

    this.render();
    this.bind();
  }

  render() {
    const isInfo = this.data.type === 'info';
    const label = escapeHtml(this.data.label || (isInfo ? 'Information' : 'Enter Room'));

    this.element.innerHTML = `
      <div class="ptour-hotspot-beacon">
        <span class="ptour-hotspot-ripple"></span>
        <div class="ptour-hotspot-core">
          ${isInfo ? `
            <span class="ptour-hotspot-icon" aria-hidden="true">i</span>
          ` : `
            <span class="ptour-hotspot-icon" aria-hidden="true">◉</span>
          `}
        </div>
      </div>
      <div class="ptour-hotspot-tooltip">
        <span class="ptour-hotspot-glyph">${isInfo ? 'ⓘ' : '◉'}</span>
        <span class="ptour-hotspot-label">${label}</span>
      </div>
    `;

    this.element.setAttribute('aria-label', `${isInfo ? 'Information' : 'Navigate to'}: ${label}`);
  }

  bind() {
    const activate = (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (this.data.type === 'info') {
        if (typeof this.onInfo === 'function') {
          this.onInfo({
            title: this.data.title || this.data.label || 'Room Feature',
            description: this.data.description || 'Details regarding this property feature.',
            label: this.data.label || 'Information',
          });
        }
      } else {
        if (typeof this.onNavigate === 'function' && this.data.targetSceneId) {
          this.onNavigate(this.data.targetSceneId);
        }
      }
    };

    this.element.addEventListener('click', activate);
    this.element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        activate(event);
      }
    });
  }

  /**
   * Sets screen position in pixels
   * @param {number} x
   * @param {number} y
   * @param {boolean} isVisible
   */
  setPosition(x, y, isVisible) {
    if (!isVisible) {
      this.element.style.display = 'none';
      return;
    }
    this.element.style.display = 'block';
    this.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  destroy() {
    this.element.remove();
  }
}
