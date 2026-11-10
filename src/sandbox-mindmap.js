// The tree groups copies by case. Only source edges assert document references.
const sandboxCaseNames = {
  '0100672e': '咖啡杯花费',
  '07741c44': '旧运动鞋的位置',
  gpt4_1a1dc16d: '见面与游行的先后',
  '0ddfec37_abs': '签名橄榄球收藏',
  '07b6f563': '手机配件偏好',
  '1e043500': 'Spotify 歌单',
  '6222b6eb': '大气校正算法',
  e47becba: '学历与专业',
  '8a2466db': '视频编辑偏好',
  '6a1eabeb': '5K 成绩更新',
  gpt4_2655b836: '车辆保养与故障',
  '3a704032': '植物购置数量',
  e831120c: '观影周数统计',
  b5ef892d: '露营天数统计',
  '7161e7e2': 'GM社媒轮班',
  c4f10528: '万隆餐厅推荐',
  '0a995998': '衣物取退清单',
  '6d550036': '主导项目统计',
  gpt4_59c863d7: '模型套件制作',
  '6aeb4375': '韩国餐厅打卡',
  '830ce83f': 'Rachel 搬迁城市',
  '852ce960': '房贷预批额度',
  gpt4_2487a7cb: '培训活动先后',
  gpt4_76048e76: '二月车辆维护',
  '06878be2': '摄影配件偏好',
  '75832dbd': '医学影像论文',
  '118b2229': '日常通勤时长',
  '51a45a95': '优惠券兑换地点',
  e9327a54: '奥兰多甜品店',
  cc539528: '后端语言推荐'
};
export const sandboxCaseTitle = id => sandboxCaseNames[id] ?? id;
export function buildSandboxMindMap(rows, { caseId = 'all', selectedKey = null, hitKeys = null, page = 0, pageSize = 8 } = {}) {
  const hitSet = new Set(hitKeys ?? []), width = 1080;
  if (caseId === 'all') {
    const groups = [...new Set(rows.map(n => n.caseId))];
    const leftCount = Math.ceil(groups.length / 2);
    const rowHeight = 104;
    const height = Math.max(380, leftCount * rowHeight + 40);
    const nodes = [{ id: 'root', kind: 'root', x: 410, y: (height - 105) / 2, w: 260, h: 105, title: '记忆演练', text: `${rows.length} 个副本 · ${groups.length} 个案例` }];
    groups.forEach((id, i) => {
      const copies = rows.filter(n => n.caseId === id);
      const x = i < leftCount ? 20 : 800;
      const y = 24 + (i % leftCount) * rowHeight;
      nodes.push({ id: 'case-' + i, kind: 'case', caseId: id, x, y, w: 260, h: 84, title: sandboxCaseNames[id] ?? `案例 ${id}`, text: `${copies.length} 个记忆 · ${copies.filter(n => n.demoStatus === 'updated').length} 个已更新`, hit: copies.some(n => hitSet.has(n.key)), hint: id + ' · ' + (copies[0]?.question ?? '') });
    });
    return { width, height, overview: true, nodes, edges: nodes.slice(1).map(n => ({ from: 'root', to: n.id, kind: 'group' })), total: rows.length, pages: 1, page: 0 };
  }
  const scoped = rows.filter(n => n.caseId === caseId), pages = Math.max(1, Math.ceil(scoped.length / pageSize));
  const currentPage = Math.max(0, Math.min(page, pages - 1)), visible = scoped.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const selected = visible.find(n => n.key === selectedKey) ?? visible[0];
  const sources = selected?.sources ?? [], height = Math.max(560, visible.length * 112 + 60, sources.length * 110 + 60);
  const nodes = [{ id: 'root', kind: 'root', x: 390, y: height / 2 - 55, w: 260, h: 110, title: sandboxCaseNames[caseId] ?? `案例 ${caseId}`, text: `${caseId} · ${scoped.length} 个演练记忆`, hint: selected?.question ?? '' }], edges = [];
  visible.forEach((n, i) => {
    const node = { id: 'memory-' + i, kind: 'memory', key: n.key, x: 770, y: 30 + i * 112, w: 290, h: 96, title: n.label, text: `${n.demoStatus === 'updated' ? '已模拟更新' : n.demoStatus === 'withdrawn' ? '已模拟撤回' : '演练副本'} · v${n.version}`, selected: n.key === selected?.key, hit: hitSet.has(n.key), status: n.demoStatus, hint: n.summary };
    nodes.push(node); edges.push({ from: 'root', to: node.id, kind: 'group', selected: node.selected, hit: node.hit });
  });
  sources.forEach((s, i) => {
    const node = { id: 'source-' + i, kind: 'source', index: i, x: 20, y: (height - sources.length * 110) / 2 + i * 110, w: 265, h: 88, title: `${s.role === 'user' ? '用户' : s.role === 'assistant' ? '助手' : s.role}原文 ${i + 1}`, text: s.date ?? '日期未保存', hint: s.textOriginal };
    nodes.push(node); edges.push({ from: node.id, to: nodes.find(n => n.kind === 'memory' && n.selected).id, kind: 'source', selected: true });
  });
  if (selected?.version > 1) {
    nodes.push({ id: 'update', kind: 'update', x: 390, y: height / 2 + 95, w: 260, h: 90, title: `模拟更新 · v${selected.version}`, text: '原始来源不证明新内容', hint: selected.summary });
    edges.push({ from: 'update', to: nodes.find(n => n.kind === 'memory' && n.selected).id, kind: 'update', selected: true });
  }
  return { width, height, nodes, edges, total: scoped.length, pages, page: currentPage, selectedKey: selected?.key };
}

const mindMapEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function renderSandboxMindMap(model) {
  const h = mindMapEscape, byId = new Map(model.nodes.map(n => [n.id, n]));
  const curves = model.edges.map(edge => {
    const a = byId.get(edge.from), b = byId.get(edge.to), fromRight = b.x > a.x;
    const x1 = a.x + (fromRight ? a.w : 0), x2 = b.x + (fromRight ? 0 : b.w), y1 = a.y + a.h / 2, y2 = b.y + b.h / 2;
    const middle = (x1 + x2) / 2;
    return `<path class="mindmap-edge mindmap-${edge.kind} ${edge.selected ? 'is-selected' : ''} ${edge.hit ? 'is-hit' : ''}" d="M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2} ${y2}"/>`;
  }).join('');
  const nodes = model.nodes.map(n => `<div class="mindmap-node mindmap-${n.kind} ${n.selected ? 'is-selected' : ''} ${n.hit ? 'is-hit' : ''} ${n.status ? 'is-' + n.status : ''}" style="left:${n.x}px;top:${n.y}px;width:${n.w}px;height:${n.h}px">${n.kind === 'root' || n.kind === 'update' ? '<div' : '<button type="button"'} ${n.kind === 'memory' ? `data-map-memory="${h(n.key)}" aria-pressed="${Boolean(n.selected)}"` : n.kind === 'case' ? `data-map-case="${h(n.caseId)}"` : n.kind === 'source' ? `data-map-source="${n.index}"` : ''} title="${h(n.hint ?? n.title)}"><strong>${h(n.title)}</strong><span>${h(n.text)}${n.hit ? ' · 检索命中' : ''}</span>${n.kind === 'root' || n.kind === 'update' ? '</div>' : '</button>'}</div>`).join('');
  return `<section class="mindmap" ${model.overview ? "data-overview" : ""} aria-label="记忆思维导图"><div class="mindmap-toolbar"><div><strong>${model.nodes.some(n => n.kind === 'case') ? '选择案例，展开记忆' : '点选记忆，追到原文'}</strong><p>灰线：案例归属　蓝线：所选记忆的原文引用　虚线：模拟更新</p></div><div class="mindmap-controls"><button class="secondary" type="button" data-map-all>全部案例</button><button class="secondary" type="button" data-map-zoom="out" aria-label="缩小导图">−</button><button class="secondary" type="button" data-map-zoom="in" aria-label="放大导图">＋</button><button class="secondary" type="button" data-map-zoom="fit">适应窗口</button><output id="mindmap-scale" aria-live="polite"></output></div></div><p class="mindmap-key">绿色边框表示本次关键词检索命中；灰色虚线框表示已模拟撤回。滚动查看，缩放后可点选节点。</p><div class="mindmap-viewport" tabindex="0" aria-label="可滚动的思维导图画布"><div class="mindmap-size"><div class="mindmap-canvas" style="width:${model.width}px;height:${model.height}px"><svg width="${model.width}" height="${model.height}" aria-hidden="true" focusable="false">${curves}</svg>${nodes}</div></div></div></section>`;
}

const mindMapViewportState = new WeakMap();

export function bindSandboxMindMap(root, model, { onCase, onMemory, onSource }) {
  const viewport = root.querySelector('.mindmap-viewport');
  if (!viewport) return;
  const canvas = viewport.querySelector('.mindmap-canvas');
  const size = viewport.querySelector('.mindmap-size');
  const scaleOutput = root.querySelector('#mindmap-scale');
  const context = model.nodes.filter(n => n.kind === 'case' || n.kind === 'memory').map(n => n.key ?? n.caseId).join('|');
  const previous = mindMapViewportState.get(root);
  const state = previous?.context === context ? previous : { context, zoom: null, left: 0, top: 0 };
  mindMapViewportState.set(root, state);

  let zoom = 1;
  const applyZoom = value => {
    zoom = Math.min(1.6, value);
    canvas.style.transform = `scale(${zoom})`;
    size.style.width = `${Math.ceil(model.width * zoom)}px`;
    size.style.height = `${Math.ceil(model.height * zoom)}px`;
    scaleOutput.textContent = `${Math.round(zoom * 100)}%`;
  };
  const fit = () => {
    state.zoom = null;
    applyZoom(Math.min(1, Math.max(1, viewport.clientWidth - 24) / model.width, Math.max(1, viewport.clientHeight - 24) / model.height));
    viewport.scrollTo(0, 0);
  };
  if (state.zoom === null) fit();
  else {
    applyZoom(state.zoom);
    viewport.scrollTo(state.left, state.top);
  }
  const observer = new ResizeObserver(() => {
    if (!viewport.isConnected) { observer.disconnect(); return; }
    if (state.zoom === null) fit();
  });
  observer.observe(viewport);
  viewport.onscroll = () => { state.left = viewport.scrollLeft; state.top = viewport.scrollTop; };
  root.querySelectorAll('[data-map-zoom]').forEach(button => {
    button.onclick = () => {
      if (button.dataset.mapZoom === 'fit') { fit(); return; }
      applyZoom(Math.max(Math.min(0.15, zoom), zoom * (button.dataset.mapZoom === 'in' ? 1.25 : 0.8)));
      state.zoom = zoom;
    };
  });
  root.querySelector('[data-map-all]').onclick = () => onCase('all');
  root.querySelectorAll('[data-map-case]').forEach(button => { button.onclick = () => onCase(button.dataset.mapCase); });
  root.querySelectorAll('[data-map-memory]').forEach(button => { button.onclick = () => onMemory(button.dataset.mapMemory); });
  root.querySelectorAll('[data-map-source]').forEach(button => { button.onclick = () => onSource(Number(button.dataset.mapSource)); });
}
