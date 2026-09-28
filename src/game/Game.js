/**
 * Core Game Engine & State Controller
 */

import * as THREE from 'three';
import {
  GAME_STATES,
  DIRECTIONS,
  SPEED_CONFIG,
  FOOD_TYPES,
  GRID_SIZE
} from './Constants.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { Score } from './Score.js';
import { Input } from './Input.js';

export class Game {
  constructor(sceneManager, arena, lighting, particles, audio, ui) {
    this.sceneManager = sceneManager;
    this.arena = arena;
    this.lighting = lighting;
    this.particles = particles;
    this.audio = audio;
    this.ui = ui;

    this.state = GAME_STATES.MENU;

    // Game Entities
    this.snake = new Snake(this.sceneManager.scene, this.particles);
    this.food = new Food(this.sceneManager.scene);
    this.score = new Score();

    // Input Controller
    this.input = new Input({
      onDirectionChange: (dir) => {
        if (this.state === GAME_STATES.PLAYING) {
          this.audio.playTurn();
        }
      },
      onPause: () => {
        this.togglePause();
      },
      onAction: () => {
        if (this.state === GAME_STATES.MENU) {
          this.start();
        } else if (this.state === GAME_STATES.GAME_OVER) {
          this.restart();
        }
      }
    });

    // Timing & Fixed Tick Loop
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.gameTime = 0;

    // Active Power-up State
    this.activePowerup = null;

    // Autonomous AI Demo Snake for Title Menu
    this.demoMoveTimer = 0;

    this.initUIHandlers();
    this.initMenuState();
  }

  initUIHandlers() {
    this.ui.onStart = () => this.start();
    this.ui.onResume = () => this.togglePause();
    this.ui.onRestart = () => this.restart();
    this.ui.onMenu = () => this.initMenuState();
    this.ui.onMuteToggle = () => this.audio.toggleMute();
    this.ui.onDirectionInput = (dirName) => {
      if (this.state === GAME_STATES.PLAYING && DIRECTIONS[dirName]) {
        this.input.requestDirection(DIRECTIONS[dirName]);
      }
    };

    // Update mute icon
    this.ui.updateMuteIcon(this.audio.isMuted);
  }

  initMenuState() {
    this.state = GAME_STATES.MENU;
    this.lighting.setAlert(false);
    this.arena.setWarning(0);

    // Reset snake in the middle for background showcase
    this.snake.reset(5, 10, 4, DIRECTIONS.RIGHT);
    this.food.spawn(this.snake);

    this.ui.showState(GAME_STATES.MENU, {
      highScore: this.score.highScore
    });
  }

  start() {
    this.audio.ensureContext();
    this.state = GAME_STATES.PLAYING;
    this.score.reset();
    this.activePowerup = null;

    this.lighting.setAlert(false);
    this.arena.setWarning(0);

    this.input.reset(DIRECTIONS.RIGHT);
    this.snake.reset(5, 10, 3, DIRECTIONS.RIGHT);
    this.food.spawn(this.snake);

    this.accumulator = 0;
    this.lastTime = performance.now();

    this.ui.showState(GAME_STATES.PLAYING);
    this.ui.updateHUD(this.score, this.activePowerup);
  }

  restart() {
    this.start();
  }

  togglePause() {
    if (this.state === GAME_STATES.PLAYING) {
      this.state = GAME_STATES.PAUSED;
      this.ui.showState(GAME_STATES.PAUSED);
    } else if (this.state === GAME_STATES.PAUSED) {
      this.state = GAME_STATES.PLAYING;
      this.lastTime = performance.now();
      this.ui.showState(GAME_STATES.PLAYING);
    }
  }

  getTickRate() {
    // Speed increases as player advances in levels
    let rate = SPEED_CONFIG.INITIAL_TICK_RATE - (this.score.level - 1) * SPEED_CONFIG.SPEED_STEP;
    rate = Math.max(SPEED_CONFIG.MIN_TICK_RATE, rate);

    if (this.activePowerup) {
      if (this.activePowerup.type === 'TIME') {
        rate *= 1.55; // Chrono slow down
      } else if (this.activePowerup.type === 'SPEED') {
        rate *= 0.65; // Turbo surge boost
      }
    }

    return rate;
  }

  /**
   * Main game tick running on logical grid intervals
   */
  gameTick() {
    if (this.state === GAME_STATES.PLAYING) {
      const nextDir = this.input.nextDirection();
      this.snake.tick(nextDir);

      // Check collision
      const hitWall = this.snake.checkWallCollision();
      const hitSelf = this.snake.checkSelfCollision();

      if (hitWall || hitSelf) {
        if (this.snake.hasShield) {
          // Aegis shield absorbs collision and protects player!
          this.snake.setShield(false);
          this.activePowerup = null;
          this.audio.playShieldAbsorb();
          this.sceneManager.triggerShake(0.65);
          const headPos = this.snake.getHeadWorldPosition();
          this.particles.spawnBurst(headPos, 0x00ff88, 55, 1.8);

          // If wall collision, steer away to safe cell
          if (hitWall) {
            const head = this.snake.body[0];
            const safeDirs = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT].filter(d => {
              const nx = head.x + d.x;
              const nz = head.z + d.z;
              return nx >= 0 && nx < GRID_SIZE && nz >= 0 && nz < GRID_SIZE && !this.snake.isOccupied(nx, nz);
            });
            if (safeDirs.length > 0) {
              this.snake.direction = safeDirs[0];
              this.input.currentDirection = safeDirs[0];
            }
          }
          this.ui.updateHUD(this.score, this.activePowerup);
          return;
        }
        this.triggerGameOver();
        return;
      }

      // Check food collection
      const head = this.snake.getHeadGrid();
      if (head.x === this.food.gridPosition.x && head.z === this.food.gridPosition.z) {
        this.handleFoodCollected();
      }

      // Proximity warning to arena borders
      const distToBorder = Math.min(
        head.x,
        GRID_SIZE - 1 - head.x,
        head.z,
        GRID_SIZE - 1 - head.z
      );
      if (distToBorder <= 1) {
        this.arena.setWarning(1.0 - distToBorder * 0.5);
      } else {
        this.arena.setWarning(0);
      }
    } else if (this.state === GAME_STATES.MENU) {
      // Autonomous AI wandering for background title screen
      this.updateDemoAI();
    }
  }

  handleFoodCollected() {
    const foodType = this.food.currentType;
    const activeMultiplier = (this.activePowerup && this.activePowerup.type === 'SPEED') ? 2 : 1;

    // Score & Combo progression
    const result = this.score.addFood(foodType, activeMultiplier);
    this.score.length = this.snake.body.length + 1;

    // Visual FX & Audio
    const foodPos = this.food.getWorldPosition();
    this.particles.spawnBurst(foodPos, foodType.color, 45, 1.3);
    this.sceneManager.triggerPunch();
    this.sceneManager.triggerShake(0.25); // Punchy satisfying camera impact
    this.snake.triggerSurge();           // Electric light wave rushes through snake

    // Shockwave across living floor and brief brightening of arena
    this.arena.triggerShockwave(foodPos, foodType.color);
    this.lighting.flash(foodType.color, 0.35);

    // High combo celebration fireworks!
    if (result.combo >= 3) {
      this.particles.spawnFireworks(foodPos);
    }

    // Dynamic environment scaling as score climbs & overdrive mode
    const isOverdrive = (this.score.score >= 250) || (this.activePowerup && this.activePowerup.type === 'RAINBOW');
    this.arena.setIntensity(this.score.level, isOverdrive);
    this.lighting.setIntensity(this.score.level);

    if (foodType.type === 'NORMAL') {
      this.audio.playEat(result.combo);
    } else if (foodType.type === 'GOLDEN') {
      this.audio.playGoldenOrb();
      this.particles.spawnBurst(foodPos, 0xffea00, 60, 1.8);
    } else if (foodType.type === 'RAINBOW') {
      this.audio.playRainbowOrb();
      this.particles.spawnBurst(foodPos, 0xff00ff, 80, 2.2);
      this.sceneManager.triggerShake(0.5);
      this.activePowerup = {
        type: 'RAINBOW',
        name: 'Rainbow Overdrive',
        timer: foodType.duration
      };
    } else if (foodType.type === 'SHIELD') {
      this.audio.playPowerup();
      this.snake.setShield(true);
      this.activePowerup = {
        type: 'SHIELD',
        name: 'Aegis Shield',
        timer: foodType.duration
      };
    } else if (foodType.type === 'SPEED') {
      this.audio.playPowerup();
      this.snake.setTurbo(true);
      this.activePowerup = {
        type: 'SPEED',
        name: 'Turbo Boost',
        timer: foodType.duration
      };
    } else if (foodType.type === 'TIME') {
      this.audio.playPowerup();
      this.activePowerup = {
        type: 'TIME',
        name: 'Chrono Freeze',
        timer: foodType.duration
      };
    } else if (foodType.type === 'MAGNET') {
      this.audio.playPowerup();
      this.activePowerup = {
        type: 'MAGNET',
        name: 'Gravity Well',
        timer: foodType.duration
      };
    }

    // Check for milestone "WOW Moment" (25, 50, 100, 250)
    if (result.triggeredMilestone) {
      this.triggerMilestoneMoment(result.triggeredMilestone);
    }

    // Snake Growth
    this.snake.grow(1);

    // Screen popup position calculation
    const screenCoord = this.toScreenCoordinates(foodPos);
    this.ui.showFloatingScore(result.earnedPoints, result.combo, screenCoord);
    this.ui.bounceScore();

    // Spawn next food
    this.food.spawn(this.snake);
    this.ui.updateHUD(this.score, this.activePowerup);
  }

  triggerMilestoneMoment(milestone) {
    this.audio.playMilestone();
    this.sceneManager.triggerPunch();
    this.sceneManager.triggerShake(0.65);
    this.lighting.flash(milestone.accent, 0.75);
    const headWorld = this.snake.getHeadWorldPosition();
    this.arena.triggerShockwave(headWorld, milestone.accent);
    this.particles.spawnFireworks(headWorld);
    this.particles.spawnBurst(headWorld, milestone.accent, 80, 2.2);
    this.ui.showMilestoneBanner(milestone);
  }

  triggerGameOver() {
    this.state = GAME_STATES.GAME_OVER;

    // Explode snake
    this.snake.explode();

    // FX: Camera shake, red alert, explosion particles
    this.sceneManager.triggerShake(0.8);
    this.lighting.setAlert(true);
    this.arena.setWarning(1.0);

    const headPos = this.snake.getHeadWorldPosition();
    this.particles.spawnBurst(headPos, 0xff2200, 70, 2.0);

    this.audio.playCrash();

    setTimeout(() => {
      if (this.score.isNewHighScore) {
        this.audio.playHighScore();
      } else {
        this.audio.playGameOver();
      }

      this.ui.showState(GAME_STATES.GAME_OVER, {
        score: this.score.score,
        highScore: this.score.highScore,
        length: this.score.length,
        foodsCollected: this.score.foodsCollected,
        isNewHighScore: this.score.isNewHighScore
      });
    }, 450);
  }

  /**
   * Autonomous AI Demo for background title screen
   */
  updateDemoAI() {
    const head = this.snake.getHeadGrid();
    const food = this.food.gridPosition;

    // Choose safest direction moving towards food
    const possibleDirs = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT].filter(dir => {
      // No 180 reversal
      if (dir.x + this.snake.direction.x === 0 && dir.z + this.snake.direction.z === 0) return false;
      // No wall crash
      const nx = head.x + dir.x;
      const nz = head.z + dir.z;
      if (nx < 0 || nx >= GRID_SIZE || nz < 0 || nz >= GRID_SIZE) return false;
      // No self crash
      if (this.snake.isOccupied(nx, nz)) return false;
      return true;
    });

    if (possibleDirs.length > 0) {
      // Pick direction closest to food
      possibleDirs.sort((a, b) => {
        const distA = Math.abs(head.x + a.x - food.x) + Math.abs(head.z + a.z - food.z);
        const distB = Math.abs(head.x + b.x - food.x) + Math.abs(head.z + b.z - food.z);
        return distA - distB;
      });
      this.snake.tick(possibleDirs[0]);
    } else {
      this.snake.tick(this.snake.direction);
    }

    // Demo snake eats food if reached
    const curHead = this.snake.getHeadGrid();
    if (curHead.x === food.x && curHead.z === food.z) {
      this.snake.grow(1);
      this.food.spawn(this.snake);
    }
  }

  toScreenCoordinates(worldPos) {
    const vector = new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z);
    vector.project(this.sceneManager.camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;

    return { x: Math.max(20, Math.min(window.innerWidth - 60, x)), y: Math.max(20, Math.min(window.innerHeight - 40, y)) };
  }

  /**
   * Main Animation Loop (60 FPS)
   */
  update() {
    const now = performance.now();
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.gameTime += deltaTime;

    // 1. Update power-up timers
    if (this.activePowerup) {
      this.activePowerup.timer -= deltaTime;
      if (this.activePowerup.timer <= 0) {
        if (this.activePowerup.type === 'SHIELD') this.snake.setShield(false);
        if (this.activePowerup.type === 'SPEED') this.snake.setTurbo(false);
        this.activePowerup = null;
      }
      this.ui.updateHUD(this.score, this.activePowerup);
    }

    // 2. Fixed-rate logic ticks
    if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.MENU) {
      const tickRate = this.state === GAME_STATES.MENU ? 0.22 : this.getTickRate();
      this.accumulator += deltaTime;

      while (this.accumulator >= tickRate) {
        this.gameTick();
        this.accumulator -= tickRate;
      }

      // Score combo countdown
      if (this.state === GAME_STATES.PLAYING) {
        this.score.update(deltaTime);
        this.ui.updateHUD(this.score, this.activePowerup);
      }
    }

    // 3. Smooth visual interpolation fraction
    const tickRate = this.state === GAME_STATES.MENU ? 0.22 : this.getTickRate();
    const alpha = Math.min(1.0, this.accumulator / tickRate);

    // 4. Update 3D visual components
    this.snake.update(alpha, this.gameTime, deltaTime);
    const magnetTarget = (this.activePowerup && this.activePowerup.type === 'MAGNET')
      ? this.snake.getHeadWorldPosition()
      : null;
    this.food.update(this.gameTime, deltaTime, magnetTarget);
    this.particles.update(deltaTime);
    this.arena.update(this.gameTime, deltaTime);
    this.lighting.update(this.gameTime, deltaTime);

    // 5. Update dynamic camera
    const headWorld = this.snake.getHeadWorldPosition();
    this.sceneManager.update(deltaTime, this.state, headWorld);

    // 6. Render frame
    this.sceneManager.render();
  }
}
