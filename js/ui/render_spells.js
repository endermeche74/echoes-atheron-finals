/* ═══════════════════════════════════════
   ECHOES OF AETHON — Spellbook Renderer
   ════════════════════════════════════ */

function renderSpellbook() {
  var html = [];

  html.push('<div class="page-title">Spellbook</div>');

  if (P.spells.length === 0) {
    html.push(
      '<div class="page-sub">No spells learned yet</div>',
      '<div class="lorebox">',
      'The arcane arts of Aethon are preserved in tomes — small books whose pages do not yellow and whose ink does not fade. ',
      'Each civilization developed its own school of magic; what survives are fragments, collected by traders and scattered through the ruins.',
      '</div>',
      '<div style="color:var(--mut);font-size:12px;margin-top:10px;line-height:1.7">',
      'Find spell tomes by:<br>',
      '• Exploring ruins and searching areas<br>',
      '• Defeating enemies (some drop tomes)<br>',
      '• Buying from Yesta in Verath\'s Gate<br><br>',
      'Use a tome from your Inventory to learn its spell.',
      '</div>'
    );
    return html.join('');
  }

  html.push('<div class="page-sub">' + P.spells.length + ' spell' + (P.spells.length !== 1 ? 's' : '') + ' learned — usable in combat</div>');
  html.push('<div class="spell-grid">');

  P.spells.forEach(function (sid) {
    var sp = SPELLS[sid];
    if (!sp) return;

    /* School colour */
    var schoolColors = {
      'Fire':      '#ff6633',
      'Ice':       '#44bbff',
      'Lightning': '#ffee44',
      'Shadow':    '#9944cc',
      'Holy':      '#fff0aa',
      'Earth':     '#aa7733',
      'Void':      '#6600cc'
    };
    var col = schoolColors[sp.school] || 'var(--mut)';

    html.push(
      '<div class="sp-card">',
      '<div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:' + col + ';margin-bottom:3px">' + sp.school + ' Magic</div>',
      '<div class="' + rarC(sp.rar) + '" style="font-family:Georgia,serif;font-size:14px;margin-bottom:4px">' + sp.name + '</div>',
      '<div style="font-size:10px;color:var(--mut)">' + sp.mp + ' MP · ' + rarN(sp.rar) + '</div>',
      '<div style="font-size:11px;color:#8090b0;margin-top:5px;font-style:italic;line-height:1.6">' + sp.desc + '</div>',
      '<div style="font-size:10px;color:var(--dim);margin-top:6px;font-style:italic">"' + sp.flavor + '"</div>',
      '</div>'
    );
  });

  html.push('</div>');
  return html.join('');
}

function renderSpellbookSide() {
  var html = [];

  /* Schools known */
  var schools = [];
  P.spells.forEach(function (sid) {
    var sp = SPELLS[sid];
    if (sp && schools.indexOf(sp.school) === -1) schools.push(sp.school);
  });

  html.push('<div class="sec">Schools Known</div>');
  if (schools.length === 0) {
    html.push('<div style="font-size:11px;color:var(--mut)">None yet.</div>');
  } else {
    schools.forEach(function (s) {
      html.push('<div style="font-size:11px;margin-bottom:4px;color:var(--txt)">' + s + '</div>');
    });
  }

  html.push(
    '<div class="sec" style="margin-top:12px">Notes</div>',
    '<div style="font-size:10px;color:var(--mut);line-height:1.8">',
    'Spells scale with <span style="color:var(--gold)">MIND</span> stat.<br><br>',
    '<span style="color:#6600cc">Void</span> spells bypass all resistances.<br>',
    '<span style="color:#fff0aa">Holy</span> spells deal ×1.6 vs undead.<br>',
    '<span style="color:#44bbff">Ice</span> spells can Freeze targets.<br>',
    '<span style="color:#ffee44">Lightning</span> spells can Stun targets.<br>',
    '<span style="color:#9944cc">Shadow</span> drain spells heal you.',
    '</div>'
  );

  return html.join('');
}