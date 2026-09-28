/**
 * UI Manager - HUD, Modals, Virtual Controls, Popups, and Audio Triggers
 */

import { GAME_STATES, FOOD_TYPES } from '../game/Constants.js';

export class UIManager {
  constructor(options = {}) {
    this.audio = options.audio;
    this.onStart = options.onStart || (() => {});
    this.onResume = options.onResume || (() => {});
    this.onRestart = options.onRestart || (() => {});
    this.onMenu = options.onMenu || (() => {});
    this.onMuteToggle = options.onMuteToggle || (() => {});
    this.onDirectionInput = options.onDirectionInput || (() => {});

    this.cacheDom();
    this.bindEvents();
  }

  cacheDom() {
    // HUD
    this.hudScore = document.getElementById('hud-score');
    this.hudHighScore = document.getElementById('hud-high-score');
    this.hudLength = document.getElementById('hud-length');
    this.hudSpeed = document.getElementById('hud-speed');
    this.hudPhase = document.getElementById('hud-phase');
    this.hudComboContainer = document.getElementById('hud-combo-container');
    this.hudComboVal = document.getElementById('hud-combo-val');
    this.hudComboBar = document.getElementById('hud-combo-bar');
    this.powerupBanner = document.getElementById('powerup-banner');
    this.powerupName = document.getElementById('powerup-name');
    this.powerupTimer = document.getElementById('powerup-timer');

    this.btnMute = document.getElementById('btn-mute');
    this.btnPause = document.getElementById('btn-pause');

    // Modals
    this.modalMenu = document.getElementById('modal-menu');
    this.modalPause = document.getElementById('modal-pause');
    this.modalGameOver = document.getElementById('modal-gameover');

    // Menu Elements
    this.menuHighScore = document.getElementById('menu-high-score');
    this.btnStart = document.getElementById('btn-start');

    // Pause Elements
    this.btnResume = document.getElementById('btn-resume');
    this.btnPauseRestart = document.getElementById('btn-pause-restart');
    this.btnPauseMenu = document.getElementById('btn-pause-menu');

    // Game Over Elements
    this.goScore = document.getElementById('go-score');
    this.goHighScore = document.getElementById('go-high-score');
    this.goLength = document.getElementById('go-length');
    this.goFoods = document.getElementById('go-foods');
    this.goRecordBadge = document.getElementById('go-record-badge');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnGoMenu = document.getElementById('btn-go-menu');

    // Virtual D-Pad
    this.dpadUp = document.getElementById('dpad-up');
    this.dpadDown = document.getElementById('dpad-down');
    this.dpadLeft = document.getElementById('dpad-left');
    this.dpadRight = document.getElementById('dpad-right');

    this.uiLayer = document.getElementById('ui-layer');
  }

  bindEvents() {
    const playHov = () => this.audio && this.audio.playHover();
    const playClk = () => this.audio && this.audio.playClick();

    // Attach hover sounds to all buttons
    document.querySelectorAll('.cyber-btn, .hud-btn, .dpad-btn').forEach(btn => {
      btn.addEventListener('mouseenter', playHov);
    });

    // Start Button
    this.btnStart.addEventListener('click', () => {
      playClk();
      this.onStart();
    });

    // Mute Button
    this.btnMute.addEventListener('click', () => {
      playClk();
      const isMuted = this.onMuteToggle();
      this.updateMuteIcon(isMuted);
    });

    // Pause Button
    this.btnPause.addEventListener('click', () => {
      playClk();
      this.onResume(); // Toggles pause/resume
    });

    // Resume Button
    this.btnResume.addEventListener('click', () => {
      playClk();
      this.onResume();
    });

    // Pause Restart Button
    this.btnPauseRestart.addEventListener('click', () => {
      playClk();
      this.onRestart();
    });

    // Pause Main Menu Button
    this.btnPauseMenu.addEventListener('click', () => {
      playClk();
      this.onMenu();
    });

    // Game Over Replay Button
    this.btnReplay.addEventListener('click', () => {
      playClk();
      this.onRestart();
    });

    // Game Over Menu Button
    this.btnGoMenu.addEventListener('click', () => {
      playClk();
      this.onMenu();
    });

    // Virtual D-pad
    const addDpadListener = (el, dirName) => {
      if (!el) return;
      const trigger = (e) => {
        e.preventDefault();
        playHov();
        this.onDirectionInput(dirName);
      };
      el.addEventListener('pointerdown', trigger);
    };

    addDpadListener(this.dpadUp, 'UP');
    addDpadListener(this.dpadDown, 'DOWN');
    addDpadListener(this.dpadLeft, 'LEFT');
    addDpadListener(this.dpadRight, 'RIGHT');
  }

  updateMuteIcon(isMuted) {
    if (this.btnMute) {
      this.btnMute.innerHTML = isMuted
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    }
  }

  showState(state, data = {}) {
    this.modalMenu.classList.remove('active');
    this.modalPause.classList.remove('active');
    this.modalGameOver.classList.remove('active');

    switch (state) {
      case GAME_STATES.MENU:
        this.modalMenu.classList.add('active');
        if (data.highScore !== undefined) {
          this.menuHighScore.textContent = data.highScore.toString().padStart(6, '0');
        }
        break;

      case GAME_STATES.PAUSED:
        this.modalPause.classList.add('active');
        break;

      case GAME_STATES.GAME_OVER:
        this.modalGameOver.classList.add('active');
        this.goScore.textContent = data.score !== undefined ? data.score.toString().padStart(6, '0') : '000000';
        this.goHighScore.textContent = data.highScore !== undefined ? data.highScore.toString().padStart(6, '0') : '000000';
        this.goLength.textContent = data.length || 3;
        this.goFoods.textContent = data.foodsCollected || 0;

        if (data.isNewHighScore) {
          this.goRecordBadge.style.display = 'block';
        } else {
          this.goRecordBadge.style.display = 'none';
        }
        break;

      case GAME_STATES.PLAYING:
        // All modals hidden, gameplay active
        break;
    }
  }

  bounceScore() {
    if (this.hudScore) {
      this.hudScore.classList.add('bump');
      setTimeout(() => {
        if (this.hudScore) this.hudScore.classList.remove('bump');
      }, 160);
    }
  }

  updateHUD(scoreObj, activePowerup) {
    this.hudScore.textContent = scoreObj.getFormattedScore();
    this.hudHighScore.textContent = scoreObj.getFormattedHighScore();
    this.hudLength.textContent = scoreObj.length.toString().padStart(2, '0');
    this.hudSpeed.textContent = scoreObj.level.toString().padStart(2, '0');

    // Update current level phase
    if (this.hudPhase) {
      const curPhase = scoreObj.getCurrentPhase();
      this.hudPhase.textContent = curPhase.name;
      this.hudPhase.style.borderColor = curPhase.color;
      this.hudPhase.style.color = curPhase.color;
    }

    // Combo meter with dynamic shoutouts
    if (scoreObj.combo > 1 && scoreObj.comboTimer > 0) {
      this.hudComboContainer.classList.add('active');
      const comboLabels = ['', '', 'x2 COMBO', 'x3 SUPER!', 'x4 HYPER!', 'x5 MAXIMUM!'];
      this.hudComboVal.textContent = comboLabels[scoreObj.combo] || `x${scoreObj.combo}`;
      this.hudComboBar.style.width = `${scoreObj.getComboProgress() * 100}%`;
    } else {
      this.hudComboContainer.classList.remove('active');
    }

    // Active powerup
    if (activePowerup && activePowerup.timer > 0) {
      this.powerupBanner.className = `glass-panel active ${activePowerup.type.toLowerCase()}`;
      this.powerupName.textContent = activePowerup.name;
      this.powerupTimer.textContent = `${activePowerup.timer.toFixed(1)}s`;
    } else {
      this.powerupBanner.className = 'glass-panel';
    }
  }

  showMilestoneBanner(milestone) {
    const banner = document.getElementById('milestone-banner');
    const title = document.getElementById('milestone-title');
    const subtitle = document.getElementById('milestone-subtitle');
    if (!banner || !title) return;

    title.textContent = `${milestone.name} ACTIVATED`;
    if (subtitle) subtitle.textContent = milestone.subtitle || 'MAXIMUM VELOCITY UNLOCKED';
    banner.classList.add('active');

    setTimeout(() => {
      if (banner) banner.classList.remove('active');
    }, 2200);
  }

  showFloatingScore(points, combo, screenPos) {
    const el = document.createElement('div');
    el.className = 'score-popup';
    el.textContent = combo > 1 ? `+${points} (${combo}X)` : `+${points}`;
    el.style.left = `${screenPos.x}px`;
    el.style.top = `${screenPos.y}px`;

    this.uiLayer.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 900);
  }
}
