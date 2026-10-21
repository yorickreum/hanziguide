const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const guideSource = fs.readFileSync(path.join(root, 'assets/js/pronunciation-guide.js'), 'utf8')
  .replace(/^import[^\n]+\n/, '');

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

function lesson({ voice = true, writer = true } = {}) {
  const listens = [], writers = [], voiceEvents = {};
  const card = element();
  card.dataset = { character: '湯', language: 'zh-HK' };
  const audio = element(), actions = element(), target = element(), status = element();
  const animate = element(), quiz = element();
  animate.dataset.writingMode = 'animate'; quiz.dataset.writingMode = 'quiz';
  actions.querySelectorAll = () => [animate, quiz];
  const parts = { '.tone-pair-listen': audio, '.tone-pair-actions': actions, '.tone-pair-writer': target, '.tone-pair-status': status };
  card.querySelector = selector => parts[selector];
  const example = element();
  example.querySelector = () => ({ textContent: '水' });
  const table = { dataset: { speechLanguage: 'zh-CN' }, querySelectorAll: () => [{ querySelector: () => example }] };
  const soundExample = element();
  soundExample.querySelector = () => ({ textContent: '花' });
  const soundTable = { dataset: { speechLanguage: 'zh-HK' }, querySelectorAll: () => [{ querySelector: () => soundExample }] };
  const context = {
    window: {
      SpeechSynthesisUtterance: function () {},
      speechSynthesis: { addEventListener(event, fn) { voiceEvents[event] = fn; } }
    },
    document: { querySelectorAll: selector => selector.startsWith('.pronunciation-tone-table') ? (selector.includes('.pronunciation-sound-table') ? [table, soundTable] : [table]) : [card] },
    createSpeechButton(character, language) {
      const button = element(); button.setAttribute('aria-label', 'Listen: ' + character);
      listens.push({ character, language, button }); return button;
    },
    refreshSpeechButtons() {},
    findSpeechVoice: () => voice ? {} : null
  };
  if (writer) context.window.HanziWriter = {
    create(node, character, options) {
      const instance = {
        node, character, options, animations: 0, quizzes: 0, cancelled: 0,
        cancelQuiz() { this.cancelled++; },
        animateCharacter() { this.animations++; return Promise.resolve(); },
        quiz(config) { this.quizzes++; this.config = config; return Promise.resolve(); }
      };
      writers.push(instance); return instance;
    }
  };
  vm.runInNewContext(guideSource, context);
  return { listens, writers, animate, quiz, actions, target, status, voiceEvents };
}

test('tone charts, sound tables and contrast cards request the correct character and language', () => {
  const app = lesson();
  assert.deepEqual(app.listens.map(({ character, language }) => [character, language]), [['水', 'zh-CN'], ['花', 'zh-HK'], ['湯', 'zh-HK']]);
  assert.ok(app.listens.every(({ button }) => !button.disabled));
  assert.equal(app.writers.length, 0, 'stroke data stays unloaded until requested');
});

test('watch and write share one lazily created HanziWriter with quiz feedback', () => {
  const app = lesson();
  app.animate.click();
  assert.equal(app.target.hidden, false);
  assert.equal(app.writers[0].character, '湯');
  assert.equal(app.writers[0].animations, 1);
  app.quiz.click();
  assert.equal(app.writers.length, 1);
  assert.equal(app.writers[0].quizzes, 1);
  assert.match(app.status.textContent, /Draw the strokes/);
  app.writers[0].config.onComplete();
  assert.match(app.status.textContent, /Well done/);
});

test('unavailable lesson voices are disabled, including while voices are loading', () => {
  const app = lesson({ voice: false });
  assert.ok(app.listens.every(({ button }) => button.disabled));
  assert.ok(app.voiceEvents.voiceschanged);
});

test('missing or failed stroke data preserves the full practice fallback', () => {
  const missing = lesson({ writer: false });
  assert.equal(missing.actions.hidden, true);
  const app = lesson();
  app.animate.click();
  app.writers[0].options.onLoadCharDataError();
  assert.equal(app.actions.hidden, true);
  assert.equal(app.target.hidden, true);
  assert.match(app.status.textContent, /full practice link/);
});
