/* ═══════════════════════════════════════
   ECHOES OF AETHON — World Map Renderer
   ════════════════════════════════════ */

/* Region groupings for display */
var MAP_REGIONS = [
  { key:'verath',     label:"Verath's Gate",       areas:['verath_arch','verath_market','verath_inn','verath_smithy','verath_scholar','verath_columns','verath_undercity'] },
  { key:'wilderness', label:"The Wilderness",       areas:['wilderness_road'] },
  { key:'arena',      label:"The Broken Colosseum", areas:['arena_approach','arena_outer','arena_floor','arena_hall','arena_vault'] },
  { key:'monastery',  label:"Ironbell Monastery",   areas:['monastery_path','monastery_court','monastery_bells','monastery_deep'] },
  { key:'piers',      label:"The Sunken Piers",      areas:['piers_shore','piers_dock','piers_guild','piers_diving'] },
  { key:'ashwood',    label:"The Ashwood",           areas:['ashwood_edge','ashwood_deep','ashwood_hollow','ashwood_shrine'] },
  { key:'keep',       label:"The Runic Keep",        areas:['keep_approach','keep_gate','keep_hall','keep_depths'] }
];

function renderMap() {
  var html = [];

  html.push('<div class="page-title">World Map — Aethon</div>');
  html.push('<div class="page-sub">Click any unlocked area to travel there directly</div>');

  MAP_REGIONS.forEach(function (rg) {
    html.push('<div class="sec">' + rg.label + '</div>');
    html.push('<div class="map-grid">');

    rg.areas.forEach(function (aid) {
      var a    = AREAS[aid];
      if (!a) return;
      var unlk = areaUnlocked(aid);
      var cur  = P.area === aid;
      var disc = !!G.discovered[aid];

      html.push(
        '<div class="map-cell' + (cur ? ' cur' : '') + (unlk ? '' : ' locked') + '"',
        unlk ? ' onclick="goToArea(\'' + aid + '\')"' : '',
        '>',
        '<div style="font-family:Georgia,serif;font-size:12px;color:var(--gold);margin-bottom:2px">',
          (cur ? '▶ ' : '') + (disc ? a.name : '???'),
        '</div>',
        '<div style="font-size:10px;color:var(--mut);line-height:1.4">' + (disc ? a.sub : 'Unexplored') + '</div>',
        !unlk ? '<div style="font-size:9px;color:#774422;margin-top:3px">🔒 ' + a.reqDesc + '</div>' : '',
        cur   ? '<div style="font-size:9px;color:var(--gold);margin-top:3px">You are here</div>' : '',
        '</div>'
      );
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
    'Areas found: <span style="color:var(--gold)">' + discCount + '</span> / ' + totalAreas + '<br>',
    'Total Skill Lv: <span style="color:var(--gold)">' + totSkl() + '</span><br>',
    'Keep requires: <span style="color:var(--gold)">100</span>',
    '</div>'
  );

  html.push('<div class="sec" style="margin-top:12px">Unlock Requirements</div>');
  MAP_REGIONS.forEach(function (rg) {
    /* Find any area in the region that has a req */
    var req = null;
    for (var i = 0; i < rg.areas.length; i++) {
      var a = AREAS[rg.areas[i]];
      if (a && a.req) { req = a; break; }
    }
    var unlk = !req || areaUnlocked(req.id);
    html.push(
      '<div style="font-size:10px;margin-bottom:4px">',
      '<span style="color:' + (unlk ? '#44ee66' : '#443322') + '">' + (unlk ? '✓' : '✗') + ' </span>',
      '<span style="color:' + (unlk ? 'var(--txt)' : 'var(--dim)') + '">' + rg.label + '</span>',
      req && !unlk ? '<div style="color:#554433;font-size:9px;margin-top:1px">' + req.reqDesc + '</div>' : '',
      '</div>'
    );
  });

  return html.join('');
}