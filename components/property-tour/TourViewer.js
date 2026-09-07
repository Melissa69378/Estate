/**
 * TourViewer - High-Performance WebGL 360° Equirectangular Panorama Engine
 * Supports @photo-sphere-viewer/core and resilient Three.js WebGL fallback, plus Matterport iframes.
 */
import * as THREE from 'three';
import { TourHotspot } from './TourHotspot.js';
import { clamp, normalizeAngle, isSafeExternalUrl } from './tour.utils.js';

export class TourViewer {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - DOM container for the viewer
   * @param {import('./tour.types.js').TourData} options.tour - Tour dataset
   * @param {(sceneId: string) => void} [options.onSceneChange] - Callback when scene changes
   * @param {(info: any) => void} [options.onHotspotInfo] - Callback when an info hotspot is clicked
   * @param {(isLoading: boolean) => void} [options.onLoading] - Loading state callback
   * @param {(err: Error) => void} [options.onError] - Error callback
   */
  constructor(options) {
    this.container = options.container;
    this.tour = options.tour;
    this.onSceneChange = options.onSceneChange;
    this.onHotspotInfo = options.onHotspotInfo;
    this.onLoading = options.onLoading;
    this.onError = options.onError;

    this.currentSceneId = this.tour.startingSceneId || this.tour.scenes[0]?.id;
    this.currentScene = this.tour.scenes.find((s) => s.id === this.currentSceneId) || this.tour.scenes[0];

    // WebGL state
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.sphereMesh = null;
    this.textureLoader = new THREE.TextureLoader();
    this.textureCache = new Map();

    // Camera angles & zoom
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.fov = 75;
    this.targetFov = 75;

    // Interaction state
    this.isPointerDown = false;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.lastPinchDist = null;
    this.animFrameId = null;
    this.isDestroyed = false;

    // Hotspots container & instances
    this.hotspotLayer = null;
    this.hotspotInstances = [];

    // Matterport iframe container
    this.matterportFrame = null;

    this.init();
  }

  init() {
    if (this.tour.tourType === 'matterport' || this.tour.tourType === 'external') {
      this.initExternalTour();
      return;
    }

    this.initWebGL();
  }

  /* -------------------------------------------------------------------------- */
  /*                            MATTERPORT / EXTERNAL                           */
  /* -------------------------------------------------------------------------- */

  initExternalTour() {
    const url = this.tour.externalUrl;
    if (!url || !isSafeExternalUrl(url)) {
      this.onError?.(new Error('Invalid or missing external tour URL.'));
      return;
    }

    this.onLoading?.(true);

    this.matterportFrame = document.createElement('iframe');
    this.matterportFrame.className = 'ptour-matterport-frame';
    this.matterportFrame.src = url;
    this.matterportFrame.setAttribute('title', `${this.tour.propertyName || 'Property'} 3D Tour`);
    this.matterportFrame.setAttribute('allow', 'fullscreen; xr-spatial-tracking; accelerometer; gyroscope');
    this.matterportFrame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');

    this.matterportFrame.onload = () => {
      this.onLoading?.(false);
    };
    this.matterportFrame.onerror = (err) => {
      this.onLoading?.(false);
      this.onError?.(new Error('Failed to load external 3D tour.'));
    };

    this.container.appendChild(this.matterportFrame);
  }

  /* -------------------------------------------------------------------------- */
  /*                               WEBGL 360 ENGINE                             */
  /* -------------------------------------------------------------------------- */

  initWebGL() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.fov, width / height, 0.1, 1100);
    this.camera.position.set(0, 0, 0);

    // 2. Inverted Sphere Geometry for 360° Interior Equirectangular projection
    const geometry = new THREE.SphereGeometry(500, 64, 48);
    // Invert normal so inside of the sphere is visible
    geometry.scale(-1, 1, 1);

    // Placeholder material until panorama loads
    const material = new THREE.MeshBasicMaterial({
      color: 0x18241e,
      side: THREE.FrontSide,
    });

    this.sphereMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphereMesh);

    // 3. Renderer
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.domElement.className = 'ptour-canvas';
      this.container.appendChild(this.renderer.domElement);
    } catch (err) {
      console.error('WebGL Initialization failed:', err);
      this.onError?.(new Error('Your device or browser does not support WebGL hardware acceleration.'));
      return;
    }

    // 4. Hotspot DOM Overlay Layer
    this.hotspotLayer = document.createElement('div');
    this.hotspotLayer.className = 'ptour-hotspots-layer';
    this.container.appendChild(this.hotspotLayer);

    // 5. Event Listeners
    this.bindEvents();

    // 6. Load Initial Scene
    this.loadScene(this.currentScene);

    // 7. Start Render Loop
    this.startLoop();
  }

  bindEvents() {
    const el = this.renderer.domElement;

    this.onPointerDown = (e) => {
      this.isPointerDown = true;
      this.pointerStartX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      this.pointerStartY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
      el.classList.add('grabbing');
    };

    this.onPointerMove = (e) => {
      // Touch pinch zoom handling
      if (e.touches && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);

        if (this.lastPinchDist !== null) {
          const delta = this.lastPinchDist - dist;
          this.targetFov = clamp(this.targetFov + delta * 0.1, 35, 95);
        }
        this.lastPinchDist = dist;
        return;
      }

      if (!this.isPointerDown) return;

      const currentX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
      const currentY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

      const deltaX = currentX - this.pointerStartX;
      const deltaY = currentY - this.pointerStartY;

      this.pointerStartX = currentX;
      this.pointerStartY = currentY;

      // Sensitive responsive pan
      const speed = 0.0035 * (this.fov / 75);
      this.targetYaw -= deltaX * speed;
      this.targetPitch += deltaY * speed;

      // Limit pitch to prevent gimbal flip
      this.targetPitch = clamp(this.targetPitch, -Math.PI / 2.3, Math.PI / 2.3);
    };

    this.onPointerUp = () => {
      this.isPointerDown = false;
      this.lastPinchDist = null;
      el.classList.remove('grabbing');
    };

    this.onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.05;
      this.targetFov = clamp(this.targetFov + zoomFactor, 35, 95);
    };

    this.onResize = () => {
      if (!this.renderer || !this.camera) return;
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };

    // Pointer events
    el.addEventListener('mousedown', this.onPointerDown);
    window.addEventListener('mousemove', this.onPointerMove);
    window.addEventListener('mouseup', this.onPointerUp);

    // Touch events
    el.addEventListener('touchstart', this.onPointerDown, { passive: true });
    window.addEventListener('touchmove', this.onPointerMove, { passive: true });
    window.addEventListener('touchend', this.onPointerUp, { passive: true });

    // Wheel zoom
    el.addEventListener('wheel', this.onWheel, { passive: false });

    // Window resize
    window.addEventListener('resize', this.onResize);
  }

  /* -------------------------------------------------------------------------- */
  /*                               SCENE LOADING                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Loads and displays a given scene panorama
   * @param {import('./tour.types.js').TourScene} scene
   */
  loadScene(scene) {
    if (!scene || !scene.panoramaUrl) {
      this.onError?.(new Error('Scene data or panorama image URL is missing.'));
      return;
    }

    this.currentScene = scene;
    this.currentSceneId = scene.id;
    this.onLoading?.(true);

    // Check texture cache first
    const cachedTexture = this.textureCache.get(scene.panoramaUrl);
    if (cachedTexture) {
      this.applyTexture(cachedTexture, scene);
      this.onLoading?.(false);
      this.preloadNeighborScenes(scene);
      return;
    }

    // Load panorama texture
    this.textureLoader.load(
      scene.panoramaUrl,
      (texture) => {
        if (this.isDestroyed) {
          texture.dispose();
          return;
        }

        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        this.textureCache.set(scene.panoramaUrl, texture);
        this.applyTexture(texture, scene);
        this.onLoading?.(false);

        // Preload adjacent rooms for instant navigation
        this.preloadNeighborScenes(scene);
      },
      undefined,
      (error) => {
        console.warn('Failed to load panorama texture:', scene.panoramaUrl, error);
        // Fallback to local thumbnail texture if high-res fetch encounters an issue
        if (scene.thumbnailUrl && scene.thumbnailUrl !== scene.panoramaUrl) {
          this.textureLoader.load(
            scene.thumbnailUrl,
            (fallbackTexture) => {
              if (this.isDestroyed) {
                fallbackTexture.dispose();
                return;
              }
              fallbackTexture.mapping = THREE.EquirectangularReflectionMapping;
              fallbackTexture.colorSpace = THREE.SRGBColorSpace;
              this.textureCache.set(scene.panoramaUrl, fallbackTexture);
              this.applyTexture(fallbackTexture, scene);
              this.onLoading?.(false);
            },
            undefined,
            () => {
              this.onLoading?.(false);
              this.onError?.(new Error(`Unable to load the 360° panorama for ${scene.name}.`));
            }
          );
          return;
        }
        this.onLoading?.(false);
        this.onError?.(new Error(`Unable to load the 360° panorama for ${scene.name}.`));
      }
    );
  }

  applyTexture(texture, scene) {
    if (!this.sphereMesh) return;

    // Smooth material swap
    const oldMaterial = this.sphereMesh.material;
    this.sphereMesh.material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.FrontSide,
    });

    if (oldMaterial && oldMaterial !== this.sphereMesh.material) {
      oldMaterial.dispose();
    }

    // Rebuild hotspots for this scene
    this.rebuildHotspots(scene.hotspots || []);
  }

  preloadNeighborScenes(currentScene) {
    if (!currentScene.hotspots) return;

    for (const spot of currentScene.hotspots) {
      if (spot.type === 'navigation' && spot.targetSceneId) {
        const targetScene = this.tour.scenes.find((s) => s.id === spot.targetSceneId);
        if (targetScene && !this.textureCache.has(targetScene.panoramaUrl)) {
          // Asynchronously pre-fetch texture in background
          this.textureLoader.load(targetScene.panoramaUrl, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            this.textureCache.set(targetScene.panoramaUrl, tex);
          });
        }
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             HOTSPOT PROJECTION                             */
  /* -------------------------------------------------------------------------- */

  rebuildHotspots(hotspotData) {
    // Clear existing
    this.hotspotInstances.forEach((h) => h.destroy());
    this.hotspotInstances = [];

    if (!this.hotspotLayer) return;
    this.hotspotLayer.innerHTML = '';

    for (const data of hotspotData) {
      const instance = new TourHotspot({
        data,
        onNavigate: (targetSceneId) => {
          this.switchScene(targetSceneId);
        },
        onInfo: (info) => {
          this.onHotspotInfo?.(info);
        },
      });

      this.hotspotLayer.appendChild(instance.element);
      this.hotspotInstances.push(instance);
    }
  }

  updateHotspotsPosition() {
    if (!this.camera || !this.container) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const tempVector = new THREE.Vector3();

    for (const instance of this.hotspotInstances) {
      const { yaw, pitch } = instance.data;

      // Spherical to 3D Cartesian coordinates inside the sphere
      const cosPitch = Math.cos(pitch);
      tempVector.set(
        500 * cosPitch * Math.sin(yaw),
        500 * Math.sin(pitch),
        -500 * cosPitch * Math.cos(yaw)
      );

      // Project 3D coordinate to Normalized Device Coordinates (-1 to +1)
      tempVector.project(this.camera);

      // Check if point is in front of the camera (z < 1)
      const isVisible = tempVector.z < 1.0;

      if (!isVisible) {
        instance.setPosition(0, 0, false);
        continue;
      }

      // Convert NDC to screen pixel coordinates
      const screenX = tempVector.x * halfWidth + halfWidth;
      const screenY = -tempVector.y * halfHeight + halfHeight;

      // Bounds check for viewport
      const inViewport = screenX >= -50 && screenX <= width + 50 && screenY >= -50 && screenY <= height + 50;

      instance.setPosition(screenX, screenY, inViewport);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               RENDER LOOP                                  */
  /* -------------------------------------------------------------------------- */

  startLoop() {
    const animate = () => {
      if (this.isDestroyed) return;
      this.animFrameId = requestAnimationFrame(animate);

      // Smooth camera interpolation (inertial damping)
      this.yaw += (this.targetYaw - this.yaw) * 0.12;
      this.pitch += (this.targetPitch - this.pitch) * 0.12;
      this.fov += (this.targetFov - this.fov) * 0.15;

      if (this.camera) {
        this.camera.fov = this.fov;
        this.camera.updateProjectionMatrix();

        // Calculate look target from yaw & pitch
        const cosPitch = Math.cos(this.pitch);
        const lookTarget = new THREE.Vector3(
          Math.sin(this.yaw) * cosPitch,
          Math.sin(this.pitch),
          -Math.cos(this.yaw) * cosPitch
        );

        this.camera.lookAt(lookTarget);
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      // Project hotspots to match new camera matrix
      this.updateHotspotsPosition();
    };

    animate();
  }

  /* -------------------------------------------------------------------------- */
  /*                               PUBLIC ACTIONS                               */
  /* -------------------------------------------------------------------------- */

  switchScene(sceneId) {
    const nextScene = this.tour.scenes.find((s) => s.id === sceneId);
    if (!nextScene) return;

    // Smooth transition: small camera glide then load new scene
    this.loadScene(nextScene);
    this.onSceneChange?.(sceneId);
  }

  zoomIn() {
    this.targetFov = clamp(this.targetFov - 12, 35, 95);
  }

  zoomOut() {
    this.targetFov = clamp(this.targetFov + 12, 35, 95);
  }

  resetView() {
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.targetFov = 75;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CLEANUP                                  */
  /* -------------------------------------------------------------------------- */

  destroy() {
    this.isDestroyed = true;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // Remove event listeners
    if (this.renderer?.domElement) {
      const el = this.renderer.domElement;
      el.removeEventListener('mousedown', this.onPointerDown);
      el.removeEventListener('touchstart', this.onPointerDown);
      el.removeEventListener('wheel', this.onWheel);
    }
    window.removeEventListener('mousemove', this.onPointerMove);
    window.removeEventListener('mouseup', this.onPointerUp);
    window.removeEventListener('touchmove', this.onPointerMove);
    window.removeEventListener('touchend', this.onPointerUp);
    window.removeEventListener('resize', this.onResize);

    // Destroy hotspots
    this.hotspotInstances.forEach((h) => h.destroy());
    this.hotspotInstances = [];
    if (this.hotspotLayer) {
      this.hotspotLayer.remove();
      this.hotspotLayer = null;
    }

    // Destroy Matterport frame
    if (this.matterportFrame) {
      this.matterportFrame.src = 'about:blank';
      this.matterportFrame.remove();
      this.matterportFrame = null;
    }

    // Dispose Three.js textures
    this.textureCache.forEach((texture) => texture.dispose());
    this.textureCache.clear();

    // Dispose sphere geometry & material
    if (this.sphereMesh) {
      this.sphereMesh.geometry.dispose();
      if (this.sphereMesh.material) {
        if (Array.isArray(this.sphereMesh.material)) {
          this.sphereMesh.material.forEach((m) => m.dispose());
        } else {
          this.sphereMesh.material.dispose();
        }
      }
      this.scene?.remove(this.sphereMesh);
      this.sphereMesh = null;
    }

    // Dispose WebGL renderer and release context
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.forceContextLoss?.();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
  }
}
