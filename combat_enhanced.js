/*************************************************************
 * combat_enhanced.js — Enhanced Combat Renderer
 * Replaces CombatCanvas.render with detailed pixel art visuals
 * Load AFTER: combat_canvas.js, combat_canvas_integration.js
 *************************************************************/

(function () {
    'use strict';

    if (typeof CombatCanvas === 'undefined') {
        console.warn('[CombatEnhanced] CombatCanvas not found');
        return;
    }

    // ─────────────────────────────────────────────────
    //  LAYOUT  (320 × 240 internal canvas)
    // ─────────────────────────────────────────────────
    const W = 320, H = 240;
    const ARENA_BOT = 160;
    const UI_Y      = ARENA_BOT;

    const PLAYER_X = 70,  PLAYER_Y = 118;   // player back-view centre
    const ENEMY_X  = 218, ENEMY_Y  = 92;    // enemy figure centre

    // ─────────────────────────────────────────────────
    //  PALETTE
    // ─────────────────────────────────────────────────
    const C = {
        bg:          '#0d0b12',
        floor:       '#1c1a26',
        uiBg:        'rgba(10,9,18,0.92)',
        uiBorder:    '#36334e',
        uiActive:    '#4e4a6a',
        text:        '#bab6cc',
        textDim:     '#686476',
        textBright:  '#eae6f8',
        textGold:    '#d6bc48',
        textRed:     '#cc4444',
        hpGreen:     '#3ea84a',
        hpYellow:    '#c8a030',
        hpRed:       '#b83030',
        hpEnemy:     '#a03030',
        hpBg:        '#18182a',
        hpBorder:    '#383656',
        shadow:      'rgba(0,0,0,0.55)',
    };

    // ─────────────────────────────────────────────────
    //  LOCAL STATE
    // ─────────────────────────────────────────────────
    let _pulse     = 0;
    let _prevMsg   = '';
    let _log       = [];   // { text, color }
    let _flashT    = 0;
    let _flashClr  = 'rgba(180,40,40,0.22)';

    // Intercept start to reset log
    const _origStart = CombatCanvas.start;
    CombatCanvas.start = function (enemyData) {
        _origStart.call(this, enemyData);
        _log = [];
        _flashT = 0;
        _pulse = 0;
        _prevMsg = '';
        pushLog('Combat begins!', C.textGold);
    };

    function pushLog(msg, color) {
        _log.push({ text: msg, color: color || C.text });
        if (_log.length > 5) _log.shift();
    }

    // ─────────────────────────────────────────────────
    //  PATCH render
    // ─────────────────────────────────────────────────
    CombatCanvas.render = function (ctx) {
        if (!CombatCanvas.isActive()) return;
        const S = CombatCanvas.getState();
        if (!S || !S.player || !S.enemy) return;

        // Advance timers (≈ 60 fps)
        const dt = 1 / 60;
        _pulse = (_pulse + dt * 4) % (Math.PI * 2);
        if (_flashT > 0) _flashT -= dt;

        // Collect new messages
        if (S.message && S.messageTimer > 1.6 && S.message !== _prevMsg) {
            _prevMsg = S.message;
            const col = /destroy|death|MISS|dead/i.test(S.message) ? C.textRed
                      : /hit|attack|damage/i.test(S.message)       ? C.text
                      : C.textGold;
            pushLog(S.message, col);
        }

        drawBG(ctx, S);
        drawCombatants(ctx, S);
        drawLimbOverlay(ctx, S);
        if (_flashT > 0) { ctx.fillStyle = _flashClr; ctx.fillRect(0, 0, W, H); }
        drawUI(ctx, S);
    };

    // ─────────────────────────────────────────────────
    //  BACKGROUND
    // ─────────────────────────────────────────────────
    function drawBG(ctx, S) {
        ctx.fillStyle = C.bg;
        ctx.fillRect(0, 0, W, ARENA_BOT);

        // Atmospheric glow behind enemy
        const grd = ctx.createRadialGradient(ENEMY_X, ENEMY_Y, 8, ENEMY_X, ENEMY_Y, 80);
        grd.addColorStop(0, 'rgba(80,30,80,0.16)');
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, ARENA_BOT);

        // Stone floor strip
        ctx.fillStyle = C.floor;
        ctx.fillRect(0, 136, W, ARENA_BOT - 136);
        ctx.strokeStyle = 'rgba(25,22,38,0.8)';
        ctx.lineWidth = 1;
        for (let fx = 48; fx < W; fx += 48) {
            ctx.beginPath(); ctx.moveTo(fx, 136); ctx.lineTo(fx, ARENA_BOT); ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(0, 145); ctx.lineTo(W, 145); ctx.stroke();
        ctx.lineWidth = 1;

        // UI strip
        ctx.fillStyle = C.uiBg;
        ctx.fillRect(0, UI_Y, W, H - UI_Y);
        ctx.strokeStyle = C.uiBorder;
        ctx.strokeRect(0, UI_Y, W, H - UI_Y);

        // Thin divider line above UI
        ctx.strokeStyle = 'rgba(80,70,120,0.5)';
        ctx.beginPath(); ctx.moveTo(0, UI_Y); ctx.lineTo(W, UI_Y); ctx.stroke();
    }

    // ─────────────────────────────────────────────────
    //  COMBATANTS
    // ─────────────────────────────────────────────────
    function drawCombatants(ctx, S) {
        drawPlayerBack(ctx, PLAYER_X, PLAYER_Y, S.player);
        const sp = (S.enemy.sprite || '').toLowerCase();
        if (sp.includes('wolf'))                         drawWolf(ctx, ENEMY_X, ENEMY_Y, S.enemy);
        else if (sp.includes('spirit') || sp.includes('shade') || sp.includes('cinder_sp')) drawSpirit(ctx, ENEMY_X, ENEMY_Y, S.enemy);
        else if (sp.includes('undead'))                  drawUndead(ctx, ENEMY_X, ENEMY_Y, S.enemy);
        else if (sp.includes('boss') || S.enemy.boss)   drawBoss(ctx, ENEMY_X, ENEMY_Y, S.enemy);
        else                                             drawHumanoid(ctx, ENEMY_X, ENEMY_Y, S.enemy);
    }

    function drawPlayerBack(ctx, cx, cy, pl) {
        // Shadow
        ctx.fillStyle = C.shadow;
        ctx.beginPath(); ctx.ellipse(cx, cy + 22, 14, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Cloak body
        ctx.fillStyle = '#3d2e1a';
        ctx.fillRect(cx - 13, cy - 14, 26, 32);
        // Cloak bottom
        ctx.fillStyle = '#2d2010';
        ctx.fillRect(cx - 11, cy + 16, 22, 8);
        // Leg gap
        ctx.fillStyle = '#1a1008';
        ctx.fillRect(cx - 1, cy + 18, 2, 8);
        // Shoulder highlights
        ctx.fillStyle = '#5a4830';
        ctx.fillRect(cx - 12, cy - 12, 3, 20);
        ctx.fillRect(cx + 9,  cy - 12, 3, 20);
        // Hood
        ctx.fillStyle = '#2d2010';
        ctx.fillRect(cx - 9, cy - 26, 18, 14);
        ctx.fillStyle = '#1a1008';
        ctx.fillRect(cx - 7, cy - 24, 14, 12);

        // Low HP red tint
        if (pl.hp / pl.maxHp < 0.3) {
            ctx.fillStyle = 'rgba(180,30,30,0.28)';
            ctx.fillRect(cx - 16, cy - 30, 32, 58);
        }
    }

    function nameTag(ctx, cx, y, name, gold) {
        ctx.font = gold ? 'bold 9px monospace' : '8px monospace';
        const tw = ctx.measureText(name).width;
        ctx.fillStyle = 'rgba(8,6,18,0.78)';
        ctx.fillRect(cx - tw / 2 - 3, y - 10, tw + 6, 11);
        ctx.fillStyle = gold ? C.textGold : C.text;
        ctx.textAlign = 'center';
        ctx.fillText(name, cx, y);
        ctx.textAlign = 'left';
    }

    function drawHumanoid(ctx, cx, cy, e) {
        // Shadow
        ctx.fillStyle = C.shadow;
        ctx.beginPath(); ctx.ellipse(cx, cy + 30, 18, 5, 0, 0, Math.PI * 2); ctx.fill();

        const live = e.hp > 0;
        const base  = live ? '#5c3030' : '#2a1a20';
        const armor = live ? '#4a3a4a' : '#252025';
        const skin  = live ? '#3a2020' : '#1e1818';

        // Legs
        ctx.fillStyle = armor;
        ctx.fillRect(cx - 10, cy + 14, 8, 18); ctx.fillRect(cx + 2, cy + 14, 8, 18);
        ctx.fillStyle = '#1a1010';
        ctx.fillRect(cx - 12, cy + 28, 10, 4); ctx.fillRect(cx + 2, cy + 28, 10, 4);

        // Arms (drawn before body so body overlaps)
        ctx.fillStyle = armor;
        ctx.fillRect(cx - 22, cy - 14, 8, 24); ctx.fillRect(cx + 14, cy - 14, 8, 24);
        ctx.fillStyle = skin;
        ctx.fillRect(cx - 22, cy + 8, 8, 6);  ctx.fillRect(cx + 14, cy + 8, 8, 6);

        // Torso
        ctx.fillStyle = base;  ctx.fillRect(cx - 14, cy - 14, 28, 30);
        ctx.fillStyle = armor; ctx.fillRect(cx - 10, cy - 10, 20, 20);
        ctx.fillStyle = '#2a1a10'; ctx.fillRect(cx - 12, cy + 12, 24, 4); // belt

        // Neck + head
        ctx.fillStyle = skin; ctx.fillRect(cx - 5, cy - 20, 10, 8);
        ctx.fillStyle = skin; ctx.fillRect(cx - 10, cy - 34, 20, 18);
        ctx.fillStyle = '#2a2035'; ctx.fillRect(cx - 10, cy - 38, 20, 8); // hood

        // Eyes
        ctx.fillStyle = '#cc3030';
        ctx.fillRect(cx - 7, cy - 28, 3, 3); ctx.fillRect(cx + 4, cy - 28, 3, 3);
        ctx.fillStyle = 'rgba(200,40,40,0.35)';
        ctx.fillRect(cx - 9, cy - 30, 7, 7); ctx.fillRect(cx + 2, cy - 30, 7, 7);

        // Sword
        ctx.fillStyle = '#999';
        ctx.fillRect(cx + 20, cy - 20, 3, 34);
        ctx.fillStyle = '#aaa'; ctx.fillRect(cx + 15, cy - 16, 13, 2);
        ctx.fillStyle = '#604020'; ctx.fillRect(cx + 20, cy + 14, 3, 8);

        nameTag(ctx, cx, cy - 46, e.name);
    }

    function drawWolf(ctx, cx, cy, e) {
        ctx.fillStyle = C.shadow;
        ctx.beginPath(); ctx.ellipse(cx, cy + 24, 26, 6, 0, 0, Math.PI * 2); ctx.fill();

        const fur  = (e.sprite || '').includes('ash') ? '#4a4856' : '#5a4a3a';
        const dark = (e.sprite || '').includes('ash') ? '#2a2834' : '#3a3028';

        // Tail
        ctx.fillStyle = fur;  ctx.fillRect(cx - 36, cy - 10, 14, 10);
        ctx.fillStyle = dark; ctx.fillRect(cx - 40, cy - 16, 8, 12);

        // Body
        ctx.fillStyle = fur; ctx.fillRect(cx - 26, cy - 6, 46, 22);

        // Legs
        ctx.fillStyle = dark;
        ctx.fillRect(cx - 22, cy + 16, 8, 12); ctx.fillRect(cx - 14, cy + 22, 10, 6);
        ctx.fillRect(cx + 10, cy + 16, 8, 12); ctx.fillRect(cx + 14, cy + 22, 10, 6);

        // Neck + head
        ctx.fillStyle = fur; ctx.fillRect(cx + 14, cy - 14, 16, 18);
        ctx.fillStyle = fur; ctx.fillRect(cx + 22, cy - 24, 22, 20);

        // Ears
        ctx.fillStyle = dark; ctx.fillRect(cx + 24, cy - 32, 5, 12); ctx.fillRect(cx + 34, cy - 30, 5, 10);

        // Snout
        ctx.fillStyle = dark; ctx.fillRect(cx + 38, cy - 16, 8, 8);

        // Eyes
        ctx.fillStyle = '#ffaa00'; ctx.fillRect(cx + 26, cy - 20, 4, 4); ctx.fillRect(cx + 34, cy - 20, 4, 4);
        ctx.fillStyle = 'rgba(255,160,0,0.45)';
        ctx.fillRect(cx + 23, cy - 23, 9, 9); ctx.fillRect(cx + 31, cy - 23, 9, 9);

        // Teeth
        ctx.fillStyle = '#ddd'; ctx.fillRect(cx + 38, cy - 9, 2, 4); ctx.fillRect(cx + 42, cy - 9, 2, 4);

        nameTag(ctx, cx, cy - 42, e.name);
    }

    function drawSpirit(ctx, cx, cy, e) {
        const bob = Math.sin(_pulse * 0.7) * 3;

        // Outer glow
        ctx.fillStyle = 'rgba(100,60,180,0.12)';
        ctx.beginPath(); ctx.ellipse(cx, cy + bob, 38, 52, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(100,60,180,0.10)';
        ctx.beginPath(); ctx.ellipse(cx, cy + bob, 26, 38, 0, 0, Math.PI * 2); ctx.fill();

        // Wispy tendrils
        ctx.fillStyle = 'rgba(80,40,160,0.4)';
        ctx.fillRect(cx - 6,  cy + 18 + bob, 4, 22);
        ctx.fillRect(cx + 2,  cy + 22 + bob, 4, 18);
        ctx.fillRect(cx - 16, cy + 12 + bob, 4, 16);
        ctx.fillRect(cx + 12, cy + 12 + bob, 4, 20);

        // Body
        ctx.fillStyle = '#3a2060'; ctx.fillRect(cx - 20, cy - 22 + bob, 40, 44);
        ctx.fillStyle = 'rgba(80,50,140,0.7)'; ctx.fillRect(cx - 14, cy - 16 + bob, 28, 36);

        // Void face
        ctx.fillStyle = '#0a0012'; ctx.fillRect(cx - 14, cy - 20 + bob, 28, 22);

        // Eyes
        ctx.fillStyle = '#cc99ff'; ctx.fillRect(cx - 8, cy - 16 + bob, 5, 5); ctx.fillRect(cx + 3, cy - 16 + bob, 5, 5);
        ctx.fillStyle = 'rgba(180,140,255,0.55)';
        ctx.fillRect(cx - 12, cy - 20 + bob, 13, 13); ctx.fillRect(cx - 1, cy - 20 + bob, 13, 13);

        // Floating motes
        const mx1 = cx + Math.sin(_pulse) * 22;
        const my1 = cy - 10 + Math.cos(_pulse * 1.3) * 14 + bob;
        ctx.fillStyle = 'rgba(140,100,220,0.65)'; ctx.fillRect(mx1, my1, 3, 3);
        const mx2 = cx + Math.sin(_pulse + 2) * 26;
        const my2 = cy + 6 + Math.cos(_pulse * 0.9 + 1) * 10 + bob;
        ctx.fillRect(mx2, my2, 2, 2);

        nameTag(ctx, cx, cy - 42 + bob, e.name);
    }

    function drawUndead(ctx, cx, cy, e) {
        ctx.fillStyle = C.shadow;
        ctx.beginPath(); ctx.ellipse(cx, cy + 30, 16, 5, 0, 0, Math.PI * 2); ctx.fill();

        // Robe
        ctx.fillStyle = '#2a2830'; ctx.fillRect(cx - 14, cy - 10, 28, 40);
        ctx.fillStyle = '#1e1c24'; ctx.fillRect(cx - 10, cy + 6, 20, 28);

        // Bony arms
        ctx.fillStyle = '#9a9a80';
        ctx.fillRect(cx - 24, cy - 8, 6, 24); ctx.fillRect(cx + 18, cy - 8, 6, 24);
        ctx.fillStyle = '#b0b098';
        ctx.fillRect(cx - 26, cy + 14, 8, 6); ctx.fillRect(cx + 18, cy + 14, 8, 6);
        ctx.fillStyle = '#c0c0a0';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(cx - 26 + i * 2, cy + 20, 1, 4);
            ctx.fillRect(cx + 18 + i * 2, cy + 20, 1, 4);
        }

        // Neck + skull
        ctx.fillStyle = '#7a7a60'; ctx.fillRect(cx - 5, cy - 18, 10, 10);
        ctx.fillStyle = '#9a9a7a'; ctx.fillRect(cx - 12, cy - 36, 24, 20);
        ctx.fillStyle = '#8a8a6a'; ctx.fillRect(cx - 10, cy - 18, 20, 6);

        // Eye sockets + glow
        ctx.fillStyle = '#0a0a14'; ctx.fillRect(cx - 9, cy - 32, 6, 7); ctx.fillRect(cx + 3, cy - 32, 6, 7);
        ctx.fillStyle = 'rgba(50,200,80,0.85)'; ctx.fillRect(cx - 8, cy - 31, 4, 5); ctx.fillRect(cx + 4, cy - 31, 4, 5);

        // Teeth
        ctx.fillStyle = '#c0c0a0';
        for (let i = 0; i < 4; i++) ctx.fillRect(cx - 8 + i * 4, cy - 14, 2, 4);

        // Hood
        ctx.fillStyle = '#1a1820';
        ctx.fillRect(cx - 14, cy - 42, 28, 16);
        ctx.fillRect(cx - 10, cy - 28, 6, 8); ctx.fillRect(cx + 4, cy - 28, 6, 8);

        nameTag(ctx, cx, cy - 52, e.name);
    }

    function drawBoss(ctx, cx, cy, e) {
        const bob = Math.sin(_pulse * 0.5) * 2;

        // Aura
        ctx.fillStyle = 'rgba(140,20,20,0.14)';
        ctx.beginPath(); ctx.ellipse(cx, cy + bob, 58, 70, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = C.shadow;
        ctx.beginPath(); ctx.ellipse(cx, cy + 38, 30, 8, 0, 0, Math.PI * 2); ctx.fill();

        // Legs
        ctx.fillStyle = '#303040';
        ctx.fillRect(cx - 16, cy + 20 + bob, 13, 22); ctx.fillRect(cx + 3, cy + 20 + bob, 13, 22);
        ctx.fillStyle = '#1a1a28';
        ctx.fillRect(cx - 18, cy + 36 + bob, 15, 6); ctx.fillRect(cx + 3, cy + 36 + bob, 15, 6);

        // Arms
        ctx.fillStyle = '#404050';
        ctx.fillRect(cx - 32, cy - 20 + bob, 13, 34); ctx.fillRect(cx + 19, cy - 20 + bob, 13, 34);
        // Claws
        ctx.fillStyle = '#909098';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(cx - 32 + i * 4, cy + 12 + bob, 3, 9);
            ctx.fillRect(cx + 19 + i * 4, cy + 12 + bob, 3, 9);
        }

        // Torso
        ctx.fillStyle = '#2a2838'; ctx.fillRect(cx - 20, cy - 24 + bob, 40, 46);
        ctx.fillStyle = '#3a3850'; ctx.fillRect(cx - 14, cy - 18 + bob, 28, 30);
        ctx.fillStyle = '#4a4860';
        ctx.fillRect(cx - 12, cy - 16 + bob, 12, 16); ctx.fillRect(cx, cy - 16 + bob, 12, 16);

        // Head + horns
        ctx.fillStyle = '#505060'; ctx.fillRect(cx - 20, cy - 56 + bob, 6, 18); ctx.fillRect(cx + 14, cy - 56 + bob, 6, 18);
        ctx.fillStyle = '#1a1824'; ctx.fillRect(cx - 18, cy - 44 + bob, 36, 26);
        ctx.fillStyle = '#0e0c18'; ctx.fillRect(cx - 14, cy - 40 + bob, 28, 18);

        // Eyes
        ctx.fillStyle = '#ff4020'; ctx.fillRect(cx - 10, cy - 36 + bob, 7, 7); ctx.fillRect(cx + 3, cy - 36 + bob, 7, 7);
        ctx.fillStyle = 'rgba(255,60,20,0.5)';
        ctx.fillRect(cx - 14, cy - 40 + bob, 15, 15); ctx.fillRect(cx - 1, cy - 40 + bob, 15, 15);
        ctx.fillStyle = '#3a1010'; ctx.fillRect(cx - 9, cy - 26 + bob, 18, 4);

        nameTag(ctx, cx, cy - 66 + bob, e.name, true);
    }

    // ─────────────────────────────────────────────────
    //  LIMB TARGETING OVERLAY
    // ─────────────────────────────────────────────────
    const ZONES = {
        HEAD:      { dx:  0,   dy: -36, w: 22, h: 20 },
        TORSO:     { dx:  0,   dy:  -4, w: 30, h: 28 },
        LEFT_ARM:  { dx: -22,  dy:  -8, w: 10, h: 22 },
        RIGHT_ARM: { dx:  22,  dy:  -8, w: 10, h: 22 },
        LEGS:      { dx:  0,   dy:  20, w: 24, h: 20 },
    };
    const ZONES_WOLF = {
        HEAD:      { dx:  28,  dy: -18, w: 24, h: 22 },
        TORSO:     { dx:  -2,  dy:  -2, w: 32, h: 22 },
        LEFT_ARM:  { dx: -10,  dy:  16, w: 12, h: 16 },
        RIGHT_ARM: { dx:  14,  dy:  16, w: 12, h: 16 },
        LEGS:      { dx: -30,  dy:  -8, w: 12, h: 16 },
    };

    function drawLimbOverlay(ctx, S) {
        if (S.phase !== 'target') return;

        const sp = (S.enemy.sprite || '').toLowerCase();
        const zones = sp.includes('wolf') ? ZONES_WOLF : ZONES;
        const pulse = (Math.sin(_pulse * 3) + 1) / 2;

        for (let i = 0; i < S.limbOrder.length; i++) {
            const key  = S.limbOrder[i];
            const zone = zones[key];
            if (!zone) continue;
            const ls   = S.enemy.limbs[key];
            const sel  = i === S.limbIndex;
            const dead = ls.hp <= 0;
            const lx   = ENEMY_X + zone.dx - zone.w / 2;
            const ly   = ENEMY_Y + zone.dy - zone.h / 2;

            if (dead) {
                ctx.fillStyle = 'rgba(30,10,10,0.65)'; ctx.fillRect(lx, ly, zone.w, zone.h);
                ctx.strokeStyle = '#551010'; ctx.lineWidth = 1; ctx.strokeRect(lx, ly, zone.w, zone.h);
                ctx.strokeStyle = '#771010';
                ctx.beginPath();
                ctx.moveTo(lx + 2, ly + 2); ctx.lineTo(lx + zone.w - 2, ly + zone.h - 2);
                ctx.moveTo(lx + zone.w - 2, ly + 2); ctx.lineTo(lx + 2, ly + zone.h - 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = sel
                    ? `rgba(200,50,50,${0.30 + pulse * 0.25})`
                    : 'rgba(200,180,60,0.10)';
                ctx.fillRect(lx, ly, zone.w, zone.h);

                ctx.strokeStyle = sel
                    ? `rgba(255,90,90,${0.65 + pulse * 0.35})`
                    : 'rgba(180,160,60,0.35)';
                ctx.lineWidth = sel ? 2 : 1;
                ctx.strokeRect(lx, ly, zone.w, zone.h);

                // Mini HP bar inside zone
                const frac = ls.hp / ls.maxHp;
                ctx.fillStyle = frac > 0.5 ? 'rgba(60,180,60,0.55)' : 'rgba(180,60,60,0.55)';
                ctx.fillRect(lx + 1, ly + zone.h - 4, Math.round((zone.w - 2) * frac), 3);

                // Label
                ctx.font = '6px monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = sel ? '#ffaaaa' : '#888';
                ctx.fillText(S.limbs[key].name, ENEMY_X + zone.dx, ly - 1);
            }
        }

        ctx.textAlign = 'left';
        ctx.lineWidth = 1;

        // Instruction hint
        ctx.fillStyle = 'rgba(8,6,18,0.78)';
        ctx.fillRect(90, 147, 140, 11);
        ctx.fillStyle = C.textGold;
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Z/S:choose   E:confirm   Esc:back', 160, 155);
        ctx.textAlign = 'left';
    }

    // ─────────────────────────────────────────────────
    //  UI STRIP  (y = 160 – 240)
    // ─────────────────────────────────────────────────
    function drawUI(ctx, S) {
        drawMenu(ctx, S);
        drawHPSection(ctx, S);
        drawLog(ctx, S);
    }

    // ── Action menu (left, 96 × 78) ──
    function drawMenu(ctx, S) {
        const mx = 3, my = UI_Y + 3, mw = 92, mh = 74;

        ctx.fillStyle = C.uiBg; ctx.fillRect(mx, my, mw, mh);
        ctx.strokeStyle = C.uiBorder; ctx.strokeRect(mx, my, mw, mh);

        const turnClr = S.turn === 'player' ? '#88cc88' : '#cc8888';
        ctx.fillStyle = turnClr;
        ctx.font = '7px monospace';
        ctx.fillText(S.turn === 'player' ? '▶ YOUR TURN' : '▶ ENEMY TURN', mx + 4, my + 9);

        ctx.strokeStyle = C.uiBorder;
        ctx.beginPath(); ctx.moveTo(mx + 2, my + 12); ctx.lineTo(mx + mw - 2, my + 12); ctx.stroke();

        if (S.phase === 'select' || S.phase === 'target') {
            ctx.font = '8px monospace';
            for (let i = 0; i < S.actions.length; i++) {
                const act = S.actions[i];
                const sel = S.phase === 'select' && i === S.menuIndex;
                const iy  = my + 25 + i * 13;
                if (sel) { ctx.fillStyle = C.uiActive; ctx.fillRect(mx + 2, iy - 9, mw - 4, 12); }
                ctx.fillStyle = sel ? C.textBright : C.text;
                ctx.fillText((sel ? '▸ ' : '  ') + act.name, mx + 4, iy);
            }

            // Target phase — show selected limb + hit%
            if (S.phase === 'target') {
                const lk  = S.limbOrder[S.limbIndex];
                const lmb = S.limbs[lk];
                ctx.fillStyle = C.uiActive; ctx.fillRect(mx + 2, my + mh - 22, mw - 4, 12);
                ctx.fillStyle = '#ffaaaa'; ctx.font = '8px monospace';
                ctx.fillText('→ ' + lmb.name, mx + 4, my + mh - 13);
                ctx.fillStyle = C.textDim; ctx.font = '6px monospace';
                const hitPct = Math.round(lmb.hitChance * 100);
                const critPct = Math.round(lmb.crit * 100);
                ctx.fillText('Hit ' + hitPct + '%  Crit ' + critPct + '%', mx + 4, my + mh - 4);
            }
        } else {
            ctx.fillStyle = C.textDim; ctx.font = '8px monospace';
            ctx.fillText('  ...', mx + 4, my + 38);
        }
    }

    // ── HP section (centre, 132 × 78) ──
    function drawHPSection(ctx, S) {
        const hx = 99, hy = UI_Y + 3, hw = 128, hh = 74;

        ctx.fillStyle = C.uiBg; ctx.fillRect(hx, hy, hw, hh);
        ctx.strokeStyle = C.uiBorder; ctx.strokeRect(hx, hy, hw, hh);

        // Player
        ctx.fillStyle = C.text; ctx.font = '7px monospace';
        ctx.fillText('PLAYER', hx + 4, hy + 9);
        hpBar(ctx, hx + 4, hy + 12, hw - 8, 9, S.player.hp, S.player.maxHp, true);
        ctx.fillStyle = C.textDim; ctx.font = '6px monospace';
        ctx.fillText(S.player.hp + ' / ' + S.player.maxHp, hx + 4, hy + 29);

        // Player limb mini-bars
        const LKEYS = ['HEAD', 'TORSO', 'LEGS', 'LEFT_ARM', 'RIGHT_ARM'];
        const LLBL  = { HEAD: 'Hd', TORSO: 'Tr', LEGS: 'Lg', LEFT_ARM: 'LA', RIGHT_ARM: 'RA' };
        ctx.font = '6px monospace';
        for (let i = 0; i < LKEYS.length; i++) {
            const k  = LKEYS[i];
            const ls = S.player.limbs[k];
            const f  = ls.hp / ls.maxHp;
            const bx = hx + 4 + i * 24, by = hy + 33;
            ctx.fillStyle = f <= 0 ? '#3a1010' : '#2a3020';
            ctx.fillRect(bx, by, 21, 10);
            if (f > 0) {
                ctx.fillStyle = f < 0.4 ? C.hpRed : C.hpGreen;
                ctx.fillRect(bx + 1, by + 1, Math.round(19 * f), 8);
            }
            ctx.strokeStyle = f <= 0 ? '#551010' : '#3a4a30';
            ctx.strokeRect(bx, by, 21, 10);
            ctx.fillStyle = f <= 0 ? '#664040' : '#aabba0';
            ctx.fillText(LLBL[k], bx + 2, by + 8);
        }

        // Divider
        ctx.strokeStyle = C.uiBorder;
        ctx.beginPath(); ctx.moveTo(hx + 2, hy + 47); ctx.lineTo(hx + hw - 2, hy + 47); ctx.stroke();

        // Enemy
        ctx.fillStyle = '#cc8888'; ctx.font = '7px monospace';
        ctx.fillText(S.enemy.name.toUpperCase().slice(0, 16), hx + 4, hy + 56);
        hpBar(ctx, hx + 4, hy + 59, hw - 8, 9, S.enemy.hp, S.enemy.maxHp, false);
        ctx.fillStyle = C.textDim; ctx.font = '6px monospace';
        ctx.fillText(S.enemy.hp + ' / ' + S.enemy.maxHp, hx + 4, hy + 76);
    }

    function hpBar(ctx, x, y, w, h, hp, maxHp, isPlayer) {
        const f = Math.max(0, hp / maxHp);
        ctx.fillStyle = C.hpBg; ctx.fillRect(x, y, w, h);
        const col = f > 0.5 ? (isPlayer ? C.hpGreen : C.hpEnemy)
                  : f > 0.25 ? C.hpYellow
                  : C.hpRed;
        ctx.fillStyle = col; ctx.fillRect(x + 1, y + 1, Math.round((w - 2) * f), h - 2);
        ctx.strokeStyle = C.hpBorder; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
    }

    // ── Combat log (right, 84 × 78) ──
    function drawLog(ctx, S) {
        const lx = 231, ly = UI_Y + 3, lw = 86, lh = 74;

        ctx.fillStyle = C.uiBg; ctx.fillRect(lx, ly, lw, lh);
        ctx.strokeStyle = C.uiBorder; ctx.strokeRect(lx, ly, lw, lh);

        ctx.fillStyle = C.textDim; ctx.font = '7px monospace';
        ctx.fillText('LOG', lx + 4, ly + 9);
        ctx.strokeStyle = C.uiBorder;
        ctx.beginPath(); ctx.moveTo(lx + 2, ly + 12); ctx.lineTo(lx + lw - 2, ly + 12); ctx.stroke();

        // Active message highlighted
        if (S.messageTimer > 0) {
            ctx.fillStyle = 'rgba(40,30,10,0.6)'; ctx.fillRect(lx + 2, ly + 14, lw - 4, 14);
            ctx.fillStyle = C.textGold; ctx.font = '7px monospace';
            wrapText(ctx, S.message, lx + 4, ly + 23, lw - 8, 8);
        }

        // Log entries (faded history)
        ctx.font = '6px monospace';
        const recent = _log.slice(-4);
        for (let i = 0; i < recent.length; i++) {
            const e = recent[i];
            ctx.globalAlpha = 0.35 + (i / recent.length) * 0.65;
            ctx.fillStyle = e.color;
            wrapText(ctx, e.text, lx + 3, ly + 33 + i * 10, lw - 6, 8);
        }
        ctx.globalAlpha = 1;
    }

    function wrapText(ctx, text, x, y, maxW, lineH) {
        const words = text.split(' ');
        let line = '';
        let cy = y;
        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            if (ctx.measureText(test).width > maxW && line) {
                ctx.fillText(line, x, cy);
                cy += lineH;
                line = word;
            } else {
                line = test;
            }
        }
        if (line) ctx.fillText(line, x, cy);
    }

    console.log('[CombatEnhanced] Loaded — enhanced combat visuals active');

})();
