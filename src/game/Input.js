/**
 * Input Manager for Keyboard, Touch Swipes, and Virtual D-Pad
 */

import { DIRECTIONS } from './Constants.js';

export class Input {
  constructor(options = {}) {
    this.onDirectionChange = options.onDirectionChange || (() => {});
    this.onPause = options.onPause || (() => {});
    this.onAction = options.onAction || (() => {}); // Enter/Space

    this.queue = [];
    this.lastProcessedDir = DIRECTIONS.RIGHT;
    this.currentDir = DIRECTIONS.RIGHT;

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchThreshold = 30; // Min px swipe distance

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('touchstart', this.boundTouchStart, { passive: true });
    window.addEventListener('touchend', this.boundTouchEnd, { passive: true });
  }

  cleanup() {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('touchstart', this.boundTouchStart);
    window.removeEventListener('touchend', this.boundTouchEnd);
  }

  reset(initialDir = DIRECTIONS.RIGHT) {
    this.queue = [];
    this.currentDir = initialDir;
    this.lastProcessedDir = initialDir;
  }

  handleKeyDown(e) {
    // Prevent default scrolling for game controls
    const keysToPrevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
    if (keysToPrevent.includes(e.code)) {
      e.preventDefault();
    }

    if (e.code === 'KeyP' || e.code === 'Escape') {
      this.onPause();
      return;
    }

    if (e.code === 'Space' || e.code === 'Enter') {
      this.onAction();
      return;
    }

    let requestedDir = null;
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        requestedDir = DIRECTIONS.UP;
        break;
      case 'ArrowDown':
      case 'KeyS':
        requestedDir = DIRECTIONS.DOWN;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        requestedDir = DIRECTIONS.LEFT;
        break;
      case 'ArrowRight':
      case 'KeyD':
        requestedDir = DIRECTIONS.RIGHT;
        break;
    }

    if (requestedDir) {
      this.requestDirection(requestedDir);
    }
  }

  handleTouchStart(e) {
    if (e.touches && e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  handleTouchEnd(e) {
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(deltaX) < this.touchThreshold && Math.abs(deltaY) < this.touchThreshold) {
      return; // Tap, not swipe
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        this.requestDirection(DIRECTIONS.RIGHT);
      } else {
        this.requestDirection(DIRECTIONS.LEFT);
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        this.requestDirection(DIRECTIONS.DOWN);
      } else {
        this.requestDirection(DIRECTIONS.UP);
      }
    }
  }

  /**
   * Safe queueing with anti-reversal checks
   */
  requestDirection(dir) {
    const referenceDir = this.queue.length > 0 ? this.queue[this.queue.length - 1] : this.currentDir;

    // Reject direct opposite direction (reversal into own body)
    if (referenceDir.x + dir.x === 0 && referenceDir.z + dir.z === 0) {
      return;
    }

    // Reject duplicate inputs
    if (referenceDir.name === dir.name) {
      return;
    }

    // Limit buffer queue to prevent stale input latency
    if (this.queue.length < 2) {
      this.queue.push(dir);
    }
  }

  /**
   * Consume next valid direction for tick
   */
  nextDirection() {
    if (this.queue.length > 0) {
      this.currentDir = this.queue.shift();
      this.lastProcessedDir = this.currentDir;
      this.onDirectionChange(this.currentDir);
    }
    return this.currentDir;
  }
}
