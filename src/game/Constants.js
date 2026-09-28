/**
 * Neon Snake 3D - Game Constants & Configuration
 */

export const GRID_SIZE = 20; // 20x20 grid cells
export const CELL_SIZE = 1.0; // 1 Three.js unit per cell
export const ARENA_HALF_SIZE = (GRID_SIZE * CELL_SIZE) / 2; // 10.0 units from center

export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export const DIRECTIONS = {
  UP: { x: 0, z: -1, name: 'UP', angle: 0 },
  DOWN: { x: 0, z: 1, name: 'DOWN', angle: Math.PI },
  LEFT: { x: -1, z: 0, name: 'LEFT', angle: Math.PI / 2 },
  RIGHT: { x: 1, z: 0, name: 'RIGHT', angle: -Math.PI / 2 }
};

export const SPEED_CONFIG = {
  INITIAL_TICK_RATE: 0.165, // Seconds per tick (~6.0 steps/sec)
  MIN_TICK_RATE: 0.065,     // Fastest speed cap (~15 steps/sec)
  SPEED_STEP: 0.007,        // Speed increment per level
  FOOD_PER_LEVEL: 3         // Foods collected per speed level up
};

export const FOOD_TYPES = {
  NORMAL: {
    type: 'NORMAL',
    name: 'Plasma Orb',
    points: 10,
    color: 0x00f0ff,
    glowColor: 0x0088ff,
    probability: 0.75,
    duration: 0
  },
  HYPER: {
    type: 'HYPER',
    name: 'Overcharge Core',
    points: 50,
    color: 0xffb700,
    glowColor: 0xff4400,
    probability: 0.15,
    duration: 8 // seconds
  },
  CHRONO: {
    type: 'CHRONO',
    name: 'Time Distortion',
    points: 30,
    color: 0x9d00ff,
    glowColor: 0xdf00ff,
    probability: 0.10,
    duration: 6 // seconds
  }
};

export const PALETTE = {
  CYAN: 0x00f0ff,
  BLUE: 0x0077ff,
  MAGENTA: 0xff007f,
  PURPLE: 0x9d00ff,
  GOLD: 0xffb700,
  RED_ALERT: 0xff1744,
  DARK_BG: 0x04060e,
  GRID_BASE: 0x0b1021,
  GRID_LINES: 0x1a264a,
  GRID_GLOW: 0x00f0ff
};

export const COMBO_CONFIG = {
  WINDOW_SECONDS: 3.5,
  MAX_MULTIPLIER: 5
};
