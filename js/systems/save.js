/* ═══════════════════════════════════════
   ECHOES OF AETHON — Save / Load System
   Uses localStorage. Works on GitHub
   Pages and any local server.
   ════════════════════════════════════ */

var SAVE_KEY = 'echoes_aethon_v1';

/* ── SAVE ────────────────────────────── */

function saveGame() {
  try {
    var snapshot = {
      version: 1,
      ts:      Date.now(),

      /* Player */
      P: {
        name:   P.name,
        hp:     P.hp,   maxHp: P.maxHp,
        mp:     P.mp,   maxMp: P.maxMp,
        gold:   P.gold,
        atk:    P.atk,  def:  P.def,
        mind:   P.mind, crit: P.crit,
        sxp:    _clone(P.sxp),
        inv:    P.inv.slice(),
        eq:     _clone(P.eq),
        spells: P.spells.slice(),
        area:   P.area,
        quests: _clone(P.quests)
      },

      /* World flags & discovery */
      G: {
        flags:      _clone(G.flags),
        discovered: _clone(G.discovered)
      },

      /* New systems */
      REP:  _clone(REP),
      TIME: _clone(TIME),
      VIEW: VIEW
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    addLog('💾 Game saved — Day ' + TIME.day + ', ' + getTimeLabel() + '.', 's');
  } catch (e) {
    addLog('Save failed: ' + e.message, 'c');
    console.error('[Aethon] Save error:', e);
  }
}

/* ── LOAD ────────────────────────────── */

function loadGame() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) { addLog('No save file found.', 'n'); return; }

    var snap = JSON.parse(raw);
    if (!snap || !snap.P) { addLog('Save file is corrupted.', 'c'); return; }

    /* Restore player */
    var sp = snap.P;
    P.name    = sp.name   || 'Traveler';
    P.hp      = sp.hp     || 100;
    P.maxHp   = sp.maxHp  || 100;
    P.mp      = sp.mp     || 60;
    P.maxMp   = sp.maxMp  || 60;
    P.gold    = sp.gold   || 0;
    P.atk     = sp.atk    || 12;
    P.def     = sp.def    || 5;
    P.mind    = sp.mind   || 10;
    P.crit    = sp.crit   || 0.05;
    P.sxp     = sp.sxp    || { blade:0, archery:0, mysticism:0, fortitude:0, herbalism:0, lore:0 };
    P.inv     = sp.inv    || [];
    P.eq      = sp.eq     || { weapon:null, armor:null, accessory:null };
    P.spells  = sp.spells || [];
    P.area    = sp.area   || 'verath_arch';
    P.quests  = sp.quests || {};

    /* Restore world */
    if (snap.G) {
      G.flags      = snap.G.flags      || {};
      G.discovered = snap.G.discovered || {};
    }

    /* Restore new systems */
    if (snap.REP) {
      Object.keys(snap.REP).forEach(function (k) {
        if (k in REP) REP[k] = snap.REP[k];
      });
    }
    if (snap.TIME) {
      TIME.hour       = snap.TIME.hour       || 8;
      TIME.day        = snap.TIME.day        || 1;
      TIME.phase      = snap.TIME.phase      || 'day';
      TIME.totalHours = snap.TIME.totalHours || 8;
    }

    VIEW = snap.VIEW || 'explore';
    recalc();

    var d   = new Date(snap.ts);
    var dStr = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    addLog('📂 Game loaded — Day ' + TIME.day + ', ' + getTimeLabel() + ' (saved ' + dStr + ').', 's');
    sv(VIEW);

  } catch (e) {
    addLog('Load failed: ' + e.message, 'c');
    console.error('[Aethon] Load error:', e);
  }
}

/* ── UTILITIES ───────────────────────── */

function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
  addLog('Save deleted.', 'n');
}

function getSaveInfo() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    var snap = JSON.parse(raw);
    if (!snap || !snap.P) return null;
    var sxp  = snap.P.sxp || {};
    var tot  = Object.keys(sxp).reduce(function (s, k) {
      return s + Math.min(99, Math.floor(Math.sqrt((sxp[k] || 0) / 50)));
    }, 0);
    return {
      ts:       snap.ts,
      day:      snap.TIME ? snap.TIME.day  : 1,
      area:     snap.P.area || 'unknown',
      totalSkl: tot
    };
  } catch (e) { return null; }
}

function _clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}