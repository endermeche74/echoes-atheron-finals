/*************************************************************
 * character_select.js — Echoes of Aethon
 * Écran de sélection de personnage (overlay HTML + canvas).
 *
 * USAGE : inclure APRÈS characters.js, AVANT main.js
 *   <script src="js/systems/character_select.js"></script>
 *
 * INTÉGRATION :
 *   Au démarrage du jeu, appeler CharacterSelect.init(onDone)
 *   où onDone() est la fonction qui lance le jeu normalement.
 *   Si un personnage est déjà sauvegardé, onDone() est appelé
 *   immédiatement sans afficher l'écran.
 *************************************************************/

'use strict';

window.CharacterSelect = (function() {

  // ── Constantes ──────────────────────────────────────────────
  var SPRITE_SCALE = 5;          // 16×32 → 80×160 px affiché
  var SPRITE_W     = 16 * SPRITE_SCALE;
  var SPRITE_H     = 32 * SPRITE_SCALE;
  var CHAR_ORDER   = ['enveloppe', 'construct', 'bec'];

  var _overlay  = null;
  var _selected = null;
  var _onDone   = null;

  // ── CSS injecté ─────────────────────────────────────────────
  var CSS = [
    '#aethon-char-select {',
    '  position:fixed; inset:0; z-index:9999;',
    '  background:#0c0a08;',
    '  display:flex; flex-direction:column;',
    '  align-items:center; justify-content:center;',
    '  font-family: "Courier New", monospace;',
    '  color:#c8bfa0;',
    '  padding:1rem;',
    '  box-sizing:border-box;',
    '}',
    '#aethon-char-select h1 {',
    '  font-size:clamp(14px,3vw,22px);',
    '  letter-spacing:0.25em;',
    '  text-transform:uppercase;',
    '  color:#8a7a5a;',
    '  margin:0 0 4px;',
    '  font-weight:normal;',
    '}',
    '#aethon-char-select .subtitle {',
    '  font-size:clamp(10px,2vw,13px);',
    '  color:#504838;',
    '  margin:0 0 28px;',
    '  letter-spacing:0.1em;',
    '}',
    '#aethon-char-select .char-grid {',
    '  display:flex; gap:16px; flex-wrap:wrap;',
    '  justify-content:center; margin-bottom:20px;',
    '}',
    '#aethon-char-select .char-card {',
    '  border:1px solid #2a2418;',
    '  background:#100e0c;',
    '  padding:16px 12px;',
    '  cursor:pointer;',
    '  display:flex; flex-direction:column;',
    '  align-items:center; gap:10px;',
    '  transition:border-color 0.15s, background 0.15s;',
    '  width:130px;',
    '  box-sizing:border-box;',
    '}',
    '#aethon-char-select .char-card:hover {',
    '  border-color:#5a4a2a;',
    '  background:#18140f;',
    '}',
    '#aethon-char-select .char-card.selected {',
    '  border-color:#8a6a30;',
    '  background:#1c180c;',
    '}',
    '#aethon-char-select .char-name {',
    '  font-size:12px; color:#c8bfa0;',
    '  text-align:center; letter-spacing:0.05em;',
    '}',
    '#aethon-char-select .char-class {',
    '  font-size:10px; color:#504838;',
    '  text-align:center; letter-spacing:0.08em;',
    '  text-transform:uppercase;',
    '}',
    '#aethon-char-select .detail-panel {',
    '  max-width:440px; width:100%;',
    '  border:1px solid #2a2418;',
    '  background:#100e0c;',
    '  padding:14px 16px;',
    '  margin-bottom:16px;',
    '  min-height:130px;',
    '  box-sizing:border-box;',
    '}',
    '#aethon-char-select .detail-lore {',
    '  font-size:11px; color:#786858;',
    '  line-height:1.6; margin:0 0 12px;',
    '}',
    '#aethon-char-select .stat-grid {',
    '  display:grid; grid-template-columns:1fr 1fr;',
    '  gap:8px; margin-bottom:12px;',
    '}',
    '#aethon-char-select .stat-row { display:flex; flex-direction:column; gap:3px; }',
    '#aethon-char-select .stat-label {',
    '  display:flex; justify-content:space-between;',
    '  font-size:10px; color:#504838;',
    '}',
    '#aethon-char-select .stat-bar-bg {',
    '  height:3px; background:#1e1a14;',
    '}',
    '#aethon-char-select .stat-bar-fill { height:100%; }',
    '#aethon-char-select .tags {',
    '  display:flex; gap:6px; flex-wrap:wrap;',
    '}',
    '#aethon-char-select .tag {',
    '  font-size:9px; padding:2px 7px;',
    '  letter-spacing:0.05em;',
    '}',
    '#aethon-char-select .tag.buff  { color:#6a9a6a; border:1px solid #2a4a2a; }',
    '#aethon-char-select .tag.debuff{ color:#9a4a4a; border:1px solid #4a1a1a; }',
    '#aethon-char-select #cs-start-btn {',
    '  display:none;',
    '  background:transparent;',
    '  border:1px solid #5a4a2a;',
    '  color:#c8bfa0;',
    '  font-family:inherit;',
    '  font-size:12px;',
    '  letter-spacing:0.2em;',
    '  text-transform:uppercase;',
    '  padding:10px 40px;',
    '  cursor:pointer;',
    '  transition:border-color 0.15s, color 0.15s;',
    '}',
    '#aethon-char-select #cs-start-btn:hover {',
    '  border-color:#8a6a30; color:#e8d8a0;',
    '}',
  ].join('\n');

  // ── Stat config ─────────────────────────────────────────────
  var STATS = [
    { key:'FOR', label:'Force',     color:'#8a3020', mapStat:'atk'  },
    { key:'AGI', label:'Agilité',   color:'#2a7a5a', mapStat:'crit' },
    { key:'MAG', label:'Magie',     color:'#4a3a8a', mapStat:'mind' },
    { key:'END', label:'Endurance', color:'#8a6020', mapStat:'maxHp'},
  ];

  var STAT_VALUES = {
    enveloppe: { FOR:2, AGI:2, MAG:5, END:4 },
    construct:  { FOR:5, AGI:1, MAG:2, END:5 },
    bec:        { FOR:3, AGI:5, MAG:3, END:2 },
  };

  // ── Dessin sprite ────────────────────────────────────────────
  function _drawSprite(canvas, charId) {
    var ch  = window.CHARACTERS[charId];
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ch.sprite.pixels.forEach(function(row, py) {
      row.forEach(function(ci, px) {
        if (!ci) return;
        ctx.fillStyle = ch.sprite.palette[ci];
        ctx.fillRect(px * SPRITE_SCALE, py * SPRITE_SCALE, SPRITE_SCALE, SPRITE_SCALE);
      });
    });
  }

  // ── Panneau de détail ────────────────────────────────────────
  function _updateDetail(charId) {
    var ch   = window.CHARACTERS[charId];
    var vals = STAT_VALUES[charId];
    var panel = document.getElementById('cs-detail-panel');
    if (!panel) return;

    var statHtml = STATS.map(function(s) {
      var v = vals[s.key] || 0;
      return [
        '<div class="stat-row">',
        '  <div class="stat-label">',
        '    <span>' + s.label + '</span>',
        '    <span>' + v + '/5</span>',
        '  </div>',
        '  <div class="stat-bar-bg">',
        '    <div class="stat-bar-fill" style="width:' + (v*20) + '%;background:' + s.color + '"></div>',
        '  </div>',
        '</div>',
      ].join('');
    }).join('');

    var tagHtml =
      ch.buffs.map(function(b)  { return '<span class="tag buff">+' + b + '</span>';  }).join('') +
      ch.debuffs.map(function(d){ return '<span class="tag debuff">−' + d + '</span>';}).join('');

    panel.innerHTML =
      '<p class="detail-lore">' + ch.lore + '</p>' +
      '<div class="stat-grid">' + statHtml + '</div>' +
      '<div class="tags">' + tagHtml + '</div>';
  }

  // ── Sélection d'un personnage ────────────────────────────────
  function _select(charId) {
    _selected = charId;

    document.querySelectorAll('#aethon-char-select .char-card').forEach(function(c) {
      c.classList.toggle('selected', c.dataset.char === charId);
    });

    _updateDetail(charId);
    document.getElementById('cs-start-btn').style.display = 'inline-block';
  }

  // ── Construction de l'overlay ────────────────────────────────
  function _build() {
    // Style
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Overlay
    _overlay = document.createElement('div');
    _overlay.id = 'aethon-char-select';

    // Titre
    var h1 = document.createElement('h1');
    h1.textContent = 'Echoes of Aethon';
    var sub = document.createElement('p');
    sub.className = 'subtitle';
    sub.textContent = 'Choisissez votre être';
    _overlay.appendChild(h1);
    _overlay.appendChild(sub);

    // Grille de personnages
    var grid = document.createElement('div');
    grid.className = 'char-grid';

    CHAR_ORDER.forEach(function(cid) {
      var ch   = window.CHARACTERS[cid];
      var card = document.createElement('div');
      card.className   = 'char-card';
      card.dataset.char = cid;
      card.onclick = function() { _select(cid); };

      var canvas = document.createElement('canvas');
      canvas.width  = SPRITE_W;
      canvas.height = SPRITE_H;
      canvas.style.imageRendering = 'pixelated';

      var name = document.createElement('div');
      name.className   = 'char-name';
      name.textContent = ch.name;

      var cls = document.createElement('div');
      cls.className   = 'char-class';
      cls.textContent = ch.class;

      card.appendChild(canvas);
      card.appendChild(name);
      card.appendChild(cls);
      grid.appendChild(card);

      // On dessine après insertion (canvas doit être dans le DOM)
      requestAnimationFrame(function() { _drawSprite(canvas, cid); });
    });

    _overlay.appendChild(grid);

    // Panneau détail
    var detail = document.createElement('div');
    detail.className = 'detail-panel';
    detail.id = 'cs-detail-panel';
    detail.innerHTML = '<p class="detail-lore" style="color:#302820;text-align:center;margin-top:40px;">— Sélectionnez un personnage —</p>';
    _overlay.appendChild(detail);

    // Bouton démarrer
    var btn = document.createElement('button');
    btn.id        = 'cs-start-btn';
    btn.textContent = 'Commencer l\'aventure';
    btn.onclick   = _confirm;
    _overlay.appendChild(btn);

    document.body.appendChild(_overlay);
  }

  // ── Confirmation et lancement ────────────────────────────────
  function _confirm() {
    if (!_selected) return;

    // Appliquer les stats sur P
    if (typeof window.applyCharacter === 'function') {
      window.applyCharacter(_selected);
    }

    // Retirer l'overlay avec fondu
    _overlay.style.transition = 'opacity 0.5s';
    _overlay.style.opacity    = '0';
    setTimeout(function() {
      if (_overlay && _overlay.parentNode) {
        _overlay.parentNode.removeChild(_overlay);
      }
      if (typeof _onDone === 'function') _onDone();
    }, 500);
  }

  // ── API publique ─────────────────────────────────────────────

  /**
   * Point d'entrée principal.
   * @param {function} onDone  — callback appelé quand le jeu peut démarrer
   * @param {boolean}  force   — forcer l'affichage même si un perso est déjà sauvegardé
   */
  function init(onDone, force) {
    _onDone = onDone;

    // Vérifier si un personnage est déjà enregistré (partie en cours)
    var saved = null;
    try { saved = localStorage.getItem('aethon_character'); } catch(e) {}

    if (saved && window.CHARACTERS[saved] && !force) {
      // Perso déjà choisi : appliquer et lancer directement
      if (typeof window.applyCharacter === 'function') {
        window.applyCharacter(saved);
      }
      if (typeof _onDone === 'function') _onDone();
      return;
    }

    // Sinon afficher l'écran de sélection
    _build();
  }

  /**
   * Réinitialise le choix (appeler depuis le menu "Nouvelle partie").
   */
  function reset() {
    try { localStorage.removeItem('aethon_character'); } catch(e) {}
    _selected = null;
  }

  return { init: init, reset: reset };

})();