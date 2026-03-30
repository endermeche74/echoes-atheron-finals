/* ═══════════════════════════════════════
   ECHOES OF AETHON — Entry Point
   Called last, after all other scripts
   have loaded.
   ════════════════════════════════════ */

(function init() {

  /* Recalculate all derived stats from
     starting skills + default equipment */
  recalc();

  /* Set HP/MP to full */
  P.hp = P.maxHp;
  P.mp = P.maxMp;

  /* Opening log messages */
  addLog("You arrive at the Gate Arch of Verath's Gate.", 'i');
  addLog("🗺  Use 'Where to Go' in Explore to move between areas.", 'n');
  addLog("⚔  Search an area to find enemies and gain XP.", 'n');
  addLog("💬  Talk to people — some offer quests, teach skills, sell goods.", 'n');
  addLog("📖  Find spell tomes in ruins or from traders, then use them in Items.", 'n');

  /* Initial render */
  render();

})();