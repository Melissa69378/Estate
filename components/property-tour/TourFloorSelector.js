/**
 * TourFloorSelector - Pill selector for switching between property floors
 */
import { escapeHtml } from './tour.utils.js';

export class TourFloorSelector {
  /**
   * @param {Object} options
   * @param {string[]} options.floors - Array of distinct floor names
   * @param {string} [options.activeFloor] - Initially selected floor
   * @param {(floor: string) => void} [options.onSelectFloor]
   */
  constructor(options) {
    this.floors = options.floors || [];
    this.activeFloor = options.activeFloor || this.floors[0] || '';
    this.onSelectFloor = options.onSelectFloor;

    this.element = document.createElement('div');
    this.element.className = 'ptour-floor-selector';
    this.render();
  }

  render() {
    // If only 1 floor (or 0), hide selector as per requirement
    if (this.floors.length <= 1) {
      this.element.classList.add('hidden');
      return;
    }

    this.element.classList.remove('hidden');
    this.element.innerHTML = `
      <div class="ptour-floors-list" role="tablist" aria-label="Floor selection">
        ${this.floors.map((floor) => `
          <button type="button" role="tab" class="ptour-floor-pill ${floor === this.activeFloor ? 'active' : ''}" data-floor="${escapeHtml(floor)}" aria-selected="${floor === this.activeFloor ? 'true' : 'false'}">
            <span class="ptour-floor-icon">🪜</span>
            <span>${escapeHtml(floor)}</span>
          </button>
        `).join('')}
      </div>
    `;

    this.element.querySelectorAll('.ptour-floor-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        const floor = btn.dataset.floor;
        if (floor && floor !== this.activeFloor) {
          this.setActiveFloor(floor);
          if (typeof this.onSelectFloor === 'function') {
            this.onSelectFloor(floor);
          }
        }
      });
    });
  }

  setActiveFloor(floor) {
    this.activeFloor = floor;
    this.element.querySelectorAll('.ptour-floor-pill').forEach((btn) => {
      const isMatch = btn.dataset.floor === floor;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
  }

  destroy() {
    this.element.remove();
  }
}
