/*************************************************************
 * inventory_canvas.js — HD Canvas Inventory Overlay
 * Opens on [I] key in canvas mode.
 * Load after: ui_hd.js, sprites_48.js, engine.js
 *************************************************************/

const InventoryCanvas = (function() {
    'use strict';

    // ── STATE ────────────────────────────────────────────────
    let open       = false;
    let canvas     = null;
    let ctx        = null;

    let selectedSlot = 0;   // index in items[]
    let activeTab    = 'items';  // 'items' | 'equip' | 'stats'
    let page         = 0;
    const ITEMS_PER_PAGE = 20;  // 4 rows × 5 cols

    // ── HELPERS ──────────────────────────────────────────────
    function getGameItems() {
        // Try several common inventory formats
        if (typeof P !== 'undefined' && Array.isArray(P.inv))  return P.inv;
        if (typeof P !== 'undefined' && Array.isArray(P.items)) return P.items;
        return DEMO_ITEMS;
    }

    function getGameEquip() {
        if (typeof P !== 'undefined' && P.equip) return P.equip;
        return {};
    }

    function getGameStats() {
        if (typeof P !== 'undefined') {
            return {
                hp:    P.hp    || 0,  maxHp: P.maxHP || P.maxHp || 100,
                mp:    P.mp    || 0,  maxMp: P.maxMP || P.maxMp || 60,
                atk:   P.atk   || 0,  def:   P.def   || 0,
                level: P.level || 1,
                xp:    P.xp    || 0,  xpNext: P.xpNext || 100,
                gold:  P.gold  || 0,
                name:  P.name  || 'Hero',
            };
        }
        return { hp:80,maxHp:100,mp:40,maxMp:60,atk:18,def:6,level:3,xp:240,xpNext:500,gold:42,name:'Hero' };
    }

    // Demo items shown when no game state
    const DEMO_ITEMS = [
        { id:'potion_health', name:'Health Potion', type:'potion',      qty:3, desc:'Restores 30 HP.',           effect:'hp+30'   },
        { id:'potion_mana',   name:'Mana Potion',   type:'potion_mana', qty:2, desc:'Restores 20 MP.',           effect:'mp+20'   },
        { id:'sword',         name:'Iron Sword',    type:'weapon',      qty:1, desc:'A sturdy iron blade.',      atk:'+8'         },
        { id:'key',           name:'Old Key',       type:'misc',        qty:1, desc:'Opens something nearby.'                    },
        { id:'chest',         name:'Lockbox',       type:'misc',        qty:1, desc:'A small locked container.'                  },
    ];

    const EQUIP_SLOTS = [
        { key:'head',     label:'Head'      },
        { key:'chest',    label:'Chest'     },
        { key:'weapon',   label:'Weapon'    },
        { key:'offhand',  label:'Off-hand'  },
        { key:'boots',    label:'Boots'     },
        { key:'ring',     label:'Ring'      },
    ];

    // ── OVERLAY ──────────────────────────────────────────────
    function createOverlay() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.id    = 'inventory-canvas';
        canvas.width  = CONFIG.CANVAS_W;
        canvas.height = CONFIG.CANVAS_H;
        canvas.style.cssText = `
            position:absolute; top:0; left:0;
            width:100%; height:100%;
            pointer-events:none;
            image-rendering:pixelated;
            display:none; z-index:16;
        `;
        const container = document.getElementById('canvas-container');
        if (container) container.appendChild(canvas);
        ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        startLoop();
    }

    // ── OPEN / CLOSE ─────────────────────────────────────────
    function toggle() {
        if (!canvas) return;
        open = !open;
        canvas.style.display = open ? 'block' : 'none';
        if (open) {
            selectedSlot = 0;
            page = 0;
            if (typeof Input !== 'undefined') Input.disable();
        } else {
            if (typeof Input !== 'undefined') Input.enable();
        }
    }

    function close() {
        if (!open) return;
        open = false;
        if (canvas) canvas.style.display = 'none';
        if (typeof Input !== 'undefined') Input.enable();
    }

    // ── LOOP ─────────────────────────────────────────────────
    function startLoop() {
        function loop() {
            if (open) render();
            else if (ctx) ctx.clearRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    // ── RENDER ───────────────────────────────────────────────
    function render() {
        if (!ctx) return;
        const cw = CONFIG.CANVAS_W;  // 624
        const ch = CONFIG.CANVAS_H;  // 336
        ctx.clearRect(0, 0, cw, ch);

        // Darken background
        UI_HD.darkenScreen(ctx, 0.78);

        // ── Layout ──
        const PAD   = 8;
        const leftW = 142;
        const rightW= 160;
        const midW  = cw - leftW - rightW - PAD * 4;
        const topY  = PAD;
        const fullH = ch - PAD * 2;
        const leftX = PAD;
        const midX  = leftX + leftW + PAD;
        const rightX= midX + midW + PAD;

        renderLeftPanel (ctx, leftX,  topY, leftW,  fullH);
        renderCenterPanel(ctx, midX,  topY, midW,   fullH);
        renderRightPanel (ctx, rightX,topY, rightW, fullH);
    }

    // ── LEFT: EQUIPMENT SLOTS + CHARACTER ────────────────────
    function renderLeftPanel(ctx, x, y, w, h) {
        const stats = getGameStats();
        const equip = getGameEquip();

        UI_HD.drawPanel(ctx, x, y, w, h, { title: 'CHARACTER' });

        // Name + level
        ctx.fillStyle = UI_HD.C.textBright;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(stats.name, x + w / 2, y + 22);
        ctx.fillStyle = UI_HD.C.gold;
        ctx.font = '11px monospace';
        ctx.fillText(`Level ${stats.level}`, x + w / 2, y + 35);
        ctx.textAlign = 'left';

        // HP / MP bars
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '9px monospace';
        ctx.fillText('HP', x + 10, y + 52);
        UI_HD.drawBar(ctx, x + 26, y + 40, w - 36, 15, stats.hp, stats.maxHp, 'health');

        ctx.fillText('MP', x + 10, y + 72);
        UI_HD.drawBar(ctx, x + 26, y + 60, w - 36, 15, stats.mp, stats.maxMp, 'mana');

        ctx.fillText('XP', x + 10, y + 92);
        UI_HD.drawBar(ctx, x + 26, y + 80, w - 36, 15, stats.xp, stats.xpNext, 'xp');

        UI_HD.drawSeparator(ctx, x + 8, y + 100, w - 16);

        // Equipment slots
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '10px monospace';
        ctx.fillText('EQUIPMENT', x + 10, y + 114);

        const slotH  = 22;
        const slotW  = w - 20;
        for (let i = 0; i < EQUIP_SLOTS.length; i++) {
            const slot = EQUIP_SLOTS[i];
            const sy   = y + 120 + i * slotH;
            const item = equip[slot.key];

            // Slot box
            ctx.fillStyle = item ? 'rgba(40,30,12,0.7)' : 'rgba(14,12,22,0.7)';
            ctx.fillRect(x + 10, sy, slotW, slotH - 2);
            ctx.strokeStyle = item ? UI_HD.C.borderGold : UI_HD.C.border;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 10, sy, slotW, slotH - 2);

            // Slot label
            ctx.fillStyle = UI_HD.C.textDim;
            ctx.font = '9px monospace';
            ctx.fillText(slot.label, x + 14, sy + 12);

            // Item name
            if (item) {
                ctx.fillStyle = UI_HD.C.gold;
                ctx.font = '9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText(item.name || item, x + 10 + slotW - 4, sy + 12);
                ctx.textAlign = 'left';
            } else {
                ctx.fillStyle = 'rgba(80,70,50,0.5)';
                ctx.font = '9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('—', x + 10 + slotW - 4, sy + 12);
                ctx.textAlign = 'left';
            }
        }

        // Gold display
        const goldY = y + h - 22;
        ctx.fillStyle = 'rgba(40,30,8,0.7)';
        ctx.fillRect(x + 8, goldY, w - 16, 18);
        ctx.strokeStyle = UI_HD.C.borderGold;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 8, goldY, w - 16, 18);
        ctx.fillStyle = UI_HD.C.gold;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Gold: ${stats.gold}`, x + w / 2, goldY + 13);
        ctx.textAlign = 'left';
    }

    // ── CENTER: ITEM GRID ─────────────────────────────────────
    function renderCenterPanel(ctx, x, y, w, h) {
        UI_HD.drawPanel(ctx, x, y, w, h, { title: 'INVENTORY' });

        const items    = getGameItems();
        const cols     = 5;
        const rows     = 4;
        const slotSize = 44;
        const gapX     = (w - cols * slotSize - 16) / (cols - 1) | 0;
        const gapY     = 4;
        const gridX    = x + 10;
        const gridY    = y + 18;

        const pageStart = page * ITEMS_PER_PAGE;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const idx  = pageStart + row * cols + col;
                const item = items[idx] || null;
                const sx   = gridX + col * (slotSize + gapX);
                const sy   = gridY + row * (slotSize + gapY);
                const sel  = (activeTab === 'items' && selectedSlot === row * cols + col);

                UI_HD.drawSlot(ctx, sx, sy, slotSize, item, sel, item ? null : '');
            }
        }

        // Pagination indicator
        const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
        if (totalPages > 1) {
            ctx.fillStyle = UI_HD.C.textDim;
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`Page ${page + 1}/${totalPages}`, x + w / 2, y + h - 8);
            ctx.textAlign = 'left';
        }

        // Instructions
        ctx.fillStyle = UI_HD.C.textDim;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ZQSD: Navigate   E: Use/Equip   I/Esc: Close', x + w / 2, y + h - 8);
        ctx.textAlign = 'left';
    }

    // ── RIGHT: ITEM DETAILS + STATS ───────────────────────────
    function renderRightPanel(ctx, x, y, w, h) {
        const items = getGameItems();
        const stats = getGameStats();
        const idx   = page * ITEMS_PER_PAGE + selectedSlot;
        const item  = items[idx] || null;

        UI_HD.drawPanel(ctx, x, y, w, h, { title: 'DETAILS' });

        if (item) {
            // Item sprite preview (if available)
            const spriteMap = {
                potion:      'potion_health', potion_mana: 'potion_mana',
                weapon:      'sword',         misc:        'key',
            };
            const spName = item.id || spriteMap[item.type] || null;
            const previewSize = 48;
            const px2 = x + (w - previewSize) / 2 | 0;
            const py2 = y + 16;

            if (spName && typeof SPRITES_48 !== 'undefined' && SPRITES_48.has(spName)) {
                // Slot background
                ctx.fillStyle = 'rgba(20,16,30,0.8)';
                ctx.fillRect(px2 - 4, py2 - 4, previewSize + 8, previewSize + 8);
                ctx.strokeStyle = UI_HD.C.borderGold;
                ctx.lineWidth = 1;
                ctx.strokeRect(px2 - 4, py2 - 4, previewSize + 8, previewSize + 8);
                SPRITES_48.draw(spName, ctx, px2, py2, 0);
            } else {
                // Color block fallback
                const typeColors = {
                    weapon:'#6080a0', armor:'#506070', potion:'#a03040',
                    potion_mana:'#3060c0', misc:'#806040'
                };
                ctx.fillStyle = typeColors[item.type] || '#604030';
                ctx.fillRect(px2, py2, previewSize, previewSize);
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(px2, py2, previewSize, previewSize / 3);
            }

            const iy = py2 + previewSize + 12;

            // Name
            ctx.fillStyle = UI_HD.C.textBright;
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            // Word-wrap name
            const nameWords = (item.name || '').split(' ');
            let nameLine = '', nameY = iy;
            for (const word of nameWords) {
                const test = nameLine + word + ' ';
                if (ctx.measureText(test).width > w - 16) {
                    ctx.fillText(nameLine.trim(), x + w / 2, nameY);
                    nameLine = word + ' ';
                    nameY += 15;
                } else {
                    nameLine = test;
                }
            }
            if (nameLine.trim()) ctx.fillText(nameLine.trim(), x + w / 2, nameY);
            ctx.textAlign = 'left';

            // Type badge
            ctx.fillStyle = 'rgba(40,30,10,0.7)';
            ctx.fillRect(x + 10, nameY + 6, w - 20, 14);
            ctx.fillStyle = UI_HD.C.gold;
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText((item.type || 'Item').toUpperCase(), x + w / 2, nameY + 17);
            ctx.textAlign = 'left';

            UI_HD.drawSeparator(ctx, x + 8, nameY + 24, w - 16);

            // Description
            if (item.desc) {
                ctx.fillStyle = UI_HD.C.text;
                ctx.font = '10px monospace';
                const words = item.desc.split(' ');
                let line = '', lineY = nameY + 38;
                for (const word of words) {
                    const test = line + word + ' ';
                    if (ctx.measureText(test).width > w - 20) {
                        ctx.fillText(line.trim(), x + 10, lineY);
                        line = word + ' ';
                        lineY += 13;
                    } else {
                        line = test;
                    }
                }
                if (line.trim()) ctx.fillText(line.trim(), x + 10, lineY);
            }

            // Stats (atk, def, etc.)
            const statKeys = ['atk','def','hp','mp','effect'];
            let statY = nameY + 80;
            for (const key of statKeys) {
                if (item[key]) {
                    UI_HD.drawStat(ctx, x + 10, statY, key.toUpperCase(), item[key], UI_HD.C.gold);
                    statY += 14;
                }
            }

            // Quantity
            if (item.qty > 1) {
                ctx.fillStyle = UI_HD.C.textDim;
                ctx.font = '10px monospace';
                ctx.fillText(`Qty: ${item.qty}`, x + 10, statY + 8);
            }

            // Use button
            UI_HD.drawButton(ctx, x + 10, y + h - 52, w - 20, 20, 'Use / Equip', true);
            UI_HD.drawButton(ctx, x + 10, y + h - 28, w - 20, 20, 'Drop', false);

        } else {
            // No item selected — show quick stats
            const stats2 = getGameStats();
            const sy2 = y + 20;
            ctx.fillStyle = UI_HD.C.textDim;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('STATS', x + w / 2, sy2);
            ctx.textAlign = 'left';

            UI_HD.drawSeparator(ctx, x + 8, sy2 + 6, w - 16);

            const ss = x + 10;
            UI_HD.drawStat(ctx, ss, sy2 + 22,  'ATK',   stats2.atk, UI_HD.C.gold);
            UI_HD.drawStat(ctx, ss, sy2 + 36,  'DEF',   stats2.def);
            UI_HD.drawStat(ctx, ss, sy2 + 50,  'LVL',   stats2.level, UI_HD.C.gold);
            UI_HD.drawStat(ctx, ss, sy2 + 64,  'HP',    `${stats2.hp}/${stats2.maxHp}`, UI_HD.C.health);
            UI_HD.drawStat(ctx, ss, sy2 + 78,  'MP',    `${stats2.mp}/${stats2.maxMp}`, UI_HD.C.mana);
            UI_HD.drawStat(ctx, ss, sy2 + 92,  'XP',    `${stats2.xp}/${stats2.xpNext}`, UI_HD.C.xp);
            UI_HD.drawStat(ctx, ss, sy2 + 106, 'Gold',  stats2.gold, UI_HD.C.gold);

            ctx.fillStyle = UI_HD.C.textDim;
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Select an item', x + w / 2, y + h / 2 + 20);
            ctx.textAlign = 'left';
        }
    }

    // ── INPUT HANDLER ─────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (!open) return;

        const items    = getGameItems();
        const total    = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE).length;
        const maxSlots = ITEMS_PER_PAGE;
        const cols     = 5;

        switch (e.code) {
            case 'KeyI': case 'Escape': close(); e.preventDefault(); break;
            case 'KeyZ': case 'ArrowUp':
                selectedSlot = Math.max(0, selectedSlot - cols);
                e.preventDefault(); break;
            case 'KeyS': case 'ArrowDown':
                selectedSlot = Math.min(maxSlots - 1, selectedSlot + cols);
                e.preventDefault(); break;
            case 'KeyQ': case 'ArrowLeft':
                if (selectedSlot % cols === 0 && page > 0) { page--; selectedSlot = Math.min(selectedSlot, 4); }
                else selectedSlot = Math.max(0, selectedSlot - 1);
                e.preventDefault(); break;
            case 'KeyD': case 'ArrowRight': {
                const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
                if (selectedSlot % cols === cols - 1 && page < totalPages - 1) { page++; selectedSlot -= 4; }
                else selectedSlot = Math.min(maxSlots - 1, selectedSlot + 1);
                e.preventDefault(); break;
            }
            case 'KeyE': case 'Space':
                useSelectedItem();
                e.preventDefault(); break;
        }
    });

    function useSelectedItem() {
        const items = getGameItems();
        const idx   = page * ITEMS_PER_PAGE + selectedSlot;
        const item  = items[idx];
        if (!item) return;

        if (item.type === 'potion' || item.effect === 'hp+30') {
            if (typeof P !== 'undefined') {
                const heal = 30;
                P.hp = Math.min((P.maxHP || P.maxHp || 100), (P.hp || 0) + heal);
            }
            if (item.qty > 1) item.qty--;
            else items.splice(idx, 1);
            console.log('[Inventory] Used', item.name);
        } else if (item.type === 'potion_mana' || item.effect === 'mp+20') {
            if (typeof P !== 'undefined') {
                P.mp = Math.min((P.maxMP || P.maxMp || 60), (P.mp || 0) + 20);
            }
            if (item.qty > 1) item.qty--;
            else items.splice(idx, 1);
        }
    }

    // ── INIT ──────────────────────────────────────────────────
    function init() {
        const container = document.getElementById('canvas-container');
        if (container) {
            createOverlay();
        } else {
            let tries = 0;
            const wait = setInterval(() => {
                if (document.getElementById('canvas-container') || ++tries > 40) {
                    clearInterval(wait);
                    createOverlay();
                }
            }, 100);
        }

        // Hook I key (only in canvas mode, not when in input/textarea)
        document.addEventListener('keydown', (e) => {
            if (e.code !== 'KeyI') return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (typeof Engine === 'undefined' || !Engine.isCanvasMode()) return;
            toggle();
            e.preventDefault();
        });

        console.log('[InventoryCanvas] Ready — press I in canvas mode to open');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function addItem(itemOrId) {
        const inv = typeof P !== 'undefined' ? (P.inv || P.items) : null;
        if (!inv) return;
        if (typeof itemOrId === 'string') {
            inv.push({ id: itemOrId, name: itemOrId, qty: 1, type: 'misc' });
        } else {
            const existing = inv.find(i => i.id === itemOrId.id);
            if (existing) { existing.qty = (existing.qty || 1) + (itemOrId.qty || 1); }
            else inv.push({ ...itemOrId });
        }
        console.log('[InventoryCanvas] Item added:', typeof itemOrId === 'string' ? itemOrId : itemOrId.id);
    }

    function update(_dt) { /* state managed by own RAF loop */ }

    return { toggle, close, addItem, update, isOpen: () => open, isActive: () => open };
})();
