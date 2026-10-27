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

// Both parts share the same authored hours example; public OSWorld definitions remain separate.
function mockArrow() { return '<span class="demo-arrow" aria-hidden="true">→</span>'; }
function mockSheet(time,amount=null,formula='') {
  return `<div class="task-sheet"><div class="task-formula"><span>C2</span><small>示意公式</small><code>${formula || '待输入'}</code></div><table><caption class="sr-only">MOCK 工时报酬表，只读示意</caption><colgroup><col class="sheet-index"><col><col><col></colgroup><thead><tr><th scope="col"></th><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th></tr></thead><tbody><tr><th scope="row">1</th><td>累计工时</td><td>每小时报酬</td><td>金额</td></tr><tr><th scope="row">2</th><td class="sheet-time">${time}</td><td>40</td><td class="sheet-result ${amount===null?'is-pending':''}">${amount===null?'待计算':amount}</td></tr></tbody></table></div>`;
}
// A block is one hour; partial blocks retain the same scale.
function workPicture(time, result=null) {
  const [whole,minutes]=time.split(':').map(Number), fraction=minutes/60;
  return `<div class="hours-picture"><p class="hours-request">工作了 <strong>${whole} 小时 ${minutes} 分钟</strong>，每小时 <strong>40 元</strong></p><div class="hours-strip" style="--units:${whole+1}" role="img" aria-label="${whole} 个完整小时，另加 ${minutes} 分钟；一整格代表一小时"><div class="hours-full">${Array.from({length:whole},()=>'<span aria-hidden="true"></span>').join('')}</div><div class="hours-part" style="--fraction:${fraction}" aria-hidden="true"><span></span></div></div><p class="hours-legend">一整格 = 1 小时</p><div class="hours-key"><span>${whole} 个整小时${result===null?'':` · ${whole*40} 元`}</span><span>另加 ${minutes} 分钟${result===null?'':` · ${fraction*40} 元`}</span></div><p class="hours-answer">${result===null?'应得报酬 <strong>待计算</strong>':`合起来 <strong>${result} 元</strong>`}</p></div>`;
}
function calculationDetails(time,hours,result) {
  return `<details class="hours-details"><summary>查看表格与计算方式</summary>${mockSheet(time,result,'=A2*24*B2')}<p>${time} = ${hours} 小时；${hours} × 40 = ${result}</p><p>表格内部用一天的比例存储时间，所以先乘 24，换成小时。</p></details>`;
}
function mockHours(time,hours,result) {
  return workPicture(time,result)+calculationDetails(time,hours,result);
}
function mockMethod() {
  return '<div class="demo-method"><span>记住这次的办法 · MOCK 候选</span><strong>算报酬前，先把工时换成小时</strong><p>半小时也要算进去，不能把时间格式直接相乘。</p><details class="hours-details"><summary>什么时候适用？</summary><p>先统一单位，再算金额。表格时间值先 × 24；已经是十进制小时，不再 × 24。仅用于工时与时薪计算。</p></details></div>';
}
function mockFormation(stage) {
  const screens = [
    `<h2>帮我算算，这次工作应得多少钱</h2>${workPicture('08:30')}<details class="hours-details"><summary>查看输入表格</summary>${mockSheet('08:30')}</details>`,
    `<h2>直接相乘，为什么算少了？</h2><p class="hours-mistake">直接拿表格时间相乘，只算出 <s>14.17 元</s>。先换成小时，再算报酬。</p>${mockHours('08:30','8.5','340')}`,
    `<h2>整小时加上半小时，报酬就对了</h2>${mockHours('08:30','8.5','340')}<div class="demo-checks"><span>✓ 金额正确</span><span>✓ 只改金额，其他内容不动</span><small>MOCK 预设检查</small></div>`,
    `<h2>下次再算报酬，就记得这一步</h2>${mockMethod()}<p class="demo-takeaway">记住的是处理方法，不是“340”这个答案。</p>`
  ];
  return screens[stage];
}
function mockReuse(e) {
  if (e.stage===0) return `<h2>新工时表，先找上次的方法</h2><div class="demo-learning">${mockMethod()}${mockArrow()}<div class="demo-new-task"><span>下一批工时 · MOCK</span>${workPicture('09:15')}<p>换了一批工时，先看看上次的办法能不能用。</p></div></div>`;
  if (e.stage===1) return `<h2>${e.rejected?'条件不同，先停下来':'先核对条件，再选方法'}</h2><div class="demo-condition"><div><span>输入</span><strong>${e.rejected?'只有一张截图':'可编辑的工时表'}</strong></div><div><span>时间怎么记</span><strong>${e.rejected?'无法确认':'时:分，例如 09:15'}</strong></div><div><span>报酬单位</span><strong>每小时</strong></div></div><p class="demo-decision ${e.rejected?'is-blocked':''}">${e.rejected?'× 条件不符，不注入、不执行':'✓ 条件相符，选中“先统一单位”'}</p><p class="demo-takeaway">${e.rejected?'截图是自建反例，无法据此确认单元格类型。':'这次是 9 小时 15 分钟，仍按小时算报酬。'}</p>`;
  if (e.stage===2) return `<h2>${e.rejected?'没有合适条件，就不采用':e.adopted?'这次计算用上了旧方法':'方法已交给任务，但还不知道是否用上'}</h2><div class="demo-evidence-chain">${[['找到方法',e.selected],['交给这次任务',e.injected],['实际用上',e.adopted]].map(([label,done],i)=>`${i?mockArrow():''}<div class="demo-evidence-node ${done?'is-present':''}"><span>${done?'✓':'—'}</span><strong>${label}</strong><small>${done?'MOCK 有记录':e.rejected?'未发生':'尚无记录'}</small></div>`).join('')}</div><p class="demo-takeaway">${e.rejected?'候选被拒绝，未执行。':e.adopted?'预设动作：9.25 × 40；还未展示产物检查。':'只看到方法已送达，不能据此说任务完成。'}</p>`;
  return `<h2>${e.checked?'核对这次的计算结果':e.rejected?'不满足条件，就不复用':'方法送到了，任务做完了吗？'}</h2>${e.checked?`${mockHours('09:15','9.25','370')}<div class="demo-checks"><span>✓ 已采用方法</span><span>✓ 金额 370</span><small>MOCK 预设结果，不是 OSWorld evaluator 结果</small></div>`:`<div class="demo-unknown"><strong>${e.rejected?'未执行':'结果未知'}</strong><dl><dt>交给任务</dt><dd>${e.injected?'MOCK 有记录':'未发生'}</dd><dt>实际用上</dt><dd>${e.adopted?'MOCK 有记录':e.rejected?'未发生':'尚无记录'}</dd><dt>结果检查</dt><dd>尚无记录</dd></dl><p>${e.rejected?'未注入 → 未执行 → 无结果':e.adopted?'缺少产物检查，结果未知。':'已注入；采用与结果均未知。'}</p></div>`}`;
}
export function renderMockStory(mode = 'formation', step = 0, variant = 'injected') {
  const e=getMockReuseEvidence(step,variant),reuse=mode==='reuse';
  const labels=reuse?['又来新任务','能不能用','有没有用上','结果怎么样']:['收到任务','发现问题','改对结果','记住办法'];
  return `<section class="mock-playback" aria-label="MOCK 逐步演示">
  <div class="mock-steps" role="group" aria-label="选择演示步骤">${labels.map((label,index)=>`<button data-mock-step="${index}" aria-pressed="${e.stage===index}"><small>${index+1}</small>${label}</button>`).join('')}</div>
  <article class="mock-detail audience-task" aria-live="polite"><span class="sr-only">MOCK · 第 ${e.stage+1} / 4 步</span>${reuse?mockReuse(e):mockFormation(e.stage)}</article>
  <div class="mock-controls"><button data-mock-step="${e.stage-1}" ${e.stage===0?'disabled':''}>← 上一步</button><span>${e.stage+1} / 4</span><button data-mock-step="${e.stage===3?0:e.stage+1}">${e.stage===3?'从头查看 ↺':'下一步 →'}</button></div>
  ${!reuse&&e.stage===3?'<button class="demo-next-story" data-story="reuse">用这条方法，看看新任务 →</button>':''}
  ${reuse?`<details class="demo-scenario"><summary>切换证据情况 · ${mockVariants[e.scenario]}</summary><label class="mock-scenario">展示情形<select id="mock-scenario">${Object.entries(mockVariants).map(([id,label])=>`<option value="${id}" ${id===e.scenario?'selected':''}>${label}</option>`).join('')}</select></label></details>`:''}
  <details class="mock-warning"><summary>MOCK · 人工预设演示</summary><p>同一工时示例贯穿经验形成与复用。输入、动作和检查均为自建；没有执行 OSWorld、调用 Memory 或生成真实文件。</p></details>
  <details class="mock-evidence"><summary>查看来源与说明</summary><p>MOCK 来源：mock-run-hours、mock-check-hours；复用为自建 mock-run-hours-next，候选 mock-strategy-hours。没有真实经验库写入或 Memory ON/OFF 收益证明。实际 OSWorld 工时任务的失败记录保持独立，见下方任务资料。</p></details></section>`;
}
