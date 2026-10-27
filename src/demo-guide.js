import { evidence, memories } from './data.js';

export function getGuideTarget(key) {
  if (/^chapter[0-3]$/.test(key)) return { page: 'guide', guideStep: Number(key.at(-1))*2 };
  return {
    fact: { page: 'sources', sample: 'e47becba', phase: 1, sourceQuery: '' },
    update: { page: 'sources', sample: '6a1eabeb', phase: 0, sourceQuery: '' },
    formation: { page: 'osworld', story: 'formation', storyView: 'mock', storyStep: 0, storyScenario: 'injected' },
    reuse: { page: 'osworld', story: 'reuse', storyView: 'mock', storyStep: 0, storyScenario: 'injected' },
    sorting: { page: 'manage', day: 14 },
    import: { page: 'import' }
  }[key] || null;
}

const guideEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const guideChapters = ['事实记忆','信息更新','任务经验','复用过程'];
const guideFirstBatch = [
  {id:'A',name:'选手甲',registered:'09:10',score:'9'},
  {id:'B',name:'选手乙',registered:'09:30',score:'85'},
  {id:'C',name:'选手丙',registered:'09:20',score:100}
];
const guideNextBatch = [
  {id:'D',name:'选手丁',registered:'10:10',score:'12'},
  {id:'E',name:'选手戊',registered:'10:30',score:'95'},
  {id:'F',name:'选手己',registered:'10:20',score:110}
];
export function getGuideFrame(step) {
  const index = Math.min(7, Math.max(0, Math.floor(Number(step) || 0)));
  const first = evidence.find(item => item.id === 'ev-d1');
  const changed = evidence.find(item => item.id === 'ev-d14');
  const again = evidence.find(item => item.id === 'ev-d3');
  const oldRule = memories.find(item => item.id === 'mem-sort-v1').title;
  const newRule = memories.find(item => item.id === 'mem-sort-v2').title;
  const input = index >= 6 ? guideNextBatch : guideFirstBatch;
  let rows = input.map(row => ({...row}));
  if(index >= 1 && index <= 3) rows.sort((a,b) => b.registered.localeCompare(a.registered));
  if(index === 4) rows.sort((a,b) => String(b.score).localeCompare(String(a.score)));
  if(index === 5 || index === 7) rows.sort((a,b) => Number(b.score)-Number(a.score));
  const quote = index < 2 ? first.text : index < 4 ? changed.text : index === 4
    ? 'MOCK 操作记录：直接按文本排序，9 被排在了 100 前面。'
    : index === 5 ? 'MOCK 修正记录：将成绩按数值比较，重新排序并检查结果。' : again.text;
  return {
    step:index,chapter:Math.floor(index/2),chapterLabel:guideChapters[Math.floor(index/2)],provenance:'mock',
    quote,displayQuote:['时间倒序。','时间倒序。','改为成绩从高到低。','改为成绩从高到低。','提取相关经验。','修正完成，记下这次的方法。','新的一批数据乱序了，按之前的规则整理。','下次遇到乱序，就按规则来。'][index],sourceId:index<2?first.id:index<4?changed.id:index===4?'mock-registration-sort-error':index===5?'mock-registration-sort-fix':'mock-registration-next-batch',
    wordingId:index<2?first.id:index<4?changed.id:index>=6?again.id:null,
    actor:index===4||index===5?'经验提取':index===7?'复用过程':'用户要求（简述）',
    caption:[
      '用户要求：时间倒序。',
      '记住规则：时间倒序。',
      '用户的要求变了，规则也要变。',
      '当前规则：成绩从高到低。',
      '先发现问题：按文本排序，把 9 排在了 100 前面。',
      '提取相关经验：先检查类型，再按数值排序。',
      '遇到新一批乱序数据，先找到之前的规则；尚未采用。',
      '下次遇到乱序，就按规则来。'
    ][index],
    rows,batch:index>=6?'第二批报名数据':'第一批报名数据',
    remembered:true,rule:index>=3?newRule:oldRule.replace('报名',''),history:index>=3,
    experience:index>=5,recalled:index>=6,adopted:index===7,checked:index===5||index===7,
    wrong:index===4,
    activeColumn:index>=3?'score':'registered',
    sortedColumn:index>=1&&index<=3?'registered':index===5||index===7?'score':null,
    status:['待排序','已排序','要求已变','等待按新规则排序','排序有误：9 在 100 前','已修正 · MOCK','找到方法，待采用','已采用并检查 · MOCK'][index]
  };
}
export function renderPresentationHeader() {
  return `<header class="motion-header"><a href="#guide" class="motion-brand"><span>◈</span> Memory Console</a><details class="motion-menu"><summary>补充材料</summary><nav aria-label="补充材料"><button data-guide="fact">对话样本 · 事实与更新</button><button data-guide="formation">任务样本 · 经验与复用</button><hr><button data-guide="import">导入经验快照</button><button data-nav="memories">MOCK 数据检查</button><button data-nav="guide">返回首页</button></nav></details></header>`;
}
export function renderStoryContext(page) {
  if(page!=='sources' && page!=='osworld') return '';
  const dialogue=page==='sources';
  return `<aside class="story-context" aria-label="与首页故事的关系"><p>${dialogue?'LongMemEval 公开记录':'MOCK 工时示例'}，与首页报名表是独立案例。</p><div class="story-context-links">${dialogue?'<button data-guide="chapter0">回到事实记忆</button><button data-guide="chapter1">回到信息更新</button>':'<button data-guide="chapter2">回到任务经验</button><button data-guide="chapter3">回到复用过程</button>'}</div></aside>`;
}
export function renderDemoGuide() {
  return `<div class="motion-home case-home">${renderPresentationHeader()}
    <main id="main" class="motion-main" tabindex="-1"><div class="motion-heading"><h1>帮我整理活动报名表</h1></div>
    <section class="case-stage" aria-label="报名表记忆故事" data-step="0"><div class="case-chapters" aria-label="故事章节">${guideChapters.map((label,i)=>`<button data-chapter="${i}" aria-pressed="${i===0}"><span>${i+1}</span>${label}</button>`).join('')}</div>
      <div class="case-message"><div><span class="case-mock">MOCK</span><span data-case-actor></span></div><p data-case-quote></p></div>
      <div class="case-scene"><article class="case-workbook"><div class="case-workbook-title"><span data-case-batch></span><span class="case-sheet-status" data-case-status></span></div><div class="case-table-wrap"><table><caption class="sr-only">自建报名表，所有选手与成绩均为 MOCK</caption><thead><tr><th scope="col">姓名</th><th scope="col" data-time-header>报名时间</th><th scope="col" data-score-header>成绩</th></tr></thead><tbody data-case-rows></tbody></table></div></article>
      <aside class="case-memory" aria-label="当前记忆"><h2>当前规则</h2><div data-case-memory></div></aside></div>
      <p class="sr-only" data-caption role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="playback-progress" aria-hidden="true"><div data-motion-progress></div></div><div class="case-controls"><button class="play-button" data-play aria-label="播放完整故事">▶ 播放</button><div class="case-step-controls"><button data-case-prev aria-label="上一步">←</button><span data-case-position></span><button data-case-next aria-label="下一步">→</button><button data-replay aria-label="从头开始">↺</button></div></div>
    </section><footer class="case-footer"><span>MOCK 演示，不代表真实执行。</span><details><summary>本幕来源</summary><p data-case-source></p><small>事实与更新沿用已有中文合成指令；排序错误、修正与复用为新编展示过程。原始公开样本保持独立。</small></details></footer></main></div>`;
}

export function bindDemoGuide(root, onNavigate, initialStep=0) {
  let step=getGuideFrame(initialStep).step,playing=false,timeline=null,transition=null,previousFrame=null;
  const select = selector => root.querySelector(selector);
  const gsap=window.gsap;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const animated = () => gsap && !motion.matches;
  const paint = (animate=false) => {
    const frame=getGuideFrame(step);
    const oldPositions=new Map([...root.querySelectorAll('[data-case-row]')].map(row=>[row.dataset.caseRow,row.getBoundingClientRect().top]));
    transition?.kill();
    if(gsap)gsap.set(select('.case-memory'),{clearProps:'opacity'});
    select('.case-stage').dataset.step=String(step);
    select('[data-case-actor]').textContent=frame.actor;
    select('[data-case-quote]').textContent=frame.displayQuote;
    select('[data-case-batch]').textContent=frame.batch;
    select('[data-case-status]').textContent=frame.status;
    for(const [key,selector,label] of [['registered','[data-time-header]','报名时间'],['score','[data-score-header]','成绩']]) {
      const header=select(selector),active=frame.activeColumn===key;
      header.innerHTML=`${label}${active?'<span class="case-sort-arrow" aria-hidden="true">↓</span>':''}${key==='score'&&frame.wrong?'<small>文本</small>':''}`;
      header.classList.toggle('case-col-active',active);
      header.setAttribute('aria-sort',frame.sortedColumn===key?'descending':'none');
    }
    select('[data-case-rows]').innerHTML=frame.rows.map(row=>`<tr data-case-row="${row.id}"><td>${guideEscape(row.name)}</td><td class="${frame.activeColumn==='registered'?'case-col-active':''}">${guideEscape(row.registered)}</td><td class="${frame.wrong?'score-wrong':frame.checked?'score-checked':frame.activeColumn==='score'?'case-col-active':''}">${guideEscape(row.score)}</td></tr>`).join('');
    select('[data-case-memory]').innerHTML=frame.remembered?`<div class="case-memory-item case-rule"><strong>${guideEscape(frame.rule)}</strong>${frame.history?'<details class="case-old-rule"><summary>查看旧规则</summary><p>时间倒序</p></details>':''}</div>${frame.experience?`<div class="case-experience"><small>${frame.recalled?'找到的方法':'经验候选'} · MOCK</small><strong>先检查成绩类型，再按数值排序</strong><span>${frame.adopted?'本批已采用并检查（MOCK）':frame.recalled?'已找到，尚未采用':'来自刚才的错误与修正，仍是候选'}</span></div>`:''}`:'<p class="case-memory-empty">等待从任务中记下要求。</p>';
    select('[data-caption]').textContent=frame.caption;
    select('[data-case-source]').textContent=`${frame.sourceId}：${frame.quote}${frame.wordingId ? `（措辞来自 ${frame.wordingId}，发生顺序为本故事预设）` : ''}`;
    select('[data-case-position]').textContent=`${step+1} / 8`;
    select('[data-case-prev]').disabled=step===0;
    select('[data-case-next]').disabled=step===7;
    root.querySelectorAll('[data-chapter]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.chapter)===frame.chapter)));
    select('[data-motion-progress]').style.transform=`scaleX(${step/7})`;
    updatePlay();
    if(animate && animated()) {
      transition=gsap.timeline({defaults:{duration:0.55,ease:'power2.out'}});
      const targets=[...root.querySelectorAll('[data-case-row]')];
      targets.forEach(row=>{
        const old=oldPositions.get(row.dataset.caseRow);
        const delta=old===undefined?8:old-row.getBoundingClientRect().top;
        if(old===undefined||Math.abs(delta)>0.5)transition.fromTo(row,{y:delta,opacity:old===undefined?0:1},{y:0,opacity:1,immediateRender:false},0);
      });
      if(previousFrame?.rule!==frame.rule)transition.fromTo(select('.case-rule'),{opacity:0.4,y:5},{opacity:1,y:0,duration:0.35},0);
      if(frame.experience&&!previousFrame?.experience)transition.fromTo(select('.case-experience'),{opacity:0,y:6},{opacity:1,y:0,duration:0.4},0);
    }
    previousFrame=frame;
  };
  const updatePlay=()=>{
    const button=select('[data-play]');
    button.textContent=playing?'Ⅱ 暂停':step===7?'↻ 重播':'▶ 播放';
    button.setAttribute('aria-label',playing?'暂停完整故事':step===7?'重播完整故事':'播放完整故事');
    button.setAttribute('aria-pressed',String(playing));
  };
  const stop=()=>{playing=false;timeline?.pause();transition?.pause();updatePlay();};
  const build=()=>{
    timeline?.kill();
    if(!gsap)return;
    const clock={value:0};
    timeline=gsap.timeline({paused:true,onUpdate:()=>{
      const next=Math.min(7,Math.floor(timeline.time()/3));
      if(next!==step){step=next;paint(true);}
    },onComplete:()=>{playing=false;step=7;paint(false);}});
    for(let i=0;i<8;i++)timeline.addLabel('step'+i,i*3);
    timeline.to(clock,{value:1,duration:23,ease:'none'},0);
  };
  const show=index=>{
    stop();step=Math.min(7,Math.max(0,index));
    timeline?.seek('step'+step,true);paint(true);
  };
  build();timeline?.seek('step'+step,true);paint(false);
  select('[data-play]').onclick=()=>{
    if(playing){stop();return;}
    if(!timeline){show((step+1)%8);return;}
    if(step===7)show(0);
    playing=true;updatePlay();transition?.play();timeline.play();
  };
  select('[data-case-prev]').onclick=()=>show(step-1);
  select('[data-case-next]').onclick=()=>show(step+1);
  select('[data-replay]').onclick=()=>show(0);
  root.querySelectorAll('[data-chapter]').forEach(button=>button.onclick=()=>show(Number(button.dataset.chapter)*2));
  root.querySelectorAll('[data-guide],[data-nav]').forEach(button=>button.onclick=()=>{stop();onNavigate(button.dataset.guide?getGuideTarget(button.dataset.guide):{page:button.dataset.nav});});
  const hide=()=>{if(document.hidden&&playing)stop();};
  const changeMotion=()=>{stop();transition?.kill();paint(false);};
  document.addEventListener('visibilitychange',hide);motion.addEventListener('change',changeMotion);
  return()=>{timeline?.kill();transition?.kill();document.removeEventListener('visibilitychange',hide);motion.removeEventListener('change',changeMotion);};
}
