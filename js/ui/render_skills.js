/* ═══════════════════════════════════════
   ECHOES OF AETHON — Skills Renderer
   ════════════════════════════════════ */

function renderSkills() {
  var html = [];

  /* ── Stat block ── */
  html.push('<div class="sec">Stats</div>');
  html.push('<div class="stat-blk">');
  var stats = [
    ['ATK',   P.atk],
    ['DEF',   P.def],
    ['MIND',  P.mind],
    ['HP Max',P.maxHp],
    ['MP Max',P.maxMp],
    ['Crit %',Math.round(P.crit * 100) + '%']
  ];
  stats.forEach(function (s) {
    html.push(
      '<div class="sbox">',
      '<div class="sbox-l">' + s[0] + '</div>',
      '<div class="sbox-v">' + s[1] + '</div>',
      '</div>'
    );
  });
  html.push('</div>');

  /* ── Skill rows ── */
  html.push('<div class="sec">Skill Progression</div>');

  SKILL_ORDER.forEach(function (sk) {
    var meta  = SKILLMETA[sk];
    var lv    = sklLv(sk);
    var pr    = sklProg(sk);
    var xpLeft = lv < 99 ? sklXP(lv + 1) - (P.sxp[sk] || 0) : 0;

    /* Next locked ability */
    var nxtId = null;
    for (var i = 0; i < meta.abilIds.length; i++) {
      var ab = ABIL[meta.abilIds[i]];
      if (ab && ab.lv > lv) { nxtId = meta.abilIds[i]; break; }
    }
    var nxtAb = nxtId ? ABIL[nxtId] : null;

    /* Unlocked abilities */
    var unlocked = meta.abilIds.filter(function (aid) {
      var ab = ABIL[aid];
      return ab && ab.lv <= lv;
    });

    html.push(
      '<div style="margin-bottom:16px">',
      /* Bar row */
      '<div class="sk-row2">',
        '<span class="sk-nm">' + meta.icon + ' ' + meta.n + '</span>',
        '<div class="sk-bar"><div class="sk-fill" style="width:' + (pr * 100) + '%"></div></div>',
        '<span class="sk-lv">' + lv + '</span>',
      '</div>',
      /* Next unlock hint */
      '<div style="margin-left:85px;margin-top:-4px;margin-bottom:6px;font-size:9px;color:var(--mut)">',
        nxtAb
          ? 'Next: ' + nxtAb.name + ' at Lv.' + nxtAb.lv + ' · ' + xpLeft + ' XP needed'
          : '<span style="color:var(--gold)">MASTERED</span>',
      '</div>',
      /* Unlocked ability tags */
      '<div style="margin-left:85px;display:flex;flex-wrap:wrap;gap:3px">',
        unlocked.map(function (aid) {
          var ab = ABIL[aid];
          return '<span style="font-size:9px;padding:1px 5px;border:1px solid #1a4a1a;color:#44ee66;background:#0a1a0a">' + (ab ? ab.name : '') + '</span>';
        }).join(''),
      '</div>',
      '</div>'
    );
  });

  return html.join('');
}

function renderSkillsSide() {
  return [
    '<div class="sec">How Skills Work</div>',
    '<div style="font-size:11px;color:var(--mut);line-height:1.9">',
    'Skills level 1–99 through combat use.<br>',
    'No manual point allocation.<br><br>',
    'Milestones at Lv.10, 25, 50, 75<br>unlock new abilities.<br><br>',
    '<span style="color:#44ee66">',
    '⚔ Blade → ATK<br>',
    '🏹 Archery → ATK, dodge<br>',
    '🔥 Mysticism → MP, MIND<br>',
    '🛡 Fortitude → HP, DEF<br>',
    '🌿 Herbalism → Healing<br>',
    '📜 Lore → MIND, special',
    '</span><br><br>',
    'Crit chance: <span style="color:var(--gold)">' + Math.round(P.crit * 100) + '%</span> (base 5% + gear)',
    '</div>'
  ].join('');
}