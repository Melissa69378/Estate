/**
 * TourControls - Discreet floating bottom glass bar with tour actions and closer detail inspector
 */
export class TourControls {
  /**
   * @param {Object} options
   * @param {() => void} [options.onZoomIn]
   * @param {() => void} [options.onZoomOut]
   * @param {() => void} [options.onResetView]
   * @param {() => void} [options.onToggleFloorPlan]
   * @param {() => void} [options.onToggleFullscreen]
   * @param {() => void} [options.onHelp]
   * @param {() => void} [options.onInspectDetails]
   * @param {boolean} [options.hasFloorPlan=true]
   * @param {number} [options.detailsCount=0]
   */
  constructor(options = {}) {
    this.options = options;
    this.detailsCount = options.detailsCount || 0;
    this.element = document.createElement('div');
    this.element.className = 'ptour-controls-bar';
    this.render();
  }

  render() {
    this.element.innerHTML = `
      <div class="ptour-controls-group">
        <button type="button" class="ptour-control-btn ptour-zoom-in" title="Zoomer (+)" aria-label="Zoom in">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button type="button" class="ptour-control-btn ptour-zoom-out" title="Dézoomer (-)" aria-label="Zoom out">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
        <button type="button" class="ptour-control-btn ptour-reset-view" title="Vue d'ensemble 360°" aria-label="Reset view">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>

      <div class="ptour-controls-divider"></div>

      <!-- Closer Detail Inspector Button -->
      <button type="button" class="ptour-control-btn ptour-control-btn-text ptour-details-btn ${this.detailsCount > 0 ? '' : 'hidden'}" title="Examiner les détails de près" aria-label="Inspecter les détails">
        <span class="ptour-btn-sparkle" aria-hidden="true">✦</span>
        <span>Détails d'exception</span>
        <span class="ptour-details-pill-count" id="ptour-details-pill-count">${this.detailsCount}</span>
      </button>

      ${this.options.hasFloorPlan ? `
        <button type="button" class="ptour-control-btn ptour-control-btn-text ptour-floorplan-btn" title="Afficher le plan du niveau" aria-label="Plan du niveau">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
          <span>Plan</span>
        </button>
      ` : ''}

      <div class="ptour-controls-divider"></div>

      <div class="ptour-controls-group">
        <button type="button" class="ptour-control-btn ptour-fs-toggle" title="Plein écran" aria-label="Plein écran">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
        <button type="button" class="ptour-control-btn ptour-help-btn" title="Aide de navigation" aria-label="Aide">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>
      </div>
    `;

    this.element.querySelector('.ptour-zoom-in')?.addEventListener('click', () => this.options.onZoomIn?.());
    this.element.querySelector('.ptour-zoom-out')?.addEventListener('click', () => this.options.onZoomOut?.());
    this.element.querySelector('.ptour-reset-view')?.addEventListener('click', () => this.options.onResetView?.());
    this.element.querySelector('.ptour-details-btn')?.addEventListener('click', () => this.options.onInspectDetails?.());
    this.element.querySelector('.ptour-floorplan-btn')?.addEventListener('click', () => this.options.onToggleFloorPlan?.());
    this.element.querySelector('.ptour-fs-toggle')?.addEventListener('click', () => this.options.onToggleFullscreen?.());
    this.element.querySelector('.ptour-help-btn')?.addEventListener('click', () => this.options.onHelp?.());
  }

  setDetailsCount(count) {
    this.detailsCount = count;
    const btn = this.element.querySelector('.ptour-details-btn');
    const countEl = this.element.querySelector('#ptour-details-pill-count');
    if (btn) {
      btn.classList.toggle('hidden', count <= 0);
    }
    if (countEl) {
      countEl.textContent = String(count);
    }
  }

  setFloorPlanActive(isActive) {
    const btn = this.element.querySelector('.ptour-floorplan-btn');
    if (btn) btn.classList.toggle('active', Boolean(isActive));
  }

  destroy() {
    this.element.remove();
  }
}

