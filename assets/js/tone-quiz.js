import { findSpeechVoice } from '/assets/js/utils/speech.js';
import { createToneRound, ToneQuizSession } from '/assets/js/utils/tone-quiz-session.js?v=long-rounds-1';

const root = document.getElementById('tone-quiz');
const banks = JSON.parse(document.getElementById('tone-quiz-data').textContent);
const ui = name => root.querySelector('[data-quiz-' + name + ']');
const languageInputs = root.querySelectorAll('input[name="quiz-language"]');
const modeInputs = root.querySelectorAll('input[name="quiz-mode"]');
const referenceButtons = root.querySelectorAll('[data-reference-tone]');
let language = 'mandarin';
let mode = 'beginner';
let session = null;
let utterance = null;
let audioTimeout = null;
let playing = false;
let celebrationTimeout = null;
let lastSound = null;
try {
  if (localStorage.getItem('pronunciation-guide-view') === 'cantonese') language = 'cantonese';
} catch (_) {}

const speechLanguage = () => language === 'cantonese' ? 'zh-HK' : 'zh-CN';
const languageName = () => language === 'cantonese' ? 'Cantonese' : 'Mandarin';
const voice = () => window.SpeechSynthesisUtterance && findSpeechVoice(speechLanguage());
const options = () => root.querySelector('[data-quiz-options="' + language + '"]');
const buttons = () => options().querySelectorAll('[data-tone]');
const activeTones = () => mode === 'beginner' ? banks[language].beginner.tones : banks[language].tones.map(tone => tone.number);
const practiceURL = question => '/?pronunciation=' + language + '&script=' + (language === 'cantonese' ? 'traditional' : 'simplified') + '#' + encodeURIComponent(question.character);

function describeMode() {
  const tones = activeTones();
  ui('description').textContent = mode === 'beginner'
    ? 'Twenty questions: compare tone ' + tones[0] + ' with tone ' + tones[1] + '. Use the reference sounds and retry mistakes before moving on. We’ll show how many you recognised on your first try.'
    : 'Twenty questions using all ' + tones.length + ' tones. Replay as often as you like; your first answer counts.';
  ui('keyboard').textContent = 'Keyboard: ' + tones.join(', ') + ' to choose a tone. Space to listen again. Enter after completing a question to continue.';
}

function updateProgress() {
  ui('progress').textContent = languageName() + ' · ' + (mode === 'beginner' ? 'Beginner' : 'Full quiz') + ' · Question ' + (session.index + 1) + ' of ' + session.questions.length + ' · ' + session.score + (mode === 'beginner' ? ' on first try' : ' correct');
}

function clearCelebration() {
  clearTimeout(celebrationTimeout);
  ui('celebration').textContent = '';
}

function celebrate() {
  clearCelebration();
  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 14; i++) {
    const piece = document.createElement('span');
    piece.className = 'tone-quiz-confetti';
    piece.style.setProperty('--left', (8 + i * 6.4) + '%');
    piece.style.setProperty('--delay', (i % 4) * 45 + 'ms');
    piece.style.setProperty('--drift', (i % 2 ? 45 : -45) + 'px');
    piece.style.setProperty('--color', ['#287343', '#c79127', '#357a98', '#a95470'][i % 4]);
    ui('celebration').appendChild(piece);
  }
  celebrationTimeout = setTimeout(clearCelebration, 1700);
}

function showFeedback(correct, title, description, question = null) {
  const feedback = ui('feedback');
  feedback.classList.toggle('is-correct', correct);
  feedback.classList.toggle('is-wrong', !correct);
  ui('feedback-icon').textContent = correct ? '✓' : '✕';
  ui('feedback-title').textContent = title;
  const detail = ui('feedback-detail');
  detail.textContent = description;
  if (question) {
    const word = document.createElement('strong');
    word.textContent = question.character + ' · ' + question.reading + ' · tone ' + question.tone;
    detail.appendChild(word);
    detail.appendChild(document.createTextNode(' — ' + question.meaning + '.'));
  }
  feedback.hidden = false;
  feedback.focus({ preventScroll: window.matchMedia('(max-width: 600px)').matches });
}

function stopAudio() {
  // Invalidate old callbacks before cancelling a voice or changing questions.
  utterance = null;
  playing = false;
  clearTimeout(audioTimeout);
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function refreshAudio() {
  const available = !!voice();
  ui('start').disabled = !available;
  ui('listen').disabled = !available;
  ui('speed').disabled = false;
  ui('next').disabled = false;
  referenceButtons.forEach(button => { button.disabled = !available; });
  ui('audio-status').textContent = available ? '' : languageName() + ' audio is unavailable. Install a ' + languageName() + ' voice in your device’s speech settings, then reload this page, or choose the other language. The quiz needs a matching voice.';
  if (session && !session.complete) {
    buttons().forEach(button => { button.disabled = button.hidden || !session.heard || session.answered; });
  }
}

function playSound(character, referenceTone = null) {
  if (!session || session.complete) return;
  const selectedVoice = voice();
  if (!selectedVoice) { refreshAudio(); return; }
  stopAudio();
  const isReference = referenceTone !== null;
  lastSound = { character, referenceTone };
  // Reference audio does not count as hearing the quiz question.
  if (!isReference) session.heard = false;
  const speech = new window.SpeechSynthesisUtterance(character);
  utterance = speech; // Keep a reference while the native voice is speaking.
  speech.lang = speechLanguage();
  speech.voice = selectedVoice;
  speech.rate = Number(ui('speed').value) === 0.25 ? 0.25 : 1;
  speech.pitch = 1;
  playing = true;
  ui('listening').textContent = isReference
    ? 'Compare reference tone ' + referenceTone + ' with the quiz sound.'
    : 'Listen, then choose a tone. Replay whenever you like.';
  refreshAudio();

  function finish(error) {
    if (utterance !== speech) return;
    utterance = null;
    playing = false;
    clearTimeout(audioTimeout);
    if (error) {
      if (!isReference && !session.answered) session.heard = false;
      window.speechSynthesis.cancel();
      ui('listening').textContent = 'Audio could not play. Check your volume and voice settings, then try Listen again.';
    } else {
      if (!isReference) session.markHeard();
      ui('listening').textContent = isReference ? 'Reference finished. Use Listen again to compare with the quiz sound.' : (session.answered ? 'Replay finished.' : 'Which tone did you hear? You can listen again.');
    }
    refreshAudio();
  }
  speech.onend = () => finish(false);
  speech.onerror = () => finish(true);
  audioTimeout = setTimeout(() => {
    if (utterance !== speech) return;
    // Missing completion events must not block answers or replay. Discard a
    // potentially stuck native request without assuming playback failed.
    stopAudio();
    ui('listening').textContent = isReference
      ? 'Use Listen again to compare with the quiz sound.'
      : 'Choose a tone, or replay the sound whenever you like.';
    refreshAudio();
  }, 12000);
  try {
    window.speechSynthesis.speak(speech);
    // Answering is available once listening has been requested. Native speech
    // callbacks are optional: the learner can answer during or after playback.
    if (!isReference && utterance === speech) session.markHeard();
    refreshAudio();
  } catch (_) { finish(true); }
}

function playQuestion() {
  if (session && !session.complete) playSound(session.current.character);
}

function renderQuestion() {
  clearCelebration();
  updateProgress();
  ui('character').textContent = session.current.character;
  ui('feedback').hidden = true;
  ui('feedback-title').textContent = '';
  ui('feedback-detail').textContent = '';
  ui('answer-links').hidden = true;
  ui('practice').removeAttribute('href');
  ui('next').hidden = true;
  root.querySelectorAll('[data-quiz-options]').forEach(group => { group.hidden = group.dataset.quizOptions !== language; });
  root.querySelectorAll('[data-quiz-references]').forEach(group => {
    group.hidden = group.dataset.quizReferences !== language;
    const bank = banks[group.dataset.quizReferences];
    group.querySelector('[data-reference-tip]').textContent = mode === 'beginner' ? bank.beginner.tip : bank.referenceTip;
  });
  referenceButtons.forEach(button => {
    button.hidden = !activeTones().includes(Number(button.dataset.referenceTone));
  });
  buttons().forEach(button => {
    button.hidden = !activeTones().includes(Number(button.dataset.tone));
    button.classList.remove('is-correct', 'is-wrong');
  });
  document.getElementById('tone-question').focus({ preventScroll: window.matchMedia('(max-width: 600px)').matches });
  playQuestion();
}

function startRound() {
  if (!voice()) { refreshAudio(); return; }
  stopAudio();
  const bank = banks[language].questions.filter(question => activeTones().includes(question.tone));
  const questions = [];
  while (questions.length < 20) {
    questions.push(...createToneRound(bank, 20 - questions.length));
  }
  session = new ToneQuizSession(questions, { retryWrong: mode === 'beginner' });
  window.hanziLearning?.track('Tone Quiz', 'Start', language + ':' + mode);
  ui('intro').hidden = true;
  ui('results').hidden = true;
  ui('round').hidden = false;
  root.classList.add('is-playing');
  ui('language').disabled = true;
  ui('mode').disabled = true;
  renderQuestion();
  ui('round').scrollIntoView({ block: 'start' });
}

function answer(tone) {
  if (!session || !activeTones().includes(tone)) return;
  const result = session.answer(tone);
  if (!result) return;
  stopAudio();
  const question = result.question;
  if (mode === 'beginner' && !result.correct) {
    buttons().forEach(button => {
      if (Number(button.dataset.tone) === tone) button.classList.add('is-wrong');
    });
    showFeedback(false, 'Try again', 'Open Reference sounds below to compare, replay the quiz sound, then choose the other tone.');
    refreshAudio();
    return;
  }
  buttons().forEach(button => {
    button.disabled = true;
    button.classList.toggle('is-correct', Number(button.dataset.tone) === question.tone);
    button.classList.toggle('is-wrong', Number(button.dataset.tone) === tone && !result.correct);
  });
  showFeedback(result.correct, result.correct ? 'Correct!' : 'Not quite', result.correct
    ? (mode === 'beginner' && session.attemptCount > 1 ? 'You found it after a retry. ' : '')
    : 'You chose tone ' + tone + '. The answer is tone ' + question.tone + '. ', question);
  if (result.correct) celebrate();
  ui('practice').href = practiceURL(question);
  ui('answer-links').hidden = false;
  ui('next').textContent = session.index === session.questions.length - 1 ? 'See my results' : 'Next question';
  ui('next').hidden = false;
  updateProgress();
}

function showResults() {
  if (!session.metricsComplete) {
    session.metricsComplete = true;
    window.hanziLearning?.track('Tone Quiz', 'Complete', language + ':' + mode, session.score);
  }
  stopAudio();
  clearCelebration();
  root.querySelectorAll('[data-quiz-references]').forEach(group => { group.hidden = true; });
  root.classList.remove('is-playing');
  ui('round').hidden = true;
  ui('results').hidden = false;
  ui('language').disabled = false;
  ui('mode').disabled = false;
  ui('score').textContent = mode === 'beginner'
    ? 'All ' + session.questions.length + ' questions completed in ' + languageName() + '. ' + session.score + ' recognised on your first try.'
    : session.score + ' / ' + session.questions.length + ' correct in ' + languageName() + '.';
  const review = ui('review');
  review.textContent = '';
  session.answers.forEach(result => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = practiceURL(result.question);
    link.textContent = result.question.character + ' · ' + result.question.reading + ' — ' + result.question.meaning;
    item.appendChild(link);
    item.appendChild(document.createTextNode(' · ' + (mode === 'beginner'
      ? (result.correct ? 'First try' : 'After retry; first choice: tone ' + result.chosen)
      : (result.correct ? 'Correct' : 'You chose ' + result.chosen + '; correct tone: ' + result.question.tone))));
    review.appendChild(item);
  });
  document.getElementById('tone-results-title').focus();
}

function resetQuiz() {
  stopAudio();
  clearCelebration();
  root.querySelectorAll('[data-quiz-references]').forEach(group => { group.hidden = true; });
  root.classList.remove('is-playing');
  session = null;
  lastSound = null;
  ui('results').hidden = true;
  ui('round').hidden = true;
  ui('intro').hidden = false;
  ui('language').disabled = false;
  ui('mode').disabled = false;
  ui('listening').textContent = '';
  describeMode();
  refreshAudio();
}

languageInputs.forEach(input => {
  input.checked = input.value === language;
  input.addEventListener('change', () => {
    if (!input.checked) return;
    language = input.value;
    resetQuiz();
  });
});
modeInputs.forEach(input => {
  input.checked = input.value === mode;
  input.addEventListener('change', () => {
    if (!input.checked) return;
    mode = input.value;
    resetQuiz();
  });
});
referenceButtons.forEach(button => button.addEventListener('click', () => {
  if (button.hidden || button.dataset.referenceLanguage !== language || ui('round').hidden) return;
  playSound(button.dataset.referenceCharacter, Number(button.dataset.referenceTone));
}));
root.querySelectorAll('[data-tone]').forEach(button => button.addEventListener('click', () => answer(Number(button.dataset.tone))));
ui('start').addEventListener('click', startRound);
ui('restart').addEventListener('click', startRound);
ui('listen').addEventListener('click', playQuestion);
ui('speed').addEventListener('change', () => {
  if (lastSound && session && !session.complete && !ui('round').hidden) {
    playSound(lastSound.character, lastSound.referenceTone);
  }
});
ui('reset').addEventListener('click', () => {
  resetQuiz();
  ui('start').focus();
});
ui('next').addEventListener('click', () => {
  stopAudio();
  if (!session.next()) return;
  if (session.complete) showResults(); else renderQuestion();
});
window.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
  if (!session || session.complete || ui('round').hidden) return;
  const target = event.target;
  if (target && (target.isContentEditable || target.closest?.('input, textarea, select, [contenteditable]'))) return;
  if (/^[1-6]$/.test(event.key)) {
    const button = Array.from(buttons()).find(option => option.dataset.tone === event.key);
    if (!button || button.hidden || button.disabled) return;
    event.preventDefault();
    button.click();
  } else if (event.key === ' ' && !ui('listen').disabled) {
    // Let focused controls keep their native Space action.
    if (target && target.closest?.('button, a, summary, [role="button"]')) return;
    event.preventDefault();
    ui('listen').click();
  } else if (event.key === 'Enter' && !ui('next').hidden && !ui('next').disabled) {
    // Preserve Enter's normal action on a focused link or button.
    if (target && target.closest?.('button, a')) return;
    event.preventDefault();
    ui('next').click();
  }
});
if (window.speechSynthesis) window.speechSynthesis.addEventListener('voiceschanged', refreshAudio);
window.addEventListener('pagehide', () => {
  if (playing && session && !session.answered) session.heard = false;
  stopAudio();
  clearCelebration();
});
window.addEventListener('pageshow', () => {
  refreshAudio();
  if (session && !session.complete && !session.answered && !session.heard) {
    ui('listening').textContent = 'Playback stopped. Listen again before choosing a tone.';
  }
});
ui('app').hidden = false;
describeMode();
refreshAudio();
