/**
 * TourError - Elegant error fallback state
 */
import { escapeHtml } from './tour.utils.js';

export class TourError {
  /**
   * @param {Object} options
   * @param {string} [options.title='Unable to load the property tour.']
   * @param {string} [options.details='']
   * @param {() => void} [options.onRetry]
   * @param {() => void} [options.onFallback]
   */
  constructor(options = {}) {
    this.title = options.title || 'Unable to load the property tour.';
    this.details = options.details || 'Please check your connection or try again.';
    this.onRetry = options.onRetry;
    this.onFallback = options.onFallback;

    this.element = document.createElement('div');
    this.element.className = 'ptour-error hidden';
    this.element.setAttribute('role', 'alert');
    this.element.innerHTML = `
      <div class="ptour-error-card">
        <div class="ptour-error-icon" aria-hidden="true">⚠️</div>
        <h3 class="ptour-error-title">${escapeHtml(this.title)}</h3>
        <p class="ptour-error-details">${escapeHtml(this.details)}</p>
        <div class="ptour-error-actions">
          <button type="button" class="ptour-btn ptour-btn-primary ptour-retry-btn">Try Again</button>
          <button type="button" class="ptour-btn ptour-btn-secondary ptour-photos-btn">View Photos</button>
        </div>
      </div>
    `;

    this.element.querySelector('.ptour-retry-btn')?.addEventListener('click', () => {
      this.hide();
      if (typeof this.onRetry === 'function') this.onRetry();
    });

    this.element.querySelector('.ptour-photos-btn')?.addEventListener('click', () => {
      this.hide();
      if (typeof this.onFallback === 'function') this.onFallback();
    });
  }

  show(details) {
    if (details) {
      const detailsEl = this.element.querySelector('.ptour-error-details');
      if (detailsEl) detailsEl.textContent = details;
    }
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  destroy() {
    this.element.remove();
  }
}
