/*************************************************************
 * js/engine/sprites_detailed.js
 * Combat-scale canvas sprites drawn with the 2D API only.
 * No images. No outlines thicker than 1 px.
 *
 * Exported globals (plain functions):
 *   drawPlayerCombat(ctx, x, y)
 *   drawCombatEnemy(ctx, enemy, x, y, slotWidth, sceneHeight)
 *   drawEnemy_skeleton(ctx, cx, cy, h)
 *   drawEnemy_guard(ctx, cx, cy, h)
 *   drawEnemy_cultist(ctx, cx, cy, h)
 *************************************************************/

/* ═══════════════════════════════════════════════════════════
   PLAYER — back-view, 28 × 56 px bounding box
   x = horizontal centre, y = top of bounding box
═══════════════════════════════════════════════════════════ */

function drawPlayerCombat(ctx, x, y) {
    ctx.save();

    // Boots
    ctx.fillStyle = '#1a0e06';
    ctx.fillRect(x - 9, y + 50, 8, 6);
    ctx.fillRect(x + 1, y + 50, 8, 6);

    // Legs
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x - 8, y + 44, 7, 12);
    ctx.fillRect(x + 1, y + 44, 7, 12);

    // Belt
    ctx.fillStyle = '#4a3010';
    ctx.fillRect(x - 9, y + 40, 18, 4);
    ctx.fillStyle = '#8a6020';
    ctx.fillRect(x - 2, y + 40,  4, 4);  // buckle

    // Arms
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x - 13, y + 26, 5, 16);
    ctx.fillRect(x +  8, y + 26, 5, 16);

    // Torso / coat
    ctx.fillRect(x - 9, y + 26, 18, 14);

    // Shoulders
    ctx.fillRect(x - 13, y + 21, 26, 5);

    // Bandage wrappings on forearms
    ctx.fillStyle = '#d4c4a0';
    ctx.fillRect(x - 12, y + 33, 3, 6);
    ctx.fillRect(x +  9, y + 33, 3, 6);

    // Neck
    ctx.fillStyle = '#c4a882';
    ctx.fillRect(x - 2, y + 16, 4, 5);

    // Head
    ctx.fillRect(x - 7, y + 4, 14, 12);

    // Hair (on top of head)
    ctx.fillStyle = '#c8c8d0';
    ctx.fillRect(x - 7, y,     14,  7);   // crown
    ctx.fillRect(x - 7, y + 4,  2, 10);   // left strand
    ctx.fillRect(x + 5, y + 4,  2, 10);   // right strand

    // Sword visible on right side
    ctx.fillStyle = '#9098a8';
    ctx.fillRect(x + 12, y + 14, 2, 30);  // blade
    ctx.fillStyle = '#5a4010';
    ctx.fillRect(x +  8, y + 32, 9,  3);  // guard
    ctx.fillStyle = '#4a2810';
    ctx.fillRect(x + 13, y + 35, 1,  8);  // handle

    ctx.restore();
}

/* ═══════════════════════════════════════════════════════════
   ENEMY DISPATCHER
   x = horizontal centre of slot, y = top of scene area.
   Enemy height = 35 % of sceneHeight; floats on sine.
═══════════════════════════════════════════════════════════ */

function drawCombatEnemy(ctx, enemy, x, y, slotWidth, sceneHeight) {
    const h      = (sceneHeight * 0.35) | 0;
    const floatY = Math.sin(Date.now() / 800) * 2;
    const cx     = x;
    const cy     = y + Math.floor(sceneHeight * 0.44) + floatY;

    const tag = (
        (enemy.type   || '') + ' ' +
        (enemy.sprite || '') + ' ' +
        (enemy.name   || '')
    ).toLowerCase();

    ctx.save();
    if (tag.includes('skeleton') || tag.includes('undead') || tag.includes('bone') || tag.includes('lich'))
        drawEnemy_skeleton(ctx, cx, cy, h);
    else if (tag.includes('guard') || tag.includes('knight') || tag.includes('soldier') || tag.includes('warrior') || tag.includes('gladiator') || tag.includes('bandit'))
        drawEnemy_guard(ctx, cx, cy, h);
    else if (tag.includes('cultist') || tag.includes('cult') || tag.includes('mage') || tag.includes('shaman') || tag.includes('witch') || tag.includes('spirit') || tag.includes('shade') || tag.includes('ghost'))
        drawEnemy_cultist(ctx, cx, cy, h);
    else
        drawEnemy_cultist(ctx, cx, cy, h);  // safe default
    ctx.restore();
}

/* ═══════════════════════════════════════════════════════════
   SKELETON
   cx / cy = centre, h = total height in px
═══════════════════════════════════════════════════════════ */

function drawEnemy_skeleton(ctx, cx, cy, h) {
    const s = h / 80;
    const t = cy - h * 0.5;

    ctx.save();

    // ── Leg bones ──────────────────────────────────────────
    ctx.fillStyle = '#c4bba0';
    ctx.fillRect(cx - s*10, t + h*0.60, s*5, h*0.20);   // L thigh
    ctx.fillRect(cx - s*11, t + h*0.80, s*5, h*0.18);   // L shin
    ctx.fillRect(cx + s* 5, t + h*0.60, s*5, h*0.20);   // R thigh
    ctx.fillRect(cx + s* 6, t + h*0.80, s*5, h*0.18);   // R shin

    // ── Pelvis ─────────────────────────────────────────────
    ctx.fillStyle = '#d4cbb0';
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.57, s*9, s*5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Spine ──────────────────────────────────────────────
    ctx.fillStyle = '#c4bba0';
    ctx.fillRect(cx - s*2, t + h*0.30, s*4, h*0.27);

    // ── Ribs — 5 pairs drawn as filled bezier arcs ─────────
    ctx.fillStyle = '#d4cbb0';
    for (let i = 0; i < 5; i++) {
        const ry = t + h * 0.30 + i * h * 0.042;
        ctx.beginPath();
        ctx.moveTo(cx - s*2, ry);
        ctx.bezierCurveTo(cx - s*14, ry + s, cx - s*14, ry + s*3, cx - s*2, ry + s*4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + s*2, ry);
        ctx.bezierCurveTo(cx + s*14, ry + s, cx + s*14, ry + s*3, cx + s*2, ry + s*4);
        ctx.fill();
    }

    // ── Shoulder bar ───────────────────────────────────────
    ctx.fillStyle = '#d4cbb0';
    ctx.fillRect(cx - s*16, t + h*0.28, s*32, s*4);

    // ── Left arm (hanging loose) ───────────────────────────
    ctx.fillStyle = '#c4bba0';
    ctx.save();
    ctx.translate(cx - s*14, t + h*0.32);
    ctx.rotate(0.18);
    ctx.fillRect(-s*2, 0, s*4, h*0.20);
    ctx.restore();
    ctx.save();
    ctx.translate(cx - s*15, t + h*0.51);
    ctx.rotate(0.35);
    ctx.fillRect(-s*2, 0, s*4, h*0.18);
    ctx.restore();

    // ── Right arm (raised, holding sword) ──────────────────
    ctx.save();
    ctx.translate(cx + s*14, t + h*0.32);
    ctx.rotate(-0.28);
    ctx.fillRect(-s*2, 0, s*4, h*0.20);
    ctx.restore();
    ctx.save();
    ctx.translate(cx + s*17, t + h*0.50);
    ctx.rotate(-0.55);
    ctx.fillRect(-s*2, 0, s*4, h*0.16);
    ctx.restore();

    // ── Rusty sword ────────────────────────────────────────
    ctx.save();
    ctx.translate(cx + s*24, t + h*0.34);
    ctx.rotate(-0.55);
    ctx.fillStyle = '#7a5830';
    ctx.fillRect(-s, -h*0.28, s*2, h*0.36);  // blade
    ctx.fillStyle = '#3a2810';
    ctx.fillRect(-s*4, -s*2,  s*8, s*3);     // guard
    ctx.restore();

    // ── Skull ──────────────────────────────────────────────
    ctx.fillStyle = '#d4cbb0';
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.14, s*9,  s*11, 0, 0, Math.PI * 2);  // cranium
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.18, s*10, s*7,  0, 0, Math.PI * 2);  // cheeks
    ctx.fill();
    ctx.fillRect(cx - s*6, t + h*0.22, s*12, s*4);                // jaw

    // Eye sockets
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(cx - s*4, t + h*0.13, s*3, s*3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s*4, t + h*0.13, s*3, s*3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ember glow inside sockets
    ctx.fillStyle = '#ff5020';
    ctx.beginPath();
    ctx.ellipse(cx - s*4, t + h*0.13, s*1.5, s*2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s*4, t + h*0.13, s*1.5, s*2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nose cavity
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.175, s*1.5, s*2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    ctx.fillStyle = '#e8e0c8';
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(cx - s*5 + i * s*2.5, t + h*0.23, s*1.5, s*3);
    }

    ctx.restore();
}

/* ═══════════════════════════════════════════════════════════
   GUARD — heavy iron plate armour
═══════════════════════════════════════════════════════════ */

function drawEnemy_guard(ctx, cx, cy, h) {
    const s = h / 80;
    const t = cy - h * 0.5;

    ctx.save();

    // ── Boots ──────────────────────────────────────────────
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect(cx - s*13, t + h*0.82, s*11, h*0.18);
    ctx.fillRect(cx + s* 2, t + h*0.82, s*11, h*0.18);

    // ── Greaves ────────────────────────────────────────────
    ctx.fillStyle = '#38303e';
    ctx.fillRect(cx - s*12, t + h*0.60, s*10, h*0.24);
    ctx.fillRect(cx + s* 2, t + h*0.60, s*10, h*0.24);

    // ── Tassets ────────────────────────────────────────────
    ctx.fillStyle = '#2a2430';
    ctx.fillRect(cx - s*14, t + h*0.52, s*11, h*0.10);
    ctx.fillRect(cx + s* 3, t + h*0.52, s*11, h*0.10);

    // ── Breastplate ────────────────────────────────────────
    ctx.fillStyle = '#383640';
    ctx.beginPath();
    ctx.moveTo(cx - s*14, t + h*0.28);
    ctx.lineTo(cx + s*14, t + h*0.28);
    ctx.lineTo(cx + s*12, t + h*0.54);
    ctx.lineTo(cx - s*12, t + h*0.54);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#484650';                   // centre ridge
    ctx.fillRect(cx - s*2, t + h*0.28, s*4, h*0.24);

    // ── Pauldrons ──────────────────────────────────────────
    ctx.fillStyle = '#28262e';
    ctx.beginPath();
    ctx.ellipse(cx - s*16, t + h*0.29, s*6, s*5, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s*16, t + h*0.29, s*6, s*5,  0.15, 0, Math.PI * 2);
    ctx.fill();

    // ── Arms ───────────────────────────────────────────────
    ctx.fillStyle = '#383640';
    ctx.fillRect(cx - s*21, t + h*0.33, s*7, h*0.28);
    ctx.fillRect(cx + s*14, t + h*0.33, s*7, h*0.28);

    // ── Gauntlets ──────────────────────────────────────────
    ctx.fillStyle = '#20181e';
    ctx.fillRect(cx - s*22, t + h*0.59, s*8, h*0.09);
    ctx.fillRect(cx + s*14, t + h*0.59, s*8, h*0.09);

    // ── Sword (right hand, raised) ─────────────────────────
    ctx.fillStyle = '#8a8898';
    ctx.fillRect(cx + s*20, t + h*0.08, s*3, h*0.44);
    ctx.fillStyle = '#2e2838';
    ctx.fillRect(cx + s*14, t + h*0.37, s*14, s*4);
    ctx.fillStyle = '#50301a';
    ctx.fillRect(cx + s*20, t + h*0.41, s*3,  s*12);

    // ── Shield (left side) ─────────────────────────────────
    ctx.fillStyle = '#20181e';
    ctx.beginPath();
    ctx.moveTo(cx - s*28, t + h*0.26);
    ctx.lineTo(cx - s*16, t + h*0.26);
    ctx.lineTo(cx - s*16, t + h*0.60);
    ctx.quadraticCurveTo(cx - s*22, t + h*0.70, cx - s*28, t + h*0.60);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a1810';                   // blood-cross emblem
    ctx.fillRect(cx - s*26, t + h*0.36, s*9, s*4);
    ctx.fillRect(cx - s*23, t + h*0.31, s*3, s*14);

    // ── Helmet ─────────────────────────────────────────────
    ctx.fillStyle = '#28262e';
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.16, s*12, s*14, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - s*12, t + h*0.16, s*24, s*12);

    ctx.fillStyle = '#0a0808';                   // visor slot
    ctx.fillRect(cx - s*9, t + h*0.18, s*18, s*6);
    ctx.fillStyle = 'rgba(190,30,20,0.55)';      // crimson glow within
    ctx.fillRect(cx - s*8, t + h*0.19, s*16, s*4);

    ctx.fillStyle = '#28262e';                   // cheek guards
    ctx.fillRect(cx - s*12, t + h*0.24, s*4, s*8);
    ctx.fillRect(cx +  s*8, t + h*0.24, s*4, s*8);

    ctx.restore();
}

/* ═══════════════════════════════════════════════════════════
   CULTIST — dark hooded robe, ritual gestures
═══════════════════════════════════════════════════════════ */

function drawEnemy_cultist(ctx, cx, cy, h) {
    const s = h / 80;
    const t = cy - h * 0.5;

    ctx.save();

    // ── Robe (flares toward hem) ───────────────────────────
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.moveTo(cx - s*14, t + h*0.28);
    ctx.lineTo(cx + s*14, t + h*0.28);
    ctx.lineTo(cx + s*20, t + h);
    ctx.lineTo(cx - s*20, t + h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a1010';                   // centre crease
    ctx.fillRect(cx - s*2, t + h*0.28, s*4, h*0.72);

    // ── Sleeves ────────────────────────────────────────────
    ctx.fillStyle = '#1a0a0a';
    ctx.save();
    ctx.translate(cx - s*14, t + h*0.32);
    ctx.rotate(0.25);
    ctx.fillRect(-s*6, 0, s*10, h*0.30);         // left (hanging)
    ctx.restore();
    ctx.save();
    ctx.translate(cx + s*14, t + h*0.32);
    ctx.rotate(-0.55);
    ctx.fillRect(-s*4, 0, s*10, h*0.26);         // right (raised in ritual)
    ctx.restore();

    // ── Hands ──────────────────────────────────────────────
    ctx.fillStyle = '#c4a882';
    ctx.beginPath();
    ctx.ellipse(cx - s*20, t + h*0.62, s*4, s*5, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s*23, t + h*0.43, s*4, s*5, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Ritual markings on hands
    ctx.strokeStyle = '#8a3020';
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - s*23, t + h*0.60);
    ctx.lineTo(cx - s*17, t + h*0.64);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s*21, t + h*0.41);
    ctx.lineTo(cx + s*26, t + h*0.45);
    ctx.stroke();
    ctx.lineWidth = 1;

    // ── Chest sigil ────────────────────────────────────────
    const sx = cx, sy = t + h * 0.52, r = s * 7;
    ctx.strokeStyle = '#8a1a08';
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#c02010';
    for (let p = 0; p < 5; p++) {
        const a1 = (p * 4 * Math.PI / 5) - Math.PI / 2;
        const a2 = ((p + 2) * 4 * Math.PI / 5) - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a1) * r, sy + Math.sin(a1) * r);
        ctx.lineTo(sx + Math.cos(a2) * r, sy + Math.sin(a2) * r);
        ctx.stroke();
    }
    ctx.lineWidth = 1;

    // ── Neck ───────────────────────────────────────────────
    ctx.fillStyle = '#c4a882';
    ctx.fillRect(cx - s*3, t + h*0.22, s*6, h*0.08);

    // ── Hood ───────────────────────────────────────────────
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.15, s*12, s*14, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - s*12, t + h*0.15, s*24, h*0.14);
    ctx.fillStyle = '#0a0606';                   // shadow inside hood
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.19, s*8, s*8, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - s*8, t + h*0.19, s*16, h*0.10);

    // ── Face in shadow ─────────────────────────────────────
    ctx.fillStyle = '#c4a882';
    ctx.beginPath();
    ctx.ellipse(cx, t + h*0.21, s*6, s*7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing eyes
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(cx - s*4.5, t + h*0.18, s*3, s*3);
    ctx.fillRect(cx + s*1.5, t + h*0.18, s*3, s*3);
    ctx.fillStyle = '#cc2010';
    ctx.fillRect(cx - s*4,   t + h*0.185, s*2, s*2);
    ctx.fillRect(cx + s*2,   t + h*0.185, s*2, s*2);

    ctx.restore();
}

console.log('[SpritesDetailed] Loaded');
