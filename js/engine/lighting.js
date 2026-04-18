/*************************************************************
 * lighting.js — Dynamic Lighting System
 * Handles: day/night cycle, light sources, area ambience, weather
 *************************************************************/

const Lighting = (function() {
    
    // === TIME OF DAY ===
    const TIME = {
        DAWN: 0,      // 5:00 - 7:00
        MORNING: 1,   // 7:00 - 11:00
        MIDDAY: 2,    // 11:00 - 14:00
        AFTERNOON: 3, // 14:00 - 18:00
        DUSK: 4,      // 18:00 - 20:00
        NIGHT: 5,     // 20:00 - 5:00
    };
    
    // Current time state
    let currentHour = 10; // Start at 10 AM
    let currentMinute = 0;
    let timeSpeed = 1; // Minutes per real second (0 = paused)
    let timeOfDay = TIME.MORNING;
    
    // === AMBIENT LIGHTING ===
    const ambientColors = {
        [TIME.DAWN]:      { color: '#4a3a5a', alpha: 0.3 },
        [TIME.MORNING]:   { color: '#000000', alpha: 0.0 },
        [TIME.MIDDAY]:    { color: '#ffffee', alpha: 0.05 },
        [TIME.AFTERNOON]: { color: '#ffeecc', alpha: 0.1 },
        [TIME.DUSK]:      { color: '#5a3a2a', alpha: 0.35 },
        [TIME.NIGHT]:     { color: '#0a0a1a', alpha: 0.6 },
    };
    
    let currentAmbient = { color: '#000000', alpha: 0 };
    let targetAmbient = { color: '#000000', alpha: 0 };
    
    // === AREA DARKNESS ===
    // Some areas override the time-based lighting
    const areaDarkness = {
        // Completely dark (underground)
        'verath_undercity': { color: '#0a0a0a', alpha: 0.7, indoor: true },
        'keep_depths': { color: '#0a0a1a', alpha: 0.75, indoor: true },
        'monastery_deep': { color: '#0a0a0a', alpha: 0.65, indoor: true },
        'colosseum_vault': { color: '#0a0a0a', alpha: 0.7, indoor: true },
        
        // Indoor (dim, ignores time)
        'verath_inn': { color: '#1a1008', alpha: 0.3, indoor: true },
        'verath_smithy': { color: '#1a0a00', alpha: 0.25, indoor: true },
        'verath_scholar': { color: '#0a0a1a', alpha: 0.35, indoor: true },
        'keep_hall': { color: '#0a0a10', alpha: 0.3, indoor: true },
        'monastery_court': { color: '#0a0a08', alpha: 0.2, indoor: true },
        'monastery_bells': { color: '#0a0a0a', alpha: 0.25, indoor: true },
        'piers_guild': { color: '#0a1010', alpha: 0.4, indoor: true },
        'old_mill': { color: '#1a1a10', alpha: 0.3, indoor: true },
        
        // Spooky areas (always darker)
        'ashwood_deep': { color: '#1a1008', alpha: 0.3, spooky: true },
        'ashwood_shrine': { color: '#1a0800', alpha: 0.25, spooky: true },
        'colosseum_floor': { color: '#1a0a0a', alpha: 0.15, spooky: true },
    };
    
    let currentAreaId = null;
    let areaOverride = null;
    
    // === LIGHT SOURCES ===
    const lightSources = [];
    const MAX_LIGHTS = 20;
    
    // Light source types
    const LIGHT_TYPES = {
        TORCH: {
            radius: 48,
            color: '#ff9944',
            intensity: 0.8,
            flicker: 0.15,
            flickerSpeed: 8
        },
        FIRE: {
            radius: 64,
            color: '#ff6622',
            intensity: 0.9,
            flicker: 0.2,
            flickerSpeed: 10
        },
        CANDLE: {
            radius: 24,
            color: '#ffaa66',
            intensity: 0.5,
            flicker: 0.1,
            flickerSpeed: 6
        },
        MAGIC: {
            radius: 40,
            color: '#6688ff',
            intensity: 0.7,
            flicker: 0.05,
            flickerSpeed: 3
        },
        PLAYER: {
            radius: 56,
            color: '#ffeedd',
            intensity: 0.6,
            flicker: 0,
            flickerSpeed: 0
        },
        GLOW: {
            radius: 32,
            color: '#88ffaa',
            intensity: 0.4,
            flicker: 0.08,
            flickerSpeed: 4
        }
    };
    
    // === WEATHER ===
    const WEATHER = {
        CLEAR: 0,
        CLOUDY: 1,
        FOG: 2,
        RAIN: 3,
        STORM: 4
    };
    
    let currentWeather = WEATHER.CLEAR;
    let weatherIntensity = 0;
    let targetWeatherIntensity = 0;
    let raindrops = [];
    let fogAlpha = 0;
    
    // ═══════════════════════════════════════════════════════════════
    //  T I M E   O F   D A Y
    // ═══════════════════════════════════════════════════════════════
    
    function setTime(hour, minute = 0) {
        currentHour = hour % 24;
        currentMinute = minute % 60;
        updateTimeOfDay();
    }
    
    function getTime() {
        return { hour: currentHour, minute: currentMinute };
    }
    
    function getTimeString() {
        const h = currentHour.toString().padStart(2, '0');
        const m = Math.floor(currentMinute).toString().padStart(2, '0');
        return `${h}:${m}`;
    }
    
    function setTimeSpeed(speed) {
        timeSpeed = speed;
    }
    
    function updateTimeOfDay() {
        const h = currentHour;
        
        if (h >= 5 && h < 7) timeOfDay = TIME.DAWN;
        else if (h >= 7 && h < 11) timeOfDay = TIME.MORNING;
        else if (h >= 11 && h < 14) timeOfDay = TIME.MIDDAY;
        else if (h >= 14 && h < 18) timeOfDay = TIME.AFTERNOON;
        else if (h >= 18 && h < 20) timeOfDay = TIME.DUSK;
        else timeOfDay = TIME.NIGHT;
        
        // Set target ambient
        if (!areaOverride || !areaOverride.indoor) {
            targetAmbient = ambientColors[timeOfDay];
        }
    }
    
    function advanceTime(dt) {
        if (timeSpeed <= 0) return;
        
        currentMinute += timeSpeed * dt;
        
        while (currentMinute >= 60) {
            currentMinute -= 60;
            currentHour = (currentHour + 1) % 24;
            updateTimeOfDay();
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  A R E A   L I G H T I N G
    // ═══════════════════════════════════════════════════════════════
    
    function setArea(areaId) {
        currentAreaId = areaId;
        areaOverride = areaDarkness[areaId] || null;
        
        // Clear light sources when changing area
        lightSources.length = 0;
        
        if (areaOverride) {
            targetAmbient = { 
                color: areaOverride.color, 
                alpha: areaOverride.alpha 
            };
        } else {
            updateTimeOfDay();
        }
        
        // Auto-add lights based on area tiles
        autoAddAreaLights(areaId);
    }
    
    function autoAddAreaLights(areaId) {
        // This would scan the tilemap for fire/torch tiles
        // For now, we'll add lights manually or via map data
        
        if (typeof Maps !== 'undefined' && Maps.get) {
            const map = Maps.get(areaId);
            if (map && map.lights) {
                for (const light of map.lights) {
                    addLight(light.x * CONFIG.TILE + CONFIG.TILE/2, light.y * CONFIG.TILE + CONFIG.TILE/2, light.type || 'TORCH');
                }
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  L I G H T   S O U R C E S
    // ═══════════════════════════════════════════════════════════════
    
    function addLight(x, y, type = 'TORCH', customProps = {}) {
        if (lightSources.length >= MAX_LIGHTS) {
            lightSources.shift(); // Remove oldest
        }
        
        const baseType = LIGHT_TYPES[type] || LIGHT_TYPES.TORCH;
        
        const light = {
            x, y,
            radius: customProps.radius || baseType.radius,
            color: customProps.color || baseType.color,
            intensity: customProps.intensity || baseType.intensity,
            flicker: baseType.flicker,
            flickerSpeed: baseType.flickerSpeed,
            flickerOffset: Math.random() * Math.PI * 2,
            active: true
        };
        
        lightSources.push(light);
        return light;
    }
    
    function removeLight(light) {
        const idx = lightSources.indexOf(light);
        if (idx !== -1) {
            lightSources.splice(idx, 1);
        }
    }
    
    function clearLights() {
        lightSources.length = 0;
    }
    
    // Player light (follows player)
    let playerLight = null;
    
    function enablePlayerLight(enable = true) {
        if (enable && !playerLight) {
            playerLight = { ...LIGHT_TYPES.PLAYER, x: 0, y: 0, active: true };
        } else if (!enable) {
            playerLight = null;
        }
    }
    
    function updatePlayerLight() {
        if (playerLight && typeof Player !== 'undefined') {
            playerLight.x = Player.getX() + 8;
            playerLight.y = Player.getY() + 8;
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  W E A T H E R
    // ═══════════════════════════════════════════════════════════════
    
    function setWeather(weather, intensity = 1) {
        currentWeather = weather;
        targetWeatherIntensity = intensity;
        
        if (weather === WEATHER.RAIN || weather === WEATHER.STORM) {
            initRain();
        }
    }
    
    function initRain() {
        raindrops = [];
        const count = currentWeather === WEATHER.STORM ? 150 : 80;
        
        for (let i = 0; i < count; i++) {
            raindrops.push({
                x: Math.random() * CONFIG.CANVAS_W,
                y: Math.random() * CONFIG.CANVAS_H,
                speed: 200 + Math.random() * 100,
                length: 4 + Math.random() * 4
            });
        }
    }
    
    function updateWeather(dt) {
        // Lerp weather intensity
        weatherIntensity += (targetWeatherIntensity - weatherIntensity) * 2 * dt;
        
        // Update fog
        if (currentWeather === WEATHER.FOG) {
            fogAlpha = 0.3 * weatherIntensity;
        } else if (currentWeather === WEATHER.STORM) {
            fogAlpha = 0.15 * weatherIntensity;
        } else {
            fogAlpha = Math.max(0, fogAlpha - dt);
        }
        
        // Update rain
        if (currentWeather === WEATHER.RAIN || currentWeather === WEATHER.STORM) {
            for (const drop of raindrops) {
                drop.y += drop.speed * dt;
                drop.x += 30 * dt; // Wind
                
                if (drop.y > CONFIG.CANVAS_H) {
                    drop.y = -10;
                    drop.x = Math.random() * CONFIG.CANVAS_W;
                }
                if (drop.x > CONFIG.CANVAS_W) {
                    drop.x = -10;
                }
            }
        }
    }
    
    function renderWeather(ctx, width, height) {
        if (weatherIntensity <= 0) return;
        
        // Fog
        if (fogAlpha > 0) {
            ctx.fillStyle = `rgba(180, 180, 190, ${fogAlpha})`;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Rain
        if (currentWeather === WEATHER.RAIN || currentWeather === WEATHER.STORM) {
            ctx.strokeStyle = `rgba(150, 170, 200, ${0.4 * weatherIntensity})`;
            ctx.lineWidth = 1;
            
            for (const drop of raindrops) {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + 2, drop.y + drop.length);
                ctx.stroke();
            }
        }
        
        // Storm lightning flash
        if (currentWeather === WEATHER.STORM && Math.random() < 0.002) {
            if (typeof Effects !== 'undefined') {
                Effects.startFlash('#ffffff', 0.1, 0.3);
                setTimeout(() => {
                    Effects.startShake(2, 0.3);
                }, 200);
            }
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  U P D A T E
    // ═══════════════════════════════════════════════════════════════
    
    function update(dt) {
        // Advance time
        advanceTime(dt);
        
        // Update player light position
        updatePlayerLight();
        
        // Lerp ambient color
        currentAmbient.alpha += (targetAmbient.alpha - currentAmbient.alpha) * 2 * dt;
        
        // Update weather
        updateWeather(dt);
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  R E N D E R
    // ═══════════════════════════════════════════════════════════════
    
    function render(ctx, width, height, camX = 0, camY = 0) {
        // Skip if no darkness
        if (currentAmbient.alpha <= 0.01 && lightSources.length === 0 && !playerLight) {
            renderWeather(ctx, width, height);
            return;
        }
        
        // Create darkness layer
        ctx.save();
        
        // Fill with ambient darkness
        ctx.fillStyle = currentAmbient.color || '#000000';
        ctx.globalAlpha = currentAmbient.alpha;
        ctx.fillRect(0, 0, width, height);
        
        // Cut out light sources using composite operation
        ctx.globalCompositeOperation = 'destination-out';
        
        const time = performance.now() / 1000;
        
        // Render each light source
        const allLights = playerLight ? [...lightSources, playerLight] : lightSources;
        
        for (const light of allLights) {
            if (!light.active) continue;
            
            // Calculate flicker
            let intensity = light.intensity;
            if (light.flicker > 0) {
                const flicker = Math.sin(time * light.flickerSpeed + (light.flickerOffset || 0));
                intensity *= 1 - light.flicker * 0.5 + flicker * light.flicker * 0.5;
            }
            
            // Light position relative to camera
            const lx = light.x - camX;
            const ly = light.y - camY;
            
            // Create radial gradient
            const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, light.radius);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(lx - light.radius, ly - light.radius, light.radius * 2, light.radius * 2);
        }
        
        ctx.restore();
        
        // Add colored light glow (additive)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.15;
        
        for (const light of allLights) {
            if (!light.active) continue;
            
            const lx = light.x - camX;
            const ly = light.y - camY;
            
            const gradient = ctx.createRadialGradient(lx, ly, 0, lx, ly, light.radius * 0.7);
            gradient.addColorStop(0, light.color);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(lx - light.radius, ly - light.radius, light.radius * 2, light.radius * 2);
        }
        
        ctx.restore();
        
        // Render weather on top
        renderWeather(ctx, width, height);
    }
    
    // ═══════════════════════════════════════════════════════════════
    //  P U B L I C   A P I
    // ═══════════════════════════════════════════════════════════════
    
    return {
        // Time
        setTime,
        getTime,
        getTimeString,
        setTimeSpeed,
        TIME,
        
        // Area
        setArea,
        
        // Lights
        addLight,
        removeLight,
        clearLights,
        enablePlayerLight,
        LIGHT_TYPES,
        
        // Weather
        setWeather,
        WEATHER,
        
        // Core
        update,
        render,
        
        // State
        getTimeOfDay: () => timeOfDay,
        isNight: () => timeOfDay === TIME.NIGHT || timeOfDay === TIME.DUSK,
        isIndoor: () => areaOverride && areaOverride.indoor,
        
        // Debug
        debugInfo: () => ({
            time: getTimeString(),
            timeOfDay: Object.keys(TIME)[timeOfDay],
            area: currentAreaId,
            lights: lightSources.length,
            weather: Object.keys(WEATHER)[currentWeather]
        })
    };
    
})();

console.log('[Lighting] Initialized');