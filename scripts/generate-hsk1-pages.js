#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HSK1_WORDS = [
  '爱', '八', '爸爸', '杯子', '北京', '本', '不', '不客气', '菜', '茶',
  '吃', '出租车', '打电话', '大', '的', '点', '电脑', '电视', '电影', '东西',
  '都', '读', '对不起', '多', '多少', '儿子', '二', '饭店', '飞机', '分钟',
  '高兴', '个', '工作', '狗', '汉语', '好', '号', '喝', '和', '很',
  '后面', '回', '会', '几', '家', '叫', '今天', '九', '开', '看',
  '看见', '块', '来', '老师', '了', '冷', '里', '零', '六', '妈妈',
  '吗', '买', '猫', '没关系', '没有', '米饭', '明天', '名字', '哪', '那',
  '呢', '能', '你', '年', '女儿', '朋友', '漂亮', '苹果', '七', '钱',
  '前面', '请', '去', '热', '人', '认识', '三', '商店', '上', '上午',
  '少', '谁', '什么', '十', '时候', '是', '书', '水', '水果', '睡觉',
  '说', '四', '岁', '他', '她', '太', '天气', '听', '同学', '喂',
  '我', '我们', '五', '喜欢', '下', '下午', '下雨', '先生', '现在', '想',
  '小', '小姐', '些', '写', '谢谢', '星期', '学生', '学习', '学校', '一',
  '一点儿', '衣服', '医生', '医院', '椅子', '有', '月', '再见', '在', '怎么',
  '怎么样', '这', '中国', '中午', '住', '桌子', '字', '昨天', '坐', '做'
];

const HSK1_CHAR_OVERRIDES = {
  '爸': { jyutping: 'baa1', strokeCount: 8 },
  '都': { pinyin: 'dōu', rawPinyin: 'dou1', definition: 'all, both' },
  '号': { pinyin: 'hào', rawPinyin: 'hao4', definition: 'number, date' },
  '几': { pinyin: 'jǐ', rawPinyin: 'ji3', definition: 'how many, several' },
  '会': { pinyin: 'huì', rawPinyin: 'hui4', definition: 'can, to know how to' },
  '了': { pinyin: 'le', rawPinyin: 'le5', definition: 'completed action marker' },
  '吗': { pinyin: 'ma', rawPinyin: 'ma5', definition: 'question particle' },
  '和': { pinyin: 'hé', rawPinyin: 'he2', definition: 'and, together with' },
  '看': { pinyin: 'kàn', rawPinyin: 'kan4', definition: 'to see, to read, to watch' },
  '中': { pinyin: 'zhōng', rawPinyin: 'zhong1', definition: 'middle, China' }
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(file, content) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function yamlString(value) {
  return JSON.stringify(String(value || ''));
}

const toneMarks = {
  a: ['a', 'ā', 'á', 'ǎ', 'à'],
  e: ['e', 'ē', 'é', 'ě', 'è'],
  i: ['i', 'ī', 'í', 'ǐ', 'ì'],
  o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
  u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
  v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
  ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
};

function markSyllable(raw) {
  const match = raw.match(/^([A-Za-züÜv:]+)([1-5])$/);
  if (!match) return raw.replace(/u:/g, 'ü').replace(/v/g, 'ü');
  let syllable = match[1].replace(/u:/g, 'v').replace(/U:/g, 'v');
  const tone = Number(match[2]);
  if (tone === 5) return syllable.replace(/v/g, 'ü');
  const lower = syllable.toLowerCase();
  let index = lower.indexOf('a');
  if (index === -1) index = lower.indexOf('e');
  if (index === -1 && lower.includes('ou')) index = lower.indexOf('o');
  if (index === -1) {
    for (let i = syllable.length - 1; i >= 0; i--) {
      if ('aeiouvü'.includes(lower[i])) {
        index = i;
        break;
      }
    }
  }
  if (index === -1) return syllable.replace(/v/g, 'ü');
  const base = lower[index];
  const marked = toneMarks[base] ? toneMarks[base][tone] : syllable[index];
  return syllable.slice(0, index) + marked + syllable.slice(index + 1).replace(/v/g, 'ü');
}

function formatPinyin(pinyin) {
  return String(pinyin || '').split(/\s+/).map(markSyllable).join(' ');
}

function parseCedict(file) {
  const charMap = new Map();
  const wordMap = new Map();
  const charCandidates = new Map();
  const lineRe = /(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\//;
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const match = lineRe.exec(line);
    if (!match) continue;
    const [, trad, simp, rawPinyin, rawDefs] = match;
    const defs = rawDefs.split('/').filter(Boolean);
    const entry = {
      trad,
      simp,
      pinyin: formatPinyin(rawPinyin),
      rawPinyin,
      defs,
      definition: pickDefinition(defs)
    };
    if (!wordMap.has(simp)) wordMap.set(simp, entry);
    if (!wordMap.has(trad)) wordMap.set(trad, entry);
    if (simp.length === 1) addCharCandidate(charCandidates, simp, entry);
    if (trad.length === 1) addCharCandidate(charCandidates, trad, entry);
  }
  for (const [char, candidates] of charCandidates.entries()) {
    const best = pickBestEntry(candidates);
    charMap.set(char, best);
    wordMap.set(char, best);
  }
  for (const [char, override] of Object.entries(HSK1_CHAR_OVERRIDES)) {
    const existing = charMap.get(char) || {};
    const entry = Object.assign({}, existing, override);
    if (override.definition) entry.defs = [override.definition];
    if (override.rawPinyin) entry.rawPinyin = override.rawPinyin;
    charMap.set(char, entry);
    wordMap.set(char, entry);
  }
  return { charMap, wordMap };
}

function addCharCandidate(charCandidates, char, entry) {
  if (!charCandidates.has(char)) charCandidates.set(char, []);
  charCandidates.get(char).push(entry);
}

function parseCanto(file) {
  const charMap = new Map();
  const wordMap = new Map();
  const charCandidates = new Map();
  const lineRe = /(\S+)\s+(\S+)\s+\[[^\]]+\]\s+\{([^}]+)\}\s+\/(.+)\//;
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const match = lineRe.exec(line);
    if (!match) continue;
    const [, trad, simp, jyutping] = match;
    const entry = { trad, simp, jyutping };
    if (!wordMap.has(simp)) wordMap.set(simp, entry);
    if (!wordMap.has(trad)) wordMap.set(trad, entry);
    addCantoCandidates(charCandidates, simp, jyutping);
    if (trad !== simp) addCantoCandidates(charCandidates, trad, jyutping);
  }
  for (const [char, candidates] of charCandidates.entries()) {
    charMap.set(char, pickBestCantoEntry(candidates));
  }
  for (const [char, override] of Object.entries(HSK1_CHAR_OVERRIDES)) {
    if (!override.jyutping) continue;
    const existing = charMap.get(char) || {};
    charMap.set(char, Object.assign({}, existing, { jyutping: override.jyutping }));
  }
  return { charMap, wordMap };
}

function addCantoCandidates(charCandidates, word, jyutping) {
  const chars = Array.from(word);
  const syllables = String(jyutping || '').trim().split(/\s+/).filter(Boolean);
  if (!chars.length || chars.length !== syllables.length) return;
  for (let index = 0; index < chars.length; index++) {
    const char = chars[index];
    if (!/\p{Script=Han}/u.test(char)) continue;
    if (!charCandidates.has(char)) charCandidates.set(char, []);
    charCandidates.get(char).push({
      jyutping: syllables[index],
      source: word,
      sourceLength: chars.length
    });
  }
}

function pickBestCantoEntry(candidates) {
  return candidates.slice().sort((a, b) => {
    const scoreDiff = cantoCandidateScore(a) - cantoCandidateScore(b);
    if (scoreDiff !== 0) return scoreDiff;
    return a.sourceLength - b.sourceLength;
  })[0];
}

function cantoCandidateScore(candidate) {
  let score = candidate.sourceLength;
  if (candidate.sourceLength === 1) score -= 30;
  if (HSK1_WORDS.includes(candidate.source)) score -= 20;
  return score;
}

function pickDefinition(defs) {
  const filtered = defs.filter((definition) => {
    const lower = definition.toLowerCase();
    return !lower.includes('surname') && !lower.startsWith('variant of') && !lower.startsWith('old variant') && !lower.startsWith('abbr.') && !lower.startsWith('used in');
  });
  const candidates = (filtered.length ? filtered : defs).map(cleanDefinition).filter(Boolean);
  const first = candidates[0] || '';
  if (first.length > 120) {
    const concise = candidates.find((definition) => definition.length <= 90 && !definition.startsWith('('));
    if (concise) return concise;
  }
  return first;
}

function cleanDefinition(definition) {
  return String(definition || '')
    .replace(/\s*\(e\.g\.[^)]+\)/g, '')
    .replace(/\s*\(CL:[^)]+\)/g, '')
    .replace(/; /g, ', ')
    .trim();
}

function entryScore(entry) {
  const definition = String(entry.definition || '').toLowerCase();
  let score = 0;
  if (/^[A-Z]/.test(entry.rawPinyin || '')) score += 100;
  if (definition.includes('surname')) score += 100;
  if (definition.startsWith('variant of') || definition.startsWith('old variant')) score += 80;
  if (definition.startsWith('used in')) score += 70;
  if (definition.includes('loanword')) score += 50;
  if (definition.includes('archaic')) score += 30;
  return score;
}

function pickBestEntry(entries) {
  return entries.slice().sort((a, b) => {
    const scoreDiff = entryScore(a) - entryScore(b);
    if (scoreDiff !== 0) return scoreDiff;
    return String(a.definition || '').length - String(b.definition || '').length;
  })[0];
}

function buildStrokeCounts(strokes) {
  const maxStrokeByChar = new Map();
  for (const value of Object.values(strokes)) {
    if (!value || !value.char) continue;
    const strokeNum = Number(value.strokeNum);
    if (!Number.isFinite(strokeNum)) continue;
    const existing = maxStrokeByChar.get(value.char);
    if (existing === undefined || strokeNum > existing) maxStrokeByChar.set(value.char, strokeNum);
  }
  const counts = new Map();
  for (const [char, maxStroke] of maxStrokeByChar.entries()) counts.set(char, maxStroke + 1);
  return counts;
}

function parseUnihanStrokeCounts(file) {
  const counts = new Map();
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split('\t');
    if (parts.length < 3 || parts[1] !== 'kTotalStrokes') continue;
    const code = parts[0];
    if (!code.startsWith('U+')) continue;
    const codepoint = parseInt(code.slice(2), 16);
    const strokeCount = parseInt(parts[2], 10);
    if (!Number.isFinite(codepoint) || !Number.isFinite(strokeCount)) continue;
    counts.set(String.fromCodePoint(codepoint), strokeCount);
  }
  return counts;
}

function strokeCountFor(char, context) {
  const override = HSK1_CHAR_OVERRIDES[char] || {};
  return override.strokeCount || context.customStrokeCounts.get(char) || context.unihanStrokeCounts.get(char);
}

function radicalBaseFor(radical, context) {
  return context.radicalBases[radical] || radical || '';
}

function radicalLink(radical, context) {
  if (!radical) return 'Not available';
  const base = radicalBaseFor(radical, context);
  return `<a class="radical-link" href="/radical/${base}/">${escapeHtml(radical)}</a>`;
}

function uniqueChars(words) {
  const chars = [];
  const seen = new Set();
  for (const word of words) {
    for (const char of Array.from(word)) {
      if (/\p{Script=Han}/u.test(char) && !seen.has(char)) {
        seen.add(char);
        chars.push(char);
      }
    }
  }
  return chars;
}

function cleanComponents(components) {
  return (components || [])
    .filter((component) => !/^\d+$/.test(component))
    .filter((component) => /\p{Script=Han}/u.test(component) || /^[㇀-㇣]$/u.test(component))
    .slice(0, 6);
}

function relatedWordsForChar(char, words, wordMap) {
  return words
    .filter((word) => word.includes(char))
    .slice(0, 8)
    .map((word) => ({ word, entry: wordMap.get(word) }));
}

function relatedCharsForChar(char, words, allChars) {
  const related = [];
  const seen = new Set([char]);
  for (const word of words) {
    if (!word.includes(char)) continue;
    for (const other of Array.from(word)) {
      if (allChars.includes(other) && !seen.has(other)) {
        seen.add(other);
        related.push(other);
      }
    }
  }
  return related.slice(0, 8);
}

function characterSummary(char, entry, strokeCount, radical) {
  const parts = [];
  if (entry && entry.definition) parts.push(`${char} means "${entry.definition}"`);
  else parts.push(`${char} is an HSK 1 Chinese character`);
  if (entry && entry.pinyin) parts.push(`Pinyin: ${entry.pinyin}`);
  if (radical) parts.push(`Dictionary radical: ${radical}`);
  if (strokeCount) parts.push(`Stroke count: ${strokeCount}`);
  return parts.join('. ') + '.';
}

function renderCharacterPage(char, context) {
  const { cedict, canto, radicals, kids, words, allChars } = context;
  const entry = cedict.charMap.get(char);
  const override = HSK1_CHAR_OVERRIDES[char] || {};
  const jyutping = override.jyutping || (canto.charMap.get(char) && canto.charMap.get(char).jyutping);
  const strokeCount = strokeCountFor(char, context);
  const radical = radicals[char] || '';
  const components = cleanComponents(kids[char] && kids[char].c);
  const relatedWords = relatedWordsForChar(char, words, cedict.wordMap);
  const relatedChars = relatedCharsForChar(char, words, allChars);
  const title = `${char} Stroke Order, Meaning, Pinyin, Radical`;
  const description = `Learn how to write ${char} with stroke order,${entry && entry.pinyin ? ` pinyin ${entry.pinyin},` : ''}${entry && entry.definition ? ` meaning "${entry.definition}",` : ''} dictionary radical, stroke count, and HSK 1 example words.`;
  const content = [];

  content.push('---');
  content.push('layout: default');
  content.push(`title: ${yamlString(title)}`);
  content.push(`description: ${yamlString(description)}`);
  content.push(`permalink: ${yamlString(`/character/${char}/`)}`);
  content.push('---');
  content.push('');
  content.push('<main class="container character-reference">');
  content.push(`<nav class="reference-breadcrumb"><a href="/">Hanzi Guide</a> / <a href="/hsk-1-characters/">HSK 1 Chinese Characters</a> / ${escapeHtml(char)}</nav>`);
  content.push(`<h1>${escapeHtml(char)} stroke order</h1>`);
  content.push(`<p class="lead">${escapeHtml(characterSummary(char, entry, strokeCount, radical))}</p>`);
  content.push('<section class="reference-section">');
  content.push(`<h2>Stroke order for ${escapeHtml(char)}</h2>`);
  content.push(`{% include character-stroke-widget.html character="${char}" %}`);
  content.push('</section>');
  content.push('<section class="reference-section">');
  content.push('<h2>Meaning and pronunciation</h2>');
  content.push('<table class="table table-striped reference-table"><tbody>');
  content.push(`<tr><th scope="row">Character</th><td>${escapeHtml(char)}</td></tr>`);
  content.push(`<tr><th scope="row">Pinyin</th><td>${escapeHtml(entry && entry.pinyin ? entry.pinyin : 'Not available')}</td></tr>`);
  content.push(`<tr><th scope="row">Cantonese</th><td>${escapeHtml(jyutping || 'Not available')}</td></tr>`);
  content.push(`<tr><th scope="row">Meaning</th><td>${escapeHtml(entry && entry.definition ? entry.definition : 'HSK 1 Chinese character')}</td></tr>`);
  content.push(`<tr><th scope="row">Stroke count</th><td>${escapeHtml(strokeCount || 'Not available')}</td></tr>`);
  content.push(`<tr><th scope="row">Dictionary radical</th><td>${radicalLink(radical, context)}</td></tr>`);
  content.push('</tbody></table>');
  content.push('</section>');
  if (components.length) {
    content.push('<section class="reference-section">');
    content.push('<h2>Components</h2>');
    content.push(`<p>The dictionary radical is ${radicalLink(radical, context)}. ${escapeHtml(char)} also contains these visible components in the local decomposition data:</p>`);
    content.push('<ul class="component-list">');
    for (const component of components) {
      if (allChars.includes(component)) content.push(`<li><a href="/character/${component}/">${escapeHtml(component)}</a></li>`);
      else content.push(`<li>${escapeHtml(component)}</li>`);
    }
    content.push('</ul>');
    content.push('</section>');
  }
  if (relatedWords.length) {
    content.push('<section class="reference-section">');
    content.push(`<h2>Example HSK 1 words with ${escapeHtml(char)}</h2>`);
    content.push('<table class="table table-striped reference-table"><thead><tr><th>Word</th><th>Pinyin</th><th>Meaning</th></tr></thead><tbody>');
    for (const item of relatedWords) {
      const wordChars = Array.from(item.word).map((wordChar) => allChars.includes(wordChar) ? `<a href="/character/${wordChar}/">${escapeHtml(wordChar)}</a>` : escapeHtml(wordChar)).join('');
      content.push(`<tr><td>${wordChars}</td><td>${escapeHtml(item.entry && item.entry.pinyin ? item.entry.pinyin : '')}</td><td>${escapeHtml(item.entry && item.entry.definition ? item.entry.definition : '')}</td></tr>`);
    }
    content.push('</tbody></table>');
    content.push('</section>');
  }
  content.push('<section class="reference-section">');
  content.push('<h2>Related characters</h2>');
  if (relatedChars.length) {
    content.push('<ul class="related-character-list">');
    for (const related of relatedChars) content.push(`<li><a href="/character/${related}/">${escapeHtml(related)}</a></li>`);
    content.push('</ul>');
  } else {
    content.push('<p>Browse more beginner characters on the HSK 1 list.</p>');
  }
  content.push('<h2>See also</h2>');
  content.push('<ul>');
  content.push('<li><a href="/hsk-1-characters/">HSK 1 Chinese characters</a></li>');
  content.push('<li><a href="/howto/stroke-order/">Chinese stroke order guide</a></li>');
  content.push('<li><a href="/howto/radicals/">Chinese radicals guide</a></li>');
  content.push(`<li><a href="/#${encodeURIComponent(char)}">Practice ${escapeHtml(char)} interactively</a></li>`);
  content.push('</ul>');
  content.push('</section>');
  content.push('</main>');
  content.push('');
  return content.join('\n');
}

function renderHskPage(context) {
  const { cedict, canto, radicals, words, allChars } = context;
  const rows = allChars.map((char) => {
    const entry = cedict.charMap.get(char);
    const override = HSK1_CHAR_OVERRIDES[char] || {};
    const jyutping = override.jyutping || (canto.charMap.get(char) && canto.charMap.get(char).jyutping);
    return {
      char,
      pinyin: entry && entry.pinyin ? entry.pinyin : '',
      jyutping: jyutping || '',
      meaning: entry && entry.definition ? entry.definition : '',
      strokes: strokeCountFor(char, context) || '',
      radical: radicals[char] || ''
    };
  }).sort((a, b) => a.pinyin.localeCompare(b.pinyin) || a.char.localeCompare(b.char));
  const content = [];
  content.push('---');
  content.push('layout: default');
  content.push('title: "HSK 1 Chinese Characters: Stroke Order, Pinyin, Meaning"');
  content.push('description: "Learn HSK 1 Chinese characters with stroke order, pinyin, Cantonese pronunciation, meaning, stroke count, and dictionary radical."');
  content.push('permalink: "/hsk-1-characters/"');
  content.push('---');
  content.push('');
  content.push('<main class="container reference-list-page">');
  content.push('<nav class="reference-breadcrumb"><a href="/">Hanzi Guide</a> / HSK 1 Chinese Characters</nav>');
  content.push('<h1>HSK 1 Chinese Characters</h1>');
  content.push(`<p class="lead">Learn ${rows.length} beginner Chinese characters from HSK 1 vocabulary with stroke order, pinyin, meaning, dictionary radical, and stroke count.</p>`);
  content.push('<section class="reference-section">');
  content.push('<h2>HSK 1 character table</h2>');
  content.push('<div class="table-responsive"><table class="table table-striped reference-table"><thead><tr><th>Character</th><th>Pinyin</th><th>Cantonese</th><th>Meaning</th><th>Strokes</th><th>Dictionary radical</th></tr></thead><tbody>');
  for (const row of rows) {
    content.push(`<tr><td><a class="character-link" href="/character/${row.char}/">${escapeHtml(row.char)}</a></td><td>${escapeHtml(row.pinyin)}</td><td>${escapeHtml(row.jyutping)}</td><td>${escapeHtml(row.meaning)}</td><td>${escapeHtml(row.strokes)}</td><td>${radicalLink(row.radical, context)}</td></tr>`);
  }
  content.push('</tbody></table></div>');
  content.push('</section>');
  content.push('<section class="reference-section">');
  content.push('<h2>HSK 1 vocabulary source words</h2>');
  content.push('<p>These character pages are generated from common HSK 1 vocabulary words:</p>');
  content.push('<p class="word-cloud">');
  content.push(words.map((word) => `<span>${escapeHtml(word)}</span>`).join('\n'));
  content.push('</p>');
  content.push('</section>');
  content.push('<section class="reference-section">');
  content.push('<h2>Related pages</h2>');
  content.push('<ul>');
  content.push('<li><a href="/howto/stroke-order/">Chinese stroke order guide</a></li>');
  content.push('<li><a href="/howto/radicals/">Chinese radicals guide</a></li>');
  content.push('<li><a href="/">Interactive Chinese character practice</a></li>');
  content.push('</ul>');
  content.push('</section>');
  content.push('</main>');
  content.push('');
  return content.join('\n');
}

function renderRadicalPages(context) {
  const radicalMap = new Map();
  for (const char of context.allChars) {
    const radical = context.radicals[char];
    if (!radical) continue;
    const base = radicalBaseFor(radical, context);
    if (!radicalMap.has(base)) radicalMap.set(base, { radical, base, chars: [] });
    radicalMap.get(base).chars.push(char);
  }
  for (const group of radicalMap.values()) {
    const rows = group.chars.map((char) => {
      const entry = context.cedict.charMap.get(char);
      return {
        char,
        pinyin: entry && entry.pinyin ? entry.pinyin : '',
        meaning: entry && entry.definition ? entry.definition : '',
        strokes: strokeCountFor(char, context) || ''
      };
    }).sort((a, b) => a.pinyin.localeCompare(b.pinyin) || a.char.localeCompare(b.char));

    const content = [];
    content.push('---');
    content.push('layout: default');
    content.push(`title: ${yamlString(`${group.base} Radical: HSK 1 Characters`)}`);
    content.push(`description: ${yamlString(`Learn HSK 1 Chinese characters with the ${group.base} radical, including pinyin, meaning, and stroke count.`)}`);
    content.push(`permalink: ${yamlString(`/radical/${group.base}/`)}`);
    content.push('---');
    content.push('');
    content.push('<main class="container reference-list-page">');
    content.push(`<nav class="reference-breadcrumb"><a href="/">Hanzi Guide</a> / <a href="/hsk-1-characters/">HSK 1 Chinese Characters</a> / Radical ${escapeHtml(group.base)}</nav>`);
    content.push(`<h1>${escapeHtml(group.base)} radical</h1>`);
    content.push(`<p class="lead">The ${escapeHtml(group.base)} radical appears in ${rows.length} HSK 1 ${rows.length === 1 ? 'character' : 'characters'} on Hanzi Guide.</p>`);
    if (group.radical !== group.base) {
      content.push(`<p>Kangxi radical form: <span class="radical-link">${escapeHtml(group.radical)}</span></p>`);
    }
    content.push('<section class="reference-section">');
    content.push(`<h2>HSK 1 characters with ${escapeHtml(group.base)}</h2>`);
    content.push('<div class="table-responsive"><table class="table table-striped reference-table"><thead><tr><th>Character</th><th>Pinyin</th><th>Meaning</th><th>Strokes</th></tr></thead><tbody>');
    for (const row of rows) {
      content.push(`<tr><td><a class="character-link" href="/character/${row.char}/">${escapeHtml(row.char)}</a></td><td>${escapeHtml(row.pinyin)}</td><td>${escapeHtml(row.meaning)}</td><td>${escapeHtml(row.strokes)}</td></tr>`);
    }
    content.push('</tbody></table></div>');
    content.push('</section>');
    content.push('<section class="reference-section">');
    content.push('<h2>Related pages</h2>');
    content.push('<ul>');
    content.push('<li><a href="/hsk-1-characters/">HSK 1 Chinese characters</a></li>');
    content.push('<li><a href="/howto/radicals/">Chinese radicals guide</a></li>');
    content.push('</ul>');
    content.push('</section>');
    content.push('</main>');
    content.push('');
    writeFile(path.join(ROOT, 'radical', group.base, 'index.md'), content.join('\n'));
  }
  return radicalMap.size;
}

function main() {
  const strokesJson = readJson('assets/hzw_strokes.json');
  const radicals = readJson('assets/radicals.json');
  const radicalBases = readJson('assets/radical-bases.json');
  const kids = readJson('assets/kids.json');
  const customStrokeCounts = buildStrokeCounts(strokesJson);
  const unihanStrokeCounts = parseUnihanStrokeCounts('assets/unihan/Unihan_IRGSources.txt');
  const cedict = parseCedict('assets/cedict_ts.u8');
  const canto = parseCanto('assets/cccanto.u8');
  const allChars = uniqueChars(HSK1_WORDS);
  const context = { cedict, canto, customStrokeCounts, unihanStrokeCounts, radicals, radicalBases, kids, words: HSK1_WORDS, allChars };

  writeFile(path.join(ROOT, 'hsk-1-characters.md'), renderHskPage(context));
  for (const char of allChars) {
    writeFile(path.join(ROOT, 'character', char, 'index.md'), renderCharacterPage(char, context));
  }
  const radicalCount = renderRadicalPages(context);
  console.log(`Generated HSK 1 list, ${allChars.length} character pages, and ${radicalCount} radical pages.`);
}

main();