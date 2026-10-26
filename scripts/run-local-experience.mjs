// Actual upstream engine execution using self-built inputs. No model API or OSWorld VM.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { Script } from 'node:vm';
import { exportFromExperienceMemory, exportFromFile } from './export-experience-snapshot.mjs';
import { createSnapshotSession } from '../src/snapshot-import.js';
import { renderSnapshotImport } from '../src/snapshot-view.js';

const args=process.argv.slice(2), options={};
for(let i=0;i<args.length;i+=2) {
  if(!['--plugin-root','--output-dir'].includes(args[i])||!args[i+1]||args[i] in options) throw new Error('Use --plugin-root <checkout> --output-dir <new private directory>');
  options[args[i]]=args[i+1];
}
if(!options['--plugin-root']||!options['--output-dir']) throw new Error('Use node --experimental-transform-types scripts/run-local-experience.mjs --plugin-root <checkout> --output-dir <new private directory>');
const upstream=resolve(options['--plugin-root']), directory=resolve(options['--output-dir']);
const revision=execFileSync('git',['-C',upstream,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(revision!=='f840e1cdd5372cf74c7f7a6bce2e797c2f2b401a') throw new Error('This integration runner is pinned to upstream f840e1c; review a new version before running.');
// The upstream dependency is installed in that checkout; the Console stays dependency-free.
const { ExperienceMemory, FileExperienceStore }=await import(pathToFileURL(join(upstream,'src/experience/api.ts')).href);
const patch=await readFile(join(upstream,'cordis.patch.yml'),'utf8');
const block=patch.split('name: dsh-advanced-mem-plugin/experience\n')[1]?.split('\n    - id:')[0]
  ?? patch.replace(/\r\n/g,'\n').split('name: dsh-advanced-mem-plugin/experience\n')[1]?.split('\n    - id:')[0];
if(!block) throw new Error('Cannot locate the upstream experience policy.');
const policy=Object.fromEntries([...block.matchAll(/^        (\w+): ([0-9.]+)\s*$/gm)].map(m=>[m[1],Number(m[2])]));
if(Object.keys(policy).length!==23) throw new Error('Unexpected upstream policy shape; refusing guessed defaults.');
await mkdir(dirname(directory),{recursive:true});
await mkdir(directory,{recursive:false});
const storeDirectory=join(directory,'store');
const store=new FileExperienceStore(storeDirectory), memory=new ExperienceMemory(store,policy);
const runId=randomUUID(),scope='MOCK-input / local-engine-run / '+runId;
const environment={application:'local-csv-integration',input:'MOCK-self-built',runtime:'node-'+process.versions.node};
const digest=s=>createHash('sha256').update(s).digest('hex');

async function execute(name,rows,skill) {
  const startedAt=Date.now(), inputPath=join(directory,name+'-input.csv'),outputPath=join(directory,name+'-output.csv');
  const input='duration,rate\n'+rows.map(r=>r.join(',')).join('\n')+'\n';
  await writeFile(inputPath,input,{flag:'wx'});
  const parsed=(await readFile(inputPath,'utf8')).trim().split('\n').slice(1).map(line=>line.split(','));
  // Applying a recalled procedure is explicit in this deterministic runner, not inferred from recall.
  if(skill&&(!skill.procedure.includes('Convert HH:MM into decimal hours before multiplying by the hourly rate.')||skill.environment.application!==environment.application)) throw new Error('Recalled procedure is not applicable to this local executor.');
  const output='duration,rate,amount\n'+parsed.map(([duration,rate])=>{
    const [hours,minutes]=duration.split(':').map(Number);
    if(minutes<0||minutes>=60) throw new Error('Invalid duration');
    return duration+','+rate+','+((hours+minutes/60)*Number(rate)).toFixed(2);
  }).join('\n')+'\n';
  await writeFile(outputPath,output,{flag:'wx'});
  const actionAt=Date.now();
  const actionText=JSON.stringify({output:name+'-output.csv',sha256:digest(output),appliedSkill:skill?{id:skill.id,version:skill.version}:null,procedure:skill?.procedure??'explicit local calculation, no recalled skill'});
  const after=await readFile(inputPath,'utf8'),result=await readFile(outputPath,'utf8');
  // Independent integer-minute/cents readback, rather than trusting the write call.
  const actual=result.trim().split('\n').slice(1).map(line=>line.split(','));
  const amountsCorrect=actual.length===rows.length&&actual.every((fields,i)=>{
    const [h,m]=rows[i][0].split(':').map(Number), cents=((h*60+m)*Number(rows[i][1])*100)/60;
    return fields[0]===rows[i][0]&&fields[1]===String(rows[i][1])&&Math.round(Number(fields[2])*100)===Math.round(cents);
  });
  if(after!==input||!amountsCorrect) throw new Error('Actual file readback failed. No success episode will be recorded.');
  const checkAt=Date.now(),checkText=JSON.stringify({inputUnchanged:true,amountsCorrect:true,rows:actual.length,amounts:actual.map(r=>r[2]),outputSha256:digest(result)});
  const actionId=name+':write',checkId=name+':check',assessmentId=name+':assessment';
  const episode={id:name,scope,task:'MOCK 自建输入 / 本机实际执行：工时金额 CSV '+name,
    summary:'本机脚本实际写文件并独立回读检查。自建输入；不是 OSWorld，不是模型 Agent。',
    sessionId:runId+'/'+name,startedAt,completedAt:Date.now(),environment,capture:{complete:true,end:'completed'},
    evidence:[actionId,checkId],recalledSkills:skill?[{id:skill.id,version:skill.version}]:[],
    steps:[{action:'Write calculated CSV'+(skill?' using explicitly selected recalled procedure':''),observation:actionText,tool:'local-csv-write',evidence:{id:actionId,seq:1,at:actionAt,callId:name+'-write',role:'action',execution:'completed',complete:true}},
      {action:'Independently read output and check integer-minute/cents arithmetic and unchanged input',observation:checkText,tool:'local-csv-check',evidence:{id:checkId,seq:2,at:checkAt,callId:name+'-check',role:'check',execution:'completed',complete:true}}],
    outcome:{status:'success',source:'tool-evidence',reason:'Local deterministic file checks passed; only this self-built integration task.',evidence:[checkId],
      assessment:{id:assessmentId,assessor:'local-deterministic-file-checker',confidence:1,observedAt:checkAt,requirementsComplete:true,
        criteria:[{requirement:'Output amounts match integer-minute arithmetic and source CSV is unchanged',status:'passed',evidence:[{eventId:checkId,quote:checkText}]}]}}};
  await memory.record(episode);
  await writeFile(join(directory,name+'-receipt.json'),JSON.stringify(episode,null,2),{flag:'wx'});
  return episode;
}

try {
  const first=await execute('local-task-a',[['08:30',40],['06:15',32]]);
  const [skill]=await memory.propose(scope,[{title:'MOCK-input: calculate time-format work hours',
    description:'Manually supplied integration candidate backed by local-task-a file checks; no LLM distillation.',kind:'procedure',
    applicability:['HH:MM duration multiplied by integer hourly rate'],preconditions:['Input has duration and rate columns'],
    procedure:['Convert HH:MM into decimal hours before multiplying by the hourly rate.','Write amount with two decimal places.'],
    cautions:['Do not convert decimal-hour input again.','This candidate was supplied by the integration script.'],
    verification:['Independently read and check amounts using integer minutes; verify input unchanged.'],tags:['MOCK-input','local-integration','manual-candidate'],
    environment,requiredTools:['local-csv-write','local-csv-check'],confidence:0.9,episodeIds:[first.id]}]);
  const hits=await memory.recall({text:'calculate time-format work hours HH:MM duration rate',scopes:[scope],environment,availableTools:['local-csv-write','local-csv-check']});
  const hit=hits.find(h=>h.skill.id===skill.id);
  if(!hit) throw new Error('The actual engine did not recall the proposed skill.');
  const second=await execute('local-task-b',[['07:45',36],['01:30',48]],hit.skill);
  await memory.feedback(scope,{id:'local-feedback-b',skillId:skill.id,episodeId:second.id,verdict:'helpful',
    reason:'The deterministic runner explicitly applied the recalled procedure; final file readback passed. Not a causal ON/OFF comparison.',
    attribution:{skillVersion:hit.skill.version,assessmentId:second.outcome.assessment.id,
      actionEvidence:[{eventId:second.steps[0].evidence.id,quote:second.steps[0].observation}],
      verificationEvidence:[{eventId:second.steps[1].evidence.id,quote:second.steps[1].observation}]}});
  const output=join(directory,'experience-snapshot.json');
  const receipt=await exportFromExperienceMemory(memory,{scope,output});
  await store.close();
  // Re-open the durable store through the independent read-only exporter.
  const persisted=await exportFromFile({store:storeDirectory,scope,output:join(directory,'persisted-snapshot.json')});
  if(persisted.sha256!==receipt.sha256) throw new Error('Durable snapshot differs from engine export.');
  const session=createSnapshotSession();session.importText(await readFile(output,'utf8'));
  const rendered=renderSnapshotImport(session.state);
  if(!rendered.includes('本地导入')||!rendered.includes('MOCK-input')) throw new Error('Console renderer did not show imported source data.');
  const baseHtml=await readFile(new URL('../双击打开演示.html',import.meta.url),'utf8');
  const anchor="readRoute();window.addEventListener('hashchange',()=>{readRoute();render()});render();";
  if(baseHtml.split(anchor).length!==2) throw new Error('Console initialization changed; review local preview assembly.');
  const payload=JSON.stringify(await readFile(output,'utf8')).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const preview=baseHtml.replace(anchor,()=>"readRoute();state.page='import';snapshotSession.importText("+payload+",'本机插件引擎实际执行 / MOCK自建输入');window.addEventListener('hashchange',()=>{readRoute();render()});render();");
  for(const script of preview.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Script(script[1]);
  await writeFile(join(directory,'本机插件运行-查看.html'),preview,{flag:'wx'});
  const report={kind:'actual-upstream-api-run-with-MOCK-input',runId,upstreamRevision:revision,scope,policy,
    candidateSource:'explicit manual proposal, not model distillation',taskExecutor:'deterministic local CSV script, not DSH Agent or OSWorld',
    modelCalls:0,counts:receipt.counts,recallCount:hits.length,persistedExportMatches:true,consoleImportAndRender:'passed (static renderer, not browser UI)',preview:'本机插件运行-查看.html (preloaded local snapshot)',
    checks:{taskA:['340.00','200.00'],taskB:['279.00','72.00']},snapshotSha256:receipt.sha256};
  await writeFile(join(directory,'run-report.json'),JSON.stringify(report,null,2),{flag:'wx'});
  console.log(JSON.stringify({directory,...report},null,2));
} finally { await store.close(); }
