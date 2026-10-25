const mockLabels = ['来源案例', '适用性判断', '注入与采用', '结果核验'];
const mockFormationLabels = ['任务输入', '动作与修正', '产物检查', '经验候选'];
const mockVariants = { injected: '只有注入记录', adopted: '看到执行采用', checked: '看到产物核验', blocked: '条件不符' };

export function getMockReuseEvidence(step = 0, variant = 'injected') {
  const stage = Number.isInteger(Number(step)) ? Math.min(3, Math.max(0, Number(step))) : 0;
  const scenario = Object.hasOwn(mockVariants, variant) ? variant : 'injected';
  const selected = stage >= 1 && scenario !== 'blocked';
  const injected = stage >= 2 && selected;
  const adopted = injected && ['adopted', 'checked'].includes(scenario);
  const checked = stage >= 3 && adopted && scenario === 'checked';
  return { stage, scenario, selected, injected, adopted, checked, rejected: stage >= 1 && scenario === 'blocked' };
}

function mockFormation(stage) {
  const screens = [
    `<h3>先看这次任务的输入</h3><p>借用“时间值工时 × 数值时薪”这个问题类型。下面的数字、表格和记录均由设计者编写。</p><table><caption>MOCK 输入表 · 自建示例</caption><thead><tr><th>累计工时</th><th>每小时报酬</th><th>目标</th></tr></thead><tbody><tr><td>08:30</td><td>40</td><td>计算金额，保留其他区域</td></tr></tbody></table><div class="mock-evidence">MOCK 来源：mock-run-hours · 输入快照 01<br>实际 OSWorld 文件与 Agent 执行：未取得</div>`,
    `<h3>把失败与修正一起留下</h3><ol class="mock-events"><li><code>mock-step-01</code><strong>检查输入类型</strong><p>累计工时按时间值存储；时薪是普通数值。</p></li><li><code>mock-step-02</code><strong>发现单位不一致</strong><p>预设失败动作：直接相乘，没有把时间值换算成小时。</p></li><li><code>mock-step-03</code><strong>修正计算方式</strong><p>预设修正动作：先转换为 8.5 小时，再按每小时 40 计算。</p></li></ol><div class="mock-evidence">以上是人工编写的 MOCK 事件，未操作任何工作簿。</div>`,
    `<h3>检查产物，才讨论方法是否有效</h3><table><caption>MOCK 产物摘要 · 预设记录</caption><thead><tr><th>检查项</th><th>示例期望</th><th>预设结果</th></tr></thead><tbody><tr><td>金额</td><td>8.5 × 40 = 340</td><td>MOCK 符合</td></tr><tr><td>无关区域</td><td>保持原样</td><td>MOCK 符合</td></tr></tbody></table><p>这里只展示检查记录的页面形式，没有生成或核验真实文件。</p><div class="mock-evidence">MOCK 引用：mock-check-hours → mock-step-03 → mock-run-hours</div>`,
    `<h3>形成带条件的经验候选</h3><dl class="mock-fields"><dt>候选</dt><dd>先核对时间值与业务单位，再计算金额</dd><dt>适用</dt><dd>输入确为表格时间值，另一项是每小时报酬</dd><dt>排除</dt><dd>工时已经是十进制小时；输入是含义不明的文本</dd><dt>来源</dt><dd>mock-run-hours / mock-step-01～03 / mock-check-hours</dd><dt>状态</dt><dd>MOCK 候选，未写入真实经验库</dd></dl><p>这条候选保留失败原因和检查来源，不能作为已证明可泛化的策略。</p>`
  ];
  return screens[stage];
}

function mockReuse(e) {
  if (e.stage === 0) return `<h3>来源是一条自建的透视表案例</h3><p>用产品收入任务启发示例，但下面的案例、动作和检查记录均为 MOCK。</p><dl class="mock-fields"><dt>来源案例</dt><dd>mock-case-pivot-v1</dd><dt>预设动作</dt><dd>识别字段 → 新建工作表 → 按产品汇总收入 → 核对汇总</dd><dt>可借鉴部分</dt><dd>确认行字段、数据字段、聚合方式和输出位置的检查流程</dd><dt>来源记录</dt><dd>mock-run-revenue / mock-step-pivot / mock-check-revenue</dd></dl><div class="mock-evidence">来源任务没有真实运行记录；此案例仅供解释经验结构。</div>`;
  if (e.stage === 1) return `<h3>目标是计数，先判断能否借鉴</h3><table><caption>MOCK 条件检查</caption><thead><tr><th>条件</th><th>来源 → 目标</th><th>判断</th></tr></thead><tbody><tr><td>可操作的表格</td><td>${e.rejected ? 'Calc → 仅一张截图' : 'Calc → Calc'}</td><td>${e.rejected ? '不满足' : '符合'}</td></tr><tr><td>输出位置</td><td>新工作表 → 新工作表</td><td>共同点</td></tr><tr><td>统计方式</td><td>收入求和 → 发票次数</td><td>必须改为计数</td></tr></tbody></table><div class="mock-evidence">${e.rejected ? 'MOCK 决策：排除该候选。只有截图，无法确认可编辑字段和数据区域；不注入、不自动执行。' : 'MOCK 决策：选中流程候选，重新确定 Invoice No. 字段和 Count；不复制来源金额、公式或结果。'}</div><p>“只有截图”是人为增加的反例条件，不是官方发票任务的描述。</p>`;
  if (e.stage === 2) return `<h3>逐项核对注入与动作引用</h3><dl class="mock-fields"><dt>候选选择</dt><dd>${e.selected ? 'MOCK 选中 mock-strategy-pivot-v1' : 'MOCK 排除：条件不满足'}</dd><dt>注入片段</dt><dd>${e.injected ? 'MOCK：先确认数据区域与字段含义，按目标选择聚合方式，在新工作表输出并核验。' : '未注入'}</dd><dt>动作引用</dt><dd>${e.adopted ? 'MOCK mock-action-count 引用 mock-strategy-pivot-v1：将 Invoice No. 作为分组字段并使用计数。' : '无动作引用记录'}</dd><dt>当前结论</dt><dd>${e.rejected ? '候选被拒绝，未执行' : e.adopted ? 'MOCK 记录了采用；产物核验尚未展示' : '仅有 MOCK 注入记录，采用情况未知'}</dd></dl><div class="mock-evidence">动作引用是预设的可观察事件示例，不展示或推断模型隐藏思考。</div>`;
  return `<h3>${e.checked ? '有核验记录，才展示这次结果' : e.rejected ? '拒绝复用也是完整的决策' : '证据停在哪里，结论就停在哪里'}</h3>${e.checked ? `<table><caption>MOCK 发票输入与产物 · 自建三行示例</caption><thead><tr><th>输入</th><th>预设输出</th></tr></thead><tbody><tr><td>A-01、A-01、B-02</td><td>A-01：2 次；B-02：1 次</td></tr></tbody></table><div class="mock-evidence">MOCK mock-check-count：预设计数检查符合；不是 OSWorld evaluator 结果。</div><p>这段示例展示“有采用记录 + 有产物检查”的页面形式。没有真实 Memory ON/OFF 对照，不能据此报告收益。</p>` : `<div class="mock-result">${e.rejected ? 'MOCK 条件不满足 → 未注入 → 未执行 → 无结果' : e.adopted ? 'MOCK 已记录采用；缺少产物检查，结果未知。' : 'MOCK 已注入；采用与结果均未知。'}</div><p>缺少的记录保持未知，不补成通过。</p>`}`;
}

export function renderMockStory(mode = 'formation', step = 0, variant = 'injected') {
  const e = getMockReuseEvidence(step, variant);
  const reuse = mode === 'reuse';
  const labels = reuse ? mockLabels : mockFormationLabels;
  return `<section class="mock-playback" aria-label="MOCK 逐步演示"><div class="mock-warning"><strong>MOCK · 人工预设演示</strong><p>下面的输入、案例、动作、引用和结果均为自建示例；没有执行 OSWorld、调用 Memory 或生成真实文件。</p></div>
  ${reuse ? `<label class="mock-scenario">查看哪种证据情况？<select id="mock-scenario">${Object.entries(mockVariants).map(([id,label])=>`<option value="${id}" ${id===e.scenario?'selected':''}>${label}</option>`).join('')}</select></label>` : ''}
  <div class="mock-steps" role="group" aria-label="选择演示步骤">${labels.map((label,index)=>`<button data-mock-step="${index}" aria-pressed="${e.stage===index}"><small>0${index+1}</small>${label}</button>`).join('')}</div>
  <article class="mock-detail" aria-live="polite"><span class="story-badge caution">MOCK · 第 ${e.stage+1} / 4 步</span>${reuse ? mockReuse(e) : mockFormation(e.stage)}</article>
  <div class="mock-controls"><button data-mock-step="${e.stage-1}" ${e.stage===0?'disabled':''}>← 上一步</button><span>可直接点击上方步骤查看</span><button data-mock-step="${e.stage===3?0:e.stage+1}">${e.stage===3?'从头查看 ↺':'下一步 →'}</button></div></section>`;
}
