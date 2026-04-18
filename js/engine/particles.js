/*************************************************************
 * particles.js — Particle System (HD)
 * All sizes scale with CONFIG.TILE (48 = 3× the legacy 16px tile).
 *************************************************************/

const Particles = (function() {

    // Scale factor relative to old 16-px tile baseline
    const SC = (typeof CONFIG !== 'undefined' ? CONFIG.TILE : 48) / 16;

    // ── POOL ──────────────────────────────────────────────────────
    const MAX_PARTICLES = 1200;
    const pool   = [];
    const active = [];

    for (let i = 0; i < MAX_PARTICLES; i++) pool.push(_makeParticle());

    function _makeParticle() {
        return {
            active: false,
            x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0,
            life: 0, maxLife: 1,
            size: 2, sizeEnd: 0,
            color: '#ffffff', colorEnd: null,
            alpha: 1, alphaEnd: 0,
            rotation: 0, rotationSpeed: 0,
            gravity: 0, friction: 1,
            shape: 'square',   // square|circle|spark|ring|line
            trail: false, trailLength: 5, trailPositions: []
        };
    }

    function _get() {
        for (let i = 0; i < pool.length; i++) {
            if (!pool[i].active) return pool[i];
        }
        return active.length > 0 ? active.shift() : null;
    }

    // ── FOOTPRINTS (separate lightweight layer) ───────────────────
    const footprints = [];    // { x, y, alpha, color, w, h, angle }
    const FP_MAX = 80;
    const FP_LIFE = 3.5;      // seconds before fully faded

    function _addFootprint(x, y, color, w, h, angle) {
        if (footprints.length >= FP_MAX) footprints.shift();
        footprints.push({ x, y, color, w: w || 6 * SC, h: h || 3 * SC, angle: angle || 0, alpha: 0.45, life: FP_LIFE });
    }

    // ── EMIT ──────────────────────────────────────────────────────
    function emit(cfg) {
        const count = cfg.count || 1;
        for (let i = 0; i < count; i++) {
            const p = _get();
            if (!p) continue;

            p.x = cfg.x + (cfg.spreadX || 0) * (Math.random() - 0.5);
            p.y = cfg.y + (cfg.spreadY || 0) * (Math.random() - 0.5);

            const speed    = (cfg.speed    || 50) + (cfg.speedVariance    || 0) * (Math.random() - 0.5);
            const angle    = (cfg.angle    || 0)  + (cfg.angleVariance    || Math.PI * 2) * (Math.random() - 0.5);
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;

            p.ax = cfg.ax || 0;
            p.ay = cfg.ay || 0;

            p.maxLife = (cfg.life || 1) + (cfg.lifeVariance || 0) * (Math.random() - 0.5);
            p.life    = p.maxLife;

            p.size    = cfg.size    !== undefined ? cfg.size    : 3;
            p.sizeEnd = cfg.sizeEnd !== undefined ? cfg.sizeEnd : 0;

            p.color    = cfg.color    || '#ffffff';
            p.colorEnd = cfg.colorEnd || null;

            p.alpha    = cfg.alpha    !== undefined ? cfg.alpha    : 1;
            p.alphaEnd = cfg.alphaEnd !== undefined ? cfg.alphaEnd : 0;

            p.gravity  = cfg.gravity  || 0;
            p.friction = cfg.friction !== undefined ? cfg.friction : 1;

            p.rotation      = cfg.rotation      || 0;
            p.rotationSpeed = cfg.rotationSpeed || 0;

            p.shape = cfg.shape || 'square';

            p.trail          = cfg.trail       || false;
            p.trailLength    = cfg.trailLength || 5;
            p.trailPositions = [];

            p.active = true;
            active.push(p);
        }
    }

    // ── PRESETS ───────────────────────────────────────────────────
    const presets = {

        // ── Blood (improved: drops + big splashes) ─────────────
        blood: function(x, y, direction = 0) {
            // Fast droplets
            emit({
                x, y, count: 10,
                speed: 100 * SC, speedVariance: 60 * SC,
                angle: direction, angleVariance: 0.9,
                life: 0.55, lifeVariance: 0.2,
                size: 4 * SC, sizeEnd: 1.5 * SC,
                color: '#aa1818', colorEnd: '#5a0c0c',
                gravity: 280 * SC, friction: 0.97,
                shape: 'circle'
            });
            // Big splat blobs
            emit({
                x, y, count: 4,
                speed: 40 * SC, speedVariance: 20 * SC,
                angle: direction, angleVariance: 0.5,
                life: 0.3, lifeVariance: 0.1,
                size: 7 * SC, sizeEnd: 2 * SC,
                color: '#881010',
                gravity: 120 * SC, friction: 0.9,
                shape: 'circle', alpha: 0.85, alphaEnd: 0
            });
        },

        // ── Dust cloud (footstep walking) ──────────────────────
        dustCloud: function(x, y) {
            emit({
                x: x + 12 * SC, y: y + 36 * SC,
                spreadX: 16 * SC,
                count: 6,
                speed: 18 * SC, speedVariance: 10 * SC,
                angle: -Math.PI / 2, angleVariance: 1.2,
                life: 0.55, lifeVariance: 0.15,
                size: 3 * SC, sizeEnd: 6 * SC,
                color: '#8a7a60', alpha: 0.55, alphaEnd: 0,
                gravity: -18 * SC,
                shape: 'circle'
            });
        },

        // ── Legacy dust (kept for compatibility) ───────────────
        dust: function(x, y) { presets.dustCloud(x, y); },

        // ── Footprint marks on dirt / grass ───────────────────
        footprint: function(x, y, facing = 'down', tileType = 'stone') {
            const colors = { dirt: '#7a6a4a', grass: '#5a7a4a', sand: '#a89a60', stone: '#6a6a6a', water: '#4a6a8a' };
            const col = colors[tileType] || colors.stone;
            const ox  = x + 18 * SC;
            const oy  = y + 38 * SC;
            const ang = facing === 'left' || facing === 'right' ? Math.PI / 2 : 0;
            _addFootprint(ox - 5 * SC, oy, col, 5 * SC, 3 * SC, ang);
            _addFootprint(ox + 5 * SC, oy - 2 * SC, col, 5 * SC, 3 * SC, ang);
        },

        // ── Water ripple ───────────────────────────────────────
        waterRipple: function(x, y) {
            // Expanding ring
            emit({
                x: x + 24 * SC, y: y + 36 * SC,
                count: 1,
                speed: 0,
                life: 0.7,
                size: 4 * SC, sizeEnd: 32 * SC,
                color: '#88bbdd', alpha: 0.55, alphaEnd: 0,
                shape: 'ring'
            });
            // Small droplets
            emit({
                x: x + 24 * SC, y: y + 36 * SC,
                count: 5,
                speed: 40 * SC, speedVariance: 20 * SC,
                angle: -Math.PI / 2, angleVariance: Math.PI,
                life: 0.35,
                size: 2 * SC, sizeEnd: 0,
                color: '#aaccee', alpha: 0.7, alphaEnd: 0,
                gravity: 80 * SC,
                shape: 'circle'
            });
        },

        // ── Legacy splash ──────────────────────────────────────
        splash: function(x, y) { presets.waterRipple(x, y); },

        // ── Torch flicker ──────────────────────────────────────
        torchFlicker: function(x, y) {
            // Inner flame
            emit({
                x: x + 24 * SC, y: y + 20 * SC,
                spreadX: 6 * SC,
                count: 2,
                speed: 50 * SC, speedVariance: 20 * SC,
                angle: -Math.PI / 2, angleVariance: 0.5,
                life: 0.4, lifeVariance: 0.15,
                size: 5 * SC, sizeEnd: 1 * SC,
                color: '#ffcc22', colorEnd: '#ff4400',
                alpha: 0.9, alphaEnd: 0,
                gravity: -100 * SC,
                shape: 'circle'
            });
            // Embers
            emit({
                x: x + 24 * SC, y: y + 18 * SC,
                spreadX: 4 * SC,
                count: 1,
                speed: 60 * SC, speedVariance: 30 * SC,
                angle: -Math.PI / 2, angleVariance: 0.8,
                life: 0.6,
                size: 2 * SC, sizeEnd: 0,
                color: '#ffaa00',
                alpha: 1, alphaEnd: 0,
                gravity: -30 * SC,
                shape: 'spark', trail: true, trailLength: 4
            });
        },

        // ── Magic item sparkles ────────────────────────────────
        magicItem: function(x, y, color = '#88aaff') {
            const cx = x + 24 * SC;
            const cy = y + 24 * SC;
            const r  = 18 * SC;
            for (let i = 0; i < 4; i++) {
                const a = (Math.PI * 2 * i / 4) + performance.now() * 0.002;
                emit({
                    x: cx + Math.cos(a) * r,
                    y: cy + Math.sin(a) * r,
                    count: 1,
                    speed: 12 * SC, speedVariance: 6 * SC,
                    angle: -Math.PI / 2, angleVariance: Math.PI,
                    life: 0.7,
                    size: 2.5 * SC, sizeEnd: 0,
                    color, alpha: 0.9, alphaEnd: 0,
                    gravity: -20 * SC,
                    shape: 'circle'
                });
            }
        },

        // ── Legacy magic ───────────────────────────────────────
        magic: function(x, y, color = '#88aaff') { presets.magicItem(x, y, color); },

        // ── Sparks (metal hit) ─────────────────────────────────
        sparks: function(x, y, direction = 0) {
            emit({
                x, y, count: 10,
                speed: 160 * SC, speedVariance: 80 * SC,
                angle: direction, angleVariance: 0.7,
                life: 0.35, lifeVariance: 0.15,
                size: 2.5 * SC, sizeEnd: 0,
                color: '#ffdd44', colorEnd: '#ff6600',
                gravity: 200 * SC, friction: 0.95,
                shape: 'spark', trail: true, trailLength: 5
            });
        },

        // ── Shockwave ring (impact) ────────────────────────────
        shockwave: function(x, y) {
            emit({
                x, y, count: 1,
                speed: 0,
                life: 0.35,
                size: 6 * SC, sizeEnd: 56 * SC,
                color: '#ffffff', alpha: 0.6, alphaEnd: 0,
                shape: 'ring'
            });
            // Outer slower ring
            emit({
                x, y, count: 1,
                speed: 0,
                life: 0.5,
                size: 4 * SC, sizeEnd: 80 * SC,
                color: '#aaaaff', alpha: 0.3, alphaEnd: 0,
                shape: 'ring'
            });
        },

        // ── Slash trail ────────────────────────────────────────
        slashTrail: function(x, y, dx, dy) {
            const steps = 8;
            for (let i = 0; i <= steps; i++) {
                const t  = i / steps;
                const px = x + dx * t;
                const py = y + dy * t;
                emit({
                    x: px, y: py,
                    count: 1,
                    speed: 20 * SC, speedVariance: 10 * SC,
                    angle: Math.atan2(dy, dx) - Math.PI / 2,
                    angleVariance: 0.4,
                    life: 0.25,
                    size: (5 - 3 * t) * SC, sizeEnd: 0,
                    color: t < 0.5 ? '#ffffff' : '#88ccff',
                    alpha: 1 - t * 0.5, alphaEnd: 0,
                    shape: 'spark', trail: true, trailLength: 3
                });
            }
        },

        // ── Enemy death dissolve ───────────────────────────────
        enemyDissolve: function(x, y, color = '#886644') {
            // Main chunk burst
            emit({
                x: x + 24 * SC, y: y + 24 * SC,
                spreadX: 30 * SC, spreadY: 30 * SC,
                count: 22,
                speed: 60 * SC, speedVariance: 40 * SC,
                angle: 0, angleVariance: Math.PI,
                life: 1.1, lifeVariance: 0.5,
                size: 4 * SC, sizeEnd: 0,
                color, alpha: 0.9, alphaEnd: 0,
                gravity: 40 * SC, friction: 0.97,
                shape: 'square'
            });
            // Fine dust overlay
            emit({
                x: x + 24 * SC, y: y + 24 * SC,
                spreadX: 20 * SC, spreadY: 20 * SC,
                count: 14,
                speed: 30 * SC, speedVariance: 15 * SC,
                angle: -Math.PI / 2, angleVariance: Math.PI,
                life: 1.5,
                size: 2 * SC, sizeEnd: 4 * SC,
                color: '#bbaa88', alpha: 0.5, alphaEnd: 0,
                gravity: -15 * SC,
                shape: 'circle'
            });
            // Shockwave
            presets.shockwave(x + 24 * SC, y + 24 * SC);
        },

        // ── Legacy dissolve ────────────────────────────────────
        dissolve: function(x, y, color = '#666666') { presets.enemyDissolve(x, y, color); },

        // ── Fire ───────────────────────────────────────────────
        fire: function(x, y) {
            emit({
                x, y, spreadX: 5 * SC, count: 3,
                speed: 50 * SC, speedVariance: 25 * SC,
                angle: -Math.PI / 2, angleVariance: 0.45,
                life: 0.55, lifeVariance: 0.2,
                size: 5 * SC, sizeEnd: 1.5 * SC,
                color: '#ff7700', colorEnd: '#ff2200',
                alpha: 0.85, alphaEnd: 0,
                gravity: -100 * SC, shape: 'circle'
            });
            emit({
                x, y: y - 10 * SC, spreadX: 3 * SC, count: 1,
                speed: 25 * SC,
                angle: -Math.PI / 2, angleVariance: 0.3,
                life: 0.9,
                size: 4 * SC, sizeEnd: 8 * SC,
                color: '#444444', alpha: 0.3, alphaEnd: 0,
                gravity: -50 * SC, shape: 'circle'
            });
        },

        // ── Smoke ──────────────────────────────────────────────
        smoke: function(x, y) {
            emit({
                x, y, count: 4,
                speed: 30 * SC, speedVariance: 15 * SC,
                angle: -Math.PI / 2, angleVariance: 0.8,
                life: 1.2, lifeVariance: 0.3,
                size: 4 * SC, sizeEnd: 10 * SC,
                color: '#555555', alpha: 0.4, alphaEnd: 0,
                gravity: -25 * SC, shape: 'circle'
            });
        },

        // ── Heal ───────────────────────────────────────────────
        heal: function(x, y) {
            emit({
                x, y, spreadX: 12 * SC, spreadY: 12 * SC,
                count: 12,
                speed: 50 * SC,
                angle: -Math.PI / 2, angleVariance: 0.6,
                life: 0.9,
                size: 3.5 * SC, sizeEnd: 0,
                color: '#44ff66', alpha: 0.85, alphaEnd: 0,
                gravity: -80 * SC, shape: 'circle'
            });
            // Ring burst
            presets.shockwave(x, y - 12 * SC);
        },

        // ── Level up ───────────────────────────────────────────
        levelUp: function(x, y) {
            emit({
                x, y, count: 28,
                speed: 130 * SC, speedVariance: 60 * SC,
                angle: 0, angleVariance: Math.PI,
                life: 0.7, lifeVariance: 0.25,
                size: 4 * SC, sizeEnd: 0,
                color: '#ffff44', colorEnd: '#ffaa00',
                alpha: 1, alphaEnd: 0,
                gravity: 60 * SC, friction: 0.97, shape: 'circle'
            });
            emit({
                x, y, count: 1, speed: 0,
                life: 0.5,
                size: 5 * SC, sizeEnd: 90 * SC,
                color: '#ffff88', alpha: 0.4, alphaEnd: 0,
                shape: 'ring'
            });
        },

        // ── Footstep (walking) ────────────────────────────────
        footstep: function(x, y, tileType = 'stone', facing = 'down') {
            if (tileType === 'water') {
                presets.waterRipple(x, y);
            } else {
                presets.dustCloud(x, y);
                // Every 2nd step emit footprint (caller should track parity)
                presets.footprint(x, y, facing, tileType);
            }
        },

        // ── Explosion ─────────────────────────────────────────
        explosion: function(x, y) {
            // Fire burst
            emit({
                x, y, spreadX: 12 * SC, spreadY: 12 * SC, count: 18,
                speed: 140 * SC, speedVariance: 70 * SC,
                angle: 0, angleVariance: Math.PI,
                life: 0.6, lifeVariance: 0.3,
                size: 6 * SC, sizeEnd: 0,
                color: '#ff8800', colorEnd: '#ff2200',
                alpha: 1, alphaEnd: 0,
                gravity: -30 * SC, friction: 0.96, shape: 'circle'
            });
            // Debris chunks
            emit({
                x, y, spreadX: 8 * SC, spreadY: 8 * SC, count: 10,
                speed: 100 * SC, speedVariance: 50 * SC,
                angle: 0, angleVariance: Math.PI,
                life: 0.8, lifeVariance: 0.3,
                size: 4 * SC, sizeEnd: 0,
                color: '#886633', alpha: 0.9, alphaEnd: 0,
                gravity: 100 * SC, friction: 0.95, shape: 'square'
            });
            // Shockwave ring
            presets.shockwave(x, y);
        },

        // ── Impact (general hit) ──────────────────────────────
        impact: function(x, y, color = '#ffffff') {
            emit({
                x, y, count: 10,
                speed: 80 * SC, speedVariance: 40 * SC,
                angle: 0, angleVariance: Math.PI,
                life: 0.25,
                size: 3 * SC, sizeEnd: 0,
                color, alpha: 1, alphaEnd: 0,
                friction: 0.9, shape: 'square'
            });
            presets.shockwave(x, y);
        }
    };

    // ── UPDATE ────────────────────────────────────────────────────
    function update(dt) {
        // Footprints
        for (let i = footprints.length - 1; i >= 0; i--) {
            footprints[i].life -= dt;
            footprints[i].alpha = Math.max(0, footprints[i].life / FP_LIFE * 0.45);
            if (footprints[i].life <= 0) footprints.splice(i, 1);
        }

        // Particles
        for (let i = active.length - 1; i >= 0; i--) {
            const p = active[i];
            p.life -= dt;
            if (p.life <= 0) {
                p.active = false;
                active.splice(i, 1);
                continue;
            }

            if (p.trail) {
                p.trailPositions.unshift({ x: p.x, y: p.y });
                if (p.trailPositions.length > p.trailLength) p.trailPositions.pop();
            }

            p.vy += p.gravity  * dt;
            p.vx += p.ax       * dt;
            p.vy += p.ay       * dt;
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.x  += p.vx * dt;
            p.y  += p.vy * dt;
            p.rotation += p.rotationSpeed * dt;
        }
    }

    // ── RENDER ────────────────────────────────────────────────────
    function render(ctx) {
        // Footprints first (under everything)
        for (const fp of footprints) {
            if (fp.alpha <= 0) continue;
            ctx.save();
            ctx.globalAlpha = fp.alpha;
            ctx.fillStyle = fp.color;
            ctx.translate(fp.x, fp.y);
            ctx.rotate(fp.angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, fp.w / 2, fp.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Particles
        for (const p of active) {
            const lr    = p.life / p.maxLife;
            const size  = p.sizeEnd  + (p.size  - p.sizeEnd)  * lr;
            const alpha = p.alphaEnd + (p.alpha  - p.alphaEnd) * lr;
            let color   = p.color;
            if (p.colorEnd) color = _lerpColor(p.colorEnd, p.color, lr);

            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle   = color;
            ctx.strokeStyle = color;

            // Trail
            if (p.trail && p.trailPositions.length > 0) {
                ctx.lineWidth = Math.max(0.5, size * 0.45);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                for (let i = 0; i < p.trailPositions.length; i++) {
                    ctx.globalAlpha = alpha * (1 - i / p.trailPositions.length) * 0.5;
                    ctx.lineTo(p.trailPositions[i].x, p.trailPositions[i].y);
                }
                ctx.stroke();
                ctx.globalAlpha = alpha;
            }

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            switch (p.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, Math.max(0.5, size / 2), 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'square':
                    ctx.fillRect(-size / 2, -size / 2, size, size);
                    break;

                case 'spark':
                    ctx.beginPath();
                    ctx.moveTo(-size, 0);
                    ctx.lineTo(0, -size / 3);
                    ctx.lineTo(size, 0);
                    ctx.lineTo(0, size / 3);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case 'ring': {
                    const r = Math.max(0.5, size / 2);
                    ctx.lineWidth = Math.max(1, SC * 1.5);
                    ctx.beginPath();
                    ctx.arc(0, 0, r, 0, Math.PI * 2);
                    ctx.stroke();
                    break;
                }

                case 'line':
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(-size, 0);
                    ctx.lineTo(size, 0);
                    ctx.stroke();
                    break;
            }
            ctx.restore();
        }

        ctx.globalAlpha = 1;
    }

    // ── HELPERS ───────────────────────────────────────────────────
    function _lerpColor(a, b, t) {
        const ca = _hex2rgb(a), cb = _hex2rgb(b);
        if (!ca || !cb) return a;
        return `rgb(${ca.r + (cb.r - ca.r) * t | 0},${ca.g + (cb.g - ca.g) * t | 0},${ca.b + (cb.b - ca.b) * t | 0})`;
    }

    function _hex2rgb(hex) {
        const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
    }

    function clear() {
        for (const p of active) p.active = false;
        active.length = 0;
        footprints.length = 0;
    }

    // ── PUBLIC API ────────────────────────────────────────────────
    return {
        emit, update, render, clear, presets,

        blood:        presets.blood,
        dust:         presets.dust,
        dustCloud:    presets.dustCloud,
        footprint:    presets.footprint,
        waterRipple:  presets.waterRipple,
        torchFlicker: presets.torchFlicker,
        magicItem:    presets.magicItem,
        magic:        presets.magic,
        sparks:       presets.sparks,
        shockwave:    presets.shockwave,
        slashTrail:   presets.slashTrail,
        enemyDissolve:presets.enemyDissolve,
        dissolve:     presets.dissolve,
        fire:         presets.fire,
        smoke:        presets.smoke,
        heal:         presets.heal,
        levelUp:      presets.levelUp,
        footstep:     presets.footstep,
        splash:       presets.splash,
        impact:       presets.impact,

        explosion:    presets.explosion,

        getActiveCount: () => active.length,
        getFootprintCount: () => footprints.length
    };

})();

console.log('[Particles] Initialized (HD)');
