/* ═══════════════════════════════════════
   ECHOES OF AETHON — Save Menu UI
   Modal overlay with 3 save slots.
   ════════════════════════════════════ */

var SAVE_MENU = { open:false, mode:'save' }; /* mode: 'save' | 'load' */

/* ── OPEN / CLOSE ─────────────────────── */
function openSaveMenu(mode) {
  SAVE_MENU.open = true;
  SAVE_MENU.mode = mode || 'save';
  _renderSaveOverlay();
}

function closeSaveMenu() {
  SAVE_MENU.open = false;
  var el = document.getElementById('save-overlay');
  if (el) el.remove();
}

/* ── RENDER OVERLAY ──────────────────── */
function _renderSaveOverlay() {
  /* Remove old if present */
  var old = document.getElementById('save-overlay');
  if (old) old.remove();

  var mode  = SAVE_MENU.mode;
  var title = mode === 'save' ? '💾 Save Game' : '📂 Load Game';

  var html = [
    '<div id="save-overlay" style="',
      'position:fixed;top:0;left:0;width:100%;height:100%;',
      'background:rgba(0,0,0,.82);z-index:999;',
      'display:flex;align-items:center;justify-content:center;',
      'font-family:inherit"',
      ' onclick="if(event.target===this)closeSaveMenu()">',

    '<div style="',
      'background:var(--p1);border:1px solid var(--brd);',
      'width:min(500px,92vw);padding:20px 22px">',

    /* Header */
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">',
      '<div style="font-family:Georgia,serif;font-size:17px;color:var(--gold)">' + title + '</div>',
      '<button onclick="closeSaveMenu()" style="background:none;border:none;color:var(--mut);',
        'font-size:18px;cursor:pointer;padding:2px 6px">✕</button>',
    '</div>'
  ];

  /* Autosave info bar */
  var auto = (typeof getAutoInfo === 'function') ? getAutoInfo() : null;
  if (auto) {
    var d = new Date(auto.ts);
    var ds = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    html.push(
      '<div style="font-size:10px;color:var(--mut);margin-bottom:14px;',
        'padding:6px 10px;background:var(--p2);border:1px solid var(--brd2)">',
        '⟳ Autosave: Day ' + auto.day + ' — ' + auto.area + ' (' + ds + ')',
        mode === 'load'
          ? ' <button onclick="loadAutoSave()" style="margin-left:8px;font-size:9px;padding:2px 7px;' +
            'background:var(--p3);border:1px solid var(--brd2);color:var(--txt);cursor:pointer">Load</button>'
          : '',
      '</div>'
    );
  }

  /* 3 Slots */
  for (var s = 1; s <= 3; s++) {
    var info = (typeof getSlotInfo === 'function') ? getSlotInfo(s) : null;
    var slotHtml = _slotCard(s, info, mode);
    html.push(slotHtml);
  }

  html.push('</div></div>');

  var el = document.createElement('div');
  el.innerHTML = html.join('');
  document.body.appendChild(el.firstChild);
}

function _slotCard(slot, info, mode) {
  var h = [
    '<div style="display:flex;align-items:center;gap:10px;',
      'padding:10px 12px;margin-bottom:8px;',
      'background:var(--p2);border:1px solid var(--brd2)">'
  ];

  /* Slot number */
  h.push(
    '<div style="font-family:Georgia,serif;font-size:20px;color:var(--dim);',
      'width:28px;text-align:center;flex-shrink:0">' + slot + '</div>'
  );

  if (info) {
    /* Filled slot */
    var d  = new Date(info.ts);
    var ds = d.toLocaleDateString() + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    h.push(
      '<div style="flex:1;min-width:0">',
        '<div style="font-size:13px;color:var(--txt);margin-bottom:2px">' + info.area + '</div>',
        '<div style="font-size:10px;color:var(--mut)">',
          'Day ' + info.day + ' · Skill Lv.' + info.totalSkl + ' · ' + info.gold + 'g',
        '</div>',
        '<div style="font-size:9px;color:var(--dim);margin-top:2px">' + ds + '</div>',
      '</div>'
    );

    /* Action buttons */
    if (mode === 'save') {
      h.push(
        '<div style="display:flex;gap:5px;flex-shrink:0">',
          '<button onclick="confirmSaveSlot(' + slot + ')" style="',
            'padding:5px 11px;font-size:11px;background:var(--p3);',
            'border:1px solid var(--gold2);color:var(--gold);cursor:pointer">Overwrite</button>',
          '<button onclick="confirmDeleteSlot(' + slot + ')" style="',
            'padding:5px 8px;font-size:11px;background:var(--p3);',
            'border:1px solid #4a1a1a;color:#ee4444;cursor:pointer">✕</button>',
        '</div>'
      );
    } else {
      h.push(
        '<div style="display:flex;gap:5px;flex-shrink:0">',
          '<button onclick="loadFromSlot(' + slot + ');closeSaveMenu()" style="',
            'padding:5px 11px;font-size:11px;background:var(--p3);',
            'border:1px solid var(--brd);color:var(--txt);cursor:pointer">Load</button>',
          '<button onclick="confirmDeleteSlot(' + slot + ')" style="',
            'padding:5px 8px;font-size:11px;background:var(--p3);',
            'border:1px solid #4a1a1a;color:#ee4444;cursor:pointer">✕</button>',
        '</div>'
      );
    }
  } else {
    /* Empty slot */
    h.push(
      '<div style="flex:1;font-size:12px;color:var(--dim);font-style:italic">Empty slot</div>'
    );
    if (mode === 'save') {
      h.push(
        '<button onclick="confirmSaveSlot(' + slot + ')" style="',
          'padding:5px 11px;font-size:11px;background:var(--p3);',
          'border:1px solid var(--brd);color:var(--txt);cursor:pointer;flex-shrink:0">Save here</button>'
      );
    } else {
      h.push(
        '<span style="font-size:11px;color:var(--dim);flex-shrink:0">—</span>'
      );
    }
  }

  h.push('</div>');
  return h.join('');
}

/* ── CONFIRM DIALOGS ─────────────────── */
function confirmSaveSlot(slot) {
  var info = (typeof getSlotInfo === 'function') ? getSlotInfo(slot) : null;
  if (info) {
    if (!confirm('Overwrite Slot ' + slot + '?')) return;
  }
  saveToSlot(slot);
  closeSaveMenu();
  _renderSaveOverlay(); /* re-open refreshed */
  setTimeout(closeSaveMenu, 800);
}

function confirmDeleteSlot(slot) {
  if (!confirm('Delete Slot ' + slot + '? This cannot be undone.')) return;
  deleteSlot(slot);
  closeSaveMenu();
}

function loadAutoSave() {
  try {
    var raw = localStorage.getItem('aethon_v2_auto');
    if (!raw) { addLog('No autosave found.', 'n'); return; }
    var snap = JSON.parse(raw);
    if (!snap || !snap.P) { addLog('Autosave corrupted.', 'c'); return; }
    if (typeof _applySnapshot === 'function') _applySnapshot(snap);
    addLog('📂 Autosave loaded — Day ' + (snap.TIME ? snap.TIME.day : 1) + '.', 's');
    closeSaveMenu();
    sv(VIEW);
  } catch(e) {
    addLog('Load failed: ' + e.message, 'c');
  }
}