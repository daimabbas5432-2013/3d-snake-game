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
    name: 'Plasma Crystal',
    points: 10,
    color: 0xff007f,      // Hot Pink / Neon Magenta (stunning contrast on cyan/blue floor)
    glowColor: 0x00f0ff,  // Radiant Cyan secondary
    ringColor: 0xff1493,
    probability: 0.70,
    duration: 0
  },
  HYPER: {
    type: 'HYPER',
    name: 'Overcharge Core',
    points: 50,
    color: 0xffea00,      // Electric Solar Yellow
    glowColor: 0xff5500,  // Radiant Blaze Orange
    ringColor: 0xffd700,
    probability: 0.18,
    duration: 8 // seconds
  },
  CHRONO: {
    type: 'CHRONO',
    name: 'Chrono Warp Crystal',
    points: 30,
    color: 0xaa00ff,      // Neon Electric Purple
    glowColor: 0x00f0ff,  // Vibrant Cyan
    ringColor: 0xdf00ff,
    probability: 0.12,
    duration: 6 // seconds
  }
};

export const PALETTE = {
  CYAN: 0x00f0ff,
  ELECTRIC_BLUE: 0x0066ff,
  HOT_PINK: 0xff007f,
  MAGENTA: 0xff00a0,
  PURPLE: 0x7b1fa2,
  DEEP_PURPLE: 0x240046,
  NEON_YELLOW: 0xffea00,
  NEON_ORANGE: 0xff6600,
  RED_ALERT: 0xff1744,
  DARK_SPACE: 0x03030a,
  GRID_GLOW: 0x00f0ff
};

export const COMBO_CONFIG = {
  WINDOW_SECONDS: 3.5,
  MAX_MULTIPLIER: 5
};
