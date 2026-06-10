/**
 * Lightweight sound effects via the Web Audio API.
 * No audio files — every effect is synthesized, so it stays zero-asset.
 * Muting is persisted in localStorage.
 */
(function () {
  const STORAGE_KEY = 'quoridor-muted';
  let muted = localStorage.getItem(STORAGE_KEY) === '1';
  let ctx = null;

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    // Browsers suspend the context until a user gesture resumes it.
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /**
   * Plays a short tone.
   * @param {number} freq - frequency in Hz
   * @param {number} duration - seconds
   * @param {OscillatorType} type
   * @param {number} gain - peak volume (0–1)
   */
  function tone(freq, duration, type = 'sine', gain = 0.15) {
    const audio = ensureContext();
    if (!audio) return;

    const osc = audio.createOscillator();
    const env = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    const now = audio.currentTime;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(gain, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(env).connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  const SOUNDS = {
    move: () => tone(440, 0.09, 'sine', 0.12),
    wall: () => tone(150, 0.14, 'square', 0.1),
    invalid: () => tone(110, 0.18, 'sawtooth', 0.08),
    win: () => {
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => tone(f, 0.18, 'triangle', 0.16), i * 110);
      });
    },
  };

  function play(name) {
    if (muted) return;
    const fn = SOUNDS[name];
    if (fn) fn();
  }

  function isMuted() {
    return muted;
  }

  function toggleMute() {
    muted = !muted;
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    return muted;
  }

  window.QuoridorSound = { play, isMuted, toggleMute };
})();
