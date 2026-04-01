/*************************************************************
 * lighting_integration.js — Integrates Lighting into Game
 * 
 * Patches Engine and Tilemap to use dynamic lighting
 * Load AFTER: engine.js, lighting.js
 *************************************************************/

(function() {
    
    if (typeof Lighting === 'undefined') {
        console.error('[LightingIntegration] Lighting not found!');
        return;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  A R E A   C H A N G E   H O O K
    // ═══════════════════════════════════════════════════════════════
    
    if (typeof Tilemap !== 'undefined' && Tilemap.loadArea) {
        const originalLoadArea = Tilemap.loadArea;
        
        Tilemap.loadArea = function(areaId) {
            originalLoadArea(areaId);
            
            // Set lighting for new area
            Lighting.setArea(areaId);
            
            // Add lights from map data
            addLightsFromMap(areaId);
            
            console.log('[LightingIntegration] Area lighting set:', areaId);
        };
    }
    
    // Add lights defined in map entities or special tiles
    function addLightsFromMap(areaId) {
        if (typeof Maps === 'undefined' || !Maps.get) return;
        
        const map = Maps.get(areaId);
        if (!map) return;
        
        // Check for explicit lights array
        if (map.lights) {
            for (const light of map.lights) {
                Lighting.addLight(
                    light.x * 16 + 8,
                    light.y * 16 + 8,
                    light.type || 'TORCH'
                );
            }
        }
        
        // Auto-detect lights from tiles (fire, torch tiles)
        // Blood tiles (30) often indicate fire pits in our maps
        if (map.tiles) {
            const width = map.width || 20;
            
            for (let i = 0; i < map.tiles.length; i++) {
                const tile = map.tiles[i];
                const x = (i % width) * 16 + 8;
                const y = Math.floor(i / width) * 16 + 8;
                
                // Blood tile = fire/char (add fire light)
                if (tile === 30 && shouldHaveFireLight(areaId, i, width)) {
                    Lighting.addLight(x, y, 'FIRE');
                }
            }
        }
        
        // Add lights near certain NPCs
        if (map.entities) {
            for (const entity of map.entities) {
                // Smithy NPCs have forge light
                if (entity.id && entity.id.includes('smith')) {
                    Lighting.addLight(entity.x * 16, entity.y * 16, 'FIRE');
                }
                // Magic users have magic glow
                if (entity.id && (entity.id.includes('mage') || entity.id.includes('scholar'))) {
                    Lighting.addLight(entity.x * 16 + 8, entity.y * 16 + 8, 'MAGIC');
                }
            }
        }
    }
    
    // Helper to determine if a blood tile should have fire
    function shouldHaveFireLight(areaId, tileIndex, width) {
        // Fire pits in certain areas
        const fireAreas = [
            'verath_smithy',
            'ashwood_hollow',  // Central fire pit
            'ashwood_shrine',  // Eternal flame
            'verath_inn'
        ];
        
        if (!fireAreas.includes(areaId)) return false;
        
        // Limit to avoid too many lights
        // Only add fire if it's somewhat central or isolated
        const x = tileIndex % width;
        const y = Math.floor(tileIndex / width);
        
        // Skip edge tiles
        if (x < 3 || x > width - 3 || y < 3) return false;
        
        return true;
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P L A Y E R   L I G H T
    // ═══════════════════════════════════════════════════════════════
    
    // Enable player light in dark areas or at night
    function updatePlayerLightState() {
        const isNight = Lighting.isNight();
        const isIndoor = Lighting.isIndoor();
        const isDark = Lighting.getTimeOfDay() === Lighting.TIME.NIGHT;
        
        // Player has torch in dark/underground areas
        // You could tie this to an inventory item check
        if (isDark || isIndoor) {
            Lighting.enablePlayerLight(true);
        } else {
            Lighting.enablePlayerLight(false);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  R E N D E R   H O O K
    // ═══════════════════════════════════════════════════════════════
    
    // Create lighting render hook
    window.LightingHooks = {
        
        // Call in update loop
        update: function(dt) {
            Lighting.update(dt);
            updatePlayerLightState();
        },
        
        // Call after rendering world, before UI
        // Pass camera offset for proper light positioning
        render: function(ctx, width, height, camX, camY) {
            Lighting.render(ctx, width, height, camX || 0, camY || 0);
        }
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  A U T O - I N T E G R A T E
    // ═══════════════════════════════════════════════════════════════
    
    // Try to hook into Engine's render via overlay
    const lightingCanvas = document.createElement('canvas');
    lightingCanvas.id = 'lighting-overlay';
    lightingCanvas.width = 320;
    lightingCanvas.height = 240;
    lightingCanvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        mix-blend-mode: multiply;
    `;
    
    function addLightingOverlay() {
        const container = document.getElementById('canvas-container');
        if (container && !document.getElementById('lighting-overlay')) {
            container.style.position = 'relative';
            container.appendChild(lightingCanvas);
            startLightingLoop();
            console.log('[LightingIntegration] Overlay added');
            return true;
        }
        return false;
    }
    
    let lastTime = 0;
    function lightingLoop(currentTime) {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;
        
        if (typeof Engine !== 'undefined' && Engine.isCanvasMode && Engine.isCanvasMode()) {
            // Update lighting
            Lighting.update(dt);
            updatePlayerLightState();
            
            // Get camera offset
            let camX = 0, camY = 0;
            if (typeof Camera !== 'undefined' && Camera.getOffset) {
                const cam = Camera.getOffset();
                camX = cam.x;
                camY = cam.y;
            }
            
            // Render lighting
            const ctx = lightingCanvas.getContext('2d');
            ctx.clearRect(0, 0, 320, 240);
            Lighting.render(ctx, 320, 240, camX, camY);
        }
        
        requestAnimationFrame(lightingLoop);
    }
    
    function startLightingLoop() {
        lastTime = performance.now();
        requestAnimationFrame(lightingLoop);
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  T I M E   C O N T R O L S
    // ═══════════════════════════════════════════════════════════════
    
    // Expose time controls
    window.TimeControl = {
        // Set time (0-23 hours)
        setHour: (hour) => Lighting.setTime(hour),
        
        // Get current time
        getTime: () => Lighting.getTimeString(),
        
        // Set time speed (0 = paused, 1 = 1 minute per second, 60 = 1 hour per second)
        setSpeed: (speed) => Lighting.setTimeSpeed(speed),
        
        // Quick presets
        morning: () => Lighting.setTime(8),
        noon: () => Lighting.setTime(12),
        evening: () => Lighting.setTime(18),
        night: () => Lighting.setTime(22),
        dawn: () => Lighting.setTime(6),
        
        // Pause/resume time
        pause: () => Lighting.setTimeSpeed(0),
        resume: () => Lighting.setTimeSpeed(1),
        fast: () => Lighting.setTimeSpeed(10)
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  W E A T H E R   C O N T R O L S
    // ═══════════════════════════════════════════════════════════════
    
    window.WeatherControl = {
        clear: () => Lighting.setWeather(Lighting.WEATHER.CLEAR, 0),
        cloudy: () => Lighting.setWeather(Lighting.WEATHER.CLOUDY, 1),
        fog: () => Lighting.setWeather(Lighting.WEATHER.FOG, 1),
        rain: () => Lighting.setWeather(Lighting.WEATHER.RAIN, 1),
        storm: () => Lighting.setWeather(Lighting.WEATHER.STORM, 1),
        
        // Set intensity (0-1)
        setIntensity: (i) => Lighting.setWeather(Lighting.WEATHER.RAIN, i)
    };
    
    // ═══════════════════════════════════════════════════════════════
    //  D E B U G
    // ═══════════════════════════════════════════════════════════════
    
    window.LightingDebug = {
        info: () => console.table(Lighting.debugInfo()),
        addTorch: (x, y) => Lighting.addLight(x, y, 'TORCH'),
        addFire: (x, y) => Lighting.addLight(x, y, 'FIRE'),
        addMagic: (x, y) => Lighting.addLight(x, y, 'MAGIC'),
        clearLights: () => Lighting.clearLights(),
        togglePlayerLight: () => {
            Lighting.enablePlayerLight(!Lighting.isIndoor());
        }
    };
    
    // Initialize
    function init() {
        if (!addLightingOverlay()) {
            setTimeout(init, 100);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    console.log('[LightingIntegration] Complete');
    console.log('[LightingIntegration] Use TimeControl.night(), WeatherControl.rain() to test');
    
})();