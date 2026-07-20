const h=React.createElement;

const BRIEFS=[
 {id:'family',title:'The Glenbarra Family Loop',tag:'Accessible village adventure',budget:420,deadline:22,opGrant:72,annualGrant:24,target:'Families, casual walkers and visitors with reduced mobility',goal:'Create a reliable 4 to 7 km loop with clear information, gentle terrain and a surface that survives wet weekends.',ideal:['Easy','Moderate'],demand:4200,start:'gate'},
 {id:'heritage',title:'The Abbey & River Ramble',tag:'Landscape, story and community',budget:480,deadline:28,opGrant:78,annualGrant:26,target:'Heritage visitors and reasonably fit walkers',goal:'Connect the abbey, river and woodland into a coherent experience without damaging the things people came to see.',ideal:['Moderate'],demand:3200,start:'harbour'},
 {id:'ridge',title:'The Cairn Ridge Challenge',tag:'Rugged, remote and honest',budget:360,deadline:24,opGrant:64,annualGrant:20,target:'Experienced walkers seeking effort, exposure and wild character',goal:'Make a memorable mountain circuit that remains rugged while managing avoidable danger, erosion and false expectations.',ideal:['Strenuous','Very Difficult'],demand:1900,start:'layby'}
];

const N=[
 ['village',9,84,'Glenbarra','Council','settlement',10,2,2,5],['gate',17,76,'Village gate','Council','urban edge',22,3,3,5],['orchard',20,62,'Old orchard','Byrne Farm','farmland',38,5,5,7],['lane',29,74,'Mill lane','Council','farmland',32,3,3,4],['meadow',37,64,'River meadow','Byrne Farm','wet meadow',31,8,2,8],['farm',47,71,'Cattle gate','Byrne Farm','farmland',35,5,3,4],['layby',44,84,'Forest lay-by','Council','road edge',45,2,3,2],['southbank',59,82,'South riverbank','Byrne Farm','riparian',27,9,2,8],['bridge',55,68,'Stone bridge','Council','riparian',29,4,3,9],['abbey',68,69,'Kilruan Abbey','Heritage Trust','heritage',42,6,3,10],['harbour',82,79,'Canal harbour','Waterways','waterside',22,3,2,7],['bend',77,59,'River bend','Waterways','riparian',48,7,4,9],['eastwood',66,50,'Oak wood east','Coillte','woodland',85,6,6,8],['view',77,40,'Raven viewpoint','Coillte','upland edge',185,7,8,10],['ridge',86,27,'Cairn ridge','Commonage','upland heath',365,9,10,10],['saddle',69,25,'Windy saddle','Commonage','upland heath',305,8,10,8],['track',57,38,'Old forestry track','Coillte','conifer forest',145,3,5,4],['westwood',46,49,'Oak wood west','Coillte','woodland',92,5,5,8],['quarry',35,56,'Disused quarry','O’Rourke Holding','scrub',78,5,5,7],['bogedge',25,51,'Bog edge','O’Rourke Holding','blanket bog',66,8,4,8],['deepbog',20,37,'Deep bog','O’Rourke Holding','blanket bog',81,10,4,10],['turf',34,38,'Old turf road','O’Rourke Holding','degraded bog',91,8,5,7],['falls',47,30,'Fern falls','Coillte','ravine',135,9,8,10],['chapel',57,57,'Wayside chapel','Byrne Farm','pasture',61,4,4,9]
].map(x=>({id:x[0],x:x[1],y:x[2],label:x[3],owner:x[4],terrain:x[5],elev:x[6],risk:x[7],slope:x[8],scenic:x[9]}));

const E=[
 ['village','gate',.7,2,'sealed'],['gate','lane',.9,3,'gravel'],['gate','orchard',.8,5,'grass'],['orchard','lane',.7,4,'grass'],['orchard','bogedge',1.1,8,'earth'],['orchard','meadow',1,7,'grass'],['lane','meadow',.8,6,'grass'],['lane','quarry',.9,6,'earth'],['meadow','farm',.9,7,'grass'],['meadow','westwood',1,8,'earth'],['farm','bridge',.8,7,'grass'],['farm','layby',.7,2,'gravel'],['layby','southbank',1,7,'earth'],['southbank','bridge',.8,9,'earth'],['southbank','harbour',1.2,3,'gravel'],['bridge','abbey',1,4,'gravel'],['bridge','chapel',.7,4,'earth'],['bridge','eastwood',1.1,8,'earth'],['abbey','harbour',1,3,'gravel'],['abbey','bend',.8,7,'earth'],['abbey','chapel',.9,3,'grass'],['bend','harbour',1,6,'earth'],['bend','eastwood',.9,8,'earth'],['bend','view',1.2,9,'rock'],['eastwood','view',1,7,'earth'],['eastwood','track',.9,3,'gravel'],['view','ridge',1.4,10,'rock'],['view','track',.9,6,'earth'],['ridge','saddle',1.3,10,'rock'],['saddle','track',1.2,9,'rock'],['saddle','falls',1.4,10,'rock'],['track','falls',.8,8,'earth'],['track','westwood',.9,3,'gravel'],['track','chapel',1,6,'earth'],['falls','turf',1,8,'earth'],['westwood','turf',.9,7,'earth'],['westwood','quarry',.8,5,'earth'],['westwood','chapel',.8,4,'earth'],['quarry','bogedge',.8,5,'earth'],['quarry','turf',.9,6,'earth'],['bogedge','deepbog',1,10,'peat'],['deepbog','turf',1.1,10,'peat'],['chapel','eastwood',.9,5,'earth']
].map((x,i)=>({id:'e'+i,a:x[0],b:x[1],km:x[2],risk:x[3],base:x[4]}));

const OWNER_COLOURS={'Council':'#8297a3','Byrne Farm':'#ef8b5b','O’Rourke Holding':'#b58b57','Coillte':'#4b8b68','Heritage Trust':'#9a6a5f','Waterways':'#4d8ea8','Commonage':'#6f8058'};
const OWNERS={
 'Byrne Farm':{name:'Bríd Byrne',role:'Farmer',threshold:62,initial:28,concern:'Livestock, gates, parking spillover and walkers leaving the agreed line.',actions:[
  {id:'walk',label:'Walk the route together',trust:22,cost:2,weeks:2,message:'You alter the line around working areas.'},
  {id:'gates',label:'Promise self-closing gates',trust:18,cost:12,weeks:1,message:'The promise now appears in the project commitments.',commitment:'selfClosingGates'},
  {id:'pressure',label:'Lead with public benefit',trust:-18,cost:0,weeks:0,message:'She hears pressure, not consultation.'}]},
 'O’Rourke Holding':{name:'Seán O’Rourke',role:'Landowner',threshold:60,initial:24,concern:'A fear that permissive access will become permanent and wet ground will be damaged.',actions:[
  {id:'agreement',label:'Draft a permissive agreement',trust:27,cost:3,weeks:2,message:'Roles, duration, diversion and withdrawal are recorded.',commitment:'permissiveAgreement'},
  {id:'bog',label:'Commit to bog protection',trust:18,cost:0,weeks:1,message:'Monitoring and seasonal closure become binding promises.',commitment:'bogProtection'},
  {id:'silence',label:'Treat silence as agreement',trust:-25,cost:0,weeks:0,message:'The relationship deteriorates sharply.'}]},
 'Coillte':{name:'Ciara Walsh',role:'Forest manager',threshold:58,initial:34,concern:'Forestry operations, storm damage and clear maintenance responsibility.',actions:[
  {id:'constraints',label:'Map operational constraints',trust:21,cost:1,weeks:1,message:'Temporary diversions are designed in advance.',commitment:'diversionPlan'},
  {id:'reserve',label:'Ring-fence maintenance money',trust:17,cost:12,weeks:0,message:'A maintenance reserve is now protected.',commitment:'maintenanceReserve'},
  {id:'signs',label:'Offer extra signs instead',trust:-10,cost:3,weeks:0,message:'Signs do not solve operational conflict.'}]},
 'Heritage Trust':{name:'Niamh Keane',role:'Heritage officer',threshold:60,initial:30,concern:'Works near the abbey, archaeology and interpretation quality.',actions:[
  {id:'screen',label:'Commission heritage screening',trust:24,cost:8,weeks:3,message:'The route is checked before works are fixed.',commitment:'heritageScreening'},
  {id:'interpret',label:'Co-design interpretation',trust:17,cost:4,weeks:2,message:'The monument becomes part of the route logic.',commitment:'heritageInterpretation'},
  {id:'minimal',label:'Promise minimal works',trust:-22,cost:0,weeks:0,message:'Low impact still needs evidence.'}]},
 'Waterways':{name:'Fergus Doyle',role:'Waterways manager',threshold:57,initial:33,concern:'Bank erosion, angling access and congestion around the harbour.',actions:[
  {id:'banks',label:'Keep users on durable banks',trust:21,cost:3,weeks:1,message:'The durable-bank commitment is recorded.',commitment:'durableBanks'},
  {id:'etiquette',label:'Agree shared-use etiquette',trust:15,cost:1,weeks:1,message:'Angling access and courtesy are made explicit.',commitment:'sharedUse'},
  {id:'numbers',label:'Lead with visitor numbers',trust:-12,cost:0,weeks:0,message:'Commercial enthusiasm does not answer his concerns.'}]},
 'Commonage':{name:'Mick & Áine',role:'Commonage shareholders',threshold:61,initial:27,concern:'Sheep, fire, rescue callouts and promotion to unsuitable users.',actions:[
  {id:'grade',label:'Commit to honest grading',trust:23,cost:1,weeks:1,message:'Exposure and navigation must be described without gloss.',commitment:'honestGrade'},
  {id:'seasonal',label:'Agree seasonal management',trust:18,cost:0,weeks:1,message:'Closure remains possible during fire, lambing or storms.',commitment:'seasonalManagement'},
  {id:'market',label:'Market the challenge',trust:-15,cost:0,weeks:0,message:'They hear bravado rather than management.'}]}
};

c