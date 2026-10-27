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
function mockHours(time,hours,result) {
  return `${mockSheet(time,result,'=A2*24*B2')}<p class="sheet-calculation"><span>${time} = ${hours} 小时</span><span>${hours} × 40 = ${result}</span></p>`;
}
function mockMethod() {
  return '<div class="demo-method"><span>方法记录 · MOCK 候选</span><strong>先统一单位，再算金额</strong><p>表格时间值：先 × 24 换成小时。</p><p>已经是十进制小时：直接计算，不再 × 24。</p></div>';
}
function mockFormation(stage) {
  const screens = [
    `<h2>计算这行工时的报酬</h2>${mockSheet('08:30')}<p class="demo-takeaway">A2 是表格时间值，不能直接当小时数。</p>`,
    `<h2>修正 C2：先把时间换成小时</h2><div class="demo-error-line"><span>直接相乘</span><s>14.17</s><strong>单位未换算</strong></div>${mockHours('08:30','8.5','340')}`,
    `<h2>核对金额与修改范围</h2>${mockHours('08:30','8.5','340')}<div class="demo-checks"><span>✓ 金额 340</span><span>✓ 无关区域未改</span><small>均为 MOCK 预设检查</small></div>`,
    `<h2>把这次的修正记下来</h2><div class="demo-learning"><div><span>这次的错误</span><strong>把时间值当小时数</strong></div>${mockArrow()}${mockMethod()}</div><p class="demo-takeaway">只适用于工时与时薪计算；输入含义不明时先确认。</p>`
  ];
  return screens[stage];
}
function mockReuse(e) {
  if (e.stage===0) return `<h2>新工时表，先找上次的方法</h2><div class="demo-learning">${mockMethod()}${mockArrow()}<div class="demo-new-task"><span>下一批工时 · MOCK</span>${mockSheet('09:15')}<p>先判断条件，尚未计算。</p></div></div>`;
  if (e.stage===1) return `<h2>${e.rejected?'条件不同，先停下来':'先核对条件，再选方法'}</h2><div class="demo-condition"><div><span>输入</span><strong>${e.rejected?'只有一张截图':'可编辑的工时表'}</strong></div><div><span>工时类型</span><strong>${e.rejected?'无法确认':'表格时间值'}</strong></div><div><span>报酬单位</span><strong>每小时</strong></div></div><p class="demo-decision ${e.rejected?'is-blocked':''}">${e.rejected?'× 条件不符，不注入、不执行':'✓ 条件相符，选中“先统一单位”'}</p><p class="demo-takeaway">${e.rejected?'截图是自建反例，无法据此确认单元格类型。':'09:15 先换成 9.25 小时，不能直接相乘。'}</p>`;
  if (e.stage===2) return `<h2>${e.rejected?'没有合适条件，就不采用':e.adopted?'执行中采用了这条方法':'找到并注入，还不等于采用'}</h2><div class="demo-evidence-chain">${[['找到方法',e.selected],['注入任务',e.injected],['执行采用',e.adopted]].map(([label,done],i)=>`${i?mockArrow():''}<div class="demo-evidence-node ${done?'is-present':''}"><span>${done?'✓':'—'}</span><strong>${label}</strong><small>${done?'MOCK 有记录':e.rejected?'未发生':'尚无记录'}</small></div>`).join('')}</div><p class="demo-takeaway">${e.rejected?'候选被拒绝，未执行。':e.adopted?'预设动作：9.25 × 40；还未展示产物检查。':'仅有 MOCK 注入记录，采用情况未知。'}</p>`;
  return `<h2>${e.checked?'核对这次的计算结果':e.rejected?'不满足条件，就不复用':'还缺哪些执行记录？'}</h2>${e.checked?`${mockHours('09:15','9.25','370')}<div class="demo-checks"><span>✓ 已采用方法</span><span>✓ 金额 370</span><small>MOCK 预设结果，不是 OSWorld evaluator 结果</small></div>`:`<div class="demo-unknown"><strong>${e.rejected?'未执行':'结果未知'}</strong><dl><dt>方法注入</dt><dd>${e.injected?'MOCK 有记录':'未发生'}</dd><dt>执行采用</dt><dd>${e.adopted?'MOCK 有记录':e.rejected?'未发生':'尚无记录'}</dd><dt>产物核验</dt><dd>尚无记录</dd></dl><p>${e.rejected?'未注入 → 未执行 → 无结果':e.adopted?'缺少产物检查，结果未知。':'已注入；采用与结果均未知。'}</p></div>`}`;
}
export function renderMockStory(mode = 'formation', step = 0, variant = 'injected') {
  const e=getMockReuseEvidence(step,variant),reuse=mode==='reuse';
  const labels=reuse?['找到方法','核对条件','是否采用','检查结果']:['任务输入','错误与修正','检查结果','留下方法'];
  return `<section class="mock-playback" aria-label="MOCK 逐步演示">
  <div class="mock-steps" role="group" aria-label="选择演示步骤">${labels.map((label,index)=>`<button data-mock-step="${index}" aria-pressed="${e.stage===index}"><small>${index+1}</small>${label}</button>`).join('')}</div>
  <article class="mock-detail audience-task" aria-live="polite"><span class="sr-only">MOCK · 第 ${e.stage+1} / 4 步</span>${reuse?mockReuse(e):mockFormation(e.stage)}</article>
  <div class="mock-controls"><button data-mock-step="${e.stage-1}" ${e.stage===0?'disabled':''}>← 上一步</button><span>${e.stage+1} / 4</span><button data-mock-step="${e.stage===3?0:e.stage+1}">${e.stage===3?'从头查看 ↺':'下一步 →'}</button></div>
  ${!reuse&&e.stage===3?'<button class="demo-next-story" data-story="reuse">用这条方法，看看新任务 →</button>':''}
  ${reuse?`<details class="demo-scenario"><summary>切换证据情况 · ${mockVariants[e.scenario]}</summary><label class="mock-scenario">展示情形<select id="mock-scenario">${Object.entries(mockVariants).map(([id,label])=>`<option value="${id}" ${id===e.scenario?'selected':''}>${label}</option>`).join('')}</select></label></details>`:''}
  <details class="mock-warning"><summary>MOCK · 人工预设演示</summary><p>同一工时示例贯穿经验形成与复用。输入、动作和检查均为自建；没有执行 OSWorld、调用 Memory 或生成真实文件。</p></details>
  <details class="mock-evidence"><summary>查看来源与说明</summary><p>MOCK 来源：mock-run-hours、mock-check-hours；复用为自建 mock-run-hours-next，候选 mock-strategy-hours。没有真实经验库写入或 Memory ON/OFF 收益证明。实际 OSWorld 工时任务的失败记录保持独立，见下方任务资料。</p></details></section>`;
}
