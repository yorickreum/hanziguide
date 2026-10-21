// Explicit lesson links take precedence over saved display preferences.
export function applyPracticePreset(search, root = document) {
  const params = new URLSearchParams(search);
  const language = params.get('pronunciation');
  if (language === 'mandarin' || language === 'cantonese') {
    root.querySelector('#show-mandarin').checked = language === 'mandarin';
    root.querySelector('#show-cantonese').checked = language === 'cantonese';
  }
  const script = params.get('script');
  if (script === 'simplified' || script === 'traditional') {
    root.querySelectorAll('input[name="script-type"]').forEach(input => {
      input.checked = input.value === script;
    });
  }
}
