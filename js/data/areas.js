/* ═══════════════════════════════════════
   ECHOES OF AETHON — Areas Data
   The movement map of the world.
   Each area is a location the player
   can physically be in and move between.
   ════════════════════════════════════ */

/* Field reference:
   id          unique key
   region      logical region grouping (for the map screen)
   name        display name
   sub         one-line subtitle
   desc        default description (shown after first visit)
   first       text shown on the very first visit
   npcs        array of NPC IDs present here
   enemies     array of enemy IDs that can spawn here
   connections array of area IDs the player can travel to
   loot        array of item IDs that can be found when searching
   searchable  true = "Search Area" button is shown
   req         unlock requirement object (null = always open)
               { skill: 'blade', level: 10 }
               { totalLevel: 100 }
   reqDesc     human-readable lock description
   hidden      true = not shown in connections until discovered
*/

var AREAS = {

  /* ══════════════════════════════════
     VERATH'S GATE
  ══════════════════════════════════ */
  verath_arch: {
    id:'verath_arch', region:'verath',
    name:"The Gate Arch",
    sub:"Where the city meets the road — and something older than both",
    desc:"The arch stands where no city-builder put it. It was here when the first settlers arrived. Iron bells hang at each corner, silent for three generations. Cael has stood beneath this arch for seventeen years, watching everything that leaves and everything that returns.",
    first:"Verath's Gate opens around you. Seven layers of civilization pressed into one place. The air smells of hearth-smoke, old stone, and something underneath both.",
    npcs:['cael'],
    enemies:[],
    connections:['verath_market','verath_inn','wilderness_road'],
    loot:['iron_sword','health_potion','mana_shard'],
    searchable:false, req:null
  },

  verath_market: {
    id:'verath_market', region:'verath',
    name:"Market Square",
    sub:"Trade over ruins — the oldest columns in Aethon hold up market canopies",
    desc:"The market sprawls between columns that have no name. Stalls sell what travelers bring and what the ruins give up. Yesta runs her corner with sharp eyes and sharper prices. The columns cast shadows at noon that don't quite line up with the sun.",
    first:"Noise and color. The smell of a dozen things cooking. The columns throw wrong shadows.",
    npcs:['yesta'],
    enemies:['rusted_soldier','scavenger_beast'],
    connections:['verath_arch','verath_smithy','verath_scholar'],
    loot:['health_potion','mana_shard','small_hp'],
    searchable:true, req:null
  },

  verath_inn: {
    id:'verath_inn', region:'verath',
    name:"The Threshold Inn",
    sub:"Stone walls that have held warmth for three centuries",
    desc:"The inn is older than anyone alive. The counter has been wiped so many times it is smooth as river-stone. Maren is always here. The fire is always lit. Travelers have been sleeping in this building since before the city had its current name.",
    first:"Warmth, low voices, the smell of something that has been cooking since morning. Or longer.",
    npcs:['maren'],
    enemies:[],
    connections:['verath_arch','verath_smithy'],
    loot:['health_potion','mana_shard'],
    searchable:false, req:null
  },

  verath_smithy: {
    id:'verath_smithy', region:'verath',
    name:"Smithy Quarter",
    sub:"Fire and iron — the sound that has always meant the city is alive",
    desc:"The smithy quarter never fully sleeps. Durren's forge is the largest, three generations old, fed by the same fire his grandfather started. The sound of metal on metal echoes off stone walls that predate the forge by a thousand years.",
    first:"Heat and the ring of metal. The particular satisfaction of something being made.",
    npcs:['durren'],
    enemies:[],
    connections:['verath_market','verath_inn','verath_columns'],
    loot:['iron_sword','steel_sword'],
    searchable:true, req:null
  },

  verath_scholar: {
    id:'verath_scholar', region:'verath',
    name:"Scholar's Quarter",
    sub:"Where old knowledge hides in newer buildings",
    desc:"A quieter district of narrow windows and buildings that lean slightly toward each other. Aldric's archive takes three connected rooms and overflows into a courtyard full of labeled stone fragments.",
    first:"Quiet. The smell of parchment and old ink. Someone is always reading here regardless of the hour.",
    npcs:['aldric'],
    enemies:[],
    connections:['verath_market'],
    loot:['lore_fragment','tome_shadow'],
    searchable:true, req:null
  },

  verath_columns: {
    id:'verath_columns', region:'verath',
    name:"The Ancient Columns",
    sub:"No one built them — they were simply here",
    desc:"Seven columns of black stone that predate every record. Warm to the touch regardless of weather. No inscriptions, no tool-marks, no joints. Scholars have argued about them for centuries without progress.",
    first:"Standing between the columns, you feel something that isn't presence, exactly. More like awareness. They know you are here in a way that stone should not.",
    npcs:[],
    enemies:['rusted_soldier','scavenger_beast'],
    connections:['verath_smithy','verath_undercity'],
    loot:['lore_fragment','ancient_coin','jade_fragment'],
    searchable:true, req:null, hidden:true
  },

  verath_undercity: {
    id:'verath_undercity', region:'verath',
    name:"The Undercity Steps",
    sub:"Below the market — older and stranger with every step",
    desc:"Steps between two market stalls, unmarked, that go down into a half-collapsed space that was a room once, then a foundation, then something that precedes both. Things have settled here that prefer the dark.",
    first:"Cold, even in summer. The walls press close. Something moves at the very edge of your torchlight.",
    npcs:[],
    enemies:['rusted_soldier','scavenger_beast'],
    connections:['verath_columns'],
    loot:['ancient_coin','bone_rune','lore_fragment'],
    searchable:true, req:null, hidden:true
  },

  /* ══════════════════════════════════
     WILDERNESS
  ══════════════════════════════════ */
  wilderness_road: {
    id:'wilderness_road', region:'wilderness',
    name:"The Old Road",
    sub:"Where the city ends and Aethon begins",
    desc:"The road out of Verath runs through old farmland no longer farmed. Stone walls mark fields that haven't been plowed in generations. The road splits at the old milestone: east toward the Colosseum's broken horizon, north into the mountain pass, west to the shore, south into dark forest.",
    first:"Past the gate, the city's noise fades faster than it should. The ruins ahead are patient in a way cities are not.",
    npcs:[],
    enemies:['scavenger_beast'],
    connections:['verath_arch','arena_approach','monastery_path','piers_shore','ashwood_edge','keep_approach'],
    loot:['small_hp','bone_rune'],
    searchable:true, req:null
  },

  /* ══════════════════════════════════
     THE BROKEN COLOSSEUM
  ══════════════════════════════════ */
  arena_approach: {
    id:'arena_approach', region:'arena',
    name:"Colosseum Approach",
    sub:"The road remembers the crowds — stone worn smooth by ten thousand feet",
    desc:"A wide stone road built for crowds that no longer come. Empty vendor stalls line the way. Statues of old champions — headless now, the names on their bases worn beyond reading — mark the final stretch.",
    first:"The Colosseum rises ahead before you expect it. You feel it before you see it — a pull, like a current in deep water.",
    npcs:[],
    enemies:['arena_ghost'],
    connections:['wilderness_road','arena_outer'],
    loot:['ancient_coin','health_potion'],
    searchable:true,
    req:{ skill:'blade', level:10 }, reqDesc:'Blade Lv.10'
  },

  arena_outer: {
    id:'arena_outer', region:'arena',
    name:"Outer Colosseum",
    sub:"The arena's broken ribs — arches open to sky that was meant to hold crowds",
    desc:"Collapsed archways and toppled walls. Arena sand has drifted out over centuries, filling gaps between stones. Of the forty-four original arches, fewer than twenty still stand. Something in the air is alert.",
    first:"You step into the Colosseum's shadow. The air changes — stiller, more expectant.",
    npcs:[],
    enemies:['arena_ghost','stone_golem'],
    connections:['arena_approach','arena_floor','arena_hall'],
    loot:['ancient_coin','health_potion','shade_token'],
    searchable:true,
    req:{ skill:'blade', level:10 }, reqDesc:'Blade Lv.10'
  },

  arena_floor: {
    id:'arena_floor', region:'arena',
    name:"The Arena Floor",
    sub:"Twenty feet below street level — the sand remembers everything",
    desc:"The fighting pit. Pale sand, undisturbed except for footprints that appear and disappear. The tiers of empty stone seats arc into shadow. Ravan manifests here — or perhaps is always here, waiting.",
    first:"You descend to the sand. Something settles around you like an old expectation being fulfilled.",
    npcs:['ravan'],
    enemies:['gladiator_shade','stone_golem'],
    connections:['arena_outer','arena_vault'],
    loot:['gladiator_blade','ancient_coin'],
    searchable:true,
    req:{ skill:'blade', level:10 }, reqDesc:'Blade Lv.10'
  },

  arena_hall: {
    id:'arena_hall', region:'arena',
    name:"Competitor's Hall",
    sub:"Where the shades keep their society — rank, record, and purpose",
    desc:"A long vaulted chamber beneath the arena. The shades of old competitors have organized here with the seriousness of people who have nothing left but organization. Rank markings on the walls. A commander who maintains order. Records that have been kept for centuries.",
    first:"You enter a chamber lit by no torch. The shades regard you — not as prey, but as something new in a very old routine.",
    npcs:['yast','petra'],
    enemies:['arena_ghost'],
    connections:['arena_outer'],
    loot:['shade_token','ancient_coin','tome_shadow'],
    searchable:true,
    req:{ skill:'blade', level:10 }, reqDesc:'Blade Lv.10'
  },

  arena_vault: {
    id:'arena_vault', region:'arena',
    name:"Champion's Vault",
    sub:"What the champions kept — and what kept them",
    desc:"A sealed chamber beneath the fighting pit, opened by centuries of erosion. Old equipment, champion markers, a stone chest that took years to wear open. Whatever the shades fear is in this room — they don't come here.",
    first:"Quiet in a way the rest of the arena is not. No shades. Whatever they avoid, they avoid this.",
    npcs:[],
    enemies:['gladiator_shade'],
    connections:['arena_floor'],
    loot:['gladiator_blade','shade_token','tome_dark'],
    searchable:true,
    req:{ skill:'blade', level:10 }, reqDesc:'Blade Lv.10'
  },

  /* ══════════════════════════════════
     IRONBELL MONASTERY
  ══════════════════════════════════ */
  monastery_path: {
    id:'monastery_path', region:'monastery',
    name:"Mountain Path",
    sub:"The cairns mark something — or someone — along every foot of the climb",
    desc:"The path climbs through thin pines then bare rock. Stone cairns built by pilgrims across many generations line the way. Some are taller than you. The oldest are half-buried, which tells you the path has sunk over time.",
    first:"The air thins. City sounds vanish earlier than they should. Bell towers visible against the sky — the bells themselves dark against the light.",
    npcs:[],
    enemies:['temple_warden'],
    connections:['wilderness_road','monastery_court'],
    loot:['mana_shard','mana_potion'],
    searchable:true,
    req:{ skill:'mysticism', level:15 }, reqDesc:'Mysticism Lv.15'
  },

  monastery_court: {
    id:'monastery_court', region:'monastery',
    name:"Outer Courtyard",
    sub:"Stone and sky — the practice of stillness has worn these flags smooth",
    desc:"A broad flagstone courtyard. The main bell tower rises at the far end. Seiran sits at the center in complete stillness, as she has every day for thirty years. The silence here has weight.",
    first:"The monastery receives you with silence that feels deliberate, not hostile. Like being acknowledged.",
    npcs:['seiran'],
    enemies:['temple_warden','bell_wraith'],
    connections:['monastery_path','monastery_bells','monastery_deep'],
    loot:['mana_potion','focus_stone'],
    searchable:true,
    req:{ skill:'mysticism', level:15 }, reqDesc:'Mysticism Lv.15'
  },

  monastery_bells: {
    id:'monastery_bells', region:'monastery',
    name:"The Bell Tower",
    sub:"Three bells. No clappers. Still humming.",
    desc:"Three iron bells of extraordinary size. The clappers were removed and stored generations ago. The bells hum regardless. Orath moves around them with the focused attention of a surgeon.",
    first:"Stepping into the tower, the hum becomes physical. You feel it in your teeth, your sternum, somewhere behind your eyes.",
    npcs:['orath'],
    enemies:['bell_wraith'],
    connections:['monastery_court'],
    loot:['focus_stone','mana_potion'],
    searchable:false,
    req:{ skill:'mysticism', level:15 }, reqDesc:'Mysticism Lv.15'
  },

  monastery_deep: {
    id:'monastery_deep', region:'monastery',
    name:"The Deep Cells",
    sub:"Where the most advanced practices are kept — and the most advanced practitioners",
    desc:"Carved cells deep in the mountain's body. The passage narrows until you turn sideways, then opens into a space that shouldn't fit inside the mountain. The monk who heard the bells lives here. Her door is closed. It has been closed for forty years.",
    first:"The passage opens into something that shouldn't fit. The silence here is different — not empty, full.",
    npcs:[],
    enemies:['stone_monk','bell_wraith'],
    connections:['monastery_court'],
    loot:['ironbell_staff','tome_thunder'],
    searchable:true,
    req:{ skill:'mysticism', level:20 }, reqDesc:'Mysticism Lv.20'
  },

  /* ══════════════════════════════════
     THE SUNKEN PIERS
  ══════════════════════════════════ */
  piers_shore: {
    id:'piers_shore', region:'piers',
    name:"The Shore Road",
    sub:"Salt air and something older underneath — iron, depth, old things",
    desc:"The road descends toward the water. Old salt-houses line the way, most empty. The enormous stone piers are visible ahead, their lower sections submerged decades ago when the water rose.",
    first:"The smell hits before the sight. Salt and something beneath it — iron, depth, the particular quality of very old things.",
    npcs:[],
    enemies:['sea_revenant'],
    connections:['wilderness_road','piers_dock'],
    loot:['health_potion','sunken_relic'],
    searchable:true,
    req:{ skill:'fortitude', level:20 }, reqDesc:'Fortitude Lv.20'
  },

  piers_dock: {
    id:'piers_dock', region:'piers',
    name:"The Main Dock",
    sub:"Where the living watch the dead work",
    desc:"Upper section of the great stone docks. Water laps twenty feet below. Through the dark water, on a clear day, you can see a complete street — buildings, signs, a market square. Noa sits at the dock's edge. Sorn is somewhere drying out. Below, constructs are still loading invisible ships.",
    first:"You look down through dark water at a complete city. Streets, buildings, everything intact. Bread. Copper. Books.",
    npcs:['noa','sorn'],
    enemies:['sea_revenant','rusted_construct'],
    connections:['piers_shore','piers_guild','piers_diving'],
    loot:['sunken_relic','health_potion'],
    searchable:true,
    req:{ skill:'fortitude', level:20 }, reqDesc:'Fortitude Lv.20'
  },

  piers_guild: {
    id:'piers_guild', region:'piers',
    name:"The Salvager's Guild",
    sub:"Neutral ground — where the Drowned trade with the living",
    desc:"A warehouse at the pier's edge. The Drowned — conscious undead from the sunken city who retained their minds — trade here for things they cannot recover themselves. Living salvagers trade here too. Nobody looks surprised. This has been normal for a long time.",
    first:"Three figures in waterlogged clothing sit at a table with two living salvagers. You understand that this arrangement is older than anyone present.",
    npcs:['moras','liss'],
    enemies:['sea_revenant'],
    connections:['piers_dock'],
    loot:['sunken_relic','tome_shadow','ash_crystal'],
    searchable:true,
    req:{ skill:'fortitude', level:20 }, reqDesc:'Fortitude Lv.20'
  },

  piers_diving: {
    id:'piers_diving', region:'piers',
    name:"Diving Platform",
    sub:"The last point of air — the drowned city is directly below",
    desc:"A stone platform over the deepest section of the old harbor. The water below is clear — a street visible stretching into cold blue distance. Things move down there with purpose.",
    first:"You stand above the submerged city. It stares back.",
    npcs:[],
    enemies:['drowned_knight','rusted_construct'],
    connections:['piers_dock'],
    loot:['sea_blade','tidal_armor'],
    searchable:true,
    req:{ skill:'fortitude', level:25 }, reqDesc:'Fortitude Lv.25'
  },

  /* ══════════════════════════════════
     THE ASHWOOD
  ══════════════════════════════════ */
  ashwood_edge: {
    id:'ashwood_edge', region:'ashwood',
    name:"The Forest Edge",
    sub:"Where normal trees end and memory begins — abruptly",
    desc:"The transition from ordinary woodland to Ashwood is a single step. One side: normal trees, bird sounds, dappled light. The other: black trunks, silver leaves, white ash ground, total silence. Wynn stands at the boundary, watching both sides.",
    first:"The light changes the moment you cross. Cooler. Blue. Everything quieter than it should be.",
    npcs:['wynn'],
    enemies:['ashwood_stalker'],
    connections:['wilderness_road','ashwood_deep','ashwood_hollow'],
    loot:['bone_rune','lore_fragment'],
    searchable:true,
    req:{ skill:'lore', level:25 }, reqDesc:'Lore Lv.25'
  },

  ashwood_deep: {
    id:'ashwood_deep', region:'ashwood',
    name:"The Deep Ashwood",
    sub:"Where even the silence has weight — and eyes",
    desc:"Deeper in, the trees grow larger and stranger. Black trunks three times your armspan. Ash ankle-deep in places, fine as smoke. Ancient markers dot the path, their text completely smooth. Something follows you. When you stop and turn, nothing is there. When you continue, it resumes.",
    first:"Something follows you from the first step. When you turn, nothing. When you continue, it resumes. You learn to continue.",
    npcs:[],
    enemies:['cursed_treant','shadow_hound','ashwood_stalker'],
    connections:['ashwood_edge','ashwood_shrine'],
    loot:['ashwood_bow','lore_fragment','bone_rune'],
    searchable:true,
    req:{ skill:'lore', level:25 }, reqDesc:'Lore Lv.25'
  },

  ashwood_hollow: {
    id:'ashwood_hollow', region:'ashwood',
    name:"The Hollow",
    sub:"The Ash-folk's settlement — older than the burning that made them",
    desc:"A large depression ringed by the largest black trees. The Ash-folk have built here — structures of compressed ash-brick, warm inside, the walls faintly luminous from within. They survived the burning by changing. They have been here ever since.",
    first:"You find people where you did not expect them. Grey-skinned, slow-moving, eyes the color of ash-coal. They watch you without hostility. One of them nods.",
    npcs:['vae','kern'],
    enemies:[],
    connections:['ashwood_edge'],
    loot:['ash_crystal','ash_vestment','ash_spear'],
    searchable:false, req:{ skill:'lore', level:25 }, reqDesc:'Lore Lv.25'
  },

  ashwood_shrine: {
    id:'ashwood_shrine', region:'ashwood',
    name:"The Ancient Shrine",
    sub:"Predates the burning — and the forest — and perhaps everything nearby",
    desc:"A clearing where no ash falls. Seven stones in a circle, each carved with the same three-script system as the Runic Keep. At the center, a hollow in the ground that is always the exact temperature of blood.",
    first:"The three-script runes. Here. Far from the Keep. The same script. The same hand. The same thing that wrote the Keep's walls was here, and left a mark.",
    npcs:[],
    enemies:['shadow_hound','cursed_treant'],
    connections:['ashwood_deep'],
    loot:['lore_fragment','rune_fragment','tome_void'],
    searchable:true,
    req:{ skill:'lore', level:30 }, reqDesc:'Lore Lv.30'
  },

  /* ══════════════════════════════════
     THE RUNIC KEEP
  ══════════════════════════════════ */
  keep_approach: {
    id:'keep_approach', region:'keep',
    name:"The Keep Approach",
    sub:"The path that formed because enough feet walked the same direction",
    desc:"No one built this road. It formed because enough people walked the same direction over enough centuries. The Keep is visible from far — it doesn't look built. It looks grown, or always-have-been.",
    first:"The runes on the outer wall pulse. Not quickly. Like a slow breath, or a slow thought. Something very large becoming aware of something very small.",
    npcs:[],
    enemies:['rune_knight'],
    connections:['wilderness_road','keep_gate'],
    loot:['rune_fragment','lore_fragment'],
    searchable:true,
    req:{ totalLevel:100 }, reqDesc:'Total Skill Levels 100'
  },

  keep_gate: {
    id:'keep_gate', region:'keep',
    name:"The Keep Gate",
    sub:"Open since before anyone arrived to open it",
    desc:"The gate has no mechanism for closing. It was open when the first humans found it. The Guardian stands here. Runes drift across the surrounding stonework like slow fire, never repeating.",
    first:"The Guardian regards you. It has been watching your approach since you were a distant figure on the road.",
    npcs:['guardian'],
    enemies:['aethon_sentinel'],
    connections:['keep_approach','keep_hall'],
    loot:['rune_fragment'],
    searchable:false,
    req:{ totalLevel:100 }, reqDesc:'Total Skill Levels 100'
  },

  keep_hall: {
    id:'keep_hall', region:'keep',
    name:"The Rune Hall",
    sub:"Where everything is recorded in three scripts simultaneously",
    desc:"A hall whose walls are entirely covered in runes. Three scripts, three civilizations' worth of inscription, all occupying the same surface at once without crowding or blurring. Stone Wardens move through slowly, cataloguing. The light is blue and comes from nowhere.",
    first:"The scale of the recording becomes clear here. Every surface. Every surface. As far as you can see in every direction.",
    npcs:['warden7','indexer'],
    enemies:['rune_knight','aethon_sentinel'],
    connections:['keep_gate','keep_depths'],
    loot:['rune_fragment','tome_meteor'],
    searchable:true,
    req:{ totalLevel:100 }, reqDesc:'Total Skill Levels 100'
  },

  keep_depths: {
    id:'keep_depths', region:'keep',
    name:"The Keep Depths",
    sub:"Where the question waits for its answer — it has been waiting a very long time",
    desc:"The deepest accessible chamber. The runes move faster here, more complex patterns. The Eternal Guardian waits at the far end, in the center of a room where the runes spiral inward.",
    first:"The runes accelerate as you descend. Something ancient becomes aware of you with the slow certainty of something that has always known you were coming.",
    npcs:[],
    enemies:['eternal_guardian'],
    connections:['keep_hall'],
    loot:['elixir','guardian_plate'],
    searchable:true,
    req:{ totalLevel:100 }, reqDesc:'Total Skill Levels 100'
  }
};