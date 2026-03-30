/* ═══════════════════════════════════════
   ECHOES OF AETHON — World Map Renderer
   Fog of war: areas revealed as you enter.
   Adjacent-but-unvisited shown as ???
   Completely unknown: hidden dark cell.
   ════════════════════════════════════ */

var MAP_REGIONS = [
  { key:'verath',     label:"Verath's Gate",       areas:['verath_arch','verath_market','verath_inn','verath_smithy','verath_scholar','verath_columns','verath_undercity'] },
  { key:'wilderness', label:"The Wilderness",       areas:['wilderness_road'] },
  { key:'arena',      label:"The Broken Colosseum", areas:['arena_approach','arena_outer','arena_floor','arena_hall','arena_vault'] },
  { key:'monastery',  label:"Ironbell Monastery",   areas:['monastery_path','monastery_court','monastery_bells','monastery_deep'] },
  { key:'piers',      label:"The Sunken Piers",      areas:['piers_shore','piers_dock','piers_guild','piers_diving'] },
  { key:'ashwood',    label:"The Ashwood",           areas:['ashwood_edge','ashwood_deep','ashwood_hollow','ashwood_shrine'] },
  { key:'keep',       label:"The Runic Keep",        areas:['keep_approach','keep_gate','keep_hall','keep_depths'] }
];

function render_maps() {
  var html = [];

  /* Build set of areas adjacent to discovered ones */
  var adjacent = _getAdjacentAreas();

  html.push('<div class="page-title">World Map — Aethon</div>');
  html.push(
    '<div style="font-size:10px;color:var(--mut);margin-bottom:10px;line-height:1.6">',
    'The map reveals itself as you explore. ',
    '<span style="color:#44ee66">■ Discovered</span> ',
    '<span style="color:var(--dim)">■ Adjacent</span> ',
    '<span style="color:#1a2235">■ Unknown</span>',
    '</div>'
  );

  MAP_REGIONS.forEach(function (rg) {
    /* Count discovered in this region */
    var discCount = rg.areas.filter(function (aid) { return !!G.discovered[aid]; }).length;
    var total     = rg.areas.length;

    html.push(
      '<div class="sec">' + rg.label +
      ' <span style="color:var(--dim);font-size:9px;font-weight:normal;letter-spacing:0;text-transform:none">' +
      discCount + '/' + total + ' areas</span></div>'
    );
    html.push('<div class="map-grid">');

    rg.areas.forEach(function (aid) {
      var a     = AREAS[aid];
      if (!a) return;
      var disc  = !!G.discovered[aid];
      var adj   = !!adjacent[aid];
      var cur   = P.area === aid;
      var unlk  = (typeof areaUnlocked === 'function') ? areaUnlocked(aid) : true;

      if (disc) {
        /* ── DISCOVERED ── */
        html.push(
          '<div class="map-cell' + (cur ? ' cur' : '') + (unlk ? '' : ' locked') + '"',
          unlk ? ' onclick="goToArea(\'' + aid + '\')"' : '',
          '>',
            '<div style="font-family:Georgia,serif;font-size:12px;color:var(--gold);margin-bottom:2px">',
              (cur ? '▶ ' : '') + a.name,
            '</div>',
            '<div style="font-size:10px;color:var(--mut);line-height:1.4">' + a.sub + '</div>',
            !unlk ? '<div style="font-size:9px;color:#774422;margin-top:3px">🔒 ' + (a.reqDesc || '') + '</div>' : '',
            cur   ? '<div style="font-size:9px;color:var(--gold);margin-top:3px">▶ You are here</div>' : '',
          '</div>'
        );
      } else if (adj) {
        /* ── ADJACENT (fog) ── */
        html.push(
          '<div class="map-cell" style="opacity:.55;cursor:default;border-color:var(--brd2)">',
            '<div style="font-family:Georgia,serif;font-size:12px;color:var(--dim);margin-bottom:2px">???</div>',
            '<div style="font-size:10px;color:var(--dim);font-style:italic">Unexplored area</div>',
            !unlk
              ? '<div style="font-size:9px;color:#774422;margin-top:3px">🔒 ' + (a.reqDesc || '') + '</div>'
              : '<div style="font-size:9px;color:var(--dim);margin-top:3px">Travel nearby to reveal</div>',
          '</div>'
        );
      } else {
        /* ── UNKNOWN ── */
        html.push(
          '<div style="background:var(--bg);border:1px solid var(--dim);padding:10px;',
          'min-height:70px;display:flex;align-items:center;justify-content:center">',
            '<span style="color:var(--dim);font-size:18px">✦</span>',
          '</div>'
        );
      }
    });

    html.push('</div>');
  });

  return html.join('');
}

function renderMapSide() {
  var totalAreas = Object.keys(AREAS).length;
  var discCount  = Object.keys(G.discovered).filter(function (k) {
    return k.indexOf('_seen') === -1;
  }).length;

  var html = [];
  html.push(
    '<div class="sec">Exploration</div>',
    '<div style="font-size:11px;color:var(--mut);line-height:2">',
      'Areas discovered: <span style="color:var(--gold)">' + discCount + '</span> / ' + totalAreas + '<br>',
      'Total Skill Lv: <span style="color:var(--gold)">' + (typeof totSkl === 'function' ? totSkl() : '?') + '</span><br>',
      'Keep requires: <span style="color:var(--gold)">100</span>',
    '</div>',
    '<div style="margin-top:8px;font-size:10px;color:var(--mut);line-height:1.7">',
      'The map fills in as you explore. Adjacent areas appear as fog until you enter them.',
    '</div>'
  );

  /* Region access */
  html.push('<div class="sec" style="margin-top:10px">Regions</div>');
  MAP_REGIONS.forEach(function (rg) {
    var firstReqArea = null;
    for (var i = 0; i < rg.areas.length; i++) {
      var a = AREAS[rg.areas[i]];
      if (a && a.req) { firstReqArea = a; break; }
    }
    var unlk = !firstReqArea || (typeof areaUnlocked === 'function' && areaUnlocked(firstReqArea.id));
    html.push(
      '<div style="font-size:10px;margin-bottom:5px">',
        '<span style="color:' + (unlk ? '#44ee66' : '#443322') + '">' + (unlk ? '✓' : '✗') + ' ' + rg.label + '</span>',
        firstReqArea && !unlk
          ? '<div style="color:#554433;font-size:9px;margin-top:1px">' + (firstReqArea.reqDesc || '') + '</div>'
          : '',
      '</div>'
    );
  });

  return html.join('');
}

/* ── HELPER: find areas adjacent to discovered ones ── */
function _getAdjacentAreas() {
  var adj = {};
  Object.keys(G.discovered).forEach(function (aid) {
    if (aid.indexOf('_seen') !== -1) return;
    var a = AREAS[aid];
    if (!a || !a.connections) return;
    a.connections.forEach(function (cid) {
      if (!G.discovered[cid]) adj[cid] = true;
    });
  });
  return adj;
}