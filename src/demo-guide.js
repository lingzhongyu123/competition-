import { getSourceView } from './source-browser.js';

export function getGuideTarget(key) {
  return {
    fact: { page: 'sources', sample: 'e47becba', phase: 1, sourceQuery: '' },
    update: { page: 'sources', sample: '6a1eabeb', phase: 0, sourceQuery: '' },
    formation: { page: 'osworld', story: 'formation', storyView: 'sources', storyStep: 0, storyScenario: 'injected' },
    reuse: { page: 'osworld', story: 'reuse', storyView: 'sources', storyStep: 0, storyScenario: 'injected' },
    import: { page: 'import' }
  }[key] || null;
}

// A manually authored illustration of public statements, never a backend replay.
export function getGuideFrame(step) {
  const index = Math.min(2, Math.max(0, Math.floor(Number(step) || 0)));
  const view = getSourceView('6a1eabeb', index === 0 ? 0 : 1);
  const anchor = view.anchors.at(-1);
  const session = view.sample.sessions[anchor[0]];
  return {
    step: index, value: index === 2 ? '25:50' : '27:12',
    incoming: index > 0, history: index === 2,
    date: index === 0 ? '5 月 25 日' : '5 月 27 日',
    quote: session.turns[anchor[1]].content,
    caption: ['先记住一条信息。', '新的陈述来了，等待更新。', '更新当前值，保留旧信息的来源。'][index],
    translation: index === 0 ? '最近一次慈善 5K 跑，我的个人最好成绩是 27:12。' : '我希望这次能打破自己 25:50 的个人最好成绩。'
  };
}
export function renderDemoGuide() {
  return `<div class="motion-home">
    <header class="motion-header"><a href="#guide" class="motion-brand"><span>◈</span> Memory Console</a><details class="motion-menu"><summary>更多内容</summary><nav aria-label="更多内容"><button data-guide="fact">事实来源</button><button data-guide="formation">经验形成</button><button data-guide="reuse">经验复用</button><hr><button data-guide="import">导入经验快照</button><button data-nav="memories">MOCK 数据检查</button></nav></details></header>
    <main id="main" class="motion-main" tabindex="-1"><div class="motion-heading"><span class="motion-kicker">记忆 · 信息更新</span><h1>记住变化，也留下来处。</h1><p>一条新的陈述，怎样改变已有记忆？</p></div>
    <section class="memory-stage" data-step="0" aria-label="信息更新可视化">
      <div class="stage-label"><span class="stage-dot"></span>公开样本 · 人工编排动画</div>
      <div class="memory-scene"><article class="statement"><div class="scene-meta"><span>用户陈述</span><time data-date></time></div><p data-translation></p><details class="statement-source"><summary>来源原文</summary><blockquote data-quote lang="en"></blockquote><small>LongMemEval 公开会话 · 上方为节译</small></details></article>
      <div class="memory-flow" aria-hidden="true"><svg viewBox="0 0 160 60"><path d="M5 30H150"/><path class="flow-travel" d="M5 30H150"/><path d="m140 23 10 7-10 7"/></svg><span data-flow-label>已有记忆</span></div>
      <div class="memory-stack"><article class="current-memory"><div class="scene-meta"><span>当前记忆</span><span class="current-indicator">有效</span></div><h2>5K 个人最好成绩</h2><div class="memory-value" data-value>27:12</div><span class="memory-unit">分 : 秒</span><div class="memory-origin" data-origin>来源 · 5 月 25 日的陈述</div></article><div class="history-memory" hidden><span>历史记录</span><s>27:12</s><small>来源 · 5 月 25 日</small></div></div></div>
      <p class="stage-caption" role="status" aria-live="polite" data-caption></p>
      <div class="playback"><button class="play-button" data-play aria-label="播放更新过程">▶ 播放</button><div class="step-track" aria-label="演示步骤">${['已有记忆','新陈述','完成更新'].map((label,i)=>`<button data-frame="${i}" aria-pressed="${i===0}"><span class="step-dot">${i+1}</span>${label}</button>`).join('')}</div><button class="replay-button" data-replay aria-label="回到第一步">↺ 重置</button></div>
    </section><footer class="motion-foot"><p>公开会话的人工对照，未执行真实记忆写入。日期为陈述时间。</p><button data-guide="update">查看完整案例 ↗</button></footer></main>
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
    select('[data-origin]').textContent = `来源 · ${step === 2 ? '5 月 27 日' : '5 月 25 日'}的陈述`;
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
