import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { renderMockStory } from '../src/mock-story.js';

test('published single-file task rendering matches modules at every step and evidence state', () => {
  const html = readFileSync(new URL('../双击打开演示.html', import.meta.url), 'utf8');
  const marker = '<script>(()=>{';
  const start = html.indexOf(marker);
  const end = html.indexOf('function safeReplaceState(', start);
  assert.ok(start >= 0 && end > start, 'standalone app script boundaries exist');
  // Execute the actual bundled renderers together, before browser app startup.
  // Module-only tests cannot catch one module overriding another in this bundle.
  const api = runInNewContext('(()=>{' + html.slice(start + marker.length, end) +
    ';return {renderMockStory,renderOsworldStory};})()', {}, { timeout: 2000 });
  for (const mode of ['formation', 'reuse']) {
    for (const variant of ['injected', 'adopted', 'checked', 'blocked']) {
      for (let step = 0; step < 4; step++) {
        assert.equal(api.renderMockStory(mode, step, variant), renderMockStory(mode, step, variant),
          `${mode}, step ${step}, ${variant}: bundled renderer must match source`);
      }
    }
  }
  assert.match(api.renderOsworldStory('formation', { demo: true, step: 0 }), /把下载文件分成图片和文档/);
  assert.match(api.renderOsworldStory('formation'), /LibreOffice Calc/);
  assert.doesNotMatch(api.renderOsworldStory('formation'), /mock-run-file-sort/);
});
