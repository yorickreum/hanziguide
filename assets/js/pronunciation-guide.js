import { createSpeechButton, refreshSpeechButtons, findSpeechVoice } from '/assets/js/utils/speech.js';
import { initPronunciationView } from '/assets/js/utils/pronunciation-view.js';

initPronunciationView(document, window);

// Reuse the practice workspace's speech controls. Lessons require an explicit
// voice match so a missing Cantonese voice can never play a Mandarin example.
const lessonButtons = [];
function addListeningControl(target, character, language, compact) {
  const button = createSpeechButton(character, language, compact);
  target.appendChild(button);
  lessonButtons.push({ button, language });
}

function refreshLessonVoices() {
  refreshSpeechButtons();
  lessonButtons.forEach(({ button, language }) => {
    button.disabled = !window.SpeechSynthesisUtterance || !findSpeechVoice(language);
    if (button.disabled) {
      button.title = (language === 'zh-HK' ? 'Cantonese' : 'Mandarin') + ' audio is unavailable on this device. Use the linked listening resources.';
    } else {
      button.title = button.getAttribute('aria-label');
    }
  });
}

document.querySelectorAll('.pronunciation-tone-table[data-speech-language], .pronunciation-sound-table[data-speech-language]').forEach(table => {
  table.querySelectorAll('tbody tr').forEach(row => {
    const example = row.querySelector('td');
    const character = example.querySelector('a span').textContent;
    addListeningControl(example, character, table.dataset.speechLanguage, true);
  });
});

document.querySelectorAll('[data-tone-card]').forEach(card => {
  const character = card.dataset.character;
  addListeningControl(card.querySelector('.tone-pair-listen'), character, card.dataset.language, false);
  const actions = card.querySelector('.tone-pair-actions');
  const target = card.querySelector('.tone-pair-writer');
  const status = card.querySelector('.tone-pair-status');
  let writer;
  let failed = false;

  function writingUnavailable() {
    failed = true;
    target.hidden = true;
    actions.hidden = true;
    status.textContent = 'Stroke data could not load. You can still use the full practice link below.';
  }

  if (window.HanziWriter) actions.hidden = false;
  actions.querySelectorAll('[data-writing-mode]').forEach(button => {
    button.addEventListener('click', () => {
      if (failed) return;
      target.hidden = false;
      status.textContent = '';
      try {
        if (!writer) {
          writer = window.HanziWriter.create(target, character, {
            width: 220, height: 220, padding: 12,
            showOutline: true, showCharacter: false,
            strokeColor: '#8B1A1A', outlineColor: '#D4C5A8',
            onLoadCharDataError: writingUnavailable
          });
        }
        writer.cancelQuiz();
        if (button.dataset.writingMode === 'quiz') {
          status.textContent = 'Draw the strokes in order. The outline is your guide.';
          Promise.resolve(writer.quiz({
            onComplete: () => { status.textContent = 'Well done—you wrote ' + character + '. Say its sound and tone once more.'; }
          })).catch(writingUnavailable);
        } else {
          Promise.resolve(writer.animateCharacter()).catch(writingUnavailable);
        }
      } catch (error) {
        writingUnavailable();
      }
    });
  });
});

if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', refreshLessonVoices);
}
refreshLessonVoices();
