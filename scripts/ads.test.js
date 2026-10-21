const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/ads.js'), 'utf8');

function setup({ intersection = true, mutation = true } = {}) {
  const scripts = [];
  const statusObservers = [];
  const units = [makeUnit(), makeUnit()];
  let intersect;
  class IntersectionObserver {
    constructor(callback) { intersect = callback; }
    observe() {}
    unobserve() {}
  }
  class MutationObserver {
    constructor(callback) { this.callback = callback; statusObservers.push(this); }
    observe(unit) { this.unit = unit; }
    disconnect() { this.disconnected = true; }
  }
  const window = {};
  if (intersection) window.IntersectionObserver = IntersectionObserver;
  if (mutation) window.MutationObserver = MutationObserver;
  const document = {
    querySelectorAll: () => units,
    createElement: () => ({}),
    head: { appendChild: script => scripts.push(script) }
  };
  vm.runInNewContext(source, { window, document, IntersectionObserver, MutationObserver });
  return {
    units, scripts, window,
    approach(unit, visible = true) { intersect([{ target: unit, isIntersecting: visible }]); },
    status(unit, status) {
      unit.status = status;
      statusObservers.filter(observer => observer.unit === unit && !observer.disconnected)
        .forEach(observer => observer.callback());
    }
  };
}

function makeUnit() {
  const wrapper = { hidden: false };
  return {
    dataset: { adClient: 'ca-pub-123', adSlot: '456' },
    width: 300, visible: true, wrapper,
    getBoundingClientRect() { return { width: this.width }; },
    getClientRects() { return this.visible ? [{}] : []; },
    getAttribute(name) { return name === 'data-ad-status' ? this.status : null; },
    closest() { return wrapper; }
  };
}

test('blocked ad library collapses label and space, including later placements', () => {
  const app = setup();
  app.approach(app.units[0]);
  assert.equal(app.scripts.length, 1);
  app.scripts[0].onerror();
  assert.ok(app.units.every(unit => unit.wrapper.hidden));
  app.approach(app.units[1]);
  assert.equal(app.scripts.length, 1);
  assert.equal(app.window.adsbygoogle.length, 1);
});

test('unfilled inventory collapses; filled and optimized inventory remain visible', () => {
  for (const status of ['filled', 'unfilled', 'unfill-optimized']) {
    const app = setup();
    app.approach(app.units[0]);
    app.status(app.units[0], status);
    assert.equal(app.units[0].wrapper.hidden, status === 'unfilled');
  }
});

test('a filled creative is preserved even if the script error handler fires', () => {
  const app = setup();
  app.approach(app.units[0]);
  app.status(app.units[0], 'filled');
  app.scripts[0].onerror();
  assert.equal(app.units[0].wrapper.hidden, false);
});

test('slow requests keep their reserved space and each unit is requested once', () => {
  const app = setup();
  assert.equal(app.scripts.length, 0);
  app.approach(app.units[0]);
  app.approach(app.units[0]);
  app.approach(app.units[1]);
  assert.equal(app.scripts.length, 1);
  assert.equal(app.window.adsbygoogle.length, 2);
  assert.ok(app.units.every(unit => !unit.wrapper.hidden));
});

test('hidden quiz results and narrow or distant units do not request ads', () => {
  const app = setup();
  const unit = app.units[0];
  unit.visible = false;
  app.approach(unit);
  unit.visible = true;
  unit.width = 200;
  app.approach(unit);
  unit.width = 300;
  app.approach(unit, false);
  assert.equal(app.scripts.length, 0);
  app.approach(unit);
  assert.equal(app.scripts.length, 1);
});

test('unsupported browsers collapse unused placements', () => {
  const app = setup({ intersection: false });
  assert.equal(app.scripts.length, 0);
  assert.ok(app.units.every(unit => unit.wrapper.hidden));
});

test('script failure still collapses placements without MutationObserver', () => {
  const app = setup({ mutation: false });
  app.approach(app.units[0]);
  app.scripts[0].onerror();
  assert.ok(app.units.every(unit => unit.wrapper.hidden));
});
