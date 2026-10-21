const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/utils/syllable.js'), 'utf8').replace(/export /g, '');
const api = vm.runInNewContext(source + '\n({ splitPinyin, splitJyutping });');
const plain = value => JSON.parse(JSON.stringify(value));

test('Pinyin preserves tone and reconstructs finals hidden by spelling conventions', () => {
  for (const [reading, initial, final, tone] of [
    ['nǐ','n','i',3], ['hǎo','h','ao',3], ['zhōng','zh','ong',1], ['chī','ch','i',1],
    ['shuǐ','sh','uei',3], ['liù','l','iou',4], ['chūn','ch','uen',1],
    ['jū','j','ü',1], ['qún','q','ün',2], ['xuě','x','üe',3], ['juǎn','j','üan',3],
    ['nǚ','n','ü',3], ['nǔ','n','u',3], ['lǜ','l','ü',4],
    ['yī','','i',1], ['yín','','in',2], ['yǒng','','iong',3], ['yóu','','iou',2],
    ['wǔ','','u',3], ['wèi','','uei',4], ['wén','','uen',2], ['wēng','','ueng',1],
    ['yuè','','üe',4], ['yún','','ün',2], ['yuán','','üan',2], ['yǔ','','ü',3],
    ['ér','','er',2], ['ā','','a',1], ['ma','m','a',5], ['ma0','m','a',5], ['ma5','m','a',5],
    ['shui3','sh','uei',3], ['ńg','','ng',2], ['nǐ'.normalize('NFD'),'n','i',3]
  ]) assert.deepEqual(plain(api.splitPinyin(reading)), { initial, final, tone }, reading);
});

test('Jyutping handles compound initials, zero initials, checked finals and syllabic nasals', () => {
  for (const [reading, initial, final, tone] of [
    ['nei5','n','ei',5], ['gwong2','gw','ong',2], ['kwai3','kw','ai',3],
    ['ngaa4','ng','aa',4], ['aa3','','aa',3], ['m4','','m',4], ['ng5','','ng',5],
    ['jyut6','j','yut',6], ['seoi2','s','eoi',2], ['sik6','s','ik',6], ['jat1','j','at',1],
    ['waang4','w','aang',4], ['jyu5','j','yu',5]
  ]) assert.deepEqual(plain(api.splitJyutping(reading)), { initial, final, tone }, reading);
});

test('unsupported or ambiguous readings are omitted instead of inventing a breakdown', () => {
  for (const value of ['', undefined, '你', 'nǐ hǎo', 'nǐ/hǎo', 'nǐ3', 'mǎ́', 'xyz', 'huār']) {
    assert.equal(api.splitPinyin(value), null, String(value));
  }
  for (const value of ['', undefined, '你', 'nei', 'nei0', 'nei7', 'nei5 hou2', 'nei5/hou2', 'zz5']) {
    assert.equal(api.splitJyutping(value), null, String(value));
  }
});

function element() {
  return {
    children: [], dataset: {}, hidden: false,
    set textContent(value) { this.text = value; this.children = []; },
    get textContent() { return (this.text || '') + this.children.map(child => child.textContent).join(''); },
    appendChild(child) { this.children.push(child); }
  };
}

test('practice breakdown follows text and language changes, clears stale data and preserves disclosure state', () => {
  const list = element(), panel = element();
  panel.open = true;
  panel.dataset = { initial: 'Initial', final: 'Final', tone: 'Tone', none: 'None', neutral: 'Neutral' };
  panel.querySelector = () => list;
  const renderer = fs.readFileSync(path.join(root, 'assets/js/utils/practice-syllables.js'), 'utf8').replace(/^import[^\n]+\n/, '').replace('export function', 'function');
  const render = vm.runInNewContext(renderer + '\nrenderPracticeSyllables;', {
    ...api, document: { createElement: element }
  });
  const readers = { mandarin: char => ({ 你: 'nǐ', 我: 'wǒ', 吗: 'ma' })[char], cantonese: char => ({ 你: 'nei5', 我: 'ngo5', 吗: 'maa3' })[char] };
  render(panel, '你我', true, true, readers);
  assert.equal(list.children.length, 2);
  assert.match(list.textContent, /Pinyin · nǐInitialnFinaliTone3/);
  assert.match(list.textContent, /Jyutping · nei5InitialnFinaleiTone5/);
  assert.equal(panel.hidden, false);
  assert.equal(panel.open, true);
  render(panel, '我', false, true, readers);
  assert.equal(list.children.length, 1);
  assert.doesNotMatch(list.textContent, /Pinyin|你/);
  assert.match(list.textContent, /Jyutping · ngo5InitialngFinaloTone5/);
  render(panel, '吗', true, false, readers);
  assert.match(list.textContent, /ToneNeutral/);
  render(panel, '我', false, false, readers);
  assert.equal(panel.hidden, true);
  assert.equal(list.textContent, '');
  render(panel, 'x', true, true, readers);
  assert.equal(panel.hidden, true);
  render(panel, '', true, true, readers);
  assert.equal(panel.hidden, true);
  render(panel, '你', true, true, { mandarin() { throw Error('unavailable'); }, cantonese: readers.cantonese });
  assert.match(list.textContent, /Jyutping/);
  assert.doesNotMatch(list.textContent, /Pinyin/);
});
