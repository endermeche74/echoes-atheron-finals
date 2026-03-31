/* ═══════════════════════════════════════
   ECHOES OF AETHON — Extra NPCs
   New villages and outpost characters.
   Load this AFTER js/data/npcs.js
   ════════════════════════════════════ */

/* ── GREYSTONE VILLAGE ─────────────── */

NPCS['agatha'] = {
  n:'Agatha', title:'Village Healer of Greystone', faction:null,
  greet:'A woman in her sixties with the calm efficiency of someone who has dealt with injuries long enough that nothing surprises her. She is sorting dried herbs when you arrive and does not stop.',
  nodes:{
    root:{ t:'Sit if you\'re hurt. I can tell from the door if someone needs work or just conversation.',
      c:[
        {l:'I need healing. (15g — full HP)',    n:'heal',   a:'heal_full'},
        {l:'Buy Health Potion (12g)',             n:'bp',     a:'buy', item:'health_potion',  cost:12},
        {l:'Buy Greater Health Potion (28g)',     n:'bgp',    a:'buy', item:'greater_hp',     cost:28},
        {l:'Buy Antidote (10g)',                  n:'bant',   a:'buy', item:'antidote',       cost:10},
        {l:'Tell me about the village.',          n:'village'},
        {l:'Any work you need done?',             n:'quest_offer'}
      ]},
    heal:    { t:'She works quickly and without commentary. When she finishes, you feel as if the last several hours of damage have been reconsidered.',c:[]},
    bp:      { t:'\'My own recipe. Better than what the city sells, cheaper too. Don\'t tell the city.\'',c:[]},
    bgp:     { t:'\'For when ordinary help isn\'t enough.\'',c:[]},
    bant:    { t:'\'Clears most things. River-herb base. Works on whatever the ruins send our way.\'',c:[]},
    village: { t:'Greystone has been here since before the city. We outlasted the Third Age, the Fourth, the fall of the Piers. We\'re good at outlasting things. The trick is minding your own business and not going near the ruins at night.',
      c:[{l:'What comes from the ruins at night?',n:'night'}]},
    night:   { t:'Things that were people, mostly. And things that were never people but have decided to act like it. Both types are trouble. The wolves are ordinary wolves and perfectly manageable by comparison.',c:[]},
    quest_offer:{ t:'The mill at the forest edge stopped working three months ago. Not mechanical failure — something in the building won\'t let anyone in to fix it. I\'d pay for someone to go look.',
      c:[{l:'I\'ll check the mill.',n:'q_start', a:'start_quest', quest:'mill_mystery'}]}  ,
    q_start: { t:'\'East path from the village, past the grey stones, you\'ll hear the wheel before you see it. It turns. Nothing powers it.\'',c:[]}
  }
};

NPCS['torven'] = {
  n:'Torven', title:'Elder of Greystone', faction:null,
  greet:'An old man sitting on a stone bench that has been his seat for thirty years. He waves you over without standing up.',
  nodes:{
    root:{ t:'Haven\'t seen a traveler from the city in a while. Usually they\'re heading to the ruins. Are you heading to the ruins?',
      c:[
        {l:'What can you tell me about the region?',  n:'region'},
        {l:'Tell me about the crossroads.',           n:'cross'},
        {l:'What\'s in the watchtower?',              n:'tower'},
        {l:'I\'m looking for work.',                  n:'quest_offer'}
      ]},
    region:{ t:'Greystone sits between the city and three different kinds of ruin. The Colosseum to the east, the forest south, the mountains north. We stay in the middle and grow food. The ruins leave us alone if we leave them alone. Mostly.',c:[]},
    cross:{  t:'The crossroads stone has been there since before memory. Whoever cut it knew the paths would still be used — they were right. The directions on it are still correct, which is more than you can say for most things that old.',c:[]},
    tower:{  t:'Nobody from the village goes up there. Not forbidden — just understood. Someone was using it recently. A scout, maybe, or a watcher of some kind. They\'ve been there before. They always leave before we notice them.',c:[]},
    quest_offer:{ t:'Grey wolves have been coming closer to the fields. Not dangerous yet, but learning. If someone culled a few, the rest would remember to keep distance. I\'d pay.',
      c:[{l:'I can do that.',n:'q_wolf', a:'start_quest', quest:'wolf_cull'}]},
    q_wolf:{ t:'\'They come in from the south road, near the grey stone markers. You\'ll find them there most reliably at dusk.\'',c:[]}
  }
};

NPCS['bram'] = {
  n:'Bram', title:'Village Blacksmith', faction:null,
  greet:'Younger than Durren, noisier. His forge is smaller but his enthusiasm is not.',
  nodes:{
    root:{ t:'City-made? I can do better. My prices are better too, because I don\'t have to pay city rent.',
      c:[
        {l:'Buy Iron Sword (22g)',              n:'b1',a:'buy',item:'iron_sword',       cost:22},
        {l:'Buy War Hammer (55g)',              n:'b2',a:'buy',item:'war_hammer',        cost:55},
        {l:'Buy Leather Armor (20g)',           n:'b3',a:'buy',item:'leather_armor',     cost:20},
        {l:'Buy Reinforced Leather (38g)',      n:'b4',a:'buy',item:'reinforced_leather',cost:38},
        {l:'Buy Iron Shield (30g)',             n:'b5',a:'buy',item:'iron_shield',       cost:30}
      ]},
    b1:{ t:'\'Good balance. Made it yesterday. Still warm, technically.\'',c:[]},
    b2:{ t:'\'For when you want to make a strong argument.\'',c:[]},
    b3:{ t:'\'Reinforced at every joint. I learned that from fixing the injuries when people didn\'t have good armor.\'',c:[]},
    b4:{ t:'\'Double leather at the shoulders and lower back. That\'s where people get hit and don\'t notice until later.\'',c:[]},
    b5:{ t:'\'Heavy. It will make you stronger just carrying it.\'',c:[]}
  }
};

/* ── WATCHTOWER SUMMIT ─────────────── */

NPCS['scout_nem'] = {
  n:'Nem', title:'Scout — Allegiance Unknown', faction:null,
  greet:'She returns to the tower while you\'re looking at the view. Doesn\'t reach for a weapon. Just watches you watch the landscape.',
  nodes:{
    root:{ t:'You found the tower. Most people miss it. What are you doing out here?',
      c:[
        {l:'Just exploring.',          n:'exp'},
        {l:'What are you watching for?',n:'watch'},
        {l:'Sell me something.',        n:'trade'}
      ]},
    exp:{   t:'\'That\'s a better answer than most people give. The honest ones say exploring. The dishonest ones say the same thing but slower.\'',c:[]},
    watch:{ t:'\'Movement between the ruins. Something has been crossing between the Colosseum and the Keep at irregular intervals. Not people. Too large, too fast, too quiet.\'',c:[{l:'Does it follow a pattern?',n:'pattern'}]},
    pattern:{ t:'\'None I\'ve mapped yet. That\'s why I\'m still here.\'',c:[]},
    trade:{ t:'\'I travel light but I carry surplus.\'',
      c:[
        {l:'Buy Smoke Bomb (20g)',      n:'t1',a:'buy',item:'smoke_bomb',   cost:20},
        {l:'Buy Shadow Knife (80g)',    n:'t2',a:'buy',item:'shadow_knife', cost:80},
        {l:'Buy Tome of Shadow (60g)',  n:'t3',a:'buy',item:'tome_shadow',  cost:60}
      ]},
    t1:{ t:'\'Three uses in here. Don\'t confuse them with food.\'',c:[]},
    t2:{ t:'\'Found it in the Colosseum. It preferred me to the shade that was carrying it.\'',c:[]},
    t3:{ t:'\'Read it twice. Once to learn it. Once because it\'s worth reading.\'',c:[]}
  }
};

/* ── IRONWOOD OUTPOST ──────────────── */

NPCS['kael_trader'] = {
  n:'Kael', title:'Trader — Ironwood Outpost', faction:null,
  greet:'He stops arguing with Soma long enough to look at you, assess your inventory by eye, and nod.',
  nodes:{
    root:{ t:'If you\'re going into the Ashwood, stock up. If you\'re coming out, I\'ll buy what you\'ve got.',
      c:[
        {l:'Buy Ash Crystal (28g)',       n:'b1',a:'buy',item:'ash_crystal',    cost:28},
        {l:'Buy Mana Potion (32g)',        n:'b2',a:'buy',item:'mana_potion',    cost:32},
        {l:'Buy Health Potion (14g)',      n:'b3',a:'buy',item:'health_potion',  cost:14},
        {l:'Buy Tome of Earth (70g)',      n:'b4',a:'buy',item:'tome_earth',     cost:70},
        {l:'What\'s in the Ashwood?',     n:'ash'},
        {l:'Tell me about the outpost.',  n:'post'}
      ]},
    b1:{ t:'\'Ash-folk make it. I don\'t ask what\'s in it. It works.\'',c:[]},
    b2:{ t:'\'Monastery recipe. The monks sell me a batch every season.\'',c:[]},
    b3:{ t:'\'Standard. Clean. Won\'t poison you.\'',c:[]},
    b4:{ t:'\'Someone brought it out of the deep wood. I don\'t go in far enough to find these myself.\'',c:[]},
    ash:{ t:'\'Things that were changed by whatever burned it. Not hostile unless you threaten them. The treants are the exception — they have their own logic. Learn it or avoid them.\'',c:[]},
    post:{ t:'\'Soma and I built it eight years ago to argue in. We needed a fixed location. It turned into a business.\'',c:[]}
  }
};

NPCS['soma_guard'] = {
  n:'Soma', title:'Guard — Ironwood Outpost', faction:null,
  greet:'She stops arguing with Kael long enough to look at your equipment, evaluate whether you\'re a threat, and conclude you\'re not.',
  nodes:{
    root:{ t:'You\'re either going into the forest or coming out of it. Which is it?',
      c:[
        {l:'Going in.',   n:'in'},
        {l:'Coming out.', n:'out'},
        {l:'Just passing through.',n:'pass'}
      ]},
    in:{  t:'\'Then pay attention to the light. It changes in there — color and direction both. If you stop knowing which way is north, find the highest ground and look for the mountain. It\'s always north.\'',c:[]},
    out:{ t:'\'Anything worth reporting?\'',c:[{l:'Just exploring.',n:'pass'}]},
    pass:{ t:'\'Fair enough. Kael will sell you supplies if you need them. I\'ll watch the perimeter. That\'s the arrangement.\'',c:[]}
  }
};