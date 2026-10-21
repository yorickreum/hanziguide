const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const sharedSource = fs.readFileSync(path.join(root, 'assets/js/utils/speech.js'), 'utf8')
  .replace(/export \{[^}]+\};/, '');

function element() {
  return {
    hidden: true, disabled: false, textContent: '', dataset: {}, children: [], attributes: {},
    classList: { add() {}, remove() {} },
    appendChild(child) { this.children.push(child); },
    setAttribute(key, value) { this.attributes[key] = value; },
    getAttribute(key) { return this.attributes[key]; },
    addEventListener(event, callback) { this[event] = callback; }
  };
}

function sharedSpeech(voices) {
  const spoken = [], scheduled = new Map();
  let timer = 0, cancellations = 0;
  const synth = {
    getVoices: () => voices,
    addEventListener() {},
    speak(utterance) { spoken.push(utterance); this.speaking = true; utterance.onstart(); },
    cancel() { cancellations++; this.speaking = false; }
  };
  const context = {
    window: { speechSynthesis: synth, SpeechSynthesisUtterance: function () {} },
    document: { getElementById: () => null, createElement: element, documentElement: { contains: () => true } },
    SpeechSynthesisUtterance: function (text) { this.text = text; },
    setTimeout(callback) { scheduled.set(++timer, callback); return timer; },
    clearTimeout(id) { scheduled.delete(id); }
  };
  vm.runInNewContext(sharedSource, context);
  return {
    api: context, spoken, synth,
    flush() { for (const [id, fn] of scheduled) { scheduled.delete(id); fn(); } },
    get cancellations() { return cancellations; }
  };
}

test('shared controls select Cantonese and Mandarin voices without confusing them', () => {
  const cantonese = { lang: 'zh-HK', name: 'Cantonese' };
  const mandarin = { lang: 'zh-CN', name: 'Mandarin' };
  const app = sharedSpeech([mandarin, cantonese]);
  const button = app.api.createSpeechButton('買', 'zh-HK', false);
  button.click(); app.flush();
  assert.equal(app.spoken[0].text, '買');
  assert.equal(app.spoken[0].voice, cantonese);
  assert.equal(app.spoken[0].lang, 'zh-HK');
  button.click(); app.flush();
  assert.equal(app.spoken.length, 1, 'repeated clicks do not restart the same syllable');
  const other = app.api.createSpeechButton('问', 'zh-CN', false);
  other.click(); app.flush();
  assert.equal(app.spoken[1].voice, mandarin);
  assert.equal(app.cancellations, 1);
});

test('Taiwanese Mandarin voices match Mandarin without matching Cantonese', () => {
  for (const tag of ['zh-TW', 'zh_TW']) {
    const taiwanese = { lang: tag, name: 'Mei-Jia' };
    const app = sharedSpeech([taiwanese]);
    assert.equal(app.api.findSpeechVoice('zh-CN'), taiwanese);
    assert.equal(app.api.findSpeechVoice('zh-HK'), null);
    app.api.createSpeechButton('水', 'zh-CN', false).click();
    app.flush();
    assert.equal(app.spoken[0].voice, taiwanese);
  }
});

test('main practice still disables unavailable Cantonese audio', () => {
  const app = sharedSpeech([{ lang: 'zh-CN', name: 'Mandarin' }]);
  const button = app.api.createSpeechButton('湯', 'zh-HK', false);
  app.api.refreshSpeechButtons();
  assert.equal(button.disabled, true);
  button.click(); app.flush();
  assert.equal(app.spoken.length, 0);
});

function preset(search) {
  const mandarin = { checked: true }, cantonese = { checked: false };
  const scripts = [{ value: 'simplified', checked: true }, { value: 'traditional', checked: false }];
  const context = { URLSearchParams };
  const source = fs.readFileSync(path.join(root, 'assets/js/utils/practice-preset.js'), 'utf8')
    .replace('export function', 'function');
  vm.runInNewContext(source, context);
  context.applyPracticePreset(search, {
    querySelector: selector => selector === '#show-mandarin' ? mandarin : cantonese,
    querySelectorAll: () => scripts
  });
  return { mandarin: mandarin.checked, cantonese: cantonese.checked, scripts: scripts.map(input => input.checked) };
}

test('Cantonese lesson links select Cantonese and traditional characters in full practice', () => {
  assert.deepEqual(preset('?pronunciation=cantonese&script=traditional'), {
    mandarin: false, cantonese: true, scripts: [false, true]
  });
  assert.deepEqual(preset('?pronunciation=mandarin&script=simplified'), {
    mandarin: true, cantonese: false, scripts: [true, false]
  });
});

test('ordinary links and unrecognized presets leave display choices alone', () => {
  for (const search of ['', '?pronunciation=invalid&script=invalid']) {
    assert.deepEqual(preset(search), { mandarin: true, cantonese: false, scripts: [true, false] });
  }
});
