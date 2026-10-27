import { evidence, memories } from './data.js';

export function getGuideTarget(key) {
  return {
    fact: { page: 'sources', sample: 'e47becba', phase: 1, sourceQuery: '' },
    update: { page: 'sources', sample: '6a1eabeb', phase: 0, sourceQuery: '' },
    formation: { page: 'osworld', story: 'formation', storyView: 'sources', storyStep: 0, storyScenario: 'injected' },
    reuse: { page: 'osworld', story: 'reuse', storyView: 'sources', storyStep: 0, storyScenario: 'injected' },
    sorting: { page: 'manage', day: 14 },
    import: { page: 'import' }
  }[key] || null;
}

// Reuse the existing, explicitly MOCK Chinese story and its evidence IDs.
export function getGuideFrame(step) {
  const index = Math.min(2, Math.max(0, Math.floor(Number(step) || 0)));
  const first = evidence.find(item => item.id === 'ev-d1');
  const changed = evidence.find(item => item.id === 'ev-d14');
  const oldRule = memories.find(item => item.id === 'mem-sort-v1');
  const newRule = memories.find(item => item.id === 'mem-sort-v2');
  const source = index === 0 ? first : changed;
  return {
    step: index, value: index === 2 ? newRule.title : oldRule.title,
    incoming: index > 0, history: index === 2, provenance: 'mock',
    date: index === 0 ? '第一次要求' : '后来的新要求',
    origin: index === 2 ? '来源 · 后来的新要求' : '来源 · 第一次要求',
    quote: source.text, evidenceId: source.id,
    caption: ['记下报名表的默认排序方式。', '用户明确要求改用成绩排序，其他要求不变。', '新规则生效，旧规则保留在历史中。'][index],
    translation: index === 0 ? first.text.split('。')[0] + '。' : changed.text
  };
}
export function renderDemoGuide() {
  return `<div class="motion-home">
    <header class="motion-header"><a href="#guide" class="motion-brand"><span>◈</span> Memory Console</a><details class="motion-menu"><summary>更多内容</summary><nav aria-label="更多内容"><button data-guide="fact">事实来源</button><button data-guide="update">公开更新样本</button><button data-guide="formation">经验形成</button><button data-guide="reuse">经验复用</button><hr><button data-guide="import">导入经验快照</button><button data-nav="memories">MOCK 数据检查</button></nav></details></header>
    <main id="main" class="motion-main" tabindex="-1"><div class="motion-heading"><span class="motion-kicker">记忆 · 信息更新</span><h1>记住变化，也留下来处。</h1><p>一条新的陈述，怎样改变已有记忆？</p></div>
    <section class="memory-stage" data-step="0" aria-label="信息更新可视化">
      <div class="stage-label"><span class="stage-dot"></span>MOCK · 中文指令更新演示</div>
      <div class="memory-scene"><article class="statement"><div class="scene-meta"><span>用户陈述</span><time data-date></time></div><p data-translation></p><details class="statement-source"><summary>来源原文</summary><blockquote data-quote></blockquote><small>自建中文故事 · 合成用户消息 · MOCK</small></details></article>
      <div class="memory-flow" aria-hidden="true"><svg viewBox="0 0 160 60"><path d="M5 30H150"/><path class="flow-travel" d="M5 30H150"/><path d="m140 23 10 7-10 7"/></svg><span data-flow-label>已有记忆</span></div>
      <div class="memory-stack"><article class="current-memory"><div class="scene-meta"><span>当前记忆</span><span class="current-indicator">有效</span></div><h2>报名表默认排序</h2><div class="memory-value rule-value" data-value>报名时间倒序</div><span class="memory-unit">当前规则</span><div class="memory-origin" data-origin>来源 · 第一次要求</div></article><div class="history-memory" hidden><span>历史记录</span><s>报名时间倒序</s><small>第一次要求</small></div></div></div>
      <p class="stage-caption" role="status" aria-live="polite" data-caption></p>
      <div class="playback"><button class="play-button" data-play aria-label="播放更新过程">▶ 播放</button><div class="step-track" aria-label="演示步骤">${['已有记忆','新陈述','完成更新'].map((label,i)=>`<button data-frame="${i}" aria-pressed="${i===0}"><span class="step-dot">${i+1}</span>${label}</button>`).join('')}</div><button class="replay-button" data-replay aria-label="回到第一步">↺ 重置</button></div>
    </section><footer class="motion-foot"><p>MOCK：自建中文案例，更新过程为预设动画。</p><button data-guide="sorting">查看规则与来源 ↗</button></footer></main>
  </div>`;
}
export function bindDemoGuide(root, onNavigate) {
  let step = 0, playing = false, timer = null;
  const select = selector => root.querySelector(selector);
  const stop = () => { clearTimeout(timer); timer = null; playing = false; };
  const paint = () => {
    const frame = getGuideFrame(step);
    select('.memory-stage').dataset.step = String(step);
    select('[data-date]').textContent = frame.date;
    select('[data-translation]').textContent = frame.translation;
    select('[data-quote]').textContent = frame.quote;
    select('[data-value]').textContent = frame.value;
    select('[data-origin]').textContent = frame.origin;
    select('[data-flow-label]').textContent = ['已有记忆','等待更新','更新并保留历史'][step];
    select('.history-memory').hidden = !frame.history;
    select('[data-caption]').textContent = frame.caption;
    const play = select('[data-play]');
    play.textContent = playing ? 'Ⅱ 暂停' : step === 2 ? '↻ 重播' : '▶ 播放';
    play.setAttribute('aria-label', playing ? '暂停更新过程' : step === 2 ? '重播更新过程' : '播放更新过程');
    root.querySelectorAll('[data-frame]').forEach(button => {button.setAttribute('aria-pressed', String(Number(button.dataset.frame) === step));button.classList.toggle('passed',Number(button.dataset.frame)<step);});
  };
  const schedule = () => { timer = setTimeout(() => { if (!root.isConnected) {stop(); return;} step++; if(step===2) stop(); paint(); if(playing) schedule(); }, 2400); };
  select('[data-play]').onclick = () => { if(playing) stop(); else {if(step===2) step=0;playing=true;schedule();} paint(); };
  select('[data-replay]').onclick = () => {stop();step=0;select('.statement-source').open=false;paint();};
  root.querySelectorAll('[data-frame]').forEach(button => button.onclick = () => {stop();step=Number(button.dataset.frame);paint();});
  root.querySelectorAll('[data-guide],[data-nav]').forEach(button => button.onclick = () => {stop();onNavigate(button.dataset.guide ? getGuideTarget(button.dataset.guide) : {page:button.dataset.nav});});
  const hide = () => {if(document.hidden && playing){stop();paint();}};
  document.addEventListener('visibilitychange',hide);
  paint();
  return () => {stop();document.removeEventListener('visibilitychange',hide);};
}
