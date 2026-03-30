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
    '</span></div>'
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

  /* Faction badge */
  if (npc.faction === 'shade') {
    html.push('<span class="npc-faction f-shade">Shade Company<br><span style="font-size:9px;font-weight:normal">Arena ghosts with purpose</span></span>');
  } else if (npc.faction === 'drowned') {
    html.push('<span class="npc-faction f-drowned">The Drowned<br><span style="font-size:9px">Conscious undead of the Piers</span></span>');
  } else if (npc.faction === 'ash') {
    html.push('<span class="npc-faction f-ash">Ash-folk<br><span style="font-size:9px">Survivors changed by the burning</span></span>');
  } else if (npc.faction === 'warden') {
    html.push('<span class="npc-faction f-warden">Stone Wardens<br><span style="font-size:9px">Ancient constructs of the Keep</span></span>');
  }

  html.push(
    '<div style="margin-top:12px;font-size:10px;color:var(--mut);line-height:1.8">',
    '◀ Back navigates within the conversation.<br>',
    'Leave ends the conversation.<br><br>',
    'Some NPCs offer quests, teach skills, or sell items.',
    '</div>'
  );

  return html.join('');
}