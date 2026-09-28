/**
 * Neon Snake 3D - Application Bootstrap & Entry Point
 */

import { SceneManager } from './scene/SceneManager.js';
import { Lighting } from './scene/Lighting.js';
import { Arena } from './scene/Arena.js';
import { ParticleSystem } from './scene/Particles.js';
import { AudioManager } from './audio/AudioManager.js';
import { UIManager } from './ui/UIManager.js';
import { Game } from './game/Game.js';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

function initApp() {
  // WebGL Check
  if (!isWebGLAvailable()) {
    const errorEl = document.getElementById('webgl-error');
    if (errorEl) {
      errorEl.classList.add('active');
    }
    return;
  }

  const canvasContainer = document.getElementById('canvas-container');
  const audioManager = new AudioManager();
  const sceneManager = new SceneManager(canvasContainer);
  const lighting = new Lighting(sceneManager.scene);
  const arena = new Arena(sceneManager.scene);
  const particles = new ParticleSystem(sceneManager.scene);
  const uiManager = new UIManager({ audio: audioManager });

  const game = new Game(sceneManager, arena, lighting, particles, audioManager, uiManager);
  window.__game = game;
  window.__ui = uiManager;

  // Initialize audio on first user touch/click/key
  const unlockAudio = () => {
    audioManager.ensureContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });

  // Master Render & Physics Loop
  function animate() {
    requestAnimationFrame(animate);
    game.update();
  }

  requestAnimationFrame(animate);
}

// Start once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
