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
function app({ missingVoice = false, saved = null, unsupported = false, mode = 'full' } = {}) {
  const names = ['app', 'language', 'mode', 'description', 'keyboard', 'intro', 'results', 'round', 'start', 'listen', 'speed', 'audio-status', 'progress', 'feedback', 'answer-links', 'practice', 'next', 'score', 'review', 'restart', 'listening', 'reset'];
  const ui = Object.fromEntries(names.map(name => [name, element()]));
  ui.speed.value = '1';
  ['results', 'round', 'feedback', 'answer-links', 'next', 'app'].forEach(name => { ui[name].hidden = true; });
  const inputs = ['mandarin', 'cantonese'].map(value => Object.assign(element(), { value }));
  const modes = ['beginner', 'full'].map(value => Object.assign(element(), { value }));
  const groups = Object.fromEntries(Object.entries(data).map(([language, bank]) => {
    const group = element(); group.dataset.quizOptions = language;
    group.buttons = bank.tones.map(tone => Object.assign(element(), { dataset: { tone: String(tone.number) }, disabled: true }));
    group.querySelectorAll = () => group.buttons;
    return [language, group];
  }));
  const references = Object.fromEntries(Object.entries(data).map(([language, bank]) => {
    const group = element(); group.dataset.quizReferences = language;
    group.tip = element(); group.querySelector = () => group.tip;
    group.buttons = bank.references.map(reference => Object.assign(element(), {
      dataset: { referenceTone: String(reference.tone), referenceCharacter: reference.character, referenceLanguage: language }
    }));
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
      if (selector.startsWith('input')) return selector.includes('quiz-mode') ? modes : inputs;
      if (selector === '[data-tone]') return Object.values(groups).flatMap(g => g.buttons);
      if (selector === '[data-reference-tone]') return Object.values(references).flatMap(g => g.buttons);
      if (selector === '[data-quiz-references]') return Object.values(references);
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
  if (mode !== 'beginner') {
    modes.forEach(input => { input.checked = input.value === mode; });
    modes.find(input => input.checked).change();
  }
  return {
    ui, inputs, modes, references, groups, spoken, events, voice, timers,
    setVoice(value) { voiceAvailable = value; events.voiceschanged(); },
    select(language) { inputs.forEach(input => { input.checked = input.value === language; }); inputs.find(input => input.checked).change(); },
    selectMode(value) { modes.forEach(input => { input.checked = input.value === value; }); modes.find(input => input.checked).change(); },
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

function pressKey(quiz, key, extra = {}) {
  const event = { key, prevented: false, preventDefault() { this.prevented = true; }, ...extra };
  quiz.events.keydown(event);
  return event;
}

test('number keys answer in either language and Enter advances after feedback', () => {
  for (const language of ['mandarin', 'cantonese']) {
    const quiz = app({ saved: language });
    assert.equal(pressKey(quiz, '1').prevented, false);
    quiz.ui.start.click();
    assert.equal(pressKey(quiz, '1').prevented, false, 'wait for audio');
    const speech = quiz.spoken.at(-1);
    const question = data[language].questions.find(q => q.character === speech.text);
    speech.onend();
    assert.equal(pressKey(quiz, String(question.tone)).prevented, true);
    assert.match(quiz.ui.progress.textContent, /1 correct/);
    assert.equal(pressKey(quiz, '1').prevented, false, 'cannot answer twice');
    assert.equal(pressKey(quiz, 'Enter').prevented, true);
    assert.match(quiz.ui.progress.textContent, /Question 2 of 10 · 1 correct/);
    assert.equal(pressKey(quiz, 'Enter').prevented, false, 'cannot skip a question');
  }
});

test('Cantonese accepts 5 and 6; Mandarin ignores them', () => {
  for (const key of ['5', '6']) {
    for (const language of ['mandarin', 'cantonese']) {
      const quiz = app({ saved: language });
      quiz.ui.start.click(); quiz.spoken.at(-1).onend();
      assert.equal(pressKey(quiz, key).prevented, language === 'cantonese');
      assert.equal(quiz.ui.feedback.hidden, language === 'mandarin');
    }
  }
});

test('quiz shortcuts ignore typing, modifiers, key repeat and native Enter controls', () => {
  const quiz = app();
  quiz.ui.start.click(); quiz.spoken.at(-1).onend();
  for (const extra of [
    { repeat: true }, { isComposing: true }, { defaultPrevented: true },
    { ctrlKey: true }, { altKey: true }, { metaKey: true }, { shiftKey: true },
    { target: { isContentEditable: true } },
    { target: { closest: selector => selector.includes('input') ? {} : null } }
  ]) {
    assert.equal(pressKey(quiz, '1', extra).prevented, false);
    assert.equal(quiz.ui.feedback.hidden, true);
  }
  assert.equal(pressKey(quiz, '0').prevented, false);
  pressKey(quiz, '1');
  assert.equal(pressKey(quiz, 'Enter', { target: { closest: () => ({}) } }).prevented, false);
  assert.match(quiz.ui.progress.textContent, /Question 1 of 10/);
});

test('beginner retries cannot advance early or inflate first-try scoring', () => {
  const questions = data.mandarin.questions.slice(0, 2);
  const session = new model.ToneQuizSession(questions, { retryWrong: true });
  session.markHeard();
  assert.equal(session.answer(4).correct, false);
  assert.equal(session.answered, false);
  assert.equal(session.next(), false);
  assert.equal(session.answer(1).correct, true);
  assert.equal(session.answered, true);
  assert.equal(session.score, 0);
  assert.equal(session.answers[0].chosen, 4);
  assert.equal(session.answer(1), null);
  session.next(); session.markHeard(); session.answer(1); session.next();
  assert.equal(session.complete, true);
  assert.equal(session.score, 1);
});

test('beginner defaults to six balanced questions with two choices in either language', () => {
  for (const language of ['mandarin', 'cantonese']) {
    const quiz = app({ mode: 'beginner', saved: language });
    assert.equal(quiz.modes[0].checked, true);
    quiz.ui.start.click();
    assert.equal(quiz.ui.mode.disabled, true);
    assert.equal(quiz.references[language].hidden, false);
    const active = quiz.groups[language].buttons.filter(button => !button.hidden).map(button => Number(button.dataset.tone));
    assert.deepEqual(active, data[language].beginner.tones);
    const seen = [], counts = new Map();
    for (let i = 0; i < 6; i++) {
      const question = quiz.answerCorrect(language);
      seen.push(question.character); counts.set(question.tone, (counts.get(question.tone) || 0) + 1);
      quiz.ui.next.click();
    }
    assert.equal(new Set(seen).size, 6);
    assert.deepEqual([...counts.values()], [3, 3]);
    assert.equal(quiz.ui.results.hidden, false);
    assert.equal(quiz.references[language].hidden, true, 'reference help is hidden on results');
    assert.match(quiz.ui.score.textContent, /All 6 questions completed/);
    assert.match(quiz.ui.score.textContent, /6 recognised on your first try/);
    assert.equal(quiz.ui.mode.disabled, false);
  }
});

test('beginner mistakes offer a retry without revealing the word or allowing Next', () => {
  const quiz = app({ mode: 'beginner' });
  quiz.ui.start.click();
  const question = data.mandarin.questions.find(q => q.character === quiz.spoken.at(-1).text);
  quiz.spoken.at(-1).onend();
  const wrong = question.tone === 1 ? 4 : 1;
  assert.equal(pressKey(quiz, String(wrong)).prevented, true);
  assert.match(quiz.ui.feedback.textContent, /Try again/);
  assert.equal(quiz.ui.next.hidden, true);
  assert.equal(quiz.ui['answer-links'].hidden, true);
  assert.equal(pressKey(quiz, 'Enter').prevented, false);
  pressKey(quiz, String(question.tone));
  assert.equal(quiz.ui.next.hidden, false);
  assert.match(quiz.ui.feedback.textContent, /You found it/);
  assert.match(quiz.ui.progress.textContent, /0 on first try/);
});

test('reference audio uses the selected language and cannot count as hearing the quiz sound', () => {
  const quiz = app({ mode: 'beginner', saved: 'cantonese' });
  quiz.ui.start.click();
  quiz.spoken.at(-1).onerror();
  const reference = quiz.references.cantonese.buttons[0];
  reference.click();
  assert.equal(quiz.spoken.at(-1).text, '詩');
  assert.equal(quiz.spoken.at(-1).lang, 'zh-HK');
  assert.ok(quiz.groups.cantonese.buttons.every(button => button.disabled));
  quiz.spoken.at(-1).onend();
  assert.ok(quiz.groups.cantonese.buttons.every(button => button.disabled), 'reference did not unlock answers');
  quiz.ui.listen.click(); quiz.spoken.at(-1).onend();
  assert.ok(quiz.groups.cantonese.buttons.filter(button => !button.hidden).every(button => !button.disabled));
  reference.click();
  quiz.events.pagehide(); quiz.events.pageshow({ persisted: true });
  assert.equal(quiz.ui.listen.disabled, false);
  assert.ok(quiz.references.cantonese.buttons.every(button => !button.disabled));
});

test('changing level resets the round; full quiz restores all tones and first-answer rules', () => {
  const quiz = app({ mode: 'beginner' });
  quiz.ui.start.click(); quiz.answerCorrect(); quiz.ui.reset.click();
  assert.equal(quiz.references.mandarin.hidden, true, 'reference help is hidden during setup');
  quiz.selectMode('full'); quiz.ui.start.click();
  assert.equal(quiz.references.mandarin.hidden, false);
  assert.ok(quiz.groups.mandarin.buttons.every(button => !button.hidden));
  assert.match(quiz.ui.progress.textContent, /Question 1 of 10/);
  const question = data.mandarin.questions.find(q => q.character === quiz.spoken.at(-1).text);
  quiz.spoken.at(-1).onend();
  pressKey(quiz, String(question.tone === 1 ? 2 : 1));
  assert.equal(quiz.ui.next.hidden, false);
  assert.match(quiz.ui.progress.textContent, /0 correct/);
});

test('reference panel offers every active tone in Beginner and Full Quiz for both languages', () => {
  for (const language of ['mandarin', 'cantonese']) {
    for (const mode of ['beginner', 'full']) {
      const quiz = app({ mode, saved: language });
      quiz.ui.start.click(); quiz.spoken.at(-1).onend();
      const references = quiz.references[language];
      assert.equal(references.hidden, false);
      const active = references.buttons.filter(button => !button.hidden);
      const expected = mode === 'beginner' ? data[language].beginner.tones : data[language].tones.map(tone => tone.number);
      assert.deepEqual(active.map(button => Number(button.dataset.referenceTone)), expected);
      for (const button of active) {
        button.click();
        assert.equal(quiz.spoken.at(-1).text, button.dataset.referenceCharacter);
        assert.equal(quiz.spoken.at(-1).lang, language === 'mandarin' ? 'zh-CN' : 'zh-HK');
        quiz.spoken.at(-1).onend();
      }
      assert.match(quiz.ui.progress.textContent, /Question 1 of/);
      assert.equal(quiz.ui.next.hidden, true, 'references never answer the question');
      assert.equal(quiz.ui.feedback.hidden, true);
    }
  }
});

test('slower audio applies to questions and references in either language and mode', () => {
  for (const language of ['mandarin', 'cantonese']) {
    for (const mode of ['beginner', 'full']) {
      const quiz = app({ mode, saved: language });
      quiz.ui.start.click();
      assert.equal(quiz.spoken.at(-1).rate, 1);
      assert.equal(quiz.ui.speed.disabled, true, 'keep a playing sound at one speed');
      quiz.spoken.at(-1).onend();
      assert.equal(quiz.ui.speed.disabled, false);
      quiz.ui.speed.value = '0.75';
      quiz.ui.listen.click();
      assert.equal(quiz.spoken.at(-1).rate, 0.75);
      assert.equal(quiz.spoken.at(-1).pitch, 1);
      quiz.spoken.at(-1).onend();
      quiz.references[language].buttons[0].click();
      assert.equal(quiz.spoken.at(-1).rate, 0.75);
      assert.equal(quiz.spoken.at(-1).pitch, 1);
      quiz.spoken.at(-1).onend();
      quiz.ui.speed.value = '1'; quiz.ui.listen.click();
      assert.equal(quiz.spoken.at(-1).rate, 1);
      quiz.spoken.at(-1).onerror();
      assert.equal(quiz.ui.speed.disabled, false);
    }
  }
});
