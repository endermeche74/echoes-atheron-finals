/* ═══════════════════════════════════════
   ECHOES OF AETHON — Explore Renderer
   • Time-of-day banner
   • Horizon hints for adjacent areas
   • Signpost panels at crossroads
   • ! markers on NPCs with quests
   • Quest indicators in sidebar
   ════════════════════════════════════ */

function renderExplore() {
  if (typeof AREAS === 'undefined') return _exErr('AREAS not loaded — check js/data/areas.js');
  if (typeof P    === 'undefined') return _exErr('Player state not loaded — check js/systems/state.js');

  var a = AREAS[P.area];
  if (!a) return _exErr('Area "' + P.area + '" not in AREAS. Check areas_patch.js loaded after areas.js.');

  var seenKey = a.id + '_seen';
  var isFirst = typeof G !== 'undefined' && !G.discovered[seenKey];
  if (isFirst && typeof G !== 'undefined') G.discovered[seenKey] = true;

  var desc = (isFirst && a.first) ? a.first : (a.desc || '');
  var html = [];

  /* ── Time banner ── */
  if (typeof TIME !== 'undefined' && typeof getTimeLabel === 'function') {
    html.push(
      '<div style="display:flex;align-items:center;gap:10px;padding:6px 10px;',
      'background:var(--p2);border:1px solid var(--brd2);margin-bottom:10px;font-size:11px">',
        '<span style="font-size:15px">' + getTimeIcon() + '</span>',
        '<span style="color:' + getTimeColor() + '">Day ' + TIME.day + ' — ' + getTimeLabel() + '</span>',
        '<span style="color:var(--dim);font-style:italic;font-size:10px">' + getTimeAmb() + '</span>',
      '</div>'
    );
  }

  /* ── Title ── */
  html.push('<div class="page-title">' + (a.name || '') + '</div>');
  html.push('<div class="page-sub">'   + (a.sub  || '') + '</div>');
  html.push('<div class="desc">'       + desc           + '</div>');

  if (isFirst && a.first && a.first !== a.desc && a.desc) {
    html.push('<div class="lorebox">' + a.desc + '</div>');
  }

  /* ── Signpost panel (crossroads only) ── */
  if (a.signpost && a.signpost.length > 0) {
    html.push(
      '<div style="background:var(--p2);border:1px solid var(--brd);padding:12px 14px;margin-bottom:12px">',
        '<div style="font-size:10px;color:var(--gold2);text-transform:uppercase;',
        'letter-spacing:2px;margin-bottom:10px">⬡ Signpost</div>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
    );
    a.signpost.forEach(function(s) {
      html.push(
        '<div style="padding:6px 8px;border:1px solid var(--brd2);background:var(--p3)">',
          '<div style="font-size:12px;color:var(--gold)">' + s.dir + ' &nbsp; ' + s.label + '</div>',
          '<div style="font-size:10px;color:var(--mut);margin-top:2px">' + s.sub + '</div>',
        '</div>'
      );
    });
    html.push('</div></div>');
  }

  /* ── Action buttons ── */
  html.push('<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">');
  if (a.searchable) {
    html.push('<button class="btn" onclick="doExplore()">⚔ Search Area</button>');
  }
  var restWarn = (typeof needsSleep === 'function' && needsSleep())
    ? ' <span style="color:#ee4444;font-size:9px">⚠ Exhausted</span>' : '';
  html.push('<button class="btn btn-g" onclick="doRest()">💤 Rest' + restWarn + '</button>');
  html.push('</div>');

  /* ── NPC list with quest markers ── */
  if (a.npcs && a.npcs.length > 0 && typeof NPCS !== 'undefined') {
    html.push('<div class="sec">People Here</div>');
    a.npcs.forEach(function(id) {
      var npc = NPCS[id];
      if (!npc) return;

      /* Quest marker: show ! if NPC has an available quest */
      var hasQuest = _npcHasQuest(id);
      var badge    = '';
      if      (npc.faction === 'shade')   badge = '<span class="npc-faction f-shade">Shade Company</span>';
      else if (npc.faction === 'drowned') badge = '<span class="npc-faction f-drowned">The Drowned</span>';
      else if (npc.faction === 'ash')     badge = '<span class="npc-faction f-ash">Ash-folk</span>';
      else if (npc.faction === 'warden')  badge = '<span class="npc-faction f-warden">Stone Warden</span>';

      html.push(
        '<div class="npc-card" onclick="openDlg(\'' + id + '\')">',
          '<div>',
            '<div style="font-size:13px">' + npc.n +
              (hasQuest
                ? ' <span style="color:var(--gold);font-size:13px;font-weight:bold" title="Has a quest for you">!</span>'
                : '') +
            '</div>',
            '<div style="font-size:10px;color:var(--mut)">' + npc.title + '</div>',
            badge,
          '</div>',
          '<span style="color:var(--mut)">▶</span>',
        '</div>'
      );
    });
  }

  /* ── Movement panel ── */
  html.push('<div class="sec">Where to Go</div>');

  if (!a.connections || a.connections.length === 0) {
    html.push('<div style="color:var(--mut);font-size:11px;padding:6px 0">No exits from this area.</div>');
  } else {
    html.push('<div class="move-grid">');
    a.connections.forEach(function(tid) {
      var ta   = AREAS[tid];
      if (!ta) return;
      var unlk = (typeof areaUnlocked === 'function') ? areaUnlocked(tid) : true;
      var disc = typeof G !== 'undefined' && !!G.discovered[tid];
      var isNew = unlk && !disc;

      /* Horizon preview for undiscovered adjacent areas */
      var horizonText = '';
      if (!disc && ta.horizon) {
        horizonText = '<div style="font-size:9px;color:var(--mut);font-style:italic;margin-top:3px">' + ta.horizon + '</div>';
      }

      html.push(
        '<div class="move-btn' + (unlk ? '' : ' move-locked') + '"',
        unlk ? ' onclick="doTravel(\'' + tid + '\')"' : '',
        '>',
          '<div class="move-name">' + (disc ? ta.name : '??? Unknown area') + '</div>',
          disc
            ? '<div class="move-sub">' + (ta.sub || '') + '</div>'
            : '',
          !disc && !unlk
            ? '<div class="move-req">🔒 ' + (ta.reqDesc || 'Locked') + '</div>'
            : '',
          isNew ? '<div class="move-new">★ Unexplored</div>' : '',
          horizonText,
        '</div>'
      );
    });
    html.push('</div>');
  }

  /* ── Horizon line for current area ── */
  if (a.horizon) {
    html.push(
      '<div style="margin-top:12px;padding:8px 12px;border-left:2px solid var(--dim);',
      'font-size:11px;color:var(--dim);font-style:italic">' + a.horizon + '</div>'
    );
  }

  return html.join('');
}

/* ── SIDEBAR ─────────────────────────── */
function renderExploreSide() {
  var html = [];
  var a    = (typeof AREAS !== 'undefined' && typeof P !== 'undefined') ? AREAS[P.area] : null;

  /* Active quests */
  html.push('<div class="sec">Active Quests</div>');
  if (typeof QUESTS !== 'undefined' && typeof questActive === 'function') {
    var active = Object.keys(QUESTS).filter(function(q) { return questActive(q); });
    if (active.length === 0) {
      html.push('<div style="font-size:11px;color:var(--mut);line-height:1.6">',
        'No active quests.<br>',
        '<span style="font-size:10px;color:var(--dim)">Look for NPCs marked with <span style="color:var(--gold)">!</span> — they have work for you.</span>',
        '</div>');
    } else {
      active.forEach(function(qid) {
        var q  = QUESTS[qid];
        var qs = (typeof questState === 'function') ? questState(qid) : {stage:0};
        html.push(
          '<div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--brd2)">',
            '<div style="font-size:11px;color:var(--gold)">' + q.name + '</div>',
            '<div style="font-size:10px;color:var(--mut);margin-top:2px;line-height:1.5">' +
              (q.stages[qs.stage] || '') + '</div>',
          '</div>'
        );
      });
    }
  }

  /* Enemies */
  html.push('<div class="sec">Enemies Here</div>');
  if (a && a.enemies && a.enemies.length > 0 && typeof ENEMIES !== 'undefined') {
    a.enemies.forEach(function(eid) {
      var e = ENEMIES[eid];
      if (!e) return;
      var nightMod = (typeof isNight === 'function' && isNight())
        ? '<span style="font-size:9px;color:#8899cc"> 🌙+2 ATK</span>' : '';
      html.push(
        '<div style="padding:4px 0;border-bottom:1px solid var(--brd2)">',
          '<div style="color:#ff6655;font-size:11px">' + e.n + nightMod + '</div>',
          '<div style="font-size:9px;color:var(--dim);margin-top:1px">AC ' + e.ac + ' · HP ' + e.maxHp + '</div>',
        '</div>'
      );
    });
  } else {
    html.push('<div style="font-size:10px;color:var(--mut)">No enemies in this area.</div>');
  }

  return html.join('');
}

/* ── HELPERS ─────────────────────────── */

/** Returns true if any quest is giver-matched to this NPC and not yet started */
function _npcHasQuest(npcId) {
  if (typeof QUESTS === 'undefined') return false;
  return Object.keys(QUESTS).some(function(qid) {
    var q  = QUESTS[qid];
    var qs = (typeof questState === 'function') ? questState(qid) : {status:'inactive'};
    return q.giver === npcId && qs.status === 'inactive';
  });
}

function _exErr(msg) {
  return '<div style="margin:10px;padding:14px;color:#ff8877;font-size:12px;' +
    'line-height:1.9;border:1px solid #4a1a1a;background:#0e0505">' +
    '⚠ ' + msg + '<br><small style="color:var(--mut)">F12 → Console for details.</small></div>';
}