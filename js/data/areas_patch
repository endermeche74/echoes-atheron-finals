/* ═══════════════════════════════════════
   ECHOES OF AETHON — Areas Patch
   Load this AFTER js/data/areas.js
   ════════════════════════════════════ */

/* ── LOWER / REMOVE LEVEL GATES ─────── */
(function patchReqs() {
  var patches = {
    arena_approach:  null,
    arena_outer:     { skill:'blade',     level:5  },
    arena_floor:     { skill:'blade',     level:8  },
    arena_hall:      { skill:'blade',     level:5  },
    arena_vault:     { skill:'blade',     level:8  },
    monastery_path:  null,
    monastery_court: null,
    monastery_bells: null,
    monastery_deep:  { skill:'mysticism', level:10 },
    piers_shore:     null,
    piers_dock:      null,
    piers_guild:     { skill:'fortitude', level:8  },
    piers_diving:    { skill:'fortitude', level:15 },
    ashwood_edge:    null,
    ashwood_deep:    { skill:'lore',      level:10 },
    ashwood_hollow:  { skill:'lore',      level:8  },
    ashwood_shrine:  { skill:'lore',      level:18 },
    keep_approach:   { totalLevel:50 },
    keep_gate:       { totalLevel:50 },
    keep_hall:       { totalLevel:65 },
    keep_depths:     { totalLevel:80 }
  };
  Object.keys(patches).forEach(function(aid) {
    if (AREAS[aid]) {
      AREAS[aid].req = patches[aid];
      AREAS[aid].reqDesc = patches[aid]
        ? (patches[aid].skill
            ? patches[aid].skill.charAt(0).toUpperCase() + patches[aid].skill.slice(1) + ' Lv.' + patches[aid].level
            : 'Total Skill Lv.' + patches[aid].totalLevel)
        : null;
    }
  });
})();

/* ── PATCH WILDERNESS CONNECTIONS ────── */
if (AREAS['wilderness_road']) {
  AREAS['wilderness_road'].connections = [
    'verath_arch', 'crossroads',
    'arena_approach', 'monastery_path',
    'piers_shore', 'ashwood_edge', 'keep_approach'
  ];
}

/* ── HORIZON TEXT ON EXISTING AREAS ─── */
var HORIZONS = {
  verath_arch:     'Beyond the gate the old road stretches east. In the far distance you can make out broken arches against the sky.',
  verath_market:   'Through gaps between stalls you glimpse the road out of the city and the wilderness beyond.',
  wilderness_road: 'To the east, something massive and broken rises above the tree line. To the north, bell towers on a mountain pass. West, the smell of salt. South, black trees.',
  crossroads:      'Four directions from this stone. Each path leads somewhere the signpost was placed to name.',
  greystone_road:  'Smoke from chimneys ahead. A settlement — not large, but real and inhabited.',
  watchtower_path: 'A crumbling tower stands on the hill to the right. Its top is open to the sky.',
  arena_approach:  'The Colosseum fills your vision now. Even half-collapsed it is enormous.',
  piers_shore:     'The water is visible ahead. Beneath it — faint shapes, too regular to be stone. Buildings.',
  ashwood_edge:    'The tree line shifts here. On one side, ordinary woodland. On the other, trees the color of old iron.'
};
Object.keys(HORIZONS).forEach(function(aid) {
  if (AREAS[aid]) AREAS[aid].horizon = HORIZONS[aid];
});

/* ── NEW AREA: CROSSROADS ────────────── */
AREAS['crossroads'] = {
  id:'crossroads', region:'wilderness',
  name:'The Crossroads',
  sub:'Four paths, one weathered signpost — the stone is older than the roads',
  desc:'A wide clearing where four paths meet. At the center stands a stone signpost older than the roads themselves. Travelers have been making decisions here for a very long time.',
  first:'You find the crossroads. The signpost is real stone, not wood — whoever put it here expected it to last. It has.',
  signpost:[
    { dir:'← West',  label:"Verath's Gate",  sub:'The city. Markets, inns, scholars.' },
    { dir:'→ East',  label:'The Colosseum',  sub:'Ruins of the Third Age.' },
    { dir:'↑ North', label:'Mountain Pass',  sub:'Ironbell Monastery. High and cold.' },
    { dir:'↓ South', label:'Greystone',      sub:'A village. Smoke visible from here.' },
    { dir:'↗ NE',    label:'The Watchtower', sub:'Crumbling. Something inside.' },
    { dir:'↘ SE',    label:'Sunken Piers',   sub:'Old port. Half underwater.' }
  ],
  npcs:[], enemies:['scavenger_beast'],
  connections:['wilderness_road','greystone_road','watchtower_path','ironwood_outpost'],
  loot:['small_hp','ancient_coin'],
  searchable:true, req:null,
  horizon:'Paths branch in four directions. You can see smoke to the south.'
};

/* ── NEW AREA: GREYSTONE ROAD ────────── */
AREAS['greystone_road'] = {
  id:'greystone_road', region:'villages',
  name:'Road to Greystone',
  sub:'A worn path between stone walls — someone has been maintaining this',
  desc:'The road is better kept here than near the city. Stone walls mark old field boundaries and some of the fields are still worked. Someone lives at the end of this road.',
  first:'You follow the road south. It narrows slightly but the surface is swept clean.',
  npcs:[], enemies:['grey_wolf'],
  connections:['crossroads','greystone_village'],
  loot:['small_hp','health_potion'],
  searchable:true, req:null,
  horizon:'The village is visible now — a cluster of stone buildings, smoke from three chimneys.'
};

/* ── NEW AREA: GREYSTONE VILLAGE ─────── */
AREAS['greystone_village'] = {
  id:'greystone_village', region:'villages',
  name:'Greystone Village',
  sub:'A farming settlement that has outlasted three empires',
  desc:'Greystone is not old so much as it is persistent. The same families have worked the same fields for generations. Stone houses, swept yards, a well at the center. The healer\'s window has light in it at all hours.',
  first:'You enter Greystone. A dog watches you from a doorway. Three people stop what they\'re doing to assess whether you\'re trouble.',
  npcs:['agatha','torven','bram'],
  enemies:['grey_wolf','village_bandit'],
  connections:['greystone_road','old_mill'],
  loot:['health_potion','small_hp','mana_shard','tome_shadow'],
  searchable:true, req:null,
  horizon:'The fields stretch south. The road behind leads back to the crossroads.'
};

/* ── NEW AREA: OLD MILL ──────────────── */
AREAS['old_mill'] = {
  id:'old_mill', region:'villages',
  name:'The Old Mill',
  sub:'The wheel still turns — no water to turn it',
  desc:'The mill sits on a dry stone channel. The wheel turns regardless. The mechanism inside is intact and operates with no apparent power source.',
  first:'You hear the wheel before you see it. A rhythmic creak, steady and patient. The channel it spans has been dry for years.',
  npcs:['mill_spirit_npc'],
  enemies:['mill_spirit'],
  connections:['greystone_village'],
  loot:['mana_shard','lore_fragment','focus_stone'],
  searchable:true, req:null,
  horizon:'The dry wheel turns in silence.'
};

/* ── NEW AREA: WATCHTOWER PATH ────────── */
AREAS['watchtower_path'] = {
  id:'watchtower_path', region:'wilderness',
  name:'Watchtower Path',
  sub:'A hill track — the tower grows larger as you climb',
  desc:'The path up the hill was made by feet, not tools. The tower at the top is older than anything in Verath\'s Gate and was already a ruin when the city was built.',
  first:'The path climbs. The tower is missing its top third. You can see the remains of a staircase through a gap in the wall.',
  npcs:[], enemies:['rusted_soldier','scavenger_beast'],
  connections:['crossroads','watchtower_summit'],
  loot:['ancient_coin','lore_fragment','iron_sword'],
  searchable:true, req:null,
  horizon:'From partway up you can see the whole region — Verath behind you, the Colosseum east.'
};

/* ── NEW AREA: WATCHTOWER SUMMIT ─────── */
AREAS['watchtower_summit'] = {
  id:'watchtower_summit', region:'wilderness',
  name:'Watchtower Summit',
  sub:'The top of the hill — open to sky, someone has been using this',
  desc:'Three walls to full height, one to half. The floor is intact. A bedroll, a cold firepit, supplies. Recently used. Whoever uses this place was watching something from here.',
  first:'You reach the summit. The bedroll is fresh. Whoever was here left within the last few days.',
  npcs:['scout_nem'],
  enemies:['rusted_soldier'],
  connections:['watchtower_path'],
  loot:['gladiator_blade','health_potion','greater_hp','lore_fragment'],
  searchable:true, req:null,
  horizon:'Every direction is visible from here. You understand why someone chose this place.'
};

/* ── NEW AREA: IRONWOOD OUTPOST ───────── */
AREAS['ironwood_outpost'] = {
  id:'ironwood_outpost', region:'villages',
  name:'Ironwood Outpost',
  sub:'A trading post at the edge of the dark forest',
  desc:'The outpost exists because travelers to the Ashwood need a last point of supply. It is three buildings and a firepit, run by two people who have been arguing about something for eleven years.',
  first:'You find the outpost. Two people are arguing outside. They stop, assess you, and resume arguing.',
  npcs:['kael_trader','soma_guard'],
  enemies:['ashwood_stalker'],
  connections:['crossroads','ashwood_edge'],
  loot:['ash_crystal','tome_void','shadow_cloak','health_potion'],
  searchable:true, req:null,
  horizon:'The Ashwood starts twenty feet south. The light changes at the boundary.'
};

/* ── ADD ENEMIES USED BY NEW AREAS ────── */
ENEMIES['grey_wolf'] = {
  n:'Grey Wolf', desc:'Large and patient. Has been watching the fields.',
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