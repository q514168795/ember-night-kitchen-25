// SPDX-License-Identifier: MIT
// Small WebAudio blips generated in code: no audio files, no external assets.

const TONES = {
  pick: [520, 0.05, 'triangle', 0.025],
  place: [360, 0.07, 'sine', 0.035],
  chop: [210, 0.045, 'square', 0.025],
  done: [660, 0.09, 'triangle', 0.035],
  stove: [180, 0.12, 'sawtooth', 0.02],
  ready: [720, 0.1, 'sine', 0.04],
  collect: [580, 0.07, 'triangle', 0.035],
  plate: [430, 0.06, 'sine', 0.03],
  serve: [520, 0.1, 'triangle', 0.04],
  expire: [180, 0.18, 'sawtooth', 0.028],
  fail: [150, 0.08, 'square', 0.02],
  select: [330, 0.035, 'sine', 0.018],
  start: [440, 0.09, 'triangle', 0.03],
  trash: [170, 0.07, 'square', 0.018],
  pause: [270, 0.08, 'sine', 0.025],
  resume: [480, 0.07, 'sine', 0.03],
  burn: [130, 0.22, 'sawtooth', 0.03],
  over: [220, 0.3, 'triangle', 0.035],
};

export function createAudio() {
  let context = null;
  let enabled = true;

  function ensure() {
    if (!context) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (AudioContext) context = new AudioContext();
    }
    if (context && context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function play(name) {
    if (!enabled) return;
    const tone = TONES[name];
    if (!tone) return;
    const active = ensure();
    if (!active) return;
    const [frequency, duration, type, gainValue] = tone;
    const now = active.currentTime;
    const oscillator = active.createOscillator();
    const gain = active.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, frequency * (name === 'expire' ? 0.7 : 1.2)), now + duration);
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(active.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  return {
    unlock: ensure,
    play,
    toggle() {
      enabled = !enabled;
      if (enabled) play('select');
      return enabled;
    },
    get enabled() { return enabled; },
  };
}
