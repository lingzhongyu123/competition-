import { publicTasks } from './public-tasks.js';
import { renderMockStory } from './mock-story.js';

const escapeStory = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
const tasks = Object.fromEntries(publicTasks.map(task => [task.id, task]));
const workHours = tasks['357ef137-7eeb-4c80-a3bb-0951f26a8aff'];
const productRevenue = tasks['51719eea-10bc-4246-a428-ac7c433dd4b3'];
const invoiceCount = tasks['1954cced-e748-45c4-9c26-9855b97fbc5e'];
const taskLink = task => `<a href="${escapeStory(task.url)}" target="_blank" rel="noreferrer">查看 OSWorld 任务原文 ↗</a>`;
const taskDefinition = (task, label) => `<section class="story-task"><div class="story-task-heading"><span>${label}</span><span class="story-badge real">官方任务定义</span></div><h3>${escapeStory(task.title)}</h3><p>${escapeStory(task.instruction)}</p><div class="story-task-meta"><code>${escapeStory(task.id)}</code>${taskLink(task)}</div></section>`;
const missing = (title, detail) => `<section class="story-missing"><span class="story-badge missing">未采集</span><h3>${title}</h3><p>${detail}</p></section>`;

function formation() {
  return `<div class="story-scenario"><div><span class="story-kicker">故事 03 / 任务经验</span><h2>一次任务，怎样留下可复查的经验？</h2><p>先展示真实任务要求，再为将来的运行证据预留位置。经验候选是展示假设，需等执行与检查记录来支持。</p></div><span class="story-badge design">展示草图</span></div>
  <div class="story-grid two">${taskDefinition(workHours, '输入 / LibreOffice Calc')}
  <section class="story-hypothesis"><span class="story-badge manual">设计者提出的候选</span><h3>先核对类型与单位</h3><p>这道任务同时提到“累计工时是时间值、时薪是数字，直接相乘不正确”。可讨论的经验候选是先识别数据类型和业务单位，再决定怎样计算。</p><div class="story-condition"><strong>适用条件</strong><span>时间格式的工时 × 数值时薪</span></div><div class="story-condition"><strong>不能直接外推</strong><span>不同表格布局、地区设置或输出格式还需重新检查</span></div></section></div>
  <div class="story-flow" aria-label="任务经验形成所需证据"><div><span>01</span><strong>任务要求</strong><small>官方定义已取得</small></div><div><span>02</span><strong>动作与状态</strong><small>运行轨迹未采集</small></div><div><span>03</span><strong>产物与检查</strong><small>尚未运行</small></div><div><span>04</span><strong>经验确认</strong><small>候选待验证</small></div></div>
  <div class="story-grid two">${missing('执行过程', '需要 run_id、任务环境、截图或状态、动作顺序、失败与修正步骤；任务定义中的 trajectory 路径不是本系统的运行记录。')}${missing('产物与结果', '需要产物位置、检查规则与实际结果，才能判断任务是否成功，以及哪一步值得保留为经验。')}</div>
  <div class="story-note">页面当前只提出经验候选。未观察到本项目的 Agent 执行，也未生成真实 Case。</div>`;
}

function reuse() {
  return `<div class="story-scenario"><div><span class="story-kicker">故事 04 / 经验复用</span><h2>相似任务，哪些步骤能借鉴？</h2><p>把两道真实 OSWorld 任务并排：同为 Calc 新工作表透视表，统计口径却从收入求和变成发票次数。两题之间的迁移关系由本方案提出。</p></div><span class="story-badge design">拟议配对</span></div>
  <div class="story-grid two">${taskDefinition(productRevenue, '来源任务 / 产品收入')}${taskDefinition(invoiceCount, '目标任务 / 发票次数')}</div>
  <div class="story-compare"><section><span class="story-badge manual">可讨论的共同点</span><h3>建立新工作表与透视表</h3><p>两个任务都要求在 Sheet2 生成透视表；这部分流程可以作为经验候选的适用条件。</p></section><section><span class="story-badge caution">必须重新判断</span><h3>求和 ≠ 计数</h3><p>来源任务按产品汇总收入，目标任务统计每个 Invoice No. 出现次数。不能把收入字段或求和方式照搬。</p></section></div>
  <div class="story-flow" aria-label="经验复用所需证据"><div><span>01</span><strong>检索候选</strong><small>未采集</small></div><div><span>02</span><strong>实际注入</strong><small>未采集</small></div><div><span>03</span><strong>执行采用</strong><small>未采集</small></div><div><span>04</span><strong>产物核验</strong><small>未运行</small></div></div>
  <div class="story-grid two">${missing('来源经验尚未形成', '产品收入任务没有本项目的执行与检查记录，因此这里没有真实 Case 或 Strategy，也没有可核实的复用候选 ID。')}${missing('目标任务尚未执行', '需要记录候选、选中、注入、可观察的动作引用和产物检查。即使将来有注入，也不能据此断言 Agent 已采用或产生收益。')}</div>
  <div class="story-note">这组配对用于讨论迁移边界。尚无 Memory ON/OFF 对照，也不计算改进比例。</div>`;
}

export function renderOsworldStory(mode = 'formation', options = {}) {
  const selected = mode === 'reuse' ? 'reuse' : 'formation';
  return `<div class="story-workspace"><div class="story-heading"><div><div class="eyebrow">OSWORLD / 展示草图</div><h1>任务经验与复用</h1><p>${options.demo ? "受公开任务类型启发的自建演示。所有运行与结果均为人工预设。" : "真实公开任务定义 + 明确标注的设计假设。执行和评测记录等待接入。"}</p></div><span class="story-badge ${options.demo ? "caution" : "real"}">${options.demo ? "MOCK · 自建示例" : "3 条官方任务"}</span></div>
  <div class="story-tabs" role="group" aria-label="选择展示故事"><button data-story="formation" aria-pressed="${selected === 'formation'}">01 任务经验如何形成</button><button data-story="reuse" aria-pressed="${selected === 'reuse'}">02 经验怎样复用</button></div>
  <div class="story-view-switch" role="group" aria-label="资料与演示模式"><button data-story-view="sources" aria-pressed="${!options.demo}">资料现状</button><button data-story-view="mock" aria-pressed="${!!options.demo}">MOCK 逐步演示</button><span>模拟记录仅用于说明页面和证据关系</span></div>
  ${options.demo ? renderMockStory(selected, options.step, options.scenario) : selected === 'formation' ? formation() : reuse()}
  <details class="story-data"><summary>与张旭讨论：需要提供哪些记录？</summary><div><strong>任务与执行</strong><p>task_id、环境版本、run_id、每步时间/动作/状态、产物、实际检查结果。</p><strong>经验形成</strong><p>case_id、来源 run_id、结论、失败原因、适用条件与版本；没有真实运行时只保留人工候选。</p><strong>复用验证</strong><p>候选及排序、选中理由、实际注入片段、目标 run_id、动作引用与结果；不能从最后的成功反推使用了哪条经验。</p></div></details>
  <footer class="story-footer">资料边界：OSWorld 任务要求已核实；迁移配对和经验假设由本方案提出；Memory/DSH 尚未接入，Agent 未运行。</footer></div>`;
}
