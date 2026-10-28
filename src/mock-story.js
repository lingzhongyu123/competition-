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

// Entirely authored MOCK files. No local disk or OSWorld files are read or moved.
function file(name, kind) {
  const drawing = kind === 'image' ? '<rect x="4" y="5" width="24" height="22" rx="2"/><circle cx="12" cy="12" r="2"/><path d="m5 23 7-6 5 4 5-8 6 9"/>' : '<path d="M8 3h12l6 6v20H8zM20 3v7h6M12 16h10m-10 5h10"/>';
  const type = name.endsWith('.png') ? 'PNG 图片' : name.endsWith('.jpg') ? 'JPG 图片' : 'PDF 文档';
  return `<span class="sort-file sort-file--${kind}"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${drawing}</svg><span class="sort-file-name">${name}<small>${type}</small></span></span>`;
}
function folder(name, files, tone = '') {
  return `<div class="sort-folder ${tone}"><div class="sort-folder-label"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 7V5h7l2 3h9v12H3z"/><path d="M3 9h18"/></svg><strong>${name}</strong>${tone==='sort-folder--wrong'?'<small>有文件放错</small>':tone==='sort-folder--right'?'<small>✓ 已归类</small>':''}</div><div class="sort-folder-files">${files.length ? files.join('') : '<span class="sort-empty">等待整理</span>'}</div></div>`;
}
function formationFiles(stage) {
  const cover = file('报告封面.png', 'image');
  const notes = file('会议纪要.pdf', 'document');
  const photo = file('活动照片.jpg', 'image');
  if (stage === 0) return `<div class="sort-scene"><p>请把下载的文件分到“图片”和“文档”。</p><div class="sort-inbox"><span>下载文件夹</span>${cover}${notes}${photo}</div><div class="sort-folders">${folder('图片', [])}${folder('文档', [])}</div></div>`;
  if (stage === 1) return `<div class="sort-scene"><p>按文件名里的“报告”来猜，把封面图片放错了。</p><div class="sort-folders">${folder('图片', [photo])}${folder('文档', [cover, notes], 'sort-folder--wrong')}</div><p class="sort-callout">“报告封面.png”仍是一张图片，应该看文件类型。</p></div>`;
  return `<div class="sort-scene"><p>按文件类型重新整理。</p><div class="sort-folders">${folder('图片', [cover, photo], 'sort-folder--right')}${folder('文档', [notes], 'sort-folder--right')}</div></div>`;
}
function method() {
  return '<div class="sort-method"><span>MOCK 方法候选</span><strong>先看文件类型，再决定放哪里</strong><p>图片放“图片”，文档放“文档”。文件名里的词可能会误导。</p></div>';
}
function reuseFiles(checked) {
  const newImage = file('方案配图.png', 'image');
  const newDocument = file('项目方案.pdf', 'document');
  return `<div class="sort-scene"><div class="sort-inbox"><span>新下载的文件</span>${newImage}${newDocument}</div>${checked ? `<div class="sort-move" aria-hidden="true">↓</div><div class="sort-folders">${folder('图片', [newImage], 'sort-folder--right')}${folder('文档', [newDocument], 'sort-folder--right')}</div>` : '<p class="sort-pending">还没有可核对的整理结果。</p>'}</div>`;
}
function mockFileFormation(stage) {
  const screens = [
    `<h2>把下载文件分成图片和文档</h2>${formationFiles(0)}`,
    `<h2>第一张图放错了</h2>${formationFiles(1)}`,
    `<h2>看文件类型，放回正确位置</h2>${formationFiles(2)}<p class="demo-takeaway">MOCK 预设检查：两张图片、一份文档，位置正确。</p>`,
    `<h2>留下这次学到的办法</h2>${method()}<p class="demo-takeaway">记住分类方法，不记住这几个具体文件名。</p>`
  ];
  return screens[stage];
}
function mockFileReuse(e) {
  if (e.stage === 0) return `<h2>又来一批文件</h2>${reuseFiles(false)}${method()}`;
  if (e.stage === 1) return `<h2>${e.rejected ? '先确认这些到底是什么文件' : '这次还能按类型整理吗？'}</h2><div class="demo-condition"><div><span>收到的内容</span><strong>${e.rejected ? '只有文件截图' : '可读取的文件'}</strong></div><div><span>文件类型</span><strong>${e.rejected ? '无法确认' : '.png 图片、.pdf 文档'}</strong></div></div><p class="demo-decision ${e.rejected ? 'is-blocked' : ''}">${e.rejected ? '× 信息不够，先不整理' : '✓ 条件相同，选中上次的方法'}</p>`;
  if (e.stage === 2) return `<h2>${e.rejected ? '条件不明，停止复用' : e.adopted ? '这次确实按类型整理了' : '方法已送达，还不知道是否用上'}</h2><div class="demo-evidence-chain">${[['找到方法',e.selected],['交给这次任务',e.injected],['实际用上',e.adopted]].map(([label,done])=>`<div class="demo-evidence-node ${done?'is-present':''}"><span>${done?'✓':'—'}</span><strong>${label}</strong><small>${done?'MOCK 有记录':e.rejected?'未发生':'尚无记录'}</small></div>`).join('')}</div><p class="demo-takeaway">${e.rejected ? '没有文件本体，无法确认类型。' : e.adopted ? 'MOCK 预设了按类型归类的动作，结果仍待检查。' : '仅有方法注入记录，不能据此认定已整理。'}</p>`;
  return `<h2>${e.checked ? '新文件也放对了' : e.rejected ? '条件不明，没有执行' : '新文件整理好了吗？'}</h2>${e.checked ? `${reuseFiles(true)}<p class="demo-takeaway">MOCK 预设检查：图片和文档分别归位；不是 OSWorld evaluator 结果。</p>` : `<div class="demo-unknown"><strong>${e.rejected?'未执行':'结果未知'}</strong><dl><dt>交给任务</dt><dd>${e.injected?'MOCK 有记录':'未发生'}</dd><dt>实际用上</dt><dd>${e.adopted?'MOCK 有记录':e.rejected?'未发生':'尚无记录'}</dd><dt>结果检查</dt><dd>尚无记录</dd></dl><p>${e.rejected?'未注入 → 未执行 → 无结果':e.adopted?'缺少产物检查，结果未知。':'已注入；采用与结果均未知。'}</p></div>`}`;
}
export function renderMockStory(mode = 'formation', step = 0, variant = 'injected') {
  const e = getMockReuseEvidence(step, variant), isReuse = mode === 'reuse';
  const labels = isReuse ? ['又来新任务','能不能用','有没有用上','结果怎么样'] : ['收到任务','发现问题','改对结果','记住办法'];
  return `<section class="mock-playback" aria-label="MOCK 逐步演示">
  <div class="mock-steps" role="group" aria-label="选择演示步骤">${labels.map((label,index)=>`<button data-mock-step="${index}" aria-pressed="${e.stage===index}"><small>${index+1}</small>${label}</button>`).join('')}</div>
  <article class="mock-detail audience-task" aria-live="polite"><span class="sr-only">MOCK · 第 ${e.stage+1} / 4 步</span>${isReuse ? mockFileReuse(e) : mockFileFormation(e.stage)}</article>
  <div class="mock-controls"><button data-mock-step="${e.stage-1}" ${e.stage===0?'disabled':''}>← 上一步</button><span>${e.stage+1} / 4</span><button data-mock-step="${e.stage===3?0:e.stage+1}">${e.stage===3?'从头查看 ↺':'下一步 →'}</button></div>
  ${!isReuse&&e.stage===3?'<button class="demo-next-story" data-story="reuse">用这条方法，看看新任务 →</button>':''}
  ${isReuse?`<details class="demo-scenario"><summary>切换证据情况 · ${mockVariants[e.scenario]}</summary><label class="mock-scenario">展示情形<select id="mock-scenario">${Object.entries(mockVariants).map(([id,label])=>`<option value="${id}" ${id===e.scenario?'selected':''}>${label}</option>`).join('')}</select></label></details>`:''}
  <details class="mock-warning"><summary>MOCK · 人工预设演示</summary><p>文件、分类动作和检查均为自建演示；没有读取或移动真实文件，也没有执行 OSWorld 或调用 Memory。</p></details>
  <details class="mock-evidence"><summary>查看来源与说明</summary><p>MOCK 来源：mock-run-file-sort、mock-check-file-sort；复用为自建 mock-run-file-sort-next，候选 mock-strategy-file-type。没有真实经验库写入或 Memory ON/OFF 收益证明。官方 OSWorld 任务资料与本演示是独立案例。</p></details></section>`;
}
