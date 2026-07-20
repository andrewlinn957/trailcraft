)===1?.82:.58;
 return expected*mismatch;
}
function initialTrust(){return Object.fromEntries(Object.entries(OWNERS).map(([k,v])=>[k,v.initial]))}
function emptyStats(){return {inspections:0,repairs:0,drains:0,workdays:0,closures:0,preventable:0,maintenanceSpend:0,emergencyGrants:0,maxDeficit:0,defectSeasons:0,conditionHistory:[],capitalOverspend:0,lateWeeks:0}}

function App(){
 const [phase,setPhase]=React.useState('brief');
 const [brief,setBrief]=React.useState(BRIEFS[0]);
 const [route,setRoute]=React.useState([]);
 const [builtRoute,setBuiltRoute]=React.useState([]);
 const [survey,setSurvey]=React.useState(new Set());
 const [overlay,setOverlay]=React.useState('base');
 const [tab,setTab]=React.useState('route');
 const [selSeg,setSelSeg]=React.useState(null);
 const [treat,setTreat]=React.useState({});
 const [builtTreat,setBuiltTreat]=React.useState({});
 const [trust,setTrust]=React.useState(initialTrust());
 const [usedActions,setUsedActions]=React.useState({});
 const [commitments,setCommitments]=React.useState({});
 const [capitalSpent,setCapitalSpent]=React.useState(0);
 const [weeks,setWeeks]=React.useState(0);
 const [fac,setFac]=React.useState({info:false,parking:false,toilets:false,picnic:false});
 const [builtFac,setBuiltFac]=React.useState({info:false,parking:false,toilets:false,picnic:false});
 const [opened,setOpened]=React.useState(false);
 const [season,setSeason]=React.useState(0);
 const [cycle,setCycle]=React.useState(0);
 const [cycleEnd,setCycleEnd]=React.useState(10);
 const [reputation,setReputation]=React.useState(55);
 const [political,setPolitical]=React.useState(72);
 const [operatingFund,setOperatingFund]=React.useState(0);
 const [condition,setCondition]=React.useState({});
 const [visitors,setVisitors]=React.useState(0);
 const [incidents,setIncidents]=React.useState(0);
 const [advertisedGrade,setAdvertisedGrade]=React.useState('Easy');
 const [closed,setClosed]=React.useState(new Set());
 const [event,setEvent]=React.useState(null);
 const [eventHistory,setEventHistory]=React.useState(new Set());
 const [log,setLog]=React.useState([]);
 const [stats,setStats]=React.useState(emptyStats());
 const [overrideReady,setOverrideReady]=React.useState(false);
 const [toast,setToast]=React.useState('');
 const flash=msg=>{setToast(msg);clearTimeout(window.__trailToast);window.__trailToast=setTimeout(()=>setToast(''),2600)};

 const segs=routeEdges(route);
 const builtSegs=routeEdges(builtRoute);
 const length=segs.reduce((s,e)=>s+e.km,0);
 const loop=route.length>3&&route[0]===route[route.length-1];
 const grade=deriveGrade(segs,treat,fac);
 const allOwners=[...new Set(segs.flatMap(edgeOwners))];
 const knownOwners=[...new Set(segs.filter(e=>knownSegment(e,survey)).flatMap(edgeOwners))];
 const hiddenOwners=allOwners.filter(o=>!knownOwners.includes(o));
 const permissions=allOwners.every(o=>trust[o]>=OWNERS[o].threshold);
 const expectedReserve=Math.max(0,brief.opGrant-Math.max(0,capitalSpent-brief.budget));
 const promises=promiseStatus(commitments,segs,treat,advertisedGrade,grade,opened?operatingFund:expectedReserve);
 const unmetPromises=Object.keys(commitments).filter(k=>commitments[k]&&!promises[k]);

 const projectCost=React.useMemo(()=>{
  if(!opened){
   return segs.reduce((s,e)=>s+(knownSegment(e,survey)?exactSegmentCost(e,treatment(treat,e.id)):baseSegmentCost(e,treatment(treat,e.id))),0)+Object.entries(fac).reduce((s,[k,v])=>s+(v?FACILITY_COST[k]:0),0);
  }
  const oldIds=new Set(builtSegs.map(e=>e.id)),newIds=new Set(segs.map(e=>e.id));
  let cost=0;
  segs.forEach(e=>{
   const nt=treatment(treat,e.id),ot=treatment(builtTreat,e.id);
   if(!oldIds.has(e.id))cost+=exactSegmentCost(e,nt);
   else if(JSON.stringify(nt)!==JSON.stringify(ot))cost+=exactSegmentCost(e,nt)*.72+e.km*6;
  });
  builtSegs.forEach(e=>{if(!newIds.has(e.id))cost+=4+e.km*2});
  Object.keys(fac).forEach(k=>{if(fac[k]&&!builtFac[k])cost+=FACILITY_COST[k];if(!fac[k]&&builtFac[k])cost+=FACILITY_COST[k]*.25});
  return cost;
 },[opened,segs,builtSegs,treat,builtTreat,fac,builtFac,survey]);
 const projectedCapital=capitalSpent+projectCost;
 const capitalRemaining=brief.budget-projectedCapital;
 const capitalHardRemaining=brief.budget*1.10-projectedCapital;
 const objectives=objectiveList(brief,{route,segs,length,loop,grade,fac,treat,survey,advertised:advertisedGrade,commitments,operatingFund:opened?operatingFund:expectedReserve});
 const failedHard=objectives.filter(o=>o.hard&&!o.met);
 const failedBrief=objectives.filter(o=>!o.hard&&!o.met);

 function chooseBrief(b){setBrief(b);setAdvertisedGrade(b.ideal[0])}
 function start(){
  setPhase('plan');setRoute([brief.start]);setBuiltRoute([]);setSurvey(new Set([brief.start]));setTreat({});setBuiltTreat({});setFac({info:false,parking:false,toilets:false,picnic:false});setBuiltFac({info:false,parking:false,toilets:false,picnic:false});setTrust(initialTrust());setUsedActions({});setCommitments({});setCapitalSpent(0);setWeeks(0);setOpened(false);setSeason(0);setCycle(0);setCycleEnd(10);setReputation(55);setPolitical(72);setOperatingFund(0);setCondition({});setVisitors(0);setIncidents(0);setClosed(new Set());setEventHistory(new Set());setLog([]);setStats(emptyStats());setOverrideReady(false);setTab('route');flash('Commission accepted. Investigate before you commit.')
 }
 function applyRelationshipPenalty(changedEdges){
  const affected=[...new Set(changedEdges.flatMap(edgeOwners))];
  if(!affected.length)return;
  setTrust(old=>{const next={...old};affected.forEach(o=>{if(next[o]>=OWNERS[o].threshold||opened)next[o]=clamp(next[o]-(opened?8:4))});return next});
  if(opened){setWeeks(w=>w+2);setLog(l=>['Route revision reopened access discussions with '+affected.join(', ')+'.',...l].slice(0,18))}
 }
 function clickNode(id){
  if(phase!=='plan')return;
  const last=route[route.length-1];
  if(id===last&&route.length>1){const removed=edge(route[route.length-2],last);applyRelationshipPenalty(removed?[removed]:[]);setRoute(route.slice(0,-1));return}
  if(route.includes(id)&&id!==route[0])return flash('That point is already on the route. Use “Redraw from here” in the route desk.');
  const e=edge(last,id);if(!e)return flash('No viable connection from the current end.');
  applyRelationshipPenalty([e]);setRoute([...route,id]);setSelSeg(e.id);setOverrideReady(false)
 }
 function editFrom(index){
  if(index<0||index>=route.length-1)return;
  const removed=routeEdges(route.slice(index).length?route.slice(index):[]);
  const newRoute=route.slice(0,index+1);
  const changed=segs.filter(e=>!routeEdges(newRoute).some(x=>x.id===e.id));
  applyRelationshipPenalty(changed);setRoute(newRoute);setSelSeg(changed[0]?.id||null);setOverrideReady(false);flash('Route reopened from '+node(newRoute[newRoute.length-1]).label+'.')
 }
 function surveyNode(id){
  if(survey.has(id))return;
  setSurvey(new Set([...survey,id]));setCapitalSpent(x=>x+2);setWeeks(x=>x+1);flash('Survey complete: ownership, ground and cost certainty improved.')
 }
 function surveyRoute(){
  const ids=[...new Set(route)].filter(id=>!survey.has(id));if(!ids.length)return flash('The full route has already been surveyed.');
  setSurvey(new Set([...survey,...ids]));setCapitalSpent(x=>x+ids.length*1.6);setWeeks(x=>x+Math.ceil(ids.length*.65));flash(`${ids.length} route points surveyed as one field campaign.`)
 }
 function negotiate(ownerName,action){
  const key=ownerName+':'+action.id;if(usedActions[key])return;
  setUsedActions(u=>({...u,[key]:true}));setTrust(t=>({...t,[ownerName]:clamp(t[ownerName]+action.trust)}));setCapitalSpent(x=>x+action.cost);setWeeks(x=>x+action.weeks);if(action.commitment)setCommitments(c=>({...c,[action.commitment]:true}));flash(action.message)
 }
 function updateTreatment(k,v){
  if(phase!=='plan'||!selSeg)return flash('Pause operations before changing the physical trail.');
  setTreat(t=>({...t,[selSeg]:{surface:'natural',width:'narrow',...(t[selSeg]||{}),[k]:v}}));setOverrideReady(false)
 }
 function toggleFacility(k){if(phase!=='plan')return flash('Pause operations before changing facilities.');setFac(f=>({...f,[k]:!f[k]}));setOverrideReady(false)}
 function setGrade(g){setAdvertisedGrade(g);setOverrideReady(false)}
 function discoverHiddenOwners(){
  const ids=[...new Set(segs.filter(e=>!knownSegment(e,survey)).flatMap(e=>[e.a,e.b]))];
  setSurvey(ne