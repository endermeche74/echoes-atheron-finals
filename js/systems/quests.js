/* ═══════════════════════════════════════
   ECHOES OF AETHON — Quest System
   Tracking, progress checks, rewards.
   ════════════════════════════════════ */

/* ── STATE HELPERS ───────────────────────── */

/** Returns the quest state object for a given quest ID. */
function questState(qid) {
  return P.quests[qid] || { status: 'inactive', stage: 0 };
}

function questActive(qid)   { return questState(qid).status === 'active';   }
function questDone(qid)     { return questState(qid).status === 'complete'; }
function questInactive(qid) { return questState(qid).status === 'inactive'; }

/* ── ITEM COUNT ──────────────────────────── */

/** Count how many of a given item ID are in the player's inventory. */
function itemCount(id) {
  var n = 0;
  P.inv.forEach(function (i) { if (i === id) n++; });
  return n;
}

/* ── START QUEST ─────────────────────────── */

/**
 * Begin a quest if not already active or complete.
 * @param {string} qid
 */
function startQuest(qid) {
  if (questActive(qid) || questDone(qid)) return;
  P.quests[qid] = { status: 'active', stage: 0 };
  sfxQuest();
  addLog('Quest started: ' + QUESTS[qid].name + '.', 'd');
}

/* ── PROGRESS CHECK ──────────────────────── */

/**
 * Run through all active quests and advance stages
 * when their checkAdvance() condition is met.
 * Called after combat, item use, or dialogue actions.
 */
function checkQuestProgress() {
  Object.keys(QUESTS).forEach(function (qid) {
    var q  = QUESTS[qid];
    var qs = questState(qid);
    if (qs.status !== 'active') return;

    if (q.checkAdvance(qs.stage)) {
      qs.stage++;

      /* Final stage reached — complete */
      if (qs.stage >= q.stages.length - 1) {
        qs.status = 'complete';
        sfxQuest();
        addLog('✦ Quest Complete: ' + q.name + '!', 's');
        giveQuestReward(q);
      } else {
        addLog('Quest Updated: ' + q.name, 'd');
      }
    }
  });
}

/* ── REWARDS ─────────────────────────────── */

/**
 * Distribute gold, items, and XP rewards for a completed quest.
 * @param {object} q - Quest definition object from QUESTS
 */
function giveQuestReward(q) {
  if (!q.reward) return;

  if (q.reward.gold) {
    P.gold += q.reward.gold;
    addLog('  +' + q.reward.gold + 'g', 'g');
  }

  if (q.reward.items) {
    q.reward.items.forEach(function (iid) {
      P.inv.push(iid);
      addLog('  Received: ' + ITEMS[iid].n + '.', 'i');
      sfxPickup();
    });
  }

  if (q.reward.xp) {
    Object.keys(q.reward.xp).forEach(function (sk) {
      gainXP(sk, q.reward.xp[sk]);
    });
  }
}