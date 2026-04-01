/*************************************************************
 * sprites.js — Sprite & Animation System
 * Handles: sprite definitions, animations, procedural pixel art
 * 
 * Two modes:
 * 1. Procedural (default) - draws sprites with canvas primitives
 * 2. Spritesheet - loads from image files (future)
 *************************************************************/

const Sprites = (function() {
    const TILE = 16;
    
    // === ANIMATION STATES ===
    const ANIM_STATES = {
        IDLE: 'idle',
        WALK: 'walk',
        ATTACK: 'attack',
        HURT: 'hurt',
        DEATH: 'death'
    };
    
    // === FACING DIRECTIONS ===
    const DIRECTIONS = {
        DOWN: 0,
        LEFT: 1,
        RIGHT: 2,
        UP: 3
    };
    
    // === SPRITE REGISTRY ===
    const sprites = {};
    
    // === SPRITESHEET CACHE (for image-based sprites) ===
    const sheetCache = {};
    
    // === REGISTER A SPRITE ===
    function register(id, definition) {
        sprites[id] = {
            id,
            type: definition.type || 'procedural', // 'procedural' or 'sheet'
            width: definition.width || TILE,
            height: definition.height || TILE,
            animations: definition.animations || {},
            palette: definition.palette || {},
            draw: definition.draw || null, // Custom draw function for procedural
            sheet: definition.sheet || null, // Spritesheet path for image-based
            frameWidth: definition.frameWidth || TILE,
            frameHeight: definition.frameHeight || TILE
        };
        return sprites[id];
    }
    
    // === GET SPRITE ===
    function get(id) {
        return sprites[id] || sprites['default'];
    }
    
    // === ANIMATION INSTANCE ===
    // Create one per entity to track animation state
    class AnimationController {
        constructor(spriteId) {
            this.spriteId = spriteId;
            this.state = ANIM_STATES.IDLE;
            this.direction = DIRECTIONS.DOWN;
            this.frame = 0;
            this.timer = 0;
            this.speed = 0.15; // seconds per frame
            this.playing = true;
            this.onComplete = null;
        }
        
        setState(state, direction = null) {
            if (this.state !== state) {
                this.state = state;
                this.frame = 0;
                this.timer = 0;
            }
            if (direction !== null) {
                this.direction = direction;
            }
        }
        
        setDirection(dir) {
            if (typeof dir === 'string') {
                this.direction = DIRECTIONS[dir.toUpperCase()] ?? DIRECTIONS.DOWN;
            } else {
                this.direction = dir;
            }
        }
        
        update(dt) {
            if (!this.playing) return;
            
            this.timer += dt;
            
            const sprite = get(this.spriteId);
            const anim = sprite.animations[this.state];
            
            if (anim && this.timer >= this.speed) {
                this.timer -= this.speed;
                this.frame++;
                
                const frameCount = anim.frames || 4;
                if (this.frame >= frameCount) {
                    if (anim.loop !== false) {
                        this.frame = 0;
                    } else {
                        this.frame = frameCount - 1;
                        this.playing = false;
                        if (this.onComplete) this.onComplete();
                    }
                }
            }
        }
        
        reset() {
            this.frame = 0;
            this.timer = 0;
            this.playing = true;
        }
    }
    
    // === RENDER SPRITE ===
    function render(ctx, spriteId, x, y, animController) {
        const sprite = get(spriteId);
        
        if (!sprite) {
            // Fallback: pink square
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(x, y, TILE, TILE);
            return;
        }
        
        if (sprite.type === 'procedural' && sprite.draw) {
            // Use custom procedural draw function
            sprite.draw(ctx, x, y, animController, sprite.palette);
        } else if (sprite.type === 'sheet' && sprite.sheet) {
            // Use spritesheet (future)
            renderFromSheet(ctx, sprite, x, y, animController);
        } else {
            // Fallback to default procedural
            drawDefaultSprite(ctx, x, y, animController, sprite.palette);
        }
    }
    
    // === RENDER FROM SPRITESHEET ===
    function renderFromSheet(ctx, sprite, x, y, anim) {
        const sheet = sheetCache[sprite.sheet];
        if (!sheet || !sheet.complete) {
            // Sheet not loaded, draw placeholder
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, sprite.width, sprite.height);
            return;
        }
        
        const frameX = anim.frame * sprite.frameWidth;
        const frameY = anim.direction * sprite.frameHeight;
        
        ctx.drawImage(
            sheet,
            frameX, frameY, sprite.frameWidth, sprite.frameHeight,
            x, y, sprite.width, sprite.height
        );
    }
    
    // === LOAD SPRITESHEET ===
    function loadSheet(path) {
        if (sheetCache[path]) return Promise.resolve(sheetCache[path]);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                sheetCache[path] = img;
                resolve(img);
            };
            img.onerror = reject;
            img.src = path;
        });
    }
    
    // === DEFAULT PROCEDURAL SPRITE ===
    function drawDefaultSprite(ctx, x, y, anim, palette) {
        const p = palette || {};
        const body = p.body || '#7a6a5a';
        const head = p.head || '#a09080';
        const eyes = p.eyes || '#202020';
        const legs = p.legs || '#505050';
        
        const dir = anim ? anim.direction : 0;
        const frame = anim ? anim.frame : 0;
        const state = anim ? anim.state : 'idle';
        
        const isMoving = state === 'walk';
        const bobY = isMoving ? Math.sin(frame * Math.PI / 2) * 1 : 0;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + 8, y + 14, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = body;
        ctx.fillRect(x + 3, y + 4 - bobY, 10, 10);
        
        // Head
        ctx.fillStyle = head;
        ctx.fillRect(x + 4, y + 1 - bobY, 8, 6);
        
        // Eyes based on direction
        ctx.fillStyle = eyes;
        switch (dir) {
            case DIRECTIONS.DOWN:
                ctx.fillRect(x + 5, y + 4 - bobY, 2, 2);
                ctx.fillRect(x + 9, y + 4 - bobY, 2, 2);
                break;
            case DIRECTIONS.UP:
                // Back of head
                ctx.fillStyle = p.hair || '#807060';
                ctx.fillRect(x + 5, y + 2 - bobY, 6, 3);
                break;
            case DIRECTIONS.LEFT:
                ctx.fillRect(x + 4, y + 4 - bobY, 2, 2);
                break;
            case DIRECTIONS.RIGHT:
                ctx.fillRect(x + 10, y + 4 - bobY, 2, 2);
                break;
        }
        
        // Legs (animated when walking)
        ctx.fillStyle = legs;
        if (isMoving) {
            const legOffset = (frame % 2) * 3 - 1;
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9 + legOffset, y + 13, 3, 3);
        } else {
            ctx.fillRect(x + 4, y + 13, 3, 3);
            ctx.fillRect(x + 9, y + 13, 3, 3);
        }
    }
    
    // === PIXEL ART HELPER ===
    // Draw pixel art from a simple string grid
    function drawPixelGrid(ctx, x, y, grid, palette, scale = 1) {
        const rows = grid.trim().split('\n');
        for (let py = 0; py < rows.length; py++) {
            const row = rows[py];
            for (let px = 0; px < row.length; px++) {
                const char = row[px];
                if (char !== ' ' && char !== '.') {
                    const color = palette[char];
                    if (color) {
                        ctx.fillStyle = color;
                        ctx.fillRect(
                            x + px * scale,
                            y + py * scale,
                            scale,
                            scale
                        );
                    }
                }
            }
        }
    }
    
    // === PUBLIC API ===
    return {
        register,
        get,
        render,
        loadSheet,
        createAnimController: (spriteId) => new AnimationController(spriteId),
        
        // Constants
        ANIM_STATES,
        DIRECTIONS,
        TILE,
        
        // Helpers
        drawPixelGrid,
        drawDefaultSprite,
        
        // For debugging
        listSprites: () => Object.keys(sprites),
        getCache: () => sheetCache
    };
})();