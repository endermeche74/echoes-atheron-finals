/* ═══════════════════════════════════════
   ECHOES OF AETHON — Combat System
   ════════════════════════════════════ */

function beginCombat(eid) {
  /* Guard: enemy must exist */
  if (!eid) {
    addLog('[Error] beginCombat called with no enemy ID.', 'c');
    console.error('[Aethon] beginCombat: eid is undefined');
    return;
  }
  if (typeof ENEMIES === 'undefined') {
    addLog('[Error] ENEMIES data not loaded.', 'c');
    console.error('[Aethon] beginCombat: ENEMIES undefined');
    return;
  }
  var template = ENEMIES[eid];
  if (!template) {
    addLog('[Error] Unknown enemy: ' + eid, 'c');
    console.error('[Aethon] beginCombat: no entry for "' + eid + '" in ENEMIES');
    return;
  }

  /* Copy so mutations don't affect the template */
  var ec = {};
  Object.keys(template).forEach(function (k) { ec[k] = template[k]; });

  C.on        = true;
  C.en        = ec;
  C.ehp       = ec.maxHp;
  C.clog      = [];
  C.defending = false;
  C.shld      = false;
  C.sa        = 0;
  C.unbrk     = false;
  C.ided      = false;
  C.bleed     = false;
  C.frozen    = false;
  C.evade     = false;
  C.defdown   = false;

  addLog('⚔ ' + ec.n + ' appears!', 'c');
  render();
}

/* ── D20 ROLL ──────────────────────── */
function rollD20(mod, ac) {
  var r = rnd(20);
  return {
    roll: r,
    hit:  (r === 20) || (r !== 1 && r + mod >= ac),
    crit: (r === 20),
    miss: (r === 1)
  };
}

/* ── ABILITY ───────────────────────── */
function doAbility(abId) {
  var ab = ABIL[abId];
  if (!ab) { addLog('Unknown ability: ' + abId, 'c'); return; }
  if (P.mp < ab.mp) { addLog('Not enough MP!', 'c'); return; }

  P.mp -= ab.mp;
  var sk = ab.sk;
  var lv = sklLv(sk);

  /* HEAL */
  if (ab.typ === 'heal') {
    var h = ab.hFull
      ? (P.maxHp - P.hp)
      : Math.round(ab.healBase + ab.healScale * lv);
    P.hp = Math.min(P.maxHp, P.hp + h);
    sfxMagic();
    cLog('💚 ' + ab.name + ': healed ' + h + ' HP.', 'h');
    gainXP('herbalism', 12);
    enemyTurn(); render(); return;
  }

  /* BUFF / SUPPORT */
  if (ab.typ === 'buf' || ab.typ === 'sup') {
    if (ab.eff === 'defend')   { C.defending = true; cLog('🛡 ' + ab.name + ': halving damage this turn.', 'p'); }
    if (ab.eff === 'shield')   { C.shld = true; C.sa = Math.round(ab.shBase + (ab.shScale === 'mind' ? P.mind : P.def)); cLog('🔵 ' + ab.name + ': shield of ' + C.sa + '.', 'p'); }
    if (ab.eff === 'unbreak')  { C.unbrk = true; cLog('⬡ ' + ab.name + ': immune this turn!', 'p'); }
    if (ab.eff === 'evade')    { C.evade = true; cLog('🌑 ' + ab.name + ': will evade next attack.', 'p'); }
    if (ab.eff === 'identify') {
      C.ided = true;
      var wk = (C.en.weak && C.en.weak.length) ? 'Weak: ' + C.en.weak.join(', ') : 'No weaknesses';
      var rs = (C.en.res  && C.en.res.length)  ? '. Res: ' + C.en.res.join(', ')  : '';
      cLog('📜 ' + C.en.n + ' — ' + wk + rs + '.', 'p');
      gainXP('lore', 18);
    }
    sfxClick();
    gainXP(sk, 8);
    enemyTurn(); render(); return;
  }

  /* PHYSICAL / MAGICAL ATTACK */
  if (ab.typ === 'phy' || ab.typ === 'mag') {
    var atkMod = Math.floor(lv / 4);
    var dr = rollD20(atkMod, C.en.ac);

    cLog('🎲 d20(' + dr.roll + ')+' + atkMod + ' vs AC' + C.en.ac +
      ' — ' + (dr.crit ? 'CRITICAL HIT!' : dr.miss ? 'CRITICAL MISS' : dr.hit ? 'hit' : 'miss'), 'dice');

    if (!dr.hit) {
      cLog(ab.name + ': MISS!', 'e');
      sfxHit(); gainXP(sk, 5);
      enemyTurn(); render(); return;
    }

    var dmg;
    if      (ab.dmgType === 'mind') dmg = Math.round(ab.dmgM * P.mind);
    else if (ab.dmgType === 'lvl')  dmg = Math.round(ab.dmgM * lv);
    else                            dmg = Math.round(ab.dmgM * P.atk);

    if (ab.lowHp && P.hp < P.maxHp * 0.3) dmg = Math.round(dmg * 2.1);
    if (dr.crit) { dmg *= 2; }
    else if (Math.random() < P.crit) { dmg = Math.round(dmg * 1.5); cLog('⚡ Lucky critical!', 'p'); }

    var en = C.en;
    if (!ab.iRes) {
      if (en.weak && en.weak.indexOf(sk) !== -1) dmg = Math.round(dmg * 1.5);
      if (en.res  && en.res.indexOf(sk)  !== -1) dmg = Math.round(dmg * 0.5);
    }
    if (ab.typ === 'phy' && !ab.iDef) {
      var dred = C.defdown ? Math.round(en.def * 0.10) : Math.round(en.def * 0.35);
      dmg = Math.max(1, dmg - dred);
    }
    dmg = Math.max(1, dmg);

    if (ab.heal) {
      var hh = Math.round(dmg * 0.4);
      P.hp = Math.min(P.maxHp, P.hp + hh);
      cLog((ab.icon||'⚔') + ' ' + ab.name + ': ' + dmg + ' dmg, healed ' + hh + ' HP.', 'p');
    } else {
      var wkNote = (!ab.iRes && en.weak && en.weak.indexOf(sk) !== -1) ? ' ⚡WEAK' : dr.crit ? ' 💥CRIT' : '';
      cLog((ab.icon||'⚔') + ' ' + ab.name + ': ' + dmg + ' dmg' + wkNote + '.', 'p');
    }

    if (ab.se === 'bleed') { C.bleed = true; cLog('🩸 Bleeding!', 'p'); }
    C.ehp -= dmg;
    sfxHitEnemy();
    gainXP(sk, 15);
    if (C.ehp <= 0) { doVictory(); return; }
    enemyTurn(); render();
  }
}

/* ── SPELL ─────────────────────────── */
function castSpell(sid) {
  var sp = SPELLS[sid];
  if (!sp)          { addLog('Unknown spell.', 'c'); return; }
  if (P.mp < sp.mp) { addLog('Not enough MP for ' + sp.name + '!', 'c'); return; }

  P.mp -= sp.mp;
  sfxMagic();

  if (sp.typ === 'buf') {
    if (sp.eff === 'evade') { C.evade = true; cLog('🌑 ' + sp.name + ': next attack evaded.', 'p'); }
    gainXP('mysticism', 12);
    enemyTurn(); render(); return;
  }

  var atkMod = Math.floor(sklLv('mysticism') / 4);
  var dr     = rollD20(atkMod, C.en.ac);
  cLog('🎲 d20(' + dr.roll + ')+' + atkMod + ' vs AC' + C.en.ac +
    ' — ' + (dr.crit ? 'CRITICAL!' : dr.hit ? 'hit' : 'miss'), 'dice');

  if (!dr.hit) { cLog(sp.name + ': MISS!', 'e'); gainXP('mysticism', 6); enemyTurn(); render(); return; }

  var dmg = Math.round(sp.dmgM * P.mind);
  if (dr.crit)                           dmg *= 2;
  if (sp.bonusUndead && C.en.undead)     dmg  = Math.round(dmg * 1.6);
  if (!sp.iRes && C.en.res && C.en.res.indexOf('mysticism') !== -1) dmg = Math.round(dmg * 0.5);
  dmg = Math.max(1, dmg);

  if (sp.heal) {
    var sh = Math.round(dmg * 0.45);
    P.hp = Math.min(P.maxHp, P.hp + sh);
    cLog(sp.name + ': ' + dmg + ' ' + sp.school + ' dmg, healed ' + sh + ' HP.', 'p');
  } else {
    cLog(sp.name + ': ' + dmg + ' ' + sp.school + ' dmg' + (dr.crit ? ' 💥CRIT' : '') + '.', 'p');
  }

  if (sp.se === 'stun'  || sp.se === 'frozen') { C.frozen  = true; cLog('❄ Frozen!', 'p'); }
  if (sp.se === 'bleed')                        { C.bleed   = true; cLog('🩸 Bleeding!', 'p'); }
  if (sp.se === 'defdown')                      { C.defdown = true; cLog('🌍 DEF reduced!', 'p'); }

  C.ehp -= dmg;
  gainXP('mysticism', 18); gainXP('lore', 8);
  if (C.ehp <= 0) { doVictory(); return; }
  enemyTurn(); render();
}

/* ── ENEMY TURN ────────────────────── */
function enemyTurn() {
  var e = C.en;

  if (C.frozen) { C.frozen = false; cLog(e.n + ' is frozen — skips turn!', 'e'); return; }
  if (C.bleed)  {
    var bd = Math.max(1, Math.round(e.maxHp * 0.05));
    C.ehp -= bd; cLog('🩸 Bleeding: ' + bd + ' dmg.', 'e');
    if (C.ehp <= 0) { doVictory(); return; }
  }
  if (C.unbrk) { cLog('⬡ ' + e.n + ' attacks — UNBREAKABLE!', 'e'); C.unbrk = false; return; }
  if (C.evade) { cLog('🌑 ' + e.n + ' attacks — EVADED!',      'e'); C.evade = false; return; }

  /* Apply night ATK bonus */
  var nightBonus = (typeof nightAtkBonus === 'function') ? nightAtkBonus() : 0;
  var atk = Math.max(1, e.atk + rnd(6) - 3 + nightBonus);

  if (C.defending) {
    atk = Math.round(atk * 0.4); C.defending = false;
    cLog('🛡 Defended! ' + atk + ' dmg taken.', 'e');
  } else if (C.shld) {
    var ab2 = Math.min(C.sa, atk); atk -= ab2; C.sa -= ab2;
    if (C.sa <= 0) C.shld = false;
    cLog('🔵 Shield absorbs. ' + atk + ' dmg taken.', 'e');
  } else {
    atk = Math.max(1, atk - Math.round(P.def * 0.35));
    cLog(e.n + ' strikes for ' + atk + ' dmg.', 'e');
  }

  P.hp = Math.max(0, P.hp - atk);
  sfxHit();
  gainXP('fortitude', 8);
  if (P.hp < P.maxHp * 0.3) gainXP('herbalism', 4);
}

/* ── VICTORY ───────────────────────── */
function doVictory() {
  var e = C.en;
  sfxVic();
  addLog('Victory! Defeated ' + e.n + '.', 'i');

  var g = e.gMin + Math.floor(Math.random() * (e.gMax - e.gMin + 1));
  P.gold += g;
  addLog('  Found ' + g + 'g.', 'g');

  Object.keys(e.xp || {}).forEach(function (sk) { gainXP(sk, e.xp[sk]); });
  (e.loot || []).forEach(function (l) {
    if (Math.random() < l.c) {
      P.inv.push(l.i);
      sfxPickup();
      addLog('  Obtained: ' + ITEMS[l.i].n + '.', 'i');
    }
  });

  /* Quest flags for shade tournament */
  if (e.n === 'Gladiator Shade') G.flags['shade_defeated'] = true;
  if (e.n === 'Stone Golem')     G.flags['golem_defeated']  = true;

  /* Advance time after combat */
  if (typeof advanceTime === 'function') advanceTime('combat');

  if (typeof window._wolfKillHook === 'function') window._wolfKillHook(e.n);

  if (typeof autosave === 'function') autosave();

  C.on = false;
  recalc();
  checkQuestProgress();
  render();
}

/* ── FLEE ──────────────────────────── */
function doFlee() {
  sfxClick();
  if (Math.random() < 0.40 + sklLv('archery') * 0.005) {
    addLog('You slip away from the fight.', 'n');
    C.on = false; render();
  } else {
    addLog('Failed to flee!', 'c');
    enemyTurn();
    if (P.hp <= 0) { C.on = false; sfxDeath(); }
    render();
  }
}

/* ── RESPAWN ───────────────────────── */
function doRespawn() {
  P.hp   = Math.round(P.maxHp * 0.5);
  P.mp   = Math.round(P.maxMp * 0.5);
  P.area = 'verath_arch';
  C.on   = false;
  addLog("You rise again at Verath's Gate.", 'i');
  render();
}