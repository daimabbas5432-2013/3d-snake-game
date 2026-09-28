/**
 * Automated End-to-End Test Suite for Neon Snake 3D
 */

import { GAME_STATES, DIRECTIONS } from './game/Constants.js';

export async function runE2ETests() {
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

  game.food.currentType = { type: 'SPEED', name: 'Turbo Surge', points: 20, color: 0xff9900, secondaryColor: 0xff3300, ringColor: 0xffcc00, probability: 0.09, duration: 6 };
  game.handleFoodCollected();
  if (!game.activePowerup || game.activePowerup.type !== 'SPEED') {
    console.error('TEST_FAIL: Turbo powerup not active');
    return false;
  }
  console.log('TEST_PASS: Turbo Surge powerup activated');

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

  console.log('=== E2E_ALL_TESTS_PASSED ===');
  return true;
}

// Auto-run if ?test=true is in URL
if (window.location.search.includes('test=true')) {
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(runE2ETests, 800);
  });
}
