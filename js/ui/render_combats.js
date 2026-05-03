/* ═══════════════════════════════════════
   ECHOES OF AETHON — Combat Renderer
   ════════════════════════════════════ */

function renderCombat() {
  var e   = C.en;
  var ep  = Math.max(0, C.ehp / e.maxHp * 100);
  var pp  = Math.max(0, P.hp  / P.maxHp * 100);
  var html = [];

  /* Enemy status tags */
  var eTags = '';
  if (C.ided) {
    if (e.weak && e.weak.length) e.weak.forEach(function (w) { eTags += '<span class="chtag tag-g">Weak: ' + w + '</span>'; });
    if (e.res  && e.res.length)  e.res.forEach( function (r) { eTags += '<span class="chtag tag-r">Res: '  + r + '</span>'; });
  }
  if (C.bleed)   eTags += '<span class="chtag tag-r">Bleeding</span>';
  if (C.frozen)  eTags += '<span class="chtag tag-b">Frozen</span>';
  if (C.defdown) eTags += '<span class="chtag tag-r">DEF↓</span>';
  var noWeak = C.ided
    ? '<span style="font-size:10px;color:var(--mut)">No weaknesses found</span>'
    : '<span style="font-size:10px;color:var(--mut)">◈ Use Identify to reveal weaknesses</span>';

  /* Enemy panel */
  html.push(
    '<div class="cbody">',
    '<div class="combatant">',
      '<div>',
        '<div class="cname-e">' + e.n + (e.boss ? ' ★' : '') + '</div>',
        '<div class="cdesc">'  + e.desc + '</div>',
        '<div style="margin-top:5px">' + (eTags || noWeak) + '</div>',
      '</div>',
      '<div style="text-align:right;flex-shrink:0">',
        '<div style="font-size:11px;color:#ff8877;margin-bottom:3px">' + C.ehp + ' / ' + e.maxHp + ' HP</div>',
        '<div style="font-size:9px;color:var(--mut);margin-bottom:3px">AC ' + e.ac + '</div>',
        '<div class="chpbar"><div class="chpf" style="width:' + ep + '%"></div></div>',
      '</div>',
    '</div>'
  );

  /* Player status tags */
  var pTags = '';
  if (C.defending) pTags += '<span class="chtag tag-b">Defending</span>';
  if (C.shld)      pTags += '<span class="chtag tag-b">Shield(' + C.sa + ')</span>';
  if (C.unbrk)     pTags += '<span class="chtag tag-y">Unbreakable</span>';
  if (C.evade)     pTags += '<span class="chtag tag-y">Evading</span>';
  if (!pTags)      pTags  = '<span style="font-size:10px;color:var(--mut)">No active effects</span>';

  /* Player panel */
  html.push(
    '<div class="combatant">',
      '<div>',
        '<div class="cname-p">' + P.name + (P.charClass ? ' · ' + P.charClass : '') + '</div>',
        '<div style="margin-top:4px">' + pTags + '</div>',
      '</div>',
      '<div style="text-align:right;flex-shrink:0">',
        '<div style="font-size:10px;color:#6699ff;margin-bottom:2px">' + P.mp + '/' + P.maxMp + ' MP</div>',
        '<div style="font-size:11px;color:#ff8877;margin-bottom:3px">' + P.hp + ' / ' + P.maxHp + ' HP</div>',
        '<div class="chpbar"><div class="chpf" style="width:' + pp + '%;background:#c03333"></div></div>',
      '</div>',
    '</div>'
  );

  /* Physical abilities */
  var physHtml = '';
  SKILL_ORDER.forEach(function (sk) {
    var lv = sklLv(sk);
    SKILLMETA[sk].abilIds.forEach(function (aid) {
      var ab = ABIL[aid];
      if (!ab || ab.lv > lv || ab.typ !== 'phy') return;
      var ok = P.mp >= ab.mp;
      physHtml +=
        '<button class="abt"' + (ok ? '' : ' disabled') +
        ' onclick="doAbility(\'' + ab.id + '\')">' +
        (ab.icon || '⚔') + ' ' + ab.name +
        '<span class="abt-cost">' + (ab.mp ? ab.mp + 'mp' : 'free') + '</span></button>';
    });
  });

  html.push(
    '<div class="act-section">',
      '<div class="act-label">⚔ Physical Skills</div>',
      '<div class="act-grid">',
        physHtml || '<span style="font-size:11px;color:var(--mut)">No physical skills yet — explore to gain XP.</span>',
      '</div>',
    '</div>'
  );

  /* Magic & support */
  var magHtml = '';
  SKILL_ORDER.forEach(function (sk) {
    var lv = sklLv(sk);
    SKILLMETA[sk].abilIds.forEach(function (aid) {
      var ab = ABIL[aid];
      if (!ab || ab.lv > lv || ab.typ === 'phy') return;
      var ok = P.mp >= ab.mp;
      magHtml +=
        '<button class="abt"' + (ok ? '' : ' disabled') +
        ' onclick="doAbility(\'' + ab.id + '\')">' +
        (ab.icon || '🔥') + ' ' + ab.name +
        '<span class="abt-cost">' + (ab.mp ? ab.mp + 'mp' : 'free') + '</span></button>';
    });
  });

  html.push(
    '<div class="act-section">',
      '<div class="act-label">🔥 Magic &amp; Support</div>',
      '<div class="act-grid">',
        magHtml || '<span style="font-size:11px;color:var(--mut)">No magic skills yet.</span>',
      '</div>',
    '</div>'
  );

  /* Spells */
  if (P.spells.length > 0) {
    var spellHtml = '';
    P.spells.forEach(function (sid) {
      var sp = SPELLS[sid];
      if (!sp) return;
      var ok = P.mp >= sp.mp;
      spellHtml +=
        '<button class="abt abt-sp"' + (ok ? '' : ' disabled') +
        ' onclick="castSpell(\'' + sid + '\')">' +
        sp.name + '<span class="abt-cost">' + sp.mp + 'mp</span></button>';
    });
    html.push(
      '<div class="act-section">',
        '<div class="act-label">📖 Spells</div>',
        '<div class="act-grid">' + spellHtml + '</div>',
      '</div>'
    );
  }

  /* Items */
  var usedIds  = {};
  var itemHtml = '';
  P.inv.forEach(function (iid) {
    var it = ITEMS[iid];
    if (!it || it.type !== 'consumable' || usedIds[iid]) return;
    usedIds[iid] = true;
    var label = it.eff === 'escape' ? 'FLEE' : it.eff === 'cure' ? 'CURE' : '+' + (it.amt || '');
    itemHtml +=
      '<button class="abt abt-it" onclick="useCombatItem(\'' + iid + '\')">' +
      it.n + '<span class="abt-cost">' + label + '</span></button>';
  });

  html.push(
    '<div class="act-section">',
      '<div class="act-label">🌿 Items</div>',
      '<div class="act-grid">',
        itemHtml || '<span style="font-size:11px;color:var(--mut)">No consumables in inventory.</span>',
      '</div>',
    '</div>',
    '<div style="margin-top:4px">',
      '<button class="btn btn-r" onclick="doFlee()">↩ Attempt Flee</button>',
    '</div>',
    '</div>'
  );

  return html.join('');
}

function renderCombatSide() {
  var rows = C.clog.slice(0, 16).map(function (l) {
    var col = l.t === 'p' ? '#c0ccf0' : l.t === 'e' ? '#ff7766' : l.t === 'h' ? '#55ee88' : l.t === 'dice' ? '#ffee44' : '#505870';
    return '<div style="color:' + col + ';padding:1px 0;font-size:11px;line-height:1.8">' + l.m + '</div>';
  }).join('');

  return [
    '<div class="sec">Battle Log</div>',
    rows || '<div style="color:var(--mut);font-size:11px">No actions yet.</div>',
    '<div style="margin-top:8px;font-size:10px;color:var(--mut);line-height:1.6">',
      'd20 + skill mod vs AC.<br>Nat 20 = Critical ×2.<br>Nat 1 = Miss.<br>Weakness = ×1.5 dmg.',
    '</div>'
  ].join('');
}