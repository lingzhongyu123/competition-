import { evidence, memories } from './data.js';

export function getGuideTarget(key) {
  return {
    fact: { page: 'sources', sample: 'e47becba', phase: 1, sourceQuery: '' },
    update: { page: 'sources', sample: '6a1eabeb', phase: 0, sourceQuery: '' },
    formation: { page: 'osworld', story: 'formation', storyView: 'mock', storyStep: 0, storyScenario: 'injected' },
    reuse: { page: 'osworld', story: 'reuse', storyView: 'mock', storyStep: 0, storyScenario: 'injected' },
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
export function renderPresentationHeader() {
  return `<header class="motion-header"><a href="#guide" class="motion-brand"><span>◈</span> Memory Console</a><details class="motion-menu"><summary>更多内容</summary><nav aria-label="更多内容"><button data-guide="fact">事实来源</button><button data-guide="update">公开更新样本</button><button data-guide="formation">经验形成</button><button data-guide="reuse">经验复用</button><hr><button data-guide="import">导入经验快照</button><button data-nav="memories">MOCK 数据检查</button><button data-nav="guide">返回首页</button></nav></details></header>`;
}
export function renderDemoGuide() {
  return `<div class="motion-home">
    ${renderPresentationHeader()}
    <main id="main" class="motion-main" tabindex="-1"><div class="motion-heading"><h1>一条记忆，怎样更新？</h1><p>新的要求生效，旧的规则留下来源。</p></div>
    <section class="memory-stage" data-step="0" data-motion="timeline" aria-label="信息更新可视化">
      <div class="stage-label"><span class="stage-dot"></span>MOCK · 中文指令更新演示</div>
      <div class="memory-scene"><article class="statement"><div class="scene-meta"><span>用户陈述</span><time data-date></time></div><p data-translation></p><details class="statement-source"><summary>来源原文</summary><blockquote data-quote></blockquote><small>自建中文故事 · 合成用户消息 · MOCK</small></details></article>
      <div class="memory-flow" aria-hidden="true"><svg viewBox="0 0 160 60"><path d="M5 30H150"/><circle class="flow-packet" cx="14" cy="30" r="5"/><path d="m140 23 10 7-10 7"/></svg><span data-flow-label>已有记忆</span></div>
      <div class="memory-stack"><article class="current-memory"><div class="scene-meta"><span>当前记忆</span><span class="current-indicator">有效</span></div><h2>报名表默认排序</h2><div class="memory-value rule-value" data-value>报名时间倒序</div><span class="memory-unit">当前规则</span><div class="memory-origin" data-origin>来源 · 第一次要求</div></article><div class="history-memory" hidden><span>历史记录</span><s>报名时间倒序</s><small>第一次要求</small></div></div></div>
      <p class="stage-caption" role="status" aria-live="polite" data-caption></p>
      <div class="playback-progress" aria-hidden="true"><div data-motion-progress></div></div><div class="playback"><button class="play-button" data-play aria-label="播放更新过程">▶ 播放</button><div class="step-track" aria-label="演示步骤">${['原有规则','收到新要求','更新并留档'].map((label,i)=>`<button data-frame="${i}" aria-pressed="${i===0}"><span class="step-dot">${i+1}</span>${label}</button>`).join('')}</div><button class="replay-button" data-replay aria-label="回到第一步">↺ 重置</button></div>
    </section><footer class="motion-foot"><p>MOCK：自建中文案例，更新过程为预设动画。</p><button data-guide="sorting">查看规则与来源 ↗</button></footer></main>
  </div>`;
}
export function bindDemoGuide(root, onNavigate) {
  let step = 0, playing = false, timeline = null;
  const select = selector => root.querySelector(selector);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gsap = window.gsap;
  // Semantic state is set directly: rendering never waits for animation completion.
  const paint = () => {
    const frame = getGuideFrame(step);
    select('.memory-stage').dataset.step = String(step);
    select('[data-date]').textContent = frame.date;
    select('[data-translation]').textContent = frame.translation;
    select('[data-quote]').textContent = frame.quote;
    select('[data-value]').textContent = frame.value;
    select('[data-origin]').textContent = frame.origin;
    select('[data-flow-label]').textContent = ['已有记忆','传递新要求','新规则生效'][step];
    select('.history-memory').hidden = !frame.history;
    select('[data-caption]').textContent = frame.caption;
    const play = select('[data-play]');
    play.textContent = playing ? 'Ⅱ 暂停' : step === 2 ? '↻ 重播' : '▶ 播放';
    play.setAttribute('aria-label', playing ? '暂停更新过程' : step === 2 ? '重播更新过程' : '播放更新过程');
    play.setAttribute('aria-pressed', String(playing));
    root.querySelectorAll('[data-frame]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.frame) === step));
      button.classList.toggle('passed', Number(button.dataset.frame) < step);
    });
    if(motion.matches || !gsap) select('[data-motion-progress]').style.transform = `scaleX(${step / 2})`;
  };
  const stop = () => { timeline?.pause(); playing = false; };
  const clearVisuals = () => {
    if(gsap) gsap.set([select('.statement'),select('[data-value]'),select('.history-memory'),select('.flow-packet'),select('[data-motion-progress]')], {clearProps:'all'});
  };
  const buildTimeline = () => {
    timeline?.kill();
    clearVisuals();
    if(!gsap) return;
    const clock = {progress:0};
    timeline = gsap.timeline({paused:true, defaults:{duration:0.4,ease:'power2.out'},
      onUpdate: () => {
        const next = timeline.time() >= 3.45 ? 2 : timeline.time() >= 1.3 ? 1 : 0;
        if(next !== step) {step=next;paint();}
      },
      onComplete: () => {playing=false;step=2;paint();}
    });
    timeline.addLabel('recorded',0).addLabel('incoming',1.8).addLabel('updated',4.4);
    timeline.to(clock,{progress:1,duration:4.4,ease:'none'},0);
    if(!motion.matches) {
      timeline.to(select('.statement'),{autoAlpha:0,duration:0.18},1.1)
        .fromTo(select('.statement'),{autoAlpha:0,y:6},{autoAlpha:1,y:0,immediateRender:false},1.3)
        .fromTo(select('.flow-packet'),{autoAlpha:0,x:0},{autoAlpha:1,x:0,duration:0.1,immediateRender:false},2.0)
        .to(select('.flow-packet'),{x:120,duration:0.85,ease:'power1.inOut'},2.1)
        .to(select('.flow-packet'),{autoAlpha:0,duration:0.15},2.95)
        .to(select('[data-value]'),{autoAlpha:0,y:14,duration:0.2},3.2)
        .fromTo(select('[data-value]'),{autoAlpha:0,y:-12},{autoAlpha:1,y:0,immediateRender:false},3.45)
        .fromTo(select('.history-memory'),{autoAlpha:0,y:-22},{autoAlpha:1,y:0,duration:0.55,immediateRender:false},3.45)
        .fromTo(select('[data-motion-progress]'),{scaleX:0},{scaleX:1,duration:4.4,ease:'none',immediateRender:false},0);
    }
  };
  const positions = ['recorded','incoming','updated'];
  const showFrame = index => {
    stop();step=index;
    timeline?.seek(positions[index],true);
    paint();
  };
  buildTimeline();paint();
  select('[data-play]').onclick = () => {
    if(playing) {stop();paint();return;}
    if(!timeline) {showFrame((step+1)%3);return;}
    if(step===2) showFrame(0);
    playing=true;paint();timeline.play();
  };
  select('[data-replay]').onclick = () => {showFrame(0);select('.statement-source').open=false;};
  root.querySelectorAll('[data-frame]').forEach(button => button.onclick = () => showFrame(Number(button.dataset.frame)));
  root.querySelectorAll('[data-guide],[data-nav]').forEach(button => button.onclick = () => {
    stop();onNavigate(button.dataset.guide ? getGuideTarget(button.dataset.guide) : {page:button.dataset.nav});
  });
  const hide = () => {if(document.hidden && playing){stop();paint();}};
  const changeMotion = () => {const selected=step;stop();buildTimeline();showFrame(selected);};
  document.addEventListener('visibilitychange',hide);
  motion.addEventListener('change',changeMotion);
  return () => {stop();timeline?.kill();document.removeEventListener('visibilitychange',hide);motion.removeEventListener('change',changeMotion);};
}
