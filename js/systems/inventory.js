/* ═══════════════════════════════════════
   ECHOES OF AETHON — Inventory System
   Equip, consume, sell, spell-learning.
   ════════════════════════════════════ */

/* ── RARITY HELPERS ──────────────────────── */
var RAR = {
  common:    { n: 'Common',    c: 'rarC' },
  uncommon:  { n: 'Uncommon',  c: 'rarU' },
  rare:      { n: 'Rare',      c: 'rarR' },
  epic:      { n: 'Epic',      c: 'rarE' },
  legendary: { n: 'Legendary', c: 'rarL' },
  mythic:    { n: 'Mythic',    c: 'rarM' }
};

function rarC(r) { return RAR[r] ? RAR[r].c : 'rarC'; }
function rarN(r) { return RAR[r] ? RAR[r].n : 'Common'; }

/* ── ITEM ACTION (click handler) ─────────── */

/**
 * Handle clicking an item in the inventory panel.
 * Routes to equip, consume, spellbook, or sell.
 * @param {string} id - Item ID
 */
function itemAct(id) {
  sfxClick();
  var it = ITEMS[id];
  if (!it) return;

  if (it.type === 'weapon' || it.type === 'armor' || it.type === 'accessory') {
    /* Toggle equip */
    if (P.eq[it.slot] === id) {
      doUnequip(it.slot);
    } else {
      P.eq[it.slot] = id;
      addLog('Equipped: ' + it.n + '.', 'i');
      recalc();
    }

  } else if (it.type === 'consumable') {
    var idx = P.inv.indexOf(id);
    if (idx === -1) return;
    applyConsumable(it);
    P.inv.splice(idx, 1);
    gainXP('herbalism', 8);
    checkQuestProgress();

  } else if (it.type === 'spellbook') {
    var idx2 = P.inv.indexOf(id);
    if (idx2 === -1) return;
    if (P.spells.indexOf(it.spell) !== -1) {
      addLog('You already know ' + (SPELLS[it.spell] ? SPELLS[it.spell].name : it.spell) + '.', 'n');
    } else {
      P.spells.push(it.spell);
      P.inv.splice(idx2, 1);
      sfxSpellLearn();
      addLog('Learned spell: ' + (SPELLS[it.spell] ? SPELLS[it.spell].name : it.spell) + '!', 's');
    }

  } else if (it.type === 'misc') {
    var idx3 = P.inv.indexOf(id);
    if (idx3 === -1) return;
    P.inv.splice(idx3, 1);
    P.gold += (it.val || 0);
    addLog('Sold ' + it.n + ' for ' + it.val + 'g.', 'g');
    checkQuestProgress();
  }

  render();
}

/* ── UNEQUIP ─────────────────────────────── */

/**
 * Remove the item currently in a given equipment slot.
 * @param {string} sl - 'weapon' | 'armor' | 'accessory'
 */
function doUnequip(sl) {
  var id = P.eq[sl];
  if (!id) return;
  addLog('Unequipped: ' + ITEMS[id].n + '.', 'i');
  P.eq[sl] = null;
  recalc();
  render();
}

/* ── SELL ALL MISC ───────────────────────── */

/** Sell every misc/relic item in inventory at once. */
function sellAll() {
  sfxClick();
  var tot = 0;
  var rm  = [];
  P.inv.forEach(function (id, i) {
    if (ITEMS[id] && ITEMS[id].type === 'misc') {
      tot += (ITEMS[id].val || 0);
      rm.push(i);
    }
  });
  /* Remove in reverse order to preserve indices */
  for (var i = rm.length - 1; i >= 0; i--) {
    P.inv.splice(rm[i], 1);
  }
  P.gold += tot;
  addLog('Sold all relics for ' + tot + 'g.', 'g');
  render();
}

/* ── APPLY CONSUMABLE ────────────────────── */

/**
 * Apply the effect of a consumable item to the player.
 * Works both in and out of combat.
 * @param {object} it - Item definition object
 */
function applyConsumable(it) {
  if (it.eff === 'hp') {
    P.hp = Math.min(P.maxHp, P.hp + (it.amt || 0));
    addLog('Used ' + it.n + ': +' + it.amt + ' HP.', 's');
  } else if (it.eff === 'mp') {
    P.mp = Math.min(P.maxMp, P.mp + (it.amt || 0));
    addLog('Used ' + it.n + ': +' + it.amt + ' MP.', 's');
  } else if (it.eff === 'both') {
    P.hp = Math.min(P.maxHp, P.hp + (it.amt || 0));
    P.mp = Math.min(P.maxMp, P.mp + 60);
    addLog('Used ' + it.n + ': +' + it.amt + ' HP, +60 MP.', 's');
  } else if (it.eff === 'cure') {
    C.bleed   = false;
    C.frozen  = false;
    C.defdown = false;
    addLog('Used ' + it.n + ': all status effects cured.', 's');
  } else if (it.eff === 'escape') {
    /* handled separately in combat */
  }
}

/* ── IN-COMBAT ITEM USE ──────────────────── */

/**
 * Use a consumable item during combat.
 * Triggers enemy turn after use (unless escaping).
 * @param {string} iid - Item ID
 */
function useCombatItem(iid) {
  var it  = ITEMS[iid];
  if (!it) return;
  var idx = P.inv.indexOf(iid);
  if (idx === -1) return;

  /* Smoke bomb — guaranteed escape */
  if (it.eff === 'escape') {
    P.inv.splice(idx, 1);
    addLog('Smoke bomb — escaped from combat!', 'n');
    C.on = false;
    render();
    return;
  }

  /* Antidote — cure without triggering enemy turn delay */
  if (it.eff === 'cure') {
    C.bleed   = false;
    C.frozen  = false;
    C.defdown = false;
    cLog('🌿 ' + it.n + ': all status effects cured.', 'h');
    P.inv.splice(idx, 1);
    gainXP('herbalism', 10);
    enemyTurn();
    render();
    return;
  }

  /* All other consumables */
  if (it.eff === 'hp') {
    P.hp = Math.min(P.maxHp, P.hp + (it.amt || 0));
    cLog('🌿 ' + it.n + ': +' + it.amt + ' HP.', 'h');
  } else if (it.eff === 'mp') {
    P.mp = Math.min(P.maxMp, P.mp + (it.amt || 0));
    cLog('💧 ' + it.n + ': +' + it.amt + ' MP.', 'h');
  } else if (it.eff === 'both') {
    P.hp = Math.min(P.maxHp, P.hp + (it.amt || 0));
    P.mp = Math.min(P.maxMp, P.mp + 60);
    cLog('✨ ' + it.n + ': +' + it.amt + ' HP, +60 MP.', 'h');
  }

  P.inv.splice(idx, 1);
  gainXP('herbalism', 10);
  enemyTurn();
  if (P.hp <= 0) { C.on = false; sfxDeath(); }
  render();
}