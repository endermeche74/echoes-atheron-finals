/* ═══════════════════════════════════════
   ECHOES OF AETHON — Dialogue Renderer
   ════════════════════════════════════ */

function renderDialogue() {
  var npc     = NPCS[DLG.npc];
  var node    = currentDlgNode();
  var choices = getDlgChoices(node);
  var html    = [];

  html.push(
    '<div class="sec">',
      npc.n,
      ' <span style="color:var(--mut);text-transform:none;letter-spacing:0;font-size:10px;font-style:italic">',
        '— ' + npc.title,
      '</span>',
    '</div>'
  );

  html.push(
    '<div class="dlg-box">',
      '<div class="dlg-g">' + npc.greet + '</div>',
      '<div class="dlg-t">"' + node.t + '"</div>',
    '</div>'
  );

  choices.forEach(function (ch, i) {
    html.push(
      '<button class="btn btn-w" onclick="dlgChoice(' + i + ')">',
        ch.l,
      '</button>'
    );
  });

  return html.join('');
}

function renderDialogueSide() {
  var npc  = NPCS[DLG.npc];
  var html = [];

  html.push(
    '<div class="sec">Speaking With</div>',
    '<div style="font-family:Georgia,serif;font-size:14px;color:var(--gold);margin-bottom:3px">' + npc.n + '</div>',
    '<div style="font-size:10px;color:var(--mut);margin-bottom:10px">' + npc.title + '</div>'
  );

  if (npc.faction === 'shade') {
    html.push('<span class="npc-faction f-shade">Shade Company</span>');
  } else if (npc.faction === 'drowned') {
    html.push('<span class="npc-faction f-drowned">The Drowned</span>');
  } else if (npc.faction === 'ash') {
    html.push('<span class="npc-faction f-ash">Ash-folk</span>');
  } else if (npc.faction === 'warden') {
    html.push('<span class="npc-faction f-warden">Stone Wardens</span>');
  }

  /* Reputation with this NPC's faction */
  if (npc.faction && typeof repLabel === 'function') {
    html.push(
      '<div style="margin-top:10px;font-size:10px">',
        'Standing: <span style="color:' + repColor(npc.faction) + '">' + repLabel(npc.faction) + '</span>',
      '</div>'
    );
  }

  html.push(
    '<div style="margin-top:12px;font-size:10px;color:var(--mut);line-height:1.8">',
      '◀ Back navigates the conversation.<br>',
      'Leave ends it.<br><br>',
      'Some NPCs offer quests, teach skills, sell items, or offer rest.',
    '</div>'
  );

  return html.join('');
}