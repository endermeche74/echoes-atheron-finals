/* ═══════════════════════════════════════
   ECHOES OF AETHON — Dialogue System
   Stack-based NPC conversation engine.
   ════════════════════════════════════ */

/* ── OPEN / CLOSE ────────────────────────── */

/**
 * Begin a conversation with an NPC.
 * @param {string} npcId
 */
function openDlg(npcId) {
  sfxDlg();
  DLG = { on: true, npc: npcId, stack: ['root'] };
  addLog('Speaking with ' + NPCS[npcId].n + '.', 'd');
  render();
}

/** End the current dialogue and return to explore. */
function closeDlg() {
  DLG.on = false;
  render();
}

/* ── NODE HELPERS ────────────────────────── */

/** Returns the node object at the top of the navigation stack. */
function currentDlgNode() {
  var npc  = NPCS[DLG.npc];
  var key  = DLG.stack[DLG.stack.length - 1];
  return npc.nodes[key];
}

/**
 * Build the visible choice list for a dialogue node.
 * Filters quest-gated choices, then appends Back / Leave.
 * @param {object} node
 * @returns {Array}
 */
function getDlgChoices(node) {
  var choices = (node.c || []).filter(function (ch) {

    /* "Return quest item" — only show when quest is active at stage 1
       and the player actually has the required items. */
    if (ch.a === 'quest_return') {
      var qs = questState(ch.quest);
      if (!questActive(ch.quest))                   return false;
      if (qs.stage !== 1)                           return false;
      if (itemCount(ch.needs) < (ch.needsCount||1)) return false;
    }

    /* "Start quest" — only show when quest hasn't been started. */
    if (ch.a === 'start_quest') {
      if (questActive(ch.quest) || questDone(ch.quest)) return false;
    }

    return true;
  });

  /* Navigation footer */
  if (DLG.stack.length > 1) {
    choices = choices.concat([{ l: '◀ Back', special: 'back' }]);
  }
  choices = choices.concat([{ l: 'Leave', special: 'leave' }]);

  return choices;
}

/* ── CHOICE HANDLER ──────────────────────── */

/**
 * Called when the player clicks a dialogue option.
 * @param {number} i - Index into getDlgChoices() result
 */
function dlgChoice(i) {
  sfxClick();
  var node    = currentDlgNode();
  var choices = getDlgChoices(node);
  var ch      = choices[i];
  if (!ch) return;

  /* Special navigation */
  if (ch.special === 'leave') { closeDlg(); return; }
  if (ch.special === 'back')  {
    DLG.stack.pop();
    if (DLG.stack.length === 0) DLG.stack = ['root'];
    render();
    return;
  }

  /* Run any action attached to this choice */
  if (ch.a) handleDlgAct(ch);

  /* Push next node onto stack (if defined) */
  if (ch.n) {
    DLG.stack.push(ch.n);
  }

  render();
}

/* ── ACTION HANDLER ──────────────────────── */

/**
 * Execute the side-effect of a dialogue choice.
 * @param {object} ch - Choice object with .a action field
 */
function handleDlgAct(ch) {

  /* Inn rest */
  if (ch.a === 'rest') {
    if (P.gold >= 20) {
      P.gold -= 20;
      P.hp    = P.maxHp;
      P.mp    = P.maxMp;
      addLog('Rested at inn. Fully restored. (-20g)', 's');
    } else {
      addLog('Not enough gold for a room (need 20g).', 'n');
    }
  }

  /* Skill teaching */
  if (ch.a === 'teach')       { gainXP('lore',      55); addLog('Studied with Aldric. (+55 Lore XP)', 's'); }
  if (ch.a === 'teach_blade') { gainXP('blade',     55); addLog('Ravan teaches. (+55 Blade XP)', 's'); }
  if (ch.a === 'teach_myst')  { gainXP('mysticism', 55); addLog('Seiran teaches. (+55 Mysticism XP)', 's'); }
  if (ch.a === 'teach_arch')  { gainXP('archery',   55); addLog('Wynn teaches. (+55 Archery XP)', 's'); }
  if (ch.a === 'teach_lore')  { gainXP('lore',      30); addLog('Learned rune grammar. (+30 Lore XP)', 's'); }

  /* Buy item */
  if (ch.a === 'buy') {
    if (P.gold >= (ch.cost || 0)) {
      P.gold -= ch.cost;
      P.inv.push(ch.item);
      sfxPickup();
      addLog('Purchased: ' + ITEMS[ch.item].n + '. (-' + ch.cost + 'g)', 'g');
    } else {
      addLog('Not enough gold (need ' + ch.cost + 'g).', 'n');
    }
  }

  /* Give item (no cost) */
  if (ch.a === 'give_item') {
    P.inv.push(ch.item);
    sfxPickup();
    addLog('Received: ' + ITEMS[ch.item].n + '.', 'i');
  }

  /* Start a quest */
  if (ch.a === 'start_quest') {
    startQuest(ch.quest);
  }

  /* Return quest items */
  if (ch.a === 'quest_return') {
    /* Remove required items from inventory */
    if (ch.take) {
      var needed = ch.needsCount || 1;
      for (var n = 0; n < needed; n++) {
        var idx = P.inv.indexOf(ch.needs);
        if (idx !== -1) P.inv.splice(idx, 1);
      }
    }
    /* Set the flag that checkAdvance() looks for */
    G.flags[ch.flag] = true;
    checkQuestProgress();
  }
}