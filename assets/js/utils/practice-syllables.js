import { splitPinyin, splitJyutping } from '/assets/js/utils/syllable.js';

export function renderPracticeSyllables(panel, characters, showMandarin, showCantonese, readers = {
  mandarin: char => globalThis.pinyinPro?.pinyin(char),
  cantonese: char => globalThis.ToJyutping?.getJyutpingText(char)
}) {
  if (!panel) return;
  const list = panel.querySelector('[data-syllable-list]');
  list.textContent = '';
  for (const character of Array.from(characters)) {
    const card = document.createElement('article');
    card.className = 'practice-syllable-card';
    const heading = document.createElement('h3');
    heading.textContent = character;
    heading.lang = 'zh';
    card.appendChild(heading);
    for (const [enabled, language, parser, label] of [
      [showMandarin, 'mandarin', splitPinyin, 'Pinyin'],
      [showCantonese, 'cantonese', splitJyutping, 'Jyutping']
    ]) {
      if (!enabled) continue;
      let reading;
      try { reading = readers[language](character); } catch (_) { continue; }
      const parts = parser(reading);
      if (!parts) continue;
      const title = document.createElement('p');
      title.textContent = label + ' · ' + reading;
      card.appendChild(title);
      const fields = document.createElement('dl');
      for (const [key, value] of [
        ['initial', parts.initial || panel.dataset.none],
        ['final', parts.final],
        ['tone', language === 'mandarin' && parts.tone === 5 ? panel.dataset.neutral : String(parts.tone)]
      ]) {
        const field = document.createElement('div');
        const term = document.createElement('dt');
        term.textContent = panel.dataset[key];
        const detail = document.createElement('dd');
        detail.textContent = value;
        field.appendChild(term);
        field.appendChild(detail);
        fields.appendChild(field);
      }
      card.appendChild(fields);
    }
    if (card.children.length > 1) list.appendChild(card);
  }
  panel.hidden = !list.children.length;
}
