// Keep this lesson preference separate from the writing workspace's language.
export function initPronunciationView(document, window) {
  const control = document.querySelector('[data-pronunciation-switch]');
  if (!control) return;
  const inputs = control.querySelectorAll('input');
  const sections = document.querySelectorAll('[data-pronunciation-language]');
  const valid = value => ['mandarin', 'cantonese', 'both'].includes(value);
  let selected = 'both';
  try {
    const saved = window.localStorage.getItem('pronunciation-guide-view');
    if (valid(saved)) selected = saved;
  } catch (_) { /* The switch also works when storage is unavailable. */ }

  function apply(value) {
    selected = value;
    sections.forEach(section => {
      section.hidden = value !== 'both' && section.dataset.pronunciationLanguage !== value;
    });
    inputs.forEach(input => { input.checked = input.value === value; });
    try { window.localStorage.setItem('pronunciation-guide-view', value); } catch (_) {}
  }

  function revealLinkedSection() {
    let target;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch (_) {}
    const section = target && target.closest('[data-pronunciation-language]');
    if (section && selected !== 'both' && section.dataset.pronunciationLanguage !== selected) {
      apply(section.dataset.pronunciationLanguage);
      target.scrollIntoView();
    }
  }

  inputs.forEach(input => input.addEventListener('change', () => {
    if (!input.checked || !valid(input.value)) return;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    apply(input.value);
  }));
  apply(selected);
  control.hidden = false;
  revealLinkedSection();
  window.addEventListener('hashchange', revealLinkedSection);
}
