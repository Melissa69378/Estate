/**
 * TourFloorPlan - Interactive 2D architectural blueprint overlay with selectable room pins
 */
import { escapeHtml } from './tour.utils.js';

export class TourFloorPlan {
  /**
   * @param {Object} options
   * @param {import('./tour.types.js').FloorPlanData} options.floorPlan
   * @param {string} [options.activeSceneId]
   * @param {(sceneId: string) => void} [options.onSelectScene]
   * @param {() => void} [options.onClose]
   */
  constructor(options) {
    this.floorPlan = options.floorPlan || {};
    this.activeSceneId = options.activeSceneId || '';
    this.onSelectScene = options.onSelectScene;
    this.onClose = options.onClose;

    this.element = document.createElement('div');
    this.element.className = 'ptour-floorplan-modal hidden';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', 'Interactive Floor Plan');

    this.render();
  }

  render() {
    const imageUrl = this.floorPlan.imageUrl || '/tours/demo-property/floor-plan.svg';
    const markers = Array.isArray(this.floorPlan.markers) ? this.floorPlan.markers : [];

    this.element.innerHTML = `
      <div class="ptour-floorplan-card">
        <div class="ptour-floorplan-header">
          <div>
            <div class="ptour-floorplan-eyebrow">ARCHITECTURAL PLAN</div>
            <h3 class="ptour-floorplan-title">Interactive Floor Plan</h3>
          </div>
          <button type="button" class="ptour-floorplan-close" aria-label="Close floor plan">&times;</button>
        </div>

        <div class="ptour-floorplan-container">
          <img class="ptour-floorplan-img" src="${escapeHtml(imageUrl)}" alt="Property architectural floor plan" />
          
          <div class="ptour-floorplan-markers">
            ${markers.map((m) => {
              const isActive = m.sceneId === this.activeSceneId;
              return `
                <button type="button" class="ptour-plan-pin ${isActive ? 'active' : ''}" style="left: ${m.x}%; top: ${m.y}%;" data-scene-id="${escapeHtml(m.sceneId)}" aria-label="${escapeHtml(m.label || m.sceneId)}">
                  <span class="ptour-plan-pin-ring"></span>
                  <span class="ptour-plan-pin-dot"></span>
                  <span class="ptour-plan-pin-tooltip">${escapeHtml(m.label || m.sceneId)}</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <div class="ptour-floorplan-footer">
          <span class="ptour-floorplan-hint">Click on any room marker to jump into that 360° space</span>
        </div>
      </div>
    `;

    this.bind();
  }

  bind() {
    this.element.querySelector('.ptour-floorplan-close')?.addEventListener('click', () => {
      this.hide();
      if (typeof this.onClose === 'function') this.onClose();
    });

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.hide();
        if (typeof this.onClose === 'function') this.onClose();
      }
    });

    this.element.querySelectorAll('.ptour-plan-pin').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sceneId = btn.dataset.sceneId;
        if (sceneId) {
          this.setActiveScene(sceneId);
          this.hide();
          if (typeof this.onSelectScene === 'function') {
            this.onSelectScene(sceneId);
          }
        }
      });
    });
  }

  setActiveScene(sceneId) {
    this.activeSceneId = sceneId;
    this.element.querySelectorAll('.ptour-plan-pin').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.sceneId === sceneId);
    });
  }

  show() {
    this.element.classList.remove('hidden');
  }

  hide() {
    this.element.classList.add('hidden');
  }

  toggle() {
    if (this.element.classList.contains('hidden')) {
      this.show();
    } else {
      this.hide();
    }
  }

  destroy() {
    this.element.remove();
  }
}
