/**
 * TourLoading - Minimal elegant loading indicator
 */
import { escapeHtml } from './tour.utils.js';

export class TourLoading {
  /**
   * @param {Object} options
   * @param {string} [options.message='Preparing your property tour...']
   */
  constructor(options = {}) {
    this.message = options.message || 'Preparing your property tour...';
    this.element = document.createElement('div');
    this.element.className = 'ptour-loading';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.innerHTML = `
      <div class="ptour-loading-card">
        <div class="ptour-loading-spinner" aria-hidden="true"></div>
        <p class="ptour-loading-text">${escapeHtml(this.message)}</p>
      </div>
    `;
  }

  /**
   * Updates loading status text
   * @param {string} message
   */
  setMessage(message) {
    this.message = message;
    const textEl = this.element.querySelector('.ptour-loading-text');
    if (textEl) textEl.textContent = message;
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  destroy() {
    this.element.remove();
  }
}
