import test from 'node:test';
import assert from 'node:assert/strict';
import { renderOsworldStory } from '../src/osworld-story.js';

test('experience formation uses the real work-hours task but leaves run evidence unfilled', () => {
  const html = renderOsworldStory('formation');
  assert.match(html, /357ef137-7eeb-4c80-a3bb-0951f26a8aff/);
  assert.match(html, /时间值、时薪是数字/);
  assert.match(html, /设计者提出的候选/);
  assert.match(html, /运行轨迹未采集/);
  assert.match(html, /尚未运行/);
  assert.match(html, /未生成真实 Case/);
  assert.doesNotMatch(html, /执行成功|真实 Case 已形成|评分通过/);
});

test('reuse distinguishes the source and target tasks and does not equate injection with adoption', () => {
  const html = renderOsworldStory('reuse');
  assert.match(html, /51719eea-10bc-4246-a428-ac7c433dd4b3/);
  assert.match(html, /1954cced-e748-45c4-9c26-9855b97fbc5e/);
  assert.match(html, /求和 ≠ 计数/);
  assert.match(html, /拟议配对/);
  assert.match(html, /即使将来有注入，也不能据此断言 Agent 已采用/);
  assert.match(html, /044bc33901cb893808e3f91ebc9a17ed8e54b44c/);
  assert.doesNotMatch(html, /真实执行成功|提升\d+%/);
});
