import sourceDataset from '../data/longmemeval/展示样本-原始会话.json' with { type: 'json' };

// These annotations describe public source material. They are never Memory run records.
const sourceAnnotations = {
  e47becba: { field: '学历专业', values: ['Business Administration'], translation: '工商管理', note: '原话明确陈述了专业。这里的字段由人工整理，等待真实记忆形成记录来验证。' },
  '8a2466db': { field: '软件偏好与学习目标', values: ['Adobe Premiere Pro'], translation: '喜欢使用，想学习高级设置', note: '这是一条偏好陈述，不意味着禁止其他软件，也不足以判断偏好长期稳定。' },
  '6a1eabeb': { field: '慈善 5K 个人最好成绩', values: ['27:12', '25:50'], translation: '分 : 秒', note: '时间按钮表示用户陈述的时间。原文未提供刷新纪录的确切比赛时间。新陈述与旧陈述均保留来源。' },
  gpt4_2655b836: { field: '保养后的故障事件', values: ['3/15 保养 → 3/22 GPS 故障'], translation: '事件时间由原文人工整理', note: '会话都发生在 4 月 10 日，事件时间却在 3 月。原会话数组的顺序不代表事件发生顺序。' }
};
const sourceEscape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));

export function getSourceView(id = 'e47becba', phase = 1) {
  const sample = sourceDataset.cases.find(item => item.id === id) || sourceDataset.cases[0];
  const isUpdate = sample.id === '6a1eabeb';
  const selectedPhase = isUpdate && Number(phase) === 0 ? 0 : 1;
  const anchors = isUpdate ? sample.anchors.slice(0, selectedPhase + 1) : sample.anchors;
  const visibleSessions = isUpdate
    ? sample.sessions.filter((_, index) => anchors.some(([sessionIndex]) => sessionIndex === index))
    : sample.sessions;
  return { sample, isUpdate, phase: selectedPhase, anchors, visibleSessions, annotation: sourceAnnotations[sample.id] };
}

export function renderSourceBrowser(id, phase, query = '') {
  const view = getSourceView(id, phase);
  const { sample, isUpdate, annotation, anchors, visibleSessions } = view;
  const matching = sourceDataset.cases.filter(item => `${item.label} ${item.title} ${item.id} ${item.summary}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const activeVisible = matching.some(item => item.id === sample.id);
  const selectedAnchor = isUpdate ? anchors[anchors.length - 1] : anchors[0];
  const value = annotation.values[isUpdate ? view.phase : 0];
  const anchorButton = ([si, ti], label) => `<button class="text-button" data-source-anchor="source-turn-${sample.id}-${si}-${ti}">${sourceEscape(label)}</button>`;
  const summary = isUpdate && view.phase === 0
    ? '在 5 月 25 日这次陈述之后，已有证据支持的个人最好成绩是 27:12。切换到较新陈述，再看信息如何变化。'
    : sample.summary;
  return `<div class="source-workspace">
    <div class="source-heading"><div><h1>从原话到记忆</h1><p>公开会话 · 人工整理，未连接真实记忆服务。</p></div></div>
    <details class="source-picker"><summary>切换案例 · ${sourceEscape(sample.label)}</summary><div class="source-sample-nav" aria-label="选择真实样本">${matching.map(item => `<button data-source-sample="${item.id}" aria-pressed="${item.id === sample.id}"><small>${sourceEscape(item.label)}</small><strong>${sourceEscape(item.title)}</strong></button>`).join('')}</div></details>
    ${matching.length ? '' : '<div class="source-empty" role="status">没有匹配的样本。可以搜索“学历”“成绩”或样本 ID。</div>'}
    ${activeVisible ? `<section class="source-record" aria-labelledby="source-record-title"><h2 class="source-simple-title" id="source-record-title">${sourceEscape(sample.title)}</h2>
    ${isUpdate ? `<div class="source-time-control" aria-label="按陈述时间查看"><span>查看时点</span><button data-source-phase="0" aria-pressed="${view.phase === 0}">5 月 25 日<small>第一条陈述</small></button><button data-source-phase="1" aria-pressed="${view.phase === 1}">5 月 27 日<small>较新陈述</small></button></div>` : ''}
    <div class="source-columns"><article class="source-analysis"><h3>人工整理的记忆候选</h3><div class="source-fact"><span>${sourceEscape(annotation.field)}</span><strong class="${isUpdate ? 'source-score' : ''}">${sourceEscape(value)}</strong><small>${sourceEscape(annotation.translation)}</small>${anchorButton(selectedAnchor, '查看这条信息的原文 ↓')}</div>
    ${isUpdate && view.phase === 1 ? `<div class="source-prior"><span>保留的历史陈述</span><strong>27:12</strong><small>5 月 25 日陈述</small>${anchorButton(anchors[0], '追溯旧陈述')}</div>` : ''}
    <details class="source-explanation"><summary>查看解读与注意事项</summary><p class="source-summary">${sourceEscape(summary)}</p><p class="source-caution">${sourceEscape(annotation.note)}</p>
    <details class="source-question"><summary>查看数据集问题</summary><p>${sourceEscape(sample.questionZh)}</p><p lang="en">${sourceEscape(sample.question)}</p><small>提问时间：${sourceEscape(sample.questionDate)}</small><p>这是数据集的问题，尚未运行模型作答。</p></details></details></article>
    <article class="source-evidence"><h3>来源原文 <span>真实公开会话</span></h3>${anchors.map(([si, ti]) => {
      const session = sample.sessions[si], turn = session.turns[ti];
      return `<div class="source-quote"><div class="source-quote-meta"><strong>${sourceEscape(session.date)}</strong><span>用户原话</span></div><blockquote lang="en">${sourceEscape(turn.content)}</blockquote>${anchorButton([si, ti], '定位到完整会话 ↓')}</div>`;
    }).join('')}</article></div>
    <details class="source-transcripts"><summary>展开完整原始会话（${visibleSessions.length} 个）</summary><p>保留数据集原始会话内容与顺序。下面的助手消息也来自数据集；日期未附加推测的时区。</p>${visibleSessions.map(session => {
      const si = sample.sessions.indexOf(session);
      return `<details class="source-session"><summary>${sourceEscape(session.date)} · ${sourceEscape(session.id)} · ${session.turns.length} 条消息</summary>${session.turns.map(turn => `<article class="source-turn ${turn.role === 'user' ? 'source-user' : ''}" id="source-turn-${sample.id}-${si}-${turn.index}" tabindex="-1"><strong>${sourceEscape(turn.role)} · 消息 #${turn.index + 1}</strong><p lang="en">${sourceEscape(turn.content)}</p></article>`).join('')}</details>`;
    }).join('')}</details></section>` : ''}
    <footer class="source-boundary"><details><summary>数据来源与验证范围</summary><p>这里展示公开数据与人工解读。检索与执行未采集；记忆写入、注入及执行记录尚未采集，评测尚未运行。</p><p>oracle 只保留证据会话，不能代表 S/M 完整长历史的检索难度。页面未载入 answer、answer_session_ids、has_answer 等评测字段。</p><p><a href="https://github.com/xiaowu0162/LongMemEval" target="_blank" rel="noreferrer">LongMemEval 官方项目</a> · <a href="https://huggingface.co/datasets/xiaowu0162/longmemeval-cleaned/tree/${sourceEscape(sourceDataset.revision)}" target="_blank" rel="noreferrer">固定数据版本</a></p><code>revision: ${sourceEscape(sourceDataset.revision)}<br>原始 oracle SHA-256: ${sourceEscape(sourceDataset.sha256)}</code></details></footer>
  </div>`;
}

export function bindSourceBrowser(root, onChange) {
  root.querySelectorAll('[data-source-sample]').forEach(button => button.onclick = () => onChange({ sample: button.dataset.sourceSample, phase: 1 }));
  root.querySelectorAll('[data-source-phase]').forEach(button => button.onclick = () => onChange({ phase: Number(button.dataset.sourcePhase) }));
  root.querySelectorAll('[data-source-anchor]').forEach(button => button.onclick = () => {
    const target = document.getElementById(button.dataset.sourceAnchor);
    if (!target) return;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
    root.querySelectorAll('.source-turn.highlighted').forEach(element => element.classList.remove('highlighted'));
    target.classList.add('highlighted');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
}
