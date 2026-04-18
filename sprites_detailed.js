/*************************************************************
 * sprites_detailed.js — Detailed Pixel Art Sprites
 * Each sprite is 16x16, defined as pixel arrays
 *************************************************************/

const SpriteSheet = (function() {
    
    // Color palettes
    const PAL = {
        // Skin tones
        skin1: '#e0b090',
        skin2: '#c49070',
        skin3: '#a07050',
        
        // Hair
        hair_brown: '#4a3020',
        hair_black: '#202020',
        hair_blonde: '#c0a040',
        hair_red: '#8a3020',
        hair_gray: '#707070',
        hair_white: '#d0d0d0',
        
        // Clothing
        cloth_blue: '#3050a0',
        cloth_red: '#a03030',
        cloth_green: '#306030',
        cloth_brown: '#604020',
        cloth_gray: '#505050',
        cloth_black: '#252525',
        cloth_white: '#c0c0c0',
        cloth_purple: '#603080',
        cloth_gold: '#c0a030',
        
        // Metal
        metal_dark: '#404050',
        metal_light: '#808090',
        metal_gold: '#d0a020',
        metal_rust: '#804020',
        
        // Effects
        blood: '#801010',
        magic_blue: '#40a0ff',
        magic_red: '#ff4040',
        magic_green: '#40ff80',
        fire: '#ff8020',
        shadow: '#101010',
        
        // Transparent
        _: null
    };
    
    // Sprite definitions (16x16 grids)
    // Each row is a string of color keys, _ = transparent
    const SPRITES = {
        
        // === PLAYER ===
        player_down: {
            palette: PAL,
            pixels: [
                '____BBBB____',
                '___BBBBBB___',
                '___SSSSSS___',
                '___SEESSE___',
                '___SSSSSS___',
                '____SSSS____',
                '___CCCCCC___',
                '__CCCCCCCC__',
                '__CCCCCCCC__',
                '__CC_CC_CC__',
                '___CCCCCC___',
                '___CC__CC___',
                '___LL__LL___',
                '___LL__LL___',
                '___BB__BB___',
                '________________'
            ].map(row => row.replace(/B/g, 'hair_brown').replace(/S/g, 'skin1').replace(/E/g, 'shadow').replace(/C/g, 'cloth_green').replace(/L/g, 'cloth_brown').replace(/_/g, '_'))
        },
        
        // === BANDIT ===
        bandit: {
            colors: {
                outline: '#201510',
                skin: '#c09070',
                eyes: '#ff2020',
                cloth: '#403020',
                belt: '#302010',
                pants: '#252015',
                boots: '#151010',
                blade: '#a0a0a0',
                handle: '#402010'
            },
            draw: function(ctx, x, y) {
                const c = this.colors;
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x+2, y+14, 12, 2);
                // Boots
                ctx.fillStyle = c.boots;
                ctx.fillRect(x+3, y+13, 4, 3);
                ctx.fillRect(x+9, y+13, 4, 3);
                // Pants
                ctx.fillStyle = c.pants;
                ctx.fillRect(x+4, y+10, 3, 4);
                ctx.fillRect(x+9, y+10, 3, 4);
                // Belt
                ctx.fillStyle = c.belt;
                ctx.fillRect(x+3, y+9, 10, 2);
                ctx.fillStyle = '#c0a020';
                ctx.fillRect(x+7, y+9, 2, 2);
                // Body/Vest
                ctx.fillStyle = c.cloth;
                ctx.fillRect(x+3, y+5, 10, 5);
                // Arms
                ctx.fillStyle = c.skin;
                ctx.fillRect(x+1, y+5, 2, 5);
                ctx.fillRect(x+13, y+5, 2, 5);
                // Head
                ctx.fillStyle = c.skin;
                ctx.fillRect(x+4, y+1, 8, 5);
                // Bandana
                ctx.fillStyle = '#801010';
                ctx.fillRect(x+4, y+1, 8, 2);
                ctx.fillRect(x+12, y+2, 2, 2);
                // Eyes
                ctx.fillStyle = c.eyes;
                ctx.fillRect(x+5, y+3, 2, 1);
                ctx.fillRect(x+9, y+3, 2, 1);
                // Scar
                ctx.fillStyle = '#804040';
                ctx.fillRect(x+10, y+3, 1, 2);
                // Weapon (dagger)
                ctx.fillStyle = c.handle;
                ctx.fillRect(x+14, y+7, 2, 3);
                ctx.fillStyle = c.blade;
                ctx.fillRect(x+15, y+4, 1, 3);
            }
        },
        
        // === WOLF ===
        wolf: {
            colors: {
                fur_dark: '#404040',
                fur_light: '#606060',
                fur_belly: '#808080',
                eyes: '#ffcc00',
                nose: '#201010',
                teeth: '#ffffff'
            },
            draw: function(ctx, x, y) {
                const c = this.colors;
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x+1, y+14, 14, 2);
                // Back legs
                ctx.fillStyle = c.fur_dark;
                ctx.fillRect(x+10, y+10, 3, 5);
                ctx.fillRect(x+12, y+12, 2, 4);
                // Body
                ctx.fillStyle = c.fur_dark;
                ctx.fillRect(x+4, y+7, 10, 5);
                ctx.fillStyle = c.fur_light;
                ctx.fillRect(x+5, y+8, 8, 3);
                ctx.fillStyle = c.fur_belly;
                ctx.fillRect(x+6, y+10, 5, 2);
                // Front legs
                ctx.fillStyle = c.fur_dark;
                ctx.fillRect(x+3, y+10, 3, 5);
                ctx.fillRect(x+1, y+12, 2, 4);
                // Tail
                ctx.fillStyle = c.fur_dark;
                ctx.fillRect(x+13, y+5, 3, 3);
                ctx.fillRect(x+14, y+4, 2, 2);
                // Head
                ctx.fillStyle = c.fur_dark;
                ctx.fillRect(x+0, y+5, 5, 5);
                ctx.fillStyle = c.fur_light;
                ctx.fillRect(x+1, y+6, 3, 3);
                // Snout
                ctx.fillStyle = c.fur_light;
                ctx.fillRect(x-1, y+7, 2, 2);
                ctx.fillStyle = c.nose;
                ctx.fillRect(x-1, y+7, 1, 1);
                // Ears
                ctx.fillStyle = c.fur_dark;
                ctx.fillRect(x+1, y+3, 2, 3);
                ctx.fillRect(x+4, y+4, 2, 2);
                // Eyes
                ctx.fillStyle = c.eyes;
                ctx.fillRect(x+2, y+6, 1, 1);
                // Teeth
                ctx.fillStyle = c.teeth;
                ctx.fillRect(x, y+9, 1, 1);
            }
        },
        
        // === UNDEAD ===
        undead: {
            colors: {
                bone: '#c0b8a0',
                bone_dark: '#908070',
                cloth: '#302820',
                eyes: '#40ff40',
                rot: '#405020'
            },
            draw: function(ctx, x, y) {
                const c = this.colors;
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x+3, y+14, 10, 2);
                // Tattered robe
                ctx.fillStyle = c.cloth;
                ctx.fillRect(x+3, y+6, 10, 9);
                ctx.fillRect(x+2, y+8, 2, 6);
                ctx.fillRect(x+12, y+8, 2, 6);
                // Ripped edges
                ctx.fillStyle = 'transparent';
                ctx.clearRect(x+4, y+14, 2, 1);
                ctx.clearRect(x+9, y+13, 2, 2);
                // Skeletal hands
                ctx.fillStyle = c.bone;
                ctx.fillRect(x+1, y+10, 2, 3);
                ctx.fillRect(x+13, y+10, 2, 3);
                // Skull
                ctx.fillStyle = c.bone;
                ctx.fillRect(x+4, y+1, 8, 6);
                ctx.fillStyle = c.bone_dark;
                ctx.fillRect(x+4, y+6, 8, 1);
                // Eye sockets
                ctx.fillStyle = '#101010';
                ctx.fillRect(x+5, y+2, 2, 2);
                ctx.fillRect(x+9, y+2, 2, 2);
                // Glowing eyes
                ctx.fillStyle = c.eyes;
                ctx.fillRect(x+5, y+3, 2, 1);
                ctx.fillRect(x+9, y+3, 2, 1);
                // Nose hole
                ctx.fillStyle = '#101010';
                ctx.fillRect(x+7, y+4, 2, 1);
                // Teeth
                ctx.fillStyle = c.bone;
                ctx.fillRect(x+5, y+5, 6, 1);
                ctx.fillStyle = '#101010';
                ctx.fillRect(x+6, y+5, 1, 1);
                ctx.fillRect(x+8, y+5, 1, 1);
                ctx.fillRect(x+10, y+5, 1, 1);
            }
        },
        
        // === SPIRIT/GHOST ===
        spirit: {
            colors: {
                body: 'rgba(100,150,200,0.6)',
                core: 'rgba(150,200,255,0.8)',
                eyes: '#ffffff'
            },
            draw: function(ctx, x, y) {
                const c = this.colors;
                const t = performance.now() / 500;
                const hover = Math.sin(t) * 2;
                // Wispy tail
                ctx.fillStyle = c.body;
                ctx.beginPath();
                ctx.moveTo(x+4, y+14);
                ctx.quadraticCurveTo(x+8, y+12+hover, x+12, y+14);
                ctx.quadraticCurveTo(x+10, y+16, x+8, y+15);
                ctx.quadraticCurveTo(x+6, y+16, x+4, y+14);
                ctx.fill();
                // Main body
                ctx.fillStyle = c.body;
                ctx.beginPath();
                ctx.ellipse(x+8, y+7+hover, 6, 7, 0, 0, Math.PI*2);
                ctx.fill();
                // Core glow
                ctx.fillStyle = c.core;
                ctx.beginPath();
                ctx.ellipse(x+8, y+6+hover, 3, 4, 0, 0, Math.PI*2);
                ctx.fill();
                // Eyes
                ctx.fillStyle = c.eyes;
                ctx.fillRect(x+5, y+5+hover, 2, 2);
                ctx.fillRect(x+9, y+5+hover, 2, 2);
            }
        },
        
        // === BOSS ===
        boss: {
            colors: {
                armor: '#302030',
                armor_trim: '#604060',
                glow: '#ff2080',
                eyes: '#ff0040',
                cape: '#401020',
                metal: '#505060'
            },
            draw: function(ctx, x, y) {
                const c = this.colors;
                const t = performance.now() / 300;
                // Shadow (larger)
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.fillRect(x, y+13, 16, 3);
                // Cape
                ctx.fillStyle = c.cape;
                ctx.fillRect(x+2, y+4, 12, 11);
                ctx.fillRect(x+1, y+6, 2, 8);
                ctx.fillRect(x+13, y+6, 2, 8);
                // Boots
                ctx.fillStyle = c.armor;
                ctx.fillRect(x+3, y+12, 4, 3);
                ctx.fillRect(x+9, y+12, 4, 3);
                // Legs
                ctx.fillStyle = c.armor;
                ctx.fillRect(x+4, y+9, 3, 4);
                ctx.fillRect(x+9, y+9, 3, 4);
                // Body armor
                ctx.fillStyle = c.armor;
                ctx.fillRect(x+3, y+4, 10, 6);
                ctx.fillStyle = c.armor_trim;
                ctx.fillRect(x+3, y+4, 10, 1);
                ctx.fillRect(x+7, y+4, 2, 6);
                // Shoulders
                ctx.fillStyle = c.armor;
                ctx.fillRect(x+1, y+4, 3, 3);
                ctx.fillRect(x+12, y+4, 3, 3);
                ctx.fillStyle = c.armor_trim;
                ctx.fillRect(x+1, y+4, 3, 1);
                ctx.fillRect(x+12, y+4, 3, 1);
                // Helmet
                ctx.fillStyle = c.armor;
                ctx.fillRect(x+4, y+0, 8, 5);
                ctx.fillStyle = c.armor_trim;
                ctx.fillRect(x+4, y+0, 8, 1);
                ctx.fillRect(x+3, y+1, 1, 3);
                ctx.fillRect(x+12, y+1, 1, 3);
                // Visor slit
                ctx.fillStyle = '#000';
                ctx.fillRect(x+5, y+2, 6, 2);
                // Glowing eyes
                ctx.fillStyle = c.eyes;
                ctx.fillRect(x+6, y+2, 2, 1);
                ctx.fillRect(x+10, y+2, 2, 1);
                // Pulsing glow effect
                const glowAlpha = 0.3 + Math.sin(t) * 0.2;
                ctx.fillStyle = `rgba(255,32,128,${glowAlpha})`;
                ctx.fillRect(x+5, y+1, 6, 3);
                // Weapon (greatsword)
                ctx.fillStyle = c.metal;
                ctx.fillRect(x+15, y+0, 2, 12);
                ctx.fillStyle = c.armor_trim;
                ctx.fillRect(x+14, y+10, 4, 2);
            }
        },
        
        // === NPC: MERCHANT ===
        merchant: {
            draw: function(ctx, x, y) {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x+3, y+14, 10, 2);
                // Robe
                ctx.fillStyle = '#604020';
                ctx.fillRect(x+3, y+6, 10, 9);
                ctx.fillRect(x+2, y+8, 2, 6);
                ctx.fillRect(x+12, y+8, 2, 6);
                // Apron
                ctx.fillStyle = '#c0a060';
                ctx.fillRect(x+5, y+8, 6, 6);
                // Head
                ctx.fillStyle = '#d0a080';
                ctx.fillRect(x+4, y+1, 8, 6);
                // Beard
                ctx.fillStyle = '#504030';
                ctx.fillRect(x+5, y+5, 6, 3);
                ctx.fillRect(x+6, y+7, 4, 1);
                // Eyes
                ctx.fillStyle = '#202020';
                ctx.fillRect(x+5, y+3, 2, 1);
                ctx.fillRect(x+9, y+3, 2, 1);
                // Hat
                ctx.fillStyle = '#803020';
                ctx.fillRect(x+3, y+0, 10, 2);
                ctx.fillRect(x+5, y-1, 6, 2);
            }
        },
        
        // === NPC: GUARD ===
        guard: {
            draw: function(ctx, x, y) {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x+3, y+14, 10, 2);
                // Boots
                ctx.fillStyle = '#302010';
                ctx.fillRect(x+4, y+13, 3, 3);
                ctx.fillRect(x+9, y+13, 3, 3);
                // Chainmail legs
                ctx.fillStyle = '#606070';
                ctx.fillRect(x+4, y+9, 3, 5);
                ctx.fillRect(x+9, y+9, 3, 5);
                // Body armor
                ctx.fillStyle = '#505060';
                ctx.fillRect(x+3, y+4, 10, 6);
                // Chest emblem
                ctx.fillStyle = '#c0a020';
                ctx.fillRect(x+7, y+5, 2, 3);
                // Helmet
                ctx.fillStyle = '#505060';
                ctx.fillRect(x+4, y+0, 8, 5);
                ctx.fillRect(x+3, y+2, 10, 2);
                // Face
                ctx.fillStyle = '#c09070';
                ctx.fillRect(x+5, y+2, 6, 3);
                // Eyes
                ctx.fillStyle = '#202020';
                ctx.fillRect(x+6, y+3, 1, 1);
                ctx.fillRect(x+9, y+3, 1, 1);
                // Spear
                ctx.fillStyle = '#604020';
                ctx.fillRect(x+14, y+2, 2, 12);
                ctx.fillStyle = '#808090';
                ctx.fillRect(x+14, y+0, 2, 3);
            }
        },
        
        // === NPC: ELDER ===
        elder: {
            draw: function(ctx, x, y) {
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(x+3, y+14, 10, 2);
                // Robe
                ctx.fillStyle = '#404080';
                ctx.fillRect(x+3, y+5, 10, 10);
                ctx.fillRect(x+2, y+7, 2, 7);
                ctx.fillRect(x+12, y+7, 2, 7);
                // Robe trim
                ctx.fillStyle = '#c0a040';
                ctx.fillRect(x+3, y+5, 10, 1);
                ctx.fillRect(x+7, y+5, 2, 9);
                // Staff
                ctx.fillStyle = '#604020';
                ctx.fillRect(x+1, y+3, 2, 12);
                ctx.fillStyle = '#40a0ff';
                ctx.fillRect(x+0, y+1, 4, 3);
                // Head
                ctx.fillStyle = '#d0a080';
                ctx.fillRect(x+5, y+1, 6, 5);
                // Beard
                ctx.fillStyle = '#d0d0d0';
                ctx.fillRect(x+5, y+5, 6, 4);
                ctx.fillRect(x+6, y+8, 4, 2);
                // Eyes
                ctx.fillStyle = '#202020';
                ctx.fillRect(x+6, y+3, 1, 1);
                ctx.fillRect(x+9, y+3, 1, 1);
                // Hood
                ctx.fillStyle = '#303060';
                ctx.fillRect(x+4, y+0, 8, 2);
                ctx.fillRect(x+3, y+1, 2, 3);
                ctx.fillRect(x+11, y+1, 2, 3);
            }
        }
    };
    
    // Render function
    function render(ctx, spriteName, x, y) {
        const sprite = SPRITES[spriteName];
        if (!sprite) {
            // Fallback: simple square
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(x+4, y+4, 8, 8);
            return;
        }
        
        if (sprite.draw) {
            sprite.draw(ctx, x, y);
        }
    }
    
    return {
        render,
        SPRITES,
        PAL
    };
    
})();

console.log('[SpriteSheet] Detailed sprites loaded');