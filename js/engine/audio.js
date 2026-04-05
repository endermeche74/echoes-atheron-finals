/*************************************************************
 * audio.js — Audio System
 * Handles: SFX, ambient loops, music, spatial audio
 *************************************************************/

const GameAudio = (function() {
    
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.value = 0.5;
    
    const sfxGain = ctx.createGain();
    sfxGain.connect(masterGain);
    sfxGain.gain.value = 0.7;
    
    const musicGain = ctx.createGain();
    musicGain.connect(masterGain);
    musicGain.gain.value = 0.4;
    
    const ambientGain = ctx.createGain();
    ambientGain.connect(masterGain);
    ambientGain.gain.value = 0.3;
    
    // Cache
    const buffers = {};
    const loops = {};
    let currentMusic = null;
    let currentAmbient = null;
    
    // === PROCEDURAL SFX ===
    function playTone(freq, duration, type = 'square', gain = 0.3) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(gain, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    }
    
    function playNoise(duration, gain = 0.2) {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        noise.connect(filter);
        filter.connect(g);
        g.connect(sfxGain);
        noise.start();
        noise.stop(ctx.currentTime + duration);
    }
    
    // === SFX PRESETS ===
    const SFX = {
        footstep_stone: () => {
            playNoise(0.05, 0.1);
            playTone(100 + Math.random() * 50, 0.03, 'triangle', 0.1);
        },
        footstep_dirt: () => {
            playNoise(0.06, 0.08);
        },
        footstep_grass: () => {
            playNoise(0.04, 0.06);
            playTone(2000 + Math.random() * 500, 0.02, 'sine', 0.02);
        },
        footstep_water: () => {
            playNoise(0.08, 0.12);
            playTone(400, 0.05, 'sine', 0.08);
        },
        
        hit: () => {
            playNoise(0.1, 0.4);
            playTone(150, 0.1, 'sawtooth', 0.3);
        },
        hit_crit: () => {
            playNoise(0.15, 0.5);
            playTone(200, 0.08, 'sawtooth', 0.4);
            playTone(100, 0.12, 'square', 0.3);
        },
        miss: () => {
            playTone(300, 0.1, 'sine', 0.1);
            playTone(200, 0.15, 'sine', 0.08);
        },
        
        hurt: () => {
            playTone(200, 0.1, 'sawtooth', 0.3);
            playTone(150, 0.15, 'square', 0.2);
        },
        death: () => {
            playTone(200, 0.2, 'sawtooth', 0.3);
            playTone(100, 0.4, 'sawtooth', 0.2);
            playTone(50, 0.6, 'sine', 0.15);
        },
        
        heal: () => {
            playTone(400, 0.1, 'sine', 0.2);
            playTone(600, 0.1, 'sine', 0.15);
            playTone(800, 0.15, 'sine', 0.1);
        },
        levelup: () => {
            playTone(400, 0.1, 'sine', 0.25);
            setTimeout(() => playTone(500, 0.1, 'sine', 0.25), 100);
            setTimeout(() => playTone(600, 0.1, 'sine', 0.25), 200);
            setTimeout(() => playTone(800, 0.2, 'sine', 0.3), 300);
        },
        
        pickup: () => {
            playTone(600, 0.05, 'sine', 0.2);
            playTone(900, 0.1, 'sine', 0.15);
        },
        coin: () => {
            playTone(1200, 0.05, 'sine', 0.15);
            playTone(1500, 0.08, 'sine', 0.1);
        },
        
        door: () => {
            playNoise(0.15, 0.15);
            playTone(100, 0.2, 'triangle', 0.1);
        },
        menu_move: () => {
            playTone(800, 0.03, 'square', 0.1);
        },
        menu_select: () => {
            playTone(600, 0.05, 'square', 0.15);
            playTone(900, 0.08, 'square', 0.1);
        },
        menu_cancel: () => {
            playTone(400, 0.08, 'square', 0.1);
            playTone(300, 0.1, 'square', 0.08);
        },
        
        magic: () => {
            playTone(800, 0.05, 'sine', 0.2);
            playTone(1200, 0.1, 'sine', 0.15);
            playNoise(0.08, 0.1);
        },
        explosion: () => {
            playNoise(0.3, 0.5);
            playTone(80, 0.2, 'sawtooth', 0.4);
            playTone(40, 0.4, 'sine', 0.3);
        }
    };
    
    function playSFX(name) {
        if (ctx.state === 'suspended') ctx.resume();
        if (SFX[name]) SFX[name]();
    }
    
    // === AMBIENT LOOPS ===
    function createAmbientLoop(type) {
        const loop = { playing: false, interval: null };
        
        const patterns = {
            forest: () => {
                if (Math.random() < 0.3) {
                    playTone(2000 + Math.random() * 1000, 0.1, 'sine', 0.02);
                }
                if (Math.random() < 0.1) {
                    playTone(1500, 0.05, 'sine', 0.015);
                    setTimeout(() => playTone(1800, 0.05, 'sine', 0.01), 100);
                }
            },
            cave: () => {
                if (Math.random() < 0.2) {
                    playTone(50 + Math.random() * 30, 0.5, 'sine', 0.03);
                }
                if (Math.random() < 0.1) {
                    playNoise(0.3, 0.02);
                }
            },
            water: () => {
                playNoise(0.2, 0.04);
                if (Math.random() < 0.3) {
                    playTone(200 + Math.random() * 100, 0.1, 'sine', 0.02);
                }
            },
            fire: () => {
                playNoise(0.1, 0.05);
                if (Math.random() < 0.4) {
                    playTone(100 + Math.random() * 50, 0.05, 'triangle', 0.03);
                }
            },
            wind: () => {
                if (Math.random() < 0.3) {
                    playNoise(0.5, 0.03);
                }
            },
            rain: () => {
                playNoise(0.15, 0.06);
                if (Math.random() < 0.1) {
                    playTone(100, 0.3, 'sine', 0.02);
                }
            }
        };
        
        loop.start = () => {
            if (loop.playing) return;
            loop.playing = true;
            const pattern = patterns[type] || patterns.wind;
            loop.interval = setInterval(pattern, 500);
        };
        
        loop.stop = () => {
            loop.playing = false;
            if (loop.interval) clearInterval(loop.interval);
        };
        
        return loop;
    }
    
    function setAmbient(type) {
        if (currentAmbient) currentAmbient.stop();
        if (!type) return;
        currentAmbient = createAmbientLoop(type);
        currentAmbient.start();
    }
    
    // === MUSIC (simple drone) ===
    function playMusic(key = 'exploration') {
        if (ctx.state === 'suspended') ctx.resume();
        stopMusic();
        
        const notes = {
            exploration: [65.41, 82.41, 98.00],  // C2, E2, G2
            combat: [55.00, 69.30, 82.41],       // A1, C#2, E2
            boss: [41.20, 51.91, 61.74],         // E1, G#1, B1
            safe: [73.42, 92.50, 110.00]         // D2, F#2, A2
        };
        
        const freqs = notes[key] || notes.exploration;
        const oscs = [];
        
        for (const freq of freqs) {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            g.gain.value = 0.08;
            osc.connect(g);
            g.connect(musicGain);
            osc.start();
            oscs.push({ osc, gain: g });
        }
        
        currentMusic = { oscs, key };
    }
    
    function stopMusic() {
        if (currentMusic) {
            for (const { osc, gain } of currentMusic.oscs) {
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                osc.stop(ctx.currentTime + 0.5);
            }
            currentMusic = null;
        }
    }
    
    // === VOLUME ===
    function setVolume(type, value) {
        const v = Math.max(0, Math.min(1, value));
        if (type === 'master') masterGain.gain.value = v;
        else if (type === 'sfx') sfxGain.gain.value = v;
        else if (type === 'music') musicGain.gain.value = v;
        else if (type === 'ambient') ambientGain.gain.value = v;
    }
    
    function mute() { masterGain.gain.value = 0; }
    function unmute() { masterGain.gain.value = 0.5; }
    
    // === INIT ===
    function init() {
        document.addEventListener('click', () => {
            if (ctx.state === 'suspended') ctx.resume();
        }, { once: true });
    }
    
    init();
    
    return {
        playSFX,
        setAmbient,
        playMusic,
        stopMusic,
        setVolume,
        mute,
        unmute,
        SFX: Object.keys(SFX)
    };
    
})();

console.log('[GameAudio] Initialized');