/**
 * PropertyTour - Master 3D Property Tour Component
 * Coordinates WebGL 360 viewer, header, controls, floor selector, room carousel, floor plan, and info panels.
 */
import { normalizeTourData } from './tour.types.js';
import { toggleFullscreen, isFullscreen } from './tour.utils.js';
import { TourViewer } from './TourViewer.js';
import { TourHeader } from './TourHeader.js';
import { TourControls } from './TourControls.js';
import { TourFloorSelector } from './TourFloorSelector.js';
import { TourSceneSelector } from './TourSceneSelector.js';
import { TourFloorPlan } from './TourFloorPlan.js';
import { TourInfoPanel } from './TourInfoPanel.js';
import { TourLoading } from './TourLoading.js';
import { TourError } from './TourError.js';

let activeTourInstance = null;

export class PropertyTour {
  /**
   * @param {Object} options
   * @param {any} [options.property] - Property metadata or object
   * @param {import('./tour.types.js').TourData} [options.tour] - Tour data
   * @param {HTMLElement} [options.container] - Container element (defaults to document.body)
   * @param {() => void} [options.onClose] - Close callback
   */
  constructor(options = {}) {
    const propName = options.property?.name || options.property?.title || (typeof options.property === 'string' ? options.property : 'Laforêt Residence');
    this.property = options.property;
    this.tourData = normalizeTourData(options.tour, propName);
    this.parentContainer = options.container || document.body;
    this.onCloseCallback = options.onClose;

    // Component instances
    this.viewer = null;
    this.header = null;
    this.controls = null;
    this.floorSelector = null;
    this.sceneSelector = null;
    this.floorPlanModal = null;
    this.infoPanel = null;
    this.loading = null;
    this.error = null;

    // Root DOM wrapper
    this.element = document.createElement('div');
    this.element.className = 'ptour-root';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-label', `3D Property Tour: ${propName}`);

    this.init();
  }

  init() {
    this.renderShell();
    this.mountComponents();
    this.bindGlobalKeyboard();
  }

  renderShell() {
    this.element.innerHTML = `
      <div class="ptour-backdrop"></div>
      <div class="ptour-stage">
        <div class="ptour-viewer-mount"></div>
        <div class="ptour-ui-layer">
          <div class="ptour-header-slot"></div>
          <div class="ptour-bottom-dock">
            <div class="ptour-floor-slot"></div>
            <div class="ptour-scenes-slot"></div>
            <div class="ptour-controls-slot"></div>
          </div>
        </div>
        <div class="ptour-modals-layer"></div>
      </div>
    `;

    this.parentContainer.appendChild(this.element);
    document.body.classList.add('ptour-active');
  }

  mountComponents() {
    const viewerMount = this.element.querySelector('.ptour-viewer-mount');
    const headerSlot = this.element.querySelector('.ptour-header-slot');
    const floorSlot = this.element.querySelector('.ptour-floor-slot');
    const scenesSlot = this.element.querySelector('.ptour-scenes-slot');
    const controlsSlot = this.element.querySelector('.ptour-controls-slot');
    const modalsLayer = this.element.querySelector('.ptour-modals-layer');

    const startingScene = this.tourData.scenes.find((s) => s.id === this.tourData.startingSceneId) || this.tourData.scenes[0];

    const getRoomDetails = (scene) => (scene?.hotspots || []).filter((h) => h.type === 'detail' || h.type === 'info' || h.isBlinking);
    const initialDetails = getRoomDetails(startingScene);

    // 1. Loading & Error components
    this.loading = new TourLoading();
    modalsLayer.appendChild(this.loading.element);

    this.error = new TourError({
      onRetry: () => {
        if (this.viewer && startingScene) {
          this.viewer.loadScene(startingScene);
        }
      },
      onFallback: () => {
        this.close();
      },
    });
    modalsLayer.appendChild(this.error.element);

    // 2. Info Panel / Closer Detail Inspector
    this.infoPanel = new TourInfoPanel({
      onFocusCamera: (detail) => {
        if (this.viewer && typeof detail.yaw === 'number' && typeof detail.pitch === 'number') {
          this.viewer.focusOnCoordinate(detail.yaw, detail.pitch, detail.zoomFov || 28);
        }
      },
      onResetCamera: () => {
        this.viewer?.resetView();
      },
      onSelectDetail: (detail) => {
        if (this.viewer && typeof detail.yaw === 'number' && typeof detail.pitch === 'number') {
          this.viewer.focusOnCoordinate(detail.yaw, detail.pitch, detail.zoomFov || 28);
        }
      },
    });
    this.infoPanel.setRoomDetails(initialDetails);
    modalsLayer.appendChild(this.infoPanel.element);

    // 3. Floor Plan Modal
    this.floorPlanModal = new TourFloorPlan({
      floorPlan: this.tourData.floorPlan,
      activeSceneId: startingScene?.id,
      onSelectScene: (sceneId) => {
        this.viewer?.switchScene(sceneId);
      },
      onClose: () => {
        this.controls?.setFloorPlanActive(false);
      },
    });
    modalsLayer.appendChild(this.floorPlanModal.element);

    // 4. Header
    this.header = new TourHeader({
      propertyName: this.tourData.propertyName,
      sceneName: startingScene?.name || '',
      floorName: startingScene?.floor || '',
      onClose: () => this.close(),
      onToggleFullscreen: () => toggleFullscreen(this.element),
    });
    headerSlot.appendChild(this.header.element);

    // 5. Distinct Floors extraction
    const floorSet = new Set();
    this.tourData.scenes.forEach((s) => {
      if (s.floor) floorSet.add(s.floor);
    });
    const floors = Array.from(floorSet);

    // 6. Floor Selector
    this.floorSelector = new TourFloorSelector({
      floors,
      activeFloor: startingScene?.floor || floors[0],
      onSelectFloor: (selectedFloor) => {
        this.sceneSelector?.filterByFloor(selectedFloor);
        // Switch to the first scene on this floor
        const firstOnFloor = this.tourData.scenes.find((s) => s.floor === selectedFloor);
        if (firstOnFloor && firstOnFloor.id !== this.viewer?.currentSceneId) {
          this.viewer?.switchScene(firstOnFloor.id);
        }
      },
    });
    floorSlot.appendChild(this.floorSelector.element);

    // 7. Scene Carousel Selector
    this.sceneSelector = new TourSceneSelector({
      scenes: this.tourData.scenes,
      activeSceneId: startingScene?.id,
      onSelectScene: (sceneId) => {
        this.viewer?.switchScene(sceneId);
      },
    });
    scenesSlot.appendChild(this.sceneSelector.element);

    // 8. Controls Bar
    this.controls = new TourControls({
      hasFloorPlan: Boolean(this.tourData.floorPlan?.imageUrl),
      detailsCount: initialDetails.length,
      onZoomIn: () => this.viewer?.zoomIn(),
      onZoomOut: () => this.viewer?.zoomOut(),
      onResetView: () => this.viewer?.resetView(),
      onInspectDetails: () => {
        const currentScene = this.tourData.scenes.find((s) => s.id === this.viewer?.currentSceneId) || startingScene;
        const details = getRoomDetails(currentScene);
        if (details.length > 0) {
          this.infoPanel?.show(details[0]);
        }
      },
      onToggleFloorPlan: () => {
        this.floorPlanModal?.toggle();
        this.controls?.setFloorPlanActive(!this.floorPlanModal?.element.classList.contains('hidden'));
      },
      onToggleFullscreen: () => toggleFullscreen(this.element),
      onHelp: () => this.showHelpModal(),
    });
    controlsSlot.appendChild(this.controls.element);

    // 9. Core WebGL Viewer
    this.viewer = new TourViewer({
      container: viewerMount,
      tour: this.tourData,
      onSceneChange: (newSceneId) => {
        const scene = this.tourData.scenes.find((s) => s.id === newSceneId);
        if (scene) {
          this.header?.updateScene(scene.name, scene.floor);
          this.sceneSelector?.setActiveScene(newSceneId);
          if (scene.floor) this.floorSelector?.setActiveFloor(scene.floor);
          this.floorPlanModal?.setActiveScene(newSceneId);

          const roomDetails = getRoomDetails(scene);
          this.infoPanel?.setRoomDetails(roomDetails);
          this.controls?.setDetailsCount(roomDetails.length);
        }
      },
      onHotspotInfo: (info) => {
        this.infoPanel?.show(info);
      },
      onLoading: (isLoading) => {
        if (isLoading) this.loading?.show();
        else this.loading?.hide();
      },
      onError: (err) => {
        this.error?.show(err.message);
      },
    });
  }

  showHelpModal() {
    const modalsLayer = this.element.querySelector('.ptour-modals-layer');
    const existing = modalsLayer.querySelector('.ptour-help-modal');
    if (existing) {
      existing.remove();
      return;
    }

    const helpEl = document.createElement('div');
    helpEl.className = 'ptour-help-modal';
    helpEl.innerHTML = `
      <div class="ptour-help-card">
        <div class="ptour-help-header">
          <h3>Navigating the 3D Tour</h3>
          <button type="button" class="ptour-help-close">&times;</button>
        </div>
        <div class="ptour-help-body">
          <div class="ptour-help-row">
            <span class="ptour-help-glyph">🖱️ / 👆</span>
            <div>
              <strong>Look Around in 360°</strong>
              <p>Click & drag with mouse, or swipe on mobile to view any direction.</p>
            </div>
          </div>
          <div class="ptour-help-row">
            <span class="ptour-help-glyph">🔍</span>
            <div>
              <strong>Zoom In & Out</strong>
              <p>Use your mouse wheel, pinch on touchscreen, or use the zoom buttons.</p>
            </div>
          </div>
          <div class="ptour-help-row">
            <span class="ptour-help-glyph">◉</span>
            <div>
              <strong>Room Navigation Hotspots</strong>
              <p>Tap circular markers floating inside the space to step into the next room.</p>
            </div>
          </div>
          <div class="ptour-help-row">
            <span class="ptour-help-glyph">ⓘ</span>
            <div>
              <strong>Feature Details</strong>
              <p>Tap info markers to learn about architectural features and premium amenities.</p>
            </div>
          </div>
          <div class="ptour-help-row">
            <span class="ptour-help-glyph">⊞</span>
            <div>
              <strong>Interactive Floor Plan</strong>
              <p>Open the architectural blueprint at any time to jump to any room instantly.</p>
            </div>
          </div>
        </div>
        <button type="button" class="ptour-btn ptour-btn-primary ptour-help-dismiss">Got It</button>
      </div>
    `;

    helpEl.querySelector('.ptour-help-close')?.addEventListener('click', () => helpEl.remove());
    helpEl.querySelector('.ptour-help-dismiss')?.addEventListener('click', () => helpEl.remove());
    helpEl.addEventListener('click', (e) => {
      if (e.target === helpEl) helpEl.remove();
    });

    modalsLayer.appendChild(helpEl);
  }

  bindGlobalKeyboard() {
    this.keyHandler = (e) => {
      if (e.key === 'Escape') {
        if (!this.infoPanel?.element.classList.contains('hidden')) {
          this.infoPanel.hide();
          return;
        }
        if (!this.floorPlanModal?.element.classList.contains('hidden')) {
          this.floorPlanModal.hide();
          this.controls?.setFloorPlanActive(false);
          return;
        }
        const helpModal = this.element.querySelector('.ptour-help-modal');
        if (helpModal) {
          helpModal.remove();
          return;
        }
        this.close();
      }
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  close() {
    this.destroy();
    if (typeof this.onCloseCallback === 'function') {
      this.onCloseCallback();
    }
  }

  destroy() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }

    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }

    this.header?.destroy();
    this.controls?.destroy();
    this.floorSelector?.destroy();
    this.sceneSelector?.destroy();
    this.floorPlanModal?.destroy();
    this.infoPanel?.destroy();
    this.loading?.destroy();
    this.error?.destroy();

    this.element.remove();
    document.body.classList.remove('ptour-active');

    if (activeTourInstance === this) {
      activeTourInstance = null;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                STATIC API                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * Opens a property tour overlay.
   * @param {Object} options
   * @param {any} [options.property]
   * @param {import('./tour.types.js').TourData} [options.tour]
   */
  static open(options = {}) {
    if (activeTourInstance) {
      activeTourInstance.close();
    }

    activeTourInstance = new PropertyTour(options);
    return activeTourInstance;
  }

  static close() {
    if (activeTourInstance) {
      activeTourInstance.close();
      activeTourInstance = null;
    }
  }

  static getActiveTour() {
    return activeTourInstance;
  }
}

// Register as Web Component <property-tour> if customElements is available
if (typeof customElements !== 'undefined' && !customElements.get('property-tour')) {
  class PropertyTourElement extends HTMLElement {
    connectedCallback() {
      const tourJson = this.getAttribute('tour');
      let tour = null;
      if (tourJson) {
        try { tour = JSON.parse(tourJson); } catch (e) {}
      }
      const property = this.getAttribute('property') || 'Property';
      this.tourInstance = new PropertyTour({ property, tour, container: this });
    }

    disconnectedCallback() {
      this.tourInstance?.destroy();
      this.tourInstance = null;
    }
  }

  customElements.define('property-tour', PropertyTourElement);
}
