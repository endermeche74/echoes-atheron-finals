/* ═══════════════════════════════════════
   ECHOES OF AETHON — Movement System
   Time moves slowly. Combat is explicit.
   ════════════════════════════════════ */

function areaUnlocked(aid) {
  var a = AREAS[aid];
  if (!a || !a.req) return true;
  if (a.req.skill)      return (typeof sklLv  === 'function') ? sklLv(a.req.skill) >= a.req.level    : false;
  if (a.req.totalLevel) return (typeof totSkl === 'function') ? totSkl() >= a.req.totalLevel          : false;
  return false;
}

function currentArea() {
  return (typeof AREAS !== 'undefined') ? AREAS[P.area] : null;
}

/* ── TRAVEL ──────────────────────────── */
function doTravel(aid) {
  if (!areaUnlocked(aid)) return;
  if (typeof sfxStep === 'function') sfxStep();

  P.area = aid;
  var a  = AREAS[aid];
  if (!G.discovered[aid]) {
    G.discovered[aid] = true;
    addLog('Discovered: ' + a.name + '.', 'd');
    if (typeof gainRep === 'function') gainRep('warden', 1);
  }

  /* Travel costs very little time */
  if (typeof advanceTime === 'function') advanceTime('travel');

  if (VIEW !== 'explore') sv('explore');
  else render();
}

function goToArea(aid) {
  doTravel(aid);
}

/* ── SEARCH AREA ─────────────────────── */
function doExplore() {
  if (typeof sfxClick === 'function') sfxClick();

  var a = currentArea();
  if (!a) { addLog('No area loaded.', 'c'); return; }
  if (!a.searchable) { addLog('Nothing to search here.', 'n'); render(); return; }

  var roll = Math.random();

  /* 12% — gold */
  if (roll < 0.12) {
    var g = 5 + rnd(15);
    P.gold += g;
    addLog('Found ' + g + 'g hidden in the rubble.', 'g');
    if (typeof gainXP === 'function') gainXP('lore', 5);
    if (typeof advanceTime === 'function') advanceTime('explore');
    if (typeof checkQuestProgress === 'function') checkQuestProgress();
    render();
    return;
  }

  /* 8% — item */
  if (roll < 0.20 && a.loot && a.loot.length > 0) {
    var id = a.loot[Math.floor(Math.random() * a.loot.length)];
    P.inv.push(id);
    if (typeof sfxPickup === 'function') sfxPickup();
    addLog('Found hidden in rubble: ' + ITEMS[id].n + '.', 'i');
    if (typeof gainXP === 'function') gainXP('lore', 8);
    if (typeof advanceTime === 'function') advanceTime('explore');
    if (typeof checkQuestProgress === 'function') checkQuestProgress();
    render();
    return;
  }

  /* No enemies in area */
  if (!a.enemies || a.enemies.length === 0) {
    addLog('You search carefully but find nothing.', 'n');
    if (typeof advanceTime === 'function') advanceTime('explore');
    render();
    return;
  }

  /* 80%+ — combat */
  var eid = a.enemies[Math.floor(Math.random() * a.enemies.length)];

  /* Night bonus chance — extra stronger enemy */
  if (typeof getNightEnemy === 'function' && typeof isNight === 'function' && isNight()) {
    var nightEid = getNightEnemy(a.id);
    if (nightEid && ENEMIES[nightEid] && Math.random() < 0.35) {
      eid = nightEid;
      addLog('🌙 Something draws near in the dark…', 'c');
    }
  }

  /* Verify enemy exists before starting combat */
  if (!ENEMIES[eid]) {
    addLog('You search the area but find nothing.', 'n');
    console.warn('[Aethon] doExplore: enemy "' + eid + '" not found in ENEMIES');
    if (typeof advanceTime === 'function') advanceTime('explore');
    render();
    return;
  }

  addLog('Something stirs in the dark…', 'n');
  if (typeof advanceTime === 'function') advanceTime('explore');

  /* Small delay so the log message is visible before combat renders */
  setTimeout(function () {
    if (typeof beginCombat === 'function') {
      beginCombat(eid);
    } else {
      addLog('[Error] beginCombat not defined — check js/systems/combat.js', 'c');
      console.error('[Aethon] beginCombat is not defined');
    }
  }, 80);
}

/* ── REST ────────────────────────────── */
function doRest() {
  if (typeof sfxClick === 'function') sfxClick();
  var a = currentArea();

  /* Higher ambush chance at night */
  var ambushChance = 0.20;
  if (typeof isNight === 'function' && isNight()) ambushChance = 0.35;

  if (Math.random() < ambushChance && a && a.enemies && a.enemies.length > 0) {
    addLog('Your rest is interrupted!', 'c');
    if (typeof advanceTime === 'function') advanceTime('explore');
    var eid = a.enemies[Math.floor(Math.random() * a.enemies.length)];
    if (ENEMIES[eid]) beginCombat(eid);
    return;
  }

  var h = Math.round(P.maxHp * 0.35);
  var m = Math.round(P.maxMp * 0.35);
  P.hp  = Math.min(P.maxHp, P.hp + h);
  P.mp  = Math.min(P.maxMp, P.mp + m);
  addLog('You rest. +' + h + ' HP, +' + m + ' MP.', 's');
  if (typeof gainXP === 'function') gainXP('herbalism', 5);
  if (typeof advanceTime === 'function') advanceTime('rest');
  render();
}

/* ── D-SIDED DICE ────────────────────── */
function rnd(sides) {
  return Math.floor(Math.random() * sides) + 1;
}