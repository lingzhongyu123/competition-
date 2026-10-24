export const workspace = { id: 'mock-demo', name: '两周记忆演示', provenance: 'mock', description: '合成用户与模拟时间，不是实际使用记录' };
export const days = [1, 3, 7, 10, 14];
export const stages = {
  1: { title: '从一句话，形成有来源的记忆', label: '记忆形成', text: '报名表的排序、日期格式与修改范围分别记录，共享同一条原始证据。' },
  3: { title: '让历史偏好进入下一次任务', label: '偏好复用', text: '检索结果、实际注入与执行引用分别展示，沿着证据链追溯。' },
  7: { title: '把结果与教训一起留下', label: '案例积累', text: '模拟案例同时保留方法、失败原因与检查结果，避免只收藏成功过程。' },
  10: { title: '从做过一次，到有条件地复用', label: '经验复用', text: '从多个案例提出策略；新任务先判断适用条件，再决定是否采用。' },
  14: { title: '偏好改变，历史仍然可解释', label: '信息更新', text: '排序由报名时间倒序改为成绩降序；日期格式与修改范围继续有效。' }
};
export const evidence = [
  { id: 'ev-d1', day: 1, title: '第一次整理报名表', role: 'user', session: 'mock-session-01', text: '这是本次活动的报名表，报名时间越晚排名越靠前。日期统一为 YYYY-MM-DD。只整理报名数据，不要改动说明页。', origin: '自建中文故事 · 合成用户消息', provenance: 'mock' },
  { id: 'ev-d3', day: 3, title: '同类任务再次出现', role: 'user', session: 'mock-session-03', text: '把新的报名表也整理一下。', origin: '自建中文故事 · 合成用户消息', provenance: 'mock' },
  { id: 'ev-case-a', day: 7, title: '案例 A · 字段映射与检查', role: 'tool', session: 'mock-run-a', text: '示例轨迹：识别“报名日期”与“登记时间”的映射；检查日期列；执行排序；核对未修改说明页。示例结果：规则检查通过。未实际执行。', origin: '合成任务轨迹 · 非 OSWorld 执行结果', provenance: 'mock' },
  { id: 'ev-case-b', day: 7, title: '案例 B · 混合日期导致失败', role: 'tool', session: 'mock-run-b', text: '示例轨迹：直接对混合文本/日期列排序；检查发现部分顺序错误。示例改进：先统一日期语义并隔离异常值。未实际执行。', origin: '合成失败轨迹 · 非 OSWorld 执行结果', provenance: 'mock' },
  { id: 'ev-strategy', day: 10, title: '策略候选 · 来源与反例', role: 'system', session: 'mock-consolidation-10', text: '根据案例 A 与 B，提出“识别字段 → 核对类型 → 执行 → 校验”的策略候选。仅两个合成案例，不足以证实泛化效果。', origin: '合成巩固事件 · 规划能力示意', provenance: 'mock' },
  { id: 'ev-d14', day: 14, title: '排序规则变更', role: 'user', session: 'mock-session-14', text: '以后的报名表改为按成绩从高到低排序，日期格式和其他要求不变。', origin: '自建中文故事 · 合成用户消息', provenance: 'mock' }
];
export const memories = [
  { id: 'mem-document', kind: 'fact', title: '工作对象：活动报名表', summary: '当前活动的报名数据', day: 1, validFrom: 1, validTo: null, scope: '当前活动 / 文档类型', evidenceIds: ['ev-d1'], layer: '语义记忆', version: 1, confidence: null },
  { id: 'mem-sort-v1', kind: 'preference', title: '报名时间倒序', summary: '报名越晚，排名越靠前', day: 1, validFrom: 1, validTo: 14, scope: '报名表 / 默认排序', evidenceIds: ['ev-d1'], layer: '语义记忆', version: 1, confidence: null },
  { id: 'mem-date', kind: 'preference', title: '统一日期格式', summary: 'YYYY-MM-DD', day: 1, validFrom: 1, validTo: null, scope: '报名表 / 日期显示', evidenceIds: ['ev-d1'], layer: '语义记忆', version: 1, confidence: null },
  { id: 'mem-scope', kind: 'constraint', title: '保留说明页', summary: '修改范围仅限报名数据', day: 1, validFrom: 1, validTo: null, scope: '报名表 / 修改范围', evidenceIds: ['ev-d1'], layer: '语义记忆', version: 1, confidence: null },
  { id: 'case-a', kind: 'case', title: '字段映射后完成整理', summary: '先识别列含义，再排序与校验', day: 7, validFrom: 7, validTo: null, scope: '表格整理 / 案例', evidenceIds: ['ev-case-a'], layer: '经验记忆 · 规划', version: 1, confidence: null, outcome: '合成通过', steps: ['识别字段别名与日期类型', '映射报名时间列', '执行排序并核对说明页'], lesson: '字段名不同不等于业务含义不同；先确认映射。' },
  { id: 'case-b', kind: 'case', title: '混合日期排序失败', summary: '文本与日期混用导致顺序错误', day: 7, validFrom: 7, validTo: null, scope: '表格整理 / 案例', evidenceIds: ['ev-case-b'], layer: '经验记忆 · 规划', version: 1, confidence: null, outcome: '合成失败', steps: ['直接按混合类型列排序', '抽查发现顺序错误', '提出类型归一化与异常检查'], lesson: '先核对类型；有歧义的日期不能静默转换。' },
  { id: 'strategy-table', kind: 'strategy', title: '表格整理前置检查', summary: '字段识别 → 类型检查 → 操作 → 核验', day: 10, validFrom: 10, validTo: null, scope: '表格整理 / 策略候选', evidenceIds: ['ev-strategy', 'ev-case-a', 'ev-case-b'], layer: '经验记忆 · 规划', version: 1, confidence: null, caseIds: ['case-a', 'case-b'], conditions: ['能确定列的业务含义', '存在明确的排序或聚合规则', '可检查产物并保留无关区域'], exclusions: ['无法判断日期地区格式', '字段缺失且用户未给映射', '只能操作界面且无法复用原应用动作'] },
  { id: 'mem-sort-v2', kind: 'preference', title: '成绩从高到低', summary: '后续报名表按成绩降序', day: 14, validFrom: 14, validTo: null, scope: '报名表 / 默认排序', evidenceIds: ['ev-d14'], layer: '语义记忆', version: 2, confidence: null, supersedes: 'mem-sort-v1' }
].map(memory => ({ ...memory, workspaceId: workspace.id, provenance: 'mock' }));
export const traces = [
  { id: 'trace-d3', day: 3, title: '偏好复用 · 新报名表', query: '把新的报名表也整理一下。', eventId: 'ev-d3', runId: 'mock-run-d3', candidates: [{ id: 'mem-sort-v1', reason: '同一用户与报名表作用域', selected: true }, { id: 'mem-date', reason: '任务涉及日期列', selected: true }, { id: 'mem-scope', reason: '限制修改范围', selected: true }], injectedIds: ['mem-sort-v1', 'mem-date', 'mem-scope'], context: '报名表按报名时间倒序；日期使用 YYYY-MM-DD；保留说明页。', actions: ['读取列结构', '应用排序与日期规则', '核对修改范围'], useRecorded: true, result: 'MOCK 产物检查通过；未实际执行' },
  { id: 'trace-d10', day: 10, title: '策略候选 · 另一份报名表', query: '整理另一份字段名称不同的报名表。', runId: 'mock-run-d10', candidates: [{ id: 'strategy-table', reason: '表格整理意图与适用条件匹配', selected: true }, { id: 'case-b', reason: '失败案例用作类型检查参考，未单独注入', selected: false }, { id: 'mem-date', reason: '日期显示规则仍有效', selected: true }], injectedIds: ['strategy-table', 'mem-date'], context: '先确定字段含义及日期类型；执行后检查产物。日期显示为 YYYY-MM-DD。', actions: [], useRecorded: false, result: '未记录执行与产物检查；不能判断策略是否被采用' },
  { id: 'trace-d14', day: 14, title: '更新后检索 · 当前排序规则', query: '现在报名表应该怎么排序？', eventId: 'ev-d14', runId: null, candidates: [{ id: 'mem-sort-v1', reason: '已被新规则取代，排除', selected: false }, { id: 'mem-sort-v2', reason: '当前有效且作用域匹配', selected: true }], injectedIds: ['mem-sort-v2'], context: '当前默认规则：按成绩降序。来源：Day 14 用户指令。', actions: [], useRecorded: false, result: '回答与产物未记录；仅演示检索和注入' }
].map(trace => ({ ...trace, provenance: 'mock' }));
export const timeline = [
  { id: 'event-01', day: 1, type: 'formation', title: '从原始指令形成四条独立记忆', detail: '文档事实、排序偏好、日期格式、修改范围共享证据，各自管理生命周期。', memoryIds: ['mem-sort-v1', 'mem-date', 'mem-scope'] },
  { id: 'event-03', day: 3, type: 'retrieval', title: '新的报名表命中已有偏好', detail: '模拟 trace-d3 记录候选、注入与操作引用。', traceId: 'trace-d3', memoryIds: ['mem-sort-v1', 'mem-date'] },
  { id: 'event-07', day: 7, type: 'case', title: '保留成功方法，也保留失败原因', detail: 'Case A 与 B 为合成任务轨迹，用于说明经验结构。', memoryIds: ['case-a', 'case-b'] },
  { id: 'event-10', day: 10, type: 'strategy', title: '从案例提出策略候选', detail: 'trace-d10 只有注入记录，尚无执行记录，复用效果未知。', traceId: 'trace-d10', memoryIds: ['strategy-table'] },
  { id: 'event-14', day: 14, type: 'update', title: '新排序取代旧排序', detail: '显式变更，不代表自动冲突检测已实现。日期与修改范围继续有效。', memoryIds: ['mem-sort-v1', 'mem-sort-v2'] }
];
