import { runData } from './run-data.js';
import { buildSandboxMindMap, renderSandboxMindMap, bindSandboxMindMap, sandboxCaseTitle } from './sandbox-mindmap.js';

// Only this copy changes. Archive status, evidence and model results remain read-only.
export function createArchiveSandbox(dataset = runData) {
  const baseline = dataset.flatMap(c => c.nodes.map(n => ({ ...structuredClone(n), key: c.qid + '/' + n.id, caseId: c.qid, question: c.question, originalSummary: n.summary, version: 1, demoStatus: 'unchanged' })));
  let rows = structuredClone(baseline), events = [];
  const find = key => { const row = rows.find(n => n.key === key); if (!row) throw Error('未找到记忆'); return row; };
  return {
    rows: () => structuredClone(rows),
    events: () => structuredClone(events),
    update(key, summary) {
      const row = find(key), value = String(summary).trim();
      if (!value || value.length > 4000) throw Error('请填写 1–4000 字的模拟内容');
      if (value === row.summary) throw Error('先修改内容，再应用更新');
      events.push({ type: 'update', key, label: row.label, before: row.summary, after: value, provenance: 'mock' });
      row.summary = value; row.version++; row.demoStatus = 'updated';
    },
    withdraw(key) {
      const row = find(key); if (row.demoStatus === 'withdrawn') throw Error('该副本已撤回');
      row.demoStatus = 'withdrawn'; events.push({ type: 'withdraw', key, label: row.label, provenance: 'mock' });
    },
    search(query, caseId = 'all') {
      const term = String(query).trim().toLowerCase();
      if (!term) throw Error('请输入检索词');
      const hits = rows.filter(n => n.demoStatus !== 'withdrawn' && (caseId === 'all' || n.caseId === caseId) && `${n.label} ${n.summary}`.toLowerCase().includes(term));
      events.push({ type: 'search', query: term, keys: hits.map(n => n.key), caseId, provenance: 'mock' });
      return structuredClone(hits);
    },
    reset() { rows = structuredClone(baseline); events = []; }
  };
}

let archiveSandbox = null;
const sandboxView = { query: '', caseId: 'all', type: 'all', page: 0, selected: null, message: '', hitKeys: null, retrieval: '', sourceIndex: null };
const sandboxEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sandboxTypeNames = { fact: '事实', preference: '偏好', constraint: '约束' };

export function renderArchiveSandbox(root, page = 'memories') {
  const editorWasOpen = root.querySelector('.sandbox-editor')?.open ?? false;
  root.dataset.sandboxPage = page;
  archiveSandbox ??= createArchiveSandbox();
  const h = sandboxEscape, rows = archiveSandbox.rows(), events = archiveSandbox.events();
  const names = { memories: '记忆总览', graph: '思维导图', manage: '模拟更新', traces: '模拟检索', timeline: '操作记录', experience: '任务经验', evaluation: '操作记录' };
  const filtered = rows.filter(n => (sandboxView.caseId === 'all' || n.caseId === sandboxView.caseId) && (sandboxView.type === 'all' || n.type === sandboxView.type) && `${n.label} ${n.summary} ${n.caseId} ${n.question}`.toLowerCase().includes(sandboxView.query.toLowerCase()));
  const pageSize = page === 'graph' ? (sandboxView.caseId === 'all' ? 8 : 4) : 15;
  const itemCount = page === 'graph' && sandboxView.caseId === 'all' ? new Set(filtered.map(n => n.caseId)).size : filtered.length;
  const pages = Math.max(1, Math.ceil(itemCount / pageSize)); sandboxView.page = Math.min(sandboxView.page, pages - 1);
  const visible = filtered.slice(sandboxView.page * pageSize, sandboxView.page * pageSize + pageSize);
  let selected = filtered.find(n => n.key === sandboxView.selected) ?? visible[0];
  const status = n => ({ unchanged: '未改动', updated: '已模拟更新', withdrawn: '已模拟撤回' }[n.demoStatus]);
  const selectNode = n => `<button class="text-button" data-sandbox-node="${h(n.key)}">${h(n.label)}</button>`;
  const sources = n => n.sources.map((s, i) => `<details class="evidence" data-sandbox-source="${i}" ${sandboxView.sourceIndex === i ? 'open' : ''}><summary>${h(s.date)} · ${h(s.role)}</summary><blockquote>${h(s.textOriginal)}</blockquote><small>${h(s.sessionId)} · 消息 ${h(s.turnIndex)}</small></details>`).join('') || '<p>未提供来源引用。</p>';
  const options = (items, value) => items.map(([key, label]) => `<option value="${h(key)}" ${key === value ? 'selected' : ''}>${h(label)}</option>`).join('');
  const filters = `<form class="filters" id="sandbox-filters"><label class="search-field"><input id="sandbox-query" aria-label="搜索演练记忆" placeholder="搜索记忆或内容" value="${h(sandboxView.query)}"></label><select id="sandbox-case" aria-label="演练案例">${options([['all', '全部案例'], ...runData.map(c => [c.qid, c.qid + ' · ' + c.type])], sandboxView.caseId)}</select><select id="sandbox-type" aria-label="演练类型">${options([['all', '全部类型'], ...Object.entries(sandboxTypeNames)], sandboxView.type)}</select><button class="secondary">筛选</button></form>`;
  const table = `<div class="table-wrap"><table><thead><tr><th>记忆 / 内容</th><th>类型</th><th>演练状态</th><th>来源</th><th>版本</th></tr></thead><tbody>${visible.map(n => `<tr class="${selected?.key === n.key ? 'selected-row' : ''}"><td>${selectNode(n)}<div class="cell-sub">${h(n.summary)}</div><small>${h(n.caseId)}</small></td><td>${h(sandboxTypeNames[n.type] ?? n.type)}</td><td><span class="tag ${n.demoStatus === 'withdrawn' ? 'amber' : n.demoStatus === 'updated' ? 'green' : ''}">${status(n)}</span></td><td>${n.sources.length} 条引用</td><td>v${n.version}</td></tr>`).join('')}</tbody></table></div>`;
  const mapModel = page === 'graph' ? buildSandboxMindMap(filtered, { caseId: sandboxView.caseId, selectedKey: selected?.key, hitKeys: sandboxView.hitKeys, page: sandboxView.page, pageSize }) : null;
  if (mapModel?.selectedKey) selected = filtered.find(n => n.key === mapModel.selectedKey);
  const graph = mapModel ? renderSandboxMindMap(mapModel) : '';
  const updateForm = selected ? `<section class="sandbox-operation"><h2>更新这条演练副本</h2><p>修改内容后，列表和右侧版本一起变化。来源仍指向原始陈述，不作为新内容的证明。</p><form id="sandbox-update"><label for="sandbox-summary">模拟的新内容</label><textarea id="sandbox-summary" maxlength="4000" required>${h(selected.summary)}</textarea><button class="primary">应用模拟更新</button><button class="secondary" type="button" id="sandbox-withdraw" ${selected.demoStatus === 'withdrawn' ? 'disabled' : ''}>模拟撤回</button></form></section>` : '';
  const retrieval = `<section class="sandbox-operation"><h2>用关键词找记忆</h2><p>仅在当前案例范围内匹配标题与内容；已模拟撤回的副本不参与。不是语义检索或模型调用。</p><form id="sandbox-retrieve"><label for="sandbox-term">检索词</label><div class="sandbox-search"><input id="sandbox-term" value="${h(sandboxView.retrieval)}" placeholder="输入记忆标题中的词" required><button class="primary">模拟检索</button></div></form>${sandboxView.hitKeys === null ? '<p>输入关键词后显示匹配结果。</p>' : `<h3>命中 ${sandboxView.hitKeys.length} 条</h3>${sandboxView.hitKeys.map(key => rows.find(n => n.key === key)).filter(Boolean).map(n => `<div class="sandbox-hit">${selectNode(n)}<p>${h(n.summary)}</p></div>`).join('') || '<p>没有匹配；可以尝试其他关键词。</p>'}`}</section>`;
  const log = `<section class="sandbox-operation"><h2>本次演练的变化</h2>${events.length ? [...events].reverse().map((e, i) => `<article class="sandbox-event"><small>操作 ${events.length - i} · MOCK</small><h3>${e.type === 'search' ? '关键词检索：' + h(e.query) : e.type === 'update' ? '更新：' + h(e.label) : '撤回：' + h(e.label)}</h3>${e.type === 'update' ? `<div class="sandbox-diff"><div><small>更新前</small><p>${h(e.before)}</p></div><div><small>更新后 · 模拟</small><p>${h(e.after)}</p></div></div>` : e.type === 'search' ? `<p>命中 ${e.keys.length} 条，未调用模型。</p>` : '<p>仅从当前演练的检索范围移除，原始档案仍保留。</p>'}</article>`).join('') : '<p>还没有模拟操作。选择一条记忆，在右侧修改或撤回，也可以进行关键词检索。</p>'}</section>`;
  const unsupported = `<section class="sandbox-operation"><h2>这批素材没有任务经验记录</h2><p>85 个节点来自对话记忆档案，未提供工具执行或任务复用证据。</p><a class="secondary" href="#osworld?view=mock">查看独立的任务经验 MOCK 示例</a></section>`;
  root.innerHTML = `<aside class="sidebar"><div class="brand"><div><strong>记忆演练</strong><small>MOCK</small></div></div><div class="workspace-switch"><div><strong>LongMemEval 素材</strong><small>真实来源，模拟操作</small></div></div><nav aria-label="主导航"><a class="nav-item" href="#guide">首页演示</a>${Object.entries(names).filter(([id]) => id !== 'evaluation').map(([id, title]) => `<a class="nav-item ${id === page ? 'active' : ''}" href="#${id}?mode=mock" ${id === page ? 'aria-current="page"' : ''}>${title}</a>`).join('')}</nav><div class="sidebar-bottom"><a href="#memories">查看只读原始档案</a><p><a href="#memories?mode=legacy">报名表合成示例</a></p><button class="secondary" id="sandbox-reset">重置本次演练</button></div></aside><div class="shell"><header class="topbar"><div class="app-identity">记忆控制台</div><span class="tag amber">MOCK 演练</span></header><div class="content-shell"><main id="main"><nav class="check-modebar"><a href="#memories">离线运行数据</a><a href="#memories?mode=mock" aria-current="page">MOCK 演示数据</a></nav><div class="heading"><div><h1>${names[page] ?? names.memories}</h1><p class="subtitle">用已有记忆演练更新与检索，变化就在当前页面。</p></div></div><div class="metrics">${[['演练副本', rows.length, '个 · 来自公开档案'], ['来源案例', runData.length, '个 · 原文可追溯'], ['本次模拟操作', events.length, '次 · 刷新重置']].map(([label, count, unit]) => `<div class="metric"><div><span>${label}</span><strong>${count}<small>${unit}</small></strong></div></div>`).join('')}</div><p class="sandbox-note">素材是实际离线记录；更新、撤回和检索只作用于内存副本，不写回档案。演练版本 v1 从打开页面开始，不代表原始记忆版本。</p><p id="sandbox-message" role="status">${h(sandboxView.message)}</p>${page === 'traces' ? retrieval : ['timeline', 'evaluation'].includes(page) ? log : page === 'experience' ? unsupported : page === 'manage' ? updateForm : ''}<section class="panel"><div class="panel-heading"><h2>${page === 'graph' ? '来源与演练副本' : '记忆库'}</h2><span class="tag amber">MOCK 副本</span></div>${filters}${page === 'graph' ? graph : table}${!filtered.length ? '<div class="empty">没有匹配的记忆，请调整筛选。</div>' : ''}<div class="panel-footer"><span>${filtered.length} 条匹配 · 第 ${sandboxView.page + 1} / ${pages} 页</span><button class="secondary" id="sandbox-prev" ${sandboxView.page === 0 ? 'disabled' : ''}>上一页</button><button class="secondary" id="sandbox-next" ${sandboxView.page + 1 >= pages ? 'disabled' : ''}>下一页</button></div></section></main><aside class="inspector" aria-label="演练记忆详情">${selected ? `<span class="tag amber">演练副本 · v${selected.version}</span><h2>${h(selected.label)}</h2><p>${h(selected.summary)}</p><p>${status(selected)}</p>${selected.version > 1 ? `<details open><summary>对照档案原文</summary><p>${h(selected.originalSummary)}</p><p>当前内容是用户输入的 MOCK，不是模型输出。</p></details>` : ''}${page !== 'manage' ? updateForm : ''}<h3>原始来源 · ${selected.sources.length}</h3>${sources(selected)}` : '<p>当前筛选没有记忆，调整后再演练。</p>'}</aside></div></div>`;
  const $s = selector => root.querySelector(selector), rerender = () => renderArchiveSandbox(root, page);
  const inspector = $s('.inspector');
  const setModal = open => { const target = $s('.inspector'); target.toggleAttribute('aria-modal', open); if (open) { target.setAttribute('role','dialog'); target.setAttribute('aria-modal','true'); } else target.removeAttribute('role'); root.querySelectorAll('.sidebar,.topbar,main').forEach(el => { el.inert = open; }); };
  const closeDetail = () => { root.classList.remove('sandbox-detail-open'); setModal(false); $s('[data-detail-open]')?.focus({ preventScroll: true }); };
  const showDetail = () => { if (innerWidth <= 1000) { root.classList.add('sandbox-detail-open'); setModal(true); $s('[data-detail-close]')?.focus(); } };
  inspector.insertAdjacentHTML('afterbegin', '<div class="sandbox-detail-heading"><strong>记忆详情</strong><button type="button" class="secondary" data-detail-close aria-label="关闭记忆详情">关闭</button></div>');
  $s('[data-detail-close]').onclick = closeDetail;
  root.onkeydown = e => { if (innerWidth > 1000 || !root.classList.contains('sandbox-detail-open')) return; if (e.key === 'Escape') { e.preventDefault(); closeDetail(); } if (e.key === 'Tab') { const controls = [...inspector.querySelectorAll('button,input,textarea,select,summary,a[href]')].filter(el => !el.disabled && el.getClientRects().length); const first = controls[0], last = controls.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } } };
  $s('.heading').insertAdjacentHTML('beforeend', '<button class="secondary sandbox-detail-trigger" data-detail-open>查看所选记忆</button>');
  $s('[data-detail-open]').onclick = showDetail;
  if (root.classList.contains('sandbox-detail-open') && innerWidth <= 1000) { setModal(true); $s('[data-detail-close]').focus({preventScroll:true}); }
  const editor = $s('#sandbox-update')?.closest('.sandbox-operation');
  if (editor && page !== 'manage') {
    const disclosure = document.createElement('details'); disclosure.className = 'sandbox-editor';
    disclosure.innerHTML = '<summary>模拟修改这条记忆</summary>'; disclosure.append(editor); inspector.append(disclosure);
    disclosure.open = editorWasOpen;
  }
  const note = $s('.sandbox-note');
  if (note) { const disclosure = document.createElement('details'); disclosure.className = 'sandbox-boundary'; disclosure.innerHTML = '<summary>MOCK 演练 · 修改仅在本次页面生效</summary>'; note.replaceWith(disclosure); disclosure.append(note); }
  if (['memories','graph'].includes(page)) $s('.heading').insertAdjacentHTML('afterend', `<nav class="sandbox-view-switch" aria-label="记忆查看方式"><a href="#memories?mode=mock" ${page === 'memories' ? 'aria-current="page"' : ''}>记忆列表</a><a href="#graph?mode=mock" ${page === 'graph' ? 'aria-current="page"' : ''}>思维导图</a></nav>`);
  for (const option of $s('#sandbox-case').options) if (option.value !== 'all') option.textContent = sandboxCaseTitle(option.value);
  const clearFilters = () => { Object.assign(sandboxView, { query: '', caseId: 'all', type: 'all', page: 0, selected: null, sourceIndex: null }); rerender(); $s('#sandbox-query').focus(); };
  $s('#sandbox-filters').insertAdjacentHTML('beforeend', '<button type="button" class="text-button" id="sandbox-clear">清除筛选</button>');
  $s('#sandbox-clear').onclick = clearFilters;
  $s('#sandbox-clear').disabled = !sandboxView.query && sandboxView.caseId === 'all' && sandboxView.type === 'all';
  $s('.topbar').insertAdjacentHTML('beforeend','<button class="secondary sandbox-mobile-reset" type="button">重置演练</button>');
  $s('.sandbox-mobile-reset').onclick = () => $s('#sandbox-reset').click();
  root.querySelectorAll('[data-sandbox-node]').forEach(b => b.onclick = () => { sandboxView.selected = b.dataset.sandboxNode; sandboxView.sourceIndex = null; sandboxView.message = ''; rerender(); showDetail(); });
  $s('#sandbox-filters').onsubmit = e => { e.preventDefault(); sandboxView.query = $s('#sandbox-query').value.trim(); sandboxView.caseId = $s('#sandbox-case').value; sandboxView.type = $s('#sandbox-type').value; sandboxView.page = 0; sandboxView.selected = null; sandboxView.sourceIndex = null; sandboxView.hitKeys = null; rerender(); };
  for (const id of ['#sandbox-case', '#sandbox-type']) $s(id).onchange = () => $s('#sandbox-filters').requestSubmit();
  $s('#sandbox-prev').onclick = () => { sandboxView.page--; sandboxView.selected = null; sandboxView.sourceIndex = null; rerender(); };
  $s('#sandbox-next').onclick = () => { sandboxView.page++; sandboxView.selected = null; sandboxView.sourceIndex = null; rerender(); };
  const action = fn => { try { fn(); } catch (e) { sandboxView.message = e.message; } rerender(); };
  if ($s('#sandbox-update')) $s('#sandbox-update').onsubmit = e => { e.preventDefault(); const value = $s('#sandbox-summary').value; action(() => { archiveSandbox.update(selected.key, value); sandboxView.hitKeys = null; sandboxView.message = '已更新演练副本，原始档案未改动。'; }); };
  if ($s('#sandbox-withdraw')) $s('#sandbox-withdraw').onclick = () => action(() => { archiveSandbox.withdraw(selected.key); sandboxView.hitKeys = null; sandboxView.message = '已模拟撤回，下次关键词检索将排除这条副本。'; });
  if ($s('#sandbox-retrieve')) $s('#sandbox-retrieve').onsubmit = e => { e.preventDefault(); sandboxView.retrieval = $s('#sandbox-term').value; action(() => { sandboxView.hitKeys = archiveSandbox.search(sandboxView.retrieval, sandboxView.caseId).map(n => n.key); sandboxView.message = '关键词匹配完成，未调用模型。'; }); };
  $s('#sandbox-reset').onclick = () => { archiveSandbox.reset(); Object.assign(sandboxView, { query: '', caseId: 'all', type: 'all', page: 0, selected: null, message: '已恢复全部演练副本。', hitKeys: null, retrieval: '' }); rerender(); };
  if (page === 'graph') {
    $s('.panel-heading h2').textContent = '案例、来源与记忆';
    if (mapModel.overview) $s('.panel-footer span').textContent = `${mapModel.caseCount} 个案例 · 第 ${mapModel.page + 1} / ${mapModel.pages} 页`;
    $s('.mindmap').before($s('.panel-footer'));
    bindSandboxMindMap(root, mapModel, {
      onCase: caseId => { Object.assign(sandboxView, { caseId, page: 0, selected: null, sourceIndex: null }); rerender(); root.querySelector('[data-map-memory], [data-map-case]')?.focus({ preventScroll: true }); },
      onMemory: key => { sandboxView.selected = key; sandboxView.sourceIndex = null; rerender(); if (innerWidth <= 1000) showDetail(); else [...root.querySelectorAll('[data-map-memory]')].find(b => b.dataset.mapMemory === key)?.focus({ preventScroll: true }); },
      onSource: index => { sandboxView.sourceIndex = index; rerender(); showDetail(); const detail = $s(`[data-sandbox-source="${index}"]`); detail?.querySelector('summary')?.focus({ preventScroll: true }); detail?.scrollIntoView({ block: 'nearest' }); }
    });
  }
}
