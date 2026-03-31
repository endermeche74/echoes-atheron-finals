/* ═══════════════════════════════════════
   ECHOES OF AETHON — Extra Quests
   Village and outpost quests.
   Load this AFTER js/data/quests.js
   ════════════════════════════════════ */

/* Add new enemies needed for these quests */
if (typeof ENEMIES !== 'undefined') {
  ENEMIES['grey_wolf'] = {
    n:'Grey Wolf', desc:'Large and patient. Has been watching the fields for weeks.',
    maxHp:22, atk:9, def:1, ac:8,
    weak:['blade','archery'], res:[],
    xp:{ archery:18, blade:12 },
    gMin:2, gMax:6,
    loot:[{ i:'small_hp', c:0.3 },{ i:'bone_rune', c:0.1 }]
  };
  ENEMIES['village_bandit'] = {
    n:'Road Bandit', desc:'Opportunistic. Didn\'t expect you to be this capable.',
    maxHp:28, atk:10, def:2, ac:9,
    weak:['archery'], res:[],
    xp:{ blade:14, archery:14 },
    gMin:4, gMax:12,
    loot:[{ i:'small_hp', c:0.25 },{ i:'iron_sword', c:0.08 },{ i:'ancient_coin', c:0.2 }]
  };
  ENEMIES['mill_spirit'] = {
    n:'Mill Spirit', desc:'Bound to the wheel. Not malicious — confused.',
    maxHp:35, atk:11, def:0, ac:9,
    weak:['mysticism','lore'], res:['blade'], undead:true,
    xp:{ mysticism:25, lore:20 },
    gMin:0, gMax:5,
    loot:[{ i:'focus_stone', c:0.3 },{ i:'mana_shard', c:0.4 }]
  };
}

/* Add the mill area */
if (typeof AREAS !== 'undefined') {
  AREAS['old_mill'] = {
    id:'old_mill', region:'villages',
    name:'The Old Mill',
    sub:'The wheel still turns — no water to turn it',
    desc:'The mill sits on a dry stone channel that was a stream once. The wheel turns regardless. The mechanism inside is intact, perfectly maintained, and operates with no apparent power source. Someone — or something — is keeping it running.',
    first:'You hear the wheel before you see it. A rhythmic creak, steady and patient. The water channel it spans has been dry for years.',
    npcs:['mill_spirit_npc'],
    enemies:['mill_spirit'],
    connections:['greystone_village'],
    loot:['mana_shard','lore_fragment','focus_stone'],
    searchable:true, req:null,
    horizon:'The dry wheel turns in silence.'
  };
}

/* Add the mill spirit as a speakable NPC (before or after combat) */
if (typeof NPCS !== 'undefined') {
  NPCS['mill_spirit_npc'] = {
    n:'The Miller\'s Echo', title:'Spirit — Bound to the Wheel', faction:null,
    greet:'A shape at the edge of visibility — not quite a person but organized like one. It doesn\'t approach.',
    nodes:{
      root:{ t:'Someone came to look. They always look eventually. I don\'t remember how long I\'ve been here. The wheel remembers, though. I can feel it.',
        c:[{l:'What are you?',n:'what'},{l:'Why does the wheel turn?',n:'wheel'},{l:'Can you leave?',n:'leave'}]},
      what:{  t:'A remainder. The miller died in the mill and I am what wouldn\'t go anywhere. I maintain the wheel because maintaining the wheel is what I know.',c:[]},
      wheel:{ t:'I turn it. It has always needed turning. I don\'t remember why that\'s important but I know it is. The knowing is the last thing.',c:[{l:'Can I help you remember?',n:'help'}]},
      help:{  t:'If you could find the mill-record — a small clay tablet, red, with the miller\'s mark. He hid it in the wall when the water stopped. If I could see it, I think I would remember what I\'m maintaining this for.',c:[{l:'I\'ll look for it.',n:'q_start',a:'start_quest',quest:'mill_mystery'}]},
      q_start:{ t:'\'The east wall. Third stone from the window. He always hid things there.\'',c:[]},
      leave:{ t:'I\'ve tried. I get to the door and the wheel slows. I go back. This is the arrangement.',c:[]}
    }
  };
}

/* ── NEW QUESTS ──────────────────────── */

QUESTS['wolf_cull'] = {
  id:'wolf_cull', name:'The Grey Pack',
  giver:'torven', giverArea:'greystone_village',
  desc:'The grey wolves from the south road have been testing the village fields at dusk. Torven wants a few culled to remind the pack that Greystone is not a hunting ground.',
  stages:[
    'Defeat 3 grey wolves — found on the road to Greystone and nearby.',
    'Return to Torven in Greystone.',
    'Complete.'
  ],
  checkAdvance: function(stage) {
    if (stage === 0) return (G.flags['wolves_killed'] || 0) >= 3;
    if (stage === 1) return !!G.flags['wolf_quest_returned'];
    return false;
  },
  reward:{ gold:60, items:['health_potion','health_potion'], xp:{ archery:80, blade:50 } }
};

QUESTS['mill_mystery'] = {
  id:'mill_mystery', name:'The Turning Wheel',
  giver:'agatha', giverArea:'greystone_village',
  desc:'The old mill on the east path has been turning without water or wind for three months. Agatha wants someone to find out why. The mill spirit inside wants you to find a hidden clay tablet.',
  stages:[
    'Visit the Old Mill and speak to whatever is inside.',
    'Find the clay tablet — search the mill thoroughly.',
    'Return the tablet to the Mill Spirit.',
    'Complete.'
  ],
  checkAdvance: function(stage) {
    if (stage === 0) return !!G.discovered['old_mill'];
    if (stage === 1) return !!G.flags['mill_tablet_found'];
    if (stage === 2) return !!G.flags['mill_tablet_returned'];
    return false;
  },
  reward:{ gold:80, items:['focus_stone','mana_potion'], xp:{ mysticism:80, lore:80 } }
};

QUESTS['scout_report'] = {
  id:'scout_report', name:'The Watcher\'s Log',
  giver:'scout_nem', giverArea:'watchtower_summit',
  desc:'Nem has been tracking movement between the Colosseum and the Keep. She wants three Lore Fragments from the Colosseum approach — she believes they contain movement records from the Third Age that would help her identify the pattern.',
  stages:[
    'Collect 3 Lore Fragments from the Colosseum area.',
    'Return to Nem at the Watchtower Summit.',
    'Complete.'
  ],
  checkAdvance: function(stage) {
    if (stage === 0) return itemCount('lore_fragment') >= 3 && !!G.discovered['arena_approach'];
    if (stage === 1) return !!G.flags['scout_report_returned'];
    return false;
  },
  reward:{ gold:95, items:['shadow_knife','smoke_bomb'], xp:{ archery:90, lore:90 } }
};

/* Hook wolf kills into victory tracking */
var _origVictory = (typeof doVictory === 'function') ? doVictory : null;
// wolves are tracked via combat.js doVictory — we patch G.flags there via enemy name check
// combat.js already sets G.flags for shade/golem; wolves need the same
// We add a post-victory hook here:
if (typeof window !== 'undefined') {
  window._wolfKillHook = function(enemyName) {
    if (enemyName === 'Grey Wolf') {
      G.flags['wolves_killed'] = (G.flags['wolves_killed'] || 0) + 1;
    }
    if (enemyName === 'Mill Spirit') {
      G.flags['mill_tablet_found'] = true;
      addLog('You find a small clay tablet with the miller\'s mark near the east wall.', 'i');
    }
  };
}