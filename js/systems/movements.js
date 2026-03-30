/* ═══════════════════════════════════════
   ECHOES OF AETHON — Movement System
   Updated: advanceTime() called on every
   action. Night enemies can appear.
   ════════════════════════════════════ */

function areaUnlocked(aid) {
  var a = AREAS[aid];
  if (!a || !a.req) return true;
  if (a.req.skill)      return (typeof sklLv === 'function') ? sklLv(a.req.skill) >= a.req.level : false;
  if (a.req.totalLevel) return (typeof totSkl === 'function') ? totSkl() >= a.req.totalLevel    : false;
  return false;
}

function currentArea() {
  return AREAS ? AREAS[P.area] : null;
}

/* ── TRAVEL ──────────────────────────── */
function doTravel(aid) {
  if (!areaUnlocked(aid)) return;

  if (typeof sfxStep === 'function') sfxStep();
  P.area = aid;

  var a = AREAS[aid];
  if (!G.discovered[aid]) {
    G.discovered[aid] = true;
    addLog('Discovered: ' + a.name + '.', 'd');
    if (typeof gainRep === 'function') gainRep('warden', 1); /* Wardens note all movement */
  }

  /* Advance clock */
  if (typeof advanceTime === 'function') advanceTime('travel');

  if (VIEW !== 'explore') {
    sv('explore');
  } else {
    render();
  }
}

function goToArea(aid) {
  doTravel(aid);
  sv('explore');
}

/* ── SEARCH AREA ─────────────────────── */
function doExplore() {
  if (typeof sfxClick === 'function') sfxClick();

  var a = currentArea();
  if (!a) { addLog('No area loaded.', 'c'); return; }

  if (!a.searchable) {
    addLog('Nothing to search here.', 'n');
    render();
    return;
  }

  var roll = Math.random();

  /* 12% — find gold */
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

  /* 8% — find item */
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

  /* No enemies in this area */
  if (!a.enemies || a.enemies.length === 0) {
    addLog('You search carefully but find nothing.', 'n');
    if (typeof advanceTime === 'function') advanceTime('explore');
    render();
    return;
  }

  /* Combat — pick enemy; night may override */
  var eid = a.enemies[Math.floor(Math.random() * a.enemies.length)];

  if (typeof getNightEnemy === 'function') {
    var nightEid = getNightEnemy(a.id);
    if (nightEid && Math.random() < 0.35) {
      eid = nightEid;
      addLog('🌙 Something draws near in the dark…', 'c');
    }
  }

  addLog('Something stirs in the dark…', 'n');
  if (typeof advanceTime === 'function') advanceTime('explore');
  beginCombat(eid);
}

/* ── REST ────────────────────────────── */
function doRest() {
  if (typeof sfxClick === 'function') sfxClick();

  var a = currentArea();

  /* Ambush chance — higher at night */
  var ambushChance = 0.25;
  if (typeof isNight === 'function' && isNight()) ambushChance = 0.40;

  if (Math.random() < ambushChance && a && a.enemies && a.enemies.length > 0) {
    addLog('Your rest is interrupted!', 'c');
    if (typeof advanceTime === 'function') advanceTime('explore'); /* short interrupted rest */
    beginCombat(a.enemies[Math.floor(Math.random() * a.enemies.length)]);
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

/* ── MISC ────────────────────────────── */
function rnd(sides) {
  return Math.floor(Math.random() * sides) + 1;
}