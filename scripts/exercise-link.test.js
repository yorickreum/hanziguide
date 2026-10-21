const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const linkSource = fs.readFileSync(path.join(root, 'assets/js/utils/exercise-link.js'), 'utf8').replace('export function', 'function');
const presetSource = fs.readFileSync(path.join(root, 'assets/js/utils/practice-preset.js'), 'utf8').replace('export function', 'function');
const api = { URLSearchParams };
vm.runInNewContext(linkSource + '\n' + presetSource, api);

test('generated links restore text, language and script despite opposite saved preferences', () => {
  for (const language of ['mandarin', 'cantonese']) {
    for (const script of ['simplified', 'traditional']) {
      const url = new URL(api.buildExercisePath('謝謝', language, script), 'https://www.hanzi.guide');
      const mandarin = { checked: language !== 'mandarin' };
      const cantonese = { checked: language !== 'cantonese' };
      const scripts = ['simplified', 'traditional'].map(value => ({ value, checked: value !== script }));
      api.applyPracticePreset(url.search, {
        querySelector: selector => selector === '#show-mandarin' ? mandarin : cantonese,
        querySelectorAll: () => scripts
      });
      assert.equal(decodeURIComponent(url.hash.slice(1)), '謝謝');
      assert.equal(mandarin.checked, language === 'mandarin');
      assert.equal(cantonese.checked, language === 'cantonese');
      assert.equal(scripts.find(item => item.checked).value, script);
    }
  }
});

test('input limits match the workspace and never silently truncate a sentence', () => {
  assert.ok(api.buildExercisePath('我今天學中文', 'mandarin', 'traditional'));
  assert.ok(api.buildExercisePath('𠮷𠮷𠮷', 'mandarin', 'traditional'));
  assert.throws(() => api.buildExercisePath('我今天學中文了', 'mandarin', 'traditional'), /shorter groups/);
  assert.throws(() => api.buildExercisePath('𠮷𠮷𠮷𠮷', 'mandarin', 'traditional'), /shorter groups/);
  for (const text of ['', '你好！', '你 好', 'hello', '<script>', '你好#水', '你好?x=1']) {
    assert.throws(() => api.buildExercisePath(text, 'mandarin', 'simplified'), /Hanzi only/);
  }
});

test('links trim outer whitespace and reject unsupported options', () => {
  assert.equal(api.buildExercisePath(' 你好 ', 'mandarin', 'simplified'), '/?pronunciation=mandarin&script=simplified#%E4%BD%A0%E5%A5%BD');
  assert.throws(() => api.buildExercisePath('你好', 'both', 'simplified'), /Choose/);
  assert.throws(() => api.buildExercisePath('你好', 'mandarin', 'auto'), /Choose/);
});

function element(value = '') {
  return {
    value, hidden: false, textContent: '', attributes: {},
    addEventListener(event, callback) { this[event] = callback; },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; delete this[name]; },
    focus() { this.focused = true; }, select() { this.selected = true; }
  };
}
function builder({ clipboardFails = false } = {}) {
  const text = element('你好'), pronunciation = element('mandarin'), script = element('simplified');
  const fields = { text, pronunciation, script };
  const form = element(); form.elements = { namedItem: name => fields[name] };
  const result = element(), status = element(), output = element(), open = element(), copy = element();
  const parts = { form, result, status, url: output, open, copy };
  const rootEl = {
    dataset: { siteUrl: 'https://www.hanzi.guide' },
    querySelector: selector => parts[selector.match(/data-exercise-([^\]]+)/)[1]]
  };
  const copied = [];
  const source = fs.readFileSync(path.join(root, 'assets/js/tutor.js'), 'utf8').replace(/^import[^\n]+\n/, '');
  vm.runInNewContext(source, {
    document: { querySelector: () => rootEl }, URL, buildExercisePath: api.buildExercisePath,
    navigator: { clipboard: { async writeText(value) { if (clipboardFails) throw Error('blocked'); copied.push(value); } } }
  });
  return { ...fields, form, result, status, output, open, copy, copied };
}

test('builder updates practice links and hides stale links when text becomes invalid', () => {
  const app = builder();
  assert.match(app.output.value, /^https:\/\/www.hanzi.guide\//);
  app.text.value = '謝謝'; app.pronunciation.value = 'cantonese'; app.script.value = 'traditional';
  app.form.change();
  assert.match(app.open.href, /pronunciation=cantonese&script=traditional/);
  assert.equal(app.open.textContent, 'Open practice for 謝謝');
  app.text.value = '你好！'; app.form.input();
  assert.equal(app.result.hidden, true);
  assert.equal(app.output.value, '');
  assert.equal(app.open.href, undefined);
  assert.match(app.status.textContent, /Hanzi only/);
  app.text.value = '水'; app.form.input();
  assert.equal(app.result.hidden, false);
  assert.equal(app.text.attributes['aria-invalid'], undefined);
});

test('copy uses the canonical exercise URL and falls back to selecting the link when blocked', async () => {
  const app = builder();
  await app.copy.click();
  assert.deepEqual(app.copied, [app.output.value]);
  assert.match(app.status.textContent, /copied/);
  const blocked = builder({ clipboardFails: true });
  await blocked.copy.click();
  assert.equal(blocked.output.selected, true);
  assert.equal(blocked.output.focused, true);
  assert.match(blocked.status.textContent, /Copy command/);
});
