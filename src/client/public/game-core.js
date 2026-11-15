(()=>{'use strict';
const S=3,W=192,H=128,WW=576,$=id=>document.getElementById(id);
const SC=[
{n:'Cosmos',w:'KRAKEN',h:'Leave the stars. Go where sunlight gives up and the dark has teeth.',bg:['#0a0618','#1c1040','#2a1a5e'],p:['#ffcf4d','#ff6a2b','#b56cff','#4ad6e8'],k:['orb','ring','gem'],ac:'#ff8fd0'},
{n:'Deep Sea',w:'SCARAB',h:'Trade the waves for waves of sand. Something sacred rolls the sun.',bg:['#02101f','#05304f','#0b4a73'],p:['#3fe0d0','#ff7aa8','#f5f5ff','#2d7fd6'],k:['cap','orb','gem'],ac:'#7ad7f0',j:1},
{n:'Dune Ruins',w:'SPORES',h:'Leave the heat. Something breathes in the shade, and it glows.',bg:['#2a1410','#5a2a1c','#8a4a26'],p:['#f2c879','#d98a3d','#fff0c9','#a8582a'],k:['tri','gem','orb'],ac:'#ffe3a3',f:1},
{n:'Fungal Grove',w:'CALDERA',h:'Down the roots, deeper, until the stone turns red and the ground sighs.',bg:['#12062a','#2a0f55','#3c1a74'],p:['#c77dff','#7bf1a8','#ff9ad5','#f5e663'],k:['cap','orb','gem'],ac:'#7bf1a8'},
{n:'Volcano Forge',w:'AURORA',h:'Cool down. The sky itself is dancing over a world of white.',bg:['#1a0707','#3d0f0c','#6a1b10'],p:['#ff5a1f','#ffc23a','#7a1c14','#ffe9a8'],k:['tri','orb','gem'],ac:'#ffc23a',f:1},
{n:'Aurora Tundra',w:'PORTCULLIS',h:'Where the ice ends, an iron gate rises and a drawbridge waits.',bg:['#071428','#0f2f55','#1b4b6e'],p:['#bfeaff','#6fb7e8','#ffffff','#7bf1c0'],k:['tri','gem','orb'],ac:'#7bf1c0',f:1},
{n:'Clockwork Castle',w:'ASTROLABE',h:'Climb the tallest tower and point at the heavens. A dome opens to the night.',bg:['#120e18','#2a2038','#3d2e52'],p:['#d9c5a0','#8d6a9f','#f0e6c8','#c9503a'],k:['tower','orb','gem'],ac:'#d9c5a0',f:1}];
const SK=[{id:'exp',n:'Explorer',c:'#f2c9a0',h:'#c9503a',p:0},{id:'bot',n:'Robot',c:'#9fb4c7',h:'#3a506b',p:40},{id:'pir',n:'Pirate',c:'#e0b48a',h:'#22202a',p:80},{id:'dino',n:'Dino',c:'#7bd88f',h:'#2e8b57',p:120},{id:'ghost',n:'Ghost (weekly chest)',c:'#f5f5ff',h:'#c77dff',p:-1}];
const DN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const GHOST_PALETTES=[
 {n:'Mint',c:'#b8ffe3',h:'#35b78b'},
 {n:'Ember',c:'#ffe0b0',h:'#ef7b36'},
 {n:'Moonlight',c:'#e4ddff',h:'#8170d8'},
 {n:'Rose',c:'#ffd0e8',h:'#df659c'},
 {n:'Ocean',c:'#b9edff',h:'#398fca'},
 {n:'Solar',c:'#fff1a8',h:'#d8a52e'},
 {n:'Lilac',c:'#f0caff',h:'#ad63d1'},
 {n:'Slime',c:'#e0ffa8',h:'#83b936'}];
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuf(a,r){for(let i=a.length-1;i>0;i--){const j=(r()*(i+1))|0;[a[i],a[j]]=[a[j],a[i]]}return a}
// Each player's day follows their own device timezone (falls back to UTC if it is unavailable).
const USER_TZ=(()=>{try{const z=Intl.DateTimeFormat().resolvedOptions().timeZone;new Intl.DateTimeFormat('en',{timeZone:z});return z||'UTC'}catch(e){return'UTC'}})();
function localToday(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:USER_TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const v=Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
 return new Date(Date.UTC(v.year,v.month-1,v.day,12));
}
const fmt=d=>d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');
const dateAt=o=>{const d=localToday();d.setUTCDate(d.getUTCDate()+o);return d};
const wdOf=d=>(d.getUTCDay()+6)%7;
function ghostForWeek(weekKey){const week=Math.floor(Date.parse(weekKey+'T00:00:00Z')/604800000),palette=GHOST_PALETTES[((week%GHOST_PALETTES.length)+GHOST_PALETTES.length)%GHOST_PALETTES.length];return{id:'ghost-'+weekKey,n:'Ghost · '+palette.n,c:palette.c,h:palette.h,p:-1}}
function skinForId(id){return SK.find(s=>s.id===id)||(/^ghost-\d{4}-\d{2}-\d{2}$/.test(id)?ghostForWeek(id.slice(6)):null)}
function shopSkins(weekKey){const ids=[...SK.filter(s=>s.id!=='ghost').map(s=>s.id),ghostForWeek(weekKey).id,...st.own.filter(id=>/^ghost-\d{4}-\d{2}-\d{2}$/.test(id))];if(st.own.includes('ghost'))ids.push('ghost');return[...new Set(ids)].map(skinForId).filter(Boolean)}
const levelFor=xp=>1+Math.floor(Math.max(0,Number(xp)||0)/80);
const moveSpeed=()=>Math.min(92,62+(levelFor(st.xp||0)-1)*3);
let st,G,off=0,note='',cx,specialActive=false;
try{st=JSON.parse(JSON.stringify(window.__PTH&&window.__PTH.state||null))}catch(e){}
st=st&&typeof st==='object'?st:{coins:0,own:['exp'],sk:'exp',days:{},chest:{}};
st.coins=Math.max(0,Number(st.coins)||0);
st.xp=Math.max(0,Number(st.xp)||0);
st.own=Array.isArray(st.own)?st.own.filter(x=>typeof x==='string'):['exp'];
if(!st.own.includes('exp'))st.own.push('exp');
if(!skinForId(st.sk))st.sk='exp';
st.days=st.days&&typeof st.days==='object'?st.days:{};
st.chest=st.chest&&typeof st.chest==='object'?st.chest:{};
st.lv=Math.max(1,Math.min(levelFor(st.xp),Math.floor(Number(st.lv)||levelFor(st.xp))));
const save=()=>{try{window.__PTH&&window.__PTH.save(st)}catch(e){}};
const D=()=>{
 let d=st.days[G.key];
 if(!d)d=st.days[G.key]={op:[],wr:0,co:0,xp:0,px:0,res:null};
 if(!Array.isArray(d.op))d.op=[];
 d.op=[...new Set(d.op.filter(i=>Number.isInteger(i)&&i>=0&&i<G.sp.length))];
 d.wr=Math.max(0,Math.min(maxLives(),Math.floor(Number(d.wr)||0)));
 d.co=Math.max(0,Number(d.co)||0);
 d.xp=Math.max(0,Math.min(60,Number(d.xp)||0));
 d.px=Math.max(0,Math.floor(Number(d.px)||0));
 if(d.res!=='win'&&d.res!=='lose')d.res=null;
 return d;
};
function maxLives(){return Math.max(6,G.sc.w.length)}
const R=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(x*S,y*S,w*S,h*S)};
function row(x,y,r,c){const w=Math.round(Math.sqrt(Math.max(0,r*r-y*y)+.5));R(x-w,y,w*2+1,1,c)}
function orb(x,y,r,a,b){for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(r*r-j*j+.5));R(x-w,y+j,w*2+1,1,(j+r)%4==2?b:a)}R(x-r+2,y-r+2,2,2,'rgba(255,255,255,.65)')}
const SP={
orb,
ring(x,y,r,a,b){R(x-r-3,y-1,2*r+7,1,b);orb(x,y,r,a,b);R(x-r-3,y+1,2*r+7,2,b)},
gem(x,y,r,a,b){for(let j=-r;j<=r;j++){const w=r-Math.abs(j);R(x-w,y+j,w*2+1,1,j<0?a:b)}R(x-1,y-r+2,1,2,'rgba(255,255,255,.7)')},
cap(x,y,r,a,b,sc){for(let j=-r;j<=0;j++){const w=Math.round(Math.sqrt(r*r-j*j+.5));R(x-w,y+j,w*2+1,1,a)}R(x-2,y-r+2,2,2,'rgba(255,255,255,.7)');R(x+2,y-3,2,2,'rgba(255,255,255,.5)');
 if(sc.j)[-3,0,3].forEach(i=>R(x+i,y+1,1,r,b));else R(x-2,y+1,5,r-1,b)},
tri(x,y,r,a,b){for(let j=0;j<=2*r;j++){const w=j>>1;R(x-w,y-r+j,w+1,1,a);R(x+1,y-r+j,w,1,b)}},
tower(x,y,r,a,b){R(x-4,y-r+3,9,2*r-3,a);[-4,-1,2].forEach(i=>R(x+i,y-r,2,3,a));R(x+2,y-r+3,3,2*r-3,b);R(x-1,y-1,2,3,'#150f1c')}};
const DECO={
'Cosmos':r=>{const x=30+((r()*90)|0),y=16+((r()*24)|0);for(let i=0;i<14;i++)R(x+3+i*2,y-i,2,2,'#4ad6e8');orb(x,y,3,'#4ad6e8','#2d9bb0');const a=150+((r()*14)|0),b=82;R(a,b,8,14,'#e8d5c4');R(a+2,b-3,4,3,'#5ab0e0');R(a+3,b+4,2,2,'#2d7fd6');R(a-2,b+9,2,5,'#5ab0e0');R(a+8,b+9,2,5,'#5ab0e0');R(a+2,b+14,4,3,'#ffcf4d')},
'Deep Sea':r=>{for(let i=0;i<10;i++){const x=i*20+((r()*8)|0);R(x,H-16,2,16,'#1fa37a');R(x+2,H-12,2,2,'#1fa37a');R(x-2,H-9,2,2,'#1fa37a')}for(let i=0;i<8;i++){const x=(r()*184)|0,y=(r()*100)|0;R(x,y,3,1,'#bfeaff');R(x,y+2,3,1,'#bfeaff');R(x-1,y+1,1,1,'#bfeaff');R(x+3,y+1,1,1,'#bfeaff')}const x=20+((r()*130)|0),y=96;R(x,y,8,4,'#ff7aa8');R(x+8,y+1,3,2,'#ff7aa8');R(x-3,y-1,3,6,'#ff7aa8');R(x+6,y+1,1,1,'#111')},
'Dune Ruins':r=>{orb(30+((r()*120)|0),20,9,'#ffe3a3','#f2c879');for(let j=0;j<16;j++)R(150-j,H-28+j,2*j+1,1,'#6e3a22');for(let j=0;j<9;j++)R(118-j,H-21+j,2*j+1,1,'#6e3a22');R(24,H-34,3,22,'#3d6b3a');R(20,H-30,2,4,'#3d6b3a');R(20,H-28,5,2,'#3d6b3a');R(27,H-24,3,2,'#3d6b3a');R(29,H-28,2,5,'#3d6b3a');for(let x=0;x<W;x+=4)R(x,H-20-Math.round(Math.sin(x/14)*3),4,8,'#a8582a')},
'Fungal Grove':r=>{[[16,11],[96,13],[176,10]].forEach(([x,q])=>{R(x-2,H-12,5,12,'#3c1a74');SP.cap(x,H-12,q,'#5a189a','#3c1a74',{})});for(let i=0;i<10;i++)R((r()*188)|0,(r()*110)|0,2,2,'#7bf1a8')},
'Volcano Forge':r=>{for(let j=0;j<44;j++)R(96-j,H-52+j,2*j+1,1,'#2a0c0a');R(90,H-52,13,2,'#ff5a1f');R(96,H-50,2,16,'#ff5a1f');R(91,H-44,2,10,'#ff5a1f');R(101,H-42,2,8,'#ff5a1f');orb(100,H-62,5,'#4a3434','#2e2020');orb(110,H-74,4,'#4a3434','#2e2020')},
'Aurora Tundra':r=>{const o=(r()*6)|0;for(let x=0;x<W;x+=4){const y=8+o+Math.round(Math.sin(x/17)*5);R(x,y,4,14,'#7bf1c0');R(x,y+14,4,6,'#c77dff')}orb(30,44,7,'#e8f4ff','#bfeaff');for(let x=0;x<W;x+=4)R(x,H-22-Math.round(Math.sin(x/20)*4),4,12,'#bfeaff')},
'Clockwork Castle':r=>{orb(150,24,9,'#f0e6c8','#d9c5a0');[[8,34],[40,48],[78,30],[118,42],[160,36]].forEach(([x,h])=>{R(x,H-12-h,14,h,'#1c1528');[0,4,8,12].forEach(i=>R(x+i,H-15-h,2,3,'#1c1528'));R(x+6,H-4-h,2,4,'#ffd166')})}};
Object.assign(SP,{cube(x,y,r,a,b){R(x-r,y-r,2*r+1,2*r+1,a);R(x-r,y-r,2*r+1,2,b);R(x+r-1,y-r,2,2*r+1,b);R(x-r+1,y-r+3,2,2,'rgba(255,255,255,.6)')},star(x,y,r,a,b){R(x-1,y-r,3,2*r+1,a);R(x-r,y-1,2*r+1,3,a);R(x-2,y-2,5,5,b);R(x,y-1,1,1,'#fff')},drop(x,y,r,a,b){for(let j=-r;j<=r;j++){const w=j<0?Math.round((j+r)*.5):Math.round(Math.sqrt(r*r-j*j+.5));R(x-w,y+j,2*w+1,1,j>1?a:b)}R(x-2,y+1,2,2,'rgba(255,255,255,.6)')},sprout(x,y,r,a,b){R(x,y-r+2,1,2*r-2,b);R(x-3,y,3,2,b);R(x+1,y-3,3,2,b);R(x-1,y-r,3,3,a)},fish(x,y,r,a,b){R(x-r+3,y-3,2*r-3,6,a);R(x-r,y-4,3,8,b);R(x+r-4,y-2,2,2,'#111');R(x-1,y-5,3,2,b)}});
const DG=[
(r,s)=>{const x=40+((r()*100)|0);dsc(x,26,12,s.p[2]);R(x-5,22,3,3,s.bg[1]);R(x+3,30,4,4,s.bg[1])},
(r,s)=>{for(let x=0;x<W;x+=12){const h=6+((r()*14)|0),g=5+((r()*10)|0);for(let j=0;j<h;j++)R(x+(j>>2),j,Math.max(1,(10-j*10/h)|0),1,s.bg[2]);for(let j=0;j<g;j++)R(x+3+(j>>2),H-12-j,Math.max(1,(8-j*8/g)|0),1,s.bg[2])}},
(r,s)=>{for(let x=8;x<W;x+=24){R(x+1,H-44,3,32,'rgba(0,0,0,.6)');dsc(x+2,H-48,9,s.p[1])}},
(r,s)=>{for(let x=0;x<W;x+=14){const h=14+((r()*40)|0);R(x,H-12-h,12,h,s.bg[2]);for(let y=H-9-h,k=0;y<H-14;y+=6,k++)R(x+2+(k%2)*5,y,2,2,s.p[k%2?2:0])}},
(r,s)=>{for(let y=10;y<H-12;y+=14)for(let x=0;x<W;x+=4)R(x,y+Math.round(Math.sin(x/9+y)*2),4,2,s.p[2])},
(r,s)=>{for(let x=10;x<W;x+=34){R(x,20,8,H-32,s.bg[2]);R(x-2,18,12,4,s.p[0]);R(x-2,H-14,12,3,s.p[0])}},
(r,s)=>{dsc(150,28,14,s.p[0]);for(let k=0;k<8;k++){const a=k*Math.PI/4;R(150+Math.round(Math.cos(a)*21),28+Math.round(Math.sin(a)*21),3,3,s.p[0])}},
(r,s)=>{for(let k=0;k<5;k++){const x=10+((r()*170)|0),y=8+((r()*44)|0);dsc(x,y,5,s.p[2]);dsc(x+7,y+2,4,s.p[2]);R(x-6,y+2,16,3,s.p[2])}},
(r,s)=>{dsc(130,50,28,s.p[3]);dsc(130,50,24,s.p[0]);R(110,44,40,2,s.p[1]);R(112,58,36,2,s.p[1]);R(92,52,76,2,s.p[2])},
(r,s)=>{for(let k=0;k<5;k++)SP.tri(20+k*42,H-12,20+((r()*14)|0),s.p[3],s.bg[2])},
(r,s)=>{for(let k=0;k<6;k++)SP.gem(10+k*34+((r()*8)|0),H-24,8+((r()*10)|0),s.p[2],s.p[0])}];
const KM={o:'orb',r:'ring',g:'gem',c:'cap',t:'tri',w:'tower',u:'cube',s:'star',d:'drop',p:'sprout',f:'fish'},PTK=[[-14,3],[0,-14],[-6,16],[4,-24],[2,2],[-30,12]],ST=[[[5,12,19],90,62],[[9,18,28],45,70],[[14,26,38],60,75],[[4,10,16],25,78]];
`Star Observatory|REGOLITH|Gray dust, no air, and Earth hangs overhead.|255|0|sgr|0|4|0
Lunar Outpost|CHONDRITE|Tumbling rocks drift in a lonely ring.|210|3|oug|8|0|1
Asteroid Belt|XENOFLORA|Strange giant leaves sway in violet air.|180|0|ugo|0|5|0
Alien Jungle|STALACTITE|Teeth of stone hang over a dripping dark.|300|0|pcd|2|1|0
Glowworm Cave|GEODE|Plain rock outside, a rainbow inside.|190|0|dcg|1|1|1
Crystal Cavern|ATLANTIS|A lost city sleeps under the waves.|200|1|ggs|10|4|1
Sunken Temple|POLYP|Tiny builders raise a living city of color.|195|1|wuo|5|1|1
Coral Reef|HOLDFAST|Tall golden ribbons sway, anchored to the sea floor.|170|0|fdc|4|1|0
Kelp Forest|DOUBLOON|Gold coins, a skull flag, and a hidden bay.|150|0|pfd|4|1|0
Pirate Cove|SPECTRE|A ship with no crew sails through fog.|30|2|fut|9|0|1
Ghost Galleon|MANGROVE|Roots stand in black water under thick mist.|230|3|wfo|4|0|0
Misty Swamp|RHIZOME|Green stalks that rustle and never stop growing.|110|3|pcd|2|2|1
Bamboo Grove|HANAMI|Pink petals fall while people picnic below.|120|1|ptp|2|2|1
Cherry Hill|TORII|A red gate guards the path up the mountain.|340|2|pso|9|2|1
Pagoda Peaks|PADDY|Water-filled steps climb the green hillside.|10|1|wtu|9|2|1
Rice Terraces|ACACIA|Flat-topped trees on a long golden plain.|95|2|put|9|4|1
Savanna|DROMEDARY|A lone green spot in an ocean of sand.|45|1|ppo|6|0|1
Desert Oasis|SANDSTONE|Layers of red rock carved by ancient rivers.|50|0|pdg|6|0|1
Red Canyon|TUMBLEWEED|A dry wind rolls through a town nobody left.|15|1|tuw|9|0|1
Ghost Town|ACORN|Leaves turn to fire and the squirrels get busy.|25|3|wuc|3|0|1
Autumn Woods|SCARECROW|A straw guard watches over rows of crops.|28|1|ppc|2|2|1
Harvest Farm|MILLSTONE|Giant blades turn slowly above the grass.|60|2|uow|7|0|1
Windmill Meadow|PROVENCE|Purple rows stretch to the horizon.|75|2|pdo|7|1|1
Lavender Fields|EDELWEISS|A white star flower blooms on the rock above.|270|1|psd|7|1|1
Alpine Peaks|MORAINE|A river of ice grinds the valley smooth.|205|2|tgo|9|2|1
Glacier Lake|FROSTWORK|Walls of ice carved into a shining hall.|185|2|tgd|10|2|1
Ice Palace|CONIFER|Dark needles wear heavy coats of snow.|195|3|wgs|10|2|1
Snowy Pines|PEPPERMINT|Striped sweets and sugar hills, a sticky maze.|160|3|ptp|2|2|1
Candy Kingdom|MARIONETTE|Wooden dolls hang from strings in a workshop.|320|2|duc|7|4|1
Toy Workshop|PENDULUM|Tick, tock. A giant face watches the plaza.|35|1|uow|5|0|1
Clock Square|ZEPPELIN|Great balloons float above a busy dock.|40|1|wug|3|0|1
Airship Harbor|HOLOGRAM|Glowing signs flicker in the rain.|20|2|fuo|7|0|0
Neon City|AUTOMATON|Gears and rust: a graveyard of metal minds.|300|0|usw|3|2|1
Robot Junkyard|TRAPEZE|Fly through the air without a net.|140|3|uog|3|3|1
Circus Tent|CAROUSEL|Painted horses go round and round beside the sea.|355|0|osc|7|4|1
Carnival Pier|FRESNEL|A great lens throws a beam across the waves.|330|1|ruo|4|4|1
Lighthouse Cliff|WYVERN|Scales, claws, and a hoard of gold.|215|2|fto|4|2|1
Dragon Lair|GRIMOIRE|Floating books and candles in a tall hall.|5|0|tgo|1|3|1
Wizard Library|FAERIE|Tiny lights dance in a ring of mushrooms.|265|1|gsc|5|4|1
Fairy Ring|SCRYING|A still lake shows what is not there.|290|3|pcs|2|1|1
Mirror Lake|SARCOPHAGUS|Golden chambers, sand, and a long sleep.|205|2|dgo|4|4|1
Pharaoh Tomb|QUETZAL|A feathered serpent climbs the stone steps.|48|0|ugs|5|0|0`.split('\n').forEach(l=>{const [n,w,h,hu,s,k,dk,p,f]=l.split('|'),[L,ps,pl]=ST[+s],c=(x,y,z)=>'hsl('+((x+360)%360)+','+y+'%,'+z+'%)',h1=+hu,pp=[c(h1,ps,pl),c(h1+40,ps,pl-4),c(h1+180,ps-10,pl+8),c(h1-40,ps,pl-8)];SC.push({n,w,h,bg:L.map((v,i)=>c(h1+i*8,(ps*.7)|0,v)),p:pp,k:[...k].map(x=>KM[x]),ac:pp[2],f:+f,dk:+dk,pt:[...PTK[+p],pp[2],+p==1?2:1],pn:['Dust','Bubble','Flake','Ember','Spark','Meteor'][+p]})});
const DAILY_COUNT=SC.length,SPECIAL_KEY='special-50';
SC.push({n:'Eclipse Vault',w:'ECLIPSE',h:'The final seal opens only to those who have found every other treasure.',bg:['#09051a','#1b0c35','#38205b'],p:['#ffd166','#c77dff','#fff3c4','#7b3fe4'],k:['ring','gem','orb'],ac:'#ffd166',pt:[0,-1,'#ffd166',2],pn:'Eclipse',special:true});
const specialUnlocked=()=>SC.slice(0,DAILY_COUNT).every(s=>(st.col||{})[s.w]),sci=d=>((Math.floor(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())/864e5)%DAILY_COUNT)+DAILY_COUNT)%DAILY_COUNT,pf=w=>[w[0]+w.slice(1).toLowerCase(),'A rare find for your album.'];
function gen(w,sc){const r=rng(hash(w)),t=hash(w)%5,[a,b,c]=sc.p;if(t==0){const n=3+((r()*4)|0);dsc(16,13,8,a);R(11,11,3,3,'#fff');R(18,11,3,3,'#fff');R(12,12,1,2,'#111');R(19,12,1,2,'#111');R(13,17,6,1,c);for(let k=0;k<n;k++){const x=7+((k*18/n)|0);R(x,20,2,8,b);R(x-1,28,3,1,b)}}else if(t==1){R(15,12,2,18,b);[[9,20],[18,16],[10,25]].forEach(([x,y])=>{R(x,y,6,3,b);R(x+1,y-1,4,1,c)});dsc(16,9,6,a);dsc(16,9,2,c)}else if(t==2){[[9,21,6],[16,16,9],[23,22,5]].forEach(([x,y,q])=>SP.gem(x,y,q,a,b))}else if(t==3){SP.tower(16,17,12,a,b);R(16,1,1,6,c);R(17,1,4,3,c)}else{SP.drop(16,16,11,a,b);R(12,15,3,3,'#fff');R(18,15,3,3,'#fff');R(13,16,1,2,'#111');R(19,16,1,2,'#111');[[4,6],[27,9],[6,26],[26,24]].forEach(([x,y])=>R(x,y,2,2,c))}}
SK.push({id:'kn',n:'Knight',c:'#c9d1db',h:'#5a6a85',p:150},{id:'ast',n:'Astronaut',c:'#f5f5ff',h:'#4aa3ff',p:200},{id:'fox',n:'Fox',c:'#e8873a',h:'#8a3b12',p:250},{id:'frog',n:'Frog',c:'#6fd16f',h:'#2a7a2a',p:300},{id:'wiz',n:'Wizard',c:'#e8c9a0',h:'#5a189a',p:400});
const GL=[{id:'g0',n:'Plain',c:'',p:0},{id:'g1',n:'Ember',c:'#ff9d2e',p:30},{id:'g2',n:'Mint',c:'#7bf1c0',p:30},{id:'g3',n:'Violet',c:'#c77dff',p:50},{id:'g4',n:'Rose',c:'#ff8fd0',p:50}];
const DEF={};`KRAKEN|a giant sea monster of legend said to drag whole ships under
SCARAB|a beetle sacred in ancient Egypt and a symbol of rebirth
SPORES|tiny cells released by fungi and ferns that can grow into new plants or fungi
CALDERA|a huge crater left when a volcano collapses after a massive eruption
AURORA|a glowing display in polar skies caused by charged particles from the sun
PORTCULLIS|a heavy grating that is lowered to seal the gateway of a castle
ASTROLABE|an old instrument for measuring the position of stars and telling the time
REGOLITH|the loose layer of dust and broken rock that covers a moon or planet
CHONDRITE|a stony meteorite packed with small round grains from the early solar system
XENOFLORA|plant life from another world, a term used in science fiction
STALACTITE|an icicle-shaped mineral formation hanging from a cave ceiling
GEODE|a hollow rock whose inside is lined with sparkling crystals
ATLANTIS|a legendary island civilisation said to have sunk beneath the sea
POLYP|a small tube-shaped sea animal, the living building block of coral
HOLDFAST|the root-like part that anchors seaweed firmly to a rock
DOUBLOON|an old Spanish gold coin, often linked with pirate treasure
SPECTRE|a ghost, or something that haunts the mind as a looming threat
MANGROVE|a tropical tree with tangled roots that grows in salty coastal swamps
RHIZOME|a creeping underground stem that sends out new roots and shoots
HANAMI|the Japanese custom of gathering to admire cherry blossoms
TORII|a traditional Japanese gateway marking the entrance to a shrine
PADDY|a flooded field in which rice is grown
ACACIA|a thorny tree of warm regions, often with a flat spreading crown
DROMEDARY|a one-humped camel used for travel across deserts
SANDSTONE|rock formed from sand grains pressed together over ages
TUMBLEWEED|a dry plant that breaks off at the root and rolls in the wind
ACORN|the nut of an oak tree
SCARECROW|a figure put in a field to frighten birds away from the crops
MILLSTONE|one of the heavy stones used to grind grain into flour
PROVENCE|a sunny region of southern France famous for lavender
EDELWEISS|a small white alpine flower with woolly petals
MORAINE|a ridge of rock and debris dropped by a moving glacier
FROSTWORK|delicate patterns of ice crystals that form on glass or stone
CONIFER|a cone-bearing evergreen tree such as a pine or fir
PEPPERMINT|a cool-tasting herb, or a sweet flavoured with it
MARIONETTE|a puppet that is moved by strings from above
PENDULUM|a weight hung from a fixed point that swings back and forth
ZEPPELIN|a large rigid airship with a long cigar-shaped body
HOLOGRAM|a three-dimensional image made with laser light
AUTOMATON|a machine that moves by itself, or a person acting without thought
TRAPEZE|a short bar hung from ropes, used by acrobats to swing
CAROUSEL|a revolving fairground ride with seats shaped like animals
FRESNEL|a lens built from concentric rings, used in lighthouses
WYVERN|a winged dragon with two legs and a barbed tail
GRIMOIRE|a book of magic spells and instructions
FAERIE|a fairy, or the magical realm where fairies live
SCRYING|gazing into a surface such as water or crystal to see visions
SARCOPHAGUS|a stone coffin, often carved, especially in ancient Egypt
QUETZAL|a bird with shimmering green feathers, sacred in Maya culture
ECLIPSE|the moment when one celestial body hides another from view`.split('\n').forEach(l=>{const [w,d]=l.split('|');DEF[w]=[d]});
const dd=w=>{const q=DEF[w];return q?q[0]:'A rare find for your album.'};
let AS=null;
function closePop(){const p=$('pop');if(p)p.remove()}
function openInfo(){closePop();const ov=document.createElement('div');ov.id='pop';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','How to play');const c=document.createElement('div');c.className='pc';const h=document.createElement('h3');h.textContent='How to play';const p1=document.createElement('p');p1.textContent='Move or drag on the map. Stand beside an object to dig up a letter.';const p2=document.createElement('p');p2.textContent='Letters reveal the word. Enter your guess in Guess. Traps and wrong guesses cost lives.';const p3=document.createElement('p');p3.textContent='A hint costs 8 coins and marks one hidden letter on the map.';const b=document.createElement('button');b.textContent='Close';b.onclick=closePop;c.append(h,p1,p2,p3,b);ov.append(c);ov.onclick=e=>{if(e.target===ov)closePop()};document.body.append(ov);b.focus()}
function openHintDialog(){const d=D();if(d.res)return;closePop();const ov=document.createElement('div');ov.id='pop';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Hint confirmation');const c=document.createElement('div');c.className='pc';const h=document.createElement('h3');h.textContent='Use a hint?';const p=document.createElement('p');p.textContent=d.hint!==undefined?'You already used a hint for this word.':st.coins<8?'A hint costs 8 coins. You have '+st.coins+'.':'Spend 8 coins to mark one hidden letter on the map?';const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=closePop;c.append(h,p,cancel);if(d.hint===undefined&&st.coins>=8){const use=document.createElement('button');use.textContent='Spend 8 coins';use.onclick=()=>{closePop();hint()};c.append(use)}ov.append(c);ov.onclick=e=>{if(e.target===ov)closePop()};document.body.append(ov);cancel.focus()}
function openCard(s){closePop();const col=st.col||{},got=!!col[s.w];
 const ov=document.createElement('div');ov.id='pop';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Card details');
 const c=document.createElement('div');c.className='pc';
 const cv=document.createElement('canvas');cv.width=cv.height=96;if(got)art(s.w,cv.getContext('2d'));else cv.className='lk';
 const h=document.createElement('h3');h.textContent=got?s.w:'Locked card';
 const p=document.createElement('p');p.textContent=got?dd(s.w):s.special?'Find all 49 other treasures to unlock the final mission.':'Solve the word in '+s.n+' to unlock this card.';
 const m=document.createElement('p');m.className='mt';m.textContent=s.special?'50th card · Final mission':(got?'Found in ':'Hidden in ')+s.n;
 const b=document.createElement('button');b.textContent='Close';b.onclick=closePop;
 c.append(cv,h,p,m,b);ov.append(c);ov.onclick=e=>{if(e.target===ov)closePop()};document.body.append(ov);b.focus()}
function startSpecialMission(){if(!specialUnlocked()||(st.col||{})[SC[DAILY_COUNT].w])return;if(st.days[SPECIAL_KEY]&&st.days[SPECIAL_KEY].res=='lose'){delete st.days[SPECIAL_KEY];save()}specialActive=true;note='';P.x=30;P.y=64;P.tg=null;closePop();closeSheet();render()}
function album(){const g=$('ag');if(!g)return;g.innerHTML='';const col=st.col||{},regular=SC.slice(0,DAILY_COUNT),special=SC[DAILY_COUNT],found=regular.filter(s=>col[s.w]).length,unlocked=specialUnlocked();
 regular.forEach(s=>{const k=document.createElement('canvas');k.width=k.height=32;if(col[s.w])art(s.w,k.getContext('2d'));else k.className='lk';if(AS==s.w)k.style.outline='3px solid var(--acc)';k.onclick=()=>{AS=s.w;album();openCard(s)};g.append(k)});
 const box=$('special-card');if(!box)return;box.textContent='';const b=document.createElement('button');b.type='button';b.className='mystery';b.setAttribute('aria-label',col[special.w]?'View the 50th card':'The 50th mystery card');const tile=document.createElement('canvas');tile.width=tile.height=32;if(col[special.w])art(special.w,tile.getContext('2d'));else tile.className='lk';const mark=document.createElement('b');mark.className='mark';mark.textContent=col[special.w]?'✓':'?';const text=document.createElement('span'),title=document.createElement('b'),status=document.createElement('small');title.textContent=col[special.w]?'Eclipse Vault':'50th card · Mystery';status.textContent=col[special.w]?'Final mission complete':unlocked?'Tap to enter the final mission':found+' / 49 treasures found';text.append(title,status);b.append(tile,mark,text);b.onclick=()=>{AS=special.w;if(!col[special.w]&&unlocked)startSpecialMission();else openCard(special)};box.append(b)}
let FX=[],TR=[];const say=t=>{$('msg2').textContent=t},PN={'Cosmos':'Stardust','Deep Sea':'Bubble','Dune Ruins':'Sand','Fungal Grove':'Spore','Volcano Forge':'Ember','Aurora Tundra':'Snowflake','Clockwork Castle':'Firefly'};
function lv(){const L=levelFor(st.xp||0),old=Math.max(1,Math.floor(Number(st.lv)||1));if(L>old){const reward=(L-old)*10;st.coins+=reward;say('Level '+L+' reached! +'+reward+' coins')}st.lv=L}
function hud(){const d=D(),L=levelFor(st.xp||0),n=d.px||0;$('coins').textContent='● '+st.coins;$('lv').textContent=['Scout','Digger','Ranger','Pathfinder','Explorer','Legend'][Math.min(L-1,5)]+' '+L+' · '+((st.xp||0)%80)+'/80';$('sd').textContent=G.sc.w.length+' letters · '+(G.sc.pn||PN[G.sc.n])+' '+n+'/25'+(n>=25?' ✓':'')}
let pop=0;const PA={},PT={'Cosmos':[-14,3,'#ffd9f2',1],'Deep Sea':[0,-16,'#bfeaff',2],'Dune Ruins':[-40,2,'#f2c879',1],'Fungal Grove':[3,-8,'#7bf1a8',2],'Volcano Forge':[4,-24,'#ffb02e',1],'Aurora Tundra':[-6,14,'#ffffff',1],'Clockwork Castle':[8,-4,'#ffd166',1]};
const PIC={KRAKEN:['The Kraken','Eight arms and one old grudge against ships.'],SCARAB:['Sacred Scarab','Legends say it rolls the sun across the sky.'],SPORES:['Glow Cap','Its spores drift upward and light the dark.'],CALDERA:['The Caldera','A volcano that sat down after its last eruption.'],AURORA:['The Aurora','Ribbons of green light over frozen peaks.'],PORTCULLIS:['Iron Portcullis','Nobody enters until it rises.'],ASTROLABE:['The Astrolabe','The old compass for reading the stars.']};
const dsc=(x,y,r,c)=>{for(let j=-r;j<=r;j++){const w=Math.round(Math.sqrt(r*r-j*j+.5));R(x-w,y+j,2*w+1,1,c)}};
const ART={
KRAKEN(){dsc(16,11,9,'#b56cff');R(9,5,3,2,'#e8c8ff');R(11,11,3,3,'#fff');R(18,11,3,3,'#fff');R(12,12,1,2,'#111');R(19,12,1,2,'#111');for(let k=0;k<6;k++){const x=6+k*4;for(let y=14;y<29;y++){const o=Math.round(Math.sin(y/2.5+k)*1.8);R(x+o,y,2,1,'#8a3fd6');if(y%4==0)R(x+o,y,1,1,'#ffd1f0')}}},
SCARAB(){dsc(16,7,5,'#ffd166');dsc(16,7,3,'#ff9d2e');for(let j=-8;j<=8;j++){const w=Math.round(8*Math.sqrt(1-(j/8.5)**2));R(16-w,21+j,2*w+1,1,'#1fa3a0')}R(16,14,1,15,'#0a5d63');R(13,11,6,3,'#0a5d63');R(14,9,1,3,'#0a5d63');R(17,9,1,3,'#0a5d63');[16,21,26].forEach(y=>{R(5,y,4,1,'#0a5d63');R(23,y,4,1,'#0a5d63')})},
SPORES(){for(let j=-9;j<=0;j++){const w=Math.round(Math.sqrt(81-j*j+.5));R(16-w,17+j,2*w+1,1,'#c77dff')}R(11,10,3,3,'#fff');R(18,9,2,2,'#fff');R(21,14,2,2,'#fff');R(8,18,17,2,'#7a3fb0');R(13,20,6,9,'#f0e6ff');R(10,29,12,2,'#3c1a74');for(let j=-4;j<=0;j++){const w=Math.round(Math.sqrt(16-j*j+.5));R(7-w,26+j,2*w+1,1,'#7bf1a8')}R(6,27,2,3,'#f0e6ff');[[4,4],[25,5],[28,12],[2,12]].forEach(([x,y])=>R(x,y,1,1,'#7bf1a8'))},
CALDERA(){for(let j=0;j<22;j++)R(16-j,9+j,2*j+1,1,j<5?'#5a2a1c':'#3d1a14');R(11,9,11,2,'#ff5a1f');R(15,11,2,9,'#ff5a1f');R(11,16,2,7,'#ff8a1f');R(20,15,2,8,'#ff8a1f');dsc(18,4,3,'#6b5a5a');dsc(24,2,2,'#4a3a3a');R(0,30,32,2,'#2a0c0a')},
AURORA(){for(let x=0;x<32;x++){const y=5+Math.round(Math.sin(x/5)*3);R(x,y,1,8,'#7bf1c0');R(x,y+8,1,4,'#c77dff')}SP.tri(8,26,7,'#e8f4ff','#9ad1d4');SP.tri(22,24,9,'#e8f4ff','#9ad1d4');R(0,30,32,2,'#e8f4ff');[[3,2],[14,1],[27,3]].forEach(([x,y])=>R(x,y,1,1,'#fff'))},
PORTCULLIS(){R(4,6,24,24,'#6b5b73');R(8,10,16,20,'#120e18');for(let x=9;x<24;x+=3){R(x,8,1,20,'#a8a8b8');R(x,28,1,2,'#d8d8e8')}R(8,14,16,1,'#a8a8b8');R(8,22,16,1,'#a8a8b8');[4,14,24].forEach(x=>R(x,3,4,3,'#6b5b73'));R(6,10,1,6,'#d9c5a0')},
ASTROLABE(){dsc(16,16,13,'#d9a441');dsc(16,16,11,'#3d2e52');dsc(16,16,8,'#f0e6c8');for(let k=0;k<12;k++){const a=k*Math.PI/6;R(16+Math.round(Math.cos(a)*10),16+Math.round(Math.sin(a)*10),1,1,'#d9a441')}R(16,9,1,8,'#c9503a');R(16,16,6,1,'#c9503a');R(15,15,3,3,'#d9a441');R(14,0,5,3,'#d9a441');R(15,1,3,1,'#3d2e52')}};
Object.assign(ART,{
WYVERN(){SP.tri(9,13,8,'#2d7a3a','#1f5a2a');dsc(14,19,7,'#3fa34d');R(17,10,3,9,'#3fa34d');R(18,7,7,4,'#3fa34d');R(22,8,1,1,'#fff');R(18,5,1,3,'#d9c5a0');R(25,9,3,2,'#ff9d2e');R(27,8,2,1,'#ffd166');for(let k=0;k<9;k++)R(2+k,25-(k>>1),2,2,'#3fa34d');R(11,25,2,4,'#2d7a3a');R(16,25,2,4,'#2d7a3a')},
TORII(){R(3,5,26,2,'#1c1528');R(6,8,20,3,'#d6293e');R(7,11,3,18,'#d6293e');R(22,11,3,18,'#d6293e');R(10,14,12,2,'#d6293e');R(14,11,4,3,'#1c1528');R(6,29,5,1,'#8a8a99');R(21,29,5,1,'#8a8a99');[[4,3],[27,6],[8,24]].forEach(([x,y])=>R(x,y,2,2,'#ff9ad5'))},
ZEPPELIN(){for(let j=-6;j<=6;j++){const w=Math.round(13*Math.sqrt(1-(j/6.5)**2));R(16-w,12+j,2*w+1,1,j%5==0?'#c9503a':'#d9c5a0')}R(3,10,3,5,'#c9503a');R(26,10,3,5,'#c9503a');R(12,20,8,3,'#6b4a2a');R(12,19,1,1,'#222');R(19,19,1,1,'#222');R(28,13,1,3,'#fff');R(2,27,10,2,'#f0e6ff');R(20,25,9,2,'#f0e6ff')},
GRIMOIRE(){R(6,8,20,18,'#5a189a');R(6,8,3,18,'#3c1a74');R(6,8,2,2,'#ffd166');R(24,8,2,2,'#ffd166');R(6,24,2,2,'#ffd166');R(24,24,2,2,'#ffd166');SP.star(17,17,5,'#ffd166','#c77dff');R(26,3,2,3,'#ffd166');R(27,2,1,1,'#fff');[[3,4],[29,14],[4,28]].forEach(([x,y])=>R(x,y,1,1,'#fff'))},
FRESNEL(){for(let j=0;j<18;j++){const w=3+(j>>2);R(16-w,12+j,2*w+1,1,j%6<3?'#f5f5ff':'#d6293e')}R(12,8,8,4,'#ffd166');R(11,6,10,2,'#d6293e');R(20,9,12,2,'#fff8c8');R(0,30,32,2,'#2d7fd6');R(8,29,16,2,'#555566')},
ACACIA(){R(15,12,2,16,'#6b4a2a');R(10,12,5,1,'#6b4a2a');R(17,13,5,1,'#6b4a2a');R(4,8,24,4,'#4a9b3a');R(7,6,18,2,'#4a9b3a');R(10,12,12,1,'#3a7a2a');R(0,28,32,3,'#d9a441');dsc(26,3,3,'#ffd166')},
PENDULUM(){dsc(16,12,10,'#d9a441');dsc(16,12,8,'#f0e6c8');R(16,6,1,6,'#222');R(16,12,5,1,'#222');R(10,22,12,8,'#6b4a2a');R(16,22,1,5,'#d9a441');dsc(16,28,2,'#d9a441')},
ECLIPSE(){dsc(16,16,12,'#ffd166');for(let k=0;k<12;k++){const a=k*Math.PI/6;R(15+Math.round(Math.cos(a)*14),15+Math.round(Math.sin(a)*14),2,2,'#ff9d2e')}dsc(16,16,10,'#0a0618');[[3,4],[28,5],[4,27],[27,26]].forEach(([x,y])=>R(x,y,1,1,'#fff'))},
DOUBLOON(){dsc(16,16,11,'#d9a441');dsc(16,16,9,'#ffd166');dsc(16,16,7,'#d9a441');R(13,12,6,5,'#fff8e0');R(14,17,4,3,'#fff8e0');R(14,13,1,2,'#111');R(17,13,1,2,'#111');R(9,23,14,1,'#7a5a1f');R(24,5,2,2,'#fff')}});
const ARTC={},ARTS=document.createElement('canvas');ARTS.width=ARTS.height=96;
function artPix(w){if(ARTC[w])return ARTC[w];const i=SC.findIndex(s=>s.w==w);if(i<0)return ARTS;const pc=cx;cx=ARTS.getContext('2d');cx.imageSmoothingEnabled=false;cx.clearRect(0,0,96,96);const bg=SC[(i+1)%SC.length].bg;R(0,0,32,32,bg[1]);R(0,0,32,2,bg[0]);R(0,30,32,2,bg[2]);ART[w]?ART[w]():gen(w,SC[i]);const o=document.createElement('canvas');o.width=o.height=32;const oc=o.getContext('2d');oc.imageSmoothingEnabled=false;oc.drawImage(ARTS,0,0,96,96,0,0,32,32);cx=pc;ARTC[w]=o;return o}
function art(w,c){const p=artPix(w),n=c.canvas.width||32;cx=c;cx.imageSmoothingEnabled=false;cx.clearRect(0,0,n,n);cx.drawImage(p,0,0,32,32,0,0,n,n)}
function hint(){const d=D();if(st.coins<8){note='Not enough coins for a hint.';render();return}const i=G.sp.findIndex((s,k)=>s.t=='L'&&!d.op.includes(k));if(i<0)return;st.coins-=8;d.hint=i;note='A blinking marker points to a hidden letter.';window.__PTH?.journey.interaction('hint_used','hidden_letter');save();render()}
function share(){const d=D(),sq=d.op.map(i=>({L:'🟩',C:'🟨',T:'🟥'})[G.sp[i].t]).join(''),t='Pixel Treasure Hunt '+G.key+'\n'+(d.res=='win'?'Solved':'Not solved')+' · '+d.op.length+' digs · '+d.wr+' traps\n'+sq;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>{$('msg2').textContent='Result copied.'}).catch(()=>{$('msg2').textContent=t.replace(/\n/g,' | ')})}
function farLayer(c,n){const sc=G.sc,r=rng(hash(G.key+'s'));cx=c;cx.imageSmoothingEnabled=false;for(let q=0;q<n;q++){cx.save();cx.translate(q*W*S,0);
 R(0,0,W,H,sc.bg[0]);
 [1,2].forEach(i=>{const o=i*34+((r()*10)|0);for(let x=0;x<W;x+=6){const y=Math.round((o+30-x*.28)/4)*4;R(x,y,6,20+i*8,sc.bg[i])}});

 {let h=14;for(let x=0;x<W;x+=4){h=clamp(h+(r()-.5)*8,6,30);const q2=h|0;R(x,H-12-q2,4,q2+12,'rgba(0,0,0,.3)');R(x,H-12-q2,4,1,'rgba(255,255,255,.14)')}}
 const dz=DECO[sc.n]||(sc.dk>=0&&DG[sc.dk]);if(dz){cx.globalAlpha=.4;dz(r,sc);cx.globalAlpha=1}
 for(let i=0;i<16;i++){const x=4+((r()*184)|0),y=4+((r()*100)|0),c=i%3?sc.ac:'#fff';R(x,y,1,1,c);if(i%4==0){R(x,y-1,1,3,c);R(x-1,y,3,1,c)}}
 cx.restore()}}
function nearLayer(c){const sc=G.sc,d=D();cx=c;cx.imageSmoothingEnabled=false;cx.clearRect(0,0,WW*S,H*S);if(sc.f){R(0,H-12,WW,12,sc.bg[2]);for(let x=0;x<WW;x+=4)R(x,H-13,2,1,sc.bg[2])}
 G.sp.forEach((s,i)=>{if(d.op.includes(i)){R(s.x-8,s.y-8,17,17,'rgba(0,0,0,.6)');
  if(s.t=='L'){cx.fillStyle='#fff3c4';cx.font='bold 20px "Press Start 2P",monospace';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(s.v,s.x*S+2,s.y*S+3)}
  else if(s.t=='C'){orb(s.x,s.y,4,'#ffd166','#e8a317')}
  else for(let k=-4;k<=4;k++){R(s.x+k,s.y+k,2,2,'#ff4d5a');R(s.x+k,s.y-k,2,2,'#ff4d5a')}}
  else{SP[s.k](s.x,s.y,s.r,s.a,s.b,sc);if(d.hint===i)[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{R(s.x+a*10-(a>0?2:0),s.y+b*10,3,1,'#fff');R(s.x+a*10,s.y+b*10-(b>0?2:0),1,3,'#fff')})}})}
function fig(s,x,y){
 R(x,y,6,6,s.c);R(x-1,y-2,8,2,s.h);R(x+1,y-4,4,2,s.h);R(x+1,y+2,1,1,'#111');R(x+4,y+2,1,1,'#111');
 if(s.id=='exp'){R(x-2,y-2,10,1,'#d9a441');R(x+2,y-1,2,1,'#ffd166')}
 else if(s.id=='bot'){R(x+2,y-6,1,2,'#8de7ff');R(x+1,y-7,3,1,'#ffd166');R(x-2,y,1,3,s.h);R(x+6,y,1,3,s.h);R(x+1,y+2,4,1,'#4de0d1')}
 else if(s.id=='pir'){R(x-1,y-2,8,1,'#d94f4f');R(x+3,y+1,2,2,'#22202a');R(x+3,y+4,2,1,'#fff0c7')}
 else if(s.id=='dino'){R(x-1,y-4,2,2,'#ffd166');R(x+2,y-6,2,2,'#ffd166');R(x+5,y-4,2,2,'#ffd166');R(x+3,y+4,2,1,'#2e8b57')}
 else if(s.id==='ghost'||s.id.startsWith('ghost-')){R(x-2,y-3,1,3,s.c);R(x+7,y-3,1,3,s.c);R(x+2,y+4,2,1,s.h)}
}
function gallows(){cx=$('gl').getContext('2d');cx.imageSmoothingEnabled=false;cx.clearRect(0,0,120,120);const damage=D().wr,total=maxLives(),w=damage?damage>=total?6:Math.min(5,Math.ceil(damage*6/total)):0,sk=skinForId(st.sk)||SK[0],wd='#a8754a';
 if(w>0){R(4,35,30,2,wd);R(10,6,2,29,wd)}
 if(w>1){R(10,6,18,2,wd);R(25,8,1,6,'#d9c5a0')}
 if(w>2)fig(sk,23,14);
 if(w>3)R(25,20,2,9,sk.h);
 if(w>4)R(21,21,10,1,sk.h);
 if(w>5){R(24,29,1,6,sk.h);R(27,29,1,6,sk.h)}}
function build(){if(fmt(dateAt(off))>fmt(dateAt(0)))off=0;const d=dateAt(off),key=specialActive?SPECIAL_KEY:fmt(d),sc=specialActive?SC[DAILY_COUNT]:SC[sci(d)],r=rng(hash(key+sc.n)),ls=[...new Set(sc.w)];
 // The map has 20 unique cells. Keep every object count within that capacity.
 const capacity=20,trapCount=Math.min(sc.special?10:8,Math.max(0,capacity-ls.length-3)),coinCount=Math.min(3,Math.max(0,capacity-ls.length-trapCount));
 const items=shuf([...ls.map(v=>({t:'L',v})),...Array(trapCount).fill({t:'T'}),...Array(coinCount).fill({t:'C'})],r);
 const cells=shuf([...Array(capacity).keys()],r).slice(0,items.length);
 const sp=items.map((it,i)=>{const c=cells[i],ia=(r()*4)|0;return{...it,x:30+(c%10)*57+((r()*13)|0)-6,y:30+((c/10)|0)*58+((r()*17)|0)-8,k:sc.k[(r()*3)|0],r:5+((r()*3)|0),a:sc.p[ia],b:sc.p[(ia+1+((r()*3)|0))%4]}});
 return{key,sc,sp}}
const won=d=>(st.days[fmt(d)]||{}).res=='win';
function streak(){let s=0,i=won(dateAt(0))?0:1;while(won(dateAt(-i))){s++;i++}return s}
function finish(res,extra){
 const d=D();
 if(d.res||!['win','lose'].includes(res))return false;
 d.res=res;d.finishedAt=fmt(dateAt(0));
 if(res=='win'&&!d.rewarded){
  pop=1;(st.col=st.col||{})[G.sc.w]=1;
  d.bonus=10+(6-Math.min(d.wr,6))*3+(extra||0)+(G.sc.special?50:0);
  st.coins+=d.bonus;d.rewarded=1;
 }
 const win=res=='win';window.__PTH?.journey.end(win,win,win?Number(d.bonus)||0:0);
 save();try{if(window.__PTH&&G.key==fmt(dateAt(0)))window.__PTH.report({day:G.key,res,wrong:d.wr||0,tz:USER_TZ})}catch(e){}
 setTimeout(()=>{closeSheet();showResult()},900);return true
}
function check(){const d=D();if(d.res)return;const f=new Set(d.op.map(i=>G.sp[i]).filter(s=>s&&s.t=='L').map(s=>s.v));
 if([...G.sc.w].every(c=>f.has(c)))finish('win');else if(d.wr>=maxLives())finish('lose')}
let journeyFirstDig=false,journeyFirstLetter=false;
function dig(best){const d=D();if(d.res)return;

 const s=G.sp[best];d.op.push(best);
 if(!journeyFirstDig){journeyFirstDig=true;window.__PTH?.journey.progress(.2,'first_dig','map')}
 if(s.t=='L'&&!journeyFirstLetter){journeyFirstLetter=true;window.__PTH?.journey.progress(.5,'first_letter','clue')}
 if(s.t=='L')note='Letter '+s.v+' dug up!';else if(s.t=='C'){st.coins+=2;d.co+=2;note='+2 coins'}else{d.wr=Math.min(maxLives(),d.wr+1);note='A trap! The gallows grows.';const c=$('cv');c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake')}
 navigator.vibrate&&navigator.vibrate(s.t=='T'?[60,40,60]:25);check();save();render()}
function render(){G=build();const d=D(),sc=G.sc,wk=dateAt(off-wdOf(dateAt(off)));const hintButton=$('hint');if(hintButton)hintButton.disabled=!!d.res||d.hint!==undefined;
 $('coins').textContent='● '+st.coins;$('streak').textContent='★ '+streak();
 $('sn').textContent=sc.n;hud();
 $('tabs').innerHTML='';
 let cnt=0;DN.forEach((n,i)=>{const dd=dateAt(off-wdOf(dateAt(off))+i),key=fmt(dd),rs=(st.days[key]||{}).res,isFuture=key>fmt(dateAt(0));if(rs=='win')cnt++;
  const b=document.createElement('button');b.textContent=n+(rs=='win'?' ✓':rs=='lose'?' ✗':'');if(i==wdOf(dateAt(off)))b.className='on';
  b.disabled=isFuture;
  b.onclick=()=>{if(isFuture)return;specialActive=false;off+=i-wdOf(dateAt(off));note='';P.x=30;P.y=64;P.tg=null;render()};$('tabs').append(b)});
 const f=new Set(d.op.map(i=>G.sp[i]).filter(s=>s.t=='L').map(s=>s.v));
 const answerVisible=d.res=='win'||(G.key<fmt(dateAt(0))&&!!d.res);
 $('slots').innerHTML=[...sc.w].map(c=>{const sh=f.has(c)||answerVisible;return'<span class="sl'+(answerVisible&&d.res=='lose'&&!f.has(c)?' bad':'')+'">'+(sh?c:'')+'</span>'}).join('');
 const solved=$('solved');if(solved)solved.textContent=d.res=='win'?'FOUND: '+sc.w:'';
 $('msg').textContent='Lives: '+'♥'.repeat(maxLives()-Math.min(maxLives(),d.wr))+'♡'.repeat(Math.min(maxLives(),d.wr))+(note?'  '+note:'');
 farLayer(farC.getContext('2d'),2);nearLayer(nearC.getContext('2d'));gallows();
 const wkKey=fmt(wk),weeklyGhost=ghostForWeek(wkKey);let h=specialActive&&!d.res?'<p>FINAL MISSION · 50TH CARD</p><p>Find the word ECLIPSE to open the vault and earn 50 bonus coins.</p>':'';
 if(d.res=='win')h='<p class="win">'+(sc.special?'Final treasure found!':'Treasure found!')+' +'+d.bonus+' coins.</p><p><b>'+sc.w+'</b> · +'+(d.xp||0)+' XP · Level '+levelFor(st.xp||0)+'</p>'+h;
 else if(d.res=='lose')h='<p class="lose">'+(sc.special?'The final seal remains closed.':'Treasure lost.')+'</p><p>'+(sc.special?'Return to the 50th card to try again.':G.key<fmt(dateAt(0))?'The word was '+sc.w+'.':'The answer will be revealed after this day has passed.')+'</p>'+h;
 if(d.res&&G.key==fmt(dateAt(0)))h+='<button id="vr">View result</button> ';
 if(cnt>=5&&!st.chest[wkKey])h+='<button id="ch">Open weekly chest</button>';else if(st.chest[wkKey])h+='<p class="win">Weekly chest opened.</p>';
 if(d.res)h+='<button id="sh">Copy result</button>';$('end').innerHTML=h;const vr=$('vr');if(vr)vr.onclick=()=>{closeSheet();showResult()};const pc=$('pic');if(pc)art(sc.w,pc.getContext('2d'));pop=0;album();const sh=$('sh');if(sh)sh.onclick=share;const ch=$('ch');if(ch)ch.onclick=()=>{if(st.chest[wkKey])return;st.coins+=60;if(!st.own.includes(weeklyGhost.id))st.own.push(weeklyGhost.id);st.chest[wkKey]=weeklyGhost.id;note='Chest: +60 coins and '+weeklyGhost.n+' skin!';save();render()};
 shop()}
function closeSheet(){if(SH)SH.classList.remove('open');if(TB)[...TB.children].forEach(x=>x.classList.remove('on'))}
function untilReset(){const p=new Intl.DateTimeFormat('en-GB',{timeZone:USER_TZ,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date()),n=t=>Number(p.find(x=>x.type==t).value),s=86400-(n('hour')*3600+n('minute')*60+n('second')),z=v=>String(v).padStart(2,'0');return z(Math.floor(s/3600))+':'+z(Math.floor(s%3600/60))+':'+z(s%60)}
function fillBoard(){
 const el=$('rb');if(!el||!window.__PTH||!window.__PTH.board)return;
 window.__PTH.board(USER_TZ).then(b=>{
  const e=$('rb');if(!e||!b)return;e.textContent='';
  const mk=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n};
  const bits=[];if(b.streak)bits.push('Streak '+b.streak+(b.streak==1?' day':' days'));
  if(b.me)bits.push('#'+b.me.rank+' of '+b.solvers);else if(b.solvers)bits.push(b.solvers+(b.solvers==1?' solver':' solvers'));
  if(bits.length)e.append(mk('p','stat',bits.join(' · ')));
  const rows=b.top.slice(0,3);if(b.me&&!rows.some(r=>r.name==b.me.name))rows.push(b.me);
  if(rows.length){const total=maxLives(),ol=mk('ol');rows.forEach(r=>{const li=mk('li',b.me&&r.name==b.me.name?'me':'');li.append(mk('span','','#'+r.rank+' '+r.name),mk('span','','♥ '+Math.max(0,total-r.wrong)+'/'+total));ol.append(li)});e.append(ol)}
  if(b.canShare){const btn=mk('button','on','Share to comments');btn.id='cm';btn.onclick=()=>{btn.disabled=true;window.__PTH.share(USER_TZ,maxLives()).then(r=>{if(r&&r.ok){btn.remove();say('Posted to the comments!')}else{btn.disabled=false;btn.textContent='Try again'}})};e.append(btn)}
 });
}
function showResult(){
 const old=$('result');if(old)old.remove();
 const d=D();if(!d.res)return;
 closeSheet();if(TB)TB.style.display='none';
 const win=d.res=='win',today=G.key==fmt(dateAt(0)),sc=G.sc,known=win||(!sc.special&&G.key<fmt(dateAt(0)));
 const mk=(t,c,x)=>{const n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n};
 const ov=mk('div');ov.id='result';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Result');
 const c=mk('div','rc'),L=mk('div','l'),Rr=mk('div','r');
 L.append(mk('h2',win?'win':'lose',sc.special?(win?'Final treasure found!':'Final mission failed'):(win?'Treasure found!':'Treasure lost')));
 if(win){const cv=mk('canvas','pic');cv.width=96;cv.height=96;art(sc.w,cv.getContext('2d'));L.append(cv,mk('p','',(PIC[sc.w]||pf(sc.w))[0]))}
 L.append(mk('p','',win?'Lives left '+(maxLives()-Math.min(maxLives(),d.wr))+'/'+maxLives()+' · +'+(d.bonus||0)+' coins':sc.special?'Return to the 50th card to try again.':known?'The word was '+sc.w+'.':'The answer appears tomorrow.'));
 if(today){const rb=mk('div');rb.id='rb';Rr.append(rb)}
 const nx=mk('p','nx',sc.special?'50th card · Final mission':'Next treasure in '+untilReset());Rr.append(nx);
 const row=mk('div','rr'),cp=mk('button','','Copy result'),cl=mk('button','on','Close');
 cp.onclick=share;cl.onclick=()=>{ov.remove();if(TB)TB.style.display=''};if(!sc.special)row.append(cp);row.append(cl);Rr.append(row);c.append(L,Rr);ov.append(c);$('stage').append(ov);
 if(!sc.special){const iv=setInterval(()=>{if(!document.body.contains(ov)){clearInterval(iv);return}nx.textContent='Next treasure in '+untilReset()},1000)}
 if(today)fillBoard();cl.focus();
}
function startCoach(){
 const T=['Tap or drag on the map to walk.','Stand still next to an object to dig it. Letters spell today’s word.','Got a letter? Guess the word any time in the Guess tab.'];
 st.tut=Math.max(0,Math.min(3,Number(st.tut)||0));
 let el=null,x0=null,t2=0;
 const hide=()=>{if(el){el.remove();el=null}};
 const show=t=>{if(!el){el=document.createElement('div');el.id='coach';el.setAttribute('role','status');const sp=document.createElement('span'),b=document.createElement('button');b.textContent='Skip';b.onclick=()=>{st.tut=3;save();hide()};el.append(sp,b);$('stage').append(el)}el.firstChild.textContent=t};
 document.addEventListener('keydown',e=>{if(e.key=='Escape'){const r=$('result');if(r){r.remove();if(TB)TB.style.display=''}closePop()}});
 setInterval(()=>{
  const d=D();
  if(st.tut>=3||d.res||$('result')){hide();return}
  if(x0==null)x0=P.x;
  if(st.tut==0&&Math.abs(P.x-x0)>24){st.tut=1;save()}
  if(st.tut==1&&d.op.length>0){st.tut=2;t2=Date.now();save()}
  if(st.tut==2&&t2&&Date.now()-t2>7000){st.tut=3;save();hide();return}
  show(T[st.tut]);
 },400);
}
function pxCoin(c){const m=['..0000..','.011110.','01122110','01211310','01211310','01111330','.033330.','..0000..'],pal={0:'#7a4a00',1:'#ffd166',2:'#fff3c4',3:'#e0a030'},x=c.getContext('2d');m.forEach((r,y)=>[...r].forEach((v,i)=>{if(v!='.'){x.fillStyle=pal[v];x.fillRect(i,y,1,1)}}))}
function shop(){const el=$('shop');el.innerHTML='';const wallet=document.createElement('p');wallet.className='shc';wallet.innerHTML='<canvas class="coin" width="8" height="8"></canvas><b>'+st.coins+'</b>';const content=document.createElement('div');content.className='shop-scroll';el.append(wallet,content);pxCoin(wallet.querySelector('.coin'));
 [['Skins',shopSkins(fmt(dateAt(-wdOf(dateAt(0))))),'sk','exp'],['Lantern glow',GL,'gl','g0']].forEach(([T,L,k,df])=>{const h=document.createElement('p');h.textContent=T;h.className='shh';const g=document.createElement('div');g.className='sg';
  L.forEach(s=>{const own=s.p==0||st.own.includes(s.id),cur=(st[k]||df)==s.id,c=document.createElement('div');c.className='itm r'+(s.p<=0?0:s.p<=100?1:s.p<=250?2:3);
   const cv=document.createElement('canvas');cv.width=cv.height=48;cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
   R(0,0,16,16,'#0c0820');R(0,12,16,4,'#17102c');R(2,2,1,1,'#fff3c4');R(13,3,1,1,'#fff3c4');R(12,9,1,1,'#fff3c4');
   const preview=k=='sk'?s:skinForId(st.sk)||SK[0];
   if(k=='gl'&&s.c)for(let a=0;a<20;a++)R(8+Math.round(Math.cos(a/20*6.28)*5),7+Math.round(Math.sin(a/20*6.28)*5),1,1,s.c);
   R(4,13,8,1,'#090712');fig(preview,5,4);R(6,10,4,3,preview.h);R(5,10,1,2,preview.h);R(10,10,1,2,preview.h);R(6,13,2,2,'#111');R(9,13,2,2,'#111');R(7,11,1,1,'#ffd166');
   const n=document.createElement('b');n.textContent=s.n;const b=document.createElement('button');b.textContent=own?(cur?'Equipped':'Equip'):s.p<0?'Chest only':'Buy '+s.p;if(cur)b.className='on';
   b.onclick=()=>{if(own)st[k]=s.id;else if(s.p>=0&&st.coins>=s.p){st.coins-=s.p;if(!st.own.includes(s.id))st.own.push(s.id);st[k]=s.id}else return;save();render()};
   c.append(cv,n,b);g.append(c)});content.append(h,g)})}
const farC=document.createElement('canvas'),nearC=document.createElement('canvas');farC.width=2*W*S;nearC.width=WW*S;farC.height=nearC.height=H*S;
const playerCanvas=document.createElement('canvas');playerCanvas.id='player';playerCanvas.width=36;playerCanvas.height=72;
const playerContext=playerCanvas.getContext('2d');playerContext.imageSmoothingEnabled=false;
const P={x:30,y:64,tg:null,t:0,dg:0,di:-1,d:1},K={},clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cameraView=()=>{const c=$('cv').getBoundingClientRect(),s=$('stage').getBoundingClientRect(),width=Math.min(W,W*s.width/c.width);return{width,crop:(W-width)/2}};
const setTg=e=>{const b=$('cv').getBoundingClientRect(),view=cameraView(),cam=clamp(P.x-view.width/2,0,WW-view.width);P.tg={x:cam-view.crop+(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*H}};
$('cv').addEventListener('pointerdown',setTg);$('cv').addEventListener('pointermove',e=>{if(e.buttons)setTg(e)});
addEventListener('keydown',e=>{K[e.key.toLowerCase()]=1;if(e.target.id!='gi'&&e.key.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>{K[e.key.toLowerCase()]=0});
function fog(sx,cy,rad,col){for(let y=0;y<H;y++){const dy=y-cy;if(Math.abs(dy)>=rad){R(0,y,W,1,col);continue}const w=Math.round(Math.sqrt(rad*rad-dy*dy));R(0,y,Math.max(0,sx-w),1,col);R(sx+w+1,y,W,1,col)}}
let last=performance.now(),lastDateCheck=0;
function frame(t){if(t-lastDateCheck>1000){lastDateCheck=t;if(G&&!specialActive&&G.key!==fmt(dateAt(off))){P.x=30;P.y=64;P.tg=null;P.di=-1;P.dg=0;note='';render()}}const dt=Math.min(.05,(t-last)/1e3);last=t;const d=D(),c=$('cv').getContext('2d');cx=c;c.imageSmoothingEnabled=false;
 let vx=(K.arrowright||K.d?1:0)-(K.arrowleft||K.a?1:0),vy=(K.arrowdown||K.s?1:0)-(K.arrowup||K.w?1:0),targetDistance=null;
 if(document.activeElement&&document.activeElement.id=='gi')vx=vy=0;
 if(vx||vy)P.tg=null;else if(P.tg){const dx=P.tg.x-P.x,dy=P.tg.y-P.y,l=Math.hypot(dx,dy);if(l<.25)P.tg=null;else{vx=dx/l;vy=dy/l;targetDistance=l}}
 const mv=!!(vx||vy)&&!d.res;
 if(mv){const l=Math.hypot(vx,vy)||1,step=Math.min(moveSpeed()*dt,targetDistance??Infinity);P.x=clamp(P.x+vx/l*step,6,WW-6);P.y=clamp(P.y+vy/l*step,14,H-18);P.t+=dt*4;}
 let near=-1,bd=100;if(!d.res)G.sp.forEach((s,i)=>{if(d.op.includes(i))return;const q=(s.x-P.x)**2+(s.y-P.y)**2;if(q<bd){bd=q;near=i}});
 if(near>=0&&!mv){if(P.di!=near){P.di=near;P.dg=0}P.dg+=dt/.7;if(P.dg>=1){P.dg=0;P.di=-1;dig(near);cx=c}}else{P.dg=0;P.di=-1}
 const view=cameraView(),rawCam=clamp(P.x-view.width/2,0,WW-view.width),cam=Math.round(rawCam*S)/S,crop=view.crop;
 c.clearRect(0,0,W*S,H*S);
 c.drawImage(farC,Math.round((cam-crop)*.5*S),0,W*S,H*S,0,0,W*S,H*S);
 c.drawImage(nearC,Math.round((cam-crop)*S),0,W*S,H*S,0,0,W*S,H*S);
 const pt=G.sc.pt||PT[G.sc.n];if(PA.k!=G.key){PA.k=G.key;PA.a=Array.from({length:60},(_,i)=>({x:Math.random()*WW,y:14+Math.random()*(H-32),z:.5+Math.random(),g:i%9==0}))}
 d.xp=d.xp||0;d.px=d.px||0;PA.a.forEach(p=>{p.x=(p.x+pt[0]*p.z*dt+WW)%WW;p.y=(p.y+pt[1]*p.z*dt+H)%H;const px=Math.round(p.x-cam+crop),py=Math.round(p.y);
 if(!d.res&&d.xp<60&&(p.x-P.x)**2+(p.y-(P.y-4))**2<64){const raw=p.g?5:1,g=Math.min(raw,60-d.xp);d.xp+=g;d.px++;st.xp=(st.xp||0)+g;if(d.px>=25&&!d.ch){d.ch=1;st.coins+=15;say('Challenge complete: +15 coins!')}lv();FX.push({x:p.x,y:p.y,t:0,c:p.g?'#ffd166':pt[2]});p.x=Math.random()*WW;p.y=14+Math.random()*(H-32);save();hud();return}
 if(px<-3||px>W+3)return;if(p.g){R(px-1,py-1,3,3,'#ffd166');R(px,py,1,1,Math.floor(t/200)%2?'#fff':'#ff9d2e')}else R(px,py,pt[3],pt[3],pt[2])});
 FX.forEach(f=>{f.t+=dt;const x=Math.round(f.x-cam),y=Math.round(f.y),q=Math.round(f.t*28);R(x-q,y,2,2,f.c);R(x+q,y,2,2,f.c);R(x,y-q,2,2,f.c);R(x,y+q,2,2,f.c)});FX=FX.filter(f=>f.t<.35);TR.forEach(f=>{f.t+=dt;cx.globalAlpha=Math.max(0,1-f.t*2);R(Math.round(f.x-cam),Math.round(f.y-f.t*8),2,2,f.c)});cx.globalAlpha=1;TR=TR.filter(f=>f.t<.5);
 const sx=Math.round((P.x-cam+crop)*S)/S,sy=Math.round(P.y*S)/S,sk=skinForId(st.sk)||SK[0],b=Math.floor(P.t)%2;
 if(!d.res){const rad=34+Math.round(Math.sin(t/170)*1.5);fog(sx,sy-4,rad+12,'rgba(5,3,14,.45)');fog(sx,sy-4,rad,'rgba(5,3,14,.55)');const gc=(GL.find(q=>q.id==st.gl)||{}).c;if(gc)for(let a=0;a<40;a++)R(sx+Math.round(Math.cos(a/40*6.283)*rad),sy-4+Math.round(Math.sin(a/40*6.283)*rad),1,1,gc)}
 if(P.dg>0){R(sx-6,sy-19,12,2,'#000');R(sx-6,sy-19,Math.round(12*P.dg),2,'#ffd166')}
 if(d.hint!==undefined&&!d.res&&!d.op.includes(d.hint)&&Math.floor(t/300)%2){const s=G.sp[d.hint],ax=clamp(s.x-cam+crop,5,W-5),ay=clamp(s.y,5,H-5);R(ax-2,ay-2,5,5,'#fff');R(ax-1,ay-1,3,3,'#ff4d5a')}
 playerContext.clearRect(0,0,playerCanvas.width,playerCanvas.height);cx=playerContext;
 R(3,21,7,1,'rgba(0,0,0,.4)');fig(sk,3,7);R(3,13,6,5,sk.h);R(3,18,2,2+b,'#111');R(7,18,2,3-b,'#111');
 cx=c;
 const mapRect=$('cv').getBoundingClientRect(),stageRect=$('stage').getBoundingClientRect(),scaleX=mapRect.width/W,scaleY=mapRect.height/H;
 if(playerCanvas.style.width!==`${12*scaleX}px`)playerCanvas.style.width=`${12*scaleX}px`;
 if(playerCanvas.style.height!==`${24*scaleY}px`)playerCanvas.style.height=`${24*scaleY}px`;
 playerCanvas.style.transform=`translate3d(${mapRect.left-stageRect.left+(P.x-rawCam+crop-6)*scaleX}px,${mapRect.top-stageRect.top+(P.y-16)*scaleY}px,0)`;
 requestAnimationFrame(frame)}
requestAnimationFrame(frame);
$('gb').onclick=()=>{const v=$('gi').value.trim().toUpperCase(),d=D();if(!v||d.res)return;$('gi').value='';
 const correct=v==G.sc.w;window.__PTH?.journey.interaction('guess_submitted',correct?'correct':'incorrect');
 if(correct)finish('win',5);else{d.wr=Math.min(maxLives(),d.wr+2);note='Wrong guess: −2 lives.';check()}save();render()};
$('gi').addEventListener('keydown',e=>{if(e.key=='Enter')$('gb').click()});
let SH,TB,STG;
function guessPanelHeight(){
 const classes=SH.className,height=SH.style.height,active=[...SH.children].map(p=>p.classList.contains('on'));
 SH.style.height='';SH.classList.add('open','guess-open');SH.classList.remove('today-open','album-open','shop-open');
 [...SH.children].forEach(p=>p.classList.toggle('on',p.id=='p-guess'));
 const measured=SH.getBoundingClientRect().height;
 SH.className=classes;[...SH.children].forEach((p,i)=>p.classList.toggle('on',active[i]));SH.style.height=height;
 return measured;
}
function sizeTodayPanel(){if(!SH)return;SH.style.height=SH.classList.contains('today-open')&&!matchMedia('(orientation:landscape)').matches&&D().res?guessPanelHeight()+'px':''}
function openPane(id,f){if(id=='p-info'&&specialActive){specialActive=false;render()}const o=!f&&SH.classList.contains('open')&&$(id).classList.contains('on');[...SH.children].forEach(p=>p.classList.toggle('on',!o&&p.id==id));SH.classList.toggle('open',!o);SH.classList.toggle('album-open',!o&&id=='p-album');SH.classList.toggle('today-open',!o&&id=='p-info');SH.classList.toggle('guess-open',!o&&id=='p-guess');SH.classList.toggle('shop-open',!o&&id=='p-shop');STG.classList.toggle('album-open',!o&&id=='p-album');STG.classList.toggle('guess-open',!o&&id=='p-guess');STG.classList.toggle('shop-open',!o&&id=='p-shop');if(!o&&id=='p-album')SH.scrollTop=0;sizeTodayPanel();[...TB.children].forEach(x=>x.classList.toggle('on',!o&&x.dataset.p==id))}
window.addEventListener('resize',sizeTodayPanel);
function layout(){const A=$('app'),el=(t,id)=>{const e=document.createElement(t);if(id)e.id=id;return e},old=[...A.children],top=document.querySelector('.top'),chips=document.querySelector('.chips'),guess=$('gi').closest('section'),input=$('gi'),keyboard=el('div','keyboard'),stg=el('div','stage'),hud=el('div','hud'),hl=el('div','hl'),hc=el('div','hc'),hr=el('div','hr'),wordline=el('div','wordline'),ib=el('button','info'),hb=el('button','hint'),lens=el('span'),cost=el('small'),rot=el('div','rot');SH=el('div','sheet');TB=el('nav','tb');STG=stg;
input.readOnly=true;input.setAttribute('inputmode','none');input.setAttribute('aria-label','Guess the word. Use the on-screen keyboard.');
const addKey=(row,label,value,action=false)=>{const b=el('button');b.type='button';b.textContent=label;b.className=action?'action':'';b.onclick=()=>{if(action){input.value=input.value.slice(0,-1)}else if(input.value.length<input.maxLength){input.value+=value}input.focus()};row.append(b)};
['QWERTYUIOP','ASDFGHJKL'].forEach(chars=>{const row=el('div');row.className='keyrow';[...chars].forEach(ch=>addKey(row,ch,ch));keyboard.append(row)});
const lastRow=el('div');lastRow.className='keyrow';[...'ZXCVBNM'].forEach(ch=>addKey(lastRow,ch,ch));addKey(lastRow,'DEL','',true);keyboard.append(lastRow);
input.addEventListener('keydown',e=>{if(e.key==='Enter'){$('gb').click();e.preventDefault()}else if(e.key==='Backspace'){input.value=input.value.slice(0,-1);e.preventDefault()}else if(/^[a-z]$/i.test(e.key)&&input.value.length<input.maxLength){input.value+=e.key.toUpperCase();e.preventDefault()}});
guess.querySelector('#msg2').after(keyboard);
 hl.append($('gl'));const solved=el('div','solved');hc.append(top,solved);hr.append(chips);hud.append(hl,hc,hr,wordline);
 [['p-info',$('tabs'),$('end')],['p-guess',guess],['p-album',Object.assign(el('div','album'),{innerHTML:'<div id="ag"></div><div id="special-card"></div>'})],['p-shop',$('shop')]].forEach(([id,...e])=>{const p=el('div',id);p.className='pane';p.append(...e);SH.append(p)});
 [['Today','p-info'],['Guess','p-guess'],['Album','p-album'],['Shop','p-shop']].forEach(([n,id])=>{const b=el('button');b.textContent=n;b.dataset.p=id;b.onclick=()=>openPane(id);TB.append(b)});
 ib.textContent='?';ib.type='button';ib.title='How to play';ib.setAttribute('aria-label','How to play');ib.onclick=openInfo;
 lens.className='lens';cost.textContent='−8';lens.append(cost);hb.type='button';hb.title='Spend 8 coins to reveal one hidden letter';hb.setAttribute('aria-label','Hint: spend 8 coins to reveal one hidden letter');hb.append(lens);hb.onclick=openHintDialog;
 wordline.append(ib,$('slots'),hb);stg.append($('cv'),playerCanvas,hud,$('msg'),TB,SH);old.forEach(e=>{if(e.parentNode===A)e.remove()});A.append(stg);A.classList.add('ready');playEntryBlocks(stg)}
 function playEntryBlocks(stage){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cover=document.createElement('div'),size=52,cols=Math.ceil(stage.clientWidth/size),rows=Math.ceil(stage.clientHeight/size),colors=['#7132b5','#843bc9','#9649d6','#a85be0','#6329a4','#bd72e9'];
  cover.id='entry-blocks';cover.style.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;cover.style.gridTemplateRows=`repeat(${rows},minmax(0,1fr))`;
  let maxDelay=0;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const block=document.createElement('div'),seed=(row*37+col*61)%colors.length,delay=row*68+((col*17+row*31)%6)*19+(col%3)*12;
   block.className='block';block.style.setProperty('--block',colors[seed]);block.style.setProperty('--delay',`${delay}ms`);block.style.setProperty('--drift',`${((col*13+row*7)%41)-20}px`);block.style.setProperty('--turn',`${((col+row)%2?1:-1)*((col*19+row*11)%16+8)}deg`);cover.append(block);maxDelay=Math.max(maxDelay,delay);
  }
  stage.append(cover);window.setTimeout(()=>cover.remove(),maxDelay+700)
 }
layout();render();window.__PTH?.journey.appReady();window.addEventListener('pagehide',()=>{const d=D(),win=d.res=='win';window.__PTH?.journey.end(win,win,win?Number(d.bonus)||0:0)});if(document.fonts)document.fonts.ready.then(render);startCoach();
})();
