w Set([...survey,...ids]));setCapitalSpent(x=>x+hiddenOwners.length*8+ids.length);setWeeks(x=>x+4+hiddenOwners.length*2);setTrust(t=>{const n={...t};hiddenOwners.forEach(o=>n[o]=clamp(n[o]-8));return n});setTab('people');setLog(l=>[`Late due diligence discovered ${hiddenOwners.join(', ')}. Construction is paused for access talks.`,...l].slice(0,18));flash('Construction due diligence uncovered hidden ownership. Resolve access before opening.')
 }
 function launch(){
  if(hiddenOwners.length){discoverHiddenOwners();return}
  if(failedHard.length)return flash(failedHard[0].label+' must be resolved before funding can proceed.');
  if(!permissions)return flash('One or more owners have not granted access.');
  if(unmetPromises.length)return flash('An access promise is unfulfilled: '+unmetPromises[0].replace(/([A-Z])/g,' $1').toLowerCase()+'.');
  if(projectedCapital>brief.budget*1.10)return flash('The project exceeds the maximum contingency. Redesign it before approval.');
  if(failedBrief.length&&!overrideReady){setOverrideReady(true);flash(`${failedBrief.length} commission objectives are unmet. The board will fund an override only with reputational and political costs.`);return}
  const overspend=Math.max(0,projectedCapital-brief.budget),late=Math.max(0,weeks-brief.deadline),override=failedBrief.length>0;
  let opStart=opened?operatingFund:brief.opGrant;
  if(!opened){opStart-=overspend*1.25+late*1.2+(override?18:0)}
  setCapitalSpent(projectedCapital);setBuiltRoute([...route]);setBuiltTreat(JSON.parse(JSON.stringify(treat)));setBuiltFac({...fac});
  const nextCondition={};segs.forEach(e=>nextCondition[e.id]=condition[e.id]??100);setCondition(nextCondition);
  setOperatingFund(opStart);setPolitical(p=>clamp(p-overspend/3-late*1.4-(override?18:0)));setReputation(r=>clamp(r-(override?12:0)-late*.5));
  setStats(s=>({...s,capitalOverspend:Math.max(s.capitalOverspend,overspend),lateWeeks:Math.max(s.lateWeeks,late),maxDeficit:Math.max(s.maxDeficit,Math.max(0,-opStart))}));
  setClosed(c=>new Set([...c].filter(id=>segs.some(e=>e.id===id))));setOpened(true);setPhase('operate');setCycle(c=>c+1);setCycleEnd(season+10);setTab('manage');setOverrideReady(false);
  setLog(l=>[`${opened?'Adapted':'Opened'} ${length.toFixed(1)} km trail. Physical grade ${grade}; advertised ${advertisedGrade}. Capital spend €${Math.round(projectedCapital)}k.`,...l].slice(0,18));flash(opened?'The adapted trail is operating again.':'The trail is open. The plan now meets reality.')
 }
 function pauseAndAdapt(){setPhase('plan');setTab('route');setOverrideReady(false);flash('Operations paused. Physical changes will be costed as retrofits with no refunds.')}
 function eventContext(){
  const routeNodes=new Set(route),sf=segs.map(e=>treatment(treat,e.id));
  const classes=segs.map(e=>segmentClass(e,treatment(treat,e.id)));
  return {highRisk:segs.some(e=>e.risk>=8),woodland:route.some(id=>node(id).terrain.includes('wood')),ecology:segs.some(e=>node(e.a).risk>=8||node(e.b).risk>=8),byrne:allOwners.includes('Byrne Farm'),hasGates:sf.some(t=>t.gate),nearVillage:routeNodes.has('gate')||routeNodes.has('village'),parking:fac.parking,demand:brief.demand,bridge:routeNodes.has('bridge'),coillte:allOwners.includes('Coillte'),ridge:routeNodes.has('ridge'),boardwalk:sf.some(t=>t.surface==='boardwalk'),commonage:allOwners.includes('Commonage'),privateOwners:allOwners.length,interpretation:sf.some(t=>t.interpret),incidents,inspections:stats.inspections,riparian:segs.some(e=>['riparian','waterside'].includes(node(e.a).terrain)||['riparian','waterside'].includes(node(e.b).terrain)),capitalOverspend:Math.max(0,capitalSpent-brief.budget),opFund:operatingFund,gradeMismatch:advertisedGrade!==grade,accessMismatch:brief.id==='family'&&classes.some(c=>c>=4)}
 }
 function nextSeason(){
  if(season>=cycleEnd){setPhase('report');return}
  const ctx=eventContext();let candidates=EVENTS.filter(e=>!eventHistory.has(e.id)&&e.when(ctx));
  if(!candidates.length){setEventHistory(new Set());candidates=EVENTS.filter(e=>e.when(ctx))}
  const pick=candidates[(season*3+brief.id.length+cycle)%candidates.length];setEvent(pick)
 }
 function applyConditionDelta(delta){
  if(!delta)return;
  setCondition(c=>Object.fromEntries(Object.entries(c).map(([k,v])=>[k,clamp(v+delta)])))
 }
 function resolveEvent(choice){
  const currentEvent=event;const ctx=eventContext();
  let fund=operatingFund-choice.cost;
  setOperatingFund(fund);setReputation(r=>clamp(r+choice.rep));setPolitical(p=>clamp(p+(choice.political||0)));
  setTrust(t=>{const n={...t};allOwners.forEach(o=>n[o]=clamp(n[o]+choice.trust/Math.max(1,allOwners.length)));return n});
  if(choice.fixGrade)setAdvertisedGrade(grade);
  if(choice.asset==='gate'){const target=ownerSegments(segs,'Byrne Farm')[0];if(target){setTreat(t=>({...t,[target.id]:{surface:'natural',width:'narrow',...(t[target.id]||{}),gate:true}}));setBuiltTreat(t=>({...t,[target.id]:{surface:'natural',width:'narrow',...(t[target.id]||{}),gate:true}}))}}
  const effectiveClosed=new Set(closed);
  if(choice.closure){const risk=segs.filter(e=>!effectiveClosed.has(e.id)).sort((a,b)=>b.risk-a.risk)[0];if(risk)effectiveClosed.add(risk.id);setClosed(effectiveClosed)}

  const condVals=Object.values(condition),conditionAvg=condVals.length?avg(condVals):100;
  const scenic=routeScenery(segs),closedShare=effectiveClosed.size/Math.max(1,segs.length),classes=segs.map(e=>segmentClass(e,treatment(treat,e.id)));
  const facilityFactor=(fac.info?1.04:.9)*(fac.parking?1.08:(brief.demand>2600?.87:1))*(fac.toilets&&brief.id==='family'?1.07:1);
  const accessFactor=brief.id==='family'?(classes.every(c=>c<=3)?1:.68):1;
  const seasonalWeather=season%2===0?1.12:.76;
  const visitsHalf=(brief.demand/2)*lengthFit(brief,length)*gradeFit(brief,advertisedGrade,grade)*(0.72+scenic/25)*facilityFactor*accessFactor*(0.45+reputation/100)*(0.45+conditionAvg/180)*(1-closedShare*.55)*seasonalWeather*(choice.vis||1);
  const annual=Math.max(120,visitsHalf);
  const next=Object.fromEntries(Object.entries(condition).map(([k,v])=>[k,clamp(v+(choice.condition||0))]));let newInc=0,preventable=0;
  segs.forEach(e=>{
   if(effectiveClosed.has(e.id))return;
   const t=treatment(treat,e.id),sf=SURF[t.surface||'natural'],wd=WIDTH[t.width||'narrow'];
   const weather=season%2===1?1.38:.8,wear=(e.risk*weather*(annual/2600))/(sf.dur*(t.drain?1.5:1)*(1+(wd.value-1)*.12));
   next[e.id]=clamp((next[e.id]??100)-wear,5,100);
   let hazard=0;if(next[e.id]<55)hazard+=2;if(next[e.id]<35)hazard+=2;if(!t.mark&&e.risk>7)hazard+=2;if(advertisedGrade!==grade)hazard+=1;if(brief.id==='family'&&segmentClass(e,t)>=4)hazard+=2;
   if(hazard>=3){newInc+=Math.max(1,Math.floor(hazard/3));if(next[e.id]<55||!t.mark||advertisedGrade!==grade)preventable+=1}
  });
  const newAvg=avg(Object.values(next)),defects=Object.values(next).filter(v=>v<55).length;
  const nextSeasonNumber=season+1;let grant=0;if(nextSeasonNumber%2===0)grant=brief.annualGrant*(political/100);
  fund+=grant;
  setOperatingFund(fund);setCondition(next);setVisitors(v=>v+Math.round(annual));setIncidents(x=>x+newInc);setSeason(nextSeasonNumber);setEventHistory(s=>new Set([...s,currentEvent.id]));
  setStats(s=>({...s,preventable:s.preventable+preventable,maxDeficit:Math.max(s.maxDeficit,Math.max(0,-fund)),defectSeasons:s.defectSeasons+(defects?1:0),conditionHistory:[...s.conditionHistory,newAvg].slice(-30)}));
  setLog(l=>[`${season%2?'Winter':'Summer'} ${Math.floor(season/2)+1}: ${currentEvent.title}. ${choice.label}. ${Math.round(annual).toLocaleString()} visits, ${newInc} incidents${grant?`, €${Math.round(grant)}k annual grant`:''}.`,...l].slice(0,18));setEvent(null);
  if(nextSeasonNumber>=cycleEnd)setTimeout(()=>setPhase('report'),350)
 }
 function spendOps(cost){
  const next=operatingFund-cost;setOperatingFund(next);setStats(s=>({...s,maintenanceSpend:s.maintenanceSpend+cost,maxDeficit:Math.max(s.maxDeficit,Math.max(0,-next))}));return next
 }
 function maintain(kind){
  if(kind==='grant'){setOperatingFund(f=>f+20);setPolitical(p=>clamp(p-8));setStats(s=>({...s,emergencyGrants:s.emergencyGrants+1}));setLog(l=>['Emergency operating grant accepted. Political support falls.',...l].slice(0,18));return}
  if(kind==='inspect'){spendOps(3);setStats(s=>({...s,inspections:s.inspections+1}));setLog(l=>['Inspection completed and defects priorit