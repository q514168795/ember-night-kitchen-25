// SPDX-License-Identifier: MIT
// Rules and state for Ember Night Kitchen. No canvas drawing here: the kitchen is a set of
// stations, tickets are ordinary objects, and every interaction returns an event name the boot
// loop can turn into sound or an accessibility announcement.
import { INGREDIENT_MAP, SHIFT_SECONDS } from './config.js';
import { RECIPES, sameComponents } from './recipes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const CHOP_STEPS = 4;
const BURN_WINDOW = 7;
const MAX_ORDERS = 3;
const START_ORDERS = [0, 1, 3];

function makePart(id, prep = 'raw') {
  return { id, prep };
}

function makeOrder(world, recipeIndex, patienceSeconds) {
  const recipe = RECIPES[recipeIndex];
  return {
    id: world.nextOrderId++,
    recipeIndex,
    patienceMax: patienceSeconds,
    patience: patienceSeconds,
    reward: recipe.price,
  };
}

function nextRecipe(world) {
  const used = new Set(world.state.orders.map((order) => order.recipeIndex));
  const choices = [];
  for (let index = 0; index < RECIPES.length; index += 1) if (!used.has(index)) choices.push(index);
  return choices.length === 0 ? Math.floor(world.random() * RECIPES.length) : choices[Math.floor(world.random() * choices.length)];
}

function resetOrder(state, order) {
  state.selectedOrder = Math.max(0, Math.min(order, state.orders.length - 1));
}

export function createWorld(random) {
  const world = {
    random,
    nextOrderId: 1,
    nextParticleId: 1,
    state: null,
    events: [],
  };

  function reset() {
    world.state = {
      screen: SCREEN_TITLE,
      elapsed: 0,
      timeLeft: SHIFT_SECONDS,
      score: 0,
      served: 0,
      missed: 0,
      combo: 0,
      bestCombo: 0,
      selectedOrder: 0,
      orders: [],
      hands: [],
      board: { parts: [], progress: 0 },
      burners: [
        { item: null, elapsed: 0, duration: 0, state: 'empty' },
        { item: null, elapsed: 0, duration: 0, state: 'empty' },
      ],
      plate: [],
      spawnTimer: 0.9,
      chops: 0,
      cooked: 0,
      perfect: 0,
      message: '',
      messageKind: 'info',
      messageTimer: 0,
      particles: [],
      finished: false,
    };
    for (const recipeIndex of START_ORDERS) {
      world.state.orders.push(makeOrder(world, recipeIndex, 58 + world.random() * 8));
    }
  }

  function say(text, kind = 'info') {
    const state = world.state;
    state.message = text;
    state.messageKind = kind;
    state.messageTimer = 2.8;
  }

  function emit(name) {
    world.events.push(name);
  }

  function spawnParticles(x, y, color, count, spread = 90) {
    for (let index = 0; index < count; index += 1) {
      const angle = world.random() * Math.PI * 2;
      const speed = 18 + world.random() * spread;
      world.state.particles.push({
        id: world.nextParticleId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 18,
        life: 0.7 + world.random() * 0.5,
        maxLife: 1,
        size: 2 + world.random() * 3,
        color,
      });
    }
  }

  function floatText(x, y, text, color = '#18181b') {
    world.state.particles.push({ id: world.nextParticleId++, x, y, vx: 0, vy: -24, life: 1.25, maxLife: 1.25, size: 18, color, text });
  }

  function start() {
    reset();
    world.state.screen = SCREEN_PLAY;
    world.state.spawnTimer = 0.9;
    say('Shift started. Pick a ticket and build the route.', 'good');
    emit('start');
  }

  function togglePause() {
    const state = world.state;
    if (state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      say('Paused.', 'info');
      emit('pause');
    } else if (state.screen === SCREEN_PAUSED) {
      state.screen = SCREEN_PLAY;
      say('Back to service.', 'info');
      emit('resume');
    }
  }

  function selectOrder(index) {
    const state = world.state;
    if (index < 0 || index >= state.orders.length) return;
    if (state.selectedOrder !== index) {
      state.selectedOrder = index;
      emit('select');
    }
  }

  function cycleOrder(direction) {
    const state = world.state;
    if (state.orders.length === 0) return;
    selectOrder((state.selectedOrder + direction + state.orders.length) % state.orders.length);
  }

  function addIngredient(id) {
    const state = world.state;
    if (state.screen !== SCREEN_PLAY) return false;
    if (state.hands.length >= 2) {
      say('Hands are full — take them to a station.', 'warn');
      emit('fail');
      return false;
    }
    const ingredient = INGREDIENT_MAP[id];
    if (!ingredient) return false;
    state.hands.push(makePart(id));
    say(`${ingredient.name} picked.`, 'info');
    emit('pick');
    return true;
  }

  function loadBoard() {
    const state = world.state;
    if (state.board.parts.length > 0 || state.hands.length === 0) return false;
    const parts = [];
    const kept = [];
    for (const part of state.hands) {
      if (parts.length < 2 && INGREDIENT_MAP[part.id].chop && part.prep === 'raw') parts.push(part);
      else kept.push(part);
    }
    state.hands = kept;
    if (parts.length === 0) {
      say('Only raw produce can be chopped.', 'warn');
      emit('fail');
      return false;
    }
    state.board.parts = parts;
    state.board.progress = 0;
    emit('place');
    return true;
  }

  function chop() {
    const state = world.state;
    if (state.board.parts.length === 0) return false;
    if (state.board.parts.every((part) => part.prep === 'chopped')) {
      const room = 2 - state.hands.length;
      if (room <= 0) {
        say('Hands are full — clear them before collecting the board.', 'warn');
        emit('fail');
        return false;
      }
      for (let index = 0; index < room && state.board.parts.length > 0; index += 1) {
        state.hands.push(state.board.parts.shift());
      }
      state.board.progress = 0;
      say(state.board.parts.length > 0 ? 'Some chopped food remains on the board.' : 'Chopped and returned to your hands.', 'good');
      emit('done');
      return true;
    }
    state.board.progress += 1;
    state.chops += 1;
    emit('chop');
    spawnParticles(420, 350, '#d6a365', 5, 55);
    if (state.board.progress >= CHOP_STEPS) {
      for (const part of state.board.parts) part.prep = 'chopped';
      while (state.board.parts.length > 0 && state.hands.length < 2) {
        state.hands.push(state.board.parts.shift());
      }
      state.board.progress = 0;
      say('Chopped and returned to your hands.', 'good');
      emit('done');
    }
    return true;
  }

  function interactPrep() {
    const state = world.state;
    if (state.screen !== SCREEN_PLAY) return;
    if (state.board.parts.length > 0) chop();
    else loadBoard();
  }

  function interactBurner(index) {
    const state = world.state;
    if (state.screen !== SCREEN_PLAY) return;
    const burner = state.burners[index];
    if (!burner) return;
    if (burner.item) {
      if (burner.state === 'ready' || burner.state === 'burnt') {
        if (state.hands.length >= 2) {
          say('Hands are full.', 'warn');
          emit('fail');
          return;
        }
        const part = { ...burner.item };
        const wasBurnt = burner.state === 'burnt';
        part.prep = wasBurnt ? 'burnt' : part.prep === 'chopped' ? 'choppedCooked' : 'cooked';
        state.hands.push(part);
        if (!wasBurnt) {
          state.cooked += 1;
          state.perfect += 1;
        }
        burner.item = null;
        burner.elapsed = 0;
        burner.duration = 0;
        burner.state = 'empty';
        say(wasBurnt ? 'A burnt piece. Only the bin wants that.' : 'Taken off the heat.', wasBurnt ? 'warn' : 'good');
        emit(wasBurnt ? 'fail' : 'collect');
        return;
      }
      say('Still cooking — watch the ring.', 'info');
      emit('select');
      return;
    }
    if (state.hands.length === 0) {
      say('Pick an ingredient before using a burner.', 'warn');
      emit('fail');
      return;
    }
    const part = state.hands.shift();
    burner.item = { ...part };
    burner.duration = INGREDIENT_MAP[part.id].cook;
    burner.elapsed = 0;
    burner.state = 'cooking';
    say(`${INGREDIENT_MAP[part.id].name} is cooking.`, 'info');
    emit('stove');
  }

  function findPlateOrder() {
    const state = world.state;
    for (const order of state.orders) {
      if (sameComponents(state.plate, RECIPES[order.recipeIndex].components)) return order;
    }
    return null;
  }

  function interactPlate() {
    const state = world.state;
    if (state.screen !== SCREEN_PLAY) return;
    if (state.plate.length >= 3) {
      const order = findPlateOrder();
      if (order) serve();
      else {
        say('Plate is full — serve it or clear it.', 'warn');
        emit('fail');
      }
      return;
    }
    if (state.hands.length === 0) {
      say('The plate is waiting for prepared ingredients.', 'info');
      emit('select');
      return;
    }
    const room = 3 - state.plate.length;
    const moved = state.hands.splice(0, room);
    state.plate.push(...moved);
    emit('plate');
    const order = findPlateOrder();
    if (order) say(`${RECIPES[order.recipeIndex].name} is ready to serve.`, 'good');
  }

  function serve() {
    const state = world.state;
    if (state.screen !== SCREEN_PLAY) return;
    const order = findPlateOrder();
    if (!order) {
      say('No open ticket needs this plate.', 'warn');
      emit('fail');
      return;
    }
    const recipe = RECIPES[order.recipeIndex];
    const patienceShare = Math.max(0, order.patience / order.patienceMax);
    const comboBonus = Math.min(state.combo, 8) * 12;
    const earned = Math.round(recipe.price * (0.7 + 0.6 * patienceShare)) + comboBonus;
    state.score += earned;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    floatText(612, 270, `+${earned}`, '#0f766e');
    spawnParticles(1114, 220, '#0f766e', 16, 80);
    say(`Served ${recipe.name}. Combo x${state.combo}.`, 'good');
    state.orders = state.orders.filter((ticket) => ticket.id !== order.id);
    state.plate = [];
    state.selectedOrder = 0;
    state.spawnTimer = Math.min(state.spawnTimer, 1.1);
    emit('serve');
  }

  function discardHands() {
    const state = world.state;
    if (state.hands.length === 0) return;
    state.hands = [];
    emit('trash');
    say('Hands cleared.', 'info');
  }

  function clearPlate() {
    const state = world.state;
    if (state.plate.length === 0) return;
    state.plate = [];
    emit('trash');
    say('Plate cleared.', 'info');
  }

  function primaryAction() {
    const state = world.state;
    if (state.screen === SCREEN_TITLE || state.screen === SCREEN_OVER) {
      start();
      return;
    }
    if (state.screen !== SCREEN_PLAY) return;
    if (state.board.parts.length > 0) {
      chop();
      return;
    }
    const readyIndex = state.burners.findIndex((burner) => burner.state === 'ready');
    if (readyIndex !== -1) {
      interactBurner(readyIndex);
      return;
    }
    if (state.plate.length > 0) {
      serve();
      return;
    }
    say('Pick an ingredient crate below.', 'info');
    emit('select');
  }

  function refreshSpawn(difficulty) {
    const state = world.state;
    while (state.orders.length < MAX_ORDERS) {
      const base = Math.max(43, 64 - difficulty * 1.1);
      const patience = base + world.random() * 9;
      state.orders.push(makeOrder(world, nextRecipe(world), patience));
    }
    resetOrder(state, state.selectedOrder);
  }

  function finish() {
    const state = world.state;
    state.screen = SCREEN_OVER;
    state.finished = true;
    emit('over');
  }

  function step(dt) {
    const state = world.state;
    if (state.screen !== SCREEN_PLAY) return;
    state.elapsed += dt;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    if (state.messageTimer > 0) state.messageTimer = Math.max(0, state.messageTimer - dt);

    for (const order of state.orders) order.patience -= dt;
    const expired = state.orders.filter((order) => order.patience <= 0);
    for (const order of expired) {
      state.missed += 1;
      state.combo = 0;
      state.score = Math.max(0, state.score - 40);
      floatText(162, 260, '−40', '#dc2626');
      say(`${RECIPES[order.recipeIndex].name} timed out. Combo reset.`, 'bad');
      emit('expire');
    }
    if (expired.length > 0) {
      const ids = new Set(expired.map((order) => order.id));
      state.orders = state.orders.filter((order) => !ids.has(order.id));
      state.selectedOrder = 0;
    }

    for (let index = 0; index < state.burners.length; index += 1) {
      const burner = state.burners[index];
      if (!burner.item || burner.state === 'empty' || burner.state === 'burnt') continue;
      burner.elapsed += dt;
      if (burner.state === 'cooking' && burner.elapsed >= burner.duration) {
        burner.state = 'ready';
        emit('ready');
        spawnParticles(600 + index * 120, 320, '#ffffff', 6, 35);
      } else if (burner.state === 'ready' && burner.elapsed >= burner.duration + BURN_WINDOW) {
        burner.state = 'burnt';
        emit('burn');
        say('A burner burned. Clear it before starting another dish.', 'bad');
      }
    }

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      state.spawnTimer = 2.4;
      refreshSpawn(state.served + state.elapsed / 55);
    }

    for (const particle of state.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 22 * dt;
    }
    state.particles = state.particles.filter((particle) => particle.life > 0);

    if (state.timeLeft <= 0) finish();
  }

  reset();
  return {
    get state() { return world.state; },
    reset,
    start,
    togglePause,
    selectOrder,
    cycleOrder,
    addIngredient,
    interactPrep,
    interactBurner,
    interactPlate,
    serve,
    discardHands,
    clearPlate,
    primaryAction,
    step,
    takeEvents() {
      const taken = world.events;
      world.events = [];
      return taken;
    },
    // A scene helper can reach these without duplicating rule data.
    addPartToHands: addIngredient,
    makePart,
  };
}
