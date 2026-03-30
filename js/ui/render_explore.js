/* ═══════════════════════════════════════
   ECHOES OF AETHON — Explore Renderer
   Fully defensive null checks at every
   step. Shows named errors if data is
   missing instead of blank screen.
   ════════════════════════════════════ */

function render_explore() {

  /* ── Guard: critical data must exist ── */
  if (typeof AREAS === 'undefined') {
    return _exErr('AREAS not loaded. Check <strong>js/data/areas.js</strong> for a syntax error (F12 → Console).');
  }
  if (typeof P === 'undefined') {
    return _exErr('Player state (P) not loaded. Check <strong>js/systems/state.js</strong>.');
  }

  var a = AREAS[P.area];
  if (!a) {
    return _exErr(
      'Area "' + P.area + '" not found in AREAS.<br>' +
      'Available keys: ' + Object.keys(AREAS).slice(0, 6).join(', ') + '…'
    );
  }

  /* ── First-visit tracking ── */
  var seenKey = a.id + '_seen';
  var isFirst = !!(typeof G !== 'undefined' && !G.discovered[seenKey]);
  if (isFirst && typeof G !== 'undefined') G.discovered[seenKey] = true;

  var desc = (isFirst && a.first) ? a.first : (a.desc || '');
  var html = [];

  /* ── Time-of-day banner ── */
  if (typeof TIME !== 'undefined' && typeof getTimeLabel === 'function') {
    html.push(
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;',
      'padding:6px 10px;background:var(--p2);border:1px solid var(--brd2);font-size:11px">',
        '<span style="color:' + getTimeColor() + ';font-size:14px">' + getTimeIcon() + '</span>',
        '<span style="color:' + getTimeColor() + '">Day ' + TIME.day + ' · ' + getTimeLabel() + '</span>',
        '<span style="color:var(--dim)">—</span>',
        '<span style="color:var(--dim);font-style:italic">' + getTimeAmb() + '</span>',
      '</div>'
    );
  }

  /* ── Title ── */
  html.push('<div class="page-title">' + (a.name || 'Unknown Area') + '</div>');
  html.push('<div class="page-sub">'   + (a.sub  || '')             + '</div>');

  /* ── Description ── */
  html.push('<div class="desc">' + desc + '</div>');

  /* On first visit, also show the permanent desc as a lore block */
  if (isFirst && a.first && a.first !== a.desc && a.desc) {
    html.push('<div class="lorebox">' + a.desc + '</div>');
  }

  /* ── Action buttons ── */
  html.push('<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">');
  if (a.searchable) {
    html.push('<button class="btn" onclick="doExplore()">⚔ Search Area</button>');
  }
  var restLabel = (typeof needsSleep === 'function' && needsSleep())
    ? '💤 Rest <span style="color:#ee4444;font-size:9px">(Exhausted — rest now)</span>'
    : '💤 Rest here';
  html.push('<button class="btn btn-g" onclick="doRest()">' + restLabel + '</button>');
  html.push('</div>');

  /* ── NPCs ── */
  if (a.npcs && a.npcs.length > 0 && typeof NPCS !== 'undefined') {
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

  /* ── Movement ── */
  html.push('<div class="sec">Where to Go</div>');

  if (!a.connections || a.connections.length === 0) {
    html.push('<div style="color:var(--mut);font-size:11px;padding:8px 0">No exits from this area.</div>');
  } else {
    html.push('<div class="move-grid">');
    a.connections.forEach(function (tid) {
      var ta = AREAS[tid];
      if (!ta) return;

      var unlk = (typeof areaUnlocked === 'function') ? areaUnlocked(tid) : true;
      var disc = typeof G !== 'undefined' && !!G.discovered[tid];
      var isNew = unlk && !disc;

      html.push(
        '<div class="move-btn' + (unlk ? '' : ' move-locked') + '"',
        unlk ? ' onclick="doTravel(\'' + tid + '\')"' : '',
        '>',
          '<div class="move-name">' + (ta.name || tid)    + '</div>',
          '<div class="move-sub">'  + (ta.sub  || '')     + '</div>',
          !unlk ? '<div class="move-req">🔒 ' + (ta.reqDesc || 'Locked') + '</div>' : '',
          isNew  ? '<div class="move-new">★ Unexplored</div>' : '',
        '</div>'
      );
    });
    html.push('</div>');
  }

  return html.join('');
}

/* ── EXPLORE SIDEBAR ─────────────────── */
function renderExploreSide() {
  var html = [];

  /* Active quests */
  html.push('<div class="sec">Active Quests</div>');
  if (typeof QUESTS !== 'undefined' && typeof questActive === 'function') {
    var active = Object.keys(QUESTS).filter(function (qid) { return questActive(qid); });
    if (active.length === 0) {
      html.push('<div style="font-size:11px;color:var(--mut)">No active quests.</div>');
    } else {
      active.forEach(function (qid) {
        var q  = QUESTS[qid];
        var qs = (typeof questState === 'function') ? questState(qid) : { stage:0 };
        html.push(
          '<div style="margin-bottom:8px">',
            '<div style="font-size:11px;color:var(--gold)">' + q.name + '</div>',
            '<div style="font-size:10px;color:var(--mut);margin-top:2px;line-height:1.5">' + (q.stages[qs.stage] || '') + '</div>',
          '</div>'
        );
      });
    }
  } else {
    html.push('<div style="font-size:10px;color:var(--dim)">Quests loading…</div>');
  }

  /* Enemies in area */
  var a = (typeof AREAS !== 'undefined' && typeof P !== 'undefined') ? AREAS[P.area] : null;
  html.push('<div class="sec">Enemies Here</div>');

  if (a && a.enemies && a.enemies.length > 0 && typeof ENEMIES !== 'undefined') {
    a.enemies.forEach(function (eid) {
      var e = ENEMIES[eid];
      if (!e) return;
      /* Night bonus indicator */
      var nightTag = '';
      if (typeof isNight === 'function' && isNight()) {
        nightTag = '<span style="font-size:9px;color:#8899cc;margin-left:4px">🌙 +' +
          (typeof nightAtkBonus === 'function' ? nightAtkBonus() : 0) + ' ATK</span>';
      }
      html.push(
        '<div style="padding:4px 0;border-bottom:1px solid var(--brd2)">',
          '<div style="color:#ff6655;font-size:11px">' + e.n + nightTag + '</div>',
          '<div style="font-size:9px;color:var(--dim);margin-top:1px">AC ' + e.ac + ' · HP ' + e.maxHp + '</div>',
        '</div>'
      );
    });
  } else {
    html.push('<div style="font-size:10px;color:var(--mut)">No enemies in this area.</div>');
  }

  return html.join('');
}

/* ── ERROR HELPER (local) ────────────── */
function _exErr(msg) {
  return [
    '<div style="margin:10px;padding:14px;color:#ff8877;font-size:12px;',
    'line-height:1.9;border:1px solid #4a1a1a;background:#0e0505">',
    '⚠ ' + msg + '<br>',
    '<small style="color:var(--mut)">Open F12 → Console to see the exact error.</small>',
    '</div>'
  ].join('');
}