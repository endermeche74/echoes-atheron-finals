/* ═══════════════════════════════════════
   ECHOES OF AETHON — Game State
   Single source of truth for all
   mutable runtime data.
   ════════════════════════════════════ */

/* ── PLAYER ─────────────────────────────── */
var P = {
  name:   'Traveler',

  /* Resources */
  hp:     100,
  maxHp:  100,
  mp:     60,
  maxMp:  60,
  gold:   50,

  /* Derived combat stats (recalculated by skills.js) */
  atk:    12,
  def:    5,
  mind:   10,
  crit:   0.05,   // 5% base crit chance

  /* Skill XP — levels derived via sklLv() in skills.js */
  sxp: {
    blade:     0,
    archery:   0,
    mysticism: 0,
    fortitude: 0,
    herbalism: 0,
    lore:      0
  },

  /* Inventory — array of item IDs (duplicates allowed) */
  inv: [
    'health_potion',
    'health_potion',
    'mana_shard',
    'iron_sword',
    'leather_armor'
  ],

  /* Equipment slots */
  eq: {
    weapon:    null,
    armor:     null,
    accessory: null
  },

  /* Learned spells — array of spell IDs */
  spells: [],

  /* Current area ID */
  area: 'verath_arch',

  /* Quest progress map  { questId: { status, stage } } */
  quests: {}
};

/* ── COMBAT STATE ────────────────────────── */
var C = {
  on:        false,   // combat active?
  en:        null,    // current enemy object (copy)
  ehp:       0,       // enemy current HP

  /* Per-turn / per-combat flags */
  clog:      [],      // array of { m: string, t: string }
  defending: false,
  shld:      false,
  sa:        0,       // shield amount remaining
  unbrk:     false,
  ided:      false,   // identified enemy weaknesses?
  bleed:     false,
  frozen:    false,
  evade:     false,
  defdown:   false    // enemy DEF reduced?
};

/* ── DIALOGUE STATE ──────────────────────── */
var DLG = {
  on:    false,
  npc:   null,    // NPC id string
  stack: []       // navigation stack of node keys
};

/* ── GLOBAL FLAGS & DISCOVERY ────────────── */
var G = {
  flags:      {},   // arbitrary boolean flags, e.g. G.flags['forge_returned']
  discovered: {}    // area ids that have been visited
};

/* Mark starting area as discovered */
G.discovered['verath_arch'] = true;

/* ── VIEW STATE ──────────────────────────── */
var VIEW = 'explore';

/* ── MESSAGE LOG ─────────────────────────── */
var LOG = [];   // array of { msg, type }

/* ── LOG HELPERS ─────────────────────────── */

/**
 * Add a line to the on-screen log.
 * @param {string} msg
 * @param {string} type  n=neutral i=info c=combat s=success g=gold d=dialogue dice=dice roll
 */
function addLog(msg, type) {
  type = type || 'n';
  LOG.unshift({ msg: msg, type: type });
  if (LOG.length > 80) LOG.pop();
  renderLog();
}

/** Re-draw the log panel from current LOG array. */
function renderLog() {
  var el = document.getElementById('slog');
  if (!el) return;
  var tc = { n:'l-n', i:'l-i', c:'l-c', s:'l-s', g:'l-g', d:'l-d', dice:'l-dice' };
  el.innerHTML = LOG.slice(0, 20).map(function (e) {
    return '<div class="ll ' + (tc[e.type] || 'l-n') + '">' + e.msg + '</div>';
  }).join('');
}

/** Add a line to the in-combat battle log (C.clog). */
function cLog(msg, type) {
  type = type || 'n';
  C.clog.unshift({ m: msg, t: type });
}

/* ── HEADER UPDATER ──────────────────────── */
function updHdr() {
  document.getElementById('hpbar').style.width = Math.max(0, P.hp / P.maxHp * 100) + '%';
  document.getElementById('mpbar').style.width = Math.max(0, P.mp / P.maxMp * 100) + '%';
  document.getElementById('hpval').textContent  = P.hp + '/' + P.maxHp;
  document.getElementById('mpval').textContent  = P.mp + '/' + P.maxMp;
  document.getElementById('hgold').textContent  = '⬡ ' + P.gold + 'g';
  var area = AREAS && AREAS[P.area];
  document.getElementById('hloc').textContent   = area ? area.name : '';
}