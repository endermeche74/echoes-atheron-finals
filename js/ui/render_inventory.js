/* ═══════════════════════════════════════
   ECHOES OF AETHON — Inventory Renderer
   ════════════════════════════════════ */

function renderInventory() {
  var eq   = P.eq;
  var html = [];

  /* ── Equipped slots ── */
  html.push('<div class="sec">Equipped</div>');
  html.push('<div class="eq-grid">');
  ['weapon', 'armor', 'accessory'].forEach(function (sl) {
    var id = eq[sl];
    var it = id && ITEMS[id];
    html.push(
      '<div class="eq-sl">',
      '<div class="eq-lbl">' + sl + '</div>',
      '<div class="' + (it ? rarC(it.rar) : '') + '" style="font-size:11px">' + (it ? it.n : '— Empty —') + '</div>',
      id ? '<button class="btn" style="font-size:9px;padding:3px 7px;margin-top:4px" onclick="doUnequip(\'' + sl + '\')">Remove</button>' : '',
      '</div>'
    );
  });
  html.push('</div>');

  /* ── Inventory list ── */
  var cnts = {};
  P.inv.forEach(function (i) { cnts[i] = (cnts[i] || 0) + 1; });
  var uni = [];
  P.inv.forEach(function (i) { if (uni.indexOf(i) === -1) uni.push(i); });

  html.push('<div class="sec">Inventory (' + P.inv.length + ')</div>');

  if (uni.length === 0) {
    html.push('<div style="color:var(--mut);padding:10px">Nothing in inventory.</div>');
  } else {
    html.push('<div class="inv-grid">');
    uni.forEach(function (id) {
      var it   = ITEMS[id];
      if (!it) return;
      var cnt  = cnts[id];
      var isEq = (eq.weapon === id || eq.armor === id || eq.accessory === id);

      /* Stat string */
      var stats = [
        it.atk   ? '+' + it.atk   + ' ATK'  : '',
        it.def   ? '+' + it.def   + ' DEF'  : '',
        it.mpB   ? '+' + it.mpB   + ' MP'   : '',
        it.mindB ? '+' + it.mindB + ' MIND' : '',
        it.hpB   ? '+' + it.hpB   + ' HP'   : '',
        it.critB ? '+' + Math.round(it.critB * 100) + '% Crit' : ''
      ].filter(Boolean).join(' ');

      /* Action hint */
      var actText = '';
      if (isEq) {
        actText = '<span style="color:var(--gold);font-size:9px">✓ Equipped</span>';
      } else if (it.type === 'weapon' || it.type === 'armor' || it.type === 'accessory') {
        actText = '<span style="color:#4499ff;font-size:9px">[Click to equip]</span>';
      } else if (it.type === 'consumable') {
        actText = '<span style="color:#44ee66;font-size:9px">[Click to use]</span>';
      } else if (it.type === 'spellbook') {
        actText = '<span style="color:#cc44ff;font-size:9px">[Click to learn]</span>';
      } else if (it.type === 'misc') {
        actText = '<span style="color:var(--gold);font-size:9px">[Sell: ' + it.val + 'g]</span>';
      }

      html.push(
        '<div class="icard' + (isEq ? ' eqd' : '') + '" onclick="itemAct(\'' + id + '\')">',
        '<div style="font-size:9px;color:var(--mut);text-transform:uppercase">',
        '<span class="' + rarC(it.rar) + '">' + rarN(it.rar) + '</span>',
        cnt > 1 ? ' ×' + cnt : '',
        '</div>',
        '<div class="' + rarC(it.rar) + '" style="font-size:13px;margin:2px 0">' + it.n + '</div>',
        stats ? '<div style="font-size:10px;color:#6a9a6a;margin-top:2px">' + stats + '</div>' : '',
        '<div style="font-size:10px;color:var(--mut);margin-top:2px">' + (it.desc || '') + '</div>',
        '<div style="margin-top:3px">' + actText + '</div>',
        '</div>'
      );
    });
    html.push('</div>');
  }

  /* Sell all misc */
  var hasMisc = uni.some(function (id) { return ITEMS[id] && ITEMS[id].type === 'misc'; });
  if (hasMisc) {
    html.push('<button class="btn btn-g" style="margin-top:8px" onclick="sellAll()">💰 Sell All Relics &amp; Misc</button>');
  }

  return html.join('');
}

function renderInventorySide() {
  var html = [];
  html.push('<div class="sec">Item Rarities</div>');
  Object.keys(RAR).forEach(function (k) {
    html.push('<div style="font-size:11px;margin-bottom:4px"><span class="' + RAR[k].c + '">■ ' + RAR[k].n + '</span></div>');
  });
  html.push(
    '<div style="margin-top:10px;font-size:10px;color:var(--mut);line-height:1.7">',
    'Higher rarity items have better stats and special effects.<br><br>',
    'Find rarer items by defeating stronger enemies in harder regions.',
    '</div>'
  );
  return html.join('');
}