ised.',...l].slice(0,18));flash('Inspection recorded.')}
  if(kind==='drain'){spendOps(6);setCondition(c=>Object.fromEntries(Object.entries(c).map(([k,v])=>[k,clamp(v+((routeEdges(route).find(e=>e.id===k)?.risk||0)>=6?8:3))])));setStats(s=>({...s,drains:s.drains+1}));flash('Drains cleared across vulnerable sections.')}
  if(kind==='repair'){const worst=Object.entries(condition).filter(([k])=>!closed.has(k)).sort((a,b)=>a[1]-b[1])[0];if(!worst)return;spendOps(18);setCondition(c=>({...c,[worst[0]]:clamp(c[worst[0]]+32)}));setStats(s=>({...s,repairs:s.repairs+1}));flash('The weakest open section has been repaired.')}
  if(kind==='workday'){spendOps(4);const effectiveness=Math.max(2,7-stats.workdays*2);setCondition(c=>Object.fromEntries(Object.entries(c).map(([k,v])=>[k,clamp(v+effectiveness)])));setTrust(t=>Object.fromEntries(Object.entries(t).map(([k,v])=>[k,clamp(v+2)])));setStats(s=>({...s,workdays:s.workdays+1}));flash(stats.workdays>=2?'Volunteer fatigue limits the gain.':'A supervised workday improves condition and trust.')}
 }
 function toggleClosure(id){
  if(!id)return;
  if(closed.has(id)){spendOps(2);const n=new Set(closed);n.delete(id);setClosed(n);setLog(l=>['Section reopened after a safety check.',...l].slice(0,18));flash('Section reopened after inspection.')}
  else{setClosed(new Set([...closed,id]));setStats(s=>({...s,closures:s.closures+1}));setLog(l=>['A vulnerable section was temporarily closed.',...l].slice(0,18));flash('Section closed. Demand falls, but wear and exposure stop.')}
 }

 const scores=React.useMemo(()=>{
  const vals=Object.values(condition),avgCond=vals.length?avg(vals):70,minCond=vals.length?Math.min(...vals):70;
  const avgTrust=allOwners.length?avg(allOwners.map(o=>trust[o])):78;
  const envDamage=segs.reduce((s,e)=>{const t=treatment(treat,e.id),sf=SURF[t.surface||'natural'];return s+(sf.impact<0?Math.abs(sf.impact)*.8:0)+(node(e.a).risk>=9&&!t.drain&&t.surface!=='boardwalk'?3:0)},0);
  const environment=clamp(88-envDamage+stats.closures*1.2);
  const community=clamp(30+reputation*.38+political*.25+(fac.parking?5:0)-stats.emergencyGrants*5);
  const management=clamp(12+avgCond*.32+minCond*.14+stats.inspections*5+stats.repairs*3+stats.drains*2+stats.workdays*1.5-stats.preventable*7-stats.defectSeasons*2-stats.maxDeficit*.18-stats.emergencyGrants*4);
  const met=objectives.filter(o=>o.met).length/objectives.length;
  const standards=clamp(20+met*58+(advertisedGrade===grade?12:-15)-stats.preventable*2);
  const appeal=clamp(28+reputation*.38+routeScenery(segs)*3+Math.min(12,visitors/3000)-(advertisedGrade!==grade?15:0));
  return {Environment:environment,Community:community,Durability:clamp(avgCond*.75+minCond*.25),Management:management,Landowners:clamp(avgTrust-unmetPromises.length*15),Standards:standards,Appeal:appeal}
 },[condition,trust,reputation,political,route,treat,fac,stats,visitors,advertisedGrade,grade,objectives.length,objectives.filter(o=>o.met).length]);

 if(phase==='brief'){
  const briefCards=h('div',{className:'briefs'},BRIEFS.map(b=>h('button',{className:'brief '+(brief.id===b.id?'active':''),onClick:()=>chooseBrief(b),key:b.id},h('span',null,b.tag),h('strong',null,b.title),h('span',null,b.target),h('span',{style:{marginTop:8,fontWeight:900}},`€${b.budget}k · ${b.deadline}-week deadline`))));
  const intro=h('section',{className:'heroCard'},h('div',{className:'eyebrow'},'Strategy simulation · Ireland'),h('h1',null,'Build a trail that survives reality.'),h('p',{className:'lead'},'Survey uncertain ground, draw a route, negotiate access, choose what to build and then operate the trail through weather, visitors and awkward consequences. There is no answer key. The landscape remembers.'),briefCards,h('button',{className:'primary',onClick:start},'Accept commission'));
  const summary=h('section',{className:'panel briefSummary'},h('div',{className:'eyebrow'},'Your brief'),h('h2',null,brief.title),h('p',{className:'lead'},brief.goal),h('div',{className:'metricGrid'},h(Metric,{label:'Target users',value:brief.target}),h(Metric,{label:'Expected annual demand',value:brief.demand.toLocaleString()}),h(Metric,{label:'Capital envelope',value:`€${brief.budget}k`}),h(Metric,{label:'Opening deadline',value:`Week ${brief.deadline}`})),h('div',{className:'warning good'},'The game teaches through interacting systems. A defensible choice in one commission can fail in another.'));
  return h('div',{className:'app'},h(Top,{capital:brief.budget,weeks,deadline:brief.deadline,phase}),h('div',{className:'wrap'},h('div',{className:'hero'},intro,h(LandscapeArt)),summary));
 }


 if(phase==='report'){
  const raw=avg(Object.values(scores)),overspend=Math.max(0,capitalSpent-brief.budget),financePenalty=Math.min(24,overspend/brief.budget*120+stats.maxDeficit*.16+stats.emergencyGrants*3),overall=Math.round(clamp(raw-financePenalty));
  return h('div',{className:'app'},h(Top,{capital:brief.budget-capitalSpent,ops:operatingFund,weeks,deadline:brief.deadline,phase}),h('main',{className:'report'},
   h('div',{className:'heroCard'},h('div',{className:'eyebrow'},`Cycle ${cycle} review · ${season} seasons operated`),h('h1',null,overall>=78?'A trail with a future.':overall>=58?'A credible trail under strain.':'A beautiful lesson in deferred problems.'),h('p',{className:'lead'},`${brief.title} welcomed ${visitors.toLocaleString()} visits and recorded ${incidents} reportable incidents. Its adjusted assessment is ${overall}/100.`),
    h('div',{className:'financeStrip'},h(Metric,{label:'Capital spend',value:`€${Math.round(capitalSpent)}k`}),h(Metric,{label:'Capital variance',value:`${overspend?'Over ':'Under '}€${Math.abs(Math.round(brief.budget-capitalSpent))}k`}),h(Metric,{label:'Operating balance',value:`€${Math.round(operatingFund)}k`}),h(Metric,{label:'Preventable incidents',value:stats.preventable})),
    h('div',{className:'wheel'},Object.entries(scores).map(([k,v])=>h('div',{className:'score',key:k},h('b',null,Math.round(v)),h('small',null,k)))),
    h('div',{className:'actions'},h('button',{className:'primary',onClick:()=>location.reload()},'Start another commission'),h('button',{className:'secondary',onClick:pauseAndAdapt},'Adapt and run another five years'))
   ),
   h('section',{className:'panel',style:{marginTop:20}},h('h2',null,'Commission objectives'),h(ObjectiveList,{objectives}),h('h2',{style:{marginTop:22}},'What the landscape says'),h('p',{className:'lead'},overall>=78?'You balanced access, user expectations, durability and long-term management. The result is not perfect, but it can be understood, maintained and adapted.':'The review exposes where capital savings became operational costs, information failed to match experience, or relationships were treated as one-off permissions.'),h('div',{className:'timeline'},Array.from({length:10},(_,i)=>h('span',{className:'year done',key:i}))),h('div',{className:'routeList'},log.map((x,i)=>h('div',{className:'segment',key:i},x))))
  ));
 }

 const toolbar=h('div',{className:'mapTools'},['base','ownership','ecology','slope','condition'].map(x=>h('button',{className:'tool '+(overlay===x?'active':''),onClick:()=>setOverlay(x),key:x},x)),h('span',{className:'toolHint'},phase==='plan'?'Click connected nodes to draw.':'Select a route section to inspect or close.'));
 const seasonControls=phase==='operate'?h('div',{className:'seasonBar'},h('button',{className:'primary',onClick:nextSeason},season>=cycleEnd?'View cycle review':'Run next season'),h('button',{className:'secondary',onClick:pauseAndAdapt},'Pause and adapt'),h('span',{className:'pill'},`Cycle ${cycle} · season ${season-(cycleEnd-10)+1}/10 · ${season%2?'Winter':'Summer'}`)):null;
 const panelBody=tab==='route'?h(RoutePanel,{route,segs,length,grade,loop,survey,surveyNode,surveyRoute,phase,objectives,editFrom,advertisedGrade,setGrade,selSeg,treat}):tab==='people'?h(PeoplePanel,{owners:knownOwners,hiddenCount:hiddenOwners.length,trust,usedActions,negotiate,commitments,promises}):tab==='build'?h(BuildPanel,{selSeg,segs,treat,updateTreatment,fac,toggleFacility,projectCost,projectedCapital,brief,phase,opened,builtTreat,builtFac,survey}):h(ManagePanel,{phase,season,cycleEnd,reputation,political,visitors,incidents,condition,maintain,log,operatingFund,stats,selSeg,closed,toggleClosure,advertisedGrade,setGrade,grade,pauseAndAdapt});
 const openLabel=overrideRe