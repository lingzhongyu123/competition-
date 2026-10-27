function safeReplaceState(...args) { if (location.protocol === 'http:' || location.protocol === 'https:') history.replaceState(...args); }
import { days, stages } from './data.js';
import { createMockProvider, filterMemories, kindLabels, statusLabels } from './model.js';
import { publicTasks } from './public-tasks.js';
import { renderSourceBrowser, bindSourceBrowser, getSourceView } from './source-browser.js';
import { renderDemoGuide, bindDemoGuide, getGuideTarget } from './demo-guide.js';
import { renderOsworldStory } from './osworld-story.js';
import { createSnapshotSession } from './snapshot-import.js';
import { renderSnapshotImport, bindSnapshotImport } from './snapshot-view.js';

const provider = createMockProvider();
const snapshotSession = createSnapshotSession(() => { if(state.page==='import') render(); });
const pages = [
  ['guide', '首页演示', 'book'],
  ['sources', '真实样本', 'book'],
  ['import', '经验快照', 'download'],
  ['osworld', '任务故事草图', 'layers'],
  ['memories', '记忆总览', 'grid'], ['graph', '关系图谱', 'graph'], ['timeline', '演化时间线', 'clock'],
  ['traces', '检索与使用', 'search'], ['experience', '任务经验', 'layers'], ['manage', '更新与管理', 'shield'], ['evaluation', '数据与评测', 'chart']
];
const state = { page: 'guide', day: 14, query: '', kind: 'all', status: 'all', selected: 'mem-sort-v2', trace: null, graph: 'fact', theme: 'kylin', sample: 'e47becba', phase: 1, sourceQuery: '', story: 'formation', storyView: 'sources', storyStep: 0, storyScenario: 'injected' };
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const paths = {
  book: '<path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H3V4Zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-2h5V4Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  graph: '<circle cx="5" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8 11 7-5M8 13l7 5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
  search: '<circle cx="10" cy="10" r="6.5"/><path d="m15 15 6 6"/>',
  layers: '<path d="m3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4"/>',
  shield: '<path d="m12 3 8 3v6c0 4-5 8-8 9-3-1-8-5-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  chart: '<path d="M4 3v17h17M8 16v-5m5 5V6m5 10V9"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  link: '<path d="M10 7l2-2a5 5 0 0 1 7 7l-2 2M14 17l-2 2a5 5 0 0 1-7-7l2-2m1 7 8-8"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>'
};
function icon(name, size = 18) { return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`; }
function tag(text, type = '') { return `<span class="tag ${type}">${esc(text)}</span>`; }
function memoryButton(memory, label) { return `<button class="text-button" data-memory="${esc(memory.id)}">${esc(label || memory.title)} ${icon('chevron', 13)}</button>`; }
function navigate(page, day = state.day) {
  state.page = page; state.day = day; state.query = ''; state.kind = 'all'; state.status = 'all';
  if (page === 'traces') state.trace = null;
  safeReplaceState(null, '', page === 'sources' ? `#sources?sample=${state.sample}&phase=${state.phase}` : page === 'osworld' ? storyRoute() : page === 'import' || page === 'guide' ? `#${page}` : `#${page}?day=${day}`); render(); window.scrollTo(0,0);
}
function storyRoute() { return `#osworld?story=${state.story}&view=${state.storyView}&step=${state.storyStep}&scenario=${state.storyScenario}`; }
function readRoute() {
  const [page, query] = location.hash.slice(1).split('?');
  if (pages.some(([id]) => id === page)) state.page = page;
  const params = new URLSearchParams(query);
  if (state.page === 'sources') { const view = getSourceView(params.get('sample') || state.sample, params.get('phase') ?? 1); state.sample = view.sample.id; state.phase = view.phase; }
  if (state.page === 'osworld') { state.story = params.get('story') === 'reuse' ? 'reuse' : 'formation'; state.storyView = params.get('view') === 'mock' ? 'mock' : 'sources'; state.storyStep = Math.min(3, Math.max(0, Number(params.get('step')) || 0)); state.storyStep = Math.floor(state.storyStep); state.storyScenario = ['injected','adopted','checked','blocked'].includes(params.get('scenario')) ? params.get('scenario') : 'injected'; }
  const day = Number(params.get('day'));
  if (days.includes(day)) state.day = day;
}
function empty(title, detail) { return `<div class="empty"><span class="empty-icon">${icon('layers', 28)}</span><h3>${esc(title)}</h3><p>${esc(detail)}</p></div>`; }
function memoryStatus(memory) { return tag(statusLabels[memory.status], memory.status === 'active' ? 'green' : memory.status === 'withdrawn' ? 'amber' : 'muted-tag'); }
function top(snapshot) {
  const active = snapshot.memories.filter(memory => memory.status === 'active');
  const evidenceCount = new Set(snapshot.memories.flatMap(memory => memory.evidenceIds)).size;
  return `<div class="heading"><div><div class="eyebrow">WORKSPACE / 两周记忆演示</div><h1>${pages.find(([id]) => id === state.page)[1]}</h1><p class="subtitle">看见记忆的来源、变化与使用过程。</p></div><button class="secondary" data-export>${icon('download')} 导出当前证据包</button></div>
  <section class="story-card" aria-label="模拟时间回放"><div class="story-copy"><div class="eyebrow">MEMORY IN MOTION <span>合成故事</span></div><h2>${stages[state.day].title}</h2><p>${stages[state.day].text}</p></div><div class="time-controls">${days.map(day => `<button data-day="${day}" class="day ${day === state.day ? 'active' : ''}" aria-pressed="${day === state.day}"><span>DAY ${String(day).padStart(2, '0')}</span><strong>${stages[day].label}</strong></button>`).join('')}</div></section>
  <div class="metrics"><div class="metric"><span class="metric-icon blue-bg">${icon('layers')}</span><div><span>当前有效记忆</span><strong>${active.length}<small> 条 · MOCK</small></strong></div></div><div class="metric"><span class="metric-icon teal-bg">${icon('link')}</span><div><span>来源证据</span><strong>${evidenceCount}<small> 条 · 合成记录</small></strong></div></div><div class="metric"><span class="metric-icon purple-bg">${icon('search')}</span><div><span>检索轨迹</span><strong>${snapshot.traces.length}<small> 条 · MOCK</small></strong></div></div><div class="metric"><span class="metric-icon gray-bg">${icon('chart')}</span><div><span>正式评测</span><strong class="small-value">未运行</strong></div></div></div>`;
}
function renderList(snapshot) {
  const records = filterMemories(snapshot, state);
  return `<section class="panel"><div class="panel-heading"><div><h2>记忆库</h2><p>语义记忆与经验候选，共享可追溯的来源。</p></div>${tag('MOCK', 'amber')}</div><form class="filters" id="filters"><label class="search-field">${icon('search')}<input id="query" type="search" value="${esc(state.query)}" placeholder="搜索记忆、内容或 ID" aria-label="搜索记忆"></label><label><span class="sr-only">记忆类型</span><select id="kind" aria-label="记忆类型"><option value="all">全部类型</option>${Object.entries(kindLabels).map(([key, label]) => `<option value="${key}" ${state.kind === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label><span class="sr-only">有效状态</span><select id="status-filter" aria-label="有效状态">${[['all','全部状态'],...Object.entries(statusLabels)].map(([key,label])=>`<option value="${key}" ${state.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label><button class="secondary" type="submit">筛选</button></form><div class="table-wrap"><table><thead><tr><th>记忆 / 内容</th><th>类型</th><th>状态</th><th>来源</th><th>形成时间</th></tr></thead><tbody>${records.map(memory => `<tr class="${state.selected === memory.id ? 'selected-row' : ''}"><td>${memoryButton(memory)}<div class="cell-sub">${esc(memory.summary)}</div></td><td>${tag(kindLabels[memory.kind], ['case', 'strategy'].includes(memory.kind) ? 'purple' : '')}${['case', 'strategy'].includes(memory.kind) ? '<small class="block">规划示意</small>' : ''}</td><td>${memoryStatus(memory)}</td><td>${memory.evidenceIds.length} 条证据</td><td>Day ${String(memory.day).padStart(2, '0')}</td></tr>`).join('')}</tbody></table></div>${records.length ? `<div class="panel-footer">显示 ${records.length} / ${snapshot.memories.length} 条 · Day ${state.day} 快照 <span>所有记忆均为合成数据</span></div>` : empty('没有匹配的记忆', '调整关键词或筛选条件；较晚形成的记忆不会出现在早期快照。')}</section>`;
}
function renderGraph(snapshot) {
  const experiential = state.graph === 'experience';
  const selectedMemories = snapshot.memories.filter(memory => experiential ? memory.kind === 'strategy' : ['fact','preference','constraint'].includes(memory.kind));
  const sourceIds = new Set(selectedMemories.flatMap(memory => memory.evidenceIds));
  const sources = experiential ? snapshot.memories.filter(memory => memory.kind === 'case') : snapshot.evidence.filter(item => sourceIds.has(item.id));
  const selectedTraces = snapshot.traces.filter(trace => trace.injectedIds.some(id => selectedMemories.some(memory => memory.id === id)));
  const columns = [sources, selectedMemories, selectedTraces];
  const positions = new Map(); const xs = [20, 314, 608];
  columns.forEach((items,column) => items.forEach((item,index) => positions.set(item.id, { x: xs[column], y: 55 + index * 100 })));
  const height = Math.max(290, Math.max(...columns.map(items => items.length)) * 100 + 70);
  const edge = (from, to, dashed = false) => {
    const a = positions.get(from), b = positions.get(to); if (!a || !b) return '';
    return `<path d="M${a.x+222},${a.y+34} C${a.x+266},${a.y+34} ${b.x-42},${b.y+34} ${b.x},${b.y+34}" fill="none" stroke="${dashed ? '#a8b5c5' : '#88add7'}" stroke-width="1.5" ${dashed ? 'stroke-dasharray="5 4"' : ''} marker-end="url(#arrowhead)"/>`;
  };
  const edges = selectedMemories.map(memory => (experiential ? memory.caseIds : memory.evidenceIds).map(id => edge(id,memory.id,memory.status !== 'active')).join('')).join('') + selectedTraces.map(trace => trace.injectedIds.map(id => edge(id,trace.id)).join('')).join('');
  return `<section class="panel"><div class="panel-heading"><div><h2>从证据到使用</h2><p>${experiential ? '案例支持策略候选；策略再连接到新任务的模拟注入。' : '连线分别表示来源关联和模拟注入记录。'}</p></div><div class="segmented"><button data-graph="fact" class="${state.graph==='fact'?'active':''}" aria-pressed="${state.graph==='fact'}">事实与偏好</button><button data-graph="experience" class="${state.graph==='experience'?'active':''}" aria-pressed="${state.graph==='experience'}">经验候选</button></div></div>${selectedMemories.length || sources.length ? `<div class="graph-scroll"><div class="graph-canvas" style="height:${height}px"><div class="graph-label" style="left:20px">01 / ${experiential ? '历史案例' : '原始证据'}</div><div class="graph-label" style="left:314px">02 / ${experiential ? '策略候选' : '显式记忆'}</div><div class="graph-label" style="left:608px">03 / ${experiential ? '新任务注入' : '注入轨迹'}</div><svg width="850" height="${height}" aria-hidden="true"><defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#88add7"/></marker></defs>${edges}</svg>${columns.map((items,col) => items.map(item => { const position = positions.get(item.id); return `<button class="graph-node ${col===1?'memory-node':''} ${item.status && item.status!=='active'?'inactive-node':''} ${state.selected===item.id?'chosen':''}" style="left:${position.x}px;top:${position.y}px" ${col===0?(experiential?`data-memory="${item.id}"`:`data-evidence="${item.id}"`):col===1?`data-memory="${item.id}"`:`data-trace="${item.id}"`}><span>${esc(col===0?(experiential?'案例 · MOCK':'来源 · MOCK'):col===1?kindLabels[item.kind]+' · '+statusLabels[item.status]:'注入 · MOCK')}</span><strong>${esc(item.title)}</strong></button>`; }).join('')).join('')}</div></div><div class="panel-footer">虚线：当前已失效记忆的历史来源 <span>连线不代表策略效果已验证</span></div>` : empty('这个时点尚未形成经验', '切换到 Day 07 查看案例，或到 Day 10 查看策略候选。')}</section>`;
}
function renderTimeline(snapshot) {
  return `<section class="panel"><div class="panel-heading"><div><h2>记忆生命周期</h2><p>仅展示截至 Day ${state.day} 的事件，历史视图不显示未来变更。</p></div>${tag('模拟事件', 'amber')}</div><div class="timeline">${snapshot.events.map(event => `<article class="timeline-item"><div class="timeline-marker">${icon(event.type==='update'?'shield':event.type==='retrieval'?'search':'layers',16)}</div><div class="timeline-time">DAY ${String(event.day).padStart(2,'0')}</div><div><h3>${esc(event.title)}</h3><p>${esc(event.detail)}</p><div class="chip-row">${event.memoryIds.map(id => snapshot.memories.find(memory => memory.id===id)).filter(Boolean).map(memory => memoryButton(memory)).join('')}${event.traceId?`<button class="text-button" data-trace="${event.traceId}">查看轨迹 ${icon('arrow',14)}</button>`:''}</div></div></article>`).join('')}</div></section>`;
}
function renderTrace(snapshot) {
  if(!snapshot.traces.length) return `<section class="panel">${empty('还没有检索记录','切换到 Day 03，查看第一次偏好复用的模拟轨迹。')}</section>`;
  const trace=snapshot.traces.find(item=>item.id===state.trace)||snapshot.traces.at(-1);state.trace=trace.id;
  return `<section class="panel"><div class="panel-heading"><div><h2>检索 ≠ 注入 ≠ 使用</h2><p>历史 trace 不会因后续撤回而被重写。</p></div><label><span class="sr-only">选择检索轨迹</span><select id="trace-select" aria-label="选择检索轨迹">${snapshot.traces.map(item=>`<option value="${item.id}" ${item.id===trace.id?'selected':''}>Day ${item.day} · ${esc(item.title)}</option>`).join('')}</select></label></div><div class="trace-query"><small>任务查询 · ${esc(trace.id)} · MOCK</small><h3>“${esc(trace.query)}”</h3></div><div class="trace-steps"><article><div class="step-label">01 / 检索候选</div>${trace.candidates.map(candidate=>{const memory=snapshot.memories.find(item=>item.id===candidate.id);return `<div class="candidate">${memory?memoryButton(memory):esc(candidate.id)} ${tag(candidate.selected?'选中':'未选中',candidate.selected?'green':'muted-tag')}<p>${esc(candidate.reason)}</p></div>`}).join('')}</article><article><div class="step-label">02 / 模拟注入</div><blockquote>${esc(trace.context)}</blockquote><p class="muted">注入 ${trace.injectedIds.length} 条记忆，来源于合成 trace 的独立字段。</p><div class="chip-row">${trace.injectedIds.map(id=>snapshot.memories.find(memory=>memory.id===id)).filter(Boolean).map(memory=>memoryButton(memory)).join('')}</div></article><article><div class="step-label">03 / 执行与检查</div>${tag(trace.useRecorded?'合成执行记录':'未记录执行',trace.useRecorded?'amber':'muted-tag')}${trace.actions.length?`<ol>${trace.actions.map(action=>`<li>${esc(action)}</li>`).join('')}</ol>`:'<p>没有执行引用，不能推断已被 Agent 使用。</p>'}<p>${esc(trace.result)}</p><small>${esc(trace.runId||'无 run_id')}</small></article></div></section>`;
}
function renderExperience(snapshot) {
  const cases=snapshot.memories.filter(memory=>memory.kind==='case');const strategy=snapshot.memories.find(memory=>memory.kind==='strategy');
  return `<div class="source-entry"><span>已将三条 OSWorld 官方任务编排成“经验形成 → 有条件复用”展示草图。</span><button class="text-button" data-nav="osworld">查看任务故事草图 →</button></div><section class="panel"><div class="panel-heading"><div><h2>案例 → 策略 → 有条件复用</h2><p>案例与策略为规划能力的合成演示；不代表已验证的经验系统。</p></div>${tag('规划 / MOCK','purple')}</div>${cases.length?`<div class="case-grid">${cases.map(memory=>`<article class="case-card"><div class="case-top">${tag(memory.outcome,memory.id==='case-b'?'amber':'green')}<small>Day ${memory.day}</small></div><h3>${memoryButton(memory)}</h3><ol>${memory.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><div class="lesson">${esc(memory.lesson)}</div></article>`).join('')}</div>${strategy?`<div class="strategy-card"><div class="strategy-icon">${icon('layers',26)}</div><div><div class="eyebrow">STRATEGY CANDIDATE</div><h3>${memoryButton(strategy)}</h3><p>${esc(strategy.summary)}</p><div class="condition-grid"><div><strong>适用条件</strong><ul>${strategy.conditions.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div><div><strong>不应直接套用</strong><ul>${strategy.exclusions.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div></div><button class="secondary" data-trace="trace-d10">查看新任务中的注入 ${icon('arrow')}</button><small class="block">只有注入记录；执行与收益尚未记录。</small></div></div>`:empty('策略尚未形成','切换到 Day 10 查看策略候选与适用条件。')}`:empty('尚无任务案例','切换到 Day 07 查看合成的成功与失败案例。')}</section><section class="panel"><div class="panel-heading"><div><h2>OSWorld · 下一步的真实任务候选</h2><p>这些是官方任务定义，与上面的合成案例分开。</p></div>${tag('真实定义 · 未执行')}</div><div class="public-task-grid">${publicTasks.slice(0,4).map(task=>`<article class="public-task"><small>LibreOffice Calc</small><h3>${esc(task.title)}</h3><p>${esc(task.use)}</p><a href="${esc(task.url)}" target="_blank" rel="noreferrer">官方任务 ${icon('link',14)}</a><code>${esc(task.id)}</code></article>`).join('')}</div></section>`;
}
function renderManage(snapshot) {
  const current=state.day===14;
  const old=snapshot.memories.find(memory=>memory.id==='mem-sort-v1');const replacement=snapshot.memories.find(memory=>memory.id==='mem-sort-v2');
  return `<section class="panel"><div class="panel-heading"><div><h2>变化的是排序，保留的是上下文</h2><p>显式用户指令触发的演示更新，不代表自动冲突检测已实现。</p></div>${tag(current?'当前视图':'历史快照',current?'blue':'muted-tag')}</div><div class="update-comparison"><article class="old-rule"><small>${current?'历史规则':'当前时点规则'}</small><h3>${esc(old.title)}</h3>${memoryStatus(old)}<p>${current?'Day 01 ≤ 有效时间 < Day 14':'从 Day 01 生效；此时尚无替代记录'}</p>${memoryButton(old,'查看旧规则来源')}</article><div class="comparison-arrow">${icon('arrow',28)}</div><article class="new-rule"><small>更新后的规则</small><h3>${replacement?esc(replacement.title):'尚未发生'}</h3>${replacement?memoryStatus(replacement):tag('后续信息不可见')}<p>${replacement?'Day 14 起生效；作用域保持一致':'切换到 Day 14 查看显式更新'}</p>${replacement?memoryButton(replacement,'查看变更来源'):''}</article></div><div class="unchanged">${icon('shield')} 未变化：日期格式 YYYY-MM-DD · 仅修改报名数据</div></section><section class="panel"><div class="panel-heading"><div><h2>模拟撤回</h2><p>仅影响本次演示；重置或刷新页面恢复。真实存储与索引未连接。</p></div>${tag('无真实删除能力','amber')}</div>${!current?'<div class="inline-note">历史快照只读。请切换到 Day 14 当前视图进行模拟撤回。</div>':''}<div class="management-list">${snapshot.memories.filter(memory=>['fact','preference','constraint'].includes(memory.kind)).map(memory=>`<div class="management-row"><div>${memoryButton(memory)}<small class="block">${esc(memory.scope)}</small></div>${memoryStatus(memory)}<button class="secondary danger" data-withdraw="${memory.id}" ${!current||memory.status!=='active'?'disabled':''}>模拟撤回</button></div>`).join('')}</div>${snapshot.withdrawals.length?`<div class="audit"><h3>本次演示审计</h3>${snapshot.withdrawals.map(event=>`<p><code>${esc(event.memoryId)}</code> · Day ${event.day} 已模拟撤回</p>`).join('')}<p>界面状态：模拟生效；主存储 / 索引 / 缓存：未执行；备份：未知。</p></div>`:''}</section>`;
}
function renderEvaluation() {
  return `<section class="panel"><div class="panel-heading"><div><h2>公开数据准备情况</h2><p>公开任务定义、合成演示与真实评测结果分别标识。</p></div>${tag('无评测成绩','muted-tag')}</div><div class="dataset-grid"><article class="dataset"><span class="eyebrow">LONGMEMEVAL</span><h3>事实、更新与时间推理</h3>${tag('4 条真实样本可浏览','green')}<p>已取得 500 条 oracle 样本；4 条展示样本保留 7 个原始会话。人工整理已接入控制台，尚无记忆系统运行或评分。</p><button class="secondary" data-nav="sources">打开真实样本</button><div class="chip-row">${['事实提取','偏好','知识更新','时间推理','拒答'].map(text=>tag(text)).join('')}</div><a href="https://github.com/xiaowu0162/LongMemEval" target="_blank" rel="noreferrer">查看官方说明 ${icon('link',14)}</a></article><article class="dataset"><span class="eyebrow">OSWORLD</span><h3>任务经历与结果核验</h3>${tag('5 条任务定义已读取','blue')}<p>4 条执行任务候选、1 条标记 infeasible 的任务；尚未运行 VM、收集轨迹或评分。</p><div class="chip-row">${tag('LibreOffice Calc')}${tag('执行结果未采集')}</div><a href="https://github.com/xlang-ai/OSWorld" target="_blank" rel="noreferrer">查看官方说明 ${icon('link',14)}</a></article></div></section><section class="panel"><div class="panel-heading"><div><h2>对照实验 · 待运行</h2><p>固定任务、模型、环境和预算；结果就绪后再填入。</p></div></div><div class="table-wrap"><table><thead><tr><th>指标</th><th>Memory OFF</th><th>Memory ON</th><th>证据要求</th></tr></thead><tbody>${[['产物满足规则','文件或 evaluator 结果'],['完成时间与步骤','同预算的执行日志'],['人工介入次数','实际追问与接管事件'],['经验迁移效果','留出任务与适用条件']].map(([metric,requirement])=>`<tr><td>${metric}</td><td>未运行</td><td>未运行</td><td>${requirement}</td></tr>`).join('')}</tbody></table></div><div class="panel-footer">无实测样本，不计算准确率或改善比例。</div></section><section class="panel"><div class="panel-heading"><div><h2>从样本到页面的接入约定</h2><p>开发与讨论所需的最小数据，不要求一次接齐所有接口。</p></div></div><div class="handoff"><div><strong>01 / 原始记录</strong><p>memory_id、session_id、事件时间、原始文本与证据定位。</p></div><div><strong>02 / 使用轨迹</strong><p>trace_id、候选、选中、实际注入、run_id 和执行引用。</p></div><div><strong>03 / 结果边界</strong><p>answer、has_answer 与 evaluator 参考值仅留在评测端。</p></div></div></section>`;
}
function renderInspector(snapshot) {
  const record=snapshot.memories.find(memory=>memory.id===state.selected);
  if(!record)return `<div class="inspector-empty">${empty('选择一条记忆','点击列表或图谱中的记忆，查看其状态和原始证据。')}</div>`;
  const evidence=snapshot.evidence.filter(item=>record.evidenceIds.includes(item.id));
  return `<div class="inspector-heading"><div class="eyebrow">MEMORY INSPECTOR</div><span class="inspector-mark">${icon('layers')}</span></div><div class="inspector-title">${tag(kindLabels[record.kind],record.kind==='strategy'?'purple':'blue')}<h2>${esc(record.title)}</h2><p>${esc(record.summary)}</p></div><div class="inspector-tags">${memoryStatus(record)} ${tag('MOCK','amber')}</div><dl class="metadata"><dt>记忆 ID</dt><dd><code>${esc(record.id)}</code></dd><dt>所在层</dt><dd>${esc(record.layer)}</dd><dt>适用范围</dt><dd>${esc(record.scope)}</dd><dt>有效区间</dt><dd>Day ${record.validFrom} → ${record.validTo!==null?'Day '+record.validTo+'（不含）':'未设结束'}</dd><dt>版本 / 置信度</dt><dd>v${record.version} / 未提供</dd></dl><div class="section-divider"></div><h3 class="inspector-section-title">来源证据 <span>${evidence.length}</span></h3>${evidence.map(item=>`<details class="evidence" id="evidence-${item.id}" ${evidence.length===1?'open':''}><summary><span>Day ${item.day} · ${esc(item.title)}</span>${icon('chevron',14)}</summary><div><span class="role">${esc(item.role)}</span><blockquote>${esc(item.text)}</blockquote><small>${esc(item.origin)}</small><code>${esc(item.session)} / ${esc(item.id)}</code></div></details>`).join('')}${record.supersedes?`<div class="related"><small>取代的旧记忆</small><button class="text-button" data-memory="${record.supersedes}">报名时间倒序 ${icon('arrow',14)}</button></div>`:''}${record.caseIds?`<div class="related"><small>策略来源案例</small>${record.caseIds.map(id=>snapshot.memories.find(memory=>memory.id===id)).filter(Boolean).map(memory=>memoryButton(memory)).join('')}</div>`:''}<div class="inspector-foot">在 Day ${state.day} 的历史快照中查看。<br>来源是合成数据，尚未连接真实后端。</div>`;
}
function notify(text) { $('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('#toast').classList.remove('show'),3500); }
function withdrawDialog(id,snapshot) {
  const memory=snapshot.memories.find(item=>item.id===id);if(!memory)return;
  const dialog=$('#confirm-dialog');dialog.innerHTML=`<form method="dialog"><div class="eyebrow">MOCK ACTION</div><h2>模拟撤回「${esc(memory.title)}」</h2><p>撤回范围仅为这条记忆。其他偏好与历史 trace 保留。</p><div class="inline-note">本次操作只修改内存中的演示状态；不会执行真实删除、更新索引或清理备份。</div><div class="dialog-actions"><button class="secondary" value="cancel">取消</button><button class="primary" value="confirm">确认模拟撤回</button></div></form>`;
  dialog.onclose=()=>{if(dialog.returnValue==='confirm'){try{provider.withdraw(id,state.day);render();notify('已模拟撤回；真实存储与索引未执行任何操作。')}catch(error){notify(error.message)}}};dialog.showModal();
}
function bind(snapshot) {
  document.querySelectorAll('[data-guide]').forEach(button => button.onclick = () => {
    const target = getGuideTarget(button.dataset.guide);
    if (!target) return;
    Object.assign(state, target);
    navigate(target.page);
    $('#main').focus({ preventScroll: true });
  });
  bindSnapshotImport($('#app'), snapshotSession, render);
  document.querySelectorAll('[data-nav]').forEach(button=>button.onclick=()=>navigate(button.dataset.nav));
  document.querySelectorAll('[data-day]').forEach(button=>button.onclick=()=>navigate(state.page,Number(button.dataset.day)));
  document.querySelectorAll('[data-memory]').forEach(button=>button.onclick=()=>{state.selected=button.dataset.memory;render();if(innerWidth<1200)$('#inspector').scrollIntoView({behavior:'smooth',block:'start'})});
  document.querySelectorAll('[data-trace]').forEach(button=>button.onclick=()=>{state.page='traces';state.trace=button.dataset.trace;safeReplaceState(null,'',`#traces?day=${state.day}`);render()});
  document.querySelectorAll('[data-evidence]').forEach(button=>button.onclick=()=>{const memory=snapshot.memories.find(item=>item.evidenceIds.includes(button.dataset.evidence));if(memory){state.selected=memory.id;render();const detail=$('#evidence-'+button.dataset.evidence);if(detail){detail.open=true;detail.scrollIntoView({behavior:'smooth',block:'nearest'})}}});
  document.querySelectorAll('[data-graph]').forEach(button=>button.onclick=()=>{state.graph=button.dataset.graph;render()});
  document.querySelectorAll('[data-withdraw]').forEach(button=>button.onclick=()=>withdrawDialog(button.dataset.withdraw,snapshot));
  if($('#filters'))$('#filters').onsubmit=event=>{event.preventDefault();state.query=$('#query').value;state.kind=$('#kind').value;state.status=$('#status-filter').value;render();$('#query').focus()};
  for(const select of ['#kind','#status-filter'])if($(select))$(select).onchange=()=>$('#filters').requestSubmit();
  if($('#trace-select'))$('#trace-select').onchange=event=>{state.trace=event.target.value;render()};
  if ($('[data-export]')) $('[data-export]').onclick=()=>{const blob=new Blob([JSON.stringify(provider.exportSnapshot(state.day),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`memory-console-MOCK-day-${state.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('已导出当前模拟快照，文件内包含 MOCK 来源声明。')};
  if ($('#header-search')) $('#header-search').onsubmit=event=>{event.preventDefault();const query=$('#global-query').value;if(state.page==='sources'){state.sourceQuery=query;render()}else{navigate('memories');state.query=query;render()}$('#global-query').focus()};
  bindSourceBrowser($('#app'), change => { Object.assign(state, change); safeReplaceState(null, '', `#sources?sample=${state.sample}&phase=${state.phase}`); render(); });
  const updateStory = (change, focus) => { Object.assign(state, change); safeReplaceState(null, '', storyRoute()); render(); document.querySelector(focus)?.focus({ preventScroll: true }); };
  document.querySelectorAll('[data-story]').forEach(button => button.onclick = () => updateStory({ story: button.dataset.story, storyStep: 0 }, '[data-story="'+button.dataset.story+'"]'));
  document.querySelectorAll('[data-story-view]').forEach(button => button.onclick = () => updateStory({ storyView: button.dataset.storyView, storyStep: 0 }, '[data-story-view="'+button.dataset.storyView+'"]'));
  document.querySelectorAll('[data-mock-step]').forEach(button => button.onclick = () => { const step = Math.min(3, Math.max(0, Number(button.dataset.mockStep))); updateStory({ storyStep: step }, '.mock-steps [data-mock-step="'+step+'"]'); });
  if ($('#mock-scenario')) $('#mock-scenario').onchange = event => updateStory({ storyScenario: event.target.value }, '#mock-scenario');
  $('button[data-theme]').onclick=()=>{state.theme=state.theme==='kylin'?'neutral':'kylin';render()};
  $('[data-reset]').onclick=()=>{provider.reset();snapshotSession.clear();state.selected='mem-sort-v1';state.trace=null;state.story='formation';state.storyView='sources';state.storyStep=0;state.storyScenario='injected';navigate('memories',1);notify('已恢复初始数据，从 Day 01 开始演示。')};
  if ($('[data-tour]')) $('[data-tour]').onclick=()=>{state.selected='mem-sort-v1';navigate('timeline',1);notify('按 Day 01 → 03 → 07 → 10 → 14 回放；从事件打开记忆与轨迹。')};
}
let disposeGuide = null;
function render() {
  if (disposeGuide) { disposeGuide(); disposeGuide = null; }
  if (state.page === 'guide') {
    document.body.dataset.mode = 'guide';
    document.body.dataset.theme = state.theme;
    $('#app').innerHTML = renderDemoGuide();
    disposeGuide = bindDemoGuide($('#app'), target => {
      if (!target) return;
      Object.assign(state, target);
      navigate(target.page);
      $('#main').focus({ preventScroll: true });
    });
    return;
  }
  const guideMode=state.page==='guide';
  const sourceMode=state.page==='sources';
  const storyMode=state.page==='osworld';
  const importMode=state.page==='import';
  const publicMode=sourceMode||storyMode||importMode||guideMode;
  const snapshot=provider.getSnapshot(state.day);
  document.body.dataset.mode=guideMode?'guide':importMode?'import':sourceMode?'sources':storyMode?'osworld':'mock';
  if(!snapshot.memories.some(memory=>memory.id===state.selected))state.selected=snapshot.memories[0]?.id;
  document.body.dataset.theme=state.theme;
  const renderers={memories:renderList,graph:renderGraph,timeline:renderTimeline,traces:renderTrace,experience:renderExperience,manage:renderManage,evaluation:renderEvaluation};
  $('#app').innerHTML=`<aside class="sidebar"><div class="brand"><span class="brand-symbol">◈</span><div><strong>记忆工作区</strong><small>MEMORY CONSOLE</small></div></div><div class="workspace-switch"><span class="workspace-avatar">M</span><div><strong>${guideMode?'展示与讨论':importMode?'本地只读工作区':publicMode?'公开资料工作区':'演示工作区'}</strong><small>${guideMode?'四条故事 · 证据边界':importMode?'经验快照 · 未连接服务':sourceMode?'LongMemEval · 人工整理':storyMode?'OSWorld · 展示草图':'本地合成数据'}</small></div><span class="status-dot"></span></div><div class="nav-heading">工作台</div><nav aria-label="主导航">${pages.map(([id,label,symbol])=>`<button class="nav-item ${state.page===id?'active':''}" data-nav="${id}" aria-label="${label}" title="${label}" ${state.page===id?'aria-current="page"':''}>${icon(symbol)}<span>${label}</span>${id==='experience'?'<span class="nav-mini">规划</span>':''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="connection"><span class="offline-dot"></span><div><strong>独立原型</strong><small>DSH / Memory 尚未接入</small></div></div><button data-reset>${icon('clock',16)} 重置演示</button><p>麒麟概念视觉 · 非官方规范</p></div></aside><div class="shell"><header class="topbar"><div class="app-identity">${icon('layers',20)}<span>记忆控制台</span></div>${storyMode||importMode||guideMode?'':`<form class="header-search" id="header-search">${icon('search',15)}<input id="global-query" type="search" value="${esc(sourceMode?state.sourceQuery:state.query)}" placeholder="${sourceMode?'搜索样本':'搜索记忆'}" aria-label="${sourceMode?'搜索真实样本':'全局搜索记忆'}"></form>`}<div class="topbar-actions">${guideMode?tag('展示导览 · 未连接服务','blue'):importMode?tag(snapshotSession.state.status==='ready'?(snapshotSession.state.mode==='mock'?'MOCK 字段示例':'本地导入 · 未核验'):'本地只读','amber'):sourceMode?tag('公开样本','blue'):storyMode?tag(state.storyView==='mock'?'MOCK 预设演示':'官方定义 · 草图',state.storyView==='mock'?'amber':'blue'):tag('MOCK 数据模式','amber')}<button class="icon-button" data-theme aria-label="${state.theme==='kylin'?'切换为中性主题':'切换为麒麟概念主题'}" title="切换主题">${icon('sun')}</button><span class="avatar">演</span></div></header><div class="content-shell ${publicMode?'source-layout':''}"><main id="main" tabindex="-1">${guideMode?renderDemoGuide():importMode?renderSnapshotImport(snapshotSession.state):sourceMode?renderSourceBrowser(state.sample,state.phase,state.sourceQuery):storyMode?renderOsworldStory(state.story,{demo:state.storyView==='mock',step:state.storyStep,scenario:state.storyScenario}):`${state.page==='memories'?'<div class="source-entry"><span>已有真实公开样本，可查看原始会话与信息更新。</span><button class="text-button" data-nav="sources">查看真实样本 →</button></div>':''}${top(snapshot)}${renderers[state.page](snapshot)}<div class="demo-footer"><span>模拟时间轴 · 无实测成绩 · 刷新恢复状态</span><button class="text-button" data-tour>从头演示 ${icon('arrow',14)}</button></div>`}</main>${publicMode?'':`<aside class="inspector" id="inspector" aria-label="记忆详情">${renderInspector(snapshot)}</aside>`}</div></div>`;
  bind(snapshot);
}
readRoute();window.addEventListener('hashchange',()=>{readRoute();render()});render();
