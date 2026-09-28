/**
 * Neon Snake 3D - Game Constants & Configuration
 * Living Rainbow & Progression Upgrade
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
  INITIAL_TICK_RATE: 0.160,
  MIN_TICK_RATE: 0.065,
  SPEED_STEP: 0.006,
  FOOD_PER_LEVEL: 3
};

export const FOOD_TYPES = {
  NORMAL: {
    type: 'NORMAL',
    name: 'Plasma Orb',
    points: 10,
    color: 0x00f0ff,
    secondaryColor: 0x0088ff,
    ringColor: 0x00ffff,
    probability: 0.50,
    duration: 0
  },
  GOLDEN: {
    type: 'GOLDEN',
    name: 'Solar Gold Core',
    points: 50,
    color: 0xffea00,
    secondaryColor: 0xff7700,
    ringColor: 0xffd700,
    probability: 0.15,
    duration: 0
  },
  RAINBOW: {
    type: 'RAINBOW',
    name: 'Rainbow Prism',
    points: 100,
    color: 0xff00cc,
    secondaryColor: 0x00f0ff,
    ringColor: 0xffea00,
    probability: 0.08,
    duration: 8 // Activates Rainbow Overdrive mode
  },
  SPEED: {
    type: 'SPEED',
    name: 'Turbo Surge',
    points: 20,
    color: 0xff9900,
    secondaryColor: 0xff3300,
    ringColor: 0xffcc00,
    probability: 0.09,
    duration: 6
  },
  TIME: {
    type: 'TIME',
    name: 'Chrono Freeze',
    points: 20,
    color: 0x00e5ff,
    secondaryColor: 0x7b1fa2,
    ringColor: 0x99ffff,
    probability: 0.09,
    duration: 6
  },
  MAGNET: {
    type: 'MAGNET',
    name: 'Gravity Well',
    points: 25,
    color: 0xcc00ff,
    secondaryColor: 0xff00aa,
    ringColor: 0xff66ff,
    probability: 0.05,
    duration: 7
  },
  SHIELD: {
    type: 'SHIELD',
    name: 'Aegis Shield',
    points: 25,
    color: 0x00ff88,
    secondaryColor: 0x00aaff,
    ringColor: 0x88ffcc,
    probability: 0.04,
    duration: 15 // Or until 1 collision is absorbed
  }
};

export const PHASES = [
  { threshold: 0, name: 'NEON CITY', subtitle: 'GRID ONLINE', color: '#00f0ff', accent: 0x00f0ff },
  { threshold: 25, name: 'SYNTHWAVE', subtitle: 'SPECTRUM SHIFT', color: '#ff00aa', accent: 0xff00aa },
  { threshold: 50, name: 'RAINBOW CORE', subtitle: 'PRISM PULSE', color: '#ffea00', accent: 0xffea00 },
  { threshold: 100, name: 'VOLTAGE', subtitle: 'HYPER-CHARGED', color: '#00e5ff', accent: 0x00e5ff },
  { threshold: 250, name: 'OVERDRIVE', subtitle: 'MAXIMUM VELOCITY', color: '#ff0055', accent: 0xff0055 }
];

export const PALETTE = {
  CYAN: 0x00f0ff,
  ELECTRIC_BLUE: 0x0066ff,
  HOT_PINK: 0xff007f,
  MAGENTA: 0xff00a0,
  PURPLE: 0x7b1fa2,
  DEEP_PURPLE: 0x240046,
  NEON_YELLOW: 0xffea00,
  NEON_ORANGE: 0xff6600,
  NEON_GREEN: 0x00ff88,
  RED_ALERT: 0xff1744,
  DARK_SPACE: 0x020308,
  GRID_GLOW: 0x00f0ff
};

export const COMBO_CONFIG = {
  WINDOW_SECONDS: 3.8,
  MAX_MULTIPLIER: 5
};
