import { memories, evidence, traces, timeline, workspace, days } from './data.js';

export const kindLabels = { fact: '事实', preference: '偏好', constraint: '约束', case: '案例', strategy: '策略' };
export const statusLabels = { active: '有效', superseded: '已取代', withdrawn: '已模拟撤回' };
export function statusAt(memory, day, withdrawals = []) {
  if (day < memory.day || day < memory.validFrom) return 'not-yet';
  if (withdrawals.some(event => event.memoryId === memory.id && event.day <= day)) return 'withdrawn';
  if (memory.validTo !== null && day >= memory.validTo) return 'superseded';
  return 'active';
}

// This is the replaceable data boundary. Real API failures must not fall back to mock.
export function createMockProvider() {
  let withdrawals = [];
  function snapshot(day) {
    if (!days.includes(day)) throw new Error('不支持的演示时间');
    const visible = memories.filter(memory => statusAt(memory, day, withdrawals) !== 'not-yet')
      .map(memory => {
        // Do not reveal a future replacement when viewing earlier history.
        const record = { ...memory, status: statusAt(memory, day, withdrawals) };
        if (record.validTo !== null && record.validTo > day) record.validTo = null;
        return record;
      });
    return structuredClone({
      workspace, day, provenance: 'mock', memories: visible,
      evidence: evidence.filter(item => item.day <= day),
      traces: traces.filter(trace => trace.day <= day),
      events: [...timeline, ...withdrawals.map(event => ({ id: event.id, day: event.day, type: 'withdrawal', title: '模拟撤回一条记忆', detail: '仅影响本次演示的活动视图；没有执行真实删除。', memoryIds: [event.memoryId] }))].filter(event => event.day <= day),
      withdrawals: withdrawals.filter(event => event.day <= day),
      capabilities: { mode: 'mock', read: true, realForget: false, simulatedWithdrawal: true, evaluation: false, dshIntegration: false }
    });
  }
  return {
    mode: 'mock',
    getSnapshot: snapshot,
    withdraw(id, day) {
      if (day !== 14) throw new Error('请在 Day 14 当前视图模拟撤回，历史快照只读');
      const record = snapshot(day).memories.find(memory => memory.id === id);
      if (!record || record.status !== 'active') throw new Error('只能撤回当前有效记忆');
      const event = { id: `mock-withdraw-${withdrawals.length + 1}`, memoryId: id, day, provenance: 'mock', effects: { ui: 'simulated', storage: 'not-performed', index: 'not-performed', cache: 'not-performed', backup: 'unknown' } };
      withdrawals.push(event);
      return structuredClone(event);
    },
    reset() { withdrawals = []; },
    exportSnapshot(day) { return { schemaVersion: 1, exportedAt: new Date().toISOString(), disclaimer: '合成演示数据；不代表真实 API 记录或评测结果', snapshot: snapshot(day) }; }
  };
}

export function filterMemories(snapshot, { query = '', kind = 'all', status = 'all' } = {}) {
  const term = query.trim().toLocaleLowerCase();
  return snapshot.memories.filter(memory =>
    (kind === 'all' || memory.kind === kind) &&
    (status === 'all' || memory.status === status) &&
    `${memory.title} ${memory.summary} ${memory.id} ${memory.scope}`.toLocaleLowerCase().includes(term)
  );
}
