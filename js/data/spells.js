/* ═══════════════════════════════════════
   ECHOES OF AETHON — Spells Data
   Learned from tomes. Used in combat.
   Damage scales with P.mind.
   ════════════════════════════════════ */

var SPELLS = {

  /* ── FIRE ── */
  fireball: {
    id:'fireball', name:'Fireball', school:'Fire', mp:18, dmgM:2.5, rar:'uncommon',
    desc:'Hurls a sphere of roiling flame.',
    flavor:'The Third Civilization used this as a salute.'
  },
  meteor: {
    id:'meteor', name:'Meteor', school:'Fire', mp:38, dmgM:4.5, rar:'epic',
    desc:'Calls down a meteor from above. Catastrophic damage.',
    flavor:'A smaller version of this made the Ashwood.'
  },

  /* ── ICE ── */
  ice_lance: {
    id:'ice_lance', name:'Ice Lance', school:'Ice', mp:14, dmgM:2.2, se:'slow', rar:'uncommon',
    desc:'Crystallizes air into a piercing lance. Slows the target.',
    flavor:'Cold from a direction that has no name.'
  },
  blizzard: {
    id:'blizzard', name:'Blizzard', school:'Ice', mp:28, dmgM:3.4, se:'frozen', rar:'epic',
    desc:'Sheets of razor ice descend. May freeze target solid.',
    flavor:'Ice from a sky that is no longer there.'
  },
  frostbind: {
    id:'frostbind', name:'Frostbind', school:'Ice', mp:18, dmgM:1.6, se:'frozen', rar:'rare',
    desc:'Encases the target in creeping ice. Freezes for one turn.',
    flavor:'The target has time to reconsider while the ice closes.'
  },

  /* ── LIGHTNING ── */
  thunderclap: {
    id:'thunderclap', name:'Thunderclap', school:'Lightning', mp:20, dmgM:2.8, se:'stun', rar:'rare',
    desc:'Calls down a concussive bolt. May stun the target.',
    flavor:'The Ironbell Order forbids this spell within range of the bells.'
  },
  tempest: {
    id:'tempest', name:'Tempest', school:'Lightning', mp:34, dmgM:3.8, rar:'epic',
    desc:'A sustained lightning storm channelled through your body.',
    flavor:'You are the conductor. Both meanings apply.'
  },

  /* ── SHADOW ── */
  shadow_bolt: {
    id:'shadow_bolt', name:'Shadow Bolt', school:'Shadow', mp:12, dmgM:1.8, rar:'common',
    desc:'Condensed darkness, hurled at a target.',
    flavor:'Lands with the sound of someone changing their mind.'
  },
  death_coil: {
    id:'death_coil', name:'Death Coil', school:'Shadow', mp:22, dmgM:2.8, heal:true, rar:'rare',
    desc:'A coil of death-energy. Damages enemy and heals you.',
    flavor:'Life borrowed from an unwilling creditor.'
  },
  shadow_veil: {
    id:'shadow_veil', name:'Shadow Veil', school:'Shadow', mp:15, dmgM:0,
    typ:'buf', eff:'evade', rar:'uncommon',
    desc:'Wraps you in shadow. Evade the next incoming attack.',
    flavor:"You become something that light decides not to engage with."
  },

  /* ── HOLY ── */
  holy_smite: {
    id:'holy_smite', name:'Holy Smite', school:'Holy', mp:16, dmgM:2.0,
    bonusUndead:true, rar:'uncommon',
    desc:'Radiant force. Deals extra damage to undead.',
    flavor:'The light of something older than gods.'
  },
  radiant_nova: {
    id:'radiant_nova', name:'Radiant Nova', school:'Holy', mp:30, dmgM:3.2, rar:'epic',
    desc:'An explosion of pure light. Devastating to darkness.',
    flavor:"The monks say this is what the bells sounded like. Once."
  },

  /* ── EARTH ── */
  tremor: {
    id:'tremor', name:'Tremor', school:'Earth', mp:16, dmgM:1.9, se:'defdown', rar:'uncommon',
    desc:'Ruptures the earth. Reduces enemy DEF for the rest of combat.',
    flavor:"The Keep was built on ground that never trembles. This spell was found inside it."
  },
  earthquake: {
    id:'earthquake', name:'Earthquake', school:'Earth', mp:32, dmgM:4.0, se:'defdown', rar:'epic',
    desc:'Splits the earth beneath your enemy.',
    flavor:'The ruins were not always ruins.'
  },

  /* ── VOID ── */
  void_tear: {
    id:'void_tear', name:'Void Tear', school:'Void', mp:24, dmgM:3.0, iRes:true, rar:'rare',
    desc:'Tears a rift in reality. Ignores all resistances.',
    flavor:'What stays in the tear is not the spell.'
  }
};