/* ═══════════════════════════════════════
   ECHOES OF AETHON — Game State
   Single source of truth for all
   mutable runtime data.
   ════════════════════════════════════ */

var P = {
  name:   'Traveler',
  hp:     100, maxHp: 100,
  mp:     60,  maxMp: 60,
  gold:   50,
  atk:    12, def: 5, mind: 10, crit: 0.05,
  sxp: { blade:0, archery:0, mysticism:0, fortitude:0, herbalism:0, lore:0 },
  inv: ['health_potion','health_potion','mana_shard','iron_sword','leather_armor'],
  eq:  { weapon:null, armor:null, accessory:null },
  spells: [],
  area:   'verath_arch',
  quests: {}
};

var C = {
  on:false, en:null, ehp:0, clog:[],
  defending:false, shld:false, sa:0,
  unbrk:false, ided:false,
  bleed:false, frozen:false, evade:false, defdown:false
};

var DLG = { on:false, npc:null, stack:[] };

var G = {
  flags:      {},
  discovered: {}
};
G.discovered['verath_arch'] = true;

var VIEW = 'explore';
var LOG  = [];

/* ── LOG ─────────────────────────────── */
function addLog(msg, type) {
  type = type || 'n';
  LOG.unshift({ msg:msg, type:type });
  if (LOG.length > 80) LOG.pop();
  renderLog();
}

function renderLog() {
  var el = document.getElementById('slog');
  if (!el) return;
  var tc = { n:'l-n', i:'l-i', c:'l-c', s:'l-s', g:'l-g', d:'l-d', dice:'l-dice' };
  el.innerHTML = LOG.slice(0, 20).map(function (e) {
    return '<div class="ll ' + (tc[e.type] || 'l-n') + '">' + e.msg + '</div>';
  }).join('');
}

function cLog(msg, type) {
  type = type || 'n';
  C.clog.unshift({ m:msg, t:type });
}

/* ── HEADER ──────────────────────────── */
function updHdr() {
  var hpbar = document.getElementById('hpbar');
  var mpbar = document.getElementById('mpbar');
  var hpval = document.getElementById('hpval');
  var mpval = document.getElementById('mpval');
  var hgold = document.getElementById('hgold');
  var hloc  = document.getElementById('hloc');
  var htime = document.getElementById('htime');

  if (hpbar) hpbar.style.width = Math.max(0, P.hp / P.maxHp * 100) + '%';
  if (mpbar) mpbar.style.width = Math.max(0, P.mp / P.maxMp * 100) + '%';
  if (hpval) hpval.textContent = P.hp + '/' + P.maxHp;
  if (mpval) mpval.textContent = P.mp + '/' + P.maxMp;
  if (hgold) hgold.textContent = '⬡ ' + P.gold + 'g';

  /* Area name — safe check */
  if (hloc) {
    var area = (typeof AREAS !== 'undefined') ? AREAS[P.area] : null;
    hloc.textContent = area ? area.name : P.area;
  }

  /* Time display — safe check */
  if (htime && typeof TIME !== 'undefined' && typeof getTimeLabel === 'function') {
    htime.textContent = getTimeIcon() + ' Day ' + TIME.day + ' · ' + getTimeLabel();
    htime.style.color = getTimeColor();
  }
}