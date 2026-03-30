/* ═══════════════════════════════════════
   ECHOES OF AETHON — Inventory System
   Updated: gear can now be sold.
   ════════════════════════════════════ */

var RAR = {
  common:    { n:'Common',    c:'rarC' },
  uncommon:  { n:'Uncommon',  c:'rarU' },
  rare:      { n:'Rare',      c:'rarR' },
  epic:      { n:'Epic',      c:'rarE' },
  legendary: { n:'Legendary', c:'rarL' },
  mythic:    { n:'Mythic',    c:'rarM' }
};
function rarC(r) { return RAR[r] ? RAR[r].c : 'rarC'; }
function rarN(r) { return RAR[r] ? RAR[r].n : 'Common'; }

/* ── SELL VALUE FOR GEAR ─────────────── */
var GEAR_SELL_VALUE = {
  common:    8,
  uncommon:  20,
  rare:      45,
  epic:      100,
  legendary: 250,
  mythic:    500
};

function gearSellValue(it) {
  /* If the item has an explicit val, use half of it */
  if (it.val) return Math.max(1, Math.floor(it.val * 0.5));
  return GEAR_SELL_VALUE[it.rar] || 5;
}

/* ── ITEM ACTION (inventory click) ──── */
function itemAct(id) {
  sfxClick();
  var it = ITEMS[id];
  if (!it) return;

  if (it.type === 'weapon' || it.type === 'armor' || it.type === 'accessory') {
    /* Toggle equip/unequip */
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

/* ── SELL GEAR ───────────────────────── */

/**
 * Sell an unequipped gear item from inventory.
 * Called from a dedicated Sell button in the UI.
 * @param {string} id
 */
function sellGearItem(id) {
  sfxClick();
  var it = ITEMS[id];
  if (!it) return;

  /* Can't sell equipped items */
  if (P.eq.weapon === id || P.eq.armor === id || P.eq.accessory === id) {
    addLog('Unequip ' + it.n + ' before selling.', 'n');
    render();
    return;
  }

  var idx = P.inv.indexOf(id);
  if (idx === -1) return;

  var val = gearSellValue(it);
  P.inv.splice(idx, 1);
  P.gold += val;
  addLog('Sold ' + it.n + ' for ' + val + 'g.', 'g');
  render();
}

/* ── UNEQUIP ─────────────────────────── */
function doUnequip(sl) {
  var id = P.eq[sl];
  if (!id) return;
  addLog('Unequipped: ' + ITEMS[id].n + '.', 'i');
  P.eq[sl] = null;
  recalc();
  render();
}

/* ── SELL ALL MISC ───────────────────── */
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
  for (var i = rm.length - 1; i >= 0; i--) { P.inv.splice(rm[i], 1); }
  P.gold += tot;
  addLog('Sold all relics for ' + tot + 'g.', 'g');
  render();
}

/* ── APPLY CONSUMABLE ────────────────── */
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
  }
}

/* ── IN-COMBAT ITEM USE ──────────────── */
function useCombatItem(iid) {
  var it  = ITEMS[iid];
  if (!it) return;
  var idx = P.inv.indexOf(iid);
  if (idx === -1) return;

  if (it.eff === 'escape') {
    P.inv.splice(idx, 1);
    addLog('Smoke bomb — escaped!', 'n');
    C.on = false; render(); return;
  }
  if (it.eff === 'cure') {
    C.bleed = false; C.frozen = false; C.defdown = false;
    cLog('🌿 ' + it.n + ': status cleared.', 'h');
    P.inv.splice(idx, 1);
    gainXP('herbalism', 10);
    enemyTurn(); render(); return;
  }

  if (it.eff === 'hp')   { P.hp = Math.min(P.maxHp, P.hp + (it.amt||0)); cLog('🌿 ' + it.n + ': +' + it.amt + ' HP.','h'); }
  if (it.eff === 'mp')   { P.mp = Math.min(P.maxMp, P.mp + (it.amt||0)); cLog('💧 ' + it.n + ': +' + it.amt + ' MP.','h'); }
  if (it.eff === 'both') {
    P.hp = Math.min(P.maxHp, P.hp + (it.amt||0));
    P.mp = Math.min(P.maxMp, P.mp + 60);
    cLog('✨ ' + it.n + ': +' + it.amt + ' HP, +60 MP.', 'h');
  }

  P.inv.splice(idx, 1);
  gainXP('herbalism', 10);
  enemyTurn();
  if (P.hp <= 0) { C.on = false; sfxDeath(); }
  render();
}