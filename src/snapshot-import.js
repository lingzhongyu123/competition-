// Read-only display contract, pinned to upstream f840e1c / ExperienceSnapshot v1.
// This validates display structure, not the upstream engine's evidence or policy gates.
export const snapshotImportLimit = 5 * 1024 * 1024;
const snapshotEnums = {
  status: ['candidate','active','quarantined','deprecated','expired','retracted'],
  outcome: ['success','failure','partial','unknown'],
  source: ['verified','tool-evidence','user','model','unknown'],
};
const snapshotFail = path => { throw new Error(`${path} 的字段类型或取值不符合快照 v1 展示契约。`); };
const snapText = (v,p) => { if (typeof v !== 'string' || !v.trim()) snapshotFail(p); };
const snapNumber = (v,p) => { if (!Number.isSafeInteger(v) || v < 0) snapshotFail(p); };
const snapConfidence = (v,p) => { if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 1) snapshotFail(p); };
const snapObject = (v,p) => { if (!v || typeof v !== 'object' || Array.isArray(v)) snapshotFail(p); };
const snapArray = (v,p) => { if (!Array.isArray(v) || v.length > 500) snapshotFail(p); };
const snapStrings = (v,p) => { snapArray(v,p); v.forEach((x,i)=>snapText(x,`${p}[${i}]`)); };
const snapEnum = (v,p,values) => { if (!values.includes(v)) snapshotFail(p); };
const snapBoolean = (v,p) => { if (typeof v !== 'boolean') snapshotFail(p); };
const snapOptional = (v,key,p,check) => { if (v[key] !== undefined) check(v[key],`${p}.${key}`); };
const snapEnvironment = (v,p) => { snapObject(v,p); Object.entries(v).forEach(([k,x])=>{snapText(k,p);snapText(x,p);}); };

function checkSnapshotTree(value, depth=0, budget={nodes:0}) {
  if (++budget.nodes > 100000 || depth > 24) throw new Error('JSON 层级或字段数量超出本地展示限制。');
  if (typeof value === 'string' && value.length > 50000) throw new Error('单字段超过 50000 字符，请提供精简快照。');
  if (value && typeof value === 'object') for (const [key,child] of Object.entries(value)) {
    if (['__proto__','constructor','prototype'].includes(key)) throw new Error('JSON 包含不支持的属性名称。');
    checkSnapshotTree(child,depth+1,budget);
  }
}
function checkSnapshotQuote(v,p) { snapObject(v,p); snapText(v.eventId,p+'.eventId'); snapText(v.quote,p+'.quote'); }
function checkSnapshotAssessment(v,p) {
  snapObject(v,p); for (const k of ['id','assessor']) snapText(v[k],p+'.'+k);
  snapConfidence(v.confidence,p+'.confidence'); snapNumber(v.observedAt,p+'.observedAt'); snapBoolean(v.requirementsComplete,p+'.requirementsComplete');
  snapArray(v.criteria,p+'.criteria');
  v.criteria.forEach((c,i)=>{const q=`${p}.criteria[${i}]`;snapObject(c,q);snapText(c.requirement,q+'.requirement');snapEnum(c.status,q+'.status',['passed','failed','unknown']);snapArray(c.evidence,q+'.evidence');c.evidence.forEach((x,j)=>checkSnapshotQuote(x,`${q}.evidence[${j}]`));});
}
function checkSnapshotEpisode(v,p,scope) {
  snapObject(v,p); for(const k of ['id','scope','task','summary']) snapText(v[k],p+'.'+k);
  if(v.scope!==scope) throw new Error(p+' 的 scope 与快照不一致。');
  for(const k of ['evidence','learnedBy']) snapStrings(v[k],p+'.'+k);
  for(const k of ['startedAt','completedAt']) snapNumber(v[k],p+'.'+k);
  if(v.completedAt<v.startedAt) throw new Error(p+' 的结束时间早于开始时间。');
  snapEnvironment(v.environment,p+'.environment'); snapObject(v.outcome,p+'.outcome');
  snapEnum(v.outcome.status,p+'.outcome.status',snapshotEnums.outcome);snapEnum(v.outcome.source,p+'.outcome.source',snapshotEnums.source);
  snapText(v.outcome.reason,p+'.outcome.reason');snapStrings(v.outcome.evidence,p+'.outcome.evidence');snapOptional(v.outcome,'assessment',p+'.outcome',checkSnapshotAssessment);
  snapArray(v.steps,p+'.steps');v.steps.forEach((s,i)=>{
    const q=`${p}.steps[${i}]`;snapObject(s,q);snapText(s.action,q+'.action');snapText(s.observation,q+'.observation');snapOptional(s,'tool',q,snapText);
    if(s.evidence!==undefined){const e=s.evidence;snapObject(e,q+'.evidence');for(const k of ['id','callId'])snapText(e[k],q+'.evidence.'+k);for(const k of ['seq','at'])snapNumber(e[k],q+'.evidence.'+k);snapBoolean(e.complete,q+'.evidence.complete');snapEnum(e.role,q+'.evidence.role',['action','check','readback','unknown']);snapEnum(e.execution,q+'.evidence.execution',['completed','failed','incomplete']);snapOptional(e,'target',q+'.evidence',snapText);}
  });
  for(const k of ['sessionId','derivedFrom'])snapOptional(v,k,p,snapText);
  if(v.capture!==undefined){snapObject(v.capture,p+'.capture');snapBoolean(v.capture.complete,p+'.capture.complete');snapEnum(v.capture.end,p+'.capture.end',['completed','incomplete']);}
  if(v.recalledSkills!==undefined){snapArray(v.recalledSkills,p+'.recalledSkills');v.recalledSkills.forEach((r,i)=>{const q=`${p}.recalledSkills[${i}]`;snapObject(r,q);snapText(r.id,q+'.id');snapNumber(r.version,q+'.version');if(!r.version)snapshotFail(q+'.version');});}
  if(v.taskContext!==undefined){const c=v.taskContext,q=p+'.taskContext';snapObject(c,q);snapText(c.id,q+'.id');snapText(c.latestRequest,q+'.latestRequest');snapNumber(c.revision,q+'.revision');snapEnum(c.kind,q+'.kind',['initial','continuation','increment']);snapOptional(c,'previousEpisodeId',q,snapText);snapOptional(c,'priorCaptureIncomplete',q,snapBoolean);snapOptional(c,'currentEvidenceStartSeq',q,snapNumber);}
}
function checkSnapshotSkill(v,p,scope) {
  snapObject(v,p);for(const k of ['id','scope','title','description'])snapText(v[k],p+'.'+k);
  if(v.scope!==scope)throw new Error(p+' 的 scope 与快照不一致。');
  snapNumber(v.version,p+'.version');if(!v.version)snapshotFail(p+'.version');snapEnum(v.status,p+'.status',snapshotEnums.status);snapEnum(v.kind,p+'.kind',['procedure','pitfall']);
  for(const k of ['confidence','proposedConfidence'])snapConfidence(v[k],p+'.'+k);
  for(const k of ['applicability','preconditions','procedure','cautions','verification','tags','requiredTools','episodeIds','conflictsWith'])snapStrings(v[k],p+'.'+k);
  for(const k of ['createdAt','updatedAt','expiresAt'])snapNumber(v[k],p+'.'+k);
  if(v.lastValidatedAt!==null)snapNumber(v.lastValidatedAt,p+'.lastValidatedAt');
  for(const k of ['supersedes','supersededBy'])snapOptional(v,k,p,snapText);
  snapEnvironment(v.environment,p+'.environment');
}

export function parseSnapshotImport(text) {
  if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>snapshotImportLimit)throw new Error('快照超过 5 MiB，请按作用域精简后导入。');
  let snapshot;try{snapshot=JSON.parse(text.replace(/^\uFEFF/,''));}catch{throw new Error('无法解析 JSON，请检查文件格式。');}
  checkSnapshotTree(snapshot);snapObject(snapshot,'snapshot');
  if(snapshot.schemaVersion!==1)throw new Error('仅支持 ExperienceSnapshot schemaVersion: 1。');
  snapText(snapshot.scope,'scope');
  for(const k of ['episodes','skills','revisions','feedback']){snapArray(snapshot[k],k);const ids=new Set();snapshot[k].forEach((v,i)=>{snapObject(v,`${k}[${i}]`);snapText(v.id,`${k}[${i}].id`);if(ids.has(v.id))throw new Error(k+' 存在重复 ID。');ids.add(v.id);});}
  snapshot.episodes.forEach((v,i)=>checkSnapshotEpisode(v,`episodes[${i}]`,snapshot.scope));
  snapshot.skills.forEach((v,i)=>checkSnapshotSkill(v,`skills[${i}]`,snapshot.scope));
  snapshot.revisions.forEach((v,i)=>{const p=`revisions[${i}]`;snapText(v.skillId,p+'.skillId');snapText(v.reason,p+'.reason');snapNumber(v.version,p+'.version');snapNumber(v.at,p+'.at');checkSnapshotSkill(v.skill,p+'.skill',snapshot.scope);if(v.skill.id!==v.skillId||v.skill.version!==v.version)throw new Error(p+' 的策略 ID/版本与内嵌策略不一致。');});
  snapshot.feedback.forEach((v,i)=>{const p=`feedback[${i}]`;for(const k of ['skillId','episodeId','reason'])snapText(v[k],p+'.'+k);snapNumber(v.createdAt,p+'.createdAt');snapEnum(v.verdict,p+'.verdict',['helpful','harmful','irrelevant']);if(v.attribution!==undefined){const a=v.attribution;snapObject(a,p+'.attribution');snapNumber(a.skillVersion,p+'.attribution.skillVersion');if(!a.skillVersion)snapshotFail(p+'.attribution.skillVersion');snapText(a.assessmentId,p+'.attribution.assessmentId');for(const k of ['actionEvidence','verificationEvidence']){snapArray(a[k],p+'.attribution.'+k);a[k].forEach((q,j)=>checkSnapshotQuote(q,`${p}.attribution.${k}[${j}]`));}}});
  const warnings=new Set();const episodes=new Set(snapshot.episodes.map(x=>x.id)),skills=new Set(snapshot.skills.map(x=>x.id));
  const missing=(set,id,label)=>{if(id&&!set.has(id))warnings.add(label+'存在未包含在此快照中的引用，详情显示为缺失。');};
  for(const s of [...snapshot.skills,...snapshot.revisions.map(r=>r.skill)]){s.episodeIds.forEach(id=>missing(episodes,id,'策略来源'));for(const id of [...s.conflictsWith,s.supersedes,s.supersededBy])missing(skills,id,'策略关系');}
  for(const e of snapshot.episodes){missing(episodes,e.derivedFrom,'任务前驱');missing(episodes,e.taskContext?.previousEpisodeId,'任务前驱');if(e.outcome.source==='tool-evidence'&&!e.outcome.assessment)warnings.add('部分 tool-evidence 结果缺少 assessment，仅展示文件声明，未核验。');if(e.outcome.evidence.some(id=>!e.evidence.includes(id)))warnings.add('部分结果引用未列入任务 evidence，来源不完整。');}
  for(const f of snapshot.feedback){missing(episodes,f.episodeId,'反馈任务');missing(skills,f.skillId,'反馈策略');}
  return {snapshot,warnings:[...warnings]};
}

// Only this explicit button creates synthetic data. Imports never inherit its provenance.
export function createSnapshotMock() {
  const t=Date.UTC(2026,0,1),scope='MOCK / 演示作用域';
  const episode={id:'mock-episode-hours',scope,task:'MOCK：按工时计算金额',summary:'人工编写的单位检查示例，未执行工作簿。',steps:[{action:'MOCK：将累计工时换算为小时',observation:'MOCK：08:30 → 8.5 小时，8.5 × 40 = 340。'}],outcome:{status:'unknown',source:'unknown',reason:'没有真实执行或检查，结果保持未知。',evidence:[]},environment:{application:'MOCK Calc'},evidence:['mock-input-hours'],startedAt:t,completedAt:t+1000,learnedBy:[]};
  const skill={id:'mock-skill-hours',scope,version:1,status:'candidate',title:'MOCK：先核对时间单位',description:'用来说明插件快照字段的自建候选。',kind:'procedure',applicability:['时间值工时 × 时薪'],preconditions:['确认输入确为时间值'],procedure:['确认单位','转换为小时后计算'],cautions:['十进制小时不能重复转换'],verification:['回读金额和无关区域'],tags:['MOCK'],environment:{application:'MOCK Calc'},requiredTools:[],confidence:0.4,proposedConfidence:0.4,episodeIds:[episode.id],conflictsWith:[],createdAt:t,updatedAt:t,lastValidatedAt:null,expiresAt:t+86400000};
  return {schemaVersion:1,scope,episodes:[episode],skills:[skill],revisions:[{id:'mock-revision-1',skillId:skill.id,version:1,at:t,reason:'MOCK 初始候选',skill:{...skill}}],feedback:[]};
}

export function createSnapshotSession(changed=()=>{}) {
  let generation=0;
  const state={data:null,status:'empty',error:'',label:'',mode:'imported',kind:'skills',selected:0,page:0,query:''};
  const clear=()=>{generation++;Object.assign(state,{data:null,status:'empty',error:'',label:'',mode:'imported',kind:'skills',selected:0,page:0,query:''});changed();};
  const begin=()=>{clear();state.status='loading';changed();return generation;};
  const finish=(text,label,mode,token)=>{if(token!==generation)return;try{state.data=parseSnapshotImport(text);Object.assign(state,{status:'ready',label,mode});}catch(error){state.status='error';state.error=error.message;}changed();};
  return {state,clear,
    importText(text,label='粘贴的 JSON',mode='imported'){const token=begin();finish(text,label,mode,token);},
    async importFile(file){const token=begin();if(file.size>snapshotImportLimit){state.status='error';state.error='快照超过 5 MiB，请按作用域精简后导入。';changed();return;}try{const text=await file.text();finish(text,file.name,'imported',token);}catch{if(token===generation){state.status='error';state.error='文件读取失败，请重新选择。';changed();}}},
  };
}
