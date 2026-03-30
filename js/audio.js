/* ═══════════════════════════════════════
   ECHOES OF AETHON — Audio Engine
   Procedural audio via Web Audio API.
   No external files needed.
   ════════════════════════════════════ */

var AC = null;

function gac() {
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    return AC;
  } catch (e) { return null; }
}

/**
 * Play a single oscillator tone.
 * @param {number} freq   - Frequency in Hz
 * @param {number} dur    - Duration in seconds
 * @param {string} type   - Oscillator type: sine | square | sawtooth | triangle
 * @param {number} vol    - Peak volume 0–1
 * @param {number} delay  - Start delay in seconds
 */
function tone(freq, dur, type, vol, delay) {
  type  = type  || 'sine';
  vol   = vol   || 0.1;
  delay = delay || 0;
  try {
    var a = gac(); if (!a) return;
    var o = a.createOscillator();
    var g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.type            = type;
    o.frequency.value = freq;
    var t = a.currentTime + delay;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t);
    o.stop(t + dur);
  } catch (e) {}
}

/* ── SOUND EFFECTS ──────────────────────── */

/** Generic UI click */
function sfxClick() {
  tone(320, 0.06, 'sine', 0.04);
}

/** Receiving damage / impact */
function sfxHit() {
  tone(140, 0.12, 'sawtooth', 0.09);
  tone(90,  0.15, 'square',   0.05);
}

/** Enemy hit by player */
function sfxHitEnemy() {
  tone(200, 0.10, 'sawtooth', 0.10);
  tone(130, 0.14, 'square',   0.04);
}

/** Magic / spell cast */
function sfxMagic() {
  tone(660, 0.10, 'sine', 0.08);
  tone(880, 0.08, 'sine', 0.06, 0.05);
}

/** Skill level up */
function sfxLvUp() {
  [523, 659, 784, 1047].forEach(function (f, i) {
    tone(f, 0.30, 'sine', 0.12, i * 0.13);
  });
  tone(1047, 0.50, 'sine', 0.10, 0.52);
}

/** Combat victory */
function sfxVic() {
  [392, 494, 587, 740].forEach(function (f, i) {
    tone(f, 0.30, 'sine', 0.10, i * 0.12);
  });
  tone(988, 0.50, 'sine', 0.10, 0.48);
}

/** Player death */
function sfxDeath() {
  [440, 330, 220, 110].forEach(function (f, i) {
    tone(f, 0.40, 'sawtooth', 0.06, i * 0.18);
  });
}

/** Open dialogue with NPC */
function sfxDlg() {
  tone(440, 0.10, 'sine', 0.05);
  tone(550, 0.12, 'sine', 0.04, 0.06);
}

/** Step / area transition */
function sfxStep() {
  tone(180, 0.08, 'sine', 0.03);
}

/** Quest discovered or completed */
function sfxQuest() {
  [523, 659, 880].forEach(function (f, i) {
    tone(f, 0.20, 'sine', 0.10, i * 0.10);
  });
}

/** Item obtained / pickup */
function sfxPickup() {
  tone(880, 0.08, 'sine', 0.07);
  tone(1100, 0.10, 'sine', 0.05, 0.06);
}

/** Spell learned from tome */
function sfxSpellLearn() {
  [440, 550, 660, 880, 1100].forEach(function (f, i) {
    tone(f, 0.20, 'sine', 0.08, i * 0.08);
  });
}
