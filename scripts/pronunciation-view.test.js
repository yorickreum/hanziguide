const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/utils/pronunciation-view.js'), 'utf8')
  .replace('export function', 'function');

function guide({ saved = null, storageBlocked = false, hash = '' } = {}) {
  const listeners = {}, stored = [], inputs = ['mandarin', 'cantonese', 'both'].map(value => ({
    value, checked: false, addEventListener(event, fn) { this[event] = fn; }
  }));
  const control = { hidden: true, querySelectorAll: () => inputs };
  // Cover the section, navigation, reference, example and practice-link groups.
  const sections = ['mandarin', 'cantonese', 'mandarin', 'cantonese', 'mandarin', 'cantonese'].map(language => ({
    hidden: false, dataset: { pronunciationLanguage: language }
  }));
  let scrolls = 0, cancellations = 0;
  const targets = {
    'pinyin-title': { closest: () => sections[0], scrollIntoView() { scrolls++; } },
    'cantonese-buy-sell': { closest: () => sections[1], scrollIntoView() { scrolls++; } }
  };
  const window = {
    location: { hash },
    localStorage: {
      getItem() { if (storageBlocked) throw Error('blocked'); return saved; },
      setItem(key, value) { if (storageBlocked) throw Error('blocked'); stored.push([key, value]); }
    },
    speechSynthesis: { cancel() { cancellations++; } },
    addEventListener(event, fn) { listeners[event] = fn; }
  };
  const document = {
    querySelector: () => control,
    querySelectorAll: () => sections,
    getElementById: id => targets[id]
  };
  vm.runInNewContext(source + '\ninitPronunciationView(document, window);', { document, window });
  return {
    inputs, sections, control, stored, listeners, window,
    get scrolls() { return scrolls; }, get cancellations() { return cancellations; },
    choose(value) {
      inputs.forEach(input => { input.checked = input.value === value; });
      inputs.find(input => input.value === value).change();
    }
  };
}

test('first visit shows both languages and enables the native radio switch', () => {
  const app = guide();
  assert.equal(app.control.hidden, false);
  assert.equal(app.inputs[2].checked, true);
  assert.ok(app.sections.every(section => !section.hidden));
});

test('switch filters language groups, saves the choice and stops current speech', () => {
  const app = guide();
  for (const value of ['mandarin', 'cantonese', 'both']) {
    app.choose(value);
    assert.ok(app.sections.every(section => section.hidden === (value !== 'both' && section.dataset.pronunciationLanguage !== value)));
    assert.equal(app.inputs.filter(input => input.checked).length, 1);
    assert.deepEqual(app.stored.at(-1), ['pronunciation-guide-view', value]);
  }
  assert.equal(app.cancellations, 3);
});

test('saved preference is restored; invalid or unavailable storage falls back to both', () => {
  assert.equal(guide({ saved: 'cantonese' }).inputs[1].checked, true);
  assert.equal(guide({ saved: 'invalid' }).inputs[2].checked, true);
  const blocked = guide({ storageBlocked: true });
  assert.equal(blocked.inputs[2].checked, true);
  blocked.choose('mandarin');
  assert.equal(blocked.sections[1].hidden, true);
});

test('direct links reveal their language despite a different saved preference', () => {
  const app = guide({ saved: 'mandarin', hash: '#cantonese-buy-sell' });
  assert.equal(app.inputs[1].checked, true);
  assert.equal(app.scrolls, 1);
  app.window.location.hash = '#pinyin-title';
  app.listeners.hashchange();
  assert.equal(app.inputs[0].checked, true);
  assert.equal(app.scrolls, 2);
  app.window.location.hash = '#%invalid';
  assert.doesNotThrow(() => app.listeners.hashchange());
});
