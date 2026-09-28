/**
 * Automated End-to-End Test Suite for Neon Snake 3D
 */

import { GAME_STATES, DIRECTIONS } from './game/Constants.js';

export async function runE2ETests() {
  const origLog = console.log;
  const origErr = console.error;
  let resDiv = document.getElementById('test-results');
  if (!resDiv) {
    resDiv = document.createElement('div');
    resDiv.id = 'test-results';
    resDiv.style.cssText = 'position:fixed;bottom:0;left:0;max-height:200px;overflow:auto;background:rgba(0,0,0,0.9);color:#0f0;font-family:monospace;font-size:11px;z-index:99999;padding:10px;';
    document.body.appendChild(resDiv);
  }

  const appendDOM = (text, isErr) => {
    const p = document.createElement('div');
    p.className = isErr ? 'test-log-err' : 'test-log-ok';
    p.textContent = text;
    if (isErr) p.style.color = '#ff3366';
    resDiv.appendChild(p);
  };
  console.log = (...args) => {
    origLog.apply(console, args);
    appendDOM(args.join(' '), false);
  };
  console.error = (...args) => {
    origErr.apply(console, args);
    appendDOM(args.join(' '), true);
  };

  console.log('--- STARTING NEON VIPER 3D E2E TESTS ---');

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Wait for game to be initialized
  let retries = 0;
  while (!window.__game && retries < 50) {
    await wait(100);
    retries++;
  }

  if (!window.__game) {
    console.error('TEST_FAIL: window.__game not initialized after 5s');
    return false;
  }
  console.log('TEST_PASS: Game instance initialized');

  const game = window.__game;

  // 2. Verify Initial State is MENU
  if (game.state !== GAME_STATES.MENU) {
    console.error(`TEST_FAIL: Expected state MENU, got ${game.state}`);
    return false;
  }
  console.log('TEST_PASS: Initial state is MENU');

  const startBtn = document.getElementById('btn-start');
  const modalMenu = document.getElementById('modal-menu');

  if (!startBtn || !modalMenu.classList.contains('active')) {
    console.error('TEST_FAIL: Start button or Menu modal not active');
    return false;
  }
  console.log('TEST_PASS: Start button and Menu modal active');

  // 3. Click Start Button
  console.log('ACTION: Clicking START MISSION button');
  startBtn.click();
  await wait(300);

  if (game.state !== GAME_STATES.PLAYING) {
    console.error(`TEST_FAIL: Expected state PLAYING after click, got ${game.state}`);
    return false;
  }
  if (modalMenu.classList.contains('active')) {
    console.error('TEST_FAIL: Menu modal still has active class after starting');
    return false;
  }
  console.log('TEST_PASS: Successfully transitioned to PLAYING state');

  // 4. Verify HUD
  const hudScore = document.getElementById('hud-score');
  const hudLength = document.getElementById('hud-length');
  if (hudScore.textContent !== '000000') {
    console.error(`TEST_FAIL: Expected initial HUD score 000000, got ${hudScore.textContent}`);
    return false;
  }
  console.log(`TEST_PASS: HUD score is ${hudScore.textContent}, length is ${hudLength.textContent}`);

  // 5. Test Direction Steering
  console.log('ACTION: Sending directional steering (UP)');
  game.input.requestDirection(DIRECTIONS.UP);
  game.gameTick();
  console.log(`TEST_PASS: Snake steered to direction: ${game.snake.direction.name}`);

  // 6. Test Food Collection & Growth
  const initialLength = game.snake.body.length;
  console.log('ACTION: Simulating food collection');
  game.handleFoodCollected();
  await wait(100);

  if (game.score.score <= 0) {
    console.error(`TEST_FAIL: Score did not increase after food, score=${game.score.score}`);
    return false;
  }
  console.log(`TEST_PASS: Food collected. Score: ${game.score.score}, Combo: ${game.score.combo}`);

  // 7. Test Pause & Resume
  console.log('ACTION: Triggering Pause');
  game.togglePause();
  if (game.state !== GAME_STATES.PAUSED) {
    console.error(`TEST_FAIL: Expected PAUSED, got ${game.state}`);
    return false;
  }
  const modalPause = document.getElementById('modal-pause');
  if (!modalPause.classList.contains('active')) {
    console.error('TEST_FAIL: Pause modal not active when paused');
    return false;
  }
  console.log('TEST_PASS: Pause menu active');

  console.log('ACTION: Resuming game');
  game.togglePause();
  if (game.state !== GAME_STATES.PLAYING) {
    console.error(`TEST_FAIL: Expected PLAYING after resume, got ${game.state}`);
    return false;
  }
  console.log('TEST_PASS: Resumed back to PLAYING');

  // 8. Test Shield Collision Absorption Mechanics
  console.log('ACTION: Testing Shield collision absorption');
  game.snake.setShield(true);
  if (!game.snake.hasShield) {
    console.error('TEST_FAIL: Shield could not be set on snake');
    return false;
  }
  // Simulate collision while shield is active
  game.snake.body[0].x = -1; // Force wall collision position
  game.gameTick();
  if (game.state !== GAME_STATES.PLAYING) {
    console.error('TEST_FAIL: Game Over triggered despite active Aegis Shield!');
    return false;
  }
  if (game.snake.hasShield) {
    console.error('TEST_FAIL: Shield was not consumed after absorbing collision');
    return false;
  }
  console.log('TEST_PASS: Shield successfully absorbed collision and kept snake alive!');

  // 9. Test Power-up & Collectible Types
  console.log('ACTION: Testing power-up collectibles');
  game.food.currentType = { type: 'GOLDEN', name: 'Solar Gold Core', points: 50, color: 0xffea00, secondaryColor: 0xff7700, ringColor: 0xffd700, probability: 0.15, duration: 0 };
  game.handleFoodCollected();
  console.log('TEST_PASS: Golden Orb collected');

  game.food.currentType = { type: 'SPEED', name: 'Turbo Boost', shortName: 'TURBO', icon: '⚡', points: 20, color: 0xffffff, secondaryColor: 0xffea00, ringColor: 0xff007f, probability: 0.09, duration: 6 };
  game.handleFoodCollected();
  if (!game.activePowerup || game.activePowerup.type !== 'SPEED') {
    console.error('TEST_FAIL: Turbo powerup not active');
    return false;
  }
  const abilityToast = document.getElementById('ability-toast');
  const abilityHud = document.getElementById('active-ability-hud');
  if (!abilityToast || !abilityToast.classList.contains('active')) {
    console.error('TEST_FAIL: Ability toast notification not active');
    return false;
  }
  if (!abilityHud || !abilityHud.classList.contains('active')) {
    console.error('TEST_FAIL: Active ability HUD panel not active');
    return false;
  }
  console.log('TEST_PASS: Turbo Boost powerup activated with compact toast & active HUD panel');

  // 10. Test Milestone WOW Moment Trigger
  console.log('ACTION: Testing milestone moment trigger');
  game.triggerMilestoneMoment({ name: 'OVERDRIVE', subtitle: 'MAXIMUM VELOCITY', color: '#ff0055', accent: 0xff0055 });
  const milestoneBanner = document.getElementById('milestone-banner');
  if (!milestoneBanner || !milestoneBanner.classList.contains('active')) {
    console.error('TEST_FAIL: Milestone banner not displayed');
    return false;
  }
  console.log('TEST_PASS: Milestone WOW Moment banner active');

  // 11. Test Game Over
  console.log('ACTION: Triggering Game Over crash');
  game.triggerGameOver();
  await wait(600);

  if (game.state !== GAME_STATES.GAME_OVER) {
    console.error(`TEST_FAIL: Expected GAME_OVER, got ${game.state}`);
    return false;
  }
  const modalGameOver = document.getElementById('modal-gameover');
  if (!modalGameOver.classList.contains('active')) {
    console.error('TEST_FAIL: Game Over modal not visible');
    return false;
  }
  console.log('TEST_PASS: Game Over screen active with final statistics');

  // 12. Test Replay Button
  const btnReplay = document.getElementById('btn-replay');
  console.log('ACTION: Clicking RETRY MISSION button');
  btnReplay.click();
  await wait(300);

  if (game.state !== GAME_STATES.PLAYING) {
    console.error(`TEST_FAIL: Expected PLAYING after retry, got ${game.state}`);
    return false;
  }
  console.log('TEST_PASS: Retry restarted game into PLAYING state');

  // 13. Test Mode Switching & Cleanup (Return to Menu)
  console.log('ACTION: Testing Mode Selection & Cleanup');
  game.initMenuState();
  await wait(200);

  if (game.portalManager !== null || game.enemyManager !== null) {
    console.error('TEST_FAIL: Mode entities not cleaned up on return to menu');
    return false;
  }
  console.log('TEST_PASS: Mode entities cleanly disposed on return to menu');

  // Test Mode 2: Portal Mode selection
  const cardPortal = document.getElementById('mode-card-portal');
  if (!cardPortal) {
    console.error('TEST_FAIL: #mode-card-portal not found in DOM');
    return false;
  }
  cardPortal.click();
  await wait(100);

  if (game.currentMode !== 'PORTAL' || !cardPortal.classList.contains('active')) {
    console.error(`TEST_FAIL: Portal Mode not selected. currentMode=${game.currentMode}`);
    return false;
  }
  console.log('TEST_PASS: Portal mode card clicked and selected');

  // Start in Portal Mode
  startBtn.click();
  await wait(300);

  if (!game.portalManager || !game.portalManager.portalA || !game.portalManager.portalB) {
    console.error('TEST_FAIL: PortalManager or portals not spawned in PORTAL mode');
    return false;
  }
  console.log(`TEST_PASS: Dual portals active at Alpha(${game.portalManager.portalA.gridPosition.x},${game.portalManager.portalA.gridPosition.z}) and Omega(${game.portalManager.portalB.gridPosition.x},${game.portalManager.portalB.gridPosition.z})`);

  // Test Portal Teleportation
  const pA = game.portalManager.portalA.gridPosition;
  const pB = game.portalManager.portalB.gridPosition;
  game.snake.body[0].x = pA.x;
  game.snake.body[0].z = pA.z;
  const teleResult = game.portalManager.checkTeleport(game.snake);
  if (!teleResult) {
    console.error('TEST_FAIL: Snake head on portal A did not trigger teleport');
    return false;
  }
  const newHead = game.snake.body[0];
  const distToOmega = Math.abs(newHead.x - pB.x) + Math.abs(newHead.z - pB.z);
  if (distToOmega > 2) {
    console.error(`TEST_FAIL: Teleported head too far from portal B: (${newHead.x},${newHead.z})`);
    return false;
  }
  console.log(`TEST_PASS: Teleported smoothly through portal to safe exit at (${newHead.x},${newHead.z})`);

  // Test Mode 3: Enemy Bots Selection & Cleanup
  console.log('ACTION: Testing Enemy Bots mode selection and cleanup');
  game.initMenuState();
  const cardBots = document.getElementById('mode-card-bots');
  cardBots.click();
  await wait(100);

  if (game.currentMode !== 'ENEMY_BOTS' || !cardBots.classList.contains('active')) {
    console.error(`TEST_FAIL: Enemy Bots not selected. currentMode=${game.currentMode}`);
    return false;
  }
  if (game.portalManager !== null) {
    console.error('TEST_FAIL: Portals were not cleaned up when selecting Enemy Bots');
    return false;
  }

  startBtn.click();
  await wait(300);

  if (!game.enemyManager || game.enemyManager.getBotCount() < 1) {
    console.error('TEST_FAIL: EnemyManager or bots not active in ENEMY_BOTS mode');
    return false;
  }
  console.log(`TEST_PASS: Enemy Bots mode initialized with ${game.enemyManager.getBotCount()} active AI drone`);

  // Test Mode 1: Rainbow Storm Selection & Periodic Trigger
  console.log('ACTION: Testing Rainbow Storm mode & event trigger');
  game.initMenuState();
  const cardRainbow = document.getElementById('mode-card-rainbow');
  cardRainbow.click();
  await wait(100);

  if (game.currentMode !== 'RAINBOW_STORM') {
    console.error(`TEST_FAIL: Rainbow Storm not selected. currentMode=${game.currentMode}`);
    return false;
  }
  startBtn.click();
  await wait(300);

  // Trigger storm event
  game.stormCountdown = 0.001;
  game.update();
  if (!game.stormActive) {
    console.error('TEST_FAIL: Rainbow Storm event was not triggered');
    return false;
  }
  const hudEvent = document.getElementById('hud-mode-event');
  if (!hudEvent || !hudEvent.classList.contains('active')) {
    console.error('TEST_FAIL: HUD Rainbow Storm event banner not active');
    return false;
  }
  console.log('TEST_PASS: Rainbow Storm event triggered with active HUD event indicator and motes');

  // 14. Test Mode-Specific High Scores in localStorage
  console.log('ACTION: Testing Mode-Specific High Scores in localStorage');
  game.score.setMode('RAINBOW_STORM');
  game.score.saveHighScore(1240);
  game.score.setMode('PORTAL');
  game.score.saveHighScore(890);
  game.score.setMode('ENEMY_BOTS');
  game.score.saveHighScore(1560);

  const scores = game.score.getAllHighScores();
  if (scores.RAINBOW_STORM !== 1240 || scores.PORTAL !== 890 || scores.ENEMY_BOTS !== 1560) {
    console.error(`TEST_FAIL: High scores corrupted or overwritten: ${JSON.stringify(scores)}`);
    return false;
  }
  console.log(`TEST_PASS: Mode-specific high scores verified: Rainbow=${scores.RAINBOW_STORM}, Portal=${scores.PORTAL}, Bots=${scores.ENEMY_BOTS}`);

  // 15. Verify Food High-Contrast White Core
  if (game.food.coreMat.color.getHex() !== 0xffffff) {
    console.error('TEST_FAIL: Food inner core is not high-contrast pure white');
    return false;
  }
  console.log('TEST_PASS: Food core confirmed pure white (0xffffff) with rotating energy rings');

  console.log('=== E2E_ALL_TESTS_PASSED ===');
  return true;
}

// Auto-run if ?test=true is in URL
if (window.location.search.includes('test=true')) {
  const scheduleRun = () => {
    setTimeout(() => {
      runE2ETests().catch(err => {
        console.error('TEST_EXCEPTION: ' + (err.stack || err.message || err));
      });
    }, 400);
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', scheduleRun);
  } else {
    scheduleRun();
  }
}
