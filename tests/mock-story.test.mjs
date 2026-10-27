import test from 'node:test';
import assert from 'node:assert/strict';
import { getMockReuseEvidence, renderMockStory } from '../src/mock-story.js';
import { renderOsworldStory } from '../src/osworld-story.js';

test('injection alone never implies adoption or a verified result', () => {
  for (let step = 0; step < 4; step++) {
    const e = getMockReuseEvidence(step, 'injected');
    assert.equal(e.adopted, false);
    assert.equal(e.checked, false);
    assert.equal(e.injected, step >= 2);
  }
  const html = renderMockStory('reuse', 3, 'injected');
  assert.match(html, /采用与结果均未知/);
  assert.doesNotMatch(html, />370</);
});

test('adoption and checking require their own stage and evidence', () => {
  assert.equal(getMockReuseEvidence(3, 'adopted').checked, false);
  assert.match(renderMockStory('reuse', 3, 'adopted'), /缺少产物检查，结果未知/);
  assert.equal(getMockReuseEvidence(1, 'checked').adopted, false);
  assert.equal(getMockReuseEvidence(2, 'checked').adopted, true);
  assert.equal(getMockReuseEvidence(2, 'checked').checked, false);
  assert.equal(getMockReuseEvidence(3, 'checked').checked, true);
  assert.doesNotMatch(renderMockStory('reuse', 2, 'checked'), />370</);
  assert.match(renderMockStory('reuse', 3, 'checked'), /不是 OSWorld evaluator 结果/);
});

test('rejected candidates have no injection, adoption or check at any stage', () => {
  for (let step = 0; step < 4; step++) {
    const e = getMockReuseEvidence(step, 'blocked');
    assert.equal(e.selected, false);
    assert.equal(e.injected, false);
    assert.equal(e.adopted, false);
    assert.equal(e.checked, false);
  }
  assert.match(renderMockStory('reuse', 3, 'blocked'), /未注入 → 未执行 → 无结果/);
});

test('public view excludes synthetic records; every mock stage has provenance', () => {
  assert.doesNotMatch(renderOsworldStory('reuse'), /mock-run-hours-next|mock-check-hours/);
  for (const story of ['formation', 'reuse']) for (let step = 0; step < 4; step++) {
    const html = renderMockStory(story, step, 'checked');
    assert.match(html, /MOCK · 人工预设演示/);
    assert.match(html, /没有执行 OSWorld/);
  }
  assert.equal(getMockReuseEvidence('invalid', 'invalid').stage, 0);
  assert.equal(getMockReuseEvidence(999, 'invalid').scenario, 'injected');
});


test('the hours method carries into a new task without revealing a checked result early', () => {
  assert.match(renderMockStory('formation',3),/先统一单位，再算金额/);
  assert.match(renderMockStory('formation',3),/data-story="reuse"/);
  const start=renderMockStory('reuse',0,'checked');
  assert.match(start,/先统一单位，再算金额/);
  assert.match(start,/9 小时 15 分钟/);
  assert.doesNotMatch(start,/>370<|MOCK 已记录采用/);
  const final=renderMockStory('reuse',3,'checked');
  assert.match(final,/9\.25 × 40 = 370/);
  assert.match(final,/>370</);
  assert.doesNotMatch(final,/Invoice|透视表|mock-case-pivot/);
});
