/*************************************************************
 * effects.js — Visual Effects System
 * Handles: screen shake, flash, fade, vignette, slowmo
 *************************************************************/

const Effects = (function() {
    
    // === SCREEN SHAKE ===
    const shake = {
        active: false,
        intensity: 0,
        duration: 0,
        elapsed: 0,
        offsetX: 0,
        offsetY: 0,
        decay: true
    };
    
    // === FLASH ===
    const flash = {
        active: false,
        color: '#ffffff',
        alpha: 0,
        duration: 0,
        elapsed: 0
    };
    
    // === FADE ===
    const fade = {
        active: false,
        type: 'none', // 'in', 'out', 'none'
        color: '#000000',
        alpha: 0,
        duration: 0,
        elapsed: 0,
        onComplete: null
    };
    
    // === VIGNETTE ===
    const vignette = {
        active: false,
        intensity: 0,
        color: '#000000',
        targetIntensity: 0,
        speed: 2
    };
    
    // === SLOW MOTION ===
    let timeScale = 1.0;
    let targetTimeScale = 1.0;
    let timeScaleLerp = 5;
    
    // === CHROMATIC ABERRATION (boss fights) ===
    const aberration = {
        active: false,
        intensity: 0,
        targetIntensity: 0
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  S C R E E N   S H A K E
    // ═══════════════════════════════════════════════════════════════
    
    function startShake(intensity = 5, duration = 0.3, decay = true) {
        shake.active = true;
        shake.intensity = intensity;
        shake.duration = duration;
        shake.elapsed = 0;
        shake.decay = decay;
    }
    
    function stopShake() {
        shake.active = false;
        shake.offsetX = 0;
        shake.offsetY = 0;
    }
    
    function updateShake(dt) {
        if (!shake.active) return;
        
        shake.elapsed += dt;
        
        if (shake.elapsed >= shake.duration) {
            stopShake();
            return;
        }
        
        // Calculate current intensity (with optional decay)
        let currentIntensity = shake.intensity;
        if (shake.decay) {
            const progress = shake.elapsed / shake.duration;
            currentIntensity = shake.intensity * (1 - progress);
        }
        
        // Random offset
        shake.offsetX = (Math.random() * 2 - 1) * currentIntensity;
        shake.offsetY = (Math.random() * 2 - 1) * currentIntensity;
    }
    
    function getShakeOffset() {
        return { x: shake.offsetX, y: shake.offsetY };
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  F L A S H
    // ═══════════════════════════════════════════════════════════════
    
    function startFlash(color = '#ffffff', duration = 0.1, intensity = 0.8) {
        flash.active = true;
        flash.color = color;
        flash.alpha = intensity;
        flash.duration = duration;
        flash.elapsed = 0;
    }
    
    function updateFlash(dt) {
        if (!flash.active) return;
        
        flash.elapsed += dt;
        
        // Fade out
        const progress = flash.elapsed / flash.duration;
        flash.alpha = Math.max(0, flash.alpha * (1 - progress * 2));
        
        if (flash.elapsed >= flash.duration) {
            flash.active = false;
            flash.alpha = 0;
        }
    }
    
    function renderFlash(ctx, width, height) {
        if (!flash.active || flash.alpha <= 0) return;
        
        ctx.fillStyle = flash.color;
        ctx.globalAlpha = flash.alpha;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  F A D E   T R A N S I T I O N S
    // ═══════════════════════════════════════════════════════════════
    
    function fadeOut(duration = 0.5, color = '#000000', onComplete = null) {
        fade.active = true;
        fade.type = 'out';
        fade.color = color;
        fade.alpha = 0;
        fade.duration = duration;
        fade.elapsed = 0;
        fade.onComplete = onComplete;
    }
    
    function fadeIn(duration = 0.5, color = '#000000', onComplete = null) {
        fade.active = true;
        fade.type = 'in';
        fade.color = color;
        fade.alpha = 1;
        fade.duration = duration;
        fade.elapsed = 0;
        fade.onComplete = onComplete;
    }
    
    function fadeFromBlack(duration = 0.5) {
        fadeIn(duration, '#000000');
    }
    
    function fadeToBlack(duration = 0.5, onComplete = null) {
        fadeOut(duration, '#000000', onComplete);
    }
    
    function updateFade(dt) {
        if (!fade.active) return;
        
        fade.elapsed += dt;
        const progress = Math.min(1, fade.elapsed / fade.duration);
        
        if (fade.type === 'out') {
            fade.alpha = progress;
        } else if (fade.type === 'in') {
            fade.alpha = 1 - progress;
        }
        
        if (progress >= 1) {
            if (fade.onComplete) {
                fade.onComplete();
            }
            if (fade.type === 'in') {
                fade.active = false;
            }
            // Keep fade.active true for 'out' so screen stays black
        }
    }
    
    function renderFade(ctx, width, height) {
        if (!fade.active || fade.alpha <= 0) return;
        
        ctx.fillStyle = fade.color;
        ctx.globalAlpha = fade.alpha;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
    }
    
    function isFading() {
        return fade.active;
    }
    
    function clearFade() {
        fade.active = false;
        fade.alpha = 0;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  V I G N E T T E
    // ═══════════════════════════════════════════════════════════════
    
    function setVignette(intensity = 0.3, color = '#000000') {
        vignette.active = true;
        vignette.targetIntensity = intensity;
        vignette.color = color;
    }
    
    function clearVignette() {
        vignette.targetIntensity = 0;
    }
    
    function updateVignette(dt) {
        // Lerp to target
        vignette.intensity += (vignette.targetIntensity - vignette.intensity) * vignette.speed * dt;
        
        if (Math.abs(vignette.intensity - vignette.targetIntensity) < 0.01) {
            vignette.intensity = vignette.targetIntensity;
            if (vignette.intensity <= 0) {
                vignette.active = false;
            }
        }
    }
    
    function renderVignette(ctx, width, height) {
        if (!vignette.active || vignette.intensity <= 0) return;
        
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.max(width, height) * 0.7;
        
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, 'transparent');
        gradient.addColorStop(1, vignette.color);
        
        ctx.globalAlpha = vignette.intensity;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  T I M E   S C A L E   ( S L O W   M O T I O N )
    // ═══════════════════════════════════════════════════════════════
    
    function setTimeScale(scale, immediate = false) {
        targetTimeScale = scale;
        if (immediate) {
            timeScale = scale;
        }
    }
    
    function getTimeScale() {
        return timeScale;
    }
    
    function updateTimeScale(dt) {
        timeScale += (targetTimeScale - timeScale) * timeScaleLerp * dt;
        if (Math.abs(timeScale - targetTimeScale) < 0.01) {
            timeScale = targetTimeScale;
        }
    }
    
    // Slow-mo hit effect
    function hitPause(duration = 0.05) {
        setTimeScale(0.1, true);
        setTimeout(() => setTimeScale(1.0), duration * 1000);
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  M A I N   U P D A T E   &   R E N D E R
    // ═══════════════════════════════════════════════════════════════
    
    function update(dt) {
        // Apply time scale to dt for external systems
        const scaledDt = dt * timeScale;
        
        updateShake(scaledDt);
        updateFlash(scaledDt);
        updateFade(dt); // Fade ignores time scale
        updateVignette(scaledDt);
        updateTimeScale(dt);
        
        return scaledDt;
    }
    
    function render(ctx, width, height) {
        // Render order matters - flash on top, then vignette, then fade
        renderFlash(ctx, width, height);
        renderVignette(ctx, width, height);
        renderFade(ctx, width, height);
    }
    
    // Apply shake to context before rendering game
    function applyShake(ctx) {
        if (shake.active) {
            ctx.translate(shake.offsetX, shake.offsetY);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P R E S E T   E F F E C T S
    // ═══════════════════════════════════════════════════════════════
    
    const presets = {
        // Player takes damage
        playerHit: function() {
            startShake(4, 0.2);
            startFlash('#ff0000', 0.15, 0.3);
            hitPause(0.03);
        },
        
        // Player deals damage
        enemyHit: function() {
            startShake(2, 0.1);
            startFlash('#ffffff', 0.05, 0.2);
            hitPause(0.02);
        },
        
        // Critical hit
        criticalHit: function() {
            startShake(6, 0.25);
            startFlash('#ffff00', 0.1, 0.4);
            hitPause(0.05);
        },
        
        // Boss encounter
        bossAppear: function() {
            startShake(8, 0.5, true);
            setVignette(0.4, '#200000');
            startFlash('#ff0000', 0.3, 0.2);
        },
        
        // Boss defeated
        bossDefeated: function() {
            startShake(10, 1.0);
            startFlash('#ffffff', 0.5, 0.8);
            setTimeScale(0.3);
            setTimeout(() => {
                setTimeScale(1.0);
                clearVignette();
            }, 1000);
        },
        
        // Area transition
        areaTransition: function(onMidpoint) {
            fadeToBlack(0.3, () => {
                if (onMidpoint) onMidpoint();
                setTimeout(() => fadeFromBlack(0.3), 100);
            });
        },
        
        // Death
        playerDeath: function() {
            setTimeScale(0.2);
            setVignette(0.6, '#000000');
            startFlash('#ff0000', 0.5, 0.5);
        },
        
        // Heal
        heal: function() {
            startFlash('#00ff00', 0.2, 0.2);
        },
        
        // Level up
        levelUp: function() {
            startFlash('#ffff88', 0.4, 0.4);
            startShake(3, 0.2);
        },
        
        // Explosion
        explosion: function() {
            startShake(8, 0.4);
            startFlash('#ff8800', 0.2, 0.5);
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  P U B L I C   A P I
    // ═══════════════════════════════════════════════════════════════
    
    return {
        // Core update/render
        update,
        render,
        applyShake,
        getShakeOffset,
        
        // Screen shake
        startShake,
        stopShake,
        
        // Flash
        startFlash,
        
        // Fade
        fadeIn,
        fadeOut,
        fadeToBlack,
        fadeFromBlack,
        isFading,
        clearFade,
        
        // Vignette
        setVignette,
        clearVignette,
        
        // Time scale
        setTimeScale,
        getTimeScale,
        hitPause,
        
        // Presets
        presets,
        
        // Shorthand
        playerHit: presets.playerHit,
        enemyHit: presets.enemyHit,
        criticalHit: presets.criticalHit,
        bossAppear: presets.bossAppear,
        areaTransition: presets.areaTransition
    };
    
})();

console.log('[Effects] Initialized');