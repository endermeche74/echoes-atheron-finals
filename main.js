/* ═══════════════════════════════════════
   ECHOES OF AETHON — Entry Point
   ════════════════════════════════════ */

(function init() {

  /* Calculate all derived stats */
  recalc();

  /* Full resources */
  P.hp = P.maxHp;
  P.mp = P.maxMp;

  /* Opening log */
  addLog("You arrive at the Gate Arch of Verath's Gate.", 'i');
  addLog("🗺  Use 'Where to Go' to move between areas.", 'n');
  addLog("⚔  Search an area to find enemies and gain XP.", 'n');
  addLog("💬  Talk to people — quests, skills, and goods.", 'n');
  addLog("📖  Find spell tomes in ruins, learn them from Items.", 'n');

  /* Force VIEW to explore and sync tab highlight before first render */
  VIEW = 'explore';
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.toggle('on', t.dataset.v === 'explore');
  });

  /* Initial render — called after DOM is fully ready */
  render();

})();