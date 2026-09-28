/**
 * Score & Progression Manager
 * Milestone triggers, level phases, combo multipliers, and localStorage high score persistence
 */

import { COMBO_CONFIG, SPEED_CONFIG, PHASES } from './Constants.js';

export class Score {
  constructor() {
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.length = 3;
    this.foodsCollected = 0;
    this.level = 1;
    this.currentPhaseIndex = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxComboAchieved = 1;
    this.isNewHighScore = false;
    this.unlockedMilestones = new Set();
  }

  loadHighScore() {
    const saved = localStorage.getItem('neon_snake_highscore');
    return saved ? parseInt(saved, 10) || 0 : 0;
  }

  saveHighScore() {
    localStorage.setItem('neon_snake_highscore', this.highScore.toString());
  }

  reset() {
    this.score = 0;
    this.length = 3;
    this.foodsCollected = 0;
    this.level = 1;
    this.currentPhaseIndex = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.maxComboAchieved = 1;
    this.isNewHighScore = false;
    this.unlockedMilestones = new Set();
  }

  update(deltaTime) {
    if (this.comboTimer > 0) {
      this.comboTimer -= deltaTime;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.comboTimer = 0;
      }
    }
  }

  getCurrentPhase() {
    return PHASES[this.currentPhaseIndex] || PHASES[0];
  }

  addFood(foodConfig, activeMultiplier = 1) {
    this.foodsCollected++;

    // Combo calculation
    if (this.comboTimer > 0) {
      this.combo = Math.min(this.combo + 1, COMBO_CONFIG.MAX_MULTIPLIER);
    } else {
      this.combo = 1;
    }
    this.comboTimer = COMBO_CONFIG.WINDOW_SECONDS;

    if (this.combo > this.maxComboAchieved) {
      this.maxComboAchieved = this.combo;
    }

    // Points calculation
    const earnedPoints = foodConfig.points * this.combo * activeMultiplier;
    this.score += earnedPoints;

    // Check for newly crossed milestones (25, 50, 100, 250)
    let triggeredMilestone = null;
    const milestonePoints = [250, 100, 50, 25];

    for (const m of milestonePoints) {
      if (this.score >= m && !this.unlockedMilestones.has(m)) {
        this.unlockedMilestones.add(m);
        // Find phase
        const phaseIdx = PHASES.findIndex(p => p.threshold === m);
        if (phaseIdx !== -1) {
          this.currentPhaseIndex = Math.max(this.currentPhaseIndex, phaseIdx);
          triggeredMilestone = PHASES[phaseIdx];
        }
        break;
      }
    }

    // High score check
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.isNewHighScore = true;
    }

    // Level progression
    this.level = Math.min(10, 1 + Math.floor(this.foodsCollected / SPEED_CONFIG.FOOD_PER_LEVEL));

    return {
      earnedPoints,
      combo: this.combo,
      isNewHighScore: this.isNewHighScore,
      triggeredMilestone
    };
  }

  getFormattedScore() {
    return this.score.toString().padStart(6, '0');
  }

  getFormattedHighScore() {
    return this.highScore.toString().padStart(6, '0');
  }

  getComboProgress() {
    if (this.comboTimer <= 0) return 0;
    return Math.max(0, Math.min(1, this.comboTimer / COMBO_CONFIG.WINDOW_SECONDS));
  }
}
