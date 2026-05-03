/*************************************************************
 * characters.js — Echoes of Aethon
 * Définitions des 3 personnages jouables.
 * Contient : stats de base, pixel art (16×32), buffs/debuffs.
 *
 * USAGE : inclure AVANT main.js dans index.html
 *   <script src="js/data/characters.js"></script>
 *************************************************************/

'use strict';

window.CHARACTERS = {

  /* ──────────────────────────────────────────────────────────
   *  1. L'ENVELOPPÉ — Mystique
   * ────────────────────────────────────────────────────────── */
  enveloppe: {
    id:    'enveloppe',
    name:  "L'Enveloppé",
    class: 'Mystique',
    lore:  "Un être ancien enveloppé de bandelettes sacrées. Sa chair fanée cache une magie oubliée des temps morts.",

    // Stats mappées sur l'objet P du jeu
    stats: {
      maxHp: 85,  hp: 85,
      maxMp: 90,  mp: 90,
      atk:   7,   def: 6,
      mind:  18,  crit: 0.05
    },

    // Boost XP de départ dans les compétences (sur P.sxp)
    sxpBoost: { mysticism: 800 },

    // Sorts de départ (ids de SPELLS)
    startSpells: ['ember_bolt'],

    // Flags passifs (lus par les systèmes concernés)
    passives: {
      regen_passive: true   // +2 HP toutes les 3 actions
    },

    buffs:   ['Régénération lente'],
    debuffs: ['Attaque faible'],

    // Pixel art 16×32
    // Palette : 0=transparent 1=#e2d8be 2=#b8a87a 3=#8a6034 4=#c02818 5=#f5f0e2 6=#1c1208
    sprite: {
      palette: ['', '#e2d8be', '#b8a87a', '#8a6034', '#c02818', '#f5f0e2', '#1c1208'],
      pixels: [
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
        [0,0,0,0,1,5,6,5,5,6,5,1,0,0,0,0],
        [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
        [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [3,1,0,1,1,1,2,2,2,2,1,1,1,0,1,3], // bras (bandelettes)
        [3,0,0,4,0,1,4,4,4,4,1,0,4,0,0,3], // bras + stripe pec
        [0,3,3,4,1,1,2,2,2,2,1,1,4,3,3,0],
        [0,0,3,1,0,1,2,2,2,2,1,0,1,3,0,0],
        [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
        [0,0,0,0,0,3,3,3,3,3,3,0,0,0,0,0],
        [0,0,0,0,3,3,2,2,2,2,3,3,0,0,0,0],
        [0,0,0,0,3,2,3,3,3,3,2,3,0,0,0,0],
        [0,0,0,0,3,3,2,2,2,2,3,3,0,0,0,0],
        [0,0,0,0,3,2,3,3,3,3,2,3,0,0,0,0],
        [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
        [0,0,0,0,1,3,3,0,0,3,3,1,0,0,0,0],
        [0,0,0,0,1,3,0,0,0,0,3,1,0,0,0,0],
        [0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [0,0,0,0,0,1,3,0,0,3,1,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [0,0,0,0,0,3,3,0,0,3,3,0,0,0,0,0],
        [0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [0,0,0,0,0,3,1,0,0,1,3,0,0,0,0,0],
        [0,0,0,0,0,1,3,0,0,3,1,0,0,0,0,0],
        [0,0,0,0,1,3,1,0,0,1,3,1,0,0,0,0],
      ]
    }
  },

  /* ──────────────────────────────────────────────────────────
   *  2. LE CONSTRUCT — Guerrier
   * ────────────────────────────────────────────────────────── */
  construct: {
    id:    'construct',
    name:  'Le Construct',
    class: 'Guerrier',
    lore:  "Un automate de chair et de métal forgé dans une forge oubliée. Ses engrenages grincent, mais sa volonté ne fléchit pas.",

    stats: {
      maxHp: 130, hp: 130,
      maxMp: 40,  mp: 40,
      atk:   18,  def: 12,
      mind:  6,   crit: 0.03
    },

    sxpBoost: { blade: 1000, fortitude: 600 },
    startSpells: [],

    passives: {
      bleed_immune: true,   // immunité aux saignements
      armor_natural: 3      // réduction de dégâts fixe par coup
    },

    buffs:   ['Armure naturelle', 'Immunité saignement'],
    debuffs: ['Très lent', 'Magie inefficace'],

    // Palette : 0=transparent 1=#d8cca8 2=#a89870 3=#6a5840 4=#3a4866 5=#202e44 6=#e8e0c8
    sprite: {
      palette: ['', '#d8cca8', '#a89870', '#6a5840', '#3a4866', '#202e44', '#e8e0c8'],
      pixels: [
        [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,1,2,2,3,2,2,1,0,0,0,0,0],
        [0,0,0,0,1,3,2,2,2,2,3,1,0,0,0,0],
        [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
        [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [1,1,1,2,2,2,1,1,1,1,2,2,2,1,1,1], // épaules larges + bras mécaniques
        [1,3,1,2,3,1,2,2,2,2,1,3,2,1,3,1], // joints/rivets des bras
        [0,1,3,2,1,1,2,2,2,2,1,1,2,3,1,0],
        [0,0,1,3,2,1,2,2,2,2,1,2,3,1,0,0],
        [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
        [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
        [0,0,0,0,4,5,4,4,4,4,5,4,0,0,0,0],
        [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
        [0,0,0,4,5,4,4,4,4,4,5,4,4,0,0,0],
        [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
        [0,0,0,0,4,5,4,4,4,4,5,4,0,0,0,0],
        [0,0,0,0,1,4,4,0,0,4,4,1,0,0,0,0],
        [0,0,0,0,1,2,0,0,0,0,2,1,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,2,0,0,2,2,1,0,0,0,0],
      ]
    }
  },

  /* ──────────────────────────────────────────────────────────
   *  3. LE BEC — Éclaireur  ← PERSONNAGE CHOISI
   * ────────────────────────────────────────────────────────── */
  bec: {
    id:    'bec',
    name:  'Le Bec',
    class: 'Éclaireur',
    lore:  "Une créature de la pénombre aux yeux d'obsidienne. Rien ne lui échappe dans les ténèbres des donjons.",

    stats: {
      maxHp: 65,  hp: 65,
      maxMp: 70,  mp: 70,
      atk:   10,  def: 5,
      mind:  10,  crit: 0.14   // AGI 5 → crit élevé
    },

    sxpBoost: { archery: 800, lore: 400 },
    startSpells: [],

    passives: {
      night_vision: true,     // ennemis nocturnes affichés même sans torche
      evade_bonus:  0.12      // +12% chance d'esquive (s'additionne au crit/evade du combat)
    },

    buffs:   ['Vision nocturne', 'Esquive accrue'],
    debuffs: ['Endurance faible'],

    // Palette : 0=transparent 1=#d0c8a0 2=#a8a078 3=#1a1808 4=#c02818 5=#e8e4d0 6=#c8b888
    sprite: {
      palette: ['', '#d0c8a0', '#a8a078', '#1a1808', '#c02818', '#e8e4d0', '#c8b888'],
      pixels: [
        [0,0,0,0,0,0,0,1,3,0,0,0,0,0,0,0], // crête
        [0,0,0,0,0,0,1,5,5,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,5,5,5,5,1,0,0,0,0,0],
        [0,0,0,0,1,5,3,5,5,3,5,1,0,0,0,0], // yeux
        [0,0,0,0,1,5,5,5,5,5,5,1,0,0,0,0],
        [0,0,0,0,0,1,6,6,6,6,1,0,0,0,0,0], // bec haut
        [0,0,0,0,0,0,6,6,6,6,0,0,0,0,0,0], // bec bas
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0], // cou
        [2,2,1,0,0,1,2,2,2,2,1,0,0,1,2,2], // épaules + bras
        [2,1,0,0,0,1,4,4,4,4,1,0,0,0,1,2], // bras + stripe pec
        [0,2,0,0,0,1,2,2,2,2,1,0,0,0,2,0], // bras
        [0,0,2,1,0,1,2,2,2,2,1,0,1,2,0,0], // mains
        [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0], // stripe bas
        [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0], // taille
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0], // hanches
        [0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0], // genou
        [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0,2,0,0,0,0,0,0],
        [0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0],
        [0,0,0,0,0,1,2,0,0,2,1,0,0,0,0,0],
        [0,0,0,0,1,2,2,0,0,2,2,1,0,0,0,0],
        [0,0,0,0,1,2,0,0,0,0,2,1,0,0,0,0], // pieds
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      ]
    }
  }
};

// ─── Helpers ────────────────────────────────────────────────

/**
 * Dessine un sprite 16×32 sur un canvas 2D.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} sprite  — { palette, pixels }
 * @param {number} x, y   — position en pixels canvas
 * @param {number} scale  — ex. 5 → sprite affiché en 80×160
 */
window.drawCharSprite = function(ctx, sprite, x, y, scale) {
  sprite.pixels.forEach(function(row, py) {
    row.forEach(function(ci, px) {
      if (!ci) return;
      ctx.fillStyle = sprite.palette[ci];
      ctx.fillRect(x + px * scale, y + py * scale, scale, scale);
    });
  });
};

/**
 * Applique les stats d'un personnage sur l'objet global P.
 * À appeler UNE FOIS après que P est initialisé, avant le démarrage du jeu.
 * @param {string} charId — clé dans CHARACTERS
 */
window.applyCharacter = function(charId) {
  var ch = window.CHARACTERS[charId];
  if (!ch) { console.warn('[Characters] Unknown charId:', charId); return; }

  // Stats de base
  Object.assign(P, ch.stats);

  // Boosts XP compétences
  if (ch.sxpBoost) {
    Object.keys(ch.sxpBoost).forEach(function(sk) {
      if (P.sxp && sk in P.sxp) {
        P.sxp[sk] = (P.sxp[sk] || 0) + ch.sxpBoost[sk];
      }
    });
  }

  // Sorts de départ
  if (ch.startSpells && Array.isArray(P.spells)) {
    ch.startSpells.forEach(function(id) {
      if (!P.spells.includes(id)) P.spells.push(id);
    });
  }

  // Passifs stockés sur P pour lecture par les systèmes
  P.passives = ch.passives || {};

  // Nom de la classe visible dans l'UI
  P.charClass = ch.class;
  P.charId    = ch.id;

  // Sauvegarde du choix
  try {
    localStorage.setItem('aethon_character', charId);
  } catch(e) {}

  console.log('[Characters] Applied:', ch.name, '— HP:', P.maxHp, 'ATK:', P.atk);
};