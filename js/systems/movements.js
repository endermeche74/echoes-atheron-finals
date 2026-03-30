/* ═══════════════════════════════════════
   ECHOES OF AETHON — Movement System
   Area travel, unlock checks, discovery.
   ════════════════════════════════════ */

/* ── UNLOCK CHECK ────────────────────────── */

/**
 * Returns true if the player meets the requirements to enter an area.
 * @param {string} aid - Area ID
 */
function areaUnlocked(aid) {
  var a = AREAS[aid];
  if (!a || !a.req) return true;
  if (a.req.skill)      return sklLv(a.req.skill) >= a.req.level;
  if (a.req.totalLevel) return totSkl() >= a.req.totalLevel;
  return false;
}

/** Convenience — returns the current area object. */
function currentArea() {
  return AREAS[P.area];
}

/* ── TRAVEL ──────────────────────────────── */

/**
 * Move the player to a new area.
 * Handles unlock check, discovery flag, log message,
 * and re-rendering the explore view.
 * @param {string} aid - Destination area ID
 */
function doTravel(aid) {
  if (!areaUnlocked(aid)) return;

  sfxStep();
  P.area = aid;

  var a = AREAS[aid];

  /* First-visit discovery */
  if (!G.discovered[aid]) {
    G.discovered[aid] = true;
    addLog('Discovered: ' + a.name + '.', 'd');
  }

  /* Always switch to explore view and re-render */
  if (VIEW !== 'explore') {
    sv('explore');
  } else {
    render();
  }
}

/**
 * Direct jump to an area from the map screen.
 * Same as doTravel but always forces explore tab.
 * @param {string} aid
 */
function goToArea(aid) {
  doTravel(aid);
  sv('explore');
}

/* ── EXPLORE ACTIONS ─────────────────────── */

/**
 * "Search Area" button handler.
 * Rolls for gold find, item find, or enemy encounter.
 */
function doExplore() {
  sfxClick();
  var a = currentArea();

  if (!a.searchable) {
    addLog('Nothing to search here.', 'n');
    return;
  }

  var roll = Math.random();

  /* 12% chance: find gold */
  if (roll < 0.12) {
    var g = 5 + rnd(15);
    P.gold += g;
    addLog('Found ' + g + 'g hidden nearby.', 'g');
    gainXP('lore', 5);
    checkQuestProgress();
    render();
    return;
  }

  /* 8% chance: find a random loot item */
  if (roll < 0.20 && a.loot && a.loot.length) {
    var id = a.loot[Math.floor(Math.random() * a.loot.length)];
    P.inv.push(id);
    sfxPickup();
    addLog('Found hidden in rubble: ' + ITEMS[id].n + '.', 'i');
    gainXP('lore', 8);
    checkQuestProgress();
    render();
    return;
  }

  /* Otherwise: spawn a random enemy from this area */
  if (!a.enemies || a.enemies.length === 0) {
    addLog('You search the area but find nothing.', 'n');
    render();
    return;
  }

  addLog('Something stirs in the dark...', 'n');
  beginCombat(a.enemies[Math.floor(Math.random() * a.enemies.length)]);
}

/**
 * "Rest here" button handler.
 * 25% chance of ambush if the area has enemies.
 */
function doRest() {
  sfxClick();
  var a = currentArea();

  if (Math.random() < 0.25 && a.enemies && a.enemies.length > 0) {
    addLog('Your rest is interrupted!', 'c');
    beginCombat(a.enemies[Math.floor(Math.random() * a.enemies.length)]);
    return;
  }

  var h = Math.round(P.maxHp * 0.35);
  var m = Math.round(P.maxMp * 0.35);
  P.hp  = Math.min(P.maxHp, P.hp + h);
  P.mp  = Math.min(P.maxMp, P.mp + m);
  addLog('You rest. +' + h + ' HP, +' + m + ' MP.', 's');
  gainXP('herbalism', 5);
  render();
}

/* ── MISC HELPERS ────────────────────────── */

/** Simple d-sided dice roll. */
function rnd(sides) {
  return Math.floor(Math.random() * sides) + 1;
}