import { findSpeechVoice } from '/assets/js/utils/speech.js';
import { createToneRound, ToneQuizSession } from '/assets/js/utils/tone-quiz-session.js';

const root = document.getElementById('tone-quiz');
const banks = JSON.parse(document.getElementById('tone-quiz-data').textContent);
const ui = name => root.querySelector('[data-quiz-' + name + ']');
const languageInputs = root.querySelectorAll('input[name="quiz-language"]');
let language = 'mandarin';
let session = null;
let utterance = null;
let audioTimeout = null;
let playing = false;
try {
  if (localStorage.getItem('pronunciation-guide-view') === 'cantonese') language = 'cantonese';
} catch (_) {}

const speechLanguage = () => language === 'cantonese' ? 'zh-HK' : 'zh-CN';
const languageName = () => language === 'cantonese' ? 'Cantonese' : 'Mandarin';
const voice = () => window.SpeechSynthesisUtterance && findSpeechVoice(speechLanguage());
const options = () => root.querySelector('[data-quiz-options="' + language + '"]');
const buttons = () => options().querySelectorAll('[data-tone]');
const practiceURL = question => '/?pronunciation=' + language + '&script=' + (language === 'cantonese' ? 'traditional' : 'simplified') + '#' + encodeURIComponent(question.character);

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
  ui('listen').disabled = !available || playing;
  ui('next').disabled = playing;
  ui('audio-status').textContent = available ? '' : languageName() + ' audio is unavailable. Install a ' + languageName() + ' voice in your device’s speech settings, then reload this page, or choose the other language. The quiz needs a matching voice.';
  if (session && !session.complete) {
    buttons().forEach(button => { button.disabled = !available || playing || !session.heard || session.answered; });
  }
}

function playQuestion() {
  if (!session || session.complete || playing) return;
  const selectedVoice = voice();
  if (!selectedVoice) { refreshAudio(); return; }
  stopAudio();
  // A failed replay must not leave an unheard/failed question answerable.
  session.heard = false;
  const speech = new window.SpeechSynthesisUtterance(session.current.character);
  utterance = speech; // Keep a reference while the native voice is speaking.
  speech.lang = speechLanguage();
  speech.voice = selectedVoice;
  speech.rate = 1;
  speech.pitch = 1;
  playing = true;
  ui('listening').textContent = 'Listening…';
  refreshAudio();

  function finish(error) {
    if (utterance !== speech) return;
    utterance = null;
    playing = false;
    clearTimeout(audioTimeout);
    if (error) {
      window.speechSynthesis.cancel();
      ui('listening').textContent = 'Audio could not play. Check your volume and voice settings, then try Listen again.';
    } else {
      session.markHeard();
      ui('listening').textContent = session.answered ? 'Replay finished.' : 'Which tone did you hear? You can listen again.';
    }
    refreshAudio();
  }
  speech.onend = () => finish(false);
  speech.onerror = () => finish(true);
  audioTimeout = setTimeout(() => finish(true), 12000);
  try { window.speechSynthesis.speak(speech); } catch (_) { finish(true); }
}

function renderQuestion() {
  ui('progress').textContent = languageName() + ' · Question ' + (session.index + 1) + ' of ' + session.questions.length + ' · ' + session.score + ' correct';
  ui('feedback').hidden = true;
  ui('feedback').textContent = '';
  ui('answer-links').hidden = true;
  ui('practice').removeAttribute('href');
  ui('next').hidden = true;
  root.querySelectorAll('[data-quiz-options]').forEach(group => { group.hidden = group.dataset.quizOptions !== language; });
  buttons().forEach(button => {
    button.classList.remove('is-correct', 'is-wrong');
  });
  document.getElementById('tone-question').focus();
  playQuestion();
}

function startRound() {
  if (!voice()) { refreshAudio(); return; }
  stopAudio();
  session = new ToneQuizSession(createToneRound(banks[language].questions));
  ui('intro').hidden = true;
  ui('results').hidden = true;
  ui('round').hidden = false;
  root.classList.add('is-playing');
  ui('language').disabled = true;
  renderQuestion();
}

function answer(tone) {
  if (playing || !voice()) return;
  const result = session.answer(tone);
  if (!result) return;
  const question = result.question;
  buttons().forEach(button => {
    button.disabled = true;
    button.classList.toggle('is-correct', Number(button.dataset.tone) === question.tone);
    button.classList.toggle('is-wrong', Number(button.dataset.tone) === tone && !result.correct);
  });
  const feedback = ui('feedback');
  feedback.textContent = (result.correct ? 'Correct! ' : 'You chose tone ' + tone + '. The answer is tone ' + question.tone + '. ');
  const word = document.createElement('strong');
  word.textContent = question.character + ' · ' + question.reading + ' · tone ' + question.tone;
  feedback.appendChild(word);
  feedback.appendChild(document.createTextNode(' — ' + question.meaning + '.'));
  feedback.hidden = false;
  feedback.focus();
  ui('practice').href = practiceURL(question);
  ui('answer-links').hidden = false;
  ui('next').textContent = session.index === session.questions.length - 1 ? 'See my results' : 'Next question';
  ui('next').hidden = false;
  ui('progress').textContent = languageName() + ' · Question ' + (session.index + 1) + ' of ' + session.questions.length + ' · ' + session.score + ' correct';
}

function showResults() {
  stopAudio();
  root.classList.remove('is-playing');
  ui('round').hidden = true;
  ui('results').hidden = false;
  ui('language').disabled = false;
  ui('score').textContent = session.score + ' / ' + session.questions.length + ' correct in ' + languageName() + '.';
  const review = ui('review');
  review.textContent = '';
  session.answers.forEach(result => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = practiceURL(result.question);
    link.textContent = result.question.character + ' · ' + result.question.reading + ' — ' + result.question.meaning;
    item.appendChild(link);
    item.appendChild(document.createTextNode(' · ' + (result.correct ? 'Correct' : 'You chose ' + result.chosen + '; correct tone: ' + result.question.tone)));
    review.appendChild(item);
  });
  document.getElementById('tone-results-title').focus();
}

function resetQuiz() {
  stopAudio();
  root.classList.remove('is-playing');
  session = null;
  ui('results').hidden = true;
  ui('round').hidden = true;
  ui('intro').hidden = false;
  ui('language').disabled = false;
  ui('listening').textContent = '';
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
root.querySelectorAll('[data-tone]').forEach(button => button.addEventListener('click', () => answer(Number(button.dataset.tone))));
ui('start').addEventListener('click', startRound);
ui('restart').addEventListener('click', startRound);
ui('listen').addEventListener('click', playQuestion);
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
    if (!button || button.disabled) return;
    event.preventDefault();
    button.click();
  } else if (event.key === 'Enter' && !ui('next').hidden && !ui('next').disabled) {
    // Preserve Enter's normal action on a focused link or button.
    if (target && target.closest?.('button, a')) return;
    event.preventDefault();
    ui('next').click();
  }
});
if (window.speechSynthesis) window.speechSynthesis.addEventListener('voiceschanged', refreshAudio);
window.addEventListener('pagehide', stopAudio);
window.addEventListener('pageshow', () => {
  refreshAudio();
  if (session && !session.complete && !session.answered && !session.heard) {
    ui('listening').textContent = 'Playback stopped. Listen again before choosing a tone.';
  }
});
ui('app').hidden = false;
refreshAudio();
