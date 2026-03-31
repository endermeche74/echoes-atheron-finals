/* ═══════════════════════════════════════
   ECHOES OF AETHON — Save System v2
   3 save slots + autosave slot.
   ════════════════════════════════════ */

var SAVE_VERSION  = 2;
var SAVE_SLOTS    = 3;
var KEY_PREFIX    = 'aethon_v2_slot_';
var KEY_AUTOSAVE  = 'aethon_v2_auto';

/* ── BUILD SNAPSHOT ──────────────────── */
function _buildSnapshot() {
  return {
    version: SAVE_VERSION,
    ts:      Date.now(),
    P: {
      name:   P.name,   hp:P.hp,   maxHp:P.maxHp,
      mp:     P.mp,     maxMp:P.maxMp,
      gold:   P.gold,   atk:P.atk, def:P.def,
      mind:   P.mind,   crit:P.crit,
      sxp:    JSON.parse(JSON.stringify(P.sxp)),
      inv:    P.inv.slice(),
      eq:     JSON.parse(JSON.stringify(P.eq)),
      spells: P.spells.slice(),
      area:   P.area,
      quests: JSON.parse(JSON.stringify(P.quests))
    },
    G:    { flags: JSON.parse(JSON.stringify(G.flags)), discovered: JSON.parse(JSON.stringify(G.discovered)) },
    REP:  (typeof REP  !== 'undefined') ? JSON.parse(JSON.stringify(REP))  : {},
    TIME: (typeof TIME !== 'undefined') ? JSON.parse(JSON.stringify(TIME)) : {},
    VIEW: VIEW
  };
}

/* ── APPLY SNAPSHOT ──────────────────── */
function _applySnapshot(snap) {
  var sp = snap.P;
  P.name   = sp.name   || 'Traveler';
  P.hp     = sp.hp     || 100;  P.maxHp  = sp.maxHp  || 100;
  P.mp     = sp.mp     || 60;   P.maxMp  = sp.maxMp  || 60;
  P.gold   = sp.gold   || 0;    P.atk    = sp.atk    || 12;
  P.def    = sp.def    || 5;    P.mind   = sp.mind   || 10;
  P.crit   = sp.crit   || 0.05;
  P.sxp    = sp.sxp    || { blade:0,archery:0,mysticism:0,fortitude:0,herbalism:0,lore:0 };
  P.inv    = sp.inv    || [];
  P.eq     = sp.eq     || { weapon:null,armor:null,accessory:null };
  P.spells = sp.spells || [];
  P.area   = sp.area   || 'verath_arch';
  P.quests = sp.quests || {};

  if (snap.G) { G.flags = snap.G.flags || {}; G.discovered = snap.G.discovered || {}; }
  if (snap.REP  && typeof REP  !== 'undefined') Object.keys(snap.REP).forEach(function(k){ if(k in REP) REP[k]=snap.REP[k]; });
  if (snap.TIME && typeof TIME !== 'undefined') { TIME.hour=snap.TIME.hour||8; TIME.day=snap.TIME.day||1; TIME.phase=snap.TIME.phase||'day'; TIME.totalHours=snap.TIME.totalHours||8; }

  VIEW = snap.VIEW || 'explore';
  recalc();
}

/* ── SAVE TO SLOT ────────────────────── */
function saveToSlot(slot) {
  try {
    var key  = KEY_PREFIX + slot;
    var snap = _buildSnapshot();
    localStorage.setItem(key, JSON.stringify(snap));
    addLog('💾 Saved to Slot ' + slot + ' — Day ' + (snap.TIME.day || 1) + '.', 's');
    if (typeof sfxQuest === 'function') sfxQuest();
  } catch(e) {
    addLog('Save failed: ' + e.message, 'c');
    console.error('[Aethon] saveToSlot:', e);
  }
}

/* ── LOAD FROM SLOT ──────────────────── */
function loadFromSlot(slot) {
  try {
    var key = KEY_PREFIX + slot;
    var raw = localStorage.getItem(key);
    if (!raw) { addLog('Slot ' + slot + ' is empty.', 'n'); return; }
    var snap = JSON.parse(raw);
    if (!snap || !snap.P) { addLog('Slot ' + slot + ' is corrupted.', 'c'); return; }
    _applySnapshot(snap);
    var d    = new Date(snap.ts);
    var dStr = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    addLog('📂 Loaded Slot ' + slot + ' — Day ' + (snap.TIME ? snap.TIME.day : 1) + ' (saved ' + dStr + ').', 's');
    sv(VIEW);
  } catch(e) {
    addLog('Load failed: ' + e.message, 'c');
    console.error('[Aethon] loadFromSlot:', e);
  }
}

/* ── DELETE SLOT ─────────────────────── */
function deleteSlot(slot) {
  localStorage.removeItem(KEY_PREFIX + slot);
  addLog('Slot ' + slot + ' deleted.', 'n');
  render();
}

/* ── AUTOSAVE ─────────────────────────── */
function autosave() {
  try {
    localStorage.setItem(KEY_AUTOSAVE, JSON.stringify(_buildSnapshot()));
  } catch(e) { /* silent */ }
}

/* ── SLOT INFO ────────────────────────── */
function getSlotInfo(slot) {
  try {
    var raw = localStorage.getItem(KEY_PREFIX + slot);
    if (!raw) return null;
    var snap = JSON.parse(raw);
    if (!snap || !snap.P) return null;
    var sxp = snap.P.sxp || {};
    var tot  = Object.keys(sxp).reduce(function(s,k){ return s + Math.min(99,Math.floor(Math.sqrt((sxp[k]||0)/10))); }, 0);
    var area = (typeof AREAS !== 'undefined' && AREAS[snap.P.area]) ? AREAS[snap.P.area].name : snap.P.area;
    return { slot:slot, ts:snap.ts, day:snap.TIME?snap.TIME.day:1, area:area, totalSkl:tot, gold:snap.P.gold };
  } catch(e) { return null; }
}

function getAutoInfo() {
  try {
    var raw = localStorage.getItem(KEY_AUTOSAVE);
    if (!raw) return null;
    var snap = JSON.parse(raw);
    if (!snap || !snap.P) return null;
    var area = (typeof AREAS !== 'undefined' && AREAS[snap.P.area]) ? AREAS[snap.P.area].name : snap.P.area;
    return { ts:snap.ts, day:snap.TIME?snap.TIME.day:1, area:area };
  } catch(e) { return null; }
}

/* ── LEGACY COMPAT ────────────────────── */
/* Keep old saveGame/loadGame for header buttons */
function saveGame() { openSaveMenu('save'); }
function loadGame() { openSaveMenu('load'); }
function hasSave()  { return !!localStorage.getItem(KEY_PREFIX + '1') || !!localStorage.getItem(KEY_AUTOSAVE); }
function getSaveInfo() { return getSlotInfo(1) || getAutoInfo(); }