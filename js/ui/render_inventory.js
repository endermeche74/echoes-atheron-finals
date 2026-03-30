/* ═══════════════════════════════════════
   ECHOES OF AETHON — Inventory Renderer
   Unequipped gear shows [Equip] + [Sell]
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
        id ? '<button class="btn btn-r" style="font-size:9px;padding:2px 7px;margin-top:4px" onclick="doUnequip(\'' + sl + '\')">Remove</button>' : '',
      '</div>'
    );
  });
  html.push('</div>');

  /* ── Inventory ── */
  var cnts = {};
  P.inv.forEach(function (i) { cnts[i] = (cnts[i] || 0) + 1; });
  var uni = [];
  P.inv.forEach(function (i) { if (uni.indexOf(i) === -1) uni.push(i); });

  html.push('<div class="sec">Inventory (' + P.inv.length + ')</div>');

  if (uni.length === 0) {
    html.push('<div style="color:var(--mut);padding:10px">Nothing carried.</div>');
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

      /* Action area */
      var actHtml = '';
      var isGear  = (it.type === 'weapon' || it.type === 'armor' || it.type === 'accessory');

      if (isGear) {
        if (isEq) {
          actHtml = '<span style="color:var(--gold);font-size:9px;display:block;margin-top:4px">✓ Equipped — click to unequip</span>';
        } else {
          var sv2 = (typeof gearSellValue === 'function') ? gearSellValue(it) : 5;
          actHtml = [
            '<div style="display:flex;gap:3px;margin-top:5px">',
              '<button class="btn btn-b" style="font-size:9px;padding:2px 7px;flex:1" ',
                'onclick="event.stopPropagation();itemAct(\'' + id + '\')">Equip</button>',
              '<button class="btn btn-r" style="font-size:9px;padding:2px 7px" ',
                'onclick="event.stopPropagation();sellGearItem(\'' + id + '\')">Sell ' + sv2 + 'g</button>',
            '</div>'
          ].join('');
        }
      } else if (it.type === 'consumable') {
        actHtml = '<div style="font-size:9px;color:#44ee66;margin-top:4px">[Click to use]</div>';
      } else if (it.type === 'spellbook') {
        var known = P.spells && SPELLS[it.spell] && P.spells.indexOf(it.spell) !== -1;
        actHtml = known
          ? '<div style="font-size:9px;color:var(--mut);margin-top:4px">Spell known</div>'
          : '<div style="font-size:9px;color:#cc44ff;margin-top:4px">[Click to learn]</div>';
      } else if (it.type === 'misc') {
        actHtml = '<div style="font-size:9px;color:var(--gold);margin-top:4px">[Click to sell: ' + (it.val || '?') + 'g]</div>';
      }

      html.push(
        '<div class="icard' + (isEq ? ' eqd' : '') + '"',
        /* Only gear toggle & consumable/spellbook/misc use the card click */
        (isGear && !isEq) ? '' : ' onclick="itemAct(\'' + id + '\')"',
        '>',
          '<div style="font-size:9px;color:var(--mut);text-transform:uppercase">',
            '<span class="' + rarC(it.rar) + '">' + rarN(it.rar) + '</span>',
            cnt > 1 ? ' ×' + cnt : '',
          '</div>',
          '<div class="' + rarC(it.rar) + '" style="font-size:13px;margin:2px 0">' + it.n + '</div>',
          stats ? '<div style="font-size:10px;color:#6a9a6a;margin-top:2px">' + stats + '</div>' : '',
          '<div style="font-size:10px;color:var(--mut);margin-top:2px">' + (it.desc || '') + '</div>',
          actHtml,
        '</div>'
      );
    });

    html.push('</div>');
  }

  /* Sell all misc */
  if (uni.some(function (id) { return ITEMS[id] && ITEMS[id].type === 'misc'; })) {
    html.push('<button class="btn btn-g" style="margin-top:8px" onclick="sellAll()">💰 Sell All Relics &amp; Misc</button>');
  }

  return html.join('');
}

function renderInventorySide() {
  var html = [];

  html.push('<div class="sec">Rarities</div>');
  Object.keys(RAR).forEach(function (k) {
    html.push('<div style="font-size:11px;margin-bottom:4px"><span class="' + RAR[k].c + '">■ ' + RAR[k].n + '</span></div>');
  });

  html.push(
    '<div style="margin-top:10px;font-size:10px;color:var(--mut);line-height:1.8">',
      'Gear sell prices by rarity:<br>',
      '<span style="color:#aaa">Common: 8g</span><br>',
      '<span style="color:#44ee66">Uncommon: 20g</span><br>',
      '<span style="color:#4499ff">Rare: 45g</span><br>',
      '<span style="color:#cc44ff">Epic: 100g</span><br>',
      '<span style="color:var(--gold)">Legendary: 250g</span>',
    '</div>'
  );

  return html.join('');
}