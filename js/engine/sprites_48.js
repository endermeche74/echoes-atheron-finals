/*************************************************************
 * sprites_48.js — Native 48×48 Sprite Library
 * Each sprite draws into world-space at (x, y) top-left.
 * No SpriteScaler — drawn at pixel-perfect 48×48.
 *************************************************************/

const SPRITES_48 = (function() {

    // ─── SHARED HELPERS ──────────────────────────────────────

    function shadow(ctx, cx, cy, rw, rh) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Outline rect (1px dark border then filled)
    function oRect(ctx, fill, ox, oy, w, h) {
        ctx.fillStyle = '#111111';
        ctx.fillRect(ox - 1, oy - 1, w + 2, h + 2);
        ctx.fillStyle = fill;
        ctx.fillRect(ox, oy, w, h);
    }

    // ─── PLAYER ──────────────────────────────────────────────
    // Walk cycle: frame 0/2 = neutral, 1 = right-foot-fwd, 3 = left-foot-fwd

    function drawPlayerBase(ctx, x, y, frame, facingLeft) {
        const bob = (frame === 1 || frame === 3) ? -1 : 0;
        const legSwing = (frame === 1) ? 3 : (frame === 3) ? -3 : 0;
        const armSwing = -legSwing;

        // Shadow
        shadow(ctx, x + 24, y + 46, 14, 4);

        // --- Boots ---
        ctx.fillStyle = '#2a1a0e';
        ctx.fillRect(x + 12, y + 43 + (legSwing > 0 ? legSwing : 0), 10, 5);
        ctx.fillRect(x + 26, y + 43 + (legSwing < 0 ? -legSwing : 0), 10, 5);
        ctx.fillStyle = '#3d2a14';
        ctx.fillRect(x + 13, y + 43 + (legSwing > 0 ? legSwing : 0), 5, 2);
        ctx.fillRect(x + 27, y + 43 + (legSwing < 0 ? -legSwing : 0), 5, 2);

        // --- Legs ---
        ctx.fillStyle = '#1e1a14';
        ctx.fillRect(x + 13, y + 33, 9, 11 + (legSwing > 0 ? legSwing : 0));
        ctx.fillRect(x + 26, y + 33, 9, 11 + (legSwing < 0 ? -legSwing : 0));
        ctx.fillStyle = '#2e2820';  // seam highlight
        ctx.fillRect(x + 17, y + 33, 1, 10);
        ctx.fillRect(x + 30, y + 33, 1, 10);

        // --- Cloak / lower tunic ---
        ctx.fillStyle = '#3a2810';
        ctx.fillRect(x + 11, y + 29 + bob, 26, 7);
        ctx.fillStyle = '#4a3418';
        ctx.fillRect(x + 12, y + 30 + bob, 24, 5);

        // --- Belt ---
        ctx.fillStyle = '#1e1208';
        ctx.fillRect(x + 11, y + 28 + bob, 26, 3);
        ctx.fillStyle = '#8a6428';  // buckle
        ctx.fillRect(x + 21, y + 28 + bob, 6, 3);
        ctx.fillStyle = '#c09040';
        ctx.fillRect(x + 22, y + 28 + bob, 2, 2);

        // --- Tunic body ---
        ctx.fillStyle = '#3d5228';
        ctx.fillRect(x + 12, y + 17 + bob, 24, 13);
        ctx.fillStyle = '#4e6834';
        ctx.fillRect(x + 13, y + 18 + bob, 22, 11);
        ctx.fillStyle = '#5d7a3e';  // highlight
        ctx.fillRect(x + 14, y + 18 + bob, 8, 9);
        ctx.fillStyle = '#3d5228';  // center crease
        ctx.fillRect(x + 23, y + 18 + bob, 1, 11);

        // --- Arms ---
        const laY = y + 18 + bob + armSwing;
        const raY = y + 18 + bob - armSwing;
        ctx.fillStyle = '#3d5228';
        ctx.fillRect(x + 6, laY, 6, 14);
        ctx.fillRect(x + 36, raY, 6, 14);
        // hands
        ctx.fillStyle = '#d4a060';
        ctx.fillRect(x + 6, laY + 13, 6, 5);
        ctx.fillRect(x + 36, raY + 13, 6, 5);
        // knuckle
        ctx.fillStyle = '#b88040';
        ctx.fillRect(x + 7, laY + 16, 4, 1);
        ctx.fillRect(x + 37, raY + 16, 4, 1);

        // --- Shoulders ---
        ctx.fillStyle = '#3d5228';
        ctx.fillRect(x + 9, y + 17 + bob, 30, 4);
        ctx.fillStyle = '#5d7a3e';
        ctx.fillRect(x + 10, y + 17 + bob, 28, 2);

        // --- Neck ---
        ctx.fillStyle = '#d4a060';
        ctx.fillRect(x + 20, y + 13 + bob, 8, 5);
        ctx.fillStyle = '#b88040';
        ctx.fillRect(x + 20, y + 16 + bob, 8, 2);
    }

    function drawHeadDown(ctx, x, y, bob) {
        // Hair
        ctx.fillStyle = '#2a1e0e';
        ctx.fillRect(x + 14, y + 1 + bob, 20, 7);
        ctx.fillRect(x + 12, y + 3 + bob, 3, 8);
        ctx.fillRect(x + 33, y + 3 + bob, 3, 8);
        ctx.fillStyle = '#3a2e1e';
        ctx.fillRect(x + 15, y + 2 + bob, 18, 4);

        // Head shape
        ctx.fillStyle = '#e0b070';
        ctx.fillRect(x + 14, y + 6 + bob, 20, 12);
        // Shading
        ctx.fillStyle = '#c89050';
        ctx.fillRect(x + 14, y + 15 + bob, 20, 3);
        ctx.fillStyle = '#d4a060';
        ctx.fillRect(x + 14, y + 6 + bob, 3, 12);
        ctx.fillStyle = '#ecca88';
        ctx.fillRect(x + 28, y + 7 + bob, 3, 6);

        // Eyebrows
        ctx.fillStyle = '#2a1e0e';
        ctx.fillRect(x + 17, y + 8 + bob, 5, 2);
        ctx.fillRect(x + 26, y + 8 + bob, 5, 2);

        // Eyes (whites, iris, pupil)
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x + 17, y + 10 + bob, 6, 4);
        ctx.fillRect(x + 25, y + 10 + bob, 6, 4);
        ctx.fillStyle = '#4a6a9a';
        ctx.fillRect(x + 18, y + 11 + bob, 4, 3);
        ctx.fillRect(x + 26, y + 11 + bob, 4, 3);
        ctx.fillStyle = '#101010';
        ctx.fillRect(x + 19, y + 11 + bob, 2, 2);
        ctx.fillRect(x + 27, y + 11 + bob, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 20, y + 11 + bob, 1, 1);
        ctx.fillRect(x + 28, y + 11 + bob, 1, 1);
        // Eyelids top
        ctx.fillStyle = '#2a1e0e';
        ctx.fillRect(x + 17, y + 10 + bob, 6, 1);
        ctx.fillRect(x + 25, y + 10 + bob, 6, 1);

        // Nose
        ctx.fillStyle = '#c89050';
        ctx.fillRect(x + 22, y + 13 + bob, 4, 2);

        // Mouth
        ctx.fillStyle = '#8a4030';
        ctx.fillRect(x + 19, y + 15 + bob, 10, 2);
        ctx.fillStyle = '#c06050';
        ctx.fillRect(x + 20, y + 15 + bob, 4, 2);
        ctx.fillRect(x + 25, y + 15 + bob, 3, 2);
    }

    function drawHeadUp(ctx, x, y, bob) {
        // Hair covers most of face (back of head)
        ctx.fillStyle = '#2a1e0e';
        ctx.fillRect(x + 13, y + 1 + bob, 22, 17);
        ctx.fillStyle = '#3a2e1e';
        ctx.fillRect(x + 14, y + 2 + bob, 20, 8);
        // Hint of neck
        ctx.fillStyle = '#d4a060';
        ctx.fillRect(x + 20, y + 14 + bob, 8, 4);
        // Ear hints
        ctx.fillStyle = '#d4a060';
        ctx.fillRect(x + 12, y + 7 + bob, 2, 5);
        ctx.fillRect(x + 34, y + 7 + bob, 2, 5);
    }

    function drawHeadSide(ctx, x, y, bob, faceLeft) {
        const flip = faceLeft ? 0 : 1;

        // Hair
        ctx.fillStyle = '#2a1e0e';
        ctx.fillRect(x + 12, y + 1 + bob, 22, 8);
        ctx.fillRect(faceLeft ? x + 12 : x + 32, y + 3 + bob, 4, 12);
        ctx.fillStyle = '#3a2e1e';
        ctx.fillRect(x + 13, y + 2 + bob, 20, 5);

        // Head
        ctx.fillStyle = '#e0b070';
        ctx.fillRect(x + 13, y + 6 + bob, 20, 12);
        ctx.fillStyle = '#c89050';
        ctx.fillRect(x + 13, y + 15 + bob, 20, 3);

        // Visible eye
        const eyeX = faceLeft ? x + 16 : x + 26;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(eyeX, y + 9 + bob, 5, 4);
        ctx.fillStyle = '#4a6a9a';
        ctx.fillRect(eyeX + 1, y + 10 + bob, 3, 3);
        ctx.fillStyle = '#101010';
        ctx.fillRect(eyeX + 1, y + 10 + bob, 2, 2);
        ctx.fillStyle = '#2a1e0e';
        ctx.fillRect(eyeX, y + 9 + bob, 5, 1);

        // Eyebrow
        ctx.fillStyle = '#2a1e0e';
        ctx.fillRect(eyeX, y + 7 + bob, 6, 2);

        // Nose
        const noseX = faceLeft ? x + 14 : x + 30;
        ctx.fillStyle = '#c89050';
        ctx.fillRect(noseX, y + 13 + bob, 4, 3);
        ctx.fillRect(faceLeft ? noseX - 2 : noseX + 2, y + 15 + bob, 2, 2);
    }

    // ─── PLAYER SPRITES ──────────────────────────────────────

    const player_down = {
        frames: 4,
        draw(ctx, x, y, frame) {
            const bob = (frame === 1 || frame === 3) ? -1 : 0;
            drawPlayerBase(ctx, x, y, frame, false);
            drawHeadDown(ctx, x, y, bob);
        }
    };

    const player_up = {
        frames: 4,
        draw(ctx, x, y, frame) {
            const bob = (frame === 1 || frame === 3) ? -1 : 0;
            drawPlayerBase(ctx, x, y, frame, false);
            drawHeadUp(ctx, x, y, bob);
        }
    };

    const player_left = {
        frames: 4,
        draw(ctx, x, y, frame) {
            const bob = (frame === 1 || frame === 3) ? -1 : 0;
            drawPlayerBase(ctx, x, y, frame, true);
            drawHeadSide(ctx, x, y, bob, true);
        }
    };

    const player_right = {
        frames: 4,
        draw(ctx, x, y, frame) {
            const bob = (frame === 1 || frame === 3) ? -1 : 0;
            drawPlayerBase(ctx, x, y, frame, false);
            drawHeadSide(ctx, x, y, bob, false);
        }
    };

    // ─── WOLF ────────────────────────────────────────────────

    const wolf = {
        frames: 2,
        draw(ctx, x, y, frame) {
            const trot = frame === 1 ? 2 : 0;

            shadow(ctx, x + 24, y + 44, 16, 4);

            // Tail
            ctx.fillStyle = '#5a5a60';
            ctx.fillRect(x + 2, y + 18, 8, 5);
            ctx.fillRect(x + 2, y + 13, 5, 7);
            ctx.fillRect(x + 3, y + 10, 3, 5);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(x + 2, y + 10, 3, 3);  // tail tip

            // Body
            ctx.fillStyle = '#484850';
            ctx.fillRect(x + 8, y + 20, 30, 16);
            ctx.fillStyle = '#585860';
            ctx.fillRect(x + 9, y + 19, 28, 14);
            ctx.fillStyle = '#6a6a72';  // spine highlight
            ctx.fillRect(x + 10, y + 19, 26, 3);
            ctx.fillStyle = '#3a3a42';  // belly
            ctx.fillRect(x + 10, y + 30, 26, 5);

            // Legs (4 legs)
            const f1 = trot, f2 = -trot;
            ctx.fillStyle = '#484850';
            ctx.fillRect(x + 10, y + 34 + f1, 6, 10);  // front-left
            ctx.fillRect(x + 18, y + 34 + f2, 6, 10);  // front-right
            ctx.fillRect(x + 26, y + 34 + f2, 6, 10);  // back-left
            ctx.fillRect(x + 34, y + 34 + f1, 6, 10);  // back-right
            // Paws
            ctx.fillStyle = '#2a2a30';
            ctx.fillRect(x + 9,  y + 43 + f1, 8, 3);
            ctx.fillRect(x + 17, y + 43 + f2, 8, 3);
            ctx.fillRect(x + 25, y + 43 + f2, 8, 3);
            ctx.fillRect(x + 33, y + 43 + f1, 8, 3);

            // Neck
            ctx.fillStyle = '#585860';
            ctx.fillRect(x + 30, y + 14, 12, 10);
            ctx.fillStyle = '#6a6a72';
            ctx.fillRect(x + 31, y + 14, 10, 5);

            // Head
            ctx.fillStyle = '#585860';
            ctx.fillRect(x + 32, y + 6, 14, 12);
            ctx.fillStyle = '#6a6a72';
            ctx.fillRect(x + 33, y + 6, 12, 8);

            // Snout
            ctx.fillStyle = '#484850';
            ctx.fillRect(x + 38, y + 13, 8, 6);
            ctx.fillStyle = '#2a1a1a';
            ctx.fillRect(x + 43, y + 13, 4, 3);  // nose tip
            ctx.fillStyle = '#d44444';            // tongue
            ctx.fillRect(x + 40, y + 17, 4, 3);

            // Fangs
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(x + 38, y + 17, 2, 4);
            ctx.fillRect(x + 42, y + 17, 2, 4);

            // Eyes
            ctx.fillStyle = '#e8c020';  // yellow
            ctx.fillRect(x + 33, y + 8, 5, 4);
            ctx.fillRect(x + 40, y + 8, 5, 4);
            ctx.fillStyle = '#1a1a10';
            ctx.fillRect(x + 35, y + 9, 2, 2);
            ctx.fillRect(x + 42, y + 9, 2, 2);

            // Ear
            ctx.fillStyle = '#484850';
            ctx.fillRect(x + 33, y + 2, 5, 6);
            ctx.fillRect(x + 40, y + 2, 5, 6);
            ctx.fillStyle = '#7a3030';
            ctx.fillRect(x + 34, y + 3, 3, 4);
            ctx.fillRect(x + 41, y + 3, 3, 4);

            // Fur texture
            ctx.fillStyle = '#3a3a40';
            ctx.fillRect(x + 12, y + 22, 2, 3);
            ctx.fillRect(x + 20, y + 21, 2, 2);
            ctx.fillRect(x + 28, y + 23, 2, 3);
        }
    };

    // ─── BANDIT ──────────────────────────────────────────────

    const bandit = {
        frames: 2,
        draw(ctx, x, y, frame) {
            const bob = frame === 1 ? -1 : 0;

            shadow(ctx, x + 24, y + 46, 14, 4);

            // Boots
            ctx.fillStyle = '#1a1208';
            ctx.fillRect(x + 12, y + 43, 10, 5);
            ctx.fillRect(x + 26, y + 43, 10, 5);
            ctx.fillStyle = '#2a2010';
            ctx.fillRect(x + 13, y + 43, 5, 2);
            ctx.fillRect(x + 27, y + 43, 5, 2);

            // Pants
            ctx.fillStyle = '#1e1a10';
            ctx.fillRect(x + 13, y + 33, 9, 12);
            ctx.fillRect(x + 26, y + 33, 9, 12);

            // Leather armor skirt
            ctx.fillStyle = '#4a3018';
            ctx.fillRect(x + 11, y + 28 + bob, 26, 8);
            ctx.fillStyle = '#5a3c20';
            ctx.fillRect(x + 12, y + 29 + bob, 24, 6);
            // Rivets
            ctx.fillStyle = '#8a7030';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(x + 13 + i * 5, y + 29 + bob, 2, 2);
            }

            // Belt with dagger
            ctx.fillStyle = '#2a1a08';
            ctx.fillRect(x + 11, y + 27 + bob, 26, 3);
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(x + 32, y + 26 + bob, 3, 5);  // dagger hilt
            ctx.fillStyle = '#c0c0d0';
            ctx.fillRect(x + 33, y + 30 + bob, 2, 7);  // dagger blade

            // Leather chest
            ctx.fillStyle = '#3a2810';
            ctx.fillRect(x + 10, y + 17 + bob, 28, 12);
            ctx.fillStyle = '#4a3418';
            ctx.fillRect(x + 11, y + 18 + bob, 26, 10);
            ctx.fillStyle = '#5a4020';  // highlight
            ctx.fillRect(x + 12, y + 18 + bob, 10, 8);
            // Chest strap
            ctx.fillStyle = '#2a1a08';
            ctx.fillRect(x + 18, y + 18 + bob, 3, 10);
            ctx.fillRect(x + 28, y + 18 + bob, 3, 10);
            // Buckle
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(x + 21, y + 22 + bob, 6, 4);

            // Arms (leather bracers)
            ctx.fillStyle = '#3a2810';
            ctx.fillRect(x + 5, y + 17 + bob, 6, 16);
            ctx.fillRect(x + 37, y + 17 + bob, 6, 16);
            ctx.fillStyle = '#6a4020';  // bracer
            ctx.fillRect(x + 5, y + 26 + bob, 6, 6);
            ctx.fillRect(x + 37, y + 26 + bob, 6, 6);
            ctx.fillStyle = '#d4a060';
            ctx.fillRect(x + 5, y + 32 + bob, 6, 5);
            ctx.fillRect(x + 37, y + 32 + bob, 6, 5);

            // Neck
            ctx.fillStyle = '#c8946050';
            ctx.fillRect(x + 20, y + 13 + bob, 8, 5);

            // Bandana (red)
            ctx.fillStyle = '#8a1010';
            ctx.fillRect(x + 12, y + 2 + bob, 24, 8);
            ctx.fillStyle = '#aa1818';
            ctx.fillRect(x + 13, y + 3 + bob, 22, 5);
            ctx.fillStyle = '#cc2020';
            ctx.fillRect(x + 14, y + 3 + bob, 10, 3);
            // Knot (right side)
            ctx.fillStyle = '#8a1010';
            ctx.fillRect(x + 34, y + 6 + bob, 4, 6);
            ctx.fillRect(x + 32, y + 9 + bob, 8, 3);

            // Face (below bandana)
            ctx.fillStyle = '#c89050';
            ctx.fillRect(x + 14, y + 8 + bob, 20, 10);
            ctx.fillStyle = '#a87040';
            ctx.fillRect(x + 14, y + 15 + bob, 20, 3);

            // Scar
            ctx.fillStyle = '#8a4030';
            ctx.fillRect(x + 17, y + 10 + bob, 1, 6);
            ctx.fillRect(x + 18, y + 12 + bob, 3, 1);

            // Eyes (menacing)
            ctx.fillStyle = '#101010';
            ctx.fillRect(x + 17, y + 9 + bob, 5, 3);
            ctx.fillRect(x + 26, y + 9 + bob, 5, 3);
            ctx.fillStyle = '#7a1010';
            ctx.fillRect(x + 18, y + 10 + bob, 3, 2);
            ctx.fillRect(x + 27, y + 10 + bob, 3, 2);

            // Stubble
            ctx.fillStyle = '#6a4020';
            ctx.fillRect(x + 17, y + 14 + bob, 14, 1);
            ctx.fillRect(x + 15, y + 15 + bob, 18, 2);

            // Mouth (grin)
            ctx.fillStyle = '#3a1a10';
            ctx.fillRect(x + 19, y + 15 + bob, 10, 2);
        }
    };

    // ─── UNDEAD ──────────────────────────────────────────────

    const undead = {
        frames: 2,
        draw(ctx, x, y, frame) {
            const sway = frame === 1 ? 2 : -2;

            shadow(ctx, x + 24, y + 46, 12, 3);

            // Tattered robe
            ctx.fillStyle = '#1a1820';
            ctx.fillRect(x + 10, y + 20, 28, 26);
            ctx.fillStyle = '#242230';
            ctx.fillRect(x + 11, y + 21, 26, 22);
            // Rips in robe
            ctx.fillStyle = '#0a0810';
            ctx.fillRect(x + 14, y + 28, 3, 8);
            ctx.fillRect(x + 22, y + 32, 2, 10);
            ctx.fillRect(x + 30, y + 26, 3, 12);

            // Bony hands
            ctx.fillStyle = '#d8d0b8';
            ctx.fillRect(x + 4, y + 28 + sway, 6, 8);
            ctx.fillRect(x + 38, y + 28 - sway, 6, 8);
            // Finger bones
            ctx.fillStyle = '#b8b0a0';
            ctx.fillRect(x + 5, y + 35 + sway, 2, 4);
            ctx.fillRect(x + 7, y + 36 + sway, 2, 4);
            ctx.fillRect(x + 39, y + 35 - sway, 2, 4);
            ctx.fillRect(x + 41, y + 36 - sway, 2, 4);

            // Bony arms
            ctx.fillStyle = '#1a1820';
            ctx.fillRect(x + 5, y + 20, 6, 10);
            ctx.fillRect(x + 37, y + 20, 6, 10);
            // Rib hint through robe
            ctx.fillStyle = '#0a0810';
            ctx.fillRect(x + 16, y + 22, 16, 1);
            ctx.fillRect(x + 16, y + 25, 16, 1);
            ctx.fillRect(x + 16, y + 28, 16, 1);

            // Neck (bone)
            ctx.fillStyle = '#c8c0a8';
            ctx.fillRect(x + 20, y + 14, 8, 7);
            ctx.fillStyle = '#a8a090';
            ctx.fillRect(x + 22, y + 15, 4, 5);

            // Skull head
            ctx.fillStyle = '#d8d0b8';
            ctx.fillRect(x + 13, y + 2, 22, 14);
            ctx.fillStyle = '#e8e0c8';  // forehead
            ctx.fillRect(x + 14, y + 2, 20, 6);
            // Cracks
            ctx.fillStyle = '#a8a090';
            ctx.fillRect(x + 22, y + 2, 1, 8);
            ctx.fillRect(x + 18, y + 4, 4, 1);

            // Eye sockets — glowing green
            ctx.fillStyle = '#0a0818';
            ctx.fillRect(x + 15, y + 8, 7, 7);
            ctx.fillRect(x + 26, y + 8, 7, 7);
            ctx.fillStyle = '#20ff40';  // green glow
            ctx.fillRect(x + 16, y + 9, 5, 5);
            ctx.fillRect(x + 27, y + 9, 5, 5);
            ctx.fillStyle = '#60ff80';  // bright core
            ctx.fillRect(x + 18, y + 10, 2, 3);
            ctx.fillRect(x + 29, y + 10, 2, 3);

            // Nasal cavity
            ctx.fillStyle = '#0a0818';
            ctx.fillRect(x + 22, y + 12, 4, 3);

            // Jaw (lower)
            ctx.fillStyle = '#c8c0a8';
            ctx.fillRect(x + 14, y + 14, 20, 5);
            // Teeth
            ctx.fillStyle = '#e8e0c8';
            for (let i = 0; i < 6; i++) {
                ctx.fillRect(x + 15 + i * 4, y + 16, 3, 5);
            }
            ctx.fillStyle = '#2a2430';  // gaps
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(x + 18 + i * 4, y + 16, 1, 5);
            }

            // Floating particles (glowing)
            const glow = ['#40ff60', '#20ff40', '#80ffaa'];
            const positions = [[x+8, y+16], [x+38, y+12], [x+24, y+1], [x+18, y+38], [x+34, y+40]];
            for (let i = 0; i < positions.length; i++) {
                const py2 = positions[i][1] + (frame === 1 ? i % 2 * 2 : 0);
                ctx.fillStyle = glow[i % 3];
                ctx.fillRect(positions[i][0], py2, 2, 2);
            }
        }
    };

    // ─── SPIRIT ──────────────────────────────────────────────

    const spirit = {
        frames: 4,
        draw(ctx, x, y, frame) {
            const wave = Math.sin(frame * Math.PI / 2);
            const wInt = Math.round(wave * 3);

            shadow(ctx, x + 24, y + 46, 10, 3);

            // Wispy tail (fades out at bottom)
            ctx.fillStyle = 'rgba(160, 200, 255, 0.15)';
            ctx.fillRect(x + 12, y + 38, 24, 10);
            ctx.fillStyle = 'rgba(160, 200, 255, 0.25)';
            ctx.fillRect(x + 14, y + 34, 20, 6);
            ctx.fillStyle = 'rgba(160, 200, 255, 0.35)';
            ctx.fillRect(x + 16, y + 30, 16, 5);

            // Body (translucent)
            ctx.fillStyle = 'rgba(180, 220, 255, 0.55)';
            ctx.fillRect(x + 12, y + 16 + wInt, 24, 16);
            ctx.fillStyle = 'rgba(200, 230, 255, 0.65)';
            ctx.fillRect(x + 14, y + 17 + wInt, 20, 12);
            ctx.fillStyle = 'rgba(220, 240, 255, 0.4)';
            ctx.fillRect(x + 16, y + 17 + wInt, 8, 8);

            // Arms (wispy)
            ctx.fillStyle = 'rgba(160, 200, 255, 0.4)';
            ctx.fillRect(x + 4, y + 18 + wInt, 10, 8);
            ctx.fillRect(x + 34, y + 18 + wInt, 10, 8);
            ctx.fillStyle = 'rgba(180, 220, 255, 0.35)';
            ctx.fillRect(x + 2, y + 24 + wInt, 8, 4);
            ctx.fillRect(x + 38, y + 24 + wInt, 8, 4);

            // Head (more solid)
            ctx.fillStyle = 'rgba(200, 230, 255, 0.75)';
            ctx.fillRect(x + 14, y + 4 + wInt, 20, 14);
            ctx.fillStyle = 'rgba(220, 245, 255, 0.85)';
            ctx.fillRect(x + 15, y + 4 + wInt, 18, 10);

            // Eyes (bright blue-white)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(x + 16, y + 8 + wInt, 6, 5);
            ctx.fillRect(x + 26, y + 8 + wInt, 6, 5);
            ctx.fillStyle = '#80c0ff';
            ctx.fillRect(x + 17, y + 9 + wInt, 4, 4);
            ctx.fillRect(x + 27, y + 9 + wInt, 4, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 18, y + 9 + wInt, 2, 2);
            ctx.fillRect(x + 28, y + 9 + wInt, 2, 2);

            // Particles
            const pts = [[x+6,y+10],[x+40,y+14],[x+22,y+2],[x+36,y+32],[x+10,y+28],[x+28,y+42]];
            const alphas = [0.7, 0.5, 0.9, 0.4, 0.6, 0.3];
            for (let i = 0; i < pts.length; i++) {
                const shift = (i + frame) % 4 < 2 ? 2 : -2;
                ctx.fillStyle = `rgba(160, 210, 255, ${alphas[i]})`;
                ctx.fillRect(pts[i][0], pts[i][1] + shift, 3, 3);
            }

            // Inner glow lines
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x + 18, y + 18 + wInt, 12, 1);
            ctx.fillRect(x + 16, y + 21 + wInt, 16, 1);
        }
    };

    // ─── BOSS GUARDIAN ───────────────────────────────────────

    const boss_guardian = {
        frames: 2,
        draw(ctx, x, y, frame) {
            const pulse = frame === 1 ? 1 : 0;

            shadow(ctx, x + 24, y + 47, 20, 5);

            // Cape (behind)
            ctx.fillStyle = '#0a0814';
            ctx.fillRect(x + 4, y + 14, 40, 34);
            ctx.fillStyle = '#14101e';
            ctx.fillRect(x + 5, y + 15, 38, 30);
            // Cape shimmer
            ctx.fillStyle = '#1e1a2a';
            ctx.fillRect(x + 6, y + 16, 10, 26);
            ctx.fillRect(x + 32, y + 18, 10, 24);

            // Boots (armored)
            ctx.fillStyle = '#181820';
            ctx.fillRect(x + 11, y + 42, 12, 6);
            ctx.fillRect(x + 25, y + 42, 12, 6);
            ctx.fillStyle = '#282830';
            ctx.fillRect(x + 12, y + 42, 8, 3);
            ctx.fillRect(x + 26, y + 42, 8, 3);
            ctx.fillStyle = '#484858';  // knee guard
            ctx.fillRect(x + 11, y + 37, 12, 6);
            ctx.fillRect(x + 25, y + 37, 12, 6);
            ctx.fillStyle = '#585870';
            ctx.fillRect(x + 12, y + 37, 8, 3);

            // Legs
            ctx.fillStyle = '#1e1e26';
            ctx.fillRect(x + 13, y + 33, 10, 8);
            ctx.fillRect(x + 25, y + 33, 10, 8);

            // Waist armor
            ctx.fillStyle = '#282830';
            ctx.fillRect(x + 10, y + 28, 28, 7);
            ctx.fillStyle = '#38384a';
            ctx.fillRect(x + 11, y + 28, 26, 5);
            // Tassets
            ctx.fillStyle = '#1e1e28';
            ctx.fillRect(x + 10, y + 32, 8, 5);
            ctx.fillRect(x + 30, y + 32, 8, 5);
            ctx.fillStyle = '#484858';
            ctx.fillRect(x + 11, y + 32, 5, 3);
            ctx.fillRect(x + 31, y + 32, 5, 3);

            // Chest plate (main)
            ctx.fillStyle = '#1a1a22';
            ctx.fillRect(x + 8, y + 14, 32, 16);
            ctx.fillStyle = '#28283a';
            ctx.fillRect(x + 9, y + 14, 30, 14);
            ctx.fillStyle = '#38384e';
            ctx.fillRect(x + 10, y + 14, 14, 12);
            ctx.fillStyle = '#2e2e40';
            ctx.fillRect(x + 24, y + 14, 14, 12);
            // Chest rune (glowing)
            ctx.fillStyle = `rgba(200, 40, 40, ${0.7 + pulse * 0.3})`;
            ctx.fillRect(x + 20, y + 17, 8, 6);
            ctx.fillStyle = `rgba(255, 80, 80, ${0.5 + pulse * 0.4})`;
            ctx.fillRect(x + 22, y + 18, 4, 4);
            ctx.fillStyle = `rgba(255, 160, 160, ${0.6 + pulse * 0.4})`;
            ctx.fillRect(x + 23, y + 19, 2, 2);

            // Shoulders (pauldrons)
            ctx.fillStyle = '#1a1a22';
            ctx.fillRect(x + 2, y + 12, 12, 10);
            ctx.fillRect(x + 34, y + 12, 12, 10);
            ctx.fillStyle = '#38384e';
            ctx.fillRect(x + 3, y + 12, 10, 7);
            ctx.fillRect(x + 35, y + 12, 10, 7);
            // Spike
            ctx.fillStyle = '#484858';
            ctx.fillRect(x + 6, y + 8, 4, 5);
            ctx.fillRect(x + 38, y + 8, 4, 5);
            ctx.fillStyle = '#8080a0';
            ctx.fillRect(x + 7, y + 6, 2, 4);
            ctx.fillRect(x + 39, y + 6, 2, 4);

            // Arms
            ctx.fillStyle = '#1e1e28';
            ctx.fillRect(x + 3, y + 20, 8, 14);
            ctx.fillRect(x + 37, y + 20, 8, 14);
            ctx.fillStyle = '#303040';  // bracer
            ctx.fillRect(x + 3, y + 28, 8, 6);
            ctx.fillRect(x + 37, y + 28, 8, 6);
            // Gauntlets
            ctx.fillStyle = '#28283a';
            ctx.fillRect(x + 2, y + 33, 10, 7);
            ctx.fillRect(x + 36, y + 33, 10, 7);
            ctx.fillStyle = '#484858';
            ctx.fillRect(x + 3, y + 33, 7, 3);
            ctx.fillRect(x + 37, y + 33, 7, 3);

            // Sword (right side)
            ctx.fillStyle = '#6a6880';
            ctx.fillRect(x + 38, y + 20, 4, 24);  // blade
            ctx.fillStyle = '#c0c0e0';
            ctx.fillRect(x + 39, y + 20, 2, 24);  // edge
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(x + 35, y + 19, 10, 3);  // crossguard
            ctx.fillStyle = '#e0c060';
            ctx.fillRect(x + 36, y + 19, 8, 2);
            ctx.fillStyle = '#8a7030';
            ctx.fillRect(x + 39, y + 15, 3, 6);   // grip
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(x + 39, y + 13, 3, 4);   // pommel
            ctx.fillStyle = '#e8d060';
            ctx.fillRect(x + 40, y + 14, 2, 2);

            // Helmet
            ctx.fillStyle = '#181820';
            ctx.fillRect(x + 10, y + 2, 28, 14);
            ctx.fillStyle = '#282830';
            ctx.fillRect(x + 11, y + 2, 26, 12);
            ctx.fillStyle = '#38384a';
            ctx.fillRect(x + 12, y + 2, 24, 8);
            // Visor slit
            ctx.fillStyle = '#0a0810';
            ctx.fillRect(x + 12, y + 10, 24, 4);
            // Red eyes glowing through visor
            ctx.fillStyle = `rgba(255, 30, 10, ${0.8 + pulse * 0.2})`;
            ctx.fillRect(x + 14, y + 11, 6, 2);
            ctx.fillRect(x + 28, y + 11, 6, 2);
            ctx.fillStyle = `rgba(255, 120, 80, ${0.6 + pulse * 0.4})`;
            ctx.fillRect(x + 15, y + 11, 3, 1);
            ctx.fillRect(x + 29, y + 11, 3, 1);
            // Helmet crest
            ctx.fillStyle = '#1a1a22';
            ctx.fillRect(x + 20, y + 0, 8, 4);
            ctx.fillStyle = '#9a1010';
            ctx.fillRect(x + 21, y + 0, 6, 3);
            ctx.fillStyle = '#cc1414';
            ctx.fillRect(x + 22, y + 0, 4, 2);
        }
    };

    // ─── NPC: MERCHANT ───────────────────────────────────────

    const merchant = {
        frames: 1,
        draw(ctx, x, y) {
            shadow(ctx, x + 24, y + 46, 13, 4);

            // Boots
            ctx.fillStyle = '#3a2810';
            ctx.fillRect(x + 13, y + 43, 10, 5);
            ctx.fillRect(x + 25, y + 43, 10, 5);

            // Pants
            ctx.fillStyle = '#3a3020';
            ctx.fillRect(x + 14, y + 33, 9, 12);
            ctx.fillRect(x + 25, y + 33, 9, 12);

            // Apron (over pants)
            ctx.fillStyle = '#d4c090';
            ctx.fillRect(x + 13, y + 28, 22, 14);
            ctx.fillStyle = '#e8d4a8';
            ctx.fillRect(x + 14, y + 29, 20, 11);
            // Apron strings
            ctx.fillStyle = '#c4b080';
            ctx.fillRect(x + 13, y + 28, 2, 14);
            ctx.fillRect(x + 33, y + 28, 2, 14);

            // Shirt
            ctx.fillStyle = '#e8d4a0';
            ctx.fillRect(x + 10, y + 17, 28, 13);
            ctx.fillStyle = '#d4c088';
            ctx.fillRect(x + 11, y + 18, 26, 11);
            // Rolled sleeves
            ctx.fillStyle = '#c8b478';
            ctx.fillRect(x + 5, y + 17, 7, 14);
            ctx.fillRect(x + 36, y + 17, 7, 14);
            ctx.fillStyle = '#d4c488';  // sleeve roll
            ctx.fillRect(x + 5, y + 25, 7, 4);
            ctx.fillRect(x + 36, y + 25, 7, 4);

            // Hands (weathered)
            ctx.fillStyle = '#c07840';
            ctx.fillRect(x + 5, y + 30, 7, 6);
            ctx.fillRect(x + 36, y + 30, 7, 6);

            // Sack of goods (left arm holds it)
            ctx.fillStyle = '#8a6030';
            ctx.fillRect(x + 0, y + 24, 8, 12);
            ctx.fillStyle = '#9a7040';
            ctx.fillRect(x + 1, y + 25, 6, 9);
            ctx.fillStyle = '#6a4820';
            ctx.fillRect(x + 2, y + 24, 4, 3);  // sack tie

            // Belt
            ctx.fillStyle = '#4a3018';
            ctx.fillRect(x + 10, y + 27, 28, 3);
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(x + 21, y + 27, 6, 3);

            // Neck
            ctx.fillStyle = '#d4a060';
            ctx.fillRect(x + 20, y + 13, 8, 5);

            // Hat
            ctx.fillStyle = '#3a2810';
            ctx.fillRect(x + 10, y + 0, 28, 7);  // brim
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(x + 14, y + 0, 20, 7);  // crown base
            ctx.fillRect(x + 16, y + -4, 16, 6); // crown
            ctx.fillStyle = '#c0a040';
            ctx.fillRect(x + 14, y + 7, 20, 2);  // hat band

            // Head
            ctx.fillStyle = '#d4a060';
            ctx.fillRect(x + 14, y + 7, 20, 8);
            ctx.fillStyle = '#c89050';
            ctx.fillRect(x + 14, y + 12, 20, 3);

            // Beard (grey)
            ctx.fillStyle = '#b0a898';
            ctx.fillRect(x + 13, y + 12, 22, 8);
            ctx.fillStyle = '#c8c0b8';
            ctx.fillRect(x + 14, y + 13, 20, 6);
            ctx.fillStyle = '#d8d0c8';
            ctx.fillRect(x + 16, y + 15, 16, 4);

            // Eyes (friendly)
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(x + 17, y + 9, 5, 3);
            ctx.fillRect(x + 26, y + 9, 5, 3);
            ctx.fillStyle = '#5a3810';
            ctx.fillRect(x + 18, y + 9, 3, 2);
            ctx.fillRect(x + 27, y + 9, 3, 2);
            // Smile lines
            ctx.fillStyle = '#a07040';
            ctx.fillRect(x + 15, y + 12, 2, 2);
            ctx.fillRect(x + 31, y + 12, 2, 2);
        }
    };

    // ─── NPC: GUARD ──────────────────────────────────────────

    const guard = {
        frames: 1,
        draw(ctx, x, y) {
            shadow(ctx, x + 24, y + 46, 14, 4);

            // Armored boots
            ctx.fillStyle = '#1e2030';
            ctx.fillRect(x + 12, y + 42, 12, 6);
            ctx.fillRect(x + 24, y + 42, 12, 6);
            ctx.fillStyle = '#2e3044';
            ctx.fillRect(x + 13, y + 42, 8, 3);
            ctx.fillRect(x + 25, y + 42, 8, 3);

            // Greaves
            ctx.fillStyle = '#2a2c40';
            ctx.fillRect(x + 12, y + 32, 12, 12);
            ctx.fillRect(x + 24, y + 32, 12, 12);
            ctx.fillStyle = '#3a3c56';
            ctx.fillRect(x + 13, y + 33, 8, 9);
            ctx.fillRect(x + 25, y + 33, 8, 9);
            ctx.fillStyle = '#4a4e6a';  // highlight
            ctx.fillRect(x + 14, y + 33, 3, 7);
            ctx.fillRect(x + 26, y + 33, 3, 7);

            // Tassets
            ctx.fillStyle = '#24263a';
            ctx.fillRect(x + 10, y + 28, 10, 7);
            ctx.fillRect(x + 28, y + 28, 10, 7);

            // Waist
            ctx.fillStyle = '#1e1a10';
            ctx.fillRect(x + 11, y + 26, 26, 4);
            ctx.fillStyle = '#3a3a28';
            ctx.fillRect(x + 12, y + 27, 24, 3);

            // Chest plate
            ctx.fillStyle = '#2a2c40';
            ctx.fillRect(x + 9, y + 14, 30, 14);
            ctx.fillStyle = '#3a3c56';
            ctx.fillRect(x + 10, y + 14, 28, 12);
            ctx.fillStyle = '#4a4e6a';
            ctx.fillRect(x + 11, y + 14, 14, 10);
            ctx.fillStyle = '#3e4058';
            ctx.fillRect(x + 25, y + 14, 12, 10);
            // Center ridge
            ctx.fillStyle = '#5a5e7a';
            ctx.fillRect(x + 23, y + 14, 2, 12);
            // Chest crest (city emblem)
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 19, y + 16, 10, 8);
            ctx.fillStyle = '#e8c050';
            ctx.fillRect(x + 21, y + 17, 6, 6);
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 23, y + 17, 2, 6);
            ctx.fillRect(x + 21, y + 19, 6, 2);

            // Pauldrons
            ctx.fillStyle = '#24263a';
            ctx.fillRect(x + 3, y + 12, 10, 8);
            ctx.fillRect(x + 35, y + 12, 10, 8);
            ctx.fillStyle = '#3a3c56';
            ctx.fillRect(x + 4, y + 12, 8, 6);
            ctx.fillRect(x + 36, y + 12, 8, 6);
            ctx.fillStyle = '#4a4e6a';
            ctx.fillRect(x + 5, y + 12, 4, 4);
            ctx.fillRect(x + 37, y + 12, 4, 4);

            // Arms
            ctx.fillStyle = '#2a2c40';
            ctx.fillRect(x + 3, y + 18, 8, 14);
            ctx.fillRect(x + 37, y + 18, 8, 14);
            ctx.fillStyle = '#3a3c56';
            ctx.fillRect(x + 4, y + 18, 6, 12);
            ctx.fillRect(x + 38, y + 18, 6, 12);

            // Gauntlets
            ctx.fillStyle = '#24263a';
            ctx.fillRect(x + 3, y + 30, 9, 8);
            ctx.fillRect(x + 36, y + 30, 9, 8);

            // Lance (right side)
            ctx.fillStyle = '#5a4020';
            ctx.fillRect(x + 40, y + 0, 4, 48);
            ctx.fillStyle = '#7a5828';
            ctx.fillRect(x + 41, y + 0, 2, 48);
            ctx.fillStyle = '#c0c8e0';  // spear tip
            ctx.fillRect(x + 39, y + -4, 6, 6);
            ctx.fillStyle = '#e0e8f0';
            ctx.fillRect(x + 40, y + -4, 4, 4);
            ctx.fillStyle = '#a0a8c0';
            ctx.fillRect(x + 41, y + -6, 2, 4);

            // Neck guard
            ctx.fillStyle = '#2a2c40';
            ctx.fillRect(x + 14, y + 10, 20, 6);
            ctx.fillStyle = '#3a3c56';
            ctx.fillRect(x + 15, y + 10, 18, 4);

            // Helmet
            ctx.fillStyle = '#24263a';
            ctx.fillRect(x + 11, y + 0, 26, 12);
            ctx.fillStyle = '#3a3c56';
            ctx.fillRect(x + 12, y + 0, 24, 10);
            ctx.fillStyle = '#4a4e6a';
            ctx.fillRect(x + 13, y + 0, 22, 7);
            ctx.fillStyle = '#5a5e7a';
            ctx.fillRect(x + 14, y + 1, 20, 4);
            // Visor
            ctx.fillStyle = '#18181e';
            ctx.fillRect(x + 13, y + 8, 22, 4);
            // Eye slits
            ctx.fillStyle = '#282830';
            ctx.fillRect(x + 14, y + 9, 8, 2);
            ctx.fillRect(x + 26, y + 9, 8, 2);
            // Crest (plume)
            ctx.fillStyle = '#c02020';
            ctx.fillRect(x + 20, y + -4, 8, 6);
            ctx.fillStyle = '#e02828';
            ctx.fillRect(x + 21, y + -3, 6, 4);
        }
    };

    // ─── NPC: ELDER ──────────────────────────────────────────

    const elder = {
        frames: 1,
        draw(ctx, x, y) {
            shadow(ctx, x + 24, y + 46, 11, 3);

            // Staff (left side)
            ctx.fillStyle = '#4a3818';
            ctx.fillRect(x + 4, y + 0, 4, 48);
            ctx.fillStyle = '#6a5028';
            ctx.fillRect(x + 5, y + 0, 2, 48);
            // Crystal on top
            ctx.fillStyle = '#6080c0';
            ctx.fillRect(x + 3, y + -4, 6, 6);
            ctx.fillStyle = '#80a0e0';
            ctx.fillRect(x + 4, y + -4, 4, 4);
            ctx.fillStyle = '#a0c0ff';
            ctx.fillRect(x + 5, y + -3, 2, 2);
            // Glow rings
            ctx.fillStyle = 'rgba(100, 160, 255, 0.4)';
            ctx.fillRect(x + 2, y + -2, 8, 1);
            ctx.fillRect(x + 2, y + 1, 8, 1);

            // Robe (long, dark blue)
            ctx.fillStyle = '#1a2040';
            ctx.fillRect(x + 12, y + 16, 24, 32);
            ctx.fillStyle = '#20284e';
            ctx.fillRect(x + 13, y + 17, 22, 28);
            ctx.fillStyle = '#2a3260';
            ctx.fillRect(x + 14, y + 17, 10, 26);
            // Golden trim
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 12, y + 16, 24, 2);
            ctx.fillRect(x + 12, y + 16, 2, 32);
            ctx.fillRect(x + 34, y + 16, 2, 32);
            ctx.fillRect(x + 12, y + 46, 24, 2);
            // Runes on robe
            ctx.fillStyle = 'rgba(180, 160, 60, 0.7)';
            ctx.fillRect(x + 18, y + 22, 4, 6);
            ctx.fillRect(x + 26, y + 24, 4, 4);
            ctx.fillRect(x + 20, y + 32, 8, 2);
            ctx.fillRect(x + 22, y + 28, 2, 8);

            // Sleeves
            ctx.fillStyle = '#1a2040';
            ctx.fillRect(x + 6, y + 16, 8, 20);
            ctx.fillRect(x + 34, y + 16, 8, 20);
            // Sleeve trim
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 6, y + 33, 8, 2);
            ctx.fillRect(x + 34, y + 33, 8, 2);

            // Hands
            ctx.fillStyle = '#c89060';
            ctx.fillRect(x + 6, y + 35, 7, 6);
            ctx.fillRect(x + 35, y + 35, 7, 6);

            // Beard (long white)
            ctx.fillStyle = '#e8e4dc';
            ctx.fillRect(x + 13, y + 14, 22, 14);
            ctx.fillStyle = '#f0ece4';
            ctx.fillRect(x + 15, y + 15, 18, 11);
            ctx.fillStyle = '#d8d4cc';
            ctx.fillRect(x + 13, y + 20, 5, 8);
            ctx.fillRect(x + 30, y + 20, 5, 8);
            ctx.fillRect(x + 18, y + 24, 12, 4);

            // Face
            ctx.fillStyle = '#d4a060';
            ctx.fillRect(x + 14, y + 7, 20, 8);
            ctx.fillStyle = '#c89050';
            ctx.fillRect(x + 14, y + 12, 20, 3);
            // Wrinkles
            ctx.fillStyle = '#a87040';
            ctx.fillRect(x + 15, y + 8, 2, 4);
            ctx.fillRect(x + 31, y + 8, 2, 4);
            ctx.fillRect(x + 18, y + 12, 12, 1);

            // Eyes (wise)
            ctx.fillStyle = '#3a2810';
            ctx.fillRect(x + 17, y + 8, 5, 3);
            ctx.fillRect(x + 26, y + 8, 5, 3);
            ctx.fillStyle = '#8040a0';  // purple tint
            ctx.fillRect(x + 18, y + 8, 3, 2);
            ctx.fillRect(x + 27, y + 8, 3, 2);
            // Bushy eyebrows
            ctx.fillStyle = '#e8e4dc';
            ctx.fillRect(x + 16, y + 6, 7, 3);
            ctx.fillRect(x + 25, y + 6, 7, 3);

            // Conical hat
            ctx.fillStyle = '#1a2040';
            ctx.fillRect(x + 10, y + 0, 28, 8);   // brim
            ctx.fillRect(x + 14, y + -8, 20, 10);  // lower crown
            ctx.fillRect(x + 18, y + -14, 12, 8);  // upper crown
            ctx.fillStyle = '#20284e';
            ctx.fillRect(x + 11, y + 1, 26, 5);
            // Golden star
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 22, y + 2, 4, 4);
            ctx.fillRect(x + 20, y + 3, 8, 2);
            ctx.fillStyle = '#e0c040';
            ctx.fillRect(x + 23, y + 3, 2, 2);
        }
    };

    // ─── NPC: SMITH ──────────────────────────────────────────

    const smith = {
        frames: 1,
        draw(ctx, x, y) {
            shadow(ctx, x + 24, y + 46, 15, 4);

            // Heavy boots
            ctx.fillStyle = '#1a1208';
            ctx.fillRect(x + 11, y + 43, 12, 5);
            ctx.fillRect(x + 25, y + 43, 12, 5);

            // Pants (rolled up)
            ctx.fillStyle = '#2a2018';
            ctx.fillRect(x + 13, y + 33, 10, 12);
            ctx.fillRect(x + 25, y + 33, 10, 12);

            // Leather apron
            ctx.fillStyle = '#3a2010';
            ctx.fillRect(x + 12, y + 20, 24, 26);
            ctx.fillStyle = '#4a2c18';
            ctx.fillRect(x + 13, y + 21, 22, 23);
            ctx.fillStyle = '#5a3820';
            ctx.fillRect(x + 14, y + 21, 10, 18);
            // Burn marks
            ctx.fillStyle = '#1a0e08';
            ctx.fillRect(x + 22, y + 30, 6, 4);
            ctx.fillRect(x + 16, y + 38, 4, 3);
            ctx.fillRect(x + 28, y + 35, 5, 3);

            // Shirt
            ctx.fillStyle = '#e0d0b0';
            ctx.fillRect(x + 8, y + 16, 32, 12);
            ctx.fillStyle = '#d0c0a0';
            ctx.fillRect(x + 9, y + 17, 30, 10);
            // Rolled sleeves
            ctx.fillStyle = '#c8b890';
            ctx.fillRect(x + 4, y + 16, 6, 16);
            ctx.fillRect(x + 38, y + 16, 6, 16);
            ctx.fillStyle = '#d8c8a0';
            ctx.fillRect(x + 4, y + 24, 6, 4);
            ctx.fillRect(x + 38, y + 24, 6, 4);

            // Beefy arms
            ctx.fillStyle = '#c87840';
            ctx.fillRect(x + 4, y + 28, 7, 10);
            ctx.fillRect(x + 37, y + 28, 7, 10);
            // Arm muscle definition
            ctx.fillStyle = '#a06030';
            ctx.fillRect(x + 5, y + 30, 3, 6);
            ctx.fillRect(x + 40, y + 30, 3, 6);

            // Hammer (right hand)
            ctx.fillStyle = '#3a3038';  // handle
            ctx.fillRect(x + 42, y + 30, 3, 16);
            ctx.fillStyle = '#585060';  // head
            ctx.fillRect(x + 38, y + 26, 10, 7);
            ctx.fillStyle = '#706880';
            ctx.fillRect(x + 39, y + 26, 8, 5);
            ctx.fillStyle = '#909090';  // face
            ctx.fillRect(x + 38, y + 28, 4, 4);

            // Apron straps
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(x + 16, y + 16, 3, 8);
            ctx.fillRect(x + 29, y + 16, 3, 8);

            // Neck
            ctx.fillStyle = '#c87840';
            ctx.fillRect(x + 19, y + 13, 10, 5);

            // Head
            ctx.fillStyle = '#d08848';
            ctx.fillRect(x + 13, y + 4, 22, 12);
            ctx.fillStyle = '#c07838';
            ctx.fillRect(x + 13, y + 12, 22, 4);
            // Sunburn/ruddiness
            ctx.fillStyle = '#d88848';
            ctx.fillRect(x + 15, y + 6, 8, 4);
            ctx.fillRect(x + 25, y + 6, 8, 4);

            // Short hair
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(x + 13, y + 1, 22, 5);
            ctx.fillStyle = '#3a2810';
            ctx.fillRect(x + 14, y + 2, 20, 3);

            // Soot on face
            ctx.fillStyle = 'rgba(20, 15, 10, 0.5)';
            ctx.fillRect(x + 24, y + 8, 8, 5);
            ctx.fillRect(x + 14, y + 12, 4, 3);

            // Eyes
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(x + 16, y + 7, 5, 3);
            ctx.fillRect(x + 27, y + 7, 5, 3);
            ctx.fillStyle = '#5a3010';
            ctx.fillRect(x + 17, y + 7, 3, 2);
            ctx.fillRect(x + 28, y + 7, 3, 2);

            // Beard stubble
            ctx.fillStyle = '#1a1008';
            ctx.fillRect(x + 14, y + 12, 20, 3);
            ctx.fillStyle = '#3a2010';
            ctx.fillRect(x + 15, y + 13, 18, 2);
        }
    };

    // ─── NPC: MONK ───────────────────────────────────────────

    const monk = {
        frames: 1,
        draw(ctx, x, y) {
            shadow(ctx, x + 24, y + 46, 12, 3);

            // Sandals
            ctx.fillStyle = '#5a3818';
            ctx.fillRect(x + 13, y + 44, 10, 4);
            ctx.fillRect(x + 25, y + 44, 10, 4);
            ctx.fillStyle = '#4a2810';
            ctx.fillRect(x + 14, y + 44, 4, 2);
            ctx.fillRect(x + 26, y + 44, 4, 2);

            // Robe (brown/tan)
            ctx.fillStyle = '#6a5030';
            ctx.fillRect(x + 12, y + 14, 24, 32);
            ctx.fillStyle = '#7a6038';
            ctx.fillRect(x + 13, y + 15, 22, 28);
            ctx.fillStyle = '#8a7040';
            ctx.fillRect(x + 14, y + 15, 10, 24);
            // Center fold
            ctx.fillStyle = '#5a4228';
            ctx.fillRect(x + 23, y + 15, 2, 30);
            // Hem detail
            ctx.fillStyle = '#4a3220';
            ctx.fillRect(x + 12, y + 42, 24, 4);
            ctx.fillStyle = '#5a4228';
            ctx.fillRect(x + 13, y + 43, 22, 2);

            // Hood (down on back)
            ctx.fillStyle = '#5a4228';
            ctx.fillRect(x + 10, y + 12, 28, 10);
            ctx.fillStyle = '#4a3220';
            ctx.fillRect(x + 11, y + 13, 26, 8);

            // Wide sleeves
            ctx.fillStyle = '#6a5030';
            ctx.fillRect(x + 4, y + 14, 10, 20);
            ctx.fillRect(x + 34, y + 14, 10, 20);
            ctx.fillStyle = '#7a6038';
            ctx.fillRect(x + 5, y + 15, 8, 17);
            ctx.fillRect(x + 35, y + 15, 8, 17);

            // Praying hands (inside sleeves, barely visible)
            ctx.fillStyle = '#d4a060';
            ctx.fillRect(x + 16, y + 30, 16, 6);
            ctx.fillRect(x + 17, y + 28, 14, 5);
            ctx.fillStyle = '#c49050';
            ctx.fillRect(x + 18, y + 28, 12, 4);
            // Fingers
            ctx.fillStyle = '#d4a060';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(x + 17 + i * 3, y + 26, 2, 3);
            }

            // Rope belt
            ctx.fillStyle = '#8a7030';
            ctx.fillRect(x + 11, y + 27, 26, 3);
            ctx.fillStyle = '#a09040';
            ctx.fillRect(x + 12, y + 27, 22, 2);
            // Knot
            ctx.fillStyle = '#7a6028';
            ctx.fillRect(x + 22, y + 26, 4, 6);

            // Neck
            ctx.fillStyle = '#d4a060';
            ctx.fillRect(x + 20, y + 11, 8, 4);

            // Face (serene)
            ctx.fillStyle = '#d4a060';
            ctx.fillRect(x + 14, y + 4, 20, 10);
            ctx.fillStyle = '#c49050';
            ctx.fillRect(x + 14, y + 11, 20, 3);

            // Eyes (closed/downcast)
            ctx.fillStyle = '#1e1408';
            ctx.fillRect(x + 17, y + 7, 6, 2);
            ctx.fillRect(x + 25, y + 7, 6, 2);
            // Eyelashes hint
            ctx.fillStyle = '#2e2010';
            ctx.fillRect(x + 17, y + 8, 6, 1);
            ctx.fillRect(x + 25, y + 8, 6, 1);

            // Gentle mouth
            ctx.fillStyle = '#a07040';
            ctx.fillRect(x + 20, y + 11, 8, 2);

            // Shaved head
            ctx.fillStyle = '#c8a060';
            ctx.fillRect(x + 14, y + 1, 20, 5);
            ctx.fillStyle = '#b89050';
            ctx.fillRect(x + 14, y + 3, 3, 2);

            // Beads (prayer)
            ctx.fillStyle = '#8a6020';
            ctx.fillRect(x + 8, y + 20, 3, 3);
            ctx.fillRect(x + 8, y + 25, 3, 3);
            ctx.fillRect(x + 8, y + 30, 3, 3);
        }
    };

    // ─── ITEMS ───────────────────────────────────────────────

    const potion_health = {
        frames: 1,
        draw(ctx, x, y) {
            // Glow
            ctx.fillStyle = 'rgba(200, 40, 40, 0.2)';
            ctx.beginPath();
            ctx.arc(x + 24, y + 30, 14, 0, Math.PI * 2);
            ctx.fill();

            // Shadow
            shadow(ctx, x + 24, y + 44, 8, 3);

            // Stopper / cork
            ctx.fillStyle = '#5a3818';
            ctx.fillRect(x + 19, y + 12, 10, 5);
            ctx.fillStyle = '#6a4820';
            ctx.fillRect(x + 20, y + 12, 8, 4);
            ctx.fillStyle = '#4a2810';
            ctx.fillRect(x + 20, y + 15, 8, 2);  // cork bottom

            // Neck
            ctx.fillStyle = '#c0b0a0';
            ctx.fillRect(x + 20, y + 16, 8, 5);
            ctx.fillStyle = '#a09080';
            ctx.fillRect(x + 20, y + 19, 8, 2);

            // Flask body
            ctx.fillStyle = '#a09080';
            ctx.fillRect(x + 14, y + 20, 20, 22);
            ctx.fillStyle = '#c0b0a0';
            ctx.fillRect(x + 15, y + 20, 18, 20);

            // Liquid (red)
            ctx.fillStyle = '#aa1818';
            ctx.fillRect(x + 15, y + 22, 18, 18);
            ctx.fillStyle = '#cc2020';
            ctx.fillRect(x + 16, y + 22, 16, 14);
            ctx.fillStyle = '#ee3030';
            ctx.fillRect(x + 17, y + 22, 10, 10);
            // Sparkle / highlight
            ctx.fillStyle = '#ff8080';
            ctx.fillRect(x + 18, y + 23, 4, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 19, y + 24, 2, 2);

            // Flask highlight (glass)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(x + 15, y + 20, 4, 18);
            ctx.fillRect(x + 15, y + 20, 18, 3);

            // Base
            ctx.fillStyle = '#a09080';
            ctx.fillRect(x + 14, y + 40, 20, 4);
            ctx.fillStyle = '#888070';
            ctx.fillRect(x + 13, y + 42, 22, 3);

            // Label stripe
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(x + 15, y + 30, 18, 6);
            ctx.fillStyle = '#cc2020';
            ctx.fillRect(x + 18, y + 31, 12, 4);
            ctx.fillStyle = '#ee4040';
            ctx.fillRect(x + 20, y + 32, 8, 2);
        }
    };

    const potion_mana = {
        frames: 1,
        draw(ctx, x, y) {
            // Glow
            ctx.fillStyle = 'rgba(40, 80, 200, 0.2)';
            ctx.beginPath();
            ctx.arc(x + 24, y + 30, 14, 0, Math.PI * 2);
            ctx.fill();

            shadow(ctx, x + 24, y + 44, 8, 3);

            // Stopper
            ctx.fillStyle = '#1a2040';
            ctx.fillRect(x + 19, y + 12, 10, 5);
            ctx.fillStyle = '#2a3050';
            ctx.fillRect(x + 20, y + 12, 8, 4);

            // Neck
            ctx.fillStyle = '#9090b0';
            ctx.fillRect(x + 20, y + 16, 8, 5);
            ctx.fillStyle = '#8080a0';
            ctx.fillRect(x + 20, y + 19, 8, 2);

            // Flask body
            ctx.fillStyle = '#8090b0';
            ctx.fillRect(x + 14, y + 20, 20, 22);
            ctx.fillStyle = '#90a0c0';
            ctx.fillRect(x + 15, y + 20, 18, 20);

            // Liquid (blue)
            ctx.fillStyle = '#1830a0';
            ctx.fillRect(x + 15, y + 22, 18, 18);
            ctx.fillStyle = '#2040c0';
            ctx.fillRect(x + 16, y + 22, 16, 14);
            ctx.fillStyle = '#3050e0';
            ctx.fillRect(x + 17, y + 22, 10, 10);
            ctx.fillStyle = '#6080ff';
            ctx.fillRect(x + 18, y + 23, 4, 4);
            ctx.fillStyle = '#a0c0ff';
            ctx.fillRect(x + 19, y + 24, 2, 2);

            // Glass highlight
            ctx.fillStyle = 'rgba(200, 220, 255, 0.35)';
            ctx.fillRect(x + 15, y + 20, 4, 18);
            ctx.fillRect(x + 15, y + 20, 18, 3);

            // Base
            ctx.fillStyle = '#8090b0';
            ctx.fillRect(x + 14, y + 40, 20, 4);
            ctx.fillStyle = '#6878a0';
            ctx.fillRect(x + 13, y + 42, 22, 3);

            // Label
            ctx.fillStyle = 'rgba(180, 200, 255, 0.15)';
            ctx.fillRect(x + 15, y + 30, 18, 6);
            ctx.fillStyle = '#3050d0';
            ctx.fillRect(x + 18, y + 31, 12, 4);
            ctx.fillStyle = '#5070f0';
            ctx.fillRect(x + 20, y + 32, 8, 2);
        }
    };

    const sword = {
        frames: 1,
        draw(ctx, x, y) {
            shadow(ctx, x + 24, y + 44, 10, 3);

            // Blade (pointing up-right, diagonal)
            ctx.fillStyle = '#a0a8c0';
            ctx.fillRect(x + 26, y + 2, 6, 36);
            ctx.fillStyle = '#c0c8e0';
            ctx.fillRect(x + 27, y + 2, 4, 34);
            ctx.fillStyle = '#e0e8f8';  // edge
            ctx.fillRect(x + 28, y + 2, 2, 32);
            ctx.fillStyle = '#f0f8ff';  // sharpest edge line
            ctx.fillRect(x + 29, y + 2, 1, 30);

            // Blood groove
            ctx.fillStyle = '#8890a8';
            ctx.fillRect(x + 27, y + 6, 1, 26);

            // Tip
            ctx.fillStyle = '#d0d8f0';
            ctx.fillRect(x + 27, y + 0, 4, 4);
            ctx.fillStyle = '#e8f0ff';
            ctx.fillRect(x + 28, y + 0, 2, 3);
            ctx.fillStyle = '#f8ffff';
            ctx.fillRect(x + 29, y + 0, 1, 2);

            // Crossguard
            ctx.fillStyle = '#9a8020';
            ctx.fillRect(x + 16, y + 36, 24, 5);
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 17, y + 36, 22, 4);
            ctx.fillStyle = '#e0c040';
            ctx.fillRect(x + 18, y + 36, 20, 2);
            // Guard tips
            ctx.fillStyle = '#b09028';
            ctx.fillRect(x + 16, y + 35, 5, 7);
            ctx.fillRect(x + 35, y + 35, 5, 7);
            ctx.fillStyle = '#d0b038';
            ctx.fillRect(x + 17, y + 36, 3, 5);
            ctx.fillRect(x + 36, y + 36, 3, 5);

            // Grip (wrapped leather)
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(x + 24, y + 40, 8, 6);
            ctx.fillStyle = '#3a2410';
            ctx.fillRect(x + 24, y + 40, 8, 5);
            // Wrap lines
            ctx.fillStyle = '#1e1208';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(x + 24, y + 40 + i * 2, 8, 1);
            }

            // Pommel
            ctx.fillStyle = '#9a8020';
            ctx.fillRect(x + 22, y + 44, 12, 4);
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 23, y + 44, 10, 3);
            ctx.fillStyle = '#e0c040';
            ctx.fillRect(x + 25, y + 44, 6, 2);
            ctx.fillStyle = '#f0d848';
            ctx.fillRect(x + 27, y + 45, 2, 1);
        }
    };

    const key = {
        frames: 1,
        draw(ctx, x, y) {
            shadow(ctx, x + 24, y + 44, 9, 3);

            // Key ring (bow)
            ctx.fillStyle = '#8a7020';
            ctx.fillRect(x + 14, y + 8, 20, 20);
            ctx.fillStyle = '#0a0808';
            ctx.fillRect(x + 17, y + 11, 14, 14);  // hole
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 15, y + 8, 18, 4);    // top
            ctx.fillRect(x + 15, y + 26, 18, 4);   // bottom
            ctx.fillRect(x + 14, y + 10, 4, 16);   // left
            ctx.fillRect(x + 30, y + 10, 4, 16);   // right

            // Decorative gems on bow
            ctx.fillStyle = '#6030a0';
            ctx.fillRect(x + 21, y + 10, 6, 4);
            ctx.fillStyle = '#8050c0';
            ctx.fillRect(x + 22, y + 10, 4, 3);
            ctx.fillStyle = '#a070e0';
            ctx.fillRect(x + 23, y + 11, 2, 2);

            // Shaft
            ctx.fillStyle = '#9a8028';
            ctx.fillRect(x + 22, y + 30, 6, 16);
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 23, y + 30, 4, 15);
            ctx.fillStyle = '#d0b038';
            ctx.fillRect(x + 24, y + 30, 2, 14);

            // Teeth (bit)
            ctx.fillStyle = '#9a8028';
            ctx.fillRect(x + 28, y + 36, 6, 4);
            ctx.fillRect(x + 28, y + 42, 6, 4);
            ctx.fillStyle = '#c0a030';
            ctx.fillRect(x + 28, y + 36, 5, 3);
            ctx.fillRect(x + 28, y + 42, 5, 3);

            // Highlight
            ctx.fillStyle = '#e8d060';
            ctx.fillRect(x + 16, y + 9, 8, 2);
            ctx.fillRect(x + 14, y + 11, 2, 6);
        }
    };

    const chest = {
        frames: 2,  // 0 = closed, 1 = open
        draw(ctx, x, y, frame) {
            shadow(ctx, x + 24, y + 46, 16, 4);

            const isOpen = frame === 1;

            // Base (bottom)
            ctx.fillStyle = '#3a2010';
            ctx.fillRect(x + 8, y + 30, 32, 16);
            ctx.fillStyle = '#4a2c18';
            ctx.fillRect(x + 9, y + 31, 30, 14);
            // Wood planks
            ctx.fillStyle = '#3a2010';
            ctx.fillRect(x + 9, y + 37, 30, 1);
            ctx.fillRect(x + 9, y + 41, 30, 1);
            // Vertical struts
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(x + 9, y + 30, 2, 16);
            ctx.fillRect(x + 37, y + 30, 2, 16);
            ctx.fillRect(x + 22, y + 30, 2, 16);

            // Metal bands (base)
            ctx.fillStyle = '#6a6030';
            ctx.fillRect(x + 8, y + 30, 32, 3);
            ctx.fillRect(x + 8, y + 43, 32, 3);
            ctx.fillStyle = '#9a9040';
            ctx.fillRect(x + 8, y + 30, 32, 2);
            ctx.fillRect(x + 8, y + 43, 32, 2);
            // Rivets
            ctx.fillStyle = '#c0b050';
            for (let i = 0; i < 5; i++) {
                ctx.fillRect(x + 10 + i * 7, y + 30, 2, 2);
                ctx.fillRect(x + 10 + i * 7, y + 43, 2, 2);
            }

            // Lid
            if (!isOpen) {
                // Closed lid
                ctx.fillStyle = '#3a2010';
                ctx.fillRect(x + 8, y + 16, 32, 16);
                ctx.fillStyle = '#4a2c18';
                ctx.fillRect(x + 9, y + 17, 30, 14);
                ctx.fillStyle = '#5a3820';
                ctx.fillRect(x + 10, y + 17, 14, 12);
                // Lid planks
                ctx.fillStyle = '#3a2010';
                ctx.fillRect(x + 9, y + 23, 30, 1);
                // Vertical struts lid
                ctx.fillStyle = '#2a1808';
                ctx.fillRect(x + 9, y + 16, 2, 16);
                ctx.fillRect(x + 37, y + 16, 2, 16);
                ctx.fillRect(x + 22, y + 16, 2, 16);
                // Metal band top
                ctx.fillStyle = '#6a6030';
                ctx.fillRect(x + 8, y + 16, 32, 3);
                ctx.fillStyle = '#9a9040';
                ctx.fillRect(x + 8, y + 16, 32, 2);
                ctx.fillStyle = '#c0b050';
                for (let i = 0; i < 5; i++) {
                    ctx.fillRect(x + 10 + i * 7, y + 16, 2, 2);
                }
                // Lock hasp
                ctx.fillStyle = '#8a7828';
                ctx.fillRect(x + 19, y + 28, 10, 5);
                ctx.fillStyle = '#c0a830';
                ctx.fillRect(x + 20, y + 28, 8, 4);
                // Lock
                ctx.fillStyle = '#6a5820';
                ctx.fillRect(x + 21, y + 26, 6, 5);
                ctx.fillStyle = '#9a8030';
                ctx.fillRect(x + 22, y + 26, 4, 4);
                ctx.fillStyle = '#b09038';
                ctx.fillRect(x + 23, y + 26, 2, 3);
                // Keyhole
                ctx.fillStyle = '#1a1008';
                ctx.fillRect(x + 23, y + 27, 2, 3);
                ctx.fillRect(x + 22, y + 29, 4, 1);
            } else {
                // Open lid (tilted back)
                ctx.fillStyle = '#3a2010';
                ctx.fillRect(x + 8, y + 6, 32, 10);
                ctx.fillStyle = '#4a2c18';
                ctx.fillRect(x + 9, y + 6, 30, 9);
                ctx.fillStyle = '#2a1808';
                ctx.fillRect(x + 9, y + 6, 2, 10);
                ctx.fillRect(x + 37, y + 6, 2, 10);
                // Hinge
                ctx.fillStyle = '#8a7828';
                ctx.fillRect(x + 8, y + 15, 32, 3);
                ctx.fillStyle = '#c0a830';
                ctx.fillRect(x + 8, y + 15, 32, 2);

                // Inside of chest (dark with glow)
                ctx.fillStyle = '#140e06';
                ctx.fillRect(x + 9, y + 17, 30, 13);
                // Treasure glow
                ctx.fillStyle = 'rgba(200, 160, 30, 0.4)';
                ctx.fillRect(x + 10, y + 18, 28, 11);
                ctx.fillStyle = 'rgba(240, 200, 50, 0.2)';
                ctx.fillRect(x + 12, y + 19, 24, 8);
                // Gold coins visible
                ctx.fillStyle = '#c0a030';
                ctx.fillRect(x + 14, y + 22, 6, 4);
                ctx.fillRect(x + 22, y + 20, 8, 4);
                ctx.fillRect(x + 32, y + 22, 4, 4);
                ctx.fillStyle = '#e0c040';
                ctx.fillRect(x + 15, y + 22, 4, 3);
                ctx.fillRect(x + 23, y + 20, 6, 3);

                // Lock (open, hanging)
                ctx.fillStyle = '#9a8030';
                ctx.fillRect(x + 38, y + 28, 6, 5);
                ctx.fillStyle = '#c0a040';
                ctx.fillRect(x + 39, y + 28, 4, 4);
            }
        }
    };

    // ─── PUBLIC API ──────────────────────────────────────────

    const lib = {
        player_down,
        player_up,
        player_left,
        player_right,
        wolf,
        bandit,
        undead,
        spirit,
        boss_guardian,
        merchant,
        guard,
        elder,
        smith,
        monk,
        potion_health,
        potion_mana,
        sword,
        key,
        chest,
    };

    // Convenience: render by name
    lib.draw = function(name, ctx, x, y, frame = 0) {
        const s = lib[name];
        if (!s) return false;
        s.draw(ctx, x, y, frame);
        return true;
    };

    lib.has = function(name) { return name in lib && typeof lib[name].draw === 'function'; };

    return lib;
})();

console.log('[SPRITES_48] Loaded:', Object.keys(SPRITES_48).filter(k => typeof SPRITES_48[k] === 'object').length, 'sprites');
