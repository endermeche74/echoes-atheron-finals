/* ═══════════════════════════════════════
   ECHOES OF AETHON — Quest System
   Updated: applyQuestRep() called when
   a quest is completed.
   ════════════════════════════════════ */

function questState(qid) {
  return P.quests[qid] || { status:'inactive', stage:0 };
}
function questActive(qid)   { return questState(qid).status === 'active';   }
function questDone(qid)     { return questState(qid).status === 'complete'; }
function questInactive(qid) { return questState(qid).status === 'inactive'; }

function itemCount(id) {
  var n = 0;
  P.inv.forEach(function (i) { if (i === id) n++; });
  return n;
}

/* ── START ───────────────────────────── */
function startQuest(qid) {
  if (questActive(qid) || questDone(qid)) return;
  P.quests[qid] = { status:'active', stage:0 };
  if (typeof sfxQuest === 'function') sfxQuest();
  addLog('📋 Quest started: ' + QUESTS[qid].name + '.', 'd');
}

/* ── PROGRESS CHECK ──────────────────── */
function checkQuestProgress() {
  Object.keys(QUESTS).forEach(function (qid) {
    var q  = QUESTS[qid];
    var qs = questState(qid);
    if (qs.status !== 'active') return;

    if (q.checkAdvance(qs.stage)) {
      qs.stage++;

      if (qs.stage >= q.stages.length - 1) {
        /* Complete */
        qs.status = 'complete';
        if (typeof sfxQuest === 'function') sfxQuest();
        addLog('✦ Quest Complete: ' + q.name + '!', 's');
        giveQuestReward(q);

        /* Reputation reward */
        if (typeof applyQuestRep === 'function') applyQuestRep(qid);

        /* Auto-save on quest completion */
        if (typeof saveGame === 'function') saveGame();

      } else {
        addLog('📋 Quest Updated: ' + q.name, 'd');
      }
    }
  });
}

/* ── REWARDS ─────────────────────────── */
function giveQuestReward(q) {
  if (!q.reward) return;

  if (q.reward.gold) {
    P.gold += q.reward.gold;
    addLog('  +' + q.reward.gold + 'g', 'g');
  }

  if (q.reward.items) {
    q.reward.items.forEach(function (iid) {
      P.inv.push(iid);
      if (typeof sfxPickup === 'function') sfxPickup();
      addLog('  Received: ' + ITEMS[iid].n + '.', 'i');
    });
  }

  if (q.reward.xp) {
    Object.keys(q.reward.xp).forEach(function (sk) {
      if (typeof gainXP === 'function') gainXP(sk, q.reward.xp[sk]);
    });
  }
}