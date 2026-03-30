/* ═══════════════════════════════════════
   ECHOES OF AETHON — Enemies Data
   ════════════════════════════════════ */

/* Field reference:
   n        display name
   desc     flavour text shown in combat
   maxHp    max hit points
   atk      base attack power
   def      defence (reduces physical damage)
   ac       armour class (d20 target to hit)
   weak     array of skill keys that deal ×1.5 damage
   res      array of skill keys that deal ×0.5 damage
   undead   true = holy spells deal ×1.6 damage
   boss     true = show ★ marker
   xp       { skillKey: xpAmount } awarded on kill
   gMin     minimum gold dropped
   gMax     maximum gold dropped
   loot     array of { i: itemId, c: dropChance (0–1) }
*/

var ENEMIES = {

  /* ── VERATH REGION ── */
  rusted_soldier: {
    n:'Rusted Soldier',
    desc:'An automaton still following its last order. Two hundred years of patrol without rest.',
    maxHp:38, atk:9, def:3, ac:10,
    weak:['mysticism'], res:[],
    xp:{ blade:15, fortitude:10 },
    gMin:6, gMax:14,
    loot:[
      { i:'iron_sword',    c:0.10 },
      { i:'health_potion', c:0.22 },
      { i:'jade_fragment', c:0.15 }
    ]
  },

  scavenger_beast: {
    n:'Scavenger Beast',
    desc:'A large predator that claimed the ruins as territory. Fast and patient.',
    maxHp:30, atk:11, def:1, ac:9,
    weak:['archery'], res:[],
    xp:{ archery:15, blade:10 },
    gMin:3, gMax:9,
    loot:[
      { i:'small_hp',  c:0.30 },
      { i:'bone_rune', c:0.10 }
    ]
  },

  /* ── COLOSSEUM REGION ── */
  arena_ghost: {
    n:'Arena Ghost',
    desc:'A fighter who died in the sand and cannot find the exit. Fights because it is the only thing it remembers.',
    maxHp:48, atk:13, def:2, ac:11,
    weak:['mysticism'], res:['blade'], undead:true,
    xp:{ blade:20, mysticism:15 },
    gMin:9, gMax:20,
    loot:[
      { i:'ancient_coin',  c:0.35 },
      { i:'health_potion', c:0.20 },
      { i:'tome_shadow',   c:0.05 }
    ]
  },

  stone_golem: {
    n:'Stone Golem',
    desc:'Carved from arena stone and animated by contest-magic. Still waiting for a fight that ended centuries ago.',
    maxHp:75, atk:16, def:11, ac:14,
    weak:['mysticism'], res:['blade','archery'],
    xp:{ fortitude:25, mysticism:20 },
    gMin:12, gMax:28,
    loot:[
      { i:'gladiator_blade', c:0.15 },
      { i:'iron_shield',     c:0.12 },
      { i:'lore_fragment',   c:0.20 }
    ]
  },

  gladiator_shade: {
    n:'Gladiator Shade',
    desc:'An elite fighter preserved as shade. Still performs his craft with the precision of decades of training.',
    maxHp:58, atk:19, def:7, ac:13,
    weak:[], res:['archery'], undead:true,
    xp:{ blade:30, fortitude:20 },
    gMin:15, gMax:32,
    loot:[
      { i:'gladiator_blade', c:0.20 },
      { i:'ancient_coin',    c:0.30 },
      { i:'shade_token',     c:0.15 }
    ]
  },

  /* ── MONASTERY REGION ── */
  temple_warden: {
    n:'Temple Warden',
    desc:'A stone guardian still at his post. The monks leave food for it. It ignores the food.',
    maxHp:65, atk:14, def:9, ac:13,
    weak:['blade'], res:['archery'],
    xp:{ blade:20, fortitude:20, mysticism:15 },
    gMin:10, gMax:24,
    loot:[
      { i:'monk_robe',   c:0.12 },
      { i:'mana_potion', c:0.25 },
      { i:'tome_light',  c:0.06 }
    ]
  },

  bell_wraith: {
    n:'Bell Wraith',
    desc:'A sound given form — a fragment of what the bells said during their one and only ringing.',
    maxHp:42, atk:17, def:0, ac:10,
    weak:['archery','blade'], res:['mysticism'], undead:true,
    xp:{ mysticism:30, lore:20 },
    gMin:9, gMax:22,
    loot:[
      { i:'focus_stone', c:0.25 },
      { i:'mana_potion', c:0.20 },
      { i:'tome_thunder',c:0.05 }
    ]
  },

  stone_monk: {
    n:'Stone Monk',
    desc:'A monk who attempted to merge with the mountain in meditation. The mountain agreed, partially.',
    maxHp:85, atk:15, def:13, ac:15,
    weak:['mysticism'], res:['blade','archery'],
    xp:{ mysticism:25, fortitude:25 },
    gMin:13, gMax:30,
    loot:[
      { i:'ironbell_staff', c:0.15 },
      { i:'focus_stone',    c:0.20 },
      { i:'tome_earth',     c:0.07 }
    ]
  },

  /* ── PIERS REGION ── */
  sea_revenant: {
    n:'Sea Revenant',
    desc:'Half water, half memory. The drowned dead of the Piers civilization, persisting in their element.',
    maxHp:52, atk:15, def:4, ac:11,
    weak:['mysticism'], res:[], undead:true,
    xp:{ blade:25, mysticism:20 },
    gMin:13, gMax:27,
    loot:[
      { i:'sunken_relic', c:0.22 },
      { i:'health_potion',c:0.25 },
      { i:'tome_ice',     c:0.06 }
    ]
  },

  rusted_construct: {
    n:'Rusted Construct',
    desc:'A dockworker automaton, still loading ships that have not existed for centuries.',
    maxHp:68, atk:17, def:10, ac:13,
    weak:['mysticism'], res:['archery'],
    xp:{ fortitude:30, mysticism:20 },
    gMin:16, gMax:32,
    loot:[
      { i:'tidal_armor',   c:0.12 },
      { i:'sea_blade',     c:0.10 },
      { i:'lore_fragment', c:0.15 }
    ]
  },

  drowned_knight: {
    n:'Drowned Knight',
    desc:'An armoured guardian of the old port. Cold water preserved everything — the armour, the will, the orders.',
    maxHp:80, atk:22, def:11, ac:15,
    weak:['archery'], res:['blade'],
    xp:{ blade:30, archery:25, fortitude:20 },
    gMin:20, gMax:38,
    loot:[
      { i:'sea_blade',   c:0.20 },
      { i:'tidal_armor', c:0.15 },
      { i:'greater_mp',  c:0.12 }
    ]
  },

  /* ── ASHWOOD REGION ── */
  ashwood_stalker: {
    n:'Ashwood Stalker',
    desc:'Born from the ash-fire. Moves like smoke. Patience like stone.',
    maxHp:58, atk:19, def:5, ac:12,
    weak:['archery'], res:['mysticism'],
    xp:{ archery:35, blade:20 },
    gMin:16, gMax:30,
    loot:[
      { i:'shadow_cloak', c:0.18 },
      { i:'bone_rune',    c:0.15 },
      { i:'tome_shadow',  c:0.06 }
    ]
  },

  cursed_treant: {
    n:'Cursed Treant',
    desc:'One of the black trees, walking. What it wants is unclear. That it wants something is certain.',
    maxHp:108, atk:18, def:15, ac:14,
    weak:['mysticism'], res:['blade','archery'],
    xp:{ mysticism:35, fortitude:25 },
    gMin:22, gMax:44,
    loot:[
      { i:'ashwood_bow',   c:0.15 },
      { i:'lore_fragment', c:0.22 },
      { i:'tome_earth',    c:0.08 }
    ]
  },

  shadow_hound: {
    n:'Shadow Hound',
    desc:'Pure predator. Hungers with the patience of something that has never needed to hurry.',
    maxHp:63, atk:23, def:6, ac:12,
    weak:['blade'], res:['archery'],
    xp:{ blade:35, archery:25 },
    gMin:18, gMax:36,
    loot:[
      { i:'shadow_cloak', c:0.20 },
      { i:'shadow_knife', c:0.08 },
      { i:'tome_void',    c:0.05 }
    ]
  },

  /* ── RUNIC KEEP REGION ── */
  rune_knight: {
    n:'Rune Knight',
    desc:'A warrior inscribed with living runes. Each blow channels something old and entirely intentional.',
    maxHp:88, atk:25, def:13, ac:16,
    weak:['lore'], res:['blade'],
    xp:{ blade:40, mysticism:35, lore:30 },
    gMin:28, gMax:55,
    loot:[
      { i:'runic_blade',   c:0.12 },
      { i:'rune_fragment', c:0.40 },
      { i:'tome_void',     c:0.08 }
    ]
  },

  aethon_sentinel: {
    n:'Aethon Sentinel',
    desc:"The Keep's guardian. Not hostile. Simply doing exactly what it was made to do.",
    maxHp:95, atk:23, def:16, ac:17,
    weak:['mysticism','lore'], res:['blade','archery'],
    xp:{ fortitude:40, mysticism:35 },
    gMin:32, gMax:58,
    loot:[
      { i:'void_shroud',   c:0.10 },
      { i:'elixir',        c:0.10 },
      { i:'rune_fragment', c:0.35 }
    ]
  },

  eternal_guardian: {
    n:'The Eternal Guardian',
    desc:"The Keep's question given form. It has been waiting for an answer that satisfies it. A very long time.",
    maxHp:240, atk:32, def:19, ac:19, boss:true,
    weak:[], res:[],
    xp:{ blade:100, archery:100, mysticism:100, fortitude:100, herbalism:100, lore:100 },
    gMin:120, gMax:220,
    loot:[
      { i:'runic_blade',     c:1.00 },
      { i:'guardian_plate',  c:1.00 },
      { i:'elixir',          c:1.00 },
      { i:'ancient_talisman',c:0.50 }
    ]
  }
};