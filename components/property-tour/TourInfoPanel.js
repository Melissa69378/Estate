/**
 * TourInfoPanel - High-definition Closer Detail Inspector for luxury property features
 */
import { escapeHtml } from './tour.utils.js';

export class TourInfoPanel {
  /**
   * @param {Object} [options]
   * @param {() => void} [options.onClose]
   * @param {(detail: Object) => void} [options.onFocusCamera]
   * @param {() => void} [options.onResetCamera]
   * @param {(nextDetail: Object) => void} [options.onSelectDetail]
   */
  constructor(options = {}) {
    this.options = options;
    this.onClose = options.onClose;
    this.currentDetail = null;
    this.allDetails = [];
    this.currentIndex = 0;
    this.imageZoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;

    this.element = document.createElement('div');
    this.element.className = 'ptour-info-panel ptour-detail-inspector hidden';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'ptour-detail-title');

    this.renderContainer();
    this.bindEvents();
  }

  renderContainer() {
    this.element.innerHTML = `
      <div class="ptour-detail-backdrop"></div>
      <div class="ptour-detail-modal" role="document">
        <!-- Modal Top Bar -->
        <div class="ptour-detail-topbar">
          <div class="ptour-detail-badge-group">
            <span class="ptour-detail-beacon-dot"></span>
            <span class="ptour-detail-badge">INSPECTION HAUTE DÉFINITION</span>
            <span class="ptour-detail-counter" id="ptour-detail-counter">✦ Point 1 / 1</span>
          </div>
          <div class="ptour-detail-top-actions">
            <button type="button" class="ptour-detail-cam-btn ptour-btn-focus-cam" title="Aligner la caméra 360° sur ce détail">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
              <span>Zoomer la caméra 360°</span>
            </button>
            <button type="button" class="ptour-detail-close" aria-label="Fermer l'inspection du détail">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body: Split Layout (Macro Photo + Craftsmanship Specs) -->
        <div class="ptour-detail-body">
          <!-- Left: High-res Macro Picture with Magnifier Controls -->
          <div class="ptour-detail-media-wrap">
            <div class="ptour-detail-media-canvas" id="ptour-media-canvas">
              <img src="" alt="Vue rapprochée du détail architectural" class="ptour-detail-img" id="ptour-detail-img" loading="eager"/>
              <div class="ptour-detail-img-placeholder hidden" id="ptour-detail-placeholder">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <p>Inspection rapprochée 360°</p>
              </div>
            </div>

            <!-- Floating Magnifier Zoom Toolbar -->
            <div class="ptour-detail-zoom-dock">
              <button type="button" class="ptour-zoom-tool-btn" id="ptour-btn-zoom-in" title="Agrandir la loupe (+)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <span class="ptour-zoom-level-label" id="ptour-zoom-level">1.0x</span>
              <button type="button" class="ptour-zoom-tool-btn" id="ptour-btn-zoom-out" title="Réduire la loupe (-)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              <button type="button" class="ptour-zoom-tool-btn" id="ptour-btn-zoom-reset" title="Réinitialiser l'image">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              </button>
              <span class="ptour-zoom-hint">Glisser pour explorer la matière</span>
            </div>
          </div>

          <!-- Right: Architectural Specifications & Craftsmanship -->
          <div class="ptour-detail-info-pane">
            <div class="ptour-detail-category" id="ptour-detail-category">Sols &amp; Boiseries Nobles</div>
            <h3 class="ptour-detail-title" id="ptour-detail-title">Parquet Point de Hongrie</h3>
            <p class="ptour-detail-desc" id="ptour-detail-desc"></p>

            <div class="ptour-detail-specs-grid">
              <div class="ptour-spec-card">
                <div class="ptour-spec-label">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  Artisanat &amp; Époque
                </div>
                <div class="ptour-spec-val" id="ptour-spec-artisan">—</div>
              </div>

              <div class="ptour-spec-card">
                <div class="ptour-spec-label">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                    <polyline points="2 17 12 22 22 17"/>
                    <polyline points="2 12 12 17 22 12"/>
                  </svg>
                  Matières &amp; Essences Nobles
                </div>
                <div class="ptour-spec-val" id="ptour-spec-materials">—</div>
              </div>

              <div class="ptour-spec-card ptour-spec-card-full">
                <div class="ptour-spec-label">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Spécifications Techniques &amp; Finition
                </div>
                <div class="ptour-spec-val" id="ptour-spec-details">—</div>
              </div>
            </div>

            <!-- Bottom Carousel Controls -->
            <div class="ptour-detail-footer">
              <div class="ptour-detail-nav-group">
                <button type="button" class="ptour-nav-detail-btn" id="ptour-btn-prev-detail" title="Détail précédent">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  <span>Précédent</span>
                </button>
                <button type="button" class="ptour-nav-detail-btn" id="ptour-btn-next-detail" title="Détail suivant">
                  <span>Suivant</span>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
              <button type="button" class="ptour-return-overview-btn" id="ptour-btn-return-overview">
                <span>Vue d'ensemble 360°</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Close modal
    this.element.querySelector('.ptour-detail-close')?.addEventListener('click', () => this.hide());
    this.element.querySelector('.ptour-detail-backdrop')?.addEventListener('click', () => this.hide());

    // 3D camera alignment
    this.element.querySelector('.ptour-btn-focus-cam')?.addEventListener('click', () => {
      if (this.currentDetail && typeof this.options.onFocusCamera === 'function') {
        this.options.onFocusCamera(this.currentDetail);
      }
    });

    // Return overview
    this.element.querySelector('#ptour-btn-return-overview')?.addEventListener('click', () => {
      this.hide();
      if (typeof this.options.onResetCamera === 'function') {
        this.options.onResetCamera();
      }
    });

    // Carousel navigation
    this.element.querySelector('#ptour-btn-prev-detail')?.addEventListener('click', () => {
      this.stepDetail(-1);
    });
    this.element.querySelector('#ptour-btn-next-detail')?.addEventListener('click', () => {
      this.stepDetail(1);
    });

    // Image Magnifier Zoom Controls
    const btnZoomIn = this.element.querySelector('#ptour-btn-zoom-in');
    const btnZoomOut = this.element.querySelector('#ptour-btn-zoom-out');
    const btnZoomReset = this.element.querySelector('#ptour-btn-zoom-reset');

    btnZoomIn?.addEventListener('click', () => this.setZoomLevel(this.imageZoomLevel + 0.4));
    btnZoomOut?.addEventListener('click', () => this.setZoomLevel(this.imageZoomLevel - 0.4));
    btnZoomReset?.addEventListener('click', () => this.resetImageTransform());

    // Drag-to-pan zoomed image
    const canvas = this.element.querySelector('#ptour-media-canvas');
    if (canvas) {
      canvas.addEventListener('mousedown', (e) => {
        if (this.imageZoomLevel <= 1) return;
        this.isPanning = true;
        this.startX = e.clientX - this.panX;
        this.startY = e.clientY - this.panY;
        canvas.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isPanning) return;
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
        this.applyImageTransform();
      });

      window.addEventListener('mouseup', () => {
        if (this.isPanning) {
          this.isPanning = false;
          if (canvas) canvas.style.cursor = this.imageZoomLevel > 1 ? 'grab' : 'default';
        }
      });

      // Mouse wheel zoom
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        this.setZoomLevel(this.imageZoomLevel + delta);
      }, { passive: false });
    }

    // Keyboard ESC to close
    window.addEventListener('keydown', (e) => {
      if (!this.element.classList.contains('hidden') && e.key === 'Escape') {
        this.hide();
      }
    });
  }

  setZoomLevel(level) {
    this.imageZoomLevel = Math.max(1, Math.min(3.5, level));
    const label = this.element.querySelector('#ptour-zoom-level');
    if (label) label.textContent = `${this.imageZoomLevel.toFixed(1)}x`;

    const canvas = this.element.querySelector('#ptour-media-canvas');
    if (canvas) {
      canvas.style.cursor = this.imageZoomLevel > 1 ? 'grab' : 'default';
    }

    if (this.imageZoomLevel === 1) {
      this.panX = 0;
      this.panY = 0;
    }
    this.applyImageTransform();
  }

  resetImageTransform() {
    this.imageZoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
    const label = this.element.querySelector('#ptour-zoom-level');
    if (label) label.textContent = '1.0x';
    const canvas = this.element.querySelector('#ptour-media-canvas');
    if (canvas) canvas.style.cursor = 'default';
    this.applyImageTransform();
  }

  applyImageTransform() {
    const img = this.element.querySelector('#ptour-detail-img');
    if (img) {
      img.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.imageZoomLevel})`;
    }
  }

  /**
   * Set list of details for the active room so user can cycle through them
   * @param {Array<Object>} details
   */
  setRoomDetails(details = []) {
    this.allDetails = Array.isArray(details) ? details : [];
  }

  stepDetail(direction) {
    if (!this.allDetails.length) return;
    this.currentIndex = (this.currentIndex + direction + this.allDetails.length) % this.allDetails.length;
    const nextItem = this.allDetails[this.currentIndex];
    if (nextItem) {
      this.show(nextItem);
      if (typeof this.options.onSelectDetail === 'function') {
        this.options.onSelectDetail(nextItem);
      }
      if (typeof this.options.onFocusCamera === 'function') {
        this.options.onFocusCamera(nextItem);
      }
    }
  }

  /**
   * @param {Object} data - Detail feature data
   */
  show(data) {
    this.currentDetail = data;
    this.resetImageTransform();

    // Find index in details list if present
    if (this.allDetails.length) {
      const idx = this.allDetails.findIndex((d) => d.id === data.id);
      if (idx !== -1) this.currentIndex = idx;
    }

    // Update Counter
    const counterEl = this.element.querySelector('#ptour-detail-counter');
    if (counterEl) {
      const total = Math.max(1, this.allDetails.length);
      const current = this.currentIndex + 1;
      counterEl.textContent = `✦ Point ${current} / ${total}`;
    }

    // Update Text Content
    const catEl = this.element.querySelector('#ptour-detail-category');
    const titleEl = this.element.querySelector('#ptour-detail-title');
    const descEl = this.element.querySelector('#ptour-detail-desc');
    const artisanEl = this.element.querySelector('#ptour-spec-artisan');
    const materialsEl = this.element.querySelector('#ptour-spec-materials');
    const detailsEl = this.element.querySelector('#ptour-spec-details');

    if (catEl) catEl.textContent = (data.category || 'Matières & Finitions Nobles').toUpperCase();
    if (titleEl) titleEl.textContent = data.title || data.label || 'Détail d\'Exception';
    if (descEl) descEl.textContent = data.description || 'Finition soignée et intégration sur mesure exécutée par des maîtres artisans.';
    if (artisanEl) artisanEl.textContent = data.artisan || 'Compagnons du Devoir & Ateliers d\'Art';
    if (materialsEl) materialsEl.textContent = data.materials || 'Matériaux nobles sélectionnés pour leur pérennité';
    if (detailsEl) detailsEl.textContent = data.specifications || 'Restauration scrupuleuse dans le respect de l\'architecture';

    // Update Macro Image
    const imgEl = this.element.querySelector('#ptour-detail-img');
    const placeholderEl = this.element.querySelector('#ptour-detail-placeholder');

    const imageUrl = data.imageUrl || data.detailImageUrl;
    if (imageUrl) {
      if (imgEl) {
        imgEl.src = imageUrl;
        imgEl.classList.remove('hidden');
      }
      if (placeholderEl) placeholderEl.classList.add('hidden');
    } else {
      if (imgEl) imgEl.classList.add('hidden');
      if (placeholderEl) placeholderEl.classList.remove('hidden');
    }

    this.element.classList.remove('hidden');

    // Auto-focus camera on this detail if coordinates exist
    if (typeof this.options.onFocusCamera === 'function' && typeof data.yaw === 'number') {
      this.options.onFocusCamera(data);
    }
  }

  hide() {
    this.element.classList.add('hidden');
    this.resetImageTransform();
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }

  destroy() {
    this.element.remove();
  }
}

