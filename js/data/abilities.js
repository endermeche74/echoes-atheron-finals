/* ═══════════════════════════════════════
   ECHOES OF AETHON — Abilities Data
   Flat map of all skill abilities.
   Referenced by combat.js and render_combat.js
   ════════════════════════════════════ */

/* ── ABILITY MAP ─────────────────────────── */
var ABIL = {

  /* ── BLADE ── */
  slash:        { id:'slash',        sk:'blade',     name:'Slash',          icon:'⚔',  lv:0,  mp:0,  typ:'phy', dmgType:'atk',  dmgM:1.0,                   desc:'Basic strike.' },
  power_strike: { id:'power_strike', sk:'blade',     name:'Power Strike',   icon:'⚔',  lv:10, mp:5,  typ:'phy', dmgType:'atk',  dmgM:1.8,                   desc:'Heavy focused blow.' },
  whirlwind:    { id:'whirlwind',    sk:'blade',     name:'Whirlwind',      icon:'⚔',  lv:25, mp:10, typ:'phy', dmgType:'atk',  dmgM:2.3,                   desc:'Spinning strike.' },
  rend:         { id:'rend',         sk:'blade',     name:'Rend',           icon:'🩸', lv:50, mp:15, typ:'phy', dmgType:'atk',  dmgM:2.6, se:'bleed',        desc:'Tears through. Causes Bleeding.' },
  bladestorm:   { id:'bladestorm',   sk:'blade',     name:'Blade Storm',    icon:'⚔',  lv:75, mp:25, typ:'phy', dmgType:'atk',  dmgM:3.8,                   desc:'Devastating series of strikes.' },

  /* ── ARCHERY ── */
  arrow_shot:   { id:'arrow_shot',   sk:'archery',   name:'Arrow Shot',     icon:'🏹', lv:0,  mp:0,  typ:'phy', dmgType:'atk',  dmgM:0.9,                   desc:'Basic ranged attack.' },
  piercing:     { id:'piercing',     sk:'archery',   name:'Piercing Arrow', icon:'🏹', lv:10, mp:5,  typ:'phy', dmgType:'atk',  dmgM:1.6, iDef:true,         desc:'Pierces partial armour.' },
  double_shot:  { id:'double_shot',  sk:'archery',   name:'Double Shot',    icon:'🏹', lv:25, mp:8,  typ:'phy', dmgType:'atk',  dmgM:2.0,                   desc:'Two arrows at once.' },
  eagle_eye:    { id:'eagle_eye',    sk:'archery',   name:'Eagle Eye',      icon:'🎯', lv:50, mp:15, typ:'phy', dmgType:'atk',  dmgM:3.0, iDef:true,         desc:'Ignores all DEF.' },
  death_shot:   { id:'death_shot',   sk:'archery',   name:'Death Shot',     icon:'🎯', lv:75, mp:30, typ:'phy', dmgType:'atk',  dmgM:4.5, iDef:true,         desc:'Lethal precision shot.' },

  /* ── MYSTICISM ── */
  ember_bolt:   { id:'ember_bolt',   sk:'mysticism', name:'Ember Bolt',     icon:'🔥', lv:0,  mp:8,  typ:'mag', dmgType:'mind', dmgM:1.3,                   desc:'Fire bolt.' },
  stone_shield: { id:'stone_shield', sk:'mysticism', name:'Stone Shield',   icon:'🛡', lv:0,  mp:10, typ:'buf', eff:'shield',   shBase:20, shScale:'mind',   desc:'Conjures a damage-absorbing shield.' },
  chain_light:  { id:'chain_light',  sk:'mysticism', name:'Chain Lightning',icon:'⚡', lv:25, mp:18, typ:'mag', dmgType:'mind', dmgM:2.1,                   desc:'Lightning arcs through the enemy.' },
  soul_drain:   { id:'soul_drain',   sk:'mysticism', name:'Soul Drain',     icon:'💜', lv:50, mp:20, typ:'mag', dmgType:'mind', dmgM:2.3, heal:true,         desc:'Drains life force. Heals you.' },
  cataclysm:    { id:'cataclysm',    sk:'mysticism', name:'Cataclysm',      icon:'💥', lv:75, mp:35, typ:'mag', dmgType:'mind', dmgM:4.0,                   desc:'Catastrophic magical surge.' },

  /* ── FORTITUDE ── */
  defend:       { id:'defend',       sk:'fortitude', name:'Defend',         icon:'🛡', lv:0,  mp:0,  typ:'buf', eff:'defend',                               desc:'Halve incoming damage this turn.' },
  iron_skin:    { id:'iron_skin',    sk:'fortitude', name:'Iron Skin',      icon:'🛡', lv:25, mp:12, typ:'buf', eff:'shield',   shBase:30, shScale:'def',    desc:'Large damage-absorbing shield.' },
  last_stand:   { id:'last_stand',   sk:'fortitude', name:'Last Stand',     icon:'⚔',  lv:50, mp:20, typ:'phy', dmgType:'atk',  dmgM:2.0, lowHp:true,       desc:'Extra powerful when HP is below 30%.' },
  unbreakable:  { id:'unbreakable',  sk:'fortitude', name:'Unbreakable',    icon:'🔒', lv:75, mp:30, typ:'buf', eff:'unbreak',                              desc:'Immune to all damage this turn.' },

  /* ── HERBALISM ── */
  herb_heal:    { id:'herb_heal',    sk:'herbalism', name:'Herb Heal',      icon:'🌿', lv:0,  mp:8,  typ:'heal', healBase:20, healScale:2,                  desc:'Restore a moderate amount of HP.' },
  revitalize:   { id:'revitalize',   sk:'herbalism', name:'Revitalize',     icon:'🌿', lv:25, mp:15, typ:'heal', healBase:50, healScale:3,                  desc:'Stronger healing surge.' },
  nat_grasp:    { id:'nat_grasp',    sk:'herbalism', name:"Nature's Grasp", icon:'🌿', lv:50, mp:20, typ:'mag',  dmgType:'lvl', dmgM:5.0,  heal:true,       desc:'Damages enemy and heals you.' },
  full_restore: { id:'full_restore', sk:'herbalism', name:'Full Restore',   icon:'💚', lv:75, mp:40, typ:'heal', hFull:true,                                desc:'Fully restore all HP.' },

  /* ── LORE ── */
  identify:     { id:'identify',     sk:'lore',      name:'Identify',       icon:'🔍', lv:0,  mp:5,  typ:'sup', eff:'identify',                             desc:'Reveal enemy weaknesses and resistances.' },
  anc_tongue:   { id:'anc_tongue',   sk:'lore',      name:'Ancient Tongue', icon:'📜', lv:25, mp:12, typ:'mag', dmgType:'mind', dmgM:1.6, iRes:true,        desc:'Ancient force that bypasses resistances.' },
  relic_mast:   { id:'relic_mast',   sk:'lore',      name:'Relic Mastery',  icon:'📜', lv:50, mp:18, typ:'mag', dmgType:'mind', dmgM:2.6, iRes:true,        desc:'Ancient power amplified.' },
  revelation:   { id:'revelation',   sk:'lore',      name:'Revelation',     icon:'💫', lv:75, mp:30, typ:'mag', dmgType:'mind', dmgM:3.4, iRes:true,        desc:'Shatters enemy with pure knowledge.' }
};

/* ── SKILL METADATA ──────────────────────── */
/* Display info + ordered ability lists per skill. */
var SKILLMETA = {
  blade:     { n:'Blade',     icon:'⚔',  abilIds:['slash','power_strike','whirlwind','rend','bladestorm'] },
  archery:   { n:'Archery',   icon:'🏹', abilIds:['arrow_shot','piercing','double_shot','eagle_eye','death_shot'] },
  mysticism: { n:'Mysticism', icon:'🔥', abilIds:['ember_bolt','stone_shield','chain_light','soul_drain','cataclysm'] },
  fortitude: { n:'Fortitude', icon:'🛡', abilIds:['defend','iron_skin','last_stand','unbreakable'] },
  herbalism: { n:'Herbalism', icon:'🌿', abilIds:['herb_heal','revitalize','nat_grasp','full_restore'] },
  lore:      { n:'Lore',      icon:'📜', abilIds:['identify','anc_tongue','relic_mast','revelation'] }
};