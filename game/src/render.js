// SPDX-License-Identifier: MIT
// All drawing for Ember Night Kitchen: one fixed 1280 x 720 stage scaled to the window.
import { COLOR, FONT, HIT, INGREDIENT_MAP, PREP_LABEL, WORLD } from './config.js';
import { RECIPES, describeComponent, sameComponents } from './recipes.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

const OUT = { x: 312, y: 76, width: 640, height: 500 };
const TICKETS = { x: 16, y: 76, width: 284, height: 500 };
const PLATING = { x: 968, y: 76, width: 296, height: 500 };

function roundRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function fillRound(context, x, y, width, height, radius, color) {
  context.fillStyle = color;
  roundRect(context, x, y, width, height, radius);
  context.fill();
}

function strokeRound(context, x, y, width, height, radius, color, lineWidth = 1) {
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  roundRect(context, x, y, width, height, radius);
  context.stroke();
}

function text(context, value, x, y, size, color, align = 'left', weight = 500, baseline = 'alphabetic') {
  context.font = `${weight} ${size}px ${FONT}`;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = baseline;
  context.fillText(value, x, y);
}

function drawIcon(context, id, x, y, size, prep = 'raw') {
  const item = INGREDIENT_MAP[id];
  if (!item) return;
  context.save();
  context.translate(x, y);
  context.scale(size / 48, size / 48);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  if (id === 'noodles') {
    context.fillStyle = '#f5c65c';
    context.beginPath();
    context.ellipse(24, 28, 19, 11, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = '#b97d1d';
    context.lineWidth = 2.2;
    for (let row = -1; row <= 1; row += 1) {
      context.beginPath();
      context.moveTo(9, 25 + row * 4);
      context.bezierCurveTo(17, 20 + row * 5, 30, 30 + row * 2, 39, 24 + row * 4);
      context.stroke();
    }
    context.strokeStyle = '#7d5614';
    context.beginPath(); context.moveTo(34, 6); context.lineTo(42, -2); context.stroke();
  } else if (id === 'broth') {
    context.fillStyle = '#c88348';
    context.beginPath(); context.ellipse(24, 28, 20, 12, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#e1a35d';
    context.beginPath(); context.ellipse(24, 24, 16, 7, 0, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#fff1d5'; context.lineWidth = 2;
    context.beginPath(); context.moveTo(16, 22); context.quadraticCurveTo(20, 19, 24, 22); context.stroke();
    context.beginPath(); context.moveTo(24, 22); context.quadraticCurveTo(28, 19, 32, 22); context.stroke();
  } else if (id === 'rice') {
    context.fillStyle = '#f8fafc';
    context.strokeStyle = '#b9bec6'; context.lineWidth = 2;
    context.beginPath(); context.ellipse(24, 28, 20, 12, 0, 0, Math.PI * 2); context.fill(); context.stroke();
    context.fillStyle = '#ffffff';
    for (const [dx, dy] of [[-10, 0], [-2, -3], [6, 1], [12, -3], [1, 5], [-13, 5], [20, 5]]) {
      context.beginPath(); context.ellipse(24 + dx, 24 + dy, 3, 1.8, 0, 0, Math.PI * 2); context.fill();
    }
  } else if (id === 'mushroom') {
    context.fillStyle = '#efe0cf';
    roundRect(context, 18, 22, 12, 17, 4);
    context.fill();
    context.fillStyle = '#a97a62';
    context.beginPath(); context.arc(24, 24, 17, Math.PI, 0); context.closePath(); context.fill();
    context.strokeStyle = '#795548'; context.lineWidth = 2; context.stroke();
    context.fillStyle = '#efd3c0';
    context.beginPath(); context.arc(17, 17, 2.4, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(31, 14, 2.1, 0, Math.PI * 2); context.fill();
  } else if (id === 'pepper') {
    context.fillStyle = '#ef6a5b';
    context.beginPath();
    context.moveTo(24, 12);
    context.bezierCurveTo(6, 14, 7, 35, 15, 40);
    context.bezierCurveTo(20, 44, 28, 44, 33, 40);
    context.bezierCurveTo(41, 35, 42, 14, 24, 12);
    context.closePath(); context.fill();
    context.strokeStyle = '#b93b31'; context.lineWidth = 2;
    context.beginPath(); context.moveTo(24, 13); context.quadraticCurveTo(20, 27, 19, 39); context.stroke();
    context.beginPath(); context.moveTo(24, 13); context.quadraticCurveTo(28, 27, 29, 39); context.stroke();
    context.fillStyle = '#54a57c'; context.fillRect(20, 6, 8, 9);
  } else if (id === 'tofu') {
    context.fillStyle = '#f5e7c6';
    context.strokeStyle = '#b8a068'; context.lineWidth = 2;
    roundRect(context, 9, 19, 18, 18, 4); context.fill(); context.stroke();
    roundRect(context, 21, 11, 18, 18, 4); context.fill(); context.stroke();
    context.fillStyle = '#fffaf0'; context.fillRect(13, 23, 8, 6);
    context.fillStyle = '#fff8df'; context.fillRect(25, 15, 8, 6);
  } else if (id === 'herbs') {
    context.strokeStyle = '#246b4c'; context.lineWidth = 2.4;
    context.beginPath(); context.moveTo(24, 38); context.quadraticCurveTo(23, 28, 24, 12); context.stroke();
    context.fillStyle = '#54a57c';
    for (const [x, y, angle] of [[17, 22, -0.5], [31, 18, 0.5], [21, 33, -0.9], [29, 30, 0.9]]) {
      context.save(); context.translate(x, y); context.rotate(angle);
      context.beginPath(); context.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2); context.fill(); context.restore();
    }
  } else if (id === 'bun') {
    context.fillStyle = '#efe3cf';
    context.strokeStyle = '#a98e65'; context.lineWidth = 2;
    context.beginPath(); context.arc(24, 29, 17, Math.PI, 0); context.closePath(); context.fill(); context.stroke();
    context.beginPath(); context.moveTo(8, 29); context.lineTo(40, 29); context.stroke();
    context.strokeStyle = '#cbb48d'; context.lineWidth = 1.7;
    context.beginPath(); context.moveTo(18, 16); context.quadraticCurveTo(21, 21, 20, 27); context.stroke();
    context.beginPath(); context.moveTo(29, 16); context.quadraticCurveTo(28, 21, 30, 27); context.stroke();
  }

  if (prep === 'chopped' || prep === 'choppedCooked') {
    context.globalAlpha = 0.9;
    context.fillStyle = id === 'mushroom' ? '#d7b49d' : id === 'pepper' ? '#ff9386' : id === 'tofu' ? '#fffaf0' : '#8dc9a6';
    for (let index = 0; index < 4; index += 1) {
      context.beginPath();
      context.arc(12 + index * 8, 39, 2.2, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }
  if (prep === 'burnt') {
    context.globalAlpha = 0.62;
    context.fillStyle = '#27272a';
    context.beginPath(); context.ellipse(24, 26, 19, 15, 0, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 1;
    context.strokeStyle = '#f97316'; context.lineWidth = 1.6;
    context.beginPath(); context.moveTo(13, 19); context.lineTo(35, 33); context.stroke();
    context.beginPath(); context.moveTo(15, 33); context.lineTo(34, 20); context.stroke();
  }
  if (prep === 'cooked' || prep === 'choppedCooked') {
    context.globalAlpha = prep === 'choppedCooked' ? 0.28 : 0.16;
    context.fillStyle = '#3a2a1d';
    context.beginPath(); context.ellipse(24, 26, 19, 14, 0, 0, Math.PI * 2); context.fill();
    context.globalAlpha = 1;
    if (prep === 'choppedCooked') {
      context.strokeStyle = '#e77a24'; context.lineWidth = 2;
      context.beginPath(); context.moveTo(11, 23); context.lineTo(37, 23); context.stroke();
    }
  }
  context.restore();
  void item;
}

function drawSteam(context, x, y, seed, alpha = 0.7) {
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = '#ffffff';
  context.lineWidth = 3;
  for (let line = 0; line < 2; line += 1) {
    const shift = line * 7;
    context.beginPath();
    context.moveTo(x - 5 + shift, y);
    context.bezierCurveTo(x - 10 + shift, y - 9, x + shift + 2 * Math.sin(seed + line), y - 16, x - 3 + shift, y - 24);
    context.stroke();
  }
  context.restore();
}

function drawProgress(context, x, y, width, value, color = COLOR.teal) {
  fillRound(context, x, y, width, 6, 3, '#e7e7ea');
  if (value > 0) fillRound(context, x, y, Math.max(6, width * Math.min(1, value)), 6, 3, color);
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  let hover = null;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    view.scale = Math.min(canvas.width / WORLD.width, canvas.height / WORLD.height);
    view.x = (canvas.width - WORLD.width * view.scale) / 2;
    view.y = (canvas.height - WORLD.height * view.scale) / 2;
  }

  function pointInside(rect, point) {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  function drawHeader(state, best) {
    fillRound(context, 16, 12, 1248, 52, 10, COLOR.card);
    strokeRound(context, 16, 12, 1248, 52, 10, COLOR.line);
    fillRound(context, 34, 25, 26, 26, 6, COLOR.black);
    text(context, 'E', 47, 43, 17, '#f5f5f6', 'center', 800);
    text(context, 'EMBER', 70, 42, 19, COLOR.ink, 'left', 800);
    text(context, '/ NIGHT KITCHEN', 134, 42, 12, COLOR.muted, 'left', 600);

    const lowTime = state.timeLeft <= 30;
    fillRound(context, 500, 20, 280, 36, 8, lowTime ? '#fff7ed' : COLOR.subtle);
    strokeRound(context, 500, 20, 280, 36, 8, lowTime ? COLOR.amberSoft : COLOR.line);
    const minutes = Math.floor(state.timeLeft / 60);
    const seconds = Math.floor(state.timeLeft % 60);
    text(context, `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, 640, 45, 22, lowTime ? COLOR.amber : COLOR.ink, 'center', 750);
    text(context, 'SHIFT', 710, 34, 10, COLOR.faint, 'left', 700);
    text(context, 'TIME', 710, 46, 10, COLOR.faint, 'left', 700);

    text(context, String(state.score).padStart(4, '0'), 1150, 44, 26, COLOR.ink, 'right', 800);
    text(context, 'SCORE', 1238, 25, 10, COLOR.faint, 'right', 700);
    if (state.combo > 1) {
      fillRound(context, 852, 22, 72, 32, 7, '#ccfbf1');
      text(context, String(state.combo).padStart(2, '0'), 888, 44, 17, COLOR.teal, 'center', 800);
      text(context, 'COMBO', 888, 56, 8, COLOR.teal, 'center', 800);
    }
    void best;
  }

  function drawTickets(state) {
    fillRound(context, TICKETS.x, TICKETS.y, TICKETS.width, TICKETS.height, 12, COLOR.card);
    strokeRound(context, TICKETS.x, TICKETS.y, TICKETS.width, TICKETS.height, 12, COLOR.line);
    text(context, 'ORDER BOARD', 32, 102, 13, COLOR.muted, 'left', 800);
    text(context, `SERVED ${String(state.served).padStart(2, '0')} / 08`, 284, 102, 12, COLOR.faint, 'right', 700);
    for (let index = 0; index < HIT.orderCards.length; index += 1) {
      const card = HIT.orderCards[index];
      const order = state.orders[index];
      const selected = state.selectedOrder === index;
      if (!order) {
        fillRound(context, card.x, card.y, card.width, card.height, 10, COLOR.subtle);
        strokeRound(context, card.x, card.y, card.width, card.height, 10, COLOR.line, selected ? 2 : 1);
        text(context, 'WAITING FOR ORDER', card.x + card.width / 2, card.y + 62, 12, COLOR.faint, 'center', 600);
        continue;
      }
      const recipe = RECIPES[order.recipeIndex];
      fillRound(context, card.x, card.y, card.width, card.height, 10, selected ? '#fffaf3' : COLOR.card);
      strokeRound(context, card.x, card.y, card.width, card.height, 10, selected ? recipe.color : COLOR.line, selected ? 2 : 1);
      if (selected) fillRound(context, card.x + 10, card.y + 12, 4, card.height - 24, 2, recipe.color);
      text(context, `${String(order.id).padStart(2, '0')}`, card.x + 22, card.y + 32, 14, COLOR.faint, 'left', 800);
      text(context, recipe.name, card.x + 50, card.y + 32, 15, COLOR.ink, 'left', 750);
      text(context, `$${recipe.price}`, card.x + 244, card.y + 32, 14, recipe.color, 'right', 800);
      drawProgress(context, card.x + 20, card.y + 48, 228, order.patience / order.patienceMax, order.patience < 12 ? COLOR.red : order.patience < 25 ? COLOR.amber : '#7fc7a6');
      for (let partIndex = 0; partIndex < recipe.components.length; partIndex += 1) {
        const part = recipe.components[partIndex];
        const px = card.x + 24 + partIndex * 78;
        drawIcon(context, part.id, px, card.y + 66, 28, part.prep);
        text(context, PREP_LABEL[part.prep], px + 16, card.y + 112, 9, COLOR.muted, 'center', 700);
      }
      if (selected) text(context, 'PINNED', card.x + 244, card.y + 60, 9, recipe.color, 'right', 800);
    }
    fillRound(context, 28, 544, 268, 28, 7, state.messageKind === 'bad' ? '#fef2f2' : state.messageKind === 'good' ? '#ecfdf5' : COLOR.subtle);
    text(context, state.message || 'Ready.', 162, 562, 11, state.messageKind === 'bad' ? COLOR.red : state.messageKind === 'good' ? COLOR.teal : COLOR.muted, 'center', 600);
  }

  function drawKitchenBackdrop(state) {
    fillRound(context, OUT.x, OUT.y, OUT.width, OUT.height, 12, COLOR.card);
    strokeRound(context, OUT.x, OUT.y, OUT.width, OUT.height, 12, COLOR.line);
    context.save();
    roundRect(context, OUT.x + 8, OUT.y + 8, OUT.width - 16, OUT.height - 16, 9);
    context.clip();
    context.fillStyle = '#e9e9eb';
    context.fillRect(OUT.x, OUT.y, OUT.width, OUT.height);
    context.strokeStyle = 'rgba(255,255,255,0.75)';
    context.lineWidth = 1;
    for (let x = OUT.x + 34; x < OUT.x + OUT.width; x += 34) {
      context.beginPath(); context.moveTo(x, OUT.y); context.lineTo(x, OUT.y + 205); context.stroke();
    }
    for (let y = OUT.y + 34; y < OUT.y + 210; y += 34) {
      context.beginPath(); context.moveTo(OUT.x, y); context.lineTo(OUT.x + OUT.width, y); context.stroke();
    }
    fillRound(context, 580, 104, 200, 112, 10, COLOR.night);
    strokeRound(context, 580, 104, 200, 112, 10, '#3f3f46', 3);
    context.fillStyle = '#f7ead2';
    context.beginPath(); context.arc(654, 148, 20, 0, Math.PI * 2); context.fill();
    context.fillStyle = COLOR.night;
    context.beginPath(); context.arc(662, 142, 17, 0, Math.PI * 2); context.fill();
    for (const starX of [610, 690, 705, 626]) {
      context.fillStyle = '#d4d4d8';
      context.fillRect(starX, 134, 2, 2);
    }
    // Shelf with hand-drawn jars.
    fillRound(context, 336, 132, 218, 10, 3, '#b8b8bd');
    for (let jar = 0; jar < 4; jar += 1) {
      const x = 352 + jar * 50;
      context.fillStyle = ['#f2c14e', '#d9a066', '#8dc9a6', '#efe3cf'][jar];
      roundRect(context, x, 96 + (jar % 2) * 3, 25, 36 - (jar % 2) * 3, 4);
      context.fill();
      context.fillStyle = '#71717a'; context.fillRect(x + 2, 92 + (jar % 2) * 3, 21, 5);
    }
    // Small chef above the pass: a complete figure, not a floating head.
    context.fillStyle = '#f0c9a8';
    context.beginPath(); context.arc(872, 156, 17, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#fafafa';
    roundRect(context, 852, 126, 40, 20, 8); context.fill();
    context.strokeStyle = COLOR.line; context.lineWidth = 1; context.stroke();
    context.fillStyle = COLOR.ink;
    context.beginPath(); context.arc(865, 158, 2, 0, Math.PI * 2); context.fill();
    context.beginPath(); context.arc(879, 158, 2, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#b08060'; context.lineWidth = 1.5;
    context.beginPath(); context.arc(872, 164, 5, 0.1, Math.PI - 0.1); context.stroke();
    context.fillStyle = '#fafafa'; roundRect(context, 847, 176, 50, 56, 10); context.fill();
    context.strokeStyle = COLOR.line; context.stroke();
    context.fillStyle = '#d4d4d8'; roundRect(context, 863, 184, 18, 10, 3); context.fill();
    context.fillStyle = COLOR.black; roundRect(context, 858, 204, 28, 8, 3); context.fill();
    text(context, 'PASS', 872, 228, 8, COLOR.muted, 'center', 800);

    // Counter line.
    fillRound(context, 326, 472, 612, 8, 4, '#d4d4d8');
    text(context, 'ROUTE', 326, 528, 10, COLOR.faint, 'left', 800);
    const steps = ['PICK', 'PREP', 'COOK', 'PLATE', 'SERVE'];
    for (let index = 0; index < steps.length; index += 1) {
      const x = 378 + index * 108;
      fillRound(context, x, 514, 72, 22, 6, index === 2 ? '#fff7ed' : COLOR.subtle);
      text(context, steps[index], x + 36, 529, 11, index === 2 ? COLOR.amber : COLOR.muted, 'center', 700);
      if (index < steps.length - 1) {
        text(context, '→', x + 84, 529, 16, COLOR.faint, 'center', 700);
      }
    }
    context.restore();
    void state;
  }

  function drawStationBase(rect, title, keyName, hovered, accent = COLOR.black) {
    fillRound(context, rect.x, rect.y, rect.width, rect.height, 10, COLOR.card);
    strokeRound(context, rect.x, rect.y, rect.width, rect.height, 10, hovered ? accent : COLOR.line, hovered ? 2 : 1);
    text(context, title, rect.x + 14, rect.y + 24, 12, COLOR.muted, 'left', 800);
    fillRound(context, rect.x + rect.width - 30, rect.y + 10, 20, 18, 4, COLOR.subtle);
    text(context, keyName, rect.x + rect.width - 20, rect.y + 23, 10, COLOR.muted, 'center', 700);
  }

  function drawPrepStation(state) {
    const rect = HIT.prep;
    drawStationBase(rect, 'PREP BOARD', '1', hover?.kind === 'prep', COLOR.amber);
    fillRound(context, rect.x + 14, rect.y + 56, rect.width - 28, 100, 7, '#f1d6ac');
    strokeRound(context, rect.x + 14, rect.y + 56, rect.width - 28, 100, 7, '#c89d62');
    // Knife.
    context.save();
    context.translate(rect.x + 136, rect.y + 78); context.rotate(-0.55);
    fillRound(context, -34, -4, 56, 8, 4, '#e4e4e7');
    fillRound(context, 22, -4, 22, 8, 4, '#3f3f46');
    context.restore();
    if (state.board.parts.length === 0) {
      text(context, 'RAW PRODUCE', rect.x + 93, rect.y + 112, 10, '#9a7350', 'center', 700);
    } else {
      for (let index = 0; index < state.board.parts.length; index += 1) {
        drawIcon(context, state.board.parts[index].id, rect.x + 36 + index * 56, rect.y + 74, 40, state.board.parts[index].prep);
      }
      drawProgress(context, rect.x + 18, rect.y + 178, rect.width - 36, state.board.progress / 4, COLOR.amber);
      text(context, `${state.board.progress}/4 CHOPS`, rect.x + 93, rect.y + 204, 11, COLOR.muted, 'center', 700);
    }
  }

  function drawStove(state) {
    const rect = { x: 530, y: 230, width: 270, height: 250 };
    drawStationBase(rect, 'STOVETOP', '2·3', false, COLOR.red);
    fillRound(context, rect.x + 12, rect.y + 38, rect.width - 24, 172, 8, '#27272a');
    for (let index = 0; index < 2; index += 1) {
      const burner = state.burners[index];
      const hit = HIT.burner[index];
      const cx = hit.x + hit.width / 2;
      const cy = hit.y + hit.height / 2;
      fillRound(context, hit.x, hit.y, hit.width, hit.height, 10, hover?.kind === 'burner' && hover.index === index ? '#3f3f46' : '#303034');
      context.strokeStyle = '#18181b'; context.lineWidth = 4;
      context.beginPath(); context.arc(cx, cy, 34, 0, Math.PI * 2); context.stroke();
      if (burner.item && burner.state !== 'empty') {
        if (burner.state === 'cooking') {
          for (let flame = 0; flame < 7; flame += 1) {
            const angle = Math.PI * 2 * flame / 7;
            const flameHeight = 9 + Math.sin(state.elapsed * 13 + flame * 1.7) * 2.4;
            context.fillStyle = flame % 2 ? '#f59e0b' : '#f97316';
            context.beginPath();
            context.ellipse(cx + Math.cos(angle) * 21, cy + Math.sin(angle) * 21, 3.5, flameHeight, angle, 0, Math.PI * 2);
            context.fill();
          }
        }
        drawIcon(context, burner.item.id, cx - 22, cy - 22, 44, burner.item.prep);
        if (burner.state === 'ready') {
          context.strokeStyle = '#22c55e'; context.lineWidth = 3;
          context.beginPath(); context.arc(cx, cy, 40 + Math.sin(state.elapsed * 5) * 2, 0, Math.PI * 2); context.stroke();
          drawSteam(context, cx, cy - 24, state.elapsed * 2);
          text(context, 'READY', cx, hit.y - 4, 10, '#86efac', 'center', 800);
        } else if (burner.state === 'burnt') {
          context.globalAlpha = 0.5; context.fillStyle = '#171717';
          context.beginPath(); context.arc(cx, cy, 35, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1;
          text(context, 'BURNT', cx, hit.y - 4, 10, '#fca5a5', 'center', 800);
        } else {
          drawProgress(context, hit.x + 7, hit.y + 112, hit.width - 14, burner.elapsed / burner.duration, burner.elapsed / burner.duration > 0.78 ? COLOR.red : COLOR.amberSoft);
        }
      } else {
        text(context, `BURNER ${index + 1}`, cx, cy + 4, 10, '#71717a', 'center', 700);
      }
    }
    text(context, state.burners.some((burner) => burner.state === 'ready') ? 'CLICK A BURNER TO COLLECT' : 'ADD FROM YOUR HANDS', rect.x + 135, rect.y + 224, 10, '#a1a1aa', 'center', 700);
  }

  function drawPass(state, plateReady) {
    const rect = { x: 824, y: 248, width: 100, height: 226 };
    fillRound(context, rect.x, rect.y, rect.width, rect.height, 10, plateReady ? '#ecfdf5' : COLOR.card);
    strokeRound(context, rect.x, rect.y, rect.width, rect.height, 10, plateReady ? COLOR.teal : COLOR.line, plateReady ? 2 : 1);
    text(context, 'PASS', rect.x + 14, rect.y + 24, 11, COLOR.muted, 'left', 800);
    fillRound(context, rect.x + rect.width - 30, rect.y + 10, 20, 18, 4, COLOR.subtle);
    text(context, '4', rect.x + rect.width - 20, rect.y + 23, 10, COLOR.muted, 'center', 700);
    context.fillStyle = '#fafafa';
    context.beginPath(); context.arc(rect.x + 50, rect.y + 86, 31, 0, Math.PI * 2); context.fill();
    context.strokeStyle = plateReady ? COLOR.teal : '#d4d4d8'; context.lineWidth = 2; context.stroke();
    if (plateReady) {
      drawIcon(context, state.plate[0]?.id ?? 'noodles', rect.x + 34, rect.y + 70, 32, state.plate[0]?.prep ?? 'cooked');
      context.fillStyle = COLOR.teal;
      context.beginPath(); context.arc(rect.x + 68, rect.y + 104, 11, 0, Math.PI * 2); context.fill();
      text(context, '✓', rect.x + 68, rect.y + 108, 13, '#ffffff', 'center', 900);
      text(context, 'READY', rect.x + 50, rect.y + 144, 10, COLOR.teal, 'center', 800);
    } else {
      text(context, 'OPEN', rect.x + 50, rect.y + 144, 10, COLOR.faint, 'center', 800);
    }
    text(context, 'SERVE AT', rect.x + 50, rect.y + 178, 8, COLOR.faint, 'center', 700);
    text(context, 'THE PASS', rect.x + 50, rect.y + 190, 8, COLOR.faint, 'center', 700);
  }

  function drawPlating(state) {
    fillRound(context, PLATING.x, PLATING.y, PLATING.width, PLATING.height, 12, COLOR.card);
    strokeRound(context, PLATING.x, PLATING.y, PLATING.width, PLATING.height, 12, COLOR.line);
    text(context, 'PLATING', 990, 102, 13, COLOR.muted, 'left', 800);
    fillRound(context, 1220, 88, 20, 18, 4, COLOR.subtle);
    text(context, '5', 1230, 101, 10, COLOR.muted, 'center', 700);
    const order = state.orders[state.selectedOrder];
    if (!order) {
      text(context, 'No open tickets', 1116, 330, 18, COLOR.faint, 'center', 600);
      return;
    }
    const recipe = RECIPES[order.recipeIndex];
    text(context, recipe.name.toUpperCase(), 1116, 130, 11, recipe.color, 'center', 800);
    text(context, recipe.note, 1116, 150, 11, COLOR.faint, 'center', 500);

    const cx = 1116;
    const cy = 232;
    context.fillStyle = 'rgba(24,24,27,0.08)';
    context.beginPath(); context.ellipse(cx, cy + 74, 82, 13, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#fafafa';
    context.beginPath(); context.arc(cx, cy, 76, 0, Math.PI * 2); context.fill();
    context.strokeStyle = '#d4d4d8'; context.lineWidth = 3; context.stroke();
    context.fillStyle = '#ffffff';
    context.beginPath(); context.arc(cx, cy, 56, 0, Math.PI * 2); context.fill();
    const positions = [
      [cx - 27, cy - 20],
      [cx + 25, cy - 18],
      [cx, cy + 31],
    ];
    for (let index = 0; index < state.plate.length; index += 1) {
      const part = state.plate[index];
      drawIcon(context, part.id, positions[index][0] - 21, positions[index][1] - 21, 42, part.prep);
      if (part.prep === 'cooked' || part.prep === 'choppedCooked') drawSteam(context, positions[index][0], positions[index][1] - 18, index + state.elapsed);
    }

    for (let index = 0; index < recipe.components.length; index += 1) {
      const wanted = recipe.components[index];
      const have = state.plate.some((part) => part.id === wanted.id && part.prep === wanted.prep);
      const y = 338 + index * 31;
      fillRound(context, 990, y - 17, 248, 25, 6, have ? '#f0fdfa' : COLOR.subtle);
      drawIcon(context, wanted.id, 1000, y - 15, 22, wanted.prep);
      text(context, INGREDIENT_MAP[wanted.id].name, 1031, y + 1, 12, have ? COLOR.teal : COLOR.muted, 'left', 650);
      text(context, PREP_LABEL[wanted.prep], 1120, y + 1, 8, have ? COLOR.teal : COLOR.faint, 'left', 700);
      text(context, have ? '✓' : `${index + 1}`, 1220, y + 2, 14, have ? COLOR.teal : COLOR.faint, 'right', 800);
    }

    const ready = state.plate.length === 3 && state.orders.some((order) => sameComponents(state.plate, RECIPES[order.recipeIndex].components));
    fillRound(context, HIT.serve.x, HIT.serve.y, HIT.serve.width, HIT.serve.height, 8, ready ? COLOR.black : '#d4d4d8');
    text(context, ready ? 'SERVE TICKET' : 'TICKET NOT READY', 1114, HIT.serve.y + 32, 14, ready ? '#fafafa' : '#71717a', 'center', 800);
    fillRound(context, 1204, HIT.serve.y + 10, 34, 32, 5, ready ? '#3f3f46' : '#e4e4e7');
    strokeRound(context, 1204, HIT.serve.y + 10, 34, 32, 5, ready ? '#27272a' : '#d4d4d8');
    text(context, '↵', 1221, HIT.serve.y + 26, 14, ready ? '#ffffff' : '#a1a1aa', 'center', 700);
    text(context, 'ENTER', 1221, HIT.serve.y + 37, 6, ready ? '#d4d4d8' : '#a1a1aa', 'center', 800);

    text(context, 'HANDS', 990, 546, 10, COLOR.faint, 'left', 800);
    for (let index = 0; index < 2; index += 1) {
      const x = 990 + index * 126;
      fillRound(context, x, 552, 118, 20, 5, COLOR.subtle);
      if (state.hands[index]) {
        drawIcon(context, state.hands[index].id, x + 3, 541, 22, state.hands[index].prep);
        text(context, INGREDIENT_MAP[state.hands[index].id].name, x + 32, 566, 9, COLOR.muted, 'left', 650);
      } else {
        text(context, 'EMPTY', x + 59, 566, 8, '#cbcbd0', 'center', 700);
      }
    }
    void describeComponent;
  }

  function drawDock(state) {
    fillRound(context, 16, 590, 1248, 114, 12, COLOR.night);
    text(context, 'PANTRY', 32, 616, 10, '#a1a1aa', 'left', 800);
    for (let index = 0; index < HIT.crates.length; index += 1) {
      const crate = HIT.crates[index];
      const ingredient = INGREDIENT_MAP[Object.keys(INGREDIENT_MAP)[index]];
      const hovered = hover?.kind === 'crate' && hover.index === index;
      fillRound(context, crate.x, crate.y, crate.width, crate.height, 8, hovered ? '#3f3f46' : '#27272a');
      strokeRound(context, crate.x, crate.y, crate.width, crate.height, 8, hovered ? '#71717a' : '#3f3f46', hovered ? 2 : 1);
      drawIcon(context, ingredient.id, crate.x + 27, crate.y + 10, 35);
      text(context, ingredient.name.split(' ')[0], crate.x + 44, crate.y + 55, 10, '#f4f4f5', 'center', 700);
      fillRound(context, crate.x + crate.width - 20, crate.y + 8, 16, 16, 4, '#3f3f46');
      text(context, ingredient.key, crate.x + crate.width - 12, crate.y + 20, 10, '#d4d4d8', 'center', 800);
    }

    text(context, 'ACTIONS', 812, 616, 10, '#a1a1aa', 'left', 800);
    const actionButtons = [
      { rect: HIT.trash, label: 'CLEAR', key: 'BKSP', color: '#dc2626', kind: 'trash' },
      { rect: HIT.pause, label: state.screen === SCREEN_PAUSED ? 'RESUME' : 'PAUSE', key: 'P', color: '#d4d4d8', kind: 'pause' },
      { rect: HIT.sound, label: 'SOUND', key: 'M', color: '#d4d4d8', kind: 'sound' },
    ];
    for (const button of actionButtons) {
      const hovered = hover?.kind === button.kind;
      fillRound(context, button.rect.x, button.rect.y, button.rect.width, button.rect.height, 7, hovered ? '#3f3f46' : '#27272a');
      strokeRound(context, button.rect.x, button.rect.y, button.rect.width, button.rect.height, 7, '#3f3f46');
      text(context, button.label, button.rect.x + button.rect.width / 2, button.rect.y + 21, 9, '#f4f4f5', 'center', 700);
      text(context, button.key, button.rect.x + button.rect.width / 2, button.rect.y + 37, 8, '#a1a1aa', 'center', 700);
    }
    text(context, 'SPACE / CLICK: context action · 1–5 stations · Q–I ingredients', 812, 690, 10, '#a1a1aa', 'left', 500);
  }

  function drawParticles(state) {
    for (const particle of state.particles) {
      const alpha = Math.max(0, Math.min(1, particle.life));
      context.globalAlpha = alpha;
      if (particle.text) {
        context.font = `800 ${particle.size}px ${FONT}`;
        context.fillStyle = particle.color;
        context.textAlign = 'center';
        context.fillText(particle.text, particle.x, particle.y);
      } else {
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    }
  }

  function drawOverlay(state, best) {
    if (state.screen === SCREEN_PLAY) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = 'rgba(24,24,27,0.68)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    fillRound(context, 286, 150, 708, 420, 14, COLOR.night);
    strokeRound(context, 286, 150, 708, 420, 14, '#3f3f46', 2);
    text(context, 'E M B E R', 640, 224, 38, '#fafafa', 'center', 900);
    text(context, 'NIGHT KITCHEN', 640, 254, 15, '#a1a1aa', 'center', 500);
    const rules = state.screen === SCREEN_OVER
      ? [`Shift complete`, `Served ${state.served} · Missed ${state.missed}`, `Score ${state.score}`, `Best ${best}`, `Chops ${state.chops} · Perfect picks ${state.perfect}`]
      : state.screen === SCREEN_PAUSED
        ? ['Paused', 'The kitchen is holding your place.', '']
        : ['Four tickets, two burners, one sharp knife.', 'Plan a route: pick, chop, cook, plate, serve.', 'Mouse clicks everything; keys speed it up.'];
    for (let index = 0; index < rules.length; index += 1) {
      text(context, rules[index], 640, 320 + index * 30, index === 0 ? 22 : 16, index === 0 ? '#f4f4f5' : '#a1a1aa', 'center', index === 0 ? 750 : 500);
    }
    fillRound(context, 510, 452, 260, 52, 8, COLOR.card);
    text(context, state.screen === SCREEN_OVER ? 'RUN IT BACK  ↵' : state.screen === SCREEN_PAUSED ? 'RESUME  P' : 'START SERVICE  ␣', 640, 485, 16, COLOR.ink, 'center', 800);
    text(context, 'M mutes sound · 1 prep · 2/3 burners · 4 plate · 5 serve', 640, 540, 11, '#71717a', 'center', 500);
  }

  function draw(state, best) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = '#dedee1';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawHeader(state, best);
    drawTickets(state);
    drawKitchenBackdrop(state);
    drawPrepStation(state);
    drawStove(state);
    const matching = state.plate.length === 3 && state.orders.some((order) => sameComponents(state.plate, RECIPES[order.recipeIndex].components));
    drawPass(state, matching);
    drawPlating(state);
    drawDock(state);
    drawParticles(state);
    drawOverlay(state, best);
  }

  function logicalPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: ((event.clientX - rect.left) * scaleX - view.x) / view.scale,
      y: ((event.clientY - rect.top) * scaleY - view.y) / view.scale,
    };
  }

  resize();
  window.addEventListener('resize', resize);
  return {
    draw,
    setHover(point) { hover = point; },
    clearHover() { hover = null; },
    logicalPoint,
    resize,
  };
}
