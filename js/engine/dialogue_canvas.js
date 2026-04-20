const DialogueCanvas = (function() {
    let active = false;
    let currentNPC = null;
    let dialogueIndex = 0;
    let charIndex = 0;
    let charTimer = 0;
    const CHAR_SPEED = 0.03;

    const DIALOGUES = {
        // === VERATH GATE (maps.js) ===
        'maren': [
            { speaker: 'Maren', text: "Welcome to Verath, traveler. I am the Gatewarden." },
            { speaker: 'Maren', text: "The roads beyond our walls grow more dangerous each day. Tread carefully." }
        ],
        'gate_guard_1': [
            { speaker: 'Guard', text: "Halt. State your business." },
            { speaker: 'Guard', text: "Move along, citizen." }
        ],
        'gate_guard_2': [
            { speaker: 'Guard', text: "Keep moving. Nothing to see here." }
        ],
        'wandering_merchant': [
            { speaker: 'Merchant', text: "Supplies for the road! Potions, rope, torches — cheap prices!" },
            { speaker: 'Merchant', text: "A traveler's best friend is a well-stocked pack." }
        ],
        // === VERATH TOWN (maps.js) ===
        'durren': [
            { speaker: 'Durren', text: "Name's Durren. Best blacksmith in Verath, if you ask me." },
            { speaker: 'Durren', text: "Bring me iron ore and I can forge something worthy of your journey." }
        ],
        'yesta': [
            { speaker: 'Yesta', text: "Welcome to the Dusk & Ember! Room for the night, or just a drink?" },
            { speaker: 'Yesta', text: "You look like you've seen trouble. Sit down, rest a while." }
        ],
        'vendor_herbs': [
            { speaker: 'Herb Vendor', text: "Fresh herbs and poultices! Heal what ails you." },
            { speaker: 'Herb Vendor', text: "Nightbloom is rare this season — I got lucky." }
        ],
        'vendor_weapons': [
            { speaker: 'Arms Dealer', text: "A fine selection of blades, bows, and more." },
            { speaker: 'Arms Dealer', text: "No questions asked about what you need it for." }
        ],
        'vendor_general': [
            { speaker: 'Shopkeeper', text: "General goods — torches, rope, rations. Everything you need." }
        ],
        // === INN (maps_extended.js) ===
        'cael': [
            { speaker: 'Cael', text: "I've been travelling these lands for years. Strange things stir in the east." }
        ],
        'drunk_patron': [
            { speaker: 'Drunk', text: "Hic... another round... hic..." },
            { speaker: 'Drunk', text: "Y'know what I think? The Keep... the Keep is alive, I tell ya..." }
        ],
        'hooded_figure': [
            { speaker: '???', text: "You weren't followed, were you?" },
            { speaker: '???', text: "Good. Listen closely — I have something important to tell you." }
        ],
        // === SMITHY (maps_extended.js) ===
        'smithy_apprentice': [
            { speaker: 'Apprentice', text: "Master Durren says I still hold the hammer wrong. Maybe he's right." }
        ],
        // === SCHOLAR (maps_extended.js) ===
        'aldric': [
            { speaker: 'Aldric', text: "Fascinating — you appear to be an outlander. The histories speak of your kind." },
            { speaker: 'Aldric', text: "The Keep predates Verath by centuries. Its origins remain... disputed." }
        ],
        'scholar_student': [
            { speaker: 'Student', text: "Master Aldric says the ancient texts hold the answers. I'm still on page three." }
        ],
        // === WILDERNESS (maps_extended.js) ===
        'wounded_traveler': [
            { speaker: 'Traveler', text: "Please... bandits attacked my wagon. I need help." },
            { speaker: 'Traveler', text: "They took everything. My goods, my horse... everything." }
        ],
        'smuggler': [
            { speaker: 'Smuggler', text: "Keep walking. You didn't see me, I didn't see you." },
            { speaker: 'Smuggler', text: "...Unless you're interested in a business proposition." }
        ],
        'scout_nem': [
            { speaker: 'Nem', text: "Scout Nem, at your service. I've been tracking movement to the north." },
            { speaker: 'Nem', text: "Something big is gathering in the highlands. We need to know what." }
        ],
        'the_watcher': [
            { speaker: 'The Watcher', text: "I have stood at this post for longer than you can imagine." },
            { speaker: 'The Watcher', text: "What comes from the Keep... it is not natural." }
        ],
        'farmer': [
            { speaker: 'Farmer', text: "Harvest has been poor. The ash in the air ruins the crops." }
        ],
        // === OUTPOST (maps_extended.js) ===
        'commander_vex': [
            { speaker: 'Commander Vex', text: "This outpost holds the eastern line. We don't retreat." },
            { speaker: 'Commander Vex', text: "If you're not a soldier, you shouldn't be here." }
        ],
        'soldier_1': [
            { speaker: 'Soldier', text: "Quiet night. Let's hope it stays that way." }
        ],
        'soldier_2': [
            { speaker: 'Soldier', text: "Three weeks without a proper meal. The quartermaster's out of everything." }
        ],
        'quartermaster': [
            { speaker: 'Quartermaster', text: "Supplies are critical. If you have anything to trade, name your price." }
        ],
        // === HARROW VILLAGE (maps_phase3.js) ===
        'agatha': [
            { speaker: 'Agatha', text: "I am the healer of Harrow. Or what remains of it." },
            { speaker: 'Agatha', text: "The illness that struck us — it came from the old mill. I am sure of it." }
        ],
        'torven': [
            { speaker: 'Torven', text: "Can't farm when the ground smells of rot. Whatever's in that mill is spreading." }
        ],
        'bram': [
            { speaker: 'Bram', text: "Shop's open, but there's not much left to sell. Times are hard." }
        ],
        'kael': [
            { speaker: 'Kael', text: "I'm the only guard left in Harrow. The others fled when things got bad." }
        ],
        'soma': [
            { speaker: 'Soma', text: "I arrived here by accident, just like you perhaps." },
            { speaker: 'Soma', text: "I've seen this pattern before — in a village three days east. None survived." }
        ],
        'villager_1': [
            { speaker: 'Villager', text: "At night we can hear the mill wheel turning... but there's no water to turn it." }
        ],
        'villager_2': [
            { speaker: 'Villager', text: "Don't go near the mill after dark. Please." }
        ],
        // === OLD MILL (maps_phase3.js) ===
        'mill_spirit': [
            { speaker: 'Mill Spirit', text: "...Trapped... so long trapped..." },
            { speaker: 'Mill Spirit', text: "Free me and the sickness ends. I swear it on what I once was." }
        ],
        // === ARENA (maps_phase3.js) ===
        'ticket_vendor': [
            { speaker: 'Vendor', text: "Tickets for the Grand Arena! See glory, blood, and triumph!" }
        ],
        'arena_smith': [
            { speaker: 'Arena Smith', text: "I outfit champions. You want to fight, you'll need proper gear." }
        ],
        'arena_guard_1': [
            { speaker: 'Arena Guard', text: "Contestants enter through the south gate." }
        ],
        'arena_guard_2': [
            { speaker: 'Arena Guard', text: "Spectators only beyond this point. No weapons." }
        ],
        'spectator_1': [
            { speaker: 'Spectator', text: "Last week's match was incredible. Ravan nearly lost!" }
        ],
        'spectator_2': [
            { speaker: 'Spectator', text: "I bet twenty gold on the challenger. Worst decision of my life." }
        ],
        'ravan': [
            { speaker: 'Ravan', text: "You wish to challenge me? Bold. I respect that." },
            { speaker: 'Ravan', text: "Win the qualifying rounds, and we'll talk." }
        ],
        'commander_yast': [
            { speaker: 'Commander Yast', text: "The Arena provides order. Without it, these people would tear each other apart." }
        ],
        'petra': [
            { speaker: 'Petra', text: "Shhh. Lower your voice." },
            { speaker: 'Petra', text: "The Shade Company has eyes everywhere in the Arena. Follow my lead." }
        ],
        'noble_spectator': [
            { speaker: 'Noble', text: "Ghastly sport... and yet I keep coming back." }
        ],
        'merchant_spectator': [
            { speaker: 'Merchant', text: "The Arena is good for business. Fear makes people spend." }
        ],
        // === CHAMPION QUARTERS (maps_phase3.js) ===
        'ravan_private': [
            { speaker: 'Ravan', text: "This is my private space. Come back when the crowds are watching." }
        ],
        'arena_armorer': [
            { speaker: 'Armorer', text: "I've repaired armor for fifty champions. Most of them are still alive." }
        ],
        'arena_historian': [
            { speaker: 'Historian', text: "Every match, every champion — I record it all." },
            { speaker: 'Historian', text: "This Arena is older than Verath. The secrets in these walls..." }
        ],
        // === MOUNTAIN PASS (maps_phase4.js) ===
        'pilgrim': [
            { speaker: 'Pilgrim', text: "I walk to the monastery at the summit. A long road, but worth it." }
        ],
        // === MONASTERY (maps_phase4.js) ===
        'seiran': [
            { speaker: 'Seiran', text: "Peace, traveler. You have climbed far to reach us." },
            { speaker: 'Seiran', text: "The monastery holds old knowledge. Some of it was not meant to be found." }
        ],
        'monk_1': [
            { speaker: 'Monk', text: "Breathe. The mountain teaches patience to those who listen." }
        ],
        'monk_2': [
            { speaker: 'Monk', text: "Our order has protected these scrolls for three hundred years." }
        ],
        'monk_scribe': [
            { speaker: 'Scribe', text: "I am copying the last surviving volume of the First Age chronicles." }
        ],
        'acolyte': [
            { speaker: 'Acolyte', text: "I only arrived last spring. The altitude still makes my head spin." }
        ],
        // === BELL TOWER (maps_phase4.js) ===
        'bell_keeper': [
            { speaker: 'Bell Keeper', text: "I ring the bell at dawn and dusk. That is my purpose. That is enough." }
        ],
        'praying_monk': [
            { speaker: 'Monk', text: "..." },
            { speaker: 'Monk', text: "Please do not disturb the prayer." }
        ],
        // === ANCIENT CRYPT (maps_phase4.js) ===
        'orath': [
            { speaker: 'Orath', text: "You... you are still flesh. How long has it been?" },
            { speaker: 'Orath', text: "I was sealed here to guard what lies below. But I have forgotten why." }
        ],
        // === COASTAL CLIFFS (maps_phase4.js) ===
        'noa': [
            { speaker: 'Noa', text: "Fisherman by trade. But the sea's been wrong lately — wrong currents, wrong color." },
            { speaker: 'Noa', text: "Something stirs beneath the water. I've seen it." }
        ],
        'beachcomber': [
            { speaker: 'Beachcomber', text: "Found a message in a bottle once. It said: 'Don't trust the harbor.'" },
            { speaker: 'Beachcomber', text: "Never figured out if that was a warning or a joke." }
        ],
        // === HARBOR (maps_phase4.js) ===
        'sorn': [
            { speaker: 'Sorn', text: "Harbormaster Sorn. Every ship in and out is my business." },
            { speaker: 'Sorn', text: "Someone's been moving cargo at night without logging it. I want answers." }
        ],
        'captain_moras': [
            { speaker: 'Captain Moras', text: "The sea's my home. Land makes me nervous." },
            { speaker: 'Captain Moras', text: "Need passage somewhere? I have my price." }
        ],
        'dock_worker_1': [
            { speaker: 'Dock Worker', text: "Heavy work, poor pay. Same as always." }
        ],
        'dock_worker_2': [
            { speaker: 'Dock Worker', text: "Watch your step on these planks — they're rotten in places." }
        ],
        'warehouse_guard': [
            { speaker: 'Guard', text: "Authorized personnel only. Move on." }
        ],
        // === THE DROWNED HIDEOUT (maps_phase4.js) ===
        'liss': [
            { speaker: 'Liss', text: "You found us. That's either impressive or very foolish." },
            { speaker: 'Liss', text: "The Drowned answer to no lord, no guild. Only the sea." }
        ],
        'drowned_lieutenant': [
            { speaker: 'Lieutenant', text: "You're either with us or you're not. Choose carefully." }
        ],
        'drowned_scout': [
            { speaker: 'Scout', text: "I track every ship that enters these waters. Nothing moves without us knowing." }
        ],
        'drowned_recruit': [
            { speaker: 'Recruit', text: "I only joined last month. Still learning the ropes. Literally." }
        ],
        // === DIVING GROUNDS (maps_phase4.js) ===
        'diving_master': [
            { speaker: 'Diving Master', text: "The ruins beneath the bay hold secrets that haven't seen light in centuries." },
            { speaker: 'Diving Master', text: "I can teach you to hold your breath long enough to reach them." }
        ],
        // === ASH WASTES (maps_phase5.js) ===
        'wynn': [
            { speaker: 'Wynn', text: "Outsider. You shouldn't be here — the ash is toxic to your kind." },
            { speaker: 'Wynn', text: "...But since you made it this far, maybe you're tougher than you look." }
        ],
        'ashfolk_hunter': [
            { speaker: 'Hunter', text: "We hunt what little remains in the Wastes. The ash took everything else." }
        ],
        // === ASH-FOLK VILLAGE (maps_phase5.js) ===
        'elder_vae': [
            { speaker: 'Elder Vae', text: "We have lived in the ash for generations. It is our home, our burden." },
            { speaker: 'Elder Vae', text: "The source of the ash... it comes from within the earth itself. Something old woke up." }
        ],
        'kern': [
            { speaker: 'Kern', text: "I protect my people. Simple as that." },
            { speaker: 'Kern', text: "You want to help? Then prove you can be trusted." }
        ],
        'ashfolk_elder_wife': [
            { speaker: 'Vira', text: "Vae carries this burden alone. I worry for him." }
        ],
        'ashfolk_smith': [
            { speaker: 'Smith', text: "Ash-iron. Stronger than regular ore, but it takes twice the heat to work." }
        ],
        'ashfolk_child': [
            { speaker: 'Child', text: "Are you from outside the Wastes? What does rain feel like?" }
        ],
        // === STONE PLATEAU (maps_phase5.js) ===
        'stone_sentinel': [
            { speaker: 'Stone Sentinel', text: "..." },
            { speaker: 'Stone Sentinel', text: "IDENTIFY. PURPOSE. THREAT LEVEL." }
        ],
        // === WARDEN CITADEL (maps_phase5.js) ===
        'the_guardian': [
            { speaker: 'The Guardian', text: "I have kept this post since before your ancestors drew breath." },
            { speaker: 'The Guardian', text: "None may pass without answering my question. Are you prepared?" }
        ],
        'warden_guard_1': [
            { speaker: 'Warden', text: "The Citadel is restricted. Turn back." }
        ],
        'warden_guard_2': [
            { speaker: 'Warden', text: "Civilians are not permitted beyond this point." }
        ],
        'warden_patrol': [
            { speaker: 'Warden', text: "Move along. We're watching." }
        ],
        // === WARDEN COMMAND (maps_phase5.js) ===
        'warden_7': [
            { speaker: 'Warden-7', text: "Designation: Warden-7. Commander of this installation." },
            { speaker: 'Warden-7', text: "State your purpose or be classified as a threat." }
        ],
        'the_indexer': [
            { speaker: 'The Indexer', text: "I catalog everything. Every event, every face, every anomaly." },
            { speaker: 'The Indexer', text: "You are... unexpected. I have no record of your arrival." }
        ],
        'warden_elite_1': [
            { speaker: 'Elite Warden', text: "Stand down. Commander Warden-7 is aware of your presence." }
        ],
        'warden_elite_2': [
            { speaker: 'Elite Warden', text: "Do not make sudden movements." }
        ],
        'warden_smith': [
            { speaker: 'Warden Smith', text: "I maintain the armaments. It is precision work. I do not welcome interruption." }
        ],
        // === VAULT (maps_phase5.js) ===
        'the_prisoner': [
            { speaker: '???', text: "Finally... someone comes." },
            { speaker: '???', text: "They locked me here because I knew the truth. Will you hear it?" }
        ],
        // === FALLBACK ===
        'default': [
            { speaker: 'Stranger', text: "..." },
            { speaker: 'Stranger', text: "They don't seem to want to talk." }
        ]
    };

    function start(npcId) {
        active = true;
        currentNPC = npcId;
        dialogueIndex = 0;
        charIndex = 0;
        charTimer = 0;

        if (typeof Input !== 'undefined') Input.disable();
        console.log('[Dialogue] Started with', npcId);
    }

    function advance() {
        const dialogue = DIALOGUES[currentNPC] || DIALOGUES.default;
        const current = dialogue[dialogueIndex];

        // Si texte pas fini, finir
        if (current.text && charIndex < current.text.length) {
            charIndex = current.text.length;
            return;
        }

        // Sinon passer au suivant
        dialogueIndex++;
        charIndex = 0;

        if (dialogueIndex >= dialogue.length) {
            close();
        }
    }

    function close() {
        active = false;
        currentNPC = null;
        if (typeof Input !== 'undefined') Input.enable();
    }

    function update(dt) {
        if (!active) return;

        const dialogue = DIALOGUES[currentNPC] || DIALOGUES.default;
        const current = dialogue[dialogueIndex];

        if (current && current.text && charIndex < current.text.length) {
            charTimer += dt;
            while (charTimer >= CHAR_SPEED && charIndex < current.text.length) {
                charTimer -= CHAR_SPEED;
                charIndex++;
            }
        }
    }

    function render(ctx) {
        if (!active) return;

        const W = CONFIG.CANVAS_W;
        const H = CONFIG.CANVAS_H;

        const dialogue = DIALOGUES[currentNPC] || DIALOGUES.default;
        const current = dialogue[dialogueIndex];

        if (!current) return;

        // Box de dialogue
        const boxH = 80;
        const boxY = H - boxH - 10;

        ctx.fillStyle = 'rgba(10, 8, 15, 0.95)';
        ctx.fillRect(10, boxY, W - 20, boxH);
        ctx.strokeStyle = '#4a4560';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, boxY, W - 20, boxH);
        ctx.lineWidth = 1;

        // Portrait placeholder
        ctx.fillStyle = '#2a2535';
        ctx.fillRect(20, boxY + 10, 60, 60);
        ctx.strokeStyle = '#5a5570';
        ctx.strokeRect(20, boxY + 10, 60, 60);

        // Nom du speaker
        if (current.speaker) {
            ctx.fillStyle = '#d4a840';
            ctx.font = 'bold 14px monospace';
            ctx.fillText(current.speaker, 90, boxY + 22);
        }

        // Texte (typewriter effect)
        if (current.text) {
            ctx.fillStyle = '#c0b8a0';
            ctx.font = '12px monospace';
            const displayText = current.text.substring(0, charIndex);
            wrapText(ctx, displayText, 90, boxY + 42, W - 120, 16);
        }

        // Options
        if (current.options) {
            // TODO: menu d'options
        }

        // Indicateur "suite"
        if (charIndex >= (current.text?.length || 0)) {
            ctx.fillStyle = '#888';
            ctx.fillText('▼ E', W - 50, boxY + boxH - 10);
        }
    }

    function wrapText(ctx, text, x, y, maxW, lineH) {
        const words = text.split(' ');
        let line = '';
        let ty = y;

        for (const word of words) {
            const test = line + word + ' ';
            if (ctx.measureText(test).width > maxW) {
                ctx.fillText(line, x, ty);
                line = word + ' ';
                ty += lineH;
            } else {
                line = test;
            }
        }
        ctx.fillText(line, x, ty);
    }

    // Input
    document.addEventListener('keydown', (e) => {
        if (!active) return;
        if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            advance();
        }
        if (e.code === 'Escape') {
            e.preventDefault();
            close();
        }
    });

    return {
        start,
        close,
        update,
        render,
        isActive: () => active,
        addDialogue: (npcId, lines) => { DIALOGUES[npcId] = lines; }
    };
})();

console.log('[DialogueCanvas] Ready');
