// Spelling conventions: https://www.polyu.edu.hk/bepth/introduction-to-phonetics/spelling-rules-in-pinyin/?sc_lang=en
// Jyutping inventory: https://jyutping.org/en/jyutping/
const pinyinFinals = new Set('a o e ê ai ei ao ou an en ang eng ong er i ia ie iao iou ian in iang ing iong u ua uo uai uei uan uen uang ueng ü üe üan ün m n ng'.split(' '));
const jyutpingFinals = new Set('aa aai aau aam aan aang aap aat aak a ai au am an ang ap at ak e ei eu em en eng ep et ek i iu im in ing ip it ik o oi ou on ong ot ok oe oeng oet oek eoi eon eot u ui um un ung up ut uk yu yun yut m ng'.split(' '));
const zeroInitialPinyin = {
  yi: 'i', ya: 'ia', ye: 'ie', yao: 'iao', you: 'iou', yan: 'ian', yin: 'in', yang: 'iang', ying: 'ing', yong: 'iong',
  wu: 'u', wa: 'ua', wo: 'uo', wai: 'uai', wei: 'uei', wan: 'uan', wen: 'uen', wang: 'uang', weng: 'ueng',
  yu: 'ü', yue: 'üe', yuan: 'üan', yun: 'ün'
};

export function splitPinyin(reading) {
  let tone = null;
  let invalid = false;
  let spelling = String(reading).trim().toLowerCase().normalize('NFD').replace(/[\u0304\u0301\u030c\u0300]/g, mark => {
    if (tone !== null) invalid = true;
    tone = { '\u0304': 1, '\u0301': 2, '\u030c': 3, '\u0300': 4 }[mark];
    return '';
  }).normalize('NFC');
  const numbered = spelling.match(/[0-5]$/);
  if (numbered) {
    if (tone !== null) return null;
    tone = Number(numbered[0]) || 5;
    spelling = spelling.slice(0, -1);
  }
  if (invalid || !/^[a-züê]+$/.test(spelling)) return null;
  let initial = '';
  let final = zeroInitialPinyin[spelling];
  if (!final) {
    // Syllabic nasals are whole syllables, rather than initials without finals.
    initial = /^(m|n|ng)$/.test(spelling) ? '' : (spelling.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcs])/) || [''])[0];
    final = spelling.slice(initial.length);
    if (/^[jqx]$/.test(initial)) final = final.replace(/^u/, 'ü');
    final = { iu: 'iou', ui: 'uei', un: 'uen' }[final] || final;
  }
  if (!pinyinFinals.has(final)) return null;
  return { initial, final, tone: tone ?? 5 };
}

export function splitJyutping(reading) {
  const match = String(reading).trim().toLowerCase().match(/^([a-z]+)([1-6])$/);
  if (!match) return null;
  const spelling = match[1];
  const initial = /^(m|ng)$/.test(spelling) ? '' : (spelling.match(/^(gw|kw|ng|[bpmfdtnlgkhwzcsj])/) || [''])[0];
  const final = spelling.slice(initial.length);
  if (!jyutpingFinals.has(final)) return null;
  return { initial, final, tone: Number(match[2]) };
}
