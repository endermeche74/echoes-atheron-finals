/*************************************************************
 * particles.js — Particle System
 * Handles: dust, blood, sparks, magic, fire, smoke, etc.
 *************************************************************/

const Particles = (function() {
    
    // Particle pool for performance
    const MAX_PARTICLES = 500;
    const pool = [];
    const active = [];
    
    // Pre-allocate particle objects
    for (let i = 0; i < MAX_PARTICLES; i++) {
        pool.push(createParticle());
    }
    
    function createParticle() {
        return {
            active: false,
            x: 0, y: 0,
            vx: 0, vy: 0,
            ax: 0, ay: 0,  // acceleration
            life: 0,
            maxLife: 1,
            size: 2,
            sizeEnd: 0,
            color: '#ffffff',
            colorEnd: null,
            alpha: 1,
            alphaEnd: 0,
            rotation: 0,
            rotationSpeed: 0,
            gravity: 0,
            friction: 1,
            shape: 'square', // 'square', 'circle', 'line', 'spark'
            trail: false,
            trailLength: 5,
            trailPositions: []
        };
    }
    
    // Get particle from pool
    function getParticle() {
        // Try to find inactive particle
        for (let i = 0; i < pool.length; i++) {
            if (!pool[i].active) {
                return pool[i];
            }
        }
        // Pool exhausted, reuse oldest active
        if (active.length > 0) {
            return active.shift();
        }
        return null;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  E M I T T E R S
    // ═══════════════════════════════════════════════════════════════
    
    function emit(config) {
        const count = config.count || 1;
        
        for (let i = 0; i < count; i++) {
            const p = getParticle();
            if (!p) continue;
            
            // Position
            p.x = config.x + (config.spreadX || 0) * (Math.random() - 0.5);
            p.y = config.y + (config.spreadY || 0) * (Math.random() - 0.5);
            
            // Velocity
            const speed = config.speed || 50;
            const speedVar = config.speedVariance || 0;
            const actualSpeed = speed + speedVar * (Math.random() - 0.5);
            
            const angle = config.angle || 0;
            const angleVar = config.angleVariance || Math.PI * 2;
            const actualAngle = angle + angleVar * (Math.random() - 0.5);
            
            p.vx = Math.cos(actualAngle) * actualSpeed;
            p.vy = Math.sin(actualAngle) * actualSpeed;
            
            // Acceleration
            p.ax = config.ax || 0;
            p.ay = config.ay || 0;
            
            // Life
            const life = config.life || 1;
            const lifeVar = config.lifeVariance || 0;
            p.maxLife = life + lifeVar * (Math.random() - 0.5);
            p.life = p.maxLife;
            
            // Size
            p.size = config.size || 3;
            p.sizeEnd = config.sizeEnd !== undefined ? config.sizeEnd : 0;
            
            // Color
            p.color = config.color || '#ffffff';
            p.colorEnd = config.colorEnd || null;
            
            // Alpha
            p.alpha = config.alpha !== undefined ? config.alpha : 1;
            p.alphaEnd = config.alphaEnd !== undefined ? config.alphaEnd : 0;
            
            // Physics
            p.gravity = config.gravity || 0;
            p.friction = config.friction || 1;
            
            // Rotation
            p.rotation = config.rotation || 0;
            p.rotationSpeed = config.rotationSpeed || 0;
            
            // Shape
            p.shape = config.shape || 'square';
            
            // Trail
            p.trail = config.trail || false;
            p.trailLength = config.trailLength || 5;
            p.trailPositions = [];
            
            p.active = true;
            active.push(p);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P R E S E T   E M I T T E R S
    // ═══════════════════════════════════════════════════════════════
    
    const presets = {
        
        // Blood splatter
        blood: function(x, y, direction = 0) {
            emit({
                x, y,
                count: 8,
                speed: 80,
                speedVariance: 40,
                angle: direction,
                angleVariance: 0.8,
                life: 0.4,
                lifeVariance: 0.2,
                size: 3,
                sizeEnd: 1,
                color: '#8a2020',
                colorEnd: '#4a1010',
                gravity: 200,
                friction: 0.98,
                shape: 'circle'
            });
        },
        
        // Dust cloud (footsteps)
        dust: function(x, y) {
            emit({
                x, y: y + 12,
                count: 3,
                speed: 15,
                speedVariance: 10,
                angle: -Math.PI / 2,
                angleVariance: 1,
                life: 0.3,
                lifeVariance: 0.1,
                size: 2,
                sizeEnd: 4,
                color: '#8a8070',
                alpha: 0.5,
                alphaEnd: 0,
                gravity: -20,
                shape: 'circle'
            });
        },
        
        // Sparks (metal hit)
        sparks: function(x, y, direction = 0) {
            emit({
                x, y,
                count: 6,
                speed: 120,
                speedVariance: 60,
                angle: direction,
                angleVariance: 0.6,
                life: 0.3,
                lifeVariance: 0.15,
                size: 2,
                sizeEnd: 0,
                color: '#ffcc44',
                colorEnd: '#ff6600',
                gravity: 150,
                friction: 0.95,
                shape: 'spark',
                trail: true,
                trailLength: 3
            });
        },
        
        // Magic sparkles
        magic: function(x, y, color = '#88aaff') {
            emit({
                x, y,
                spreadX: 10,
                spreadY: 10,
                count: 5,
                speed: 30,
                speedVariance: 20,
                angle: -Math.PI / 2,
                angleVariance: Math.PI,
                life: 0.6,
                lifeVariance: 0.3,
                size: 2,
                sizeEnd: 0,
                color: color,
                alpha: 0.8,
                alphaEnd: 0,
                gravity: -30,
                shape: 'circle'
            });
        },
        
        // Fire
        fire: function(x, y) {
            emit({
                x, y,
                spreadX: 4,
                count: 2,
                speed: 40,
                speedVariance: 20,
                angle: -Math.PI / 2,
                angleVariance: 0.4,
                life: 0.5,
                lifeVariance: 0.2,
                size: 4,
                sizeEnd: 1,
                color: '#ff6600',
                colorEnd: '#ff0000',
                alpha: 0.8,
                alphaEnd: 0,
                gravity: -80,
                shape: 'circle'
            });
            // Smoke above fire
            emit({
                x, y: y - 8,
                spreadX: 2,
                count: 1,
                speed: 20,
                angle: -Math.PI / 2,
                angleVariance: 0.3,
                life: 0.8,
                size: 3,
                sizeEnd: 6,
                color: '#444444',
                alpha: 0.3,
                alphaEnd: 0,
                gravity: -40,
                shape: 'circle'
            });
        },
        
        // Smoke puff
        smoke: function(x, y) {
            emit({
                x, y,
                count: 4,
                speed: 25,
                speedVariance: 15,
                angle: -Math.PI / 2,
                angleVariance: 0.8,
                life: 1.0,
                lifeVariance: 0.3,
                size: 3,
                sizeEnd: 8,
                color: '#555555',
                alpha: 0.4,
                alphaEnd: 0,
                gravity: -20,
                shape: 'circle'
            });
        },
        
        // Heal effect
        heal: function(x, y) {
            emit({
                x, y,
                spreadX: 8,
                spreadY: 8,
                count: 8,
                speed: 40,
                angle: -Math.PI / 2,
                angleVariance: 0.5,
                life: 0.8,
                size: 3,
                sizeEnd: 0,
                color: '#44ff44',
                alpha: 0.8,
                alphaEnd: 0,
                gravity: -60,
                shape: 'circle'
            });
        },
        
        // Level up burst
        levelUp: function(x, y) {
            emit({
                x, y,
                count: 20,
                speed: 100,
                speedVariance: 50,
                angle: 0,
                angleVariance: Math.PI,
                life: 0.6,
                lifeVariance: 0.2,
                size: 3,
                sizeEnd: 0,
                color: '#ffff44',
                colorEnd: '#ffaa00',
                alpha: 1,
                alphaEnd: 0,
                gravity: 50,
                friction: 0.97,
                shape: 'circle'
            });
        },
        
        // Death/dissolve
        dissolve: function(x, y, color = '#666666') {
            emit({
                x, y,
                spreadX: 8,
                spreadY: 12,
                count: 15,
                speed: 30,
                speedVariance: 20,
                angle: -Math.PI / 2,
                angleVariance: 1.5,
                life: 1.0,
                lifeVariance: 0.4,
                size: 2,
                sizeEnd: 0,
                color: color,
                alpha: 0.8,
                alphaEnd: 0,
                gravity: -20,
                friction: 0.98,
                shape: 'square'
            });
        },
        
        // Footstep (walking)
        footstep: function(x, y, tileType = 'stone') {
            let color = '#8a8070';
            if (tileType === 'dirt' || tileType === 'sand') color = '#9a8a60';
            if (tileType === 'grass') color = '#6a8a5a';
            if (tileType === 'water') color = '#6a8aaa';
            
            emit({
                x, y: y + 14,
                count: 2,
                speed: 10,
                speedVariance: 5,
                angle: -Math.PI / 2,
                angleVariance: 1.2,
                life: 0.2,
                size: 1,
                sizeEnd: 2,
                color: color,
                alpha: 0.4,
                alphaEnd: 0,
                shape: 'circle'
            });
        },
        
        // Water splash
        splash: function(x, y) {
            emit({
                x, y,
                count: 8,
                speed: 60,
                speedVariance: 30,
                angle: -Math.PI / 2,
                angleVariance: 0.8,
                life: 0.4,
                size: 2,
                sizeEnd: 1,
                color: '#88aacc',
                alpha: 0.7,
                alphaEnd: 0,
                gravity: 200,
                shape: 'circle'
            });
        },
        
        // Impact (general hit)
        impact: function(x, y, color = '#ffffff') {
            emit({
                x, y,
                count: 6,
                speed: 60,
                speedVariance: 30,
                angle: 0,
                angleVariance: Math.PI,
                life: 0.2,
                size: 2,
                sizeEnd: 0,
                color: color,
                alpha: 1,
                alphaEnd: 0,
                friction: 0.9,
                shape: 'square'
            });
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  U P D A T E
    // ═══════════════════════════════════════════════════════════════
    
    function update(dt) {
        for (let i = active.length - 1; i >= 0; i--) {
            const p = active[i];
            
            // Update life
            p.life -= dt;
            if (p.life <= 0) {
                p.active = false;
                active.splice(i, 1);
                continue;
            }
            
            // Trail
            if (p.trail) {
                p.trailPositions.unshift({ x: p.x, y: p.y });
                if (p.trailPositions.length > p.trailLength) {
                    p.trailPositions.pop();
                }
            }
            
            // Physics
            p.vy += p.gravity * dt;
            p.vx += p.ax * dt;
            p.vy += p.ay * dt;
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            
            // Rotation
            p.rotation += p.rotationSpeed * dt;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  R E N D E R
    // ═══════════════════════════════════════════════════════════════
    
    function render(ctx) {
        for (const p of active) {
            const lifeRatio = p.life / p.maxLife;
            
            // Interpolate size
            const size = p.sizeEnd + (p.size - p.sizeEnd) * lifeRatio;
            
            // Interpolate alpha
            const alpha = p.alphaEnd + (p.alpha - p.alphaEnd) * lifeRatio;
            
            // Interpolate color if colorEnd specified
            let color = p.color;
            if (p.colorEnd) {
                color = lerpColor(p.colorEnd, p.color, lifeRatio);
            }
            
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            
            // Render trail first
            if (p.trail && p.trailPositions.length > 0) {
                ctx.strokeStyle = color;
                ctx.lineWidth = size * 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                for (let i = 0; i < p.trailPositions.length; i++) {
                    const tp = p.trailPositions[i];
                    ctx.globalAlpha = alpha * (1 - i / p.trailPositions.length) * 0.5;
                    ctx.lineTo(tp.x, tp.y);
                }
                ctx.stroke();
                ctx.globalAlpha = alpha;
            }
            
            // Render particle
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            
            switch (p.shape) {
                case 'circle':
                    ctx.beginPath();
                    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
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
                    
                case 'line':
                    ctx.strokeStyle = color;
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
    
    // ═══════════════════════════════════════════════════════════════
    //  H E L P E R S
    // ═══════════════════════════════════════════════════════════════
    
    function lerpColor(colorA, colorB, t) {
        // Simple hex color lerp
        const a = hexToRgb(colorA);
        const b = hexToRgb(colorB);
        if (!a || !b) return colorA;
        
        const r = Math.round(a.r + (b.r - a.r) * t);
        const g = Math.round(a.g + (b.g - a.g) * t);
        const bl = Math.round(a.b + (b.b - a.b) * t);
        
        return `rgb(${r},${g},${bl})`;
    }
    
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    function clear() {
        for (const p of active) {
            p.active = false;
        }
        active.length = 0;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P U B L I C   A P I
    // ═══════════════════════════════════════════════════════════════
    
    return {
        emit,
        update,
        render,
        clear,
        presets,
        
        // Shorthand for common effects
        blood: presets.blood,
        dust: presets.dust,
        sparks: presets.sparks,
        magic: presets.magic,
        fire: presets.fire,
        smoke: presets.smoke,
        heal: presets.heal,
        levelUp: presets.levelUp,
        dissolve: presets.dissolve,
        footstep: presets.footstep,
        splash: presets.splash,
        impact: presets.impact,
        
        // Debug
        getActiveCount: () => active.length
    };
    
})();

console.log('[Particles] Initialized');