/**
 * Scene Manager, Camera Control, Responsive Viewport, and Post-processing Bloom
 */

import * as THREE from 'three';
import { GAME_STATES } from '../game/Constants.js';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04060e);
    this.scene.fog = new THREE.FogExp2(0x04060e, 0.015);

    // Camera dynamic state (must be initialized before initCamera)
    this.cameraShakeIntensity = 0;
    this.cameraShakeDecay = 4.0;
    this.baseCameraPos = new THREE.Vector3(0, 18, 15);
    this.baseTargetPos = new THREE.Vector3(0, 0, 1);
    this.currentCameraPos = this.baseCameraPos.clone();
    this.currentTargetPos = this.baseTargetPos.clone();
    this.orbitAngle = 0;

    this.initCamera();
    this.initRenderer();

    // Optional Bloom Composer
    this.composer = null;
    this.initPostProcessing();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
    this.camera.position.copy(this.baseCameraPos);
    this.camera.lookAt(this.baseTargetPos);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);
  }

  async initPostProcessing() {
    try {
      const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');

      this.composer = new EffectComposer(this.renderer);
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.width, this.height),
        0.75, // Bloom strength
        0.35, // Radius
        0.55  // Threshold
      );
      this.composer.addPass(bloomPass);
    } catch (e) {
      console.log('Post-processing bloom fallback to standard WebGL renderer:', e);
      this.composer = null;
    }
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (this.composer) {
      this.composer.setSize(this.width, this.height);
    }
  }

  triggerShake(intensity = 0.5) {
    this.cameraShakeIntensity = Math.min(1.2, this.cameraShakeIntensity + intensity);
  }

  triggerPunch() {
    this.currentCameraPos.y -= 0.35;
  }

  update(deltaTime, gameState, snakeHeadPos) {
    // 1. Camera Shake decay
    let shakeOffset = new THREE.Vector3();
    if (this.cameraShakeIntensity > 0.005) {
      this.cameraShakeIntensity -= this.cameraShakeIntensity * this.cameraShakeDecay * deltaTime;
      shakeOffset.set(
        (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5,
        (Math.random() - 0.5) * this.cameraShakeIntensity * 0.8,
        (Math.random() - 0.5) * this.cameraShakeIntensity * 1.5
      );
    } else {
      this.cameraShakeIntensity = 0;
    }

    // 2. Camera positioning based on game state
    if (gameState === GAME_STATES.MENU) {
      // Cinematic slow orbit
      this.orbitAngle += deltaTime * 0.25;
      const radius = 22;
      const targetX = Math.sin(this.orbitAngle) * radius;
      const targetZ = Math.cos(this.orbitAngle) * radius;

      this.currentCameraPos.lerp(new THREE.Vector3(targetX, 16, targetZ), deltaTime * 2.0);
      this.currentTargetPos.lerp(new THREE.Vector3(0, 0, 0), deltaTime * 2.0);
    } else {
      // Playing mode: follow subtle tracking of snake
      const targetX = snakeHeadPos ? snakeHeadPos.x * 0.15 : 0;
      const targetZ = snakeHeadPos ? 15 + snakeHeadPos.z * 0.1 : 15;

      const desiredCamPos = new THREE.Vector3(targetX, 18, targetZ);
      const desiredLookAt = new THREE.Vector3(targetX * 0.5, 0, 1);

      this.currentCameraPos.lerp(desiredCamPos, deltaTime * 3.0);
      this.currentTargetPos.lerp(desiredLookAt, deltaTime * 3.0);
    }

    this.camera.position.copy(this.currentCameraPos).add(shakeOffset);
    this.camera.lookAt(this.currentTargetPos);
  }

  render() {
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
