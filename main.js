/* ═══════════════════════════════════════
   ECHOES OF AETHON — Entry Point
   Uses DOMContentLoaded to guarantee
   all HTML is ready before first render.
   ════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', function () {

  /* ── Sanity check: catch missing data files early ── */
  var missing = [];
  if (typeof AREAS    === 'undefined') missing.push('js/data/areas.js');
  if (typeof ITEMS    === 'undefined') missing.push('js/data/items.js');
  if (typeof ENEMIES  === 'undefined') missing.push('js/data/enemies.js');
  if (typeof NPCS     === 'undefined') missing.push('js/data/npcs.js');
  if (typeof QUESTS   === 'undefined') missing.push('js/data/quests.js');
  if (typeof ABIL     === 'undefined') missing.push('js/data/abilities.js');
  if (typeof SPELLS   === 'undefined') missing.push('js/data/spells.js');

  if (missing.length > 0) {
    document.getElementById('main').innerHTML =
      '<div style="padding:20px;color:#ff8877;font-size:13px;line-height:2">' +
      '<strong>⚠ Failed to load data files:</strong><br>' +
      missing.map(function (f) { return '• ' + f; }).join('<br>') +
      '<br><br><small style="color:var(--mut)">Check the browser console (F12) for syntax errors.</small>' +
      '</div>';
    return;
  }

  /* ── Check save, offer to load ── */
  var hasSavedGame = hasSave();

  /* ── Init base stats from skills (level 0 defaults) ── */
  recalc();

  /* ── Character selection — shows UI or skips if already saved ── */
  CharacterSelect.init(function () {

    /* applyCharacter() has already run at this point */
    P.hp = P.maxHp;
    P.mp = P.maxMp;

    /* ── Opening log ── */
    addLog("You arrive at the Gate Arch of Verath's Gate.", 'i');
    addLog("🗺  'Where to Go' moves you between areas.", 'n');
    addLog("⚔  Searching an area finds enemies and XP.", 'n');
    addLog("💬  Talking to people reveals quests and secrets.", 'n');
    addLog("📖  Use spell tomes from your inventory to learn spells.", 'n');
    if (hasSavedGame) {
      var info = getSaveInfo();
      if (info) {
        addLog("💾  Save found — Day " + info.day + " · Total Skill Lv." + info.totalSkl + ". Click Load to continue.", 'd');
      }
    }

    /* ── Force explore tab active ── */
    VIEW = 'explore';
    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.toggle('on', t.dataset.v === 'explore');
    });

    /* ── First render ── */
    render();

  });
});