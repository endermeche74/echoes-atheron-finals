/*************************************************************
 * spritedata.js — Sprite Definitions
 * Contains: All character sprites with procedural pixel art
 * 
 * Each sprite has a custom draw() function that renders
 * pixel-perfect art based on animation state and direction
 *************************************************************/

(function() {
    const S = Sprites;
    const DIR = S.DIRECTIONS;
    const ANIM = S.ANIM_STATES;
    
    // ═══════════════════════════════════════════════════════════════
    //  P L A Y E R   S P R I T E
    // ═══════════════════════════════════════════════════════════════
    
    S.register('player', {
        type: 'procedural',
        palette: {
            skin: '#c4a882',
            hair: '#4a3a2a',
            tunic: '#5a6a5a',
            tunicLight: '#6a7a6a',
            tunicDark: '#4a5a4a',
            pants: '#3a3a4a',
            boots: '#2a2a2a',
            outline: '#1a1a1a'
        },
        animations: {
            idle: { frames: 2, speed: 0.5 },
            walk: { frames: 4, speed: 0.12 },
            attack: { frames: 3, speed: 0.1, loop: false },
            hurt: { frames: 2, speed: 0.15, loop: false }
        },
        draw: function(ctx, x, y, anim, p) {
            const dir = anim ? anim.direction : DIR.DOWN;
            const frame = anim ? anim.frame : 0;
            const state = anim ? anim.state : ANIM.IDLE;
            const isWalking = state === ANIM.WALK;
            
            // Animation offsets
            const breathe = state === ANIM.IDLE ? Math.sin(frame * Math.PI) * 0.5 : 0;
            const walkBob = isWalking ? Math.sin(frame * Math.PI / 2) * 1 : 0;
            const legPhase = frame % 2;
            
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath();
            ctx.ellipse(x + 8, y + 15, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // === BODY BASED ON DIRECTION ===
            switch (dir) {
                case DIR.DOWN:
                    drawPlayerFront(ctx, x, y, p, frame, isWalking, walkBob, breathe);
                    break;
                case DIR.UP:
                    drawPlayerBack(ctx, x, y, p, frame, isWalking, walkBob, breathe);
                    break;
                case DIR.LEFT:
                    drawPlayerSide(ctx, x, y, p, frame, isWalking, walkBob, breathe, true);
                    break;
                case DIR.RIGHT:
                    drawPlayerSide(ctx, x, y, p, frame, isWalking, walkBob, breathe, false);
                    break;
            }
        }
    });
    
    function drawPlayerFront(ctx, x, y, p, frame, isWalking, bob, breathe) {
        const yOff = -bob;
        
        // Boots
        ctx.fillStyle = p.boots;
        if (isWalking) {
            ctx.fillRect(x + 4, y + 13 + (frame % 2 === 0 ? 0 : 1), 3, 3);
            ctx.fillRect(x + 9, y + 13 + (frame % 2 === 1 ? 0 : 1), 3, 3);
        } else {
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9, y + 13, 3, 3);
        }
        
        // Pants
        ctx.fillStyle = p.pants;
        ctx.fillRect(x + 4, y + 10 + yOff, 3, 4);
        ctx.fillRect(x + 9, y + 10 + yOff, 3, 4);
        
        // Tunic body
        ctx.fillStyle = p.tunic;
        ctx.fillRect(x + 3, y + 5 + yOff - breathe, 10, 6);
        
        // Tunic shading
        ctx.fillStyle = p.tunicDark;
        ctx.fillRect(x + 3, y + 5 + yOff - breathe, 1, 6);
        ctx.fillRect(x + 12, y + 5 + yOff - breathe, 1, 6);
        
        // Belt
        ctx.fillStyle = p.boots;
        ctx.fillRect(x + 4, y + 9 + yOff - breathe, 8, 1);
        
        // Arms
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 2, y + 6 + yOff - breathe, 2, 4);
        ctx.fillRect(x + 12, y + 6 + yOff - breathe, 2, 4);
        
        // Head
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 4, y + 1 + yOff - breathe, 8, 5);
        
        // Hair
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 4, y + 0 + yOff - breathe, 8, 2);
        ctx.fillRect(x + 3, y + 1 + yOff - breathe, 2, 2);
        ctx.fillRect(x + 11, y + 1 + yOff - breathe, 2, 2);
        
        // Eyes
        ctx.fillStyle = p.outline;
        ctx.fillRect(x + 5, y + 3 + yOff - breathe, 2, 2);
        ctx.fillRect(x + 9, y + 3 + yOff - breathe, 2, 2);
        
        // Eye whites
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 3 + yOff - breathe, 1, 1);
        ctx.fillRect(x + 9, y + 3 + yOff - breathe, 1, 1);
    }
    
    function drawPlayerBack(ctx, x, y, p, frame, isWalking, bob, breathe) {
        const yOff = -bob;
        
        // Boots
        ctx.fillStyle = p.boots;
        if (isWalking) {
            ctx.fillRect(x + 4, y + 13 + (frame % 2 === 0 ? 0 : 1), 3, 3);
            ctx.fillRect(x + 9, y + 13 + (frame % 2 === 1 ? 0 : 1), 3, 3);
        } else {
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9, y + 13, 3, 3);
        }
        
        // Pants
        ctx.fillStyle = p.pants;
        ctx.fillRect(x + 4, y + 10 + yOff, 3, 4);
        ctx.fillRect(x + 9, y + 10 + yOff, 3, 4);
        
        // Tunic body
        ctx.fillStyle = p.tunic;
        ctx.fillRect(x + 3, y + 5 + yOff - breathe, 10, 6);
        
        // Back shading
        ctx.fillStyle = p.tunicDark;
        ctx.fillRect(x + 6, y + 5 + yOff - breathe, 4, 5);
        
        // Belt
        ctx.fillStyle = p.boots;
        ctx.fillRect(x + 4, y + 9 + yOff - breathe, 8, 1);
        
        // Arms
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 2, y + 6 + yOff - breathe, 2, 4);
        ctx.fillRect(x + 12, y + 6 + yOff - breathe, 2, 4);
        
        // Head (back)
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 4, y + 0 + yOff - breathe, 8, 6);
        
        // Neck
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 6, y + 5 + yOff - breathe, 4, 1);
    }
    
    function drawPlayerSide(ctx, x, y, p, frame, isWalking, bob, breathe, flipX) {
        const yOff = -bob;
        const xBase = flipX ? x : x;
        
        // Offset for flip
        const px = (i) => flipX ? x + 15 - i : x + i;
        
        // Boots
        ctx.fillStyle = p.boots;
        if (isWalking) {
            const step = frame % 4;
            ctx.fillRect(px(5) - (flipX?3:0), y + 13 + (step < 2 ? 0 : 1), 3, 3);
            ctx.fillRect(px(8) - (flipX?3:0), y + 13 + (step >= 2 ? 0 : 1), 3, 3);
        } else {
            ctx.fillRect(px(6) - (flipX?3:0), y + 13, 4, 3);
        }
        
        // Pants
        ctx.fillStyle = p.pants;
        ctx.fillRect(px(5) - (flipX?4:0), y + 10 + yOff, 5, 4);
        
        // Tunic
        ctx.fillStyle = p.tunic;
        ctx.fillRect(px(4) - (flipX?6:0), y + 5 + yOff - breathe, 7, 6);
        
        // Arm (front)
        ctx.fillStyle = p.skin;
        const armSwing = isWalking ? Math.sin(frame * Math.PI / 2) * 2 : 0;
        ctx.fillRect(px(flipX ? 2 : 10) - (flipX?2:0), y + 6 + yOff - breathe + armSwing, 2, 4);
        
        // Head
        ctx.fillStyle = p.skin;
        ctx.fillRect(px(5) - (flipX?6:0), y + 1 + yOff - breathe, 6, 5);
        
        // Hair
        ctx.fillStyle = p.hair;
        ctx.fillRect(px(5) - (flipX?6:0), y + 0 + yOff - breathe, 6, 2);
        ctx.fillRect(px(flipX ? 9 : 4) - (flipX?2:0), y + 1 + yOff - breathe, 2, 3);
        
        // Eye
        ctx.fillStyle = p.outline;
        ctx.fillRect(px(flipX ? 5 : 9) - (flipX?2:0), y + 3 + yOff - breathe, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px(flipX ? 5 : 9) - (flipX?1:0), y + 3 + yOff - breathe, 1, 1);
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  N P C   S P R I T E S
    // ═══════════════════════════════════════════════════════════════
    
    // Generic NPC template
    function createNPCSprite(id, palette) {
        S.register(id, {
            type: 'procedural',
            palette: palette,
            animations: {
                idle: { frames: 2, speed: 0.6 },
                walk: { frames: 4, speed: 0.15 }
            },
            draw: function(ctx, x, y, anim, p) {
                const dir = anim ? anim.direction : DIR.DOWN;
                const frame = anim ? anim.frame : 0;
                const breathe = Math.sin(frame * Math.PI) * 0.3;
                
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.beginPath();
                ctx.ellipse(x + 8, y + 15, 5, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Robe/body
                ctx.fillStyle = p.robe || p.tunic || '#6a5a4a';
                ctx.fillRect(x + 3, y + 4 - breathe, 10, 11);
                
                // Robe shading
                ctx.fillStyle = p.robeDark || p.tunicDark || '#5a4a3a';
                ctx.fillRect(x + 3, y + 4 - breathe, 2, 11);
                ctx.fillRect(x + 11, y + 4 - breathe, 2, 11);
                
                // Head
                ctx.fillStyle = p.skin || '#b0a090';
                ctx.fillRect(x + 4, y + 1 - breathe, 8, 5);
                
                // Hair/hood
                ctx.fillStyle = p.hair || p.hood || '#4a4a4a';
                ctx.fillRect(x + 4, y + 0 - breathe, 8, 2);
                
                // Face based on direction
                if (dir === DIR.DOWN || dir === DIR.LEFT || dir === DIR.RIGHT) {
                    // Eyes
                    ctx.fillStyle = '#202020';
                    if (dir === DIR.DOWN) {
                        ctx.fillRect(x + 5, y + 3 - breathe, 2, 2);
                        ctx.fillRect(x + 9, y + 3 - breathe, 2, 2);
                    } else if (dir === DIR.LEFT) {
                        ctx.fillRect(x + 5, y + 3 - breathe, 2, 2);
                    } else {
                        ctx.fillRect(x + 9, y + 3 - breathe, 2, 2);
                    }
                }
                
                // Quest marker if applicable
                if (p.hasQuest) {
                    ctx.fillStyle = '#ffdd44';
                    ctx.font = 'bold 8px monospace';
                    ctx.fillText('!', x + 6, y - 2);
                }
            }
        });
    }
    
    // Register NPC variants
    createNPCSprite('npc_default', {
        skin: '#b0a090', robe: '#6a5a4a', robeDark: '#5a4a3a', hair: '#4a3a2a'
    });
    
    createNPCSprite('npc_monk', {
        skin: '#c0a080', robe: '#8a7a5a', robeDark: '#7a6a4a', hood: '#8a7a5a'
    });
    
    createNPCSprite('npc_guard', {
        skin: '#b09a80', robe: '#5a5a6a', robeDark: '#4a4a5a', hair: '#3a3a3a'
    });
    
    createNPCSprite('npc_merchant', {
        skin: '#c0a890', robe: '#6a5a3a', robeDark: '#5a4a2a', hair: '#5a4a3a'
    });
    
    createNPCSprite('npc_elder', {
        skin: '#c0b0a0', robe: '#7a6a5a', robeDark: '#6a5a4a', hair: '#9a9a9a'
    });
    
    createNPCSprite('npc_hooded', {
        skin: '#9a8a7a', robe: '#3a3a4a', robeDark: '#2a2a3a', hood: '#3a3a4a'
    });
    
    createNPCSprite('npc_sailor', {
        skin: '#b09080', robe: '#4a5a6a', robeDark: '#3a4a5a', hair: '#3a3a3a'
    });
    
    createNPCSprite('npc_ashfolk', {
        skin: '#9a8a7a', robe: '#5a4a3a', robeDark: '#4a3a2a', hair: '#3a2a1a'
    });
    
    createNPCSprite('npc_warden', {
        skin: '#a09a90', robe: '#5a5a6a', robeDark: '#4a4a5a', hair: '#4a4a4a'
    });
    
    // ═══════════════════════════════════════════════════════════════
    //  E N E M Y   S P R I T E S
    // ═══════════════════════════════════════════════════════════════
    
    // Wolf
    S.register('enemy_wolf', {
        type: 'procedural',
        palette: {
            fur: '#5a5a5a',
            furDark: '#4a4a4a',
            furLight: '#6a6a6a',
            eyes: '#ff3030',
            nose: '#2a2a2a'
        },
        animations: {
            idle: { frames: 2, speed: 0.4 },
            walk: { frames: 4, speed: 0.1 },
            attack: { frames: 3, speed: 0.08 }
        },
        draw: function(ctx, x, y, anim, p) {
            const frame = anim ? anim.frame : 0;
            const dir = anim ? anim.direction : DIR.DOWN;
            const state = anim ? anim.state : ANIM.IDLE;
            const isMoving = state === ANIM.WALK;
            
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(x + 8, y + 14, 6, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            const bounce = isMoving ? Math.sin(frame * Math.PI / 2) : 0;
            
            // Body
            ctx.fillStyle = p.fur;
            ctx.fillRect(x + 2, y + 6 - bounce, 12, 7);
            
            // Body shading
            ctx.fillStyle = p.furDark;
            ctx.fillRect(x + 2, y + 10 - bounce, 12, 3);
            
            // Legs
            ctx.fillStyle = p.furDark;
            if (isMoving) {
                const legOff = frame % 2;
                ctx.fillRect(x + 3, y + 12, 2, 3 + legOff);
                ctx.fillRect(x + 11, y + 12, 2, 3 - legOff);
            } else {
                ctx.fillRect(x + 3, y + 12, 2, 4);
                ctx.fillRect(x + 7, y + 12, 2, 4);
                ctx.fillRect(x + 11, y + 12, 2, 4);
            }
            
            // Head
            ctx.fillStyle = p.fur;
            if (dir === DIR.LEFT) {
                ctx.fillRect(x + 0, y + 4 - bounce, 6, 5);
                ctx.fillStyle = p.eyes;
                ctx.fillRect(x + 1, y + 5 - bounce, 2, 2);
            } else if (dir === DIR.RIGHT) {
                ctx.fillRect(x + 10, y + 4 - bounce, 6, 5);
                ctx.fillStyle = p.eyes;
                ctx.fillRect(x + 13, y + 5 - bounce, 2, 2);
            } else {
                ctx.fillRect(x + 4, y + 3 - bounce, 8, 5);
                // Eyes
                ctx.fillStyle = p.eyes;
                ctx.fillRect(x + 5, y + 4 - bounce, 2, 2);
                ctx.fillRect(x + 9, y + 4 - bounce, 2, 2);
                // Snout
                ctx.fillStyle = p.furLight;
                ctx.fillRect(x + 6, y + 6 - bounce, 4, 2);
                ctx.fillStyle = p.nose;
                ctx.fillRect(x + 7, y + 6 - bounce, 2, 1);
            }
            
            // Tail
            ctx.fillStyle = p.furDark;
            if (dir === DIR.UP) {
                ctx.fillRect(x + 7, y + 12, 2, 3);
            }
        }
    });
    
    // Bandit
    S.register('enemy_bandit', {
        type: 'procedural',
        palette: {
            skin: '#a08a70',
            tunic: '#5a4030',
            tunicDark: '#4a3020',
            pants: '#3a3a3a',
            mask: '#2a2a2a',
            weapon: '#8a8a8a'
        },
        animations: {
            idle: { frames: 2, speed: 0.5 },
            walk: { frames: 4, speed: 0.12 },
            attack: { frames: 3, speed: 0.1 }
        },
        draw: function(ctx, x, y, anim, p) {
            const frame = anim ? anim.frame : 0;
            const dir = anim ? anim.direction : DIR.DOWN;
            const isMoving = anim && anim.state === ANIM.WALK;
            const bob = isMoving ? Math.sin(frame * Math.PI / 2) : 0;
            
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath();
            ctx.ellipse(x + 8, y + 15, 5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Boots
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9, y + 13, 3, 3);
            
            // Pants
            ctx.fillStyle = p.pants;
            ctx.fillRect(x + 4, y + 10 - bob, 3, 4);
            ctx.fillRect(x + 9, y + 10 - bob, 3, 4);
            
            // Tunic
            ctx.fillStyle = p.tunic;
            ctx.fillRect(x + 3, y + 5 - bob, 10, 6);
            ctx.fillStyle = p.tunicDark;
            ctx.fillRect(x + 3, y + 5 - bob, 2, 6);
            
            // Weapon (dagger)
            ctx.fillStyle = p.weapon;
            ctx.fillRect(x + 13, y + 8 - bob, 2, 5);
            ctx.fillStyle = '#5a4030';
            ctx.fillRect(x + 13, y + 7 - bob, 2, 2);
            
            // Head
            ctx.fillStyle = p.skin;
            ctx.fillRect(x + 4, y + 1 - bob, 8, 5);
            
            // Mask/bandana
            ctx.fillStyle = p.mask;
            ctx.fillRect(x + 4, y + 4 - bob, 8, 2);
            
            // Eyes (menacing)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + 5, y + 2 - bob, 2, 2);
            ctx.fillRect(x + 9, y + 2 - bob, 2, 2);
            ctx.fillStyle = '#202020';
            ctx.fillRect(x + 6, y + 3 - bob, 1, 1);
            ctx.fillRect(x + 10, y + 3 - bob, 1, 1);
        }
    });
    
    // Skeleton/Undead
    S.register('enemy_undead', {
        type: 'procedural',
        palette: {
            bone: '#d0d0c0',
            boneDark: '#a0a090',
            eyes: '#40ff40',
            cloth: '#4a4a5a'
        },
        animations: {
            idle: { frames: 2, speed: 0.6 },
            walk: { frames: 4, speed: 0.18 },
            attack: { frames: 3, speed: 0.12 }
        },
        draw: function(ctx, x, y, anim, p) {
            const frame = anim ? anim.frame : 0;
            const jitter = Math.sin(frame * Math.PI * 2) * 0.5;
            
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(x + 8, y + 15, 4, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Leg bones
            ctx.fillStyle = p.bone;
            ctx.fillRect(x + 5, y + 10 + jitter, 2, 6);
            ctx.fillRect(x + 9, y + 10 + jitter, 2, 6);
            
            // Ribcage
            ctx.fillStyle = p.cloth;
            ctx.fillRect(x + 4, y + 5 + jitter, 8, 6);
            ctx.fillStyle = p.bone;
            ctx.fillRect(x + 5, y + 6 + jitter, 6, 1);
            ctx.fillRect(x + 5, y + 8 + jitter, 6, 1);
            
            // Arms
            ctx.fillRect(x + 2, y + 6 + jitter, 2, 5);
            ctx.fillRect(x + 12, y + 6 + jitter, 2, 5);
            
            // Skull
            ctx.fillStyle = p.bone;
            ctx.fillRect(x + 4, y + 0 + jitter, 8, 6);
            
            // Skull shading
            ctx.fillStyle = p.boneDark;
            ctx.fillRect(x + 5, y + 4 + jitter, 2, 2); // Nose hole
            ctx.fillRect(x + 9, y + 4 + jitter, 2, 2);
            
            // Glowing eyes
            ctx.fillStyle = p.eyes;
            ctx.fillRect(x + 5, y + 2 + jitter, 2, 2);
            ctx.fillRect(x + 9, y + 2 + jitter, 2, 2);
        }
    });
    
    // Spirit/Ghost
    S.register('enemy_spirit', {
        type: 'procedural',
        palette: {
            body: '#6a7a8a',
            bodyLight: '#8a9aaa',
            eyes: '#ffffff'
        },
        animations: {
            idle: { frames: 4, speed: 0.2 },
            walk: { frames: 4, speed: 0.15 }
        },
        draw: function(ctx, x, y, anim, p) {
            const frame = anim ? anim.frame : 0;
            const float = Math.sin(frame * Math.PI / 2) * 2;
            const wave = Math.sin(frame * Math.PI) * 1;
            
            // Ghostly transparency
            ctx.globalAlpha = 0.7;
            
            // Body (wavy bottom)
            ctx.fillStyle = p.body;
            ctx.beginPath();
            ctx.moveTo(x + 3, y + 4 - float);
            ctx.lineTo(x + 13, y + 4 - float);
            ctx.lineTo(x + 14, y + 12 - float);
            ctx.lineTo(x + 12, y + 14 - float + wave);
            ctx.lineTo(x + 10, y + 12 - float);
            ctx.lineTo(x + 8, y + 15 - float - wave);
            ctx.lineTo(x + 6, y + 12 - float);
            ctx.lineTo(x + 4, y + 14 - float + wave);
            ctx.lineTo(x + 2, y + 12 - float);
            ctx.closePath();
            ctx.fill();
            
            // Inner glow
            ctx.fillStyle = p.bodyLight;
            ctx.fillRect(x + 5, y + 5 - float, 6, 4);
            
            // Eyes
            ctx.fillStyle = p.eyes;
            ctx.fillRect(x + 5, y + 6 - float, 2, 2);
            ctx.fillRect(x + 9, y + 6 - float, 2, 2);
            
            // Eye pupils (black)
            ctx.fillStyle = '#000000';
            ctx.fillRect(x + 6, y + 7 - float, 1, 1);
            ctx.fillRect(x + 10, y + 7 - float, 1, 1);
            
            ctx.globalAlpha = 1.0;
        }
    });
    
    // Boss: Guardian
    S.register('enemy_boss', {
        type: 'procedural',
        palette: {
            armor: '#5a5a6a',
            armorLight: '#7a7a8a',
            armorDark: '#3a3a4a',
            glow: '#6a8aaa',
            eyes: '#88ccff'
        },
        animations: {
            idle: { frames: 2, speed: 0.8 },
            walk: { frames: 4, speed: 0.2 },
            attack: { frames: 4, speed: 0.1 }
        },
        draw: function(ctx, x, y, anim, p) {
            const frame = anim ? anim.frame : 0;
            const pulse = Math.sin(frame * Math.PI) * 0.5;
            
            // Shadow (bigger for boss)
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath();
            ctx.ellipse(x + 8, y + 15, 7, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Legs
            ctx.fillStyle = p.armorDark;
            ctx.fillRect(x + 3, y + 11, 4, 5);
            ctx.fillRect(x + 9, y + 11, 4, 5);
            
            // Body armor
            ctx.fillStyle = p.armor;
            ctx.fillRect(x + 2, y + 4, 12, 8);
            
            // Armor details
            ctx.fillStyle = p.armorLight;
            ctx.fillRect(x + 6, y + 5, 4, 6);
            ctx.fillStyle = p.armorDark;
            ctx.fillRect(x + 2, y + 4, 2, 8);
            ctx.fillRect(x + 12, y + 4, 2, 8);
            
            // Shoulder pads
            ctx.fillStyle = p.armor;
            ctx.fillRect(x + 0, y + 4, 4, 4);
            ctx.fillRect(x + 12, y + 4, 4, 4);
            
            // Glowing core
            ctx.fillStyle = p.glow;
            ctx.globalAlpha = 0.5 + pulse * 0.3;
            ctx.fillRect(x + 6, y + 6, 4, 4);
            ctx.globalAlpha = 1.0;
            
            // Helmet
            ctx.fillStyle = p.armor;
            ctx.fillRect(x + 3, y + 0, 10, 5);
            ctx.fillStyle = p.armorDark;
            ctx.fillRect(x + 3, y + 0, 10, 1);
            
            // Visor
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(x + 4, y + 2, 8, 2);
            
            // Glowing eyes
            ctx.fillStyle = p.eyes;
            ctx.fillRect(x + 5, y + 2, 2, 2);
            ctx.fillRect(x + 9, y + 2, 2, 2);
        }
    });
    
    // ═══════════════════════════════════════════════════════════════
    //  I T E M   &   O B J E C T   S P R I T E S
    // ═══════════════════════════════════════════════════════════════
    
    S.register('item_default', {
        type: 'procedural',
        palette: {
            main: '#aa9a60',
            shine: '#ccbb80'
        },
        draw: function(ctx, x, y, anim, p) {
            const frame = anim ? anim.frame : 0;
            const bob = Math.sin(frame * Math.PI / 2) * 1;
            
            // Glow
            ctx.fillStyle = 'rgba(180, 160, 80, 0.3)';
            ctx.beginPath();
            ctx.arc(x + 8, y + 10 - bob, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // Item body
            ctx.fillStyle = p.main;
            ctx.fillRect(x + 5, y + 6 - bob, 6, 6);
            
            // Shine
            ctx.fillStyle = p.shine;
            ctx.fillRect(x + 6, y + 6 - bob, 2, 2);
        }
    });
    
    S.register('item_chest', {
        type: 'procedural',
        palette: {
            wood: '#6a5030',
            woodDark: '#4a3020',
            metal: '#8a8a60',
            metalDark: '#6a6a40'
        },
        draw: function(ctx, x, y, anim, p) {
            // Chest base
            ctx.fillStyle = p.wood;
            ctx.fillRect(x + 2, y + 6, 12, 8);
            
            // Lid
            ctx.fillStyle = p.woodDark;
            ctx.fillRect(x + 2, y + 4, 12, 3);
            
            // Metal bands
            ctx.fillStyle = p.metal;
            ctx.fillRect(x + 2, y + 6, 12, 1);
            ctx.fillRect(x + 2, y + 12, 12, 1);
            
            // Lock
            ctx.fillStyle = p.metalDark;
            ctx.fillRect(x + 7, y + 7, 2, 3);
            ctx.fillStyle = p.metal;
            ctx.fillRect(x + 7, y + 7, 2, 1);
        }
    });
    
    // ═══════════════════════════════════════════════════════════════
    //  D E F A U L T   F A L L B A C K
    // ═══════════════════════════════════════════════════════════════
    
    S.register('default', {
        type: 'procedural',
        palette: {
            body: '#7a6a5a',
            head: '#a09080',
            eyes: '#202020'
        },
        draw: S.drawDefaultSprite
    });
    
    console.log('[SpriteData] Registered', S.listSprites().length, 'sprites');
    
})();