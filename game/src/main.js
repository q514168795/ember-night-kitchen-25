// SPDX-License-Identifier: MIT
// Boot and fixed-step loop for Ember Night Kitchen. The page is a single fixed-size stage;
// input, rules and drawing stay separate so the same state can drive play and screenshots.
import { BEST_KEY, INGREDIENTS, MAX_FRAME, STEP } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createWorld, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';
import { stageShot } from './shots.js';

function createRandom(seed) {
  let value = (seed >>> 0) || 1;
  return function random() {
    value ^= value << 13; value >>>= 0;
    value ^= value >> 17;
    value ^= value << 5; value >>>= 0;
    return value / 4294967296;
  };
}

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261125;
const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Private browsing has no storage; the current run still works.
  }
}

let announced = '';
function announce(message) {
  if (message !== announced) {
    announced = message;
    status.textContent = message;
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.resize();
    renderer.draw(world.state, scene.best);
    painted += 1;
    if (painted < 8) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  renderer.draw(world.state, scene.best);
  requestAnimationFrame(paint);
}

const actions = {
  unlockAudio: () => audio.unlock(),
  isPaused: () => world.state.screen === SCREEN_PAUSED,
  click(hit) {
    const screen = world.state.screen;
    if (hit?.kind === 'sound') {
      audio.toggle();
      return;
    }
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
      world.primaryAction();
      announce(world.state.message);
      return;
    }
    if (screen === SCREEN_PAUSED) {
      if (hit?.kind === 'resume' || hit?.kind === 'pause') {
        world.togglePause();
        announce(world.state.message);
      }
      return;
    }
    if (!hit) return;
    if (hit.kind === 'order') world.selectOrder(hit.index);
    else if (hit.kind === 'crate') world.addIngredient(INGREDIENTS[hit.index]?.id);
    else if (hit.kind === 'prep') world.interactPrep();
    else if (hit.kind === 'burner') world.interactBurner(hit.index);
    else if (hit.kind === 'plate') world.interactPlate();
    else if (hit.kind === 'serve') world.serve();
    else if (hit.kind === 'trash') world.discardHands();
    else if (hit.kind === 'pause') world.togglePause();
  },
  addIngredient(id) { world.addIngredient(id); },
  prep() { world.interactPrep(); },
  burner(index) { world.interactBurner(index); },
  plate() { world.interactPlate(); },
  serve() { world.serve(); },
  primary() { world.primaryAction(); },
  cycle(direction) { world.cycleOrder(direction); },
  clearHands() { world.discardHands(); },
  clearPlate() { world.clearPlate(); },
  pause() { world.togglePause(); },
  toggleSound() { audio.toggle(); },
};

createInput(canvas, renderer, actions);

function runGame() {
  let screen = world.state.screen;
  let best = readBest();
  let last = performance.now();
  let accumulator = 0;

  function drainEvents() {
    const events = world.takeEvents();
    for (const event of events) audio.play(event);
    if (events.includes('over') && world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && world.state.screen === SCREEN_PLAY) {
      world.togglePause();
      announce('Paused.');
    }
  });

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    while (accumulator >= STEP) {
      world.step(STEP);
      accumulator -= STEP;
    }
    drainEvents();
    renderer.draw(world.state, best);
    announce(`${world.state.message}${world.state.screen === SCREEN_OVER ? ` Final score ${world.state.score}.` : ''}`);
    if (world.state.screen !== screen) {
      screen = world.state.screen;
      if (screen === SCREEN_PAUSED) announce('Paused.');
    }
  }

  announce('Ember Night Kitchen. Press Space or click to start service.');
  requestAnimationFrame(frame);
}

if (shotName) runShot(shotName);
else runGame();
