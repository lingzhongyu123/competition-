// Curated presentation routes, not backend capability or evaluation results.
export function getGuideTarget(key) {
  const targets = {
    fact: { page: 'sources', sample: 'e47becba', phase: 1, sourceQuery: '' },
    update: { page: 'sources', sample: '6a1eabeb', phase: 0, sourceQuery: '' },
    formation: { page: 'osworld', story: 'formation', storyView: 'sources', storyStep: 0, storyScenario: 'injected' },
    reuse: { page: 'osworld', story: 'reuse', storyView: 'sources', storyStep: 0, storyScenario: 'injected' },
    import: { page: 'import' }
  };
  return targets[key] || null;
}

export function renderDemoGuide() {
  const stories = [
    ['fact', '01', '事实记忆', 'AI 记住的信息从哪里来？', '公开会话 · 人工候选', '从学历专业的用户原话出发，查看人工整理的记忆候选，再定位完整会话。', '点击原文，核对候选是否超出用户说过的内容。', '真实系统的提取与写入记录尚未取得。', '查看事实来源'],
    ['update', '02', '信息更新', '新信息出现后，旧信息去哪了？', '公开会话 · 人工对照', '先看 5 月 25 日陈述的 27:12，再切到 5 月 27 日的 25:50，保留两次来源。', '比较两个陈述时点；陈述时间不等于比赛发生时间。', '这不是 Memory 真实版本日志或更新操作。', '从较早陈述开始'],
    ['formation', '03', '任务经验', '一次操作怎样成为可复用经验？', '官方任务 · 待采集过程', '从工时计算任务出发，讨论输入、动作、修正、结果与经验候选之间的联系。', '先看资料现状，再自行选择标为 MOCK 的四步演示。', '真实执行轨迹、工作簿和核验结果尚未取得。', '查看经验形成故事'],
    ['reuse', '04', '经验复用', '找到旧经验，就能说它有用吗？', '官方任务 · 拟议配对', '比较产品收入汇总与发票次数统计：共用建表思路，Sum 与 Count 的适用条件不同。', '在 MOCK 演示中对比只有注入、看到采用、看到核验及条件不符。', '注入不等于采用，采用不等于通过；真实收益未评测。', '查看经验复用故事']
  ];
  return `<div class="guide-workspace">
    <header class="guide-heading"><div class="eyebrow">MEMORY CONSOLE / 展示导览</div><h1>把记忆的来龙去脉讲清楚</h1><p>沿着四条故事，观察事实如何变化、经验如何形成与复用。</p><div class="guide-boundary">独立展示原型 · 尚未连接 DSH / Memory 服务 · 正式评测未运行</div></header>
    <section class="guide-lanes" aria-label="两类记忆的展示重点"><div><strong>事实记忆 <small>Factual memory</small></strong><p>关于用户和环境的信息：关注原话、作用范围、新旧值与来源。</p></div><div><strong>经验记忆 <small>Experience memory</small></strong><p>关于如何完成任务的知识：关注动作、结果、适用条件与复用证据。</p></div></section>
    <div class="guide-section-heading"><h2>建议按顺序讲解</h2><span>随时从左侧“展示导览”返回</span></div>
    <section class="guide-stories" aria-label="四条展示故事">${stories.map(([id, number, title, question, status, description, action, missing, label]) => `<article class="guide-story"><div class="guide-story-top"><span class="guide-number">${number}</span><span class="guide-status">${status}</span></div><h2>${title}</h2><h3>${question}</h3><p>${description}</p><div class="guide-look"><strong>演示时看什么</strong><p>${action}</p></div><p class="guide-missing">证据边界：${missing}</p><button class="secondary" data-guide="${id}">${label} →</button></article>`).join('')}</section>
    <section class="guide-evidence" aria-labelledby="guide-evidence-title"><h2 id="guide-evidence-title">讲结论之前，先看证据走到哪一步</h2><p>这些是本原型的资料状态，不代表上游插件的全部能力。</p><dl><div><dt>原始来源</dt><dd>已有公开会话与官方任务定义；它们不包含本项目的实际运行结果。</dd></div><div><dt>记忆形成与更新</dt><dd>目前展示人工候选、原文对照或 MOCK；真实写入和版本记录待提供。</dd></div><div><dt>检索 → 注入 → 采用 → 核验</dt><dd>逐项需要独立记录。当前过程演示为 MOCK，缺少证据时不能推进结论。</dd></div><div><dt>效果比较</dt><dd>尚无真实 ON/OFF 对照，不能用合成数字说明收益。</dd></div></dl></section>
    <section class="guide-handoff"><div><h2>拿到经验快照后，可以接着看什么？</h2><p>导入协作者提供的 JSON，查看任务、策略、版本和反馈，沿引用追溯来源。导入仅检查展示结构，文件内容仍标为“来源未核验”。</p><small>没有文件也可查看明确标注的 MOCK 字段示例。导入内容只留在当前页面内存中。</small></div><button class="secondary" data-guide="import">打开经验快照 →</button></section>
  </div>`;
}
