/* ═══════════════════════════════════════
   ECHOES OF AETHON — Time System
   Passive day/night cycle.
   Every action advances the clock.
   Night makes enemies stronger, enforces
   rest through fatigue drain.
   ════════════════════════════════════ */

var TIME = {
  hour:         8,      /* 0–23 */
  day:          1,
  phase:        'day',  /* dawn | day | dusk | night */
  totalHours:   8       /* cumulative, for day tracking */
};

/* Hours each activity costs */
var TIME_COST = {
  explore:  2,
  combat:   3,
  travel:   1,
  rest:     8,
  dialogue: 0
};

/* ── ADVANCE ──────────────────────────── */

/**
 * Advance the clock by the cost of a given activity type.
 * @param {string} type - key from TIME_COST
 */
function advanceTime(type) {
  var cost = TIME_COST[type] !== undefined ? TIME_COST[type] : 1;
  if (cost === 0) return;

  var prevPhase = TIME.phase;
  TIME.totalHours += cost;
  TIME.hour        = TIME.totalHours % 24;
  TIME.day         = Math.floor(TIME.totalHours / 24) + 1;
  _updatePhase();

  /* Phase-change announcements */
  if (TIME.phase !== prevPhase) {
    var msgs = {
      dawn:  '🌅 Dawn breaks over Aethon.',
      day:   '☀️  Morning light returns.',
      dusk:  '🌆 Dusk — the ruins grow longer shadows.',
      night: '🌙 Night falls. Enemies grow bolder. Rest before deep night.'
    };
    if (msgs[TIME.phase]) addLog(msgs[TIME.phase], 'd');
  }

  /* Fatigue drain in deep night (22:00 – 05:00) */
  if (needsSleep() && P.hp > 20 && cost > 0) {
    var drain = cost * 2;
    P.hp = Math.max(20, P.hp - drain);
    addLog('You are exhausted. -' + drain + ' HP. Find somewhere to rest.', 'c');
  }
}

function _updatePhase() {
  var h = TIME.hour;
  if      (h >= 5  && h < 8)  TIME.phase = 'dawn';
  else if (h >= 8  && h < 17) TIME.phase = 'day';
  else if (h >= 17 && h < 20) TIME.phase = 'dusk';
  else                          TIME.phase = 'night';
}

/* ── QUERIES ──────────────────────────── */

function getTimeLabel() {
  var h = TIME.hour;
  if (h >= 5  && h < 8)  return 'Dawn';
  if (h >= 8  && h < 12) return 'Morning';
  if (h === 12)           return 'Midday';
  if (h > 12  && h < 17) return 'Afternoon';
  if (h >= 17 && h < 20) return 'Dusk';
  if (h >= 20)            return 'Evening';
  return 'Deep Night';
}

function getTimeIcon() {
  var icons = { dawn:'🌅', day:'☀️', dusk:'🌆', night:'🌙' };
  return icons[TIME.phase] || '☀️';
}

function getTimeColor() {
  var cols = { dawn:'#ffaa55', day:'#ffee88', dusk:'#ff8855', night:'#8899cc' };
  return cols[TIME.phase] || '#ffee88';
}

function isNight()    { return TIME.phase === 'night'; }
function needsSleep() { return TIME.hour >= 22 || TIME.hour < 5; }

/**
 * Night modifier for enemy attack — slightly stronger at night.
 */
function nightAtkBonus() { return isNight() ? 3 : 0; }

/**
 * Some areas spawn bonus night enemies on top of normal ones.
 */
var NIGHT_BONUS = {
  verath_market:   'arena_ghost',
  verath_columns:  'arena_ghost',
  wilderness_road: 'arena_ghost',
  arena_approach:  'gladiator_shade',
  piers_shore:     'sea_revenant',
  ashwood_edge:    'shadow_hound'
};

function getNightEnemy(areaId) {
  return isNight() ? (NIGHT_BONUS[areaId] || null) : null;
}

/**
 * Ambient description suffix based on time of day.
 * Appended to area descriptions.
 */
function getTimeAmb() {
  switch (TIME.phase) {
    case 'dawn':  return 'The sky is pale. Morning has not quite decided to begin.';
    case 'day':   return 'Daylight falls across old stone.';
    case 'dusk':  return 'Long shadows move across the ruins.';
    case 'night': return 'Darkness presses against the edges of your vision. Things move in it.';
  }
  return '';
}