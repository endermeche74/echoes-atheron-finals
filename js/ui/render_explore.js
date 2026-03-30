/* ═══════════════════════════════════════
   ECHOES OF AETHON — Main Render Dispatcher
   ════════════════════════════════════ */

/**
 * Switch the active tab/view.
 * Always clears main + sinfo before rendering.
 */
function sv(v) {
  VIEW = v;
  sfxClick();

  /* Sync tab highlight */
  document.querySelectorAll('.tab').forEach(function (t) {
    t.classList.toggle('on', t.dataset.v === v);
  });

  render();
}

/**
 * Master render — routes to correct sub-renderer.
 * Always clears containers first to prevent stale content.
 */
function render() {
  updHdr();

  var M = document.getElementById('main');
  var S = document.getElementById('sinfo');

  /* Clear both panels before every render */
  M.innerHTML = '';
  S.innerHTML = '';

  /* Death screen */
  if (P.hp <= 0) {
    M.innerHTML = renderDeath();
    return;
  }

  /* Combat overrides all views */
  if (C.on) {
    M.innerHTML = renderCombat();
    S.innerHTML = renderCombatSide();
    return;
  }

  /* Dialogue overrides all views */
  if (DLG.on) {
    M.innerHTML = renderDialogue();
    S.innerHTML = renderDialogueSide();
    return;
  }

  /* Normal tab views */
  switch (VIEW) {
    case 'explore':
      M.innerHTML = renderExplore();
      S.innerHTML = renderExploreSide();
      break;
    case 'skills':
      M.innerHTML = renderSkills();
      S.innerHTML = renderSkillsSide();
      break;
    case 'inventory':
      M.innerHTML = renderInventory();
      S.innerHTML = renderInventorySide();
      break;
    case 'spellbook':
      M.innerHTML = renderSpellbook();
      S.innerHTML = renderSpellbookSide();
      break;
    case 'quests':
      M.innerHTML = renderQuests();
      S.innerHTML = renderQuestsSide();
      break;
    case 'map':
      M.innerHTML = renderMap();
      S.innerHTML = renderMapSide();
      break;
    default:
      M.innerHTML = renderExplore();
      S.innerHTML = renderExploreSide();
  }
}

/* ── DEATH SCREEN ────────────────────────── */
function renderDeath() {
  return [
    '<div class="death">',
    '<div style="font-family:Georgia,serif;font-size:30px;color:#8b2020;',
    'letter-spacing:5px;margin-bottom:14px">YOU HAVE FALLEN</div>',
    '<div style="font-family:Georgia,serif;font-style:italic;color:var(--mut);',
    'font-size:13px;margin-bottom:24px;line-height:2">',
    'The ruins of Aethon do not mourn.<br>',
    'They have seen this many times before.<br>',
    'They will see it many times again.<br><br>',
    'The cycle continues.',
    '</div>',
    '<button class="btn" onclick="doRespawn()" ',
    'style="margin:0 auto;display:block;padding:12px 30px;font-size:14px">',
    '⟳ Rise Again</button>',
    '<div style="margin-top:12px;color:var(--mut);font-size:10px">',
    'Skills and equipment preserved. You return to Verath\'s Gate.',
    '</div>',
    '</div>'
  ].join('');
}