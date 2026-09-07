/**
 * TourSceneSelector - Horizontal scrollable carousel of rooms with thumbnails
 */
import { escapeHtml } from './tour.utils.js';

export class TourSceneSelector {
  /**
   * @param {Object} options
   * @param {import('./tour.types.js').TourScene[]} options.scenes
   * @param {string} [options.activeSceneId]
   * @param {(sceneId: string) => void} [options.onSelectScene]
   */
  constructor(options) {
    this.allScenes = options.scenes || [];
    this.visibleScenes = [...this.allScenes];
    this.activeSceneId = options.activeSceneId || this.allScenes[0]?.id || '';
    this.onSelectScene = options.onSelectScene;

    this.element = document.createElement('nav');
    this.element.className = 'ptour-scene-selector';
    this.element.setAttribute('aria-label', 'Rooms navigation');

    this.render();
  }

  render() {
    this.element.innerHTML = `
      <div class="ptour-scenes-track" role="tablist">
        ${this.visibleScenes.map((scene) => {
          const isActive = scene.id === this.activeSceneId;
          const thumb = scene.thumbnailUrl || scene.panoramaUrl;
          return `
            <button type="button" role="tab" class="ptour-scene-card ${isActive ? 'active' : ''}" data-scene-id="${escapeHtml(scene.id)}" aria-selected="${isActive ? 'true' : 'false'}">
              <div class="ptour-scene-thumb" style="background-image: url('${escapeHtml(thumb)}');">
                <span class="ptour-scene-active-indicator" aria-hidden="true">◉</span>
              </div>
              <div class="ptour-scene-meta">
                <span class="ptour-scene-title">${escapeHtml(scene.name)}</span>
                ${scene.floor ? `<span class="ptour-scene-floor">${escapeHtml(scene.floor)}</span>` : ''}
              </div>
            </button>
          `;
        }).join('')}
      </div>
    `;

    this.bind();
  }

  bind() {
    this.element.querySelectorAll('.ptour-scene-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.sceneId;
        if (id && id !== this.activeSceneId) {
          this.setActiveScene(id);
          if (typeof this.onSelectScene === 'function') {
            this.onSelectScene(id);
          }
        }
      });
    });
  }

  /**
   * Filters the visible rooms by floor name
   * @param {string} floor
   */
  filterByFloor(floor) {
    if (!floor) {
      this.visibleScenes = [...this.allScenes];
    } else {
      this.visibleScenes = this.allScenes.filter((s) => !s.floor || s.floor === floor);
    }
    this.render();
    this.scrollToActive();
  }

  /**
   * Updates the active scene card
   * @param {string} sceneId
   */
  setActiveScene(sceneId) {
    this.activeSceneId = sceneId;
    this.element.querySelectorAll('.ptour-scene-card').forEach((btn) => {
      const isMatch = btn.dataset.sceneId === sceneId;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
    this.scrollToActive();
  }

  scrollToActive() {
    const activeBtn = this.element.querySelector('.ptour-scene-card.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  destroy() {
    this.element.remove();
  }
}
