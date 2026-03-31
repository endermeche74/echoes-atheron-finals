/* ═══════════════════════════════════════
   ECHOES OF AETHON — Skills System
   XP divisor: 50 → 10 (5x faster).
   Level 10 now takes ~20 fights instead
   of ~100.
   ════════════════════════════════════ */

var SKILL_ORDER = ['blade','archery','mysticism','fortitude','herbalism','lore'];

/* ── LEVEL MATH ──────────────────────── */

function sklLv(sk) {
  /* divisor=10 → 5× faster than old divisor=50 */
  return Math.min(99, Math.floor(Math.sqrt((P.sxp[sk] || 0) / 10)));
}

function sklXP(lv) {
  return lv * lv * 10;
}

function sklProg(sk) {
  var xp  = P.sxp[sk] || 0;
  var lv  = sklLv(sk);
  if (lv >= 99) return 1;
  var cur  = sklXP(lv);
  var next = sklXP(lv + 1);
  return (xp - cur) / (next - cur);
}

function totSkl() {
  var t = 0;
  SKILL_ORDER.forEach(function(k) { t += sklLv(k); });
  return t;
}

/* ── XP GAIN ─────────────────────────── */

function gainXP(sk, amt) {
  var ol = sklLv(sk);
  P.sxp[sk] = (P.sxp[sk] || 0) + amt;
  var nl = sklLv(sk);

  if (nl > ol) {
    if (typeof sfxLvUp === 'function') sfxLvUp();
    addLog('✦ ' + SKILLMETA[sk].n + ' reached Level ' + nl + '!', 's');
    recalc();

    /* Announce newly unlocked abilities */
    (SKILLMETA[sk].abilIds || []).forEach(function(aid) {
      var ab = ABIL[aid];
      if (ab && ab.lv <= nl && ab.lv > ol) {
        addLog('  → Ability Unlocked: ' + ab.name, 's');
      }
    });
  }
}

/* ── STAT RECALCULATION ──────────────── */

function recalc() {
  var hp   = 100 + sklLv('fortitude') * 4;
  var mp   = 60  + sklLv('mysticism') * 3;
  var atk  = 8   + sklLv('blade')     / 3  + sklLv('archery') / 4;
  var def  = 4   + sklLv('fortitude') / 3;
  var mind = 7   + sklLv('mysticism') / 2  + sklLv('lore')    / 4;
  var crit = 0.05;

  ['weapon','armor','accessory'].forEach(function(sl) {
    var it = P.eq[sl] && ITEMS[P.eq[sl]];
    if (it) {
      atk  += it.atk   || 0;
      def  += it.def   || 0;
      mp   += it.mpB   || 0;
      mind += it.mindB || 0;
      crit += it.critB || 0;
      hp   += it.hpB   || 0;
    }
  });

  P.maxHp = Math.round(hp);
  P.maxMp = Math.round(mp);
  P.atk   = Math.round(atk);
  P.def   = Math.round(def);
  P.mind  = Math.round(mind);
  P.crit  = Math.min(0.80, crit);

  P.hp = Math.min(P.hp, P.maxHp);
  P.mp = Math.min(P.mp, P.maxMp);
}