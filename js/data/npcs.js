/* ═══════════════════════════════════════
   ECHOES OF AETHON — NPCs Data
   All dialogue trees for every NPC.

   Node structure:
     t  - NPC's spoken text
     c  - array of player choice objects:
       { l: "Button label", n: 'nodeKey' }
       n: null = ends conversation immediately
       n: omitted / '' = stay on same node
       Special action fields (handled by dialogue.js):
         a:'rest'          - inn rest (20g)
         a:'teach'         - Aldric lore XP
         a:'teach_blade'   - Ravan blade XP
         a:'teach_myst'    - Seiran mysticism XP
         a:'teach_arch'    - Wynn archery XP
         a:'teach_lore'    - Keep indexer lore XP
         a:'buy', item, cost
         a:'give_item', item
         a:'start_quest', quest
         a:'quest_return', quest, flag, needs, needsCount, take

   IMPORTANT: Every dialogue branch must eventually
   reach a node whose choices are empty [], which
   triggers the automatic "Leave" button from
   getDlgChoices() in dialogue.js.
   ════════════════════════════════════ */

var NPCS = {

  /* ══════════════════════════════════
     VERATH'S GATE
  ══════════════════════════════════ */

  cael: {
    n:'Cael', title:"Captain of the Verath Watch", faction:null,
    greet:"He stands at the arch with his hands clasped behind his back, watching the road out. He speaks without turning — which means he heard you coming.",
    nodes:{
      root:{ t:"Another one heading to the ruins. I stopped giving warnings three years ago.",
        c:[{l:"What threats should I know?",n:'thr'},{l:"Tell me about the city.",n:'city'},{l:"Tell me about the ruins.",n:'ruins'}]},
      thr:{ t:"Constructs still operating on orders from extinct civilizations. They don't negotiate, don't tire, don't reconsider. The shades are more dangerous — they have something like personality. A ghost that wants something is worse than a machine that follows orders.",c:[]},
      city:{ t:"Seven ruins beneath us. The columns in the market predate every record we have. People built around them because they were afraid to build through them — and the fear turned out to be correct when three builders who tried reported hearing voices inside the stone.",c:[]},
      ruins:{ t:"The Colosseum tests fighters. The Monastery tests mystics. The Piers tests endurance. The Ashwood tests patience. The Keep tests everything at once — and I mean that in a way that should concern you.",c:[]}
    }
  },

  maren: {
    n:'Maren', title:"Innkeeper of the Threshold", faction:null,
    greet:"She wipes a counter that has been wiped ten thousand times. Her eyes find you with the particular sharpness of someone who has assessed strangers for thirty years.",
    nodes:{
      root:{ t:"Long road or long stay? I charge nothing for conversation.",
        c:[{l:"Tell me about the city.",n:'city'},{l:"Any rumors lately?",n:'rumors'},{l:"Rest at the inn. (20g — full restore)",n:'rest',a:'rest'}]},
      city:{ t:"Seven ruins under our feet, they say. I think it's more. My cellar has a floor, and that floor has another beneath it. I stopped going down after the second. Whatever's down there doesn't need visiting by an innkeeper.",
        c:[{l:"Why are the bells silent?",n:'bells'},{l:"Who built the columns?",n:'cols'}]},
      bells:{ t:"They rang to call soldiers once. Then to announce the dead. Three generations back someone decided some sounds were better left unmade. They took the clappers somewhere. Nobody's looked for them since. Some silences, you keep.",c:[]},
      cols:{ t:"Nobody alive knows. They predate the oldest record. People built around them — fear and practicality are often the same thing, and in this case they were both correct.",c:[]},
      rumors:{ t:"Movement in the Keep — traders who pass near it say the runes on the outer wall were rearranged since their last visit. Not erased. Rearranged. As if the Keep is composing something new.",c:[{l:"What does that mean?",n:'keep_rumor'}]},
      keep_rumor:{ t:"Nobody knows. Aldric has seventeen theories. The Keep has been doing this for as long as anyone has been watching, which is not long enough.",c:[]},
      rest:{ t:"She leads you to a back room — old straw, rough cloth, a window showing a sliver of stars. You sleep deeply and wake feeling as if the city's old bones lent you something of their permanence.",c:[]}
    }
  },

  durren: {
    n:'Durren', title:"Smith — Third of His Name", faction:null,
    greet:"He doesn't look up from the blade he's grinding. Sparks drift past him like slow orange snow. His hands are enormous and very still.",
    nodes:{
      root:{ t:"Speak if you have coin or a question worth answering.",
        c:[
          {l:"Buy Iron Sword (30g)",         n:'bs',  a:'buy', item:'iron_sword',   cost:30},
          {l:"Buy Steel Longsword (65g)",    n:'bsl', a:'buy', item:'steel_sword',  cost:65},
          {l:"Buy Chainmail (60g)",          n:'bc',  a:'buy', item:'chainmail',    cost:60},
          {l:"About the old blade technique.",n:'owep'},
          {l:"I have a Gladiator Blade for you.",n:'qreturn',a:'quest_return',quest:'forge_request',flag:'forge_returned',needs:'gladiator_blade',needsCount:1,take:true}
        ]},
      bs:  { t:"'Plain, balanced, no ornament. It will hold an edge and not break. That is the entire point of a sword.'",c:[]},
      bsl: { t:"'Better steel. You'll feel the difference in your third fight, not your first.'",c:[]},
      bc:  { t:"'Four thousand rings. Every one a small decision. This one has been made four thousand times correctly.'",c:[]},
      owep:{ t:"The old folding technique in Colosseum blades — I've been trying to reverse-engineer it for years. If you find a Gladiator Blade out there, bring it. I'll pay and give you a decent sword for the trade.",
        c:[{l:"I'll find one.",n:'qstart',a:'start_quest',quest:'forge_request'}]},
      qstart:{ t:"The arena keeps them well. The arena ghosts still wield them. Good hunting.",c:[]},
      qreturn:{ t:"He takes it and studies the edge for a long time. 'Third-layer fold. I've been wrong about it for years.' He hands over coin and a blade without looking up.",c:[]}
    }
  },

  aldric: {
    n:'Aldric', title:"Lorekeeper of Aethon", faction:null,
    greet:"He sits in the productive chaos of someone who knows exactly where everything is. When he glances at you over a half-unrolled manuscript, something sharpens — the look of a man who has been waiting for an interesting problem.",
    nodes:{
      root:{ t:"A traveler. Excellent. Nobody in this city cares about history unless it has a price tag. Sit on something that isn't a manuscript.",
        c:[
          {l:"History of Aethon.",           n:'hist'},
          {l:"What do the runes mean?",      n:'runes'},
          {l:"Study with Aldric. (+Lore XP)",n:'teach', a:'teach'},
          {l:"I have Lore Fragments for you.",n:'qreturn',a:'quest_return',quest:'seven_layers',flag:'lore_returned',needs:'lore_fragment',needsCount:3,take:true}
        ]},
      hist:{ t:"Nine civilizations documented. One ended mid-sentence — records stopping in the middle of ordinary days. Not catastrophe. Cessation. The fires went cold in a single night. This is the one I return to.",
        c:[{l:"What ended them?",n:'dest'}]},
      dest:{ t:"War twice, plague once. And once — nothing at all. I believe the Keep was involved. I cannot verify this. The Keep does not cooperate with verification.",c:[]},
      runes:{ t:"I have seventeen translations of the outer wall alone. They are all different. They are, I believe, all correct. The runes say multiple things simultaneously — like a face that is simultaneously sad and proud.",
        c:[{l:"What do they say to you?",n:'tell'}]},
      tell:{ t:"A pattern. Civilizations rise, develop their finest and worst qualities simultaneously, then end. Another rises. The runes don't mourn this. They describe it with the neutrality of someone recording weather.",c:[]},
      teach:{ t:"He produces a scroll from a specific pile without looking. 'Knowing what things are called is the only beginning there is.' You study for two hours.",
        c:[{l:"Thank you.",n:'qoffer'}]},
      qoffer:{ t:"'I need lore fragments — three of them, from different ruins. The script variations tell me which civilization each is from. If you find them, bring them. I'll make it worth your time.'",
        c:[{l:"I'll look for them.",n:'qs',a:'start_quest',quest:'seven_layers'}]},
      qs:   { t:"'They turn up in most of the ruins. The columns near the smithy sometimes yield them too. Different script style — much older.'",c:[]},
      qreturn:{ t:"He examines each one carefully, eyes brightening. 'Third Age script on two, Fourth Age on one. Perfect spread.' He pays immediately, without hesitation.",c:[]}
    }
  },

  yesta: {
    n:'Yesta', title:"Trader of Uncommon Things", faction:null,
    greet:"Quick dark eyes. A belt hung with small pouches at practised positions. She sizes you up in three seconds with the efficiency of someone who has done this ten thousand times.",
    nodes:{
      root:{ t:"Everything I sell works. The price is already at the lowest I'll go — I do the negotiation in my head before you arrive.",
        c:[
          {l:"Buy Health Potion (15g)",    n:'b1', a:'buy', item:'health_potion', cost:15},
          {l:"Buy Mana Shard (18g)",       n:'b2', a:'buy', item:'mana_shard',    cost:18},
          {l:"Buy Smoke Bomb (25g)",       n:'b3', a:'buy', item:'smoke_bomb',    cost:25},
          {l:"Buy Antidote (12g)",         n:'b4', a:'buy', item:'antidote',      cost:12},
          {l:"Buy Tome of Flame (80g)",    n:'b5', a:'buy', item:'tome_flame',    cost:80},
          {l:"Buy Tome of Shadow (75g)",   n:'b6', a:'buy', item:'tome_shadow',   cost:75},
          {l:"Any interesting rumors?",    n:'info'}
        ]},
      b1:{ t:"'Dark amber. Two doses. Don't waste it on anything that will heal on its own.'",c:[]},
      b2:{ t:"'Absorb slowly. Fighting the absorption is how people hurt themselves.'",c:[]},
      b3:{ t:"'Throws smoke. Guarantees escape. Read the label.'",c:[]},
      b4:{ t:"'Clears bleeding and most toxins. Fast-acting.'",c:[]},
      b5:{ t:"'Fireball. Teaches itself when you read it. Find somewhere quiet.'",c:[]},
      b6:{ t:"'Shadow Bolt. Subtle. Efficient. Very popular.'",c:[]},
      info:{ t:"Three travelers this week, all asking about a stone key shaped like a rune that doesn't exist. They bought everything I had in healing supplies before heading toward the Keep. None of them have come back yet.",c:[]}
    }
  },

  /* ══════════════════════════════════
     THE BROKEN COLOSSEUM
  ══════════════════════════════════ */

  ravan: {
    n:'Ravan the Undefeated', title:"Former Champion — Third Civilization", faction:'shade',
    greet:"He materializes from the sand — not dramatically, just gradually present, as if he was always there and you're only now seeing him. Enormous in life; in death, slightly larger. His eyes are two points of amber light.",
    nodes:{
      root:{ t:"You stand on the sand. Not the first. Not the last. The arena cares only about what you do when the moment arrives. What brings you here?",
        c:[{l:"I came to test myself.",n:'test'},{l:"Who were you in life?",n:'who'},{l:"Why do you remain?",n:'remain'},{l:"Teach me your form. (+Blade XP)",n:'teach',a:'teach_blade'}]},
      test:{ t:"Then you are more honest than most. They come for treasure or glory. Some come to prove something to someone who is not here. You come to learn what you are. That is the only reason this arena was built.",c:[]},
      who:{ t:"Champion for eleven years. In the Third Age, the champion was also the city's highest priest — combat was how we communicated with what we worshipped. I no longer remember its name. Death does something to proper nouns.",c:[{l:"What did you worship?",n:'worship'}]},
      worship:{ t:"Not a being, exactly. An idea. The idea that survival is earned, that what persists deserves to persist. I disagree with that idea now. Death changes your positions on competition.",c:[]},
      remain:{ t:"I've asked that question for longer than I can calculate. The sand keeps calling me back. There is one more opponent I need to face — something I left unfinished. I don't know their name. I'll know them when they arrive.",c:[]},
      teach:{ t:"He demonstrates a form — minimal movement, extraordinary precision, every gesture rooted in the body's center. 'Your sword moves after your body. Always after. The sword is a consequence, never an intention.' You practice until your arms ache.",c:[]}
    }
  },

  yast: {
    n:'Commander Yast', title:"Leader of the Shade Company", faction:'shade',
    greet:"A massive shade in full arena armour, standing at the center of the hall. Utterly still. It regards you with calm authority.",
    nodes:{
      root:{ t:"You enter the hall of the Shade Company. We have maintained order here since the Third Age ended. You are the first living visitor in eleven months.",
        c:[{l:"What is the Shade Company?",n:'what'},{l:"What do you want here?",n:'want'},{l:"I want to enter the tournament.",n:'qstart',a:'start_quest',quest:'shade_tournament'}]},
      what:{ t:"The arena shades who retained enough will to organize. We maintain rank, we maintain the challenge-records, we maintain the hall. Order is the only legacy we have.",c:[]},
      want:{ t:"To continue. To remember. The arena gave us purpose in life. It gives us structure in death. We ask only that visitors respect the hall.",c:[]},
      qstart:{ t:"The tournament is a test, not a sport. Defeat the Gladiator Shade in the floor and the Stone Golem in the outer ruins. Your performance will be recorded.",c:[]}
    }
  },

  petra: {
    n:'Petra', title:"Shade Archivist", faction:'shade',
    greet:"A smaller shade surrounded by what appear to be stone tablets in constant rearrangement.",
    nodes:{
      root:{ t:"The records are organized by decade, era, and technique. Do you have a question about the Third Age, or about the current state of the arena?",
        c:[{l:"Tell me about the Third Age.",n:'third'},{l:"What lives here now?",n:'lives'}]},
      third:{ t:"A civilization that understood combat as theology. They believed the test proved the thing — that what survived deserved to survive. Ravan was their finest expression. I am their finest counterargument.",c:[]},
      lives:{ t:"The stone golems are maintenance constructs without maintenance goals. The arena ghosts are echoes. Ravan is the only one with genuine will. The rest of us are... organized echoes.",c:[]}
    }
  },

  /* ══════════════════════════════════
     IRONBELL MONASTERY
  ══════════════════════════════════ */

  seiran: {
    n:'Seiran', title:"Third Practitioner of Still Listening", faction:null,
    greet:"She sits in complete stillness. Not the stillness of sleep — active stillness, a presence gathered entirely into itself. When you approach, she opens her eyes without surprise.",
    nodes:{
      root:{ t:"You came far for silence. Most people don't think silence is worth traveling for. The mountain doesn't hurry.",
        c:[
          {l:"What is Still Listening?",        n:'prac'},
          {l:"Why are the bells silent?",        n:'bells'},
          {l:"Teach me focus. (+Mysticism XP)",  n:'teach',a:'teach_myst'},
          {l:"I have a Focus Stone for you.",    n:'qreturn',a:'quest_return',quest:'still_waters',flag:'focus_returned',needs:'focus_stone',needsCount:1,take:true}
        ]},
      prac:{ t:"Not emptiness — presence without motion. In that state, older currents become perceptible. The world has a signal. Most people generate too much noise to hear it.",
        c:[{l:"What is the signal?",n:'signal'}]},
      signal:{ t:"We've been listening for three hundred years. It is old, patient, and not addressed to us specifically — which our founder found humbling and I find correct. We are not the audience for everything.",c:[]},
      bells:{ t:"They rang once during a storm with no wind. Three monks stopped speaking — by choice, not from trauma. They said the sound was a message and they were still reading it. The last survivor's most recent word, six years ago, was 'almost.'",
        c:[{l:"What does 'almost' mean?",n:'almost'}]},
      almost:{ t:"We don't know. We've been waiting six years for the next word. She writes occasionally. Nothing since.",c:[]},
      teach:{ t:"She leads you beside the largest bell. It hums. You hum back without meaning to. Something in you resonates with something in the metal, and for a moment you understand a fraction of what she means.",
        c:[{l:"Thank you.",n:'qoffer'}]},
      qoffer:{ t:"'A student struggles. Bell Wraiths carry fragments of the bells' resonance — their focus stones hold it. If you find one, bring it.'",
        c:[{l:"I'll look for one.",n:'qs',a:'start_quest',quest:'still_waters'}]},
      qs:{ t:"'Bell Wraiths roam the courtyard and tower. They are drawn to stillness, strangely.'",c:[]},
      qreturn:{ t:"She accepts it with both hands and closes her eyes for a long moment. 'Yes. The resonance is still there.' She thanks you in a way that feels more permanent than words.",c:[]}
    }
  },

  orath: {
    n:'Orath', title:"The Bell-Keeper", faction:null,
    greet:"A very old man moving around the largest bell with the focused attention of a surgeon. When he looks at you, his eyes are perfectly calm.",
    nodes:{
      root:{ t:"Please don't touch the bells. That is all I ask of anyone.",
        c:[{l:"Why not?",n:'touch'},{l:"How long have you been here?",n:'time'},{l:"What are they made of?",n:'mat'}]},
      touch:{ t:"The sound travels inward, not outward. Into whoever rings them. You hear it for days. Some people never stop hearing it. One man rang the smallest bell on a dare and reported the sound for eleven months. Then he stopped reporting.",c:[]},
      time:{ t:"I came when I was young. I've stopped measuring. Time in the monastery runs differently — long days, short years. Or the reverse. I've stopped distinguishing.",c:[]},
      mat:{ t:"Iron, technically. But they don't rust. They're always room temperature regardless of the ambient temperature — I've measured this across seasons for forty years. My only theory is that 'room temperature' does not refer to this room.",c:[]}
    }
  },

  /* ══════════════════════════════════
     THE SUNKEN PIERS
  ══════════════════════════════════ */

  noa: {
    n:'Noa', title:"The Watcher at the Piers", faction:null,
    greet:"She sits at the dock's edge, feet dangling into black water. The calm of someone who has made peace with not knowing.",
    nodes:{
      root:{ t:"Pull up a stone. Something rose at sundown and sat for three minutes before sinking. I didn't get a good look. I don't think I was supposed to.",
        c:[{l:"What are you watching for?",n:'watch'},{l:"What's underwater?",n:'under'},{l:"Where did the people go?",n:'left'}]},
      watch:{ t:"Things that surface. Seven years, sixty-three events. I've stopped trying to find meaning and started just recording. The record might matter to someone later.",c:[]},
      under:{ t:"A complete city. Tables set, fires laid, personal effects on shelves. On clear days through the water you can read the shop signs. They say ordinary things: Bread. Copper. Books.",c:[]},
      left:{ t:"They departed deliberately and completely, taking nothing. Every scholar who reviewed the evidence arrived at the same destination: the Runic Keep. None of them have followed up publicly.",c:[]}
    }
  },

  sorn: {
    n:'Sorn', title:"Relic Diver", faction:null,
    greet:"He's wringing water from his hair with mechanical focus. His skin is mapped with old scars in patterns that suggest things that didn't want him to leave.",
    nodes:{
      root:{ t:"Keep back. I've been cold for three hours and my patience is proportional.",
        c:[
          {l:"What did you find today?",    n:'find'},
          {l:"What's the diving like?",     n:'dive'},
          {l:"I have 2 relics for you.",    n:'qreturn',a:'quest_return',quest:'heralds_cargo',flag:'relic_returned',needs:'sunken_relic',needsCount:2,take:true},
          {l:"I'd like to help with that.", n:'qask'}
        ]},
      find:{ t:"A ring with markings I don't recognize. Third this month with those same marks. Someone important was buried down there, in multiple locations — which doesn't make sense unless you scatter a person.",c:[]},
      dive:{ t:"Cold. Buildings intact. The construct I call Herald is loading invisible cargo onto an invisible ship. Years I've watched it. It has never made an error. I respect it and give it a very wide berth.",c:[]},
      qask:{ t:"A private collector. Pays well, asks no questions. Two sunken relics from the deep sections. The diving platform has the best access.",
        c:[{l:"I'll find them.",n:'qstart',a:'start_quest',quest:'heralds_cargo'}]},
      qstart:{ t:"'The diving platform. Watch for the drowned knight — it covers that whole section and does not negotiate.'",c:[]},
      qreturn:{ t:"He counts them. Nods. Counts the coin. Hands it over. 'Don't ask me what he wants them for.'",c:[]}
    }
  },

  moras: {
    n:'Captain Moras', title:"Captain of the Drowned", faction:'drowned',
    greet:"A figure in waterlogged armour that should be rusted shut but moves freely. Eyes like clouded glass. Speaks with the measured patience of someone who has been patient for a very long time.",
    nodes:{
      root:{ t:"You are the living visitor. We have been expecting someone eventually. Our people remember you — or rather, we remember the category of you.",
        c:[{l:"Who are the Drowned?",n:'who'},{l:"What do you trade?",n:'trade'},{l:"What happened to your civilization?",n:'civ'},{l:"I have a record for you.",n:'qreturn',a:'quest_return',quest:'drowned_record',flag:'drowned_record_returned',needs:'lore_fragment',needsCount:1,take:true}]},
      who:{ t:"We are the pier civilization's dead who retained consciousness. Not all of us — perhaps one in forty. We do not know why those of us who think, think. We have stopped asking. We organize instead.",c:[]},
      trade:{ t:"We can reach parts of the sunken city the living cannot. We recover items and trade here for things we cannot make ourselves — written materials, tools, supplies for work we continue below.",
        c:[{l:"What work do you continue?",n:'work'}]},
      work:{ t:"The same work. We were a port civilization. We manage the port. The ships don't come anymore, but the port requires management regardless. We have decided that maintaining the work maintains the self.",c:[]},
      civ:{ t:"We left. All of us, in a single organized departure. I remember the beginning of where we went. Then I woke in the water. Nine hundred years ago.",
        c:[{l:"Where did you go?",n:'dest'},{l:"Can I help recover records?",n:'qask'}]},
      dest:{ t:"The Keep. We walked to the Runic Keep in a single column. What happened there — the memory ends. We woke in the water, mostly dead, some of us still thinking.",c:[]},
      qask:{ t:"There is a fragment we left before the departure — a record of the decision to go. It fell into the diving platform area. We cannot retrieve it ourselves. The living can.",
        c:[{l:"I'll find it.",n:'qstart',a:'start_quest',quest:'drowned_record'}]},
      qstart:{ t:"'The diving platform. Below the main dock. The fragment is inscribed stone — you will recognize our script from other relics.'",c:[]},
      qreturn:{ t:"He holds it for a long time. 'This is the record of the decision. We made it by consensus. Every person agreed.' He reads it slowly. 'We still agreed, apparently. Even knowing what followed.'",c:[]}
    }
  },

  liss: {
    n:'Liss', title:"The Young Drowned", faction:'drowned',
    greet:"She looks perhaps seventeen, which she has looked for nine hundred years. She is the most talkative of the Drowned by a significant margin.",
    nodes:{
      root:{ t:"Oh, a living one! Moras said you'd come. Are you going to dive? I can tell you where the good salvage is.",
        c:[{l:"Where's the good salvage?",n:'salvage'},{l:"What's it like being you?",n:'life'},{l:"Buy Ash Crystal (35g)",n:'buy_ash',a:'buy',item:'ash_crystal',cost:35}]},
      salvage:{ t:"The lower market district — submerged about forty feet. The spice merchant's basement has never been properly searched. Also the harbor-master's office, if you can get past Herald. Herald does not appreciate interruptions.",c:[]},
      life:{ t:"Strange for a while. Not anymore. Nine hundred years is a long time to adjust. I miss bread. Warm bread with salt. Everything else I've found an equivalent for. Not bread.",c:[]},
      buy_ash:{ t:"'Got this from Wynn at the forest edge. Don't ask me how they got it down here.'",c:[]}
    }
  },

  /* ══════════════════════════════════
     THE ASHWOOD
  ══════════════════════════════════ */

  wynn: {
    n:'Wynn', title:"Hermit of the Ashwood", faction:null,
    greet:"Pale ash on their hands, silver leaves in their hair. Eyes that have spent years watching things that don't usually get watched.",
    nodes:{
      root:{ t:"You walk where things observe you. You came anyway. That says something about you.",
        c:[{l:"What lives in the Ashwood?",n:'lives'},{l:"What caused the burning?",n:'burn'},{l:"Tell me about the Ash-folk.",n:'ash'},{l:"Teach me Ashwood archery. (+Archery XP)",n:'teach',a:'teach_arch'}]},
      lives:{ t:"Things shaped by the burning. The shadow-hounds are ordinary predators. The treants operate on conditions so different from ours that harm becomes incidental. The Ash-folk are something else entirely — not creatures, people.",c:[]},
      burn:{ t:"Not natural fire. Wrong ash, wrong composition, wrong temperature. The burning came from the direction of the Keep, outward in a circle. The Ashwood is its radius. Whatever the Keep did, it did it before anyone was here to see.",c:[]},
      ash:{ t:"They were here before the burning and changed by it rather than destroyed. They understand this forest better than anyone alive. If you find the Hollow, speak to Elder Vae with respect. She has been patient with less.",c:[]},
      teach:{ t:"Wynn demonstrates. The arrow bends, slightly, around an obstacle you couldn't have predicted. 'Shoot where the target will be. The Ashwood teaches you to understand time slightly differently. That takes practice.'",c:[]}
    }
  },

  vae: {
    n:'Elder Vae', title:"Elder of the Ash-folk", faction:'ash',
    greet:"A grey-skinned figure of indeterminate age, eyes the colour of ash-coal, moving with the slow deliberateness of someone who learned long ago that most urgency is unnecessary.",
    nodes:{
      root:{ t:"Traveler from outside. Sit, if you can find somewhere. Our homes are not built for people your colour.",
        c:[
          {l:"Who are the Ash-folk?",   n:'who'},
          {l:"What is this place?",     n:'place'},
          {l:"Do you need anything?",   n:'quest'},
          {l:"I have a Bone Rune for you.", n:'qreturn',a:'quest_return',quest:'ash_and_bone',flag:'bone_returned',needs:'bone_rune',needsCount:1,take:true}
        ]},
      who:{ t:"We were here before the burning. Changed by it, but not after it — during. We remember the forest as green. We prefer it as it is. This is not a tragedy that happened to us. It is what we became.",c:[]},
      place:{ t:"The Hollow has been here since before the burning. The trees protect it. We protect the trees. The arrangement predates memory.",
        c:[{l:"What do the Ash-folk do?",n:'do'}]},
      do:{ t:"We tend the forest, keep the path markers from being consumed, trade occasionally, and study the ash. There is information in it we have been reading for millennia.",c:[]},
      quest:{ t:"In the deep wood — past where the stalkers range, past the largest treants — there is a Bone Rune one of our elders left long ago. The creatures there will not allow our passage in that direction. They know us too well. You, they don't know yet.",
        c:[{l:"I'll find it.",n:'qstart',a:'start_quest',quest:'ash_and_bone'}]},
      qstart:{ t:"The deep wood. Past the shrine clearing, near three stacked stones — not ours, older. The rune is nearby.",c:[]},
      qreturn:{ t:"She takes it and holds it for a long moment with both hands. 'It is as I remembered.' She pays you and thanks you in the way of her people — a single long bow, eyes closed.",c:[]}
    }
  },

  kern: {
    n:'Kern', title:"Ash-folk Trader", faction:'ash',
    greet:"A shorter, younger-looking Ash-folk who is clearly responsible for the community's external trade. Efficient and businesslike.",
    nodes:{
      root:{ t:"You look healthy. Unusual for a traveler this deep in the wood. What do you need?",
        c:[
          {l:"Buy Ash Spear (90g)",    n:'b1',a:'buy',item:'ash_spear',    cost:90},
          {l:"Buy Ash Vestment (75g)", n:'b2',a:'buy',item:'ash_vestment', cost:75},
          {l:"Buy Ash Crystal (30g)", n:'b3',a:'buy',item:'ash_crystal',   cost:30},
          {l:"What is ash-crystal?",  n:'crystal'}
        ]},
      b1:{ t:"'Ash-crystal tip. Channels something from the forest. Better than iron for what lives here.'",c:[]},
      b2:{ t:"'Woven from fibers between the bark. Light. Warm in cold. Doesn't burn.'",c:[]},
      b3:{ t:"'Medicine, broadly. Restores focus and energy. We use it for everything.'",c:[]},
      crystal:{ t:"The burning left something in the ash — a compound we don't have a name for in your language. Concentrated, it does useful things. We've spent a very long time learning what things.",c:[]}
    }
  },

  /* ══════════════════════════════════
     THE RUNIC KEEP
  ══════════════════════════════════ */

  guardian: {
    n:'The Guardian', title:"Warden of the Runic Keep", faction:'warden',
    greet:"Massive, stone-formed, runes drifting across its surface like slow fire. When it speaks, the sound is stone finding the shapes of language.",
    nodes:{
      root:{ t:"You have come far. The Keep has observed your approach. The skills you carry are the language in which the Keep speaks to visitors. You have learned enough to be heard.",
        c:[{l:"I seek to understand the runes.",n:'runes'},{l:"I seek to face the Eternal Guardian.",n:'boss'},{l:"What are you?",n:'what'},{l:"Tell me about the cycle.",n:'cycle'}]},
      runes:{ t:"The runes describe the pattern — civilizations rise, develop, end. Not tragedy, not triumph. Process. The Keep records each iteration for something that reads at a longer timescale.",
        c:[{l:"What reads it?",n:'reader'}]},
      reader:{ t:"We call it the Patient. It does not communicate in forms we recognize. But the runes change between cycles, incrementally, in response to something. We record. The Patient reads. That is the arrangement.",c:[]},
      boss:{ t:"The Eternal Guardian is the Keep's question given form. It asks what you are — not in words. In force. Your answer is what you do. It has been waiting a very long time for an answer that satisfies it.",c:[]},
      what:{ t:"I am continuity. I persist across cycles so each new civilization inherits some thread of what came before. I am the memory of a world that forgets itself regularly. I have found this function meaningful. I have had a long time to consider whether it is.",c:[]},
      cycle:{ t:"The world wakes. Knowledge accumulates until critical complexity. Something breaks. The world rests. Then wakes again. You are late in a cycle. That weight you feel in the ruins — that is accumulated endings.",c:[]}
    }
  },

  warden7: {
    n:'Warden-7', title:"Stone Warden — Keep Cataloguer", faction:'warden',
    greet:"A stone construct slightly taller than a person, moving between rune-covered walls with methodical precision. It rotates its head to acknowledge you.",
    nodes:{
      root:{ t:"Visitor registered. You are visitor 4,847 in recorded history. Your skills qualify you for restricted sections. What information do you seek?",
        c:[{l:"What do you catalogue?",n:'cat'},{l:"How long has the Keep existed?",n:'age'},{l:"What is the cycle?",n:'cycle'}]},
      cat:{ t:"All observable phenomena within and surrounding the Keep. All civilizations in recording range. All visitors. All rune-system changes. The Patient's responses, where legible. The catalogue is ongoing.",c:[]},
      age:{ t:"The Keep predates our measurement system. Records begin approximately forty thousand years ago. The Keep was already old then. We do not know what 'new' would look like for a structure like this.",c:[]},
      cycle:{ t:"The runes describe seventeen complete cycles in our records. You are in the late-middle of the eighteenth. Estimated time to critical complexity: two to four human generations.",
        c:[{l:"What happens at critical complexity?",n:'crit'}]},
      crit:{ t:"The records are unclear on mechanism. Consistent on outcome: a period of significant complexity reduction, followed by a new beginning. The shortest recorded reduction was eleven years.",c:[]}
    }
  },

  indexer: {
    n:'The Indexer', title:"Stone Warden — Rune Interpreter", faction:'warden',
    greet:"This Warden is smaller, covered in more runes than the others, and seems to be in constant conversation with the walls.",
    nodes:{
      root:{ t:"You wish to understand the runes. Many visitors do. I will tell you what I can, which is more than most can receive and less than you will want.",
        c:[{l:"What do the runes say?",n:'say'},{l:"What is the Patient?",n:'patient'},{l:"Teach me. (+Lore XP)",n:'teach',a:'teach_lore'}]},
      say:{ t:"In simplified form: 'This happened. This happened. This happened. Something is being understood.' The runes are not communicating to us. We are observing communication between the Keep and the Patient.",c:[]},
      patient:{ t:"An entity or process that reads the Keep's records and responds by updating the rune-system. Whether it is conscious, whether it is singular, whether it is benevolent — these are meaningless questions for something operating at this scale.",c:[]},
      teach:{ t:"It spends an hour walking you through the structural grammar of all three scripts. You understand perhaps three percent of what you see. This is, it tells you, better than most manage.",c:[]}
    }
  }
};