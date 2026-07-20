onst SURF={
 natural:{name:'Natural',rate:0,dur:.68,smooth:1,impact:0},
 gravel:{name:'Compacted gravel',rate:24,dur:1.18,smooth:3,impact:-1},
 sealed:{name:'Sealed',rate:46,dur:1.48,smooth:5,impact:-7},
 boardwalk:{name:'Boardwalk',rate:92,dur:1.30,smooth:4,impact:5},
 stone:{name:'Stone pitching',rate:55,dur:1.42,smooth:2,impact:-1}
};
const WIDTH={narrow:{name:'Narrow 0.8 m',rate:0,value:1},standard:{name:'Standard 1.2 m',rate:8,value:2},wide:{name:'Wide 1.8 m',rate:18,value:3}};
const FACILITY_COST={info:8,parking:42,toilets:58,picnic:16};
const GRADE_ORDER=['Multi-Access','Easy','Moderate','Strenuous','Very Difficult'];

const EVENTS=[
 {id:'viral',title:'The trail goes viral',text:'A drone clip is shared widely. Weekend demand may surge.',when:()=>true,choices:[
  {label:'Welcome the surge',cost:5,rep:8,trust:-4,condition:-4,vis:1.45,political:2},
  {label:'Manage demand',cost:3,rep:3,trust:5,condition:0,vis:1.12,political:1},
  {label:'Do nothing',cost:0,rep:-5,trust:-9,condition:-7,vis:1.35,political:-3}]},
 {id:'storm',title:'Atlantic storm',text:'Heavy rain attacks the weakest surfaces and drops trees in the woodland.',when:c=>c.highRisk||c.woodland,choices:[
  {label:'Close and inspect',cost:10,rep:-2,trust:7,condition:2,vis:.82,political:2,closure:1},
  {label:'Emergency repair',cost:16,rep:2,trust:2,condition:8,vis:.94,political:0},
  {label:'Mark the damage',cost:2,rep:-8,trust:-7,condition:-9,vis:.72,political:-5}]},
 {id:'nesting',title:'A nesting pair arrives',text:'An ecologist confirms a sensitive breeding site close to the route.',when:c=>c.ecology,choices:[
  {label:'Seasonal diversion',cost:6,rep:1,trust:7,condition:2,vis:.94,political:3,closure:1},
  {label:'Screen and monitor',cost:12,rep:2,trust:3,condition:1,vis:.99,political:1},
  {label:'Wait for proof',cost:0,rep:-3,trust:-6,condition:-3,vis:1,political:-4}]},
 {id:'gate',title:'The gate problem',text:'Walkers repeatedly leave a livestock gate open. The farmer threatens to withdraw permission.',when:c=>c.byrne&&!c.hasGates,choices:[
  {label:'Install a self-closing gate',cost:12,rep:2,trust:13,condition:0,vis:1,political:1,asset:'gate'},
  {label:'Weekend ranger',cost:6,rep:1,trust:6,condition:0,vis:1,political:0},
  {label:'Add another sign',cost:1,rep:-2,trust:-8,condition:0,vis:1,political:-2}]},
 {id:'volunteers',title:'Volunteer weekend',text:'Thirty local volunteers offer one weekend of labour. They need a clear, safe task.',when:()=>true,choices:[
  {label:'Clear drains',cost:3,rep:4,trust:7,condition:7,vis:1.06,political:2},
  {label:'Build a picnic pocket',cost:6,rep:5,trust:3,condition:1,vis:1.03,political:1},
  {label:'Send teams uphill',cost:4,rep:-3,trust:-5,condition:2,vis:.98,political:-2}]},
 {id:'review',title:'A one-star review',text:'A visitor says the advertised grade did not match the steepest and roughest section.',when:c=>c.gradeMismatch||c.accessMismatch,choices:[
  {label:'Audit and correct information',cost:4,rep:4,trust:4,condition:0,vis:.96,political:1,fixGrade:true},
  {label:'Upgrade the worst section',cost:18,rep:6,trust:2,condition:15,vis:1.08,political:0},
  {label:'Defend the grade',cost:0,rep:-10,trust:-4,condition:0,vis:1,political:-4}]},
 {id:'cafe',title:'A café opens',text:'A local family opens a small café beside the trailhead and asks to collaborate.',when:c=>c.nearVillage,choices:[
  {label:'Create a partnership',cost:2,rep:7,trust:7,condition:0,vis:1.08,political:3},
  {label:'Seek sponsorship',cost:-8,rep:3,trust:2,condition:0,vis:1.03,political:1},
  {label:'Keep the trail separate',cost:0,rep:0,trust:-2,condition:0,vis:1,political:0}]},
 {id:'parking',title:'The car park overflows',text:'Cars block a farm entrance during a sunny bank-holiday weekend.',when:c=>!c.parking&&c.demand>2600,choices:[
  {label:'Lease an overflow field',cost:14,rep:4,trust:11,condition:0,vis:1.06,political:1},
  {label:'Timed arrival campaign',cost:3,rep:1,trust:4,condition:0,vis:.94,political:0},
  {label:'Call it exceptional',cost:0,rep:-5,trust:-12,condition:0,vis:1.05,political:-5}]},
 {id:'bridge',title:'The bridge inspection',text:'Engineers find movement in the old stone bridge parapet.',when:c=>c.bridge,choices:[
  {label:'Close for masonry repairs',cost:22,rep:-1,trust:6,condition:10,vis:.78,political:2,closure:1},
  {label:'One-way managed crossing',cost:8,rep:1,trust:2,condition:3,vis:.92,political:0},
  {label:'Use warning tape',cost:1,rep:-8,trust:-6,condition:-5,vis:.95,political:-6}]},
 {id:'forestry',title:'Forestry operations begin',text:'Timber extraction needs the same forest road used by visitors.',when:c=>c.coillte,choices:[
  {label:'Activate the agreed diversion',cost:5,rep:2,trust:9,condition:1,vis:.9,political:2},
  {label:'Fund weekend separation',cost:11,rep:3,trust:4,condition:0,vis:.98,political:0},
  {label:'Ask contractors to work around walkers',cost:0,rep:-4,trust:-10,condition:-2,vis:1,political:-3}]},
 {id:'rescue',title:'A rescue callout',text:'An underprepared group becomes benighted near the ridge.',when:c=>c.ridge,choices:[
  {label:'Improve honest pre-trip information',cost:6,rep:3,trust:7,condition:0,vis:.94,political:2,fixGrade:true},
  {label:'Fund seasonal ranger cover',cost:14,rep:5,trust:5,condition:0,vis:1,political:1},
  {label:'Blame the walkers',cost:0,rep:-9,trust:-7,condition:0,vis:.96,political:-5}]},
 {id:'boardwalk',title:'Boardwalk defects emerge',text:'Fixings on a wet section loosen earlier than expected.',when:c=>c.boardwalk,choices:[
  {label:'Replace the affected run',cost:19,rep:2,trust:4,condition:16,vis:.9,political:0},
  {label:'Close and procure properly',cost:8,rep:-1,trust:6,condition:5,vis:.82,political:2,closure:1},
  {label:'Patch the worst boards',cost:3,rep:-3,trust:-2,condition:2,vis:.95,political:-2}]},
 {id:'fire',title:'High fire danger',text:'A dry spring raises wildfire risk on the commonage.',when:c=>c.commonage,choices:[
  {label:'Temporary upland closure',cost:3,rep:-2,trust:10,condition:2,vis:.72,political:3,closure:1},
  {label:'Ranger patrols',cost:10,rep:2,trust:5,condition:0,vis:.95,political:0},
  {label:'Rely on signs',cost:1,rep:-4,trust:-8,condition:-2,vis:1,political:-4}]},
 {id:'landSale',title:'A parcel changes hands',text:'A new owner questions an access agreement they did not negotiate.',when:c=>c.privateOwners>0,choices:[
  {label:'Reopen the agreement early',cost:4,rep:1,trust:8,condition:0,vis:.98,political:1},
  {label:'Offer a managed diversion',cost:9,rep:0,trust:5,condition:1,vis:.9,political:0},
  {label:'Point to the paperwork',cost:0,rep:-3,trust:-9,condition:0,vis:1,political:-2}]},
 {id:'vandalism',title:'Interpretation is vandalised',text:'A panel is damaged and misinformation appears online.',when:c=>c.interpretation,choices:[
  {label:'Repair with local artists',cost:7,rep:6,trust:5,condition:0,vis:1.04,political:2},
  {label:'Replace like for like',cost:5,rep:2,trust:1,condition:0,vis:1,political:0},
  {label:'Remove it',cost:2,rep:-4,trust:-4,condition:0,vis:.98,political:-2}]},
 {id:'insurance',title:'The insurer reviews the trail',text:'Claims data and inspection records are requested before renewal.',when:c=>c.incidents>1||c.inspections===0,choices:[
  {label:'Submit a documented inspection plan',cost:4,rep:2,trust:3,condition:1,vis:1,political:2},
  {label:'Buy enhanced cover',cost:13,rep:0,trust:1,condition:0,vis:1,political:-1},
  {label:'Minimise the incidents',cost:0,rep:-5,trust:-4,condition:0,vis:.96,political:-5}]},
 {id:'flood',title:'The river leaves its banks',text:'A flood deposits silt and debris across the riverside route.',when:c=>c.riparian,choices:[
  {label:'Close, clear and inspect',cost:10,rep:0,trust:6,condition:8,vis:.78,political:2,closure:1},
  {label:'Install temporary matting',cost:7,rep:1,trust:2,condition:4,vis:.9,political:0},
  {label:'Let walkers find a way around',cost:0,rep:-7,trust:-7,condition:-8,vis:.86,political:-5}]},
 {id:'invasive',title:'An invasive plant spreads',text:'A fast-growing invasive species appears beside two route sections.',when:()=>true,choices:[
  {label:'Organise trained removal',cost:8,rep:4,trust:5,condition:3,vis:.98,political:2},
  {label:'Monitor and contain',cost:3,rep:1,trust:2,condition:0,vis:1,political:0},
  {label:'Leave it for next year',cost:0,rep:-4,trust:-3,condition:-5,vis:.97,politi