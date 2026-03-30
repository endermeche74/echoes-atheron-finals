/* ═══════════════════════════════════════
   ECHOES OF AETHON — Items Data
   Weapons, armour, accessories,
   consumables, spellbooks, misc relics.
   ════════════════════════════════════ */

/* Field reference:
   n       display name
   type    weapon | armor | accessory | consumable | spellbook | misc
   slot    weapon | armor | accessory  (gear only)
   rar     common | uncommon | rare | epic | legendary | mythic
   atk     ATK bonus
   def     DEF bonus
   mpB     max MP bonus
   mindB   MIND bonus
   hpB     max HP bonus
   critB   crit-chance bonus (decimal, e.g. 0.10 = +10%)
   iDef    physical attacks ignore partial DEF (weapons)
   eff     consumable effect: hp | mp | both | cure | escape
   amt     consumable restore amount
   spell   spellbook: spell ID to learn
   val     misc sell value in gold
   desc    short description shown in inventory
*/

var ITEMS = {

  /* ══════════════════════════════════
     WEAPONS
  ══════════════════════════════════ */
  rusty_dagger:      { n:'Rusty Dagger',         type:'weapon',  slot:'weapon',    rar:'common',    atk:5,                          desc:'Barely functional. Better than nothing.' },
  iron_sword:        { n:'Iron Sword',            type:'weapon',  slot:'weapon',    rar:'common',    atk:9,                          desc:'Serviceable iron blade. No ornament.' },
  steel_sword:       { n:'Steel Longsword',       type:'weapon',  slot:'weapon',    rar:'uncommon',  atk:14,                         desc:'Balanced reach weapon. Better steel.' },
  war_hammer:        { n:'War Hammer',            type:'weapon',  slot:'weapon',    rar:'uncommon',  atk:16, iDef:true,             desc:'Blunt force. Ignores partial armour.' },
  bone_spear:        { n:'Bone Spear',            type:'weapon',  slot:'weapon',    rar:'rare',      atk:17,                         desc:'Ground from something large and old.' },
  gladiator_blade:   { n:'Gladiator Blade',       type:'weapon',  slot:'weapon',    rar:'rare',      atk:19,                         desc:'Arena-forged. Third Age steel.' },
  shadow_knife:      { n:'Shadow Knife',          type:'weapon',  slot:'weapon',    rar:'rare',      atk:15, critB:0.10,            desc:'+10% crit chance. Prefers the dark.' },
  sea_blade:         { n:'Sea Blade',             type:'weapon',  slot:'weapon',    rar:'rare',      atk:21,                         desc:'Cold edge. Salt-preserved for centuries.' },
  ashwood_bow:       { n:'Ashwood Bow',           type:'weapon',  slot:'weapon',    rar:'rare',      atk:19,                         desc:'Cut from a black tree. Arrows fly true.' },
  iron_crossbow:     { n:'Iron Crossbow',         type:'weapon',  slot:'weapon',    rar:'uncommon',  atk:13, iDef:true,             desc:'Slow to reload. Piercing bolts.' },
  death_bolt_xbow:   { n:'Death Bolt Crossbow',   type:'weapon',  slot:'weapon',    rar:'epic',      atk:26, iDef:true, critB:0.15, desc:'Piercing. +15% crit.' },
  ironbell_staff:    { n:'Ironbell Staff',        type:'weapon',  slot:'weapon',    rar:'uncommon',  atk:7,  mpB:18,                desc:'Cast from bell-iron. Hums faintly.' },
  void_wand:         { n:'Void Wand',             type:'weapon',  slot:'weapon',    rar:'rare',      atk:10, mpB:22,  mindB:4,      desc:'Points toward something not quite here.' },
  shadow_staff:      { n:'Shadow Staff',          type:'weapon',  slot:'weapon',    rar:'rare',      atk:12, mpB:20,  mindB:3,      desc:'Ashwood heartwood. Very unhappy about it.' },
  ancient_tome_wpn:  { n:'Ancient Tome',          type:'weapon',  slot:'weapon',    rar:'epic',      atk:6,  mpB:35,  mindB:7,      desc:'It reads you while you read it.' },
  ash_spear:         { n:'Ash-folk Spear',        type:'weapon',  slot:'weapon',    rar:'rare',      atk:17, mindB:2,               desc:'Ash-crystal tip. Warm to the touch.' },
  runic_blade:       { n:'Runic Blade',           type:'weapon',  slot:'weapon',    rar:'legendary', atk:32,                         desc:'Living runes move on its surface. Eager.' },
  dawnbreaker:       { n:'Dawnbreaker',           type:'weapon',  slot:'weapon',    rar:'epic',      atk:27, mindB:4,               desc:'Radiates faint light.' },
  eternity_wand:     { n:'Eternity Wand',         type:'weapon',  slot:'weapon',    rar:'mythic',    atk:16, mpB:45, mindB:10, critB:0.12, desc:'The Keep waited for this to be found.' },

  /* ══════════════════════════════════
     ARMOUR
  ══════════════════════════════════ */
  torn_rags:         { n:'Torn Rags',             type:'armor',   slot:'armor',     rar:'common',    def:1,                          desc:'It tries.' },
  leather_armor:     { n:'Leather Armor',         type:'armor',   slot:'armor',     rar:'common',    def:6,                          desc:'Reinforced at the joints.' },
  reinforced_leather:{ n:'Reinforced Leather',    type:'armor',   slot:'armor',     rar:'uncommon',  def:8,                          desc:'Double-layered at joints and shoulders.' },
  chainmail:         { n:'Chainmail',             type:'armor',   slot:'armor',     rar:'uncommon',  def:10,                         desc:'Every ring a small decision.' },
  bone_armor:        { n:'Bone Armor',            type:'armor',   slot:'armor',     rar:'uncommon',  def:9,                          desc:"Someone else's structure, repurposed." },
  steel_plate:       { n:'Steel Plate',           type:'armor',   slot:'armor',     rar:'rare',      def:15,                         desc:'Heavy. Solid.' },
  tidal_armor:       { n:'Tidal Armor',           type:'armor',   slot:'armor',     rar:'rare',      def:14,                         desc:'Salt-preserved. Worn smooth by current.' },
  shadow_cloak:      { n:'Shadow Cloak',          type:'armor',   slot:'armor',     rar:'rare',      def:10, mpB:8,                 desc:'Absorbs light slightly.' },
  monk_robe:         { n:"Monk's Robe",           type:'armor',   slot:'armor',     rar:'uncommon',  def:7,  mpB:12,                desc:'Worn smooth by decades of practice.' },
  cultist_robe:      { n:'Cultist Robe',          type:'armor',   slot:'armor',     rar:'uncommon',  def:5,  mpB:16,  mindB:2,      desc:"Someone believed in something." },
  ash_vestment:      { n:'Ash Vestment',          type:'armor',   slot:'armor',     rar:'rare',      def:11, mpB:10,                desc:'Woven from compressed ash-fiber.' },
  runeforged_plate:  { n:'Runeforged Plate',      type:'armor',   slot:'armor',     rar:'epic',      def:19,                         desc:'Runes provide subtle reinforcement.' },
  void_shroud:       { n:'Void Shroud',           type:'armor',   slot:'armor',     rar:'epic',      def:9,  mpB:28,  mindB:5,      desc:"Where did the rest of it go?" },
  guardian_plate:    { n:"Guardian's Plate",      type:'armor',   slot:'armor',     rar:'legendary', def:24,                         desc:"The Keep's own armour. Ancient. Perfect." },

  /* ══════════════════════════════════
     ACCESSORIES
  ══════════════════════════════════ */
  iron_ring:         { n:'Iron Ring',             type:'accessory', slot:'accessory', rar:'common',   def:1,                         desc:'Plain iron.' },
  copper_amulet:     { n:'Copper Amulet',         type:'accessory', slot:'accessory', rar:'common',   mpB:8,                         desc:'Green with age. Still works.' },
  focus_stone:       { n:'Focus Stone',           type:'accessory', slot:'accessory', rar:'uncommon', mpB:22,                        desc:'Bell-fragment. Amplifies mystical focus.' },
  iron_shield:       { n:'Iron Shield',           type:'accessory', slot:'accessory', rar:'uncommon', def:9,                         desc:'Heavy. Reliable.' },
  tower_shield:      { n:'Tower Shield',          type:'accessory', slot:'accessory', rar:'rare',     def:13,                        desc:'More door than shield.' },
  amulet_fort:       { n:'Amulet of Fortitude',   type:'accessory', slot:'accessory', rar:'rare',     hpB:45, def:3,                 desc:'+45 HP, +3 DEF.' },
  rune_pendant:      { n:'Rune Pendant',          type:'accessory', slot:'accessory', rar:'epic',     mpB:32, mindB:5,               desc:'Arrived on a chain. No one delivered it.' },
  ring_of_power:     { n:'Ring of Power',         type:'accessory', slot:'accessory', rar:'rare',     atk:4,                         desc:'+4 ATK. Aggressive jewellery.' },
  shade_token:       { n:'Shade Token',           type:'accessory', slot:'accessory', rar:'rare',     def:4,  critB:0.06,            desc:'Arena currency. Carries old purpose.' },
  void_crystal:      { n:'Void Crystal',          type:'accessory', slot:'accessory', rar:'epic',     mpB:38, mindB:3,  critB:0.08,  desc:'Crystallised nothing, somehow.' },
  ancient_talisman:  { n:'Ancient Talisman',      type:'accessory', slot:'accessory', rar:'legendary',hpB:55, mpB:28,  mindB:4,      desc:'Belonged to someone important and gone.' },

  /* ══════════════════════════════════
     CONSUMABLES
  ══════════════════════════════════ */
  small_hp:          { n:'Small Health Potion',   type:'consumable', rar:'common',   eff:'hp',  amt:25,  desc:'Restores 25 HP.' },
  health_potion:     { n:'Health Potion',         type:'consumable', rar:'common',   eff:'hp',  amt:45,  desc:'Restores 45 HP.' },
  greater_hp:        { n:'Greater Health Potion', type:'consumable', rar:'uncommon', eff:'hp',  amt:80,  desc:'Restores 80 HP.' },
  mana_shard:        { n:'Mana Shard',            type:'consumable', rar:'common',   eff:'mp',  amt:18,  desc:'Restores 18 MP.' },
  mana_potion:       { n:'Mana Potion',           type:'consumable', rar:'uncommon', eff:'mp',  amt:40,  desc:'Restores 40 MP.' },
  greater_mp:        { n:'Greater Mana Potion',   type:'consumable', rar:'rare',     eff:'mp',  amt:70,  desc:'Restores 70 MP.' },
  elixir:            { n:'Ancient Elixir',        type:'consumable', rar:'epic',     eff:'both',amt:100, desc:'Restores 100 HP and 60 MP.' },
  antidote:          { n:'Antidote',              type:'consumable', rar:'common',   eff:'cure',         desc:'Cures Bleed, Frozen, all status effects.' },
  smoke_bomb:        { n:'Smoke Bomb',            type:'consumable', rar:'uncommon', eff:'escape',       desc:'Guarantees escape from combat.' },
  ash_crystal:       { n:'Ash Crystal',           type:'consumable', rar:'rare',     eff:'mp',  amt:55,  desc:'Ash-folk medicine. Restores 55 MP.' },

  /* ══════════════════════════════════
     SPELLBOOKS
  ══════════════════════════════════ */
  tome_flame:        { n:'Tome of Flame',         type:'spellbook', rar:'uncommon', spell:'fireball',     desc:'Teaches Fireball.' },
  tome_ice:          { n:'Tome of Ice',           type:'spellbook', rar:'uncommon', spell:'ice_lance',    desc:'Teaches Ice Lance.' },
  tome_thunder:      { n:'Tome of Thunder',       type:'spellbook', rar:'rare',     spell:'thunderclap',  desc:'Teaches Thunderclap.' },
  tome_shadow:       { n:'Tome of Shadow',        type:'spellbook', rar:'uncommon', spell:'shadow_bolt',  desc:'Teaches Shadow Bolt.' },
  tome_light:        { n:'Tome of Light',         type:'spellbook', rar:'uncommon', spell:'holy_smite',   desc:'Teaches Holy Smite.' },
  tome_earth:        { n:'Tome of Earth',         type:'spellbook', rar:'uncommon', spell:'tremor',       desc:'Teaches Tremor.' },
  tome_void:         { n:'Tome of the Void',      type:'spellbook', rar:'rare',     spell:'void_tear',    desc:'Teaches Void Tear.' },
  tome_meteor:       { n:'Ancient Grimoire',      type:'spellbook', rar:'epic',     spell:'meteor',       desc:'Teaches Meteor.' },
  tome_winter:       { n:'Tome of Winter',        type:'spellbook', rar:'epic',     spell:'blizzard',     desc:'Teaches Blizzard.' },
  tome_dark:         { n:'Dark Scripture',        type:'spellbook', rar:'rare',     spell:'death_coil',   desc:'Teaches Death Coil.' },
  tome_radiance:     { n:'Tome of Radiance',      type:'spellbook', rar:'epic',     spell:'radiant_nova', desc:'Teaches Radiant Nova.' },
  tome_storm:        { n:'Storm Codex',           type:'spellbook', rar:'epic',     spell:'tempest',      desc:'Teaches Tempest.' },
  tome_frost:        { n:'Frostbind Scroll',      type:'spellbook', rar:'rare',     spell:'frostbind',    desc:'Teaches Frostbind.' },
  tome_sveil:        { n:'Shadow Manual',         type:'spellbook', rar:'uncommon', spell:'shadow_veil',  desc:'Teaches Shadow Veil.' },
  tome_quake:        { n:'Tome of the Earth King',type:'spellbook', rar:'epic',     spell:'earthquake',   desc:'Teaches Earthquake.' },

  /* ══════════════════════════════════
     MISC / RELICS (sell for gold)
  ══════════════════════════════════ */
  ancient_coin:      { n:'Ancient Coin',          type:'misc', rar:'uncommon', val:25,  desc:'Third Age currency. Collectors pay well.' },
  lore_fragment:     { n:'Lore Fragment',         type:'misc', rar:'uncommon', val:30,  desc:'Inscribed stone. Scholars pay well.' },
  rune_fragment:     { n:'Rune Fragment',         type:'misc', rar:'rare',     val:55,  desc:"A fragment of the Keep's rune-system. It moves, slightly." },
  sunken_relic:      { n:'Sunken Relic',          type:'misc', rar:'rare',     val:48,  desc:'Dense. Warm despite the cold water it came from.' },
  soul_shard:        { n:'Soul Shard',            type:'misc', rar:'rare',     val:60,  desc:'A crystal that hums when held.' },
  jade_fragment:     { n:'Jade Fragment',         type:'misc', rar:'uncommon', val:20,  desc:'Polished jade of unknown origin.' },
  bone_rune:         { n:'Bone Rune',             type:'misc', rar:'uncommon', val:35,  desc:'Inscribed on very old bone.' }
};