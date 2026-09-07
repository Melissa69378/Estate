/**
 * TourInfoPanel - Modal card showing details for information hotspots
 */
import { escapeHtml } from './tour.utils.js';

export class TourInfoPanel {
  /**
   * @param {Object} [options]
   * @param {() => void} [options.onClose]
   */
  constructor(options = {}) {
    this.onClose = options.onClose;
    this.element = document.createElement('div');
    this.element.className = 'ptour-info-panel hidden';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'ptour-info-title');

    this.element.innerHTML = `
      <div class="ptour-info-card">
        <div class="ptour-info-header">
          <div class="ptour-info-eyebrow">
            <span class="ptour-info-badge">ⓘ FEATURE</span>
            <span class="ptour-info-tag"></span>
          </div>
          <button type="button" class="ptour-info-close" aria-label="Close details">&times;</button>
        </div>
        <h3 class="ptour-info-title" id="ptour-info-title"></h3>
        <p class="ptour-info-description"></p>
      </div>
    `;

    this.element.querySelector('.ptour-info-close')?.addEventListener('click', () => {
      this.hide();
      if (typeof this.onClose === 'function') this.onClose();
    });

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.hide();
        if (typeof this.onClose === 'function') this.onClose();
      }
    });
  }

  /**
   * @param {{ title: string, description: string, label?: string }} data
   */
  show(data) {
    const titleEl = this.element.querySelector('.ptour-info-title');
    const descEl = this.element.querySelector('.ptour-info-description');
    const tagEl = this.element.querySelector('.ptour-info-tag');

    if (titleEl) titleEl.textContent = data.title || 'Feature';
    if (descEl) descEl.textContent = data.description || '';
    if (tagEl) tagEl.textContent = data.label ? `· ${data.label}` : '';

    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  destroy() {
    this.element.remove();
  }
}
