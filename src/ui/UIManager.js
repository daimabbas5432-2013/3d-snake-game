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
    this.onSelectMode = options.onSelectMode || (() => {});

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
    this.hudModeName = document.getElementById('hud-mode-name');
    this.hudModeBadge = document.getElementById('hud-mode-badge');
    this.hudModeEvent = document.getElementById('hud-mode-event');
    this.hudEventIcon = document.getElementById('hud-event-icon');
    this.hudEventText = document.getElementById('hud-event-text');
    this.hudEventTimer = document.getElementById('hud-event-timer');
    this.hudComboContainer = document.getElementById('hud-combo-container');
    this.hudComboVal = document.getElementById('hud-combo-val');
    this.hudComboBar = document.getElementById('hud-combo-bar');
    this.powerupBanner = document.getElementById('powerup-banner');
    this.powerupName = document.getElementById('powerup-name');
    this.powerupTimer = document.getElementById('powerup-timer');

    // Ability Notification Toast (<12% screen, top/upper-right)
    this.abilityToast = document.getElementById('ability-toast');
    this.abilityToastIcon = document.getElementById('ability-toast-icon');
    this.abilityToastTitle = document.getElementById('ability-toast-title');
    this.abilityToastTime = document.getElementById('ability-toast-time');
    this.toastTimer = null;

    // Small Permanent Active Ability HUD
    this.abilityHud = document.getElementById('active-ability-hud');
    this.abilityHudIcon = document.getElementById('ability-hud-icon');
    this.abilityHudName = document.getElementById('ability-hud-name');
    this.abilityHudTimer = document.getElementById('ability-hud-timer');
    this.abilityHudBar = document.getElementById('ability-hud-bar');

    this.btnMute = document.getElementById('btn-mute');
    this.btnPause = document.getElementById('btn-pause');

    // Modals
    this.modalMenu = document.getElementById('modal-menu');
    this.modalPause = document.getElementById('modal-pause');
    this.modalGameOver = document.getElementById('modal-gameover');

    // Menu Elements & Mode Cards
    this.menuHighScore = document.getElementById('menu-high-score');
    this.btnStart = document.getElementById('btn-start');
    this.modeCards = document.querySelectorAll('.mode-card');
    this.menuHighRainbow = document.getElementById('menu-high-rainbow');
    this.menuHighPortal = document.getElementById('menu-high-portal');
    this.menuHighBots = document.getElementById('menu-high-bots');

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
    this.goModeBadge = document.getElementById('go-mode-badge');
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

    // Mode Selection Cards
    if (this.modeCards) {
      this.modeCards.forEach(card => {
        const handleSelect = (e) => {
          e.preventDefault();
          playClk();
          const mode = card.dataset.mode;
          if (mode) this.onSelectMode(mode);
        };
        card.addEventListener('click', handleSelect);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSelect(e);
          }
        });
        card.addEventListener('mouseenter', playHov);
      });
    }

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

  updateModeSelection(activeModeKey, allHighScores = {}) {
    if (this.modeCards) {
      this.modeCards.forEach(card => {
        const isMatch = card.dataset.mode === activeModeKey;
        if (isMatch) {
          card.classList.add('active');
          const tag = card.querySelector('.mode-card-active-tag');
          if (tag) tag.textContent = 'SELECTED';
        } else {
          card.classList.remove('active');
          const tag = card.querySelector('.mode-card-active-tag');
          if (tag) tag.textContent = 'SELECT';
        }
      });
    }

    if (this.menuHighRainbow && allHighScores.RAINBOW_STORM !== undefined) {
      this.menuHighRainbow.textContent = allHighScores.RAINBOW_STORM.toString().padStart(6, '0');
    }
    if (this.menuHighPortal && allHighScores.PORTAL !== undefined) {
      this.menuHighPortal.textContent = allHighScores.PORTAL.toString().padStart(6, '0');
    }
    if (this.menuHighBots && allHighScores.ENEMY_BOTS !== undefined) {
      this.menuHighBots.textContent = allHighScores.ENEMY_BOTS.toString().padStart(6, '0');
    }

    if (this.hudModeName) {
      const modeNames = {
        RAINBOW_STORM: 'RAINBOW STORM',
        PORTAL: 'PORTAL MODE',
        ENEMY_BOTS: 'ENEMY BOTS'
      };
      this.hudModeName.textContent = modeNames[activeModeKey] || activeModeKey;
    }
  }

  showState(state, data = {}) {
    this.modalMenu.classList.remove('active');
    this.modalPause.classList.remove('active');
    this.modalGameOver.classList.remove('active');

    switch (state) {
      case GAME_STATES.MENU:
        this.modalMenu.classList.add('active');
        if (data.highScore !== undefined && this.menuHighScore) {
          this.menuHighScore.textContent = data.highScore.toString().padStart(6, '0');
        }
        if (data.activeMode) {
          this.updateModeSelection(data.activeMode, data.allHighScores || {});
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

        if (this.goModeBadge) {
          const modeTitle = data.modeName || 'STANDARD';
          this.goModeBadge.textContent = `MODE: ${modeTitle.toUpperCase()}`;
        }

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

  updateHUD(scoreObj, activePowerup, modeEventData = null) {
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

    if (this.hudModeName && scoreObj.modeName) {
      this.hudModeName.textContent = scoreObj.modeName.toUpperCase();
    }

    // Mode Event Indicator (e.g. Rainbow Storm or Portals Active)
    if (this.hudModeEvent) {
      if (modeEventData && modeEventData.active) {
        this.hudModeEvent.classList.add('active');
        if (this.hudEventIcon && modeEventData.icon) this.hudEventIcon.textContent = modeEventData.icon;
        if (this.hudEventText && modeEventData.text) this.hudEventText.textContent = modeEventData.text;
        if (this.hudEventTimer) {
          if (typeof modeEventData.timer === 'number') {
            this.hudEventTimer.textContent = `${Math.max(0, modeEventData.timer).toFixed(1)}s`;
            this.hudEventTimer.style.display = 'inline-block';
          } else if (modeEventData.timer) {
            this.hudEventTimer.textContent = modeEventData.timer;
            this.hudEventTimer.style.display = 'inline-block';
          } else {
            this.hudEventTimer.style.display = 'none';
          }
        }
      } else {
        this.hudModeEvent.classList.remove('active');
      }
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

    // Active Ability HUD indicator (Compact, permanent countdown and meter)
    if (this.abilityHud) {
      if (activePowerup && activePowerup.timer > 0) {
        const typeCls = (activePowerup.type || 'speed').toLowerCase();
        this.abilityHud.className = `glass-panel ability-hud-card active ${typeCls}`;
        if (this.abilityHudIcon) this.abilityHudIcon.textContent = activePowerup.icon || '⚡';
        if (this.abilityHudName) this.abilityHudName.textContent = activePowerup.shortName || activePowerup.name;
        if (this.abilityHudTimer) this.abilityHudTimer.textContent = `${Math.max(0, activePowerup.timer).toFixed(1)}s`;
        if (this.abilityHudBar) {
          const maxDur = activePowerup.maxDuration || 6.0;
          const pct = Math.max(0, Math.min(100, (activePowerup.timer / maxDur) * 100));
          this.abilityHudBar.style.width = `${pct}%`;
        }
      } else {
        this.abilityHud.className = 'glass-panel ability-hud-card';
      }
    }

    // Active powerup legacy sync
    if (this.powerupBanner) {
      if (activePowerup && activePowerup.timer > 0) {
        this.powerupBanner.className = `glass-panel active ${activePowerup.type.toLowerCase()}`;
        if (this.powerupName) this.powerupName.textContent = activePowerup.name;
        if (this.powerupTimer) this.powerupTimer.textContent = `${activePowerup.timer.toFixed(1)}s`;
      } else {
        this.powerupBanner.className = 'glass-panel';
      }
    }
  }

  showAbilityToast(powerup) {
    if (!this.abilityToast) return;
    const icon = powerup.icon || '⚡';
    const name = powerup.shortName || powerup.name.toUpperCase();
    const duration = powerup.maxDuration || powerup.duration || powerup.timer || 6.0;
    const typeCls = (powerup.type || 'speed').toLowerCase();

    if (this.abilityToastIcon) this.abilityToastIcon.textContent = icon;
    if (this.abilityToastTitle) this.abilityToastTitle.textContent = `${icon} ${name} ACTIVATED`;
    if (this.abilityToastTime) this.abilityToastTime.textContent = `${duration.toFixed(1)}s`;

    this.abilityToast.className = `glass-panel ability-toast active ${typeCls}`;

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      if (this.abilityToast) {
        this.abilityToast.classList.remove('active');
      }
    }, 2400);
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
    }, 2000);
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
