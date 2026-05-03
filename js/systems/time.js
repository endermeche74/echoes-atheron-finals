/* ═══════════════════════════════════════
   ECHOES OF AETHON — Time System
   Day = 06:00 – 21:00 (15 hours)
   Dusk = 21:00 – 23:00
   Night = 23:00 – 05:00
   Dawn = 05:00 – 06:00

   Action costs (in hours):
     travel  = 0   (free — just walking)
     explore = 1   (search an area)
     combat  = 1   (a fight)
     rest    = 5   (a proper rest)
   → Roughly 15 explore/combat actions
     before dusk arrives.
   ════════════════════════════════════ */

var TIME = {
  hour:       8,
  day:        1,
  phase:      'day',
  totalHours: 8
};

var TIME_COST = {
  travel:  0,
  explore: 1,
  combat:  1,
  rest:    5,
  dialogue:0
};

/* ── ADVANCE ──────────────────────── */
function advanceTime(type) {
  var cost = TIME_COST[type] !== undefined ? TIME_COST[type] : 1;
  if (cost === 0) return;

  var prevPhase = TIME.phase;
  TIME.totalHours += cost;
  TIME.hour  = TIME.totalHours % 24;
  TIME.day   = Math.floor(TIME.totalHours / 24) + 1;
  _updatePhase();

  /* Announce phase changes */
  if (TIME.phase !== prevPhase) {
    var msgs = {
      dawn:  '🌅 Dawn breaks over Aethon.',
      day:   '☀️  Morning light returns.',
      dusk:  '🌆 Dusk — the ruins grow longer shadows.',
      night: '🌙 Night falls. Enemies grow bolder. Rest when you can.'
    };
    if (msgs[TIME.phase]) addLog(msgs[TIME.phase], 'd');
  }

  /* Passive regen for L'Enveloppé (+2 HP every 3 hours) */
  if (typeof P !== 'undefined' && P.passives && P.passives.regen_passive) {
    if (TIME.totalHours % 3 === 0) {
      var regen = 2;
      P.hp = Math.min(P.maxHp, P.hp + regen);
      addLog('+' + regen + ' HP (régénération)', 'h');
    }
  }

  /* Fatigue: only drains in deepest night (01:00 – 04:00) */
  if (_isDeepNight() && P.hp > 20) {
    var drain = cost * 3;
    P.hp = Math.max(20, P.hp - drain);
    addLog('You are exhausted (-' + drain + ' HP). You need to rest.', 'c');
  }
}

function _updatePhase() {
  var h = TIME.hour;
  if      (h >= 5  && h < 6)  TIME.phase = 'dawn';
  else if (h >= 6  && h < 21) TIME.phase = 'day';
  else if (h >= 21 && h < 23) TIME.phase = 'dusk';
  else                          TIME.phase = 'night';
}

function _isDeepNight() {
  return TIME.hour >= 1 && TIME.hour < 5;
}

/* ── QUERIES ──────────────────────── */
function getTimeLabel() {
  var h = TIME.hour;
  if (h >= 5  && h < 6)  return 'Dawn';
  if (h >= 6  && h < 12) return 'Morning';
  if (h === 12)           return 'Midday';
  if (h > 12  && h < 17) return 'Afternoon';
  if (h >= 17 && h < 21) return 'Evening';
  if (h >= 21 && h < 23) return 'Dusk';
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
function needsSleep() { return _isDeepNight(); }
function nightAtkBonus() { return isNight() ? 2 : 0; }

var NIGHT_BONUS = {
  verath_market:  'arena_ghost',
  verath_columns: 'arena_ghost',
  wilderness_road:'arena_ghost',
  arena_approach: 'gladiator_shade',
  piers_shore:    'sea_revenant',
  ashwood_edge:   'shadow_hound'
};

function getNightEnemy(areaId) {
  var hasNightVision = typeof P !== 'undefined' && P.passives && P.passives.night_vision;
  return (isNight() || hasNightVision) ? (NIGHT_BONUS[areaId] || null) : null;
}

function getTimeAmb() {
  switch (TIME.phase) {
    case 'dawn':  return 'The sky is pale. Morning has not quite decided to begin.';
    case 'day':   return 'Daylight falls across old stone.';
    case 'dusk':  return 'Long shadows stretch across the ruins.';
    case 'night': return 'Darkness presses against the edges of your vision.';
  }
  return '';
}