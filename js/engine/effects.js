/*************************************************************
 * effects.js — Visual Effects System (HD)
 * Handles: screen shake, flash, fade (eased), wipe, vignette,
 *          zoom pulse, slow-mo, chromatic aberration presets.
 *************************************************************/

const Effects = (function() {

    const _SC = () => (typeof CONFIG !== 'undefined' ? CONFIG.TILE : 48) / 16;

    // ── SCREEN SHAKE ──────────────────────────────────────────────
    const shake = { active: false, intensity: 0, duration: 0, elapsed: 0, offsetX: 0, offsetY: 0, decay: true };

    function startShake(intensity = 5, duration = 0.3, decay = true) {
        // Scale to HD — caller uses logical units, we multiply by tile scale
        shake.active    = true;
        shake.intensity = intensity * _SC();
        shake.duration  = duration;
        shake.elapsed   = 0;
        shake.decay     = decay;
    }

    function stopShake() {
        shake.active  = false;
        shake.offsetX = 0;
        shake.offsetY = 0;
    }

    function updateShake(dt) {
        if (!shake.active) return;
        shake.elapsed += dt;
        if (shake.elapsed >= shake.duration) { stopShake(); return; }
        const cur = shake.decay ? shake.intensity * (1 - shake.elapsed / shake.duration) : shake.intensity;
        shake.offsetX = (Math.random() * 2 - 1) * cur;
        shake.offsetY = (Math.random() * 2 - 1) * cur;
    }

    function getShakeOffset() { return { x: shake.offsetX, y: shake.offsetY }; }

    // ── FLASH ─────────────────────────────────────────────────────
    const flash = { active: false, color: '#ffffff', alpha: 0, duration: 0, elapsed: 0 };

    function startFlash(color = '#ffffff', duration = 0.12, intensity = 0.8) {
        flash.active   = true;
        flash.color    = color;
        flash.alpha    = intensity;
        flash.duration = duration;
        flash.elapsed  = 0;
    }

    function updateFlash(dt) {
        if (!flash.active) return;
        flash.elapsed += dt;
        const prog  = flash.elapsed / flash.duration;
        flash.alpha = Math.max(0, flash.alpha * (1 - prog * 2));
        if (flash.elapsed >= flash.duration) { flash.active = false; flash.alpha = 0; }
    }

    function renderFlash(ctx, w, h) {
        if (!flash.active || flash.alpha <= 0) return;
        ctx.fillStyle  = flash.color;
        ctx.globalAlpha = flash.alpha;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }

    // ── FADE (ease-in-out) ────────────────────────────────────────
    const fade = { active: false, type: 'none', color: '#000000', alpha: 0, duration: 0, elapsed: 0, onComplete: null };

    function _ease(t) {
        // Smooth cubic ease-in-out
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function fadeOut(duration = 0.5, color = '#000000', onComplete = null) {
        fade.active = true; fade.type = 'out'; fade.color = color;
        fade.alpha = 0; fade.duration = duration; fade.elapsed = 0; fade.onComplete = onComplete;
    }

    function fadeIn(duration = 0.5, color = '#000000', onComplete = null) {
        fade.active = true; fade.type = 'in'; fade.color = color;
        fade.alpha = 1; fade.duration = duration; fade.elapsed = 0; fade.onComplete = onComplete;
    }

    function fadeFromBlack(duration = 0.5) { fadeIn(duration, '#000000'); }
    function fadeToBlack(duration = 0.5, onComplete = null) { fadeOut(duration, '#000000', onComplete); }

    function updateFade(dt) {
        if (!fade.active) return;
        fade.elapsed += dt;
        const prog = Math.min(1, fade.elapsed / fade.duration);
        const eased = _ease(prog);
        fade.alpha = fade.type === 'out' ? eased : 1 - eased;
        if (prog >= 1) {
            if (fade.onComplete) fade.onComplete();
            if (fade.type === 'in') fade.active = false;
        }
    }

    function renderFade(ctx, w, h) {
        if (!fade.active || fade.alpha <= 0) return;
        ctx.fillStyle  = fade.color;
        ctx.globalAlpha = fade.alpha;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }

    function isFading() { return fade.active; }
    function clearFade() { fade.active = false; fade.alpha = 0; }

    // ── WIPE TRANSITION ───────────────────────────────────────────
    // direction: 'left'|'right'. Phase 'cover'→'reveal'.
    const wipe = {
        active: false, direction: 'left',
        phase: 'cover',           // 'cover' sweeps in, 'reveal' sweeps out
        progress: 0, duration: 0.25, elapsed: 0,
        color: '#000000', onMidpoint: null
    };

    function startWipe(direction = 'left', duration = 0.25, color = '#000000', onMidpoint = null) {
        wipe.active     = true;
        wipe.direction  = direction;
        wipe.phase      = 'cover';
        wipe.progress   = 0;
        wipe.duration   = duration;
        wipe.elapsed    = 0;
        wipe.color      = color;
        wipe.onMidpoint = onMidpoint;
    }

    function updateWipe(dt) {
        if (!wipe.active) return;
        wipe.elapsed += dt;
        const prog = Math.min(1, wipe.elapsed / wipe.duration);
        wipe.progress = _ease(prog);

        if (prog >= 1) {
            if (wipe.phase === 'cover') {
                if (wipe.onMidpoint) wipe.onMidpoint();
                wipe.phase   = 'reveal';
                wipe.elapsed = 0;
            } else {
                wipe.active = false;
            }
        }
    }

    function renderWipe(ctx, w, h) {
        if (!wipe.active) return;
        ctx.fillStyle = wipe.color;

        let rx, ry, rw, rh;
        if (wipe.direction === 'left') {
            rw = (w * wipe.progress) | 0;
            rx = wipe.phase === 'cover' ? 0 : w - rw;
            ry = 0; rh = h;
        } else {
            rw = (w * wipe.progress) | 0;
            rx = wipe.phase === 'cover' ? w - rw : 0;
            ry = 0; rh = h;
        }

        if (wipe.phase === 'reveal') {
            // During reveal: full black minus revealed strip
            if (wipe.direction === 'left') {
                ctx.fillRect(w - (w * wipe.progress) | 0, 0, w, h);
            } else {
                ctx.fillRect(0, 0, (w * (1 - wipe.progress)) | 0, h);
            }
        } else {
            ctx.fillRect(rx, ry, rw, rh);
        }
    }

    // ── ZOOM PULSE ────────────────────────────────────────────────
    // Brief scale > 1 on crits; lerps back to 1.
    const zoom = {
        active: false, current: 1, target: 1, speed: 14
    };

    function startZoomPulse(scale = 1.06, duration = 0.08) {
        zoom.active  = true;
        zoom.current = scale;
        zoom.target  = 1;
        // schedule return to normal
        setTimeout(() => { zoom.target = 1; }, duration * 1000);
    }

    function updateZoom(dt) {
        if (!zoom.active) return;
        zoom.current += (zoom.target - zoom.current) * zoom.speed * dt;
        if (Math.abs(zoom.current - zoom.target) < 0.001) {
            zoom.current = zoom.target;
            if (zoom.target === 1) zoom.active = false;
        }
    }

    // Call before main game draw; returns true if transform applied so caller can restore.
    function applyZoom(ctx, cx, cy) {
        if (!zoom.active || zoom.current === 1) return false;
        ctx.translate(cx, cy);
        ctx.scale(zoom.current, zoom.current);
        ctx.translate(-cx, -cy);
        return true;
    }

    // ── VIGNETTE ──────────────────────────────────────────────────
    const vignette = { active: false, intensity: 0, color: '#000000', targetIntensity: 0, speed: 2 };

    function setVignette(intensity = 0.3, color = '#000000') {
        vignette.active          = true;
        vignette.targetIntensity = intensity;
        vignette.color           = color;
    }

    function clearVignette() { vignette.targetIntensity = 0; }

    function updateVignette(dt) {
        vignette.intensity += (vignette.targetIntensity - vignette.intensity) * vignette.speed * dt;
        if (Math.abs(vignette.intensity - vignette.targetIntensity) < 0.01) {
            vignette.intensity = vignette.targetIntensity;
            if (vignette.intensity <= 0) vignette.active = false;
        }
    }

    function renderVignette(ctx, w, h) {
        if (!vignette.active || vignette.intensity <= 0) return;
        const cx  = w / 2, cy = h / 2;
        const rad = Math.max(w, h) * 0.72;
        const g   = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0,   'transparent');
        g.addColorStop(0.5, 'transparent');
        g.addColorStop(1,   vignette.color);
        ctx.globalAlpha = vignette.intensity;
        ctx.fillStyle   = g;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }

    // ── TIME SCALE ────────────────────────────────────────────────
    let timeScale = 1, targetTimeScale = 1;
    const TIME_LERP = 5;

    function setTimeScale(s, immediate = false) {
        targetTimeScale = s;
        if (immediate) timeScale = s;
    }

    function getTimeScale() { return timeScale; }

    function updateTimeScale(dt) {
        timeScale += (targetTimeScale - timeScale) * TIME_LERP * dt;
        if (Math.abs(timeScale - targetTimeScale) < 0.01) timeScale = targetTimeScale;
    }

    function hitPause(duration = 0.05) {
        setTimeScale(0.1, true);
        setTimeout(() => setTimeScale(1.0), duration * 1000);
    }

    // ── MAIN UPDATE / RENDER ──────────────────────────────────────
    function update(dt) {
        const scaled = dt * timeScale;
        updateShake(scaled);
        updateFlash(scaled);
        updateFade(dt);       // fade ignores time scale
        updateWipe(dt);
        updateZoom(scaled);
        updateVignette(scaled);
        updateTimeScale(dt);
        return scaled;
    }

    function render(ctx, w, h) {
        renderFlash(ctx, w, h);
        renderVignette(ctx, w, h);
        renderWipe(ctx, w, h);
        renderFade(ctx, w, h);
    }

    function applyShake(ctx) {
        if (shake.active) ctx.translate(shake.offsetX, shake.offsetY);
    }

    // ── PRESETS ───────────────────────────────────────────────────
    const presets = {

        playerHit: function() {
            startShake(3, 0.2);
            startFlash('#ff0000', 0.15, 0.35);
            hitPause(0.03);
        },

        enemyHit: function() {
            startShake(1.5, 0.1);
            startFlash('#ffffff', 0.06, 0.22);
            hitPause(0.02);
        },

        // Critical: zoom punch + yellow flash + stronger shake
        criticalHit: function() {
            startShake(5, 0.25);
            startFlash('#ffff00', 0.12, 0.5);
            startZoomPulse(1.07, 0.1);
            hitPause(0.06);
            if (typeof Particles !== 'undefined') {
                // Particles called from combat_enhanced with coords;
                // here we just signal the effect system
            }
        },

        // Enemy death — dissolve particles + brief shake
        enemyDeath: function(px, py) {
            startShake(2, 0.3);
            startFlash('#ffffff', 0.08, 0.15);
            if (typeof Particles !== 'undefined') {
                Particles.enemyDissolve(px || 0, py || 0);
            }
        },

        bossAppear: function() {
            startShake(6, 0.5, true);
            setVignette(0.45, '#200000');
            startFlash('#ff0000', 0.3, 0.25);
        },

        bossDefeated: function() {
            startShake(8, 1.0);
            startFlash('#ffffff', 0.5, 0.85);
            setTimeScale(0.3);
            setTimeout(() => { setTimeScale(1.0); clearVignette(); }, 1200);
        },

        // Smooth wipe to new area + eased fade + white flash on arrive
        areaTransition: function(onMidpoint, useWipe = false) {
            if (useWipe) {
                startWipe('left', 0.28, '#000000', () => {
                    if (onMidpoint) onMidpoint();
                    // subtle white flash on arrival
                    setTimeout(() => startFlash('#ffffff', 0.18, 0.18), 40);
                });
            } else {
                fadeToBlack(0.3, () => {
                    if (onMidpoint) onMidpoint();
                    setTimeout(() => {
                        fadeFromBlack(0.35);
                        startFlash('#ffffff', 0.2, 0.15);
                    }, 80);
                });
            }
        },

        playerDeath: function() {
            setTimeScale(0.2);
            setVignette(0.65, '#000000');
            startFlash('#ff0000', 0.5, 0.55);
        },

        heal: function() {
            startFlash('#00ff88', 0.22, 0.22);
        },

        levelUp: function() {
            startFlash('#ffff88', 0.4, 0.45);
            startShake(2, 0.2);
            startZoomPulse(1.04, 0.15);
        },

        explosion: function() {
            startShake(7, 0.4);
            startFlash('#ff8800', 0.22, 0.55);
        }
    };

    // ── PUBLIC API ────────────────────────────────────────────────
    return {
        update, render, applyShake, getShakeOffset,

        startShake, stopShake,
        startFlash,
        fadeIn, fadeOut, fadeToBlack, fadeFromBlack, isFading, clearFade,
        startWipe,
        startZoomPulse, applyZoom,
        setVignette, clearVignette,
        setTimeScale, getTimeScale, hitPause,

        presets,
        playerHit:     presets.playerHit,
        enemyHit:      presets.enemyHit,
        criticalHit:   presets.criticalHit,
        enemyDeath:    presets.enemyDeath,
        bossAppear:    presets.bossAppear,
        areaTransition: presets.areaTransition
    };

})();

console.log('[Effects] Initialized (HD)');
