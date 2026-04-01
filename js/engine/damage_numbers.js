/*************************************************************
 * damage_numbers.js — Floating Combat Text
 * Handles: damage, healing, status text, crits, misses
 *************************************************************/

const DamageNumbers = (function() {
    
    const active = [];
    const MAX_NUMBERS = 30;
    
    // Number types with styling
    const TYPES = {
        DAMAGE: {
            color: '#ff4444',
            shadow: '#880000',
            scale: 1.0
        },
        CRIT: {
            color: '#ffff44',
            shadow: '#886600',
            scale: 1.4,
            shake: true
        },
        HEAL: {
            color: '#44ff44',
            shadow: '#008800',
            scale: 1.0
        },
        MANA: {
            color: '#4488ff',
            shadow: '#002288',
            scale: 0.9
        },
        XP: {
            color: '#dd88ff',
            shadow: '#660088',
            scale: 0.9
        },
        GOLD: {
            color: '#ffcc00',
            shadow: '#664400',
            scale: 0.9
        },
        MISS: {
            color: '#aaaaaa',
            shadow: '#444444',
            scale: 0.8,
            text: 'MISS'
        },
        BLOCK: {
            color: '#8888aa',
            shadow: '#444466',
            scale: 0.9,
            text: 'BLOCK'
        },
        IMMUNE: {
            color: '#aaaaff',
            shadow: '#444488',
            scale: 0.8,
            text: 'IMMUNE'
        },
        STATUS: {
            color: '#ff8844',
            shadow: '#663300',
            scale: 0.8
        }
    };
    
    function createNumber() {
        return {
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            text: '',
            type: TYPES.DAMAGE,
            life: 0,
            maxLife: 1,
            scale: 1,
            alpha: 1,
            shake: false,
            shakeOffset: 0
        };
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  S P A W N   N U M B E R S
    // ═══════════════════════════════════════════════════════════════
    
    function spawn(x, y, value, typeName = 'DAMAGE') {
        // Reuse or create
        let num = active.find(n => !n.active);
        if (!num) {
            if (active.length >= MAX_NUMBERS) {
                num = active.shift();
            } else {
                num = createNumber();
                active.push(num);
            }
        }
        
        const type = TYPES[typeName] || TYPES.DAMAGE;
        
        num.active = true;
        num.x = x + (Math.random() - 0.5) * 10;
        num.y = y;
        num.vx = (Math.random() - 0.5) * 20;
        num.vy = -60 - Math.random() * 20;
        num.text = type.text || String(value);
        num.type = type;
        num.maxLife = typeName === 'CRIT' ? 1.2 : 0.8;
        num.life = num.maxLife;
        num.scale = type.scale;
        num.alpha = 1;
        num.shake = type.shake || false;
        num.shakeOffset = 0;
        
        return num;
    }
    
    // Convenience methods
    function damage(x, y, amount) {
        spawn(x, y, amount, 'DAMAGE');
    }
    
    function crit(x, y, amount) {
        spawn(x, y, amount + '!', 'CRIT');
    }
    
    function heal(x, y, amount) {
        spawn(x, y, '+' + amount, 'HEAL');
    }
    
    function mana(x, y, amount) {
        spawn(x, y, '+' + amount, 'MANA');
    }
    
    function xp(x, y, amount) {
        spawn(x, y, '+' + amount + ' XP', 'XP');
    }
    
    function gold(x, y, amount) {
        spawn(x, y, '+' + amount + 'g', 'GOLD');
    }
    
    function miss(x, y) {
        spawn(x, y, 'MISS', 'MISS');
    }
    
    function block(x, y) {
        spawn(x, y, 'BLOCK', 'BLOCK');
    }
    
    function immune(x, y) {
        spawn(x, y, 'IMMUNE', 'IMMUNE');
    }
    
    function status(x, y, text) {
        spawn(x, y, text, 'STATUS');
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  U P D A T E
    // ═══════════════════════════════════════════════════════════════
    
    function update(dt) {
        for (const num of active) {
            if (!num.active) continue;
            
            num.life -= dt;
            
            if (num.life <= 0) {
                num.active = false;
                continue;
            }
            
            // Physics
            num.vy += 80 * dt; // Gravity
            num.x += num.vx * dt;
            num.y += num.vy * dt;
            num.vx *= 0.98; // Friction
            
            // Shake for crits
            if (num.shake) {
                num.shakeOffset = (Math.random() - 0.5) * 3;
            }
            
            // Fade out in last 30% of life
            const lifeRatio = num.life / num.maxLife;
            if (lifeRatio < 0.3) {
                num.alpha = lifeRatio / 0.3;
            }
            
            // Scale pop on spawn
            if (lifeRatio > 0.9) {
                num.scale = num.type.scale * (1 + (lifeRatio - 0.9) * 3);
            } else {
                num.scale = num.type.scale;
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  R E N D E R
    // ═══════════════════════════════════════════════════════════════
    
    function render(ctx) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (const num of active) {
            if (!num.active) continue;
            
            const fontSize = Math.round(10 * num.scale);
            ctx.font = `bold ${fontSize}px monospace`;
            
            const x = Math.round(num.x + num.shakeOffset);
            const y = Math.round(num.y);
            
            ctx.globalAlpha = num.alpha;
            
            // Shadow
            ctx.fillStyle = num.type.shadow;
            ctx.fillText(num.text, x + 1, y + 1);
            
            // Main text
            ctx.fillStyle = num.type.color;
            ctx.fillText(num.text, x, y);
            
            // Outline for crits
            if (num.type === TYPES.CRIT) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.strokeText(num.text, x, y);
            }
        }
        
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }
    
    function clear() {
        for (const num of active) {
            num.active = false;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P U B L I C   A P I
    // ═══════════════════════════════════════════════════════════════
    
    return {
        spawn,
        update,
        render,
        clear,
        
        // Convenience
        damage,
        crit,
        heal,
        mana,
        xp,
        gold,
        miss,
        block,
        immune,
        status,
        
        // Types for custom spawns
        TYPES,
        
        // Debug
        getActiveCount: () => active.filter(n => n.active).length
    };
    
})();

console.log('[DamageNumbers] Initialized');