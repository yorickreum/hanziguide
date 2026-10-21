import { buildExercisePath } from '/assets/js/utils/exercise-link.js';

const root = document.querySelector('[data-tutor]');
const form = root.querySelector('[data-exercise-form]');
const text = form.elements.namedItem('text');
const pronunciation = form.elements.namedItem('pronunciation');
const script = form.elements.namedItem('script');
const result = root.querySelector('[data-exercise-result]');
const status = root.querySelector('[data-exercise-status]');
const output = root.querySelector('[data-exercise-url]');
const open = root.querySelector('[data-exercise-open]');
const copy = root.querySelector('[data-exercise-copy]');

function updateLink(announce = false) {
  try {
    const path = buildExercisePath(text.value, pronunciation.value, script.value);
    output.value = new URL(path, root.dataset.siteUrl).href;
    open.href = path;
    open.textContent = 'Open practice for ' + text.value.trim();
    result.hidden = false;
    text.removeAttribute('aria-invalid');
    status.textContent = announce ? 'Your practice link is ready.' : '';
    return true;
  } catch (error) {
    result.hidden = true;
    output.value = '';
    open.removeAttribute('href');
    text.setAttribute('aria-invalid', 'true');
    status.textContent = error.message;
    return false;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!updateLink(true)) text.focus();
});
form.addEventListener('input', () => updateLink());
form.addEventListener('change', () => updateLink());
copy.addEventListener('click', async () => {
  if (!updateLink()) return;
  try {
    await navigator.clipboard.writeText(output.value);
    status.textContent = 'Practice link copied.';
  } catch (_) {
    output.focus();
    output.select();
    status.textContent = 'The link is selected. Use your device’s Copy command.';
  }
});
copy.hidden = false;
updateLink();
