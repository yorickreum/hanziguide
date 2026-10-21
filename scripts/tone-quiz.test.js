const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, '_data/tone_quiz.json'), 'utf8'));
const modelSource = fs.readFileSync(path.join(root, 'assets/js/utils/tone-quiz-session.js'), 'utf8').replace(/export /g, '');
const appSource = fs.readFileSync(path.join(root, 'assets/js/tone-quiz.js'), 'utf8').replace(/^import[^\n]+\n/gm, '');
const model = vm.runInNewContext(modelSource + '\n({ createToneRound, ToneQuizSession });');

test('rounds cover every tone, balance the distribution and never repeat a character', () => {
  for (const [language, bank] of Object.entries(data)) {
    assert.equal(new Set(bank.questions.map(q => q.character)).size, bank.questions.length);
    assert.ok(bank.questions.every(q => bank.tones.some(t => t.number === q.tone)));
    for (let i = 0; i < 20; i++) {
      const round = model.createToneRound(bank.questions);
      assert.equal(round.length, 10, language);
      assert.equal(new Set(round.map(q => q.character)).size, 10);
      const counts = bank.tones.map(t => round.filter(q => q.tone === t.number).length);
      assert.ok(Math.min(...counts) > 0);
      assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
    }
  }
});

test('a question requires successful listening and only the first answer counts', () => {
  const session = new model.ToneQuizSession(data.mandarin.questions.slice(0, 2));
  assert.equal(session.answer(1), null);
  assert.equal(session.next(), false);
  session.markHeard();
  assert.equal(session.answer(2).correct, false);
  assert.equal(session.answer(1), null);
  assert.equal(session.score, 0);
  assert.equal(session.next(), true);
  assert.equal(session.answer(1), null);
  session.markHeard(); session.answer(1); session.next();
  assert.equal(session.complete, true);
  assert.equal(session.score, 1);
  assert.equal(session.next(), false);
  assert.equal(session.answer(1), null);
});

function element() {
  const classes = new Set();
  return {
    hidden: false, disabled: false, checked: false, textContent: '', children: [], dataset: {},
    classList: {
      add(...names) { names.forEach(n => classes.add(n)); },
      remove(...names) { names.forEach(n => classes.delete(n)); },
      toggle(name, force) { if (force) classes.add(name); else classes.delete(name); }
    },
    addEventListener(name, handler) { this[name] = handler; },
    appendChild(child) { this.children.push(child); },
    removeAttribute(name) { delete this[name]; },
    focus() { this.focused = true; }
  };
}
function app({ missingVoice = false, saved = null, unsupported = false } = {}) {
  const names = ['app', 'language', 'intro', 'results', 'round', 'start', 'listen', 'audio-status', 'progress', 'feedback', 'answer-links', 'practice', 'next', 'score', 'review', 'restart', 'listening', 'reset'];
  const ui = Object.fromEntries(names.map(name => [name, element()]));
  ['results', 'round', 'feedback', 'answer-links', 'next', 'app'].forEach(name => { ui[name].hidden = true; });
  const inputs = ['mandarin', 'cantonese'].map(value => Object.assign(element(), { value }));
  const groups = Object.fromEntries(Object.entries(data).map(([language, bank]) => {
    const group = element(); group.dataset.quizOptions = language;
    group.buttons = bank.tones.map(tone => Object.assign(element(), { dataset: { tone: String(tone.number) }, disabled: true }));
    group.querySelectorAll = () => group.buttons;
    return [language, group];
  }));
  const events = {}, timers = new Map(), spoken = [];
  const voice = { name: 'exact language voice' };
  let voiceAvailable = !missingVoice;
  const quizRoot = {
    classList: element().classList,
    querySelector(selector) {
      const option = selector.match(/data-quiz-options="([^"]+)"/);
      return option ? groups[option[1]] : ui[selector.match(/data-quiz-([^\]]+)/)[1]];
    },
    querySelectorAll(selector) {
      if (selector.startsWith('input')) return inputs;
      if (selector === '[data-tone]') return Object.values(groups).flatMap(g => g.buttons);
      return Object.values(groups);
    }
  };
  const synth = {
    speak(speech) { spoken.push(speech); }, cancel() {},
    addEventListener(name, handler) { events[name] = handler; }
  };
  const document = {
    getElementById(id) {
      if (id === 'tone-quiz') return quizRoot;
      if (id === 'tone-quiz-data') return { textContent: JSON.stringify(data) };
      return element();
    },
    createElement: element,
    createTextNode: text => ({ textContent: text })
  };
  const context = {
    document, console, localStorage: { getItem: () => saved },
    window: {
      speechSynthesis: unsupported ? undefined : synth,
      SpeechSynthesisUtterance: unsupported ? undefined : function (text) { this.text = text; },
      addEventListener(name, handler) { events[name] = handler; }
    },
    setTimeout(fn) { const id = Symbol(); timers.set(id, fn); return id; },
    clearTimeout(id) { timers.delete(id); },
    findSpeechVoice: () => voiceAvailable ? voice : null,
    createToneRound: model.createToneRound, ToneQuizSession: model.ToneQuizSession
  };
  vm.runInNewContext(appSource, context);
  return {
    ui, inputs, groups, spoken, events, voice, timers,
    setVoice(value) { voiceAvailable = value; events.voiceschanged(); },
    select(language) { inputs.forEach(input => { input.checked = input.value === language; }); inputs.find(input => input.checked).change(); },
    answerCorrect(language = 'mandarin') {
      const speech = spoken.at(-1);
      const question = data[language].questions.find(q => q.character === speech.text);
      speech.onend();
      groups[language].buttons.find(button => Number(button.dataset.tone) === question.tone).click();
      return question;
    }
  };
}

test('quiz hides the answer until playback completes and a tone is chosen', () => {
  const quiz = app();
  quiz.ui.start.click();
  assert.equal(quiz.spoken.length, 1);
  assert.equal(quiz.spoken[0].voice, quiz.voice);
  assert.equal(quiz.spoken[0].lang, 'zh-CN');
  assert.equal(quiz.ui.language.disabled, true);
  assert.equal(quiz.ui.feedback.hidden, true);
  assert.equal(quiz.ui.practice.href, undefined);
  quiz.groups.mandarin.buttons[0].click();
  assert.equal(quiz.ui.feedback.hidden, true, 'no answer before successful playback');
  const question = quiz.answerCorrect();
  assert.equal(quiz.ui.feedback.hidden, false);
  assert.ok(quiz.ui.feedback.children.some(child => child.textContent.includes(question.reading)));
  assert.ok(quiz.ui.practice.href.includes(encodeURIComponent(question.character)));
  assert.ok(quiz.groups.mandarin.buttons.every(button => button.disabled));
  quiz.groups.mandarin.buttons[0].click();
  assert.match(quiz.ui.progress.textContent, /1 correct/);
});

test('ten answers produce a score, a review, and a playable new round', () => {
  const quiz = app();
  quiz.ui.start.click();
  for (let i = 0; i < 10; i++) {
    quiz.answerCorrect(); quiz.ui.next.click();
  }
  assert.equal(quiz.ui.results.hidden, false);
  assert.equal(quiz.ui.round.hidden, true);
  assert.match(quiz.ui.score.textContent, /10 \/ 10 correct in Mandarin/);
  assert.equal(quiz.ui.review.children.length, 10);
  assert.equal(quiz.ui.language.disabled, false);
  quiz.ui.restart.click();
  assert.equal(quiz.ui.results.hidden, true);
  assert.match(quiz.ui.progress.textContent, /Question 1 of 10 · 0 correct/);
});

test('missing voices and unsupported speech block play; voices can become available later', () => {
  for (const opts of [{ missingVoice: true }, { unsupported: true }]) {
    const quiz = app(opts);
    assert.equal(quiz.ui.start.disabled, true);
    quiz.ui.start.click();
    assert.equal(quiz.spoken.length, 0);
    assert.match(quiz.ui['audio-status'].textContent, /matching voice/);
  }
  const quiz = app({ missingVoice: true });
  quiz.setVoice(true);
  assert.equal(quiz.ui.start.disabled, false);
  quiz.ui.start.click();
  assert.equal(quiz.spoken.length, 1);
});

test('Cantonese preference plays Cantonese and language changes reset the round', () => {
  const quiz = app({ saved: 'cantonese' });
  quiz.ui.start.click();
  assert.equal(quiz.spoken[0].lang, 'zh-HK');
  quiz.answerCorrect('cantonese');
  assert.match(quiz.ui.practice.href, /pronunciation=cantonese&script=traditional/);
  quiz.ui.reset.click();
  assert.equal(quiz.ui.language.disabled, false);
  assert.equal(quiz.ui.intro.hidden, false);
  quiz.select('mandarin'); quiz.ui.start.click();
  assert.equal(quiz.spoken.at(-1).lang, 'zh-CN');
});

test('audio failure or timeout allows replay without scoring; stale audio callbacks do nothing', () => {
  for (const fail of ['error', 'timeout']) {
    const quiz = app();
    quiz.ui.start.click();
    const oldSpeech = quiz.spoken[0];
    if (fail === 'error') oldSpeech.onerror(); else [...quiz.timers.values()][0]();
    assert.equal(quiz.ui.listen.disabled, false);
    assert.ok(quiz.groups.mandarin.buttons.every(button => button.disabled));
    assert.match(quiz.ui.listening.textContent, /could not play/);
    quiz.ui.listen.click(); quiz.answerCorrect();
    assert.match(quiz.ui.progress.textContent, /1 correct/);
    quiz.ui.next.click();
    oldSpeech.onend();
    assert.ok(quiz.groups.mandarin.buttons.every(button => button.disabled));
    quiz.ui.reset.click();
    assert.doesNotThrow(() => quiz.spoken.at(-1).onend());
  }
});

test('browser Back restores replay after interrupted audio without accepting an unheard answer', () => {
  const quiz = app();
  quiz.ui.start.click();
  const interrupted = quiz.spoken[0];
  quiz.events.pagehide();
  quiz.events.pageshow({ persisted: true });
  interrupted.onend();
  assert.equal(quiz.ui.listen.disabled, false);
  assert.ok(quiz.groups.mandarin.buttons.every(button => button.disabled));
  assert.match(quiz.ui.listening.textContent, /Listen again/);
  assert.equal(quiz.spoken.length, 1, 'returning does not autoplay');
  quiz.ui.listen.click();
  quiz.answerCorrect();
  assert.match(quiz.ui.progress.textContent, /1 correct/);
});

test('browser Back during an answered question replay preserves the score and restores Next', () => {
  const quiz = app();
  quiz.ui.start.click(); quiz.answerCorrect();
  quiz.ui.listen.click();
  quiz.events.pagehide();
  quiz.events.pageshow({ persisted: true });
  assert.equal(quiz.ui.listen.disabled, false);
  assert.equal(quiz.ui.next.disabled, false);
  assert.ok(quiz.groups.mandarin.buttons.every(button => button.disabled));
  assert.match(quiz.ui.progress.textContent, /1 correct/);
  quiz.ui.next.click();
  assert.match(quiz.ui.progress.textContent, /Question 2 of 10 · 1 correct/);
});
