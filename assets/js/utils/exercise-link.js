export function buildExercisePath(text, pronunciation, script) {
  const characters = text.trim();
  if (!characters || !/^\p{Script=Han}+$/u.test(characters)) {
    throw new Error('Enter Hanzi only, without spaces, punctuation, or romanization.');
  }
  // Match the current workspace's maxlength and initial-link length check,
  // including supplementary characters that take two UTF-16 input positions.
  if (characters.length > 6) {
    throw new Error('This text exceeds the practice tool’s current input limit. Split it into shorter groups of up to six Hanzi.');
  }
  if (!['mandarin', 'cantonese'].includes(pronunciation) || !['simplified', 'traditional'].includes(script)) {
    throw new Error('Choose a pronunciation language and character form.');
  }
  const params = new URLSearchParams({ pronunciation, script });
  return '/?' + params.toString() + '#' + encodeURIComponent(characters);
}
