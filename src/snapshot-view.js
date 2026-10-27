import { createSnapshotMock } from './snapshot-import.js';

const snapEscape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const snapKinds={skills:'经验策略',episodes:'来源任务',revisions:'版本记录',feedback:'反馈记录'};
const snapTime=value=>value===null?'未记录':Number.isFinite(new Date(value).getTime())?new Date(value).toISOString():`时间超出可显示范围（${value}）`;
const snapList=items=>items.length?`<ul>${items.map(v=>`<li>${snapEscape(v)}</li>`).join('')}</ul>`:'<p class="snap-muted">未记录</p>';
const snapField=(name,value)=>`<dt>${snapEscape(name)}</dt><dd>${snapEscape(value??'未记录')}</dd>`;
function snapshotLink(snapshot,kind,id) {
  const index=snapshot[kind].findIndex(x=>x.id===id);
  return index<0?`<span class="snap-missing">${snapEscape(id)} · 来源缺失</span>`:`<button class="text-button" data-snapshot-kind="${kind}" data-snapshot-index="${index}">${snapEscape(id)}</button>`;
}
function snapshotQuotes(quotes) { return quotes.length?quotes.map(q=>`<div class="snap-quote"><code>${snapEscape(q.eventId)}</code><pre>${snapEscape(q.quote)}</pre></div>`).join(''):'<p class="snap-muted">未记录引用原文</p>'; }
function snapshotSkillAll(snapshot,s) {
  return `<h3>${snapEscape(s.title)}</h3><p>${snapEscape(s.description)}</p><dl>${snapField('ID / 版本',s.id+' / v'+s.version)}${snapField('文件中的状态',s.status)}${snapField('类型',s.kind)}${snapField('置信度 / 提议值',s.confidence+' / '+s.proposedConfidence+'（非成功率）')}${snapField('创建 / 更新',snapTime(s.createdAt)+' / '+snapTime(s.updatedAt))}${snapField('最近验证 / 到期',snapTime(s.lastValidatedAt)+' / '+snapTime(s.expiresAt))}</dl><p class="snap-muted">状态按文件原值展示，不重新判定是否过期或满足宿主策略。</p>
  ${[['适用情境',s.applicability],['前置条件',s.preconditions],['流程',s.procedure],['注意事项',s.cautions],['验证方法',s.verification],['所需工具',s.requiredTools]].map(([k,v])=>`<h4>${k}</h4>${snapList(v)}`).join('')}
  <h4>来源任务</h4>${s.episodeIds.length?s.episodeIds.map(id=>snapshotLink(snapshot,'episodes',id)).join(' '):'<p>未记录</p>'}
  <h4>策略关系</h4><p>替代：${s.supersedes?snapshotLink(snapshot,'skills',s.supersedes):'未记录'}；被替代：${s.supersededBy?snapshotLink(snapshot,'skills',s.supersededBy):'未记录'}</p>${s.conflictsWith.map(id=>snapshotLink(snapshot,'skills',id)).join(' ')}
  <h4>环境 / 标签</h4><pre>${snapEscape(JSON.stringify({environment:s.environment,tags:s.tags},null,2))}</pre>
  <h4>该策略的版本记录</h4>${snapshot.revisions.map((r,i)=>r.skillId===s.id?`<button class="text-button" data-snapshot-kind="revisions" data-snapshot-index="${i}">v${r.version} · ${snapEscape(r.reason)}</button>`:'').join('')||'<p>未记录</p>'}`;
}
function snapshotSkill(snapshot,s) {
  return `<h3>${snapEscape(s.title)}</h3><p>${snapEscape(s.description)}</p><p class="snap-status-line">文件中的状态：${snapEscape(s.status)} · 来源未核验</p>
  <h4>怎样使用</h4>${snapList(s.procedure)}<h4>适用条件</h4>${snapList(s.applicability)}
  <h4>来源任务</h4>${s.episodeIds.length?s.episodeIds.map(id=>snapshotLink(snapshot,'episodes',id)).join(' '):'<p>未记录</p>'}
  <details><summary>字段、版本与验证依据</summary>${snapshotSkillAll(snapshot,s)}</details>`;
}
function snapshotEpisodeAll(snapshot,e) {
  return `<h3>${snapEscape(e.task)}</h3><p>${snapEscape(e.summary)}</p><dl>${snapField('任务 ID',e.id)}${snapField('会话',e.sessionId)}${snapField('开始 / 完成',snapTime(e.startedAt)+' / '+snapTime(e.completedAt))}${snapField('文件声明的结果',e.outcome.status)}${snapField('结果来源',e.outcome.source)}${snapField('声明理由',e.outcome.reason)}${snapField('采集完整性',e.capture?`${e.capture.complete} / ${e.capture.end}`:'未记录')}</dl>
  <p class="snap-notice">这里展示文件声明，Console 未核验执行环境、证据原件或评估规则。</p>
  <h4>前驱与任务修订</h4><p>${e.derivedFrom?snapshotLink(snapshot,'episodes',e.derivedFrom):'derivedFrom 未记录'}</p>${e.taskContext?`<p>修订 ${e.taskContext.revision} · ${snapEscape(e.taskContext.kind)}</p><p>${snapEscape(e.taskContext.latestRequest)}</p><p>${e.taskContext.previousEpisodeId?snapshotLink(snapshot,'episodes',e.taskContext.previousEpisodeId):'无前驱任务'}</p>`:'<p>未记录 taskContext</p>'}
  <h4>文件中的动作与观察</h4>${e.steps.map((s,i)=>`<details><summary>步骤 ${i+1} · ${snapEscape(s.action)}</summary><p>工具：${snapEscape(s.tool||'未记录')}</p><pre>${snapEscape(s.observation)}</pre>${s.evidence?`<pre>${snapEscape(JSON.stringify(s.evidence,null,2))}</pre>`:'<p>未记录执行元数据</p>'}</details>`).join('')||'<p>未记录动作</p>'}
  <h4>结果引用 ID</h4>${snapList(e.outcome.evidence)}<p class="snap-muted">ID 是引用，不代表已取得证据原件。</p>
  ${e.outcome.assessment?`<h4>文件中的结果评估</h4><dl>${snapField('评估者',e.outcome.assessment.assessor)}${snapField('评估 ID',e.outcome.assessment.id)}${snapField('观察时间',snapTime(e.outcome.assessment.observedAt))}${snapField('完整覆盖声明',e.outcome.assessment.requirementsComplete)}</dl>${e.outcome.assessment.criteria.map(c=>`<details><summary>${snapEscape(c.status)} · ${snapEscape(c.requirement)}</summary>${snapshotQuotes(c.evidence)}</details>`).join('')}`:'<p>未记录 assessment</p>'}
  <h4>召回记录（不等于注入或采用）</h4>${e.recalledSkills?.length?e.recalledSkills.map(r=>`<p>${snapshotLink(snapshot,'skills',r.id)} · 当时版本 v${r.version}（链接查看当前条目）</p>`).join(''):'<p>未记录</p>'}
  <h4>来源 ID / 环境 / 提炼器</h4><pre>${snapEscape(JSON.stringify({evidence:e.evidence,environment:e.environment,learnedBy:e.learnedBy},null,2))}</pre>`;
}
function snapshotEpisode(snapshot,e) {
  return `<h3>${snapEscape(e.task)}</h3><p>${snapEscape(e.summary)}</p><p class="snap-status-line">文件声明的结果：${snapEscape(e.outcome.status)} · 未独立核验</p>
  <h4>动作过程</h4>${e.steps.map((s,i)=>`<details><summary>${i+1}. ${snapEscape(s.action)}</summary><pre>${snapEscape(s.observation)}</pre></details>`).join('')||'<p>未记录动作</p>'}
  <details><summary>字段、引用与结果依据</summary>${snapshotEpisodeAll(snapshot,e)}</details>`;
}
function snapshotDetail(snapshot,kind,item) {
  if(kind==='skills')return snapshotSkill(snapshot,item);
  if(kind==='episodes')return snapshotEpisode(snapshot,item);
  if(kind==='revisions')return `<h3>版本 v${item.version} · ${snapEscape(item.reason)}</h3><p>${snapEscape(snapTime(item.at))}</p><p>当前策略：${snapshotLink(snapshot,'skills',item.skillId)}</p><hr>${snapshotSkill(snapshot,item.skill)}`;
  return `<h3>文件中的反馈：${snapEscape(item.verdict)}</h3><p>${snapEscape(item.reason)}</p><p>策略：${snapshotLink(snapshot,'skills',item.skillId)}</p><p>任务：${snapshotLink(snapshot,'episodes',item.episodeId)}</p><p>${snapEscape(snapTime(item.createdAt))}</p>${item.attribution?`<dl>${snapField('引用策略版本',item.attribution.skillVersion)}${snapField('评估 ID',item.attribution.assessmentId)}</dl><h4>动作引用</h4>${snapshotQuotes(item.attribution.actionEvidence)}<h4>验证引用</h4>${snapshotQuotes(item.attribution.verificationEvidence)}`:'<p>未记录 attribution；不能从反馈标签推断实际采用。</p>'}<p class="snap-muted">归因与反馈是文件中的记录，Console 未独立确认。</p>`;
}
function snapshotRows(state) {
  const rows=state.data.snapshot[state.kind].map((item,index)=>({item,index}));
  const q=state.query.trim().toLocaleLowerCase();
  return q?rows.filter(({item})=>[item.id,item.title,item.task,item.reason,item.skillId].some(x=>x?.toLocaleLowerCase().includes(q))):rows;
}
export function renderSnapshotImport(state) {
  const ready=state.status==='ready',data=state.data?.snapshot;
  let content='';
  if(ready){
    const rows=snapshotRows(state),pages=Math.max(1,Math.ceil(rows.length/25));const page=Math.min(state.page,pages-1);
    const selected=rows.find(r=>r.index===state.selected)?.item;
    content=`<section class="snap-provenance"><strong>${state.mode==='mock'?'MOCK · 自建字段示例':'本地导入 · 来源未核验'}</strong><details><summary>文件与校验范围</summary><p>${snapEscape(state.label)} · schemaVersion 1 · ${snapEscape(data.scope)}</p><p>仅校验展示所需字段结构；不等于上游完整校验、来源认证或运行验证。</p></details></section>
    ${state.data.warnings.length?`<aside class="snap-notice"><strong>引用或证据不完整</strong>${snapList(state.data.warnings)}</aside>`:''}
    <div class="snap-tabs" role="group" aria-label="快照记录类型">${Object.entries(snapKinds).map(([k,label])=>`<button data-snapshot-tab="${k}" aria-pressed="${state.kind===k}">${label} ${data[k].length}</button>`).join('')}</div>
    <form id="snapshot-search"><label for="snapshot-query">搜索当前类型</label><input id="snapshot-query" type="search" value="${snapEscape(state.query)}" placeholder="标题、任务或 ID"><button>搜索</button></form>
    <div class="snap-layout"><section aria-label="快照记录列表"><div class="snap-list">${rows.slice(page*25,(page+1)*25).map(({item,index})=>`<button data-snapshot-kind="${state.kind}" data-snapshot-index="${index}" aria-pressed="${selected===item}"><strong>${snapEscape(item.title||item.task||item.reason||item.id)}</strong><small>${snapEscape(item.id)}</small><span>${snapEscape(item.status||item.outcome?.status||item.verdict||'v'+item.version)}</span></button>`).join('')||`<p class="snap-empty">${state.query?'没有匹配记录。':'此快照没有这类记录。'}</p>`}</div><div class="snap-paging"><button data-snapshot-page="${page-1}" ${page===0?'disabled':''}>上一页</button><span>${page+1} / ${pages} · ${rows.length} 条</span><button data-snapshot-page="${page+1}" ${page===pages-1?'disabled':''}>下一页</button></div></section>
    <article class="snap-detail" id="snapshot-detail" tabindex="-1" aria-label="快照记录详情">${selected?snapshotDetail(data,state.kind,selected):'<p>请选择左侧记录查看详情。</p>'}</article></div>`;
  }
  return `<div class="snapshot-workspace"><div class="story-heading"><div><div class="eyebrow">MEMORY / 本地只读</div><h1>经验快照</h1><p>查看插件导出的任务、策略与来源，保留它们各自的证据状态。</p></div><span class="story-badge caution">${ready?(state.mode==='mock'?'MOCK 示例':'导入 · 未核验'):'等待导入'}</span></div>
  <details class="snap-upload" ${ready?'':'open'}><summary>${ready?'更换文件或导入方式':'导入经验快照'}</summary><label for="snapshot-file">选择 ExperienceSnapshot JSON（最多 5 MiB）</label><input id="snapshot-file" type="file" accept=".json,application/json"><div class="snap-actions"><button data-snapshot-example>查看 MOCK 字段示例</button><button data-snapshot-clear>清空本页数据</button></div><p>文件只在当前页面内存中读取，不上传、不保存到浏览器存储；刷新或清空后移除。尚未连接 DSH。</p>
  <details><summary>或粘贴 JSON</summary><form id="snapshot-paste"><label for="snapshot-json">完整快照 JSON</label><textarea id="snapshot-json" rows="5" spellcheck="false" placeholder="粘贴 schemaVersion、scope、episodes、skills、revisions、feedback"></textarea><button>导入粘贴内容</button></form></details></details>
  ${state.status==='loading'?'<p role="status">正在读取快照…</p>':state.status==='error'?`<div class="snap-error" role="alert"><strong>导入失败</strong><p>${snapEscape(state.error)}</p><p>未加载任何记录，也不会回退为 MOCK。请修正后重新导入。</p></div>`:!ready?'':''}${content}</div>`;
}

export function bindSnapshotImport(root,session,render) {
  const state=session.state,find=s=>root.querySelector(s);if(!find('#snapshot-file'))return;
  const refresh=()=>{render();};
  find('#snapshot-file').onchange=e=>{const file=e.target.files?.[0];if(file)session.importFile(file);};
  find('[data-snapshot-clear]').onclick=()=>session.clear();
  find('[data-snapshot-example]').onclick=()=>session.importText(JSON.stringify(createSnapshotMock()),'内置 MOCK 字段示例','mock');
  find('#snapshot-paste').onsubmit=e=>{e.preventDefault();session.importText(find('#snapshot-json').value);};
  root.querySelectorAll('[data-snapshot-tab]').forEach(b=>b.onclick=()=>{Object.assign(state,{kind:b.dataset.snapshotTab,page:0,selected:0,query:''});refresh();});
  root.querySelectorAll('[data-snapshot-kind]').forEach(b=>b.onclick=()=>{const kind=b.dataset.snapshotKind,index=Number(b.dataset.snapshotIndex);if(kind!==state.kind)Object.assign(state,{query:'',page:Math.floor(index/25)});Object.assign(state,{kind,selected:index});refresh();const detail=find('#snapshot-detail');detail?.focus({preventScroll:true});detail?.scrollIntoView({block:'start'});});
  root.querySelectorAll('[data-snapshot-page]').forEach(b=>b.onclick=()=>{state.page=Number(b.dataset.snapshotPage);refresh();});
  if(find('#snapshot-search'))find('#snapshot-search').onsubmit=e=>{e.preventDefault();state.query=find('#snapshot-query').value;state.page=0;state.selected=-1;refresh();find('#snapshot-query').focus();};
}
