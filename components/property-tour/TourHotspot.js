/**
 * TourHotspot - High-precision circular floating navigation & blinking detail markers
 */
import { escapeHtml } from './tour.utils.js';

export class TourHotspot {
  /**
   * @param {Object} options
   * @param {import('./tour.types.js').TourHotspot} options.data
   * @param {(targetSceneId: string) => void} [options.onNavigate]
   * @param {(info: Object) => void} [options.onInfo]
   */
  constructor(options) {
    this.data = options.data;
    this.onNavigate = options.onNavigate;
    this.onInfo = options.onInfo;

    const isDetail = this.data.type === 'detail' || Boolean(this.data.isBlinking) || Boolean(this.data.detailImageUrl);
    const isBlinking = this.data.isBlinking !== false && (isDetail || this.data.type === 'info');

    this.element = document.createElement('div');
    this.element.className = [
      'ptour-hotspot',
      `ptour-hotspot-${this.data.type || 'navigation'}`,
      isDetail ? 'ptour-hotspot-detail' : '',
      isBlinking ? 'ptour-hotspot-blinking' : '',
    ].filter(Boolean).join(' ');

    this.element.setAttribute('data-id', this.data.id);
    this.element.setAttribute('data-type', this.data.type || 'navigation');
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('tabindex', '0');

    this.render();
    this.bind();
  }

  render() {
    const isDetail = this.data.type === 'detail' || Boolean(this.data.detailImageUrl);
    const isInfo = this.data.type === 'info' || isDetail;
    const isBlinking = this.data.isBlinking !== false && isInfo;
    const label = escapeHtml(this.data.label || this.data.title || (isInfo ? 'Détail d\'Exception' : 'Entrer dans la pièce'));
    const category = escapeHtml(this.data.category || (isDetail ? 'Artisanat & Matières Nobles' : 'Information Pièce'));

    if (isDetail || isBlinking) {
      this.element.innerHTML = `
        <div class="ptour-hotspot-beacon ptour-beacon-blinking">
          <span class="ptour-beacon-radar-ring ptour-radar-ring-1" aria-hidden="true"></span>
          <span class="ptour-beacon-radar-ring ptour-radar-ring-2" aria-hidden="true"></span>
          <span class="ptour-hotspot-ripple" aria-hidden="true"></span>
          <div class="ptour-hotspot-core ptour-core-blinking">
            <span class="ptour-hotspot-icon" aria-hidden="true">✦</span>
          </div>
        </div>
        <div class="ptour-hotspot-tooltip ptour-tooltip-detail">
          <div class="ptour-tooltip-header">
            <span class="ptour-tooltip-tag">✦ ${category}</span>
          </div>
          <div class="ptour-tooltip-body">
            <span class="ptour-tooltip-title">${label}</span>
            <span class="ptour-tooltip-action">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px; display: inline-block; vertical-align: middle;">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Cliquer pour zoomer &amp; examiner
            </span>
          </div>
        </div>
      `;
      this.element.setAttribute('aria-label', `Détail d'artisanat : ${label}. Cliquer pour zoomer et examiner le détail.`);
    } else {
      this.element.innerHTML = `
        <div class="ptour-hotspot-beacon">
          <span class="ptour-hotspot-ripple" aria-hidden="true"></span>
          <div class="ptour-hotspot-core">
            <span class="ptour-hotspot-icon" aria-hidden="true">◉</span>
          </div>
        </div>
        <div class="ptour-hotspot-tooltip">
          <span class="ptour-hotspot-glyph">◉</span>
          <span class="ptour-hotspot-label">${label}</span>
        </div>
      `;
      this.element.setAttribute('aria-label', `Accéder à la pièce : ${label}`);
    }
  }

  bind() {
    const activate = (event) => {
      event.stopPropagation();
      event.preventDefault();

      const isDetail = this.data.type === 'detail' || Boolean(this.data.detailImageUrl);
      const isInfo = this.data.type === 'info' || isDetail;

      if (isInfo) {
        if (typeof this.onInfo === 'function') {
          this.onInfo({
            id: this.data.id,
            title: this.data.title || this.data.label || 'Détail Architectural',
            description: this.data.description || 'Détail de finition d\'exception et matériaux nobles.',
            label: this.data.label || 'Détail',
            category: this.data.category || 'Finitions & Artisanat d\'Art',
            artisan: this.data.artisan || 'Compagnons d\'Art & Maîtres Artisans',
            materials: this.data.materials || 'Matériaux nobles sélectionnés',
            specifications: this.data.specifications || 'Restauration dans les règles de l\'art',
            imageUrl: this.data.detailImageUrl || this.data.imageUrl || '',
            yaw: typeof this.data.yaw === 'number' ? this.data.yaw : 0,
            pitch: typeof this.data.pitch === 'number' ? this.data.pitch : 0,
            zoomFov: this.data.zoomFov || 32,
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

