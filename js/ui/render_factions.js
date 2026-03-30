/* ═══════════════════════════════════════
   ECHOES OF AETHON — Factions Renderer
   Shows reputation with all five
   factions and what each tier unlocks.
   ════════════════════════════════════ */

function renderFactions() {
  var html = [];

  html.push('<div class="page-title">Factions of Aethon</div>');
  html.push('<div class="page-sub">Your standing affects dialogue, prices, and access</div>');

  var factions = ['verath', 'shade', 'drowned', 'ash', 'warden'];

  factions.forEach(function (f) {
    var tier  = repTier(f);
    var label = repLabel(f);
    var color = repColor(f);
    var val   = REP[f] || 0;
    var pct   = ((val + 100) / 200) * 100; /* 0–100% bar */
    var icon  = factionIcon(f);
    var desc  = factionDesc(f);

    /* Tier perks */
    var perks = _factionPerks(f, tier);

    html.push(
      '<div style="background:var(--p2);border:1px solid var(--brd2);padding:12px 14px;margin-bottom:8px">',

      /* Header row */
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">',
        '<div>',
          '<div style="font-family:Georgia,serif;font-size:15px;color:var(--gold)">' + icon + ' ' + factionName(f) + '</div>',
          '<div style="font-size:10px;color:var(--mut);margin-top:2px">' + desc + '</div>',
        '</div>',
        '<div style="text-align:right">',
          '<div style="font-size:14px;color:' + color + ';font-family:Georgia,serif">' + label + '</div>',
          '<div style="font-size:10px;color:var(--mut)">' + val + ' / 100</div>',
        '</div>',
      '</div>',

      /* Rep bar */
      '<div style="height:7px;background:#0a0c12;border:1px solid var(--brd2);overflow:hidden;margin-bottom:8px">',
        '<div style="height:100%;width:' + pct + '%;background:' + color + ';transition:width .4s"></div>',
      '</div>',

      /* Tier ladder */
      '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">',
        _tierBadge(-3, tier), _tierBadge(-2, tier), _tierBadge(-1, tier),
        _tierBadge(0,  tier), _tierBadge(1,  tier), _tierBadge(2,  tier),
        _tierBadge(3,  tier),
      '</div>',

      /* Perks */
      perks.length > 0
        ? '<div style="font-size:10px;color:var(--mut);line-height:1.7">' + perks.join('<br>') + '</div>'
        : '<div style="font-size:10px;color:var(--dim)">Reach Friendly to unlock perks.</div>',

      '</div>'
    );
  });

  return html.join('');
}

function renderFactionsSide() {
  var html = [];

  html.push(
    '<div class="sec">How Reputation Works</div>',
    '<div style="font-size:10px;color:var(--mut);line-height:1.8">',
    'Complete quests for factions to raise standing.<br><br>',
    'Higher standing unlocks:<br>',
    '• Better prices from faction traders<br>',
    '• Extra XP from faction enemies<br>',
    '• Unique dialogue options<br>',
    '• Access to faction-only areas<br><br>',
    'Hostile factions may refuse to speak with you.',
    '</div>'
  );

  /* Quick summary */
  html.push('<div class="sec" style="margin-top:10px">Standing</div>');
  ['verath','shade','drowned','ash','warden'].forEach(function (f) {
    var col = repColor(f);
    html.push(
      '<div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px">',
        '<span>' + factionIcon(f) + ' ' + factionName(f) + '</span>',
        '<span style="color:' + col + '">' + repLabel(f) + '</span>',
      '</div>'
    );
  });

  return html.join('');
}

/* ── HELPERS ─────────────────────────── */

function _tierBadge(tier, current) {
  var names = {'-3':'Hostile','-2':'Unfriendly','-1':'Wary','0':'Neutral','1':'Friendly','2':'Honored','3':'Exalted'};
  var active = tier === current;
  var past   = tier < current;
  var col    = active ? 'var(--gold)' : past ? '#44ee66' : 'var(--dim)';
  var brd    = active ? 'var(--gold)' : past ? '#1a4a1a' : 'var(--brd2)';
  return '<span style="font-size:8px;padding:1px 5px;border:1px solid ' + brd + ';color:' + col + '">' + names[String(tier)] + '</span>';
}

function _factionPerks(f, tier) {
  var perks = [];
  if (tier >= 1) perks.push('✓ Friendly: 5% discount with ' + factionName(f) + ' traders');
  if (tier >= 2) perks.push('✓ Honored: 15% discount · 25% bonus XP from faction enemies');
  if (tier >= 3) perks.push('✓ Exalted: 25% discount · Access to exclusive faction items');
  if (tier <= -2) perks.push('✗ Unfriendly: Some dialogue options unavailable');
  if (tier <= -3) perks.push('✗ Hostile: Faction NPCs refuse to speak with you');
  return perks;
}