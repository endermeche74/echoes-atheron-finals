/* ═══════════════════════════════════════
   ECHOES OF AETHON — Quests Data
   Quest definitions. Logic lives in
   js/systems/quests.js
   ════════════════════════════════════ */

/* Field reference:
   id            unique key
   name          display name
   giver         NPC id who gives the quest
   giverArea     area where that NPC lives
   desc          full description shown in journal
   stages        array of stage-description strings
                 stages[0..n-2] = in-progress stages
                 stages[n-1]    = "Complete"
   checkAdvance  function(stage) → bool
                 called by checkQuestProgress()
   reward        { gold, items:[], xp:{} }
*/

var QUESTS = {

  forge_request: {
    id:   'forge_request',
    name: "The Forge Request",
    giver:'durren', giverArea:'verath_smithy',
    desc: "Durren wants to study the ancient folding technique used in Colosseum blades. He's been trying to reverse-engineer it for years. Find a Gladiator Blade in the Colosseum ruins and return it to him.",
    stages: [
      "Find a Gladiator Blade in the Colosseum.",
      "Return the Gladiator Blade to Durren in the Smithy.",
      "Complete."
    ],
    checkAdvance: function (stage) {
      if (stage === 0) return itemCount('gladiator_blade') >= 1;
      if (stage === 1) return !!G.flags['forge_returned'];
      return false;
    },
    reward: { gold:90, items:['steel_sword'], xp:{ blade:60 } }
  },

  still_waters: {
    id:   'still_waters',
    name: "Still Waters",
    giver:'seiran', giverArea:'monastery_court',
    desc: "Seiran needs a Focus Stone — the kind carried by Bell Wraiths — to help a struggling student maintain meditation resonance. The stones hold a fragment of the bells' one ringing.",
    stages: [
      "Find a Focus Stone — dropped by Bell Wraiths in the monastery.",
      "Return the Focus Stone to Seiran in the Outer Courtyard.",
      "Complete."
    ],
    checkAdvance: function (stage) {
      if (stage === 0) return itemCount('focus_stone') >= 1;
      if (stage === 1) return !!G.flags['focus_returned'];
      return false;
    },
    reward: { gold:70, items:['mana_potion','mana_potion'], xp:{ mysticism:70 } }
  },

  heralds_cargo: {
    id:   'heralds_cargo',
    name: "Herald's Cargo",
    giver:'sorn', giverArea:'piers_dock',
    desc: "Sorn has a private collector interested in Sunken Relics — the kind from the deeper dock sections. Two of them. The collector asks no questions, which in Sorn's experience means they know exactly what they're buying.",
    stages: [
      "Collect 2 Sunken Relics from the Piers diving platform.",
      "Return both relics to Sorn at the Main Dock.",
      "Complete."
    ],
    checkAdvance: function (stage) {
      if (stage === 0) return itemCount('sunken_relic') >= 2;
      if (stage === 1) return !!G.flags['relic_returned'];
      return false;
    },
    reward: { gold:120, items:['greater_hp'], xp:{ fortitude:80 } }
  },

  seven_layers: {
    id:   'seven_layers',
    name: "Seven Layers",
    giver:'aldric', giverArea:'verath_scholar',
    desc: "Aldric needs three Lore Fragments for his ongoing comparative civilizational study. He needs examples from different regions — the script variations between ruins tell him which civilization each fragment is from.",
    stages: [
      "Collect 3 Lore Fragments from ruins across Aethon.",
      "Return the fragments to Aldric in the Scholar's Quarter.",
      "Complete."
    ],
    checkAdvance: function (stage) {
      if (stage === 0) return itemCount('lore_fragment') >= 3;
      if (stage === 1) return !!G.flags['lore_returned'];
      return false;
    },
    reward: { gold:80, xp:{ lore:120 } }
  },

  ash_and_bone: {
    id:   'ash_and_bone',
    name: "Ash and Bone",
    giver:'vae', giverArea:'ashwood_hollow',
    desc: "Elder Vae needs a Bone Rune from the deep Ashwood — one their own people cannot retrieve. The creatures in the deep forest know the Ash-folk and will not let them pass that boundary. They do not know you.",
    stages: [
      "Find a Bone Rune in the deep Ashwood.",
      "Return the Bone Rune to Elder Vae in the Hollow.",
      "Complete."
    ],
    checkAdvance: function (stage) {
      if (stage === 0) return itemCount('bone_rune') >= 1;
      if (stage === 1) return !!G.flags['bone_returned'];
      return false;
    },
    reward: { gold:100, items:['tome_void','ash_crystal'], xp:{ lore:100, archery:60 } }
  },

  drowned_record: {
    id:   'drowned_record',
    name: "The Drowned Record",
    giver:'moras', giverArea:'piers_guild',
    desc: "Captain Moras of the Drowned wants a Lore Fragment recovered from the deep dock — one their people left before the departure. It contains a record of the decision to go to the Keep. They want it back.",
    stages: [
      "Find a Lore Fragment in the Diving Platform area.",
      "Return the Lore Fragment to Captain Moras at the Guild.",
      "Complete."
    ],
    checkAdvance: function (stage) {
      if (stage === 0) return itemCount('lore_fragment') >= 1 && G.discovered['piers_diving'];
      if (stage === 1) return !!G.flags['drowned_record_returned'];
      return false;
    },
    reward: { gold:110, items:['tome_ice'], xp:{ lore:90, mysticism:60 } }
  },

  shade_tournament: {
    id:   'shade_tournament',
    name: "The Shade Tournament",
    giver:'yast', giverArea:'arena_hall',
    desc: "Commander Yast of the Shade Company wants to see if you belong in the arena's record. Defeat three of the arena's most powerful remaining shades. Your performance will be recorded.",
    stages: [
      "Defeat a Gladiator Shade in the arena.",
      "Defeat a Stone Golem in the arena.",
      "Complete."
    ],
    checkAdvance: function (stage) {
      if (stage === 0) return !!(G.flags['shade_defeated']);
      if (stage === 1) return !!(G.flags['golem_defeated']);
      return false;
    },
    reward: { gold:150, items:['shade_token','shade_token','gladiator_blade'], xp:{ blade:100, fortitude:80 } }
  }
};