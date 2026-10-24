const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = name => fs.readFileSync(require('node:path').join(__dirname, '../assets/js/', name), 'utf8');

test('learning starts and completion milestones are deduplicated without initial interaction events', () => {
  const window = {};
  vm.runInNewContext(source('learning-metrics.js'), { window, Date });
  assert.equal(window._paq, undefined);
  window.hanziLearning.practiceStarted();
  window.hanziLearning.practiceStarted();
  window.hanziLearning.practiceCompleted('DrawingComplete');
  window.hanziLearning.practiceCompleted('DrawingComplete');
  assert.equal(window._paq.length, 2);
  assert.equal(window._paq[0][2], 'PracticeStart');
  assert.equal(window._paq[1][2], 'DrawingComplete');
});

function ads() {
  let intersection, mutation, visibility;
  let timer = null;
  const unit = { dataset: { adPlacement: 'practice-mobile', adRequested: 'true' }, status: null,
    getAttribute() { return this.status; } };
  class IntersectionObserver { constructor(fn) { intersection = fn; } observe() {} }
  class MutationObserver { constructor(fn) { mutation = fn; } observe() {} }
  const document = { hidden: false, querySelectorAll: () => [unit], addEventListener: (_, fn) => { visibility = fn; } };
  const window = { IntersectionObserver, MutationObserver, location: { pathname: '/' } };
  vm.runInNewContext(source('ad-metrics.js'), {window, document, IntersectionObserver, MutationObserver,
    setTimeout: fn => { timer = fn; return 1; }, clearTimeout: () => { timer = null; }});
  return {window, document, unit, change: () => mutation(), visibility: () => visibility(),
    visible: ratio => intersection([{isIntersecting: ratio > 0, intersectionRatio: ratio}]),
    tick: () => { const fn = timer; timer = null; if (fn) fn(); },
    stages: () => Array.from(window._paq, event => event[2])};
}

test('only a filled ad visible for one continuous second produces the visibility diagnostic', () => {
  const app = ads();
  app.visible(1); app.tick();
  assert.deepEqual(app.stages(), ['requested']);
  app.unit.status = 'filled'; app.change();
  app.visible(0.4); app.tick();
  assert.deepEqual(app.stages(), ['requested', 'filled']);
  app.visible(0.5); app.document.hidden = true; app.visibility(); app.tick();
  assert.deepEqual(app.stages(), ['requested', 'filled']);
  app.document.hidden = false; app.visibility(); app.tick();
  app.visible(1); app.tick(); app.change();
  assert.deepEqual(app.stages(), ['requested', 'filled', 'visible-1s']);
  assert.ok(app.window._paq.every(event => event[0] === 'trackContentImpression'));
});

test('empty ads and library errors are recorded once without counting as learning interactions', () => {
  const app = ads();
  app.unit.status = 'unfilled'; app.change(); app.change();
  app.unit.dataset.adFailed = 'true'; app.change(); app.visible(1); app.tick();
  assert.deepEqual(app.stages(), ['requested', 'unfilled', 'library-error']);
});
