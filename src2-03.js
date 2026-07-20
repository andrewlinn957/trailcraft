cal:-3}]},
 {id:'school',title:'The local school adopts the trail',text:'Teachers want to use the route for outdoor learning throughout the year.',when:c=>c.nearVillage||c.interpretation,choices:[
  {label:'Co-design a field programme',cost:6,rep:7,trust:6,condition:0,vis:1.06,political:3},
  {label:'Provide a downloadable pack',cost:2,rep:3,trust:2,condition:0,vis:1.02,political:1},
  {label:'Decline because of wear',cost:0,rep:-5,trust:-4,condition:1,vis:.96,political:-2}]},
 {id:'heatwave',title:'A prolonged heatwave',text:'Dry ground reduces mud but increases fire risk, water demand and visitor exposure.',when:()=>true,choices:[
  {label:'Add heat and water advice',cost:3,rep:3,trust:3,condition:1,vis:.94,political:1},
  {label:'Shorten opening hours',cost:2,rep:-1,trust:5,condition:3,vis:.82,political:2,closure:1},
  {label:'Promote the sunshine',cost:1,rep:2,trust:-5,condition:-4,vis:1.2,political:-3}]},
 {id:'waymarkers',title:'Waymarkers disappear',text:'Several markers are removed and walkers begin creating an unofficial line.',when:()=>true,choices:[
  {label:'Replace and audit the junctions',cost:7,rep:3,trust:4,condition:2,vis:.98,political:1},
  {label:'Use temporary markers',cost:3,rep:0,trust:1,condition:0,vis:.95,political:0},
  {label:'Wait for the next inspection',cost:0,rep:-6,trust:-3,condition:-3,vis:.9,political:-3}]},
 {id:'funding',title:'The funder calls a review',text:'Overspend and operating deficits are now visible to the project board.',when:c=>c.capitalOverspend>0||c.opFund<0,choices:[
  {label:'Publish a recovery plan',cost:2,rep:2,trust:2,condition:0,vis:.96,political:5},
  {label:'Apply for emergency support',cost:-18,rep:-1,trust:0,condition:0,vis:1,political:-5},
  {label:'Delay the paperwork',cost:0,rep:-6,trust:-3,condition:0,vis:1,political:-8}]}
];

const node=id=>N.find(n=>n.id===id);
const edge=(a,b)=>E.find(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a));
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const routeEdges=route=>route.slice(1).map((b,i)=>edge(route[i],b)).filter(Boolean);
const ownerColour=o=>OWNER_COLOURS[o]||'#999';
const avg=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
const treatment=(map,id)=>map[id]||{surface:'natural',width:'narrow'};
const edgeFactor=id=>.85+((Number(id.slice(1))*17+11)%41)/100;
const edgeOwners=e=>[node(e.a).owner,node(e.b).owner].filter((v,i,a)=>v!=='Council'&&a.indexOf(v)===i);
const ownerSegments=(segs,o)=>segs.filter(e=>edgeOwners(e).includes(o));

function baseSegmentCost(e,t){
 const sf=SURF[t.surface||'natural'],wd=WIDTH[t.width||'narrow'];
 return e.km*(6+sf.rate+wd.rate)+(t.drain?9:0)+(t.mark?2:0)+(t.gate?8:0)+(t.steps?14:0)+(t.interpret?5:0);
}
function exactSegmentCost(e,t){return baseSegmentCost(e,t)*edgeFactor(e.id)}
function knownSegment(e,survey){return survey.has(e.a)&&survey.has(e.b)}
function costDisplay(e,t,survey){
 const b=baseSegmentCost(e,t);
 if(knownSegment(e,survey))return {label:`€${Math.round(b*edgeFactor(e.id))}k`,value:b*edgeFactor(e.id),known:true};
 return {label:`€${Math.round(b*.78)}k–€${Math.round(b*1.30)}k`,value:b,known:false};
}
function segmentClass(e,t){
 const sf=SURF[t.surface||'natural'],wd=WIDTH[t.width||'narrow'];
 let slope=Math.max(node(e.a).slope,node(e.b).slope),exposure=Math.max(e.risk,node(e.a).risk,node(e.b).risk);
 if(t.surface==='boardwalk'){exposure-=2;slope-=1}
 if(t.drain)exposure-=1;
 if(t.mark)exposure-=.5;
 if(t.steps)slope-=1;
 const hasBarrier=!!t.steps||!!t.gate;
 if(wd.value>=3&&sf.smooth>=4&&slope<=3&&exposure<=4&&!hasBarrier)return 1;
 if(wd.value>=2&&sf.smooth>=3&&slope<=5&&exposure<=6&&!t.steps)return 2;
 if(sf.smooth>=1&&slope<=6&&exposure<=7)return 3;
 if(slope<=8&&exposure<=9)return 4;
 return 5;
}
function deriveGrade(segs,treat,fac){
 if(!segs.length)return 'Unclassified';
 const classes=segs.map(e=>({c:segmentClass(e,treatment(treat,e.id)),km:e.km}));
 const total=classes.reduce((s,x)=>s+x.km,0),share=n=>classes.filter(x=>x.c===n).reduce((s,x)=>s+x.km,0)/total;
 const max=Math.max(...classes.map(x=>x.c));
 if(max===1&&fac.toilets&&fac.info)return 'Multi-Access';
 if(max<=2||((share(3)+share(4))<.12&&max<=4))return 'Easy';
 if(max<=3||(share(4)<.25&&max<=4))return 'Moderate';
 if(max<=4||share(5)<.15)return 'Strenuous';
 return 'Very Difficult';
}
function promiseStatus(commitments,segs,treat,advertised,derived,operatingFund){
 const touches=(o,pred)=>ownerSegments(segs,o).some(e=>pred(treatment(treat,e.id),e));
 return {
  selfClosingGates:touches('Byrne Farm',t=>t.gate),
  permissiveAgreement:true,
  bogProtection:touches('O’Rourke Holding',(t,e)=>t.surface==='boardwalk'||t.drain||!['peat','earth'].includes(e.base)),
  diversionPlan:true,
  maintenanceReserve:operatingFund>=25,
  heritageScreening:true,
  heritageInterpretation:touches('Heritage Trust',(t,e)=>t.interpret||e.a==='abbey'||e.b==='abbey')&&ownerSegments(segs,'Heritage Trust').some(e=>treatment(treat,e.id).interpret),
  durableBanks:touches('Waterways',(t,e)=>['gravel','stone','sealed','boardwalk'].includes(t.surface)),
  sharedUse:true,
  honestGrade:advertised===derived&&['Strenuous','Very Difficult'].includes(advertised),
  seasonalManagement:true
 };
}
function objectiveList(brief,ctx){
 const {route,segs,length,loop,grade,fac,treat,survey,advertised,commitments,operatingFund}=ctx;
 const classes=segs.map(e=>segmentClass(e,treatment(treat,e.id)));
 const surveyed=segs.every(e=>knownSegment(e,survey));
 const markedExposed=segs.filter(e=>e.risk>=8).every(e=>treatment(treat,e.id).mark);
 const interpretedAbbey=segs.some(e=>(e.a==='abbey'||e.b==='abbey')&&treatment(treat,e.id).interpret);
 const wetProtected=segs.filter(e=>e.base==='peat'||node(e.a).terrain.includes('bog')||node(e.b).terrain.includes('bog')).every(e=>{const t=treatment(treat,e.id);return t.surface==='boardwalk'||t.drain});
 const base=[
  {id:'meaningful',label:'A coherent route of at least 3 km',met:length>=3,hard:true},
  {id:'surveyed',label:'Ownership and ground verified along the whole route',met:surveyed,hard:true},
  {id:'loop',label:'Return to the trailhead',met:loop,hard:false}
 ];
 if(brief.id==='family')return base.concat([
  {id:'length',label:'Length between 4 and 7 km',met:length>=4&&length<=7,hard:false},
  {id:'grade',label:'Easy or Moderate physical grade',met:['Easy','Moderate'].includes(grade),hard:false},
  {id:'access',label:'No Class 4 or 5 section and at least 70% Class 1 or 2',met:classes.every(c=>c<=3)&&classes.filter(c=>c<=2).length/Math.max(1,classes.length)>=.7,hard:false},
  {id:'info',label:'Trailhead information board',met:fac.info,hard:false}
 ]);
 if(brief.id==='heritage')return base.concat([
  {id:'abbey',label:'Include Kilruan Abbey',met:route.includes('abbey'),hard:false},
  {id:'river',label:'Include at least two river or harbour points',met:['harbour','bend','bridge','southbank'].filter(x=>route.includes(x)).length>=2,hard:false},
  {id:'grade',label:'Moderate grade',met:grade==='Moderate',hard:false},
  {id:'screen',label:'Heritage screening completed',met:!!commitments.heritageScreening,hard:false},
  {id:'interpret',label:'Interpretation designed at the abbey',met:interpretedAbbey,hard:false},
  {id:'wet',label:'Wet and protected ground managed',met:wetProtected,hard:false}
 ]);
 return base.concat([
  {id:'ridge',label:'Reach Cairn ridge',met:route.includes('ridge'),hard:false},
  {id:'grade',label:'Strenuous or Very Difficult grade',met:['Strenuous','Very Difficult'].includes(grade),hard:false},
  {id:'mark',label:'Every exposed section has waymarking',met:markedExposed,hard:false},
  {id:'honest',label:'Advertised grade matches the physical grade',met:advertised===grade,hard:false},
  {id:'seasonal',label:'Seasonal closure powers agreed',met:!!commitments.seasonalManagement,hard:false}
 ]);
}
function routeScenery(segs){return segs.length?avg(segs.map(e=>(node(e.a).scenic+node(e.b).scenic)/2)):0}
function lengthFit(brief,length){
 if(brief.id==='family')return length>=4&&length<=7?1:length<3?.55:.78;
 if(brief.id==='heritage')return length>=5&&length<=10?1:length<3?.62:.84;
 return length>=7?1:length>=5?.88:.6;
}
function gradeFit(brief,advertised,derived){
 const expected=brief.ideal.includes(advertised)?1:.76;
 const mismatch=advertised===derived?1:Math.abs(GRADE_ORDER.indexOf(advertised)-GRADE_ORDER.indexOf(derived)