var speechButtons = [];
var speechStartTimeout = null;
var activeSpeechButton = null;
var activeSpeechUtterance = null;
var activeSpeechKey = '';
var pendingSpeechKey = '';

function speechText(key, fallback) {
  var practiceEl = document.getElementById('practice');
  return (practiceEl && practiceEl.getAttribute('data-' + key)) || fallback;
}

function findSpeechVoice(language) {
  if (!window.speechSynthesis) return null;
  var voices = window.speechSynthesis.getVoices();
  var isCantonese = language === 'zh-HK';
  for (var i = 0; i < voices.length; i += 1) {
    var lang = (voices[i].lang || '').replace('_', '-').toLowerCase();
    var name = (voices[i].name || '').toLowerCase();
    if (isCantonese && (lang === 'zh-hk' || lang.indexOf('yue') === 0 || name.indexOf('cantonese') !== -1)) {
      return voices[i];
    }
    if (!isCantonese && (lang === 'zh-cn' || lang === 'zh-sg' || lang === 'zh-tw' || lang.indexOf('cmn') === 0 || name.indexOf('mandarin') !== -1)) {
      return voices[i];
    }
  }
  return null;
}

function refreshSpeechButtons() {
  var hasSpeech = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  var voicesLoaded = hasSpeech && window.speechSynthesis.getVoices().length > 0;
  speechButtons = speechButtons.filter(function(button) { return document.documentElement.contains(button); });
  speechButtons.forEach(function(button) {
    var language = button.getAttribute('data-speech-language');
    var unavailable = !hasSpeech || (language === 'zh-HK' && voicesLoaded && !findSpeechVoice(language));
    button.disabled = unavailable;
    if (unavailable && language === 'zh-HK') {
      button.title = speechText('cantonese-unavailable', 'A Cantonese voice is not installed on this device');
    }
  });
}

function speakChinese(text, language, button) {
  if (!text || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  var speechKey = language + ':' + text;

  // Repeatedly clicking the same pronunciation should not tear down and
  // recreate the operating system's audio stream mid-syllable.
  if (speechKey === activeSpeechKey || speechKey === pendingSpeechKey) return;

  var voice = findSpeechVoice(language);
  if (language === 'zh-HK' && window.speechSynthesis.getVoices().length && !voice) {
    refreshSpeechButtons();
    return;
  }
  if (speechStartTimeout) {
    clearTimeout(speechStartTimeout);
    speechStartTimeout = null;
    pendingSpeechKey = '';
  }
  if (activeSpeechButton) {
    activeSpeechButton.classList.remove('is-speaking');
    activeSpeechButton = null;
  }

  var wasSpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;
  var isLanguageSwitch = !!activeSpeechKey && activeSpeechKey.split(':')[0] !== language;
  if (wasSpeaking) window.speechSynthesis.cancel();

  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  if (voice) utterance.voice = voice;
  // Native voices sound cleanest at their recorded rate. Slowing them down can
  // introduce time-stretching artefacts, especially in Safari and mobile voices.
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  activeSpeechUtterance = utterance;
  if (button) {
    utterance.onstart = function() {
      pendingSpeechKey = '';
      activeSpeechKey = speechKey;
      activeSpeechButton = button;
      button.classList.add('is-speaking');
    };
    utterance.onend = utterance.onerror = function() {
      button.classList.remove('is-speaking');
      if (activeSpeechButton === button) activeSpeechButton = null;
      if (activeSpeechKey === speechKey) activeSpeechKey = '';
      if (pendingSpeechKey === speechKey) pendingSpeechKey = '';
      if (activeSpeechUtterance === utterance) activeSpeechUtterance = null;
    };
  }

  // Give the audio backend a moment to release a cancelled utterance. Starting
  // on the same tick can cause an audible click on some operating systems.
  pendingSpeechKey = speechKey;
  speechStartTimeout = setTimeout(function() {
    speechStartTimeout = null;
    window.speechSynthesis.speak(utterance);
  }, isLanguageSwitch ? 300 : (wasSpeaking ? 125 : 0));
}

function createSpeechButton(text, language, compact) {
  var isCantonese = language === 'zh-HK';
  var label = speechText(isCantonese ? 'listen-cantonese' : 'listen-mandarin', isCantonese ? 'Listen in Cantonese' : 'Listen in Mandarin');
  var button = document.createElement('button');
  button.type = 'button';
  button.className = compact ? 'pronunciation-button pronunciation-button-compact' : 'btn btn-default pronunciation-button';
  button.setAttribute('data-speech-language', language);
  button.setAttribute('aria-label', label + ': ' + text);
  button.title = label;
  button.innerHTML = '<i class="fas fa-volume-up" aria-hidden="true"></i>' + (compact ? '' : ' ' + label);
  button.addEventListener('click', function() { speakChinese(text, language, button); });
  speechButtons.push(button);
  return button;
}

// Used by both the main practice workspace and pronunciation lessons.
if (window.speechSynthesis) {
  window.speechSynthesis.addEventListener('voiceschanged', refreshSpeechButtons);
}

export { createSpeechButton, refreshSpeechButtons, findSpeechVoice };
