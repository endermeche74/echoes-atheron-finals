/* ═══════════════════════════════════════
   ECHOES OF AETHON — Explore Renderer
   ════════════════════════════════════ */

function renderExplore() {
  var a      = currentArea();
  var seenKey = a.id + '_seen';
  var isFirst = !G.discovered[seenKey];
  if (isFirst) G.discovered[seenKey] = true;

  var desc = (isFirst && a.first) ? a.first : a.desc;
  var html = [];

  /* Title */
  html.push('<div class="page-title">' + a.name + '</div>');
  html.push('<div class="page-sub">'   + a.sub  + '</div>');

  /* Description */
  html.push('<div class="desc">' + desc + '</div>');

  /* On first visit also show the full desc as lore if first text differs */
  if (isFirst && a.first && a.first !== a.desc) {
    html.push('<div class="lorebox">' + a.desc + '</div>');
  }

  /* Action buttons */
  html.push('<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">');
  if (a.searchable) {
    html.push('<button class="btn" onclick="doExplore()">⚔ Search Area</button>');
  }
  html.push('<button class="btn btn-g" onclick="doRest()">💤 Rest here (25% ambush chance)</button>');
  html.push('</div>');

  /* NPCs */
  if (a.npcs && a.npcs.length) {
    html.push('<div class="sec">People Here</div>');
    a.npcs.forEach(function (id) {
      var npc = NPCS[id];
      if (!npc) return;
      var badge = '';
      if      (npc.faction === 'shade')   badge = '<span class="npc-faction f-shade">Shade Company</span>';
      else if (npc.faction === 'drowned') badge = '<span class="npc-faction f-drowned">The Drowned</span>';
      else if (npc.faction === 'ash')     badge = '<span class="npc-faction f-ash">Ash-folk</span>';
      else if (npc.faction === 'warden')  badge = '<span class="npc-faction f-warden">Stone Warden</span>';
      html.push(
        '<div class="npc-card" onclick="openDlg(\'' + id + '\')">',
        '<div>',
        '<div style="font-size:13px">' + npc.n + '</div>',
        '<div style="font-size:10px;color:var(--mut)">' + npc.title + '</div>',
        badge,
        '</div>',
        '<span style="color:var(--mut)">▶</span>',
        '</div>'
      );
    });
  }

  /* Movement */
  html.push('<div class="sec">Where to Go</div>');
  html.push('<div class="move-grid">');
  (a.connections || []).forEach(function (tid) {
    var ta   = AREAS[tid];
    if (!ta) return;
    var unlk = areaUnlocked(tid);
    var isNew = unlk && !G.discovered[tid];
    html.push(
      '<div class="move-btn' + (unlk ? '' : ' move-locked') + '"',
      unlk ? ' onclick="doTravel(\'' + tid + '\')"' : '',
      '>',
      '<div class="move-name">' + ta.name + '</div>',
      '<div class="move-sub">'  + ta.sub  + '</div>',
      !unlk ? '<div class="move-req">🔒 ' + ta.reqDesc + '</div>' : '',
      isNew  ? '<div class="move-new">★ Unexplored</div>' : '',
      '</div>'
    );
  });
  html.push('</div>');

  return html.join('');
}

function renderExploreSide() {
  var a    = currentArea();
  var html = [];

  /* Active quests summary */
  html.push('<div class="sec">Active Quests</div>');
  var active = Object.keys(QUESTS).filter(function (qid) { return questActive(qid); });
  if (active.length === 0) {
    html.push('<div style="font-size:11px;color:var(--mut)">No active quests.</div>');
  } else {
    active.forEach(function (qid) {
      var q  = QUESTS[qid];
      var qs = questState(qid);
      html.push(
        '<div style="margin-bottom:8px">',
        '<div style="font-size:11px;color:var(--gold)">' + q.name + '</div>',
        '<div style="font-size:10px;color:var(--mut);margin-top:2px;line-height:1.5">' + q.stages[qs.stage] + '</div>',
        '</div>'
      );
    });
  }

  /* Enemies in this area */
  html.push('<div class="sec">Enemies Here</div>');
  if (!a.enemies || a.enemies.length === 0) {
    html.push('<div style="font-size:10px;color:var(--mut)">No enemies in this area.</div>');
  } else {
    a.enemies.forEach(function (eid) {
      var e = ENEMIES[eid];
      if (!e) return;
      html.push(
        '<div style="padding:4px 0;border-bottom:1px solid var(--brd2)">',
        '<div style="color:#ff6655;font-size:11px">' + e.n + '</div>',
        '<div style="font-size:9px;color:var(--dim);margin-top:1px">AC ' + e.ac + ' · HP ' + e.maxHp + '</div>',
        '</div>'
      );
    });
  }

  return html.join('');
}