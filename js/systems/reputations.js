/* ═══════════════════════════════════════
   ECHOES OF AETHON — Reputation System
   Five factions, each with standing that
   affects dialogue, prices, and access.
   ════════════════════════════════════ */

var REP = {
  verath:  0,   /* Verath Citizens — guards, merchants, scholars */
  shade:   0,   /* Shade Company   — arena ghosts               */
  drowned: 0,   /* The Drowned     — pier undead                */
  ash:     0,   /* Ash-folk        — Ashwood community          */
  warden:  0    /* Stone Wardens   — Keep constructs            */
};

/* ── TIERS ────────────────────────────── */
/*  -100 .. -60  → Hostile    (-3)
     -60 .. -25  → Unfriendly (-2)
     -25 ..  -5  → Wary       (-1)
      -5 ..  15  → Neutral     (0)
      15 ..  40  → Friendly    (1)
      40 ..  75  → Honored     (2)
      75 .. 100  → Exalted     (3)  */

function repTier(faction) {
  var v = REP[faction] || 0;
  if (v <= -60) return -3;
  if (v <= -25) return -2;
  if (v <= -5)  return -1;
  if (v <  15)  return  0;
  if (v <  40)  return  1;
  if (v <  75)  return  2;
  return 3;
}

var REP_TIER_NAMES = {
  '-3': 'Hostile',
  '-2': 'Unfriendly',
  '-1': 'Wary',
  '0':  'Neutral',
  '1':  'Friendly',
  '2':  'Honored',
  '3':  'Exalted'
};

function repLabel(faction) {
  return REP_TIER_NAMES[String(repTier(faction))] || 'Neutral';
}

function repColor(faction) {
  var t = repTier(faction);
  if (t <= -2) return '#ee4444';
  if (t === -1) return '#cc8833';
  if (t ===  0) return 'var(--mut)';
  if (t ===  1) return '#44ee66';
  if (t >=   2) return 'var(--gold)';
  return 'var(--mut)';
}

var FACTION_NAMES = {
  verath:  "Verath's Gate",
  shade:   'Shade Company',
  drowned: 'The Drowned',
  ash:     'Ash-folk',
  warden:  'Stone Wardens'
};

var FACTION_ICONS = {
  verath:  '🏛',
  shade:   '👁',
  drowned: '🌊',
  ash:     '🌿',
  warden:  '⬡'
};

var FACTION_DESCS = {
  verath:  'Citizens, guards, merchants and scholars of the city.',
  shade:   'Organized arena ghosts — champions who refused to leave the sand.',
  drowned: 'Conscious undead of the pier civilization. Still working.',
  ash:     'The Hollow community — survivors of the burning, changed by it.',
  warden:  'Stone constructs of the Runic Keep. Ancient, patient, observing.'
};

function factionName(f) { return FACTION_NAMES[f]  || f; }
function factionIcon(f) { return FACTION_ICONS[f]  || '⚑'; }
function factionDesc(f) { return FACTION_DESCS[f]  || ''; }

/* ── GAIN / LOSE REP ─────────────────── */

/**
 * Adjust reputation with a faction.
 * @param {string} faction
 * @param {number} amt  - positive = gain, negative = lose
 */
function gainRep(faction, amt) {
  if (!(faction in REP)) return;
  var oldTier = repTier(faction);
  REP[faction] = Math.max(-100, Math.min(100, (REP[faction] || 0) + amt));
  var newTier  = repTier(faction);

  if (newTier > oldTier) {
    addLog(factionIcon(faction) + ' ' + factionName(faction) + ' regard you as ' + repLabel(faction) + '.', 'd');
  } else if (newTier < oldTier) {
    addLog(factionIcon(faction) + ' Your standing with ' + factionName(faction) + ' has fallen.', 'c');
  }
}

/* ── PERKS ────────────────────────────── */

/**
 * Returns a discount multiplier on purchases based on faction rep.
 * Used in dialogue shop actions for faction-aligned traders.
 * @param {string} faction
 * @returns {number} 0.75 – 1.0
 */
function shopDiscount(faction) {
  var t = repTier(faction);
  if (t >= 3) return 0.75;
  if (t >= 2) return 0.85;
  if (t >= 1) return 0.95;
  return 1.00;
}

/**
 * Returns extra XP earned from factions you're honored/exalted with.
 */
function repXpBonus(faction) {
  var t = repTier(faction);
  return t >= 2 ? 1.25 : 1.00; /* 25% bonus XP */
}

/* ── REPUTATION GAINS ON QUEST COMPLETE ─ */
/* Called by giveQuestReward in quests.js  */
var QUEST_REP_REWARDS = {
  forge_request:   { verath: 15 },
  still_waters:    { warden: 10 },
  heralds_cargo:   { drowned: 20 },
  seven_layers:    { verath: 10, warden: 8 },
  ash_and_bone:    { ash: 25 },
  drowned_record:  { drowned: 30, warden: 10 },
  shade_tournament:{ shade: 35 }
};

function applyQuestRep(qid) {
  var rewards = QUEST_REP_REWARDS[qid];
  if (!rewards) return;
  Object.keys(rewards).forEach(function (faction) {
    gainRep(faction, rewards[faction]);
  });
}