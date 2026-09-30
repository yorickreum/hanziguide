// CC-CEDICT and CC-Canto parsing worker
var DICT_VERSION = 'cedict-20251223-13';
var CEDICT_URL = '/assets/cedict_ts.u8?v=' + DICT_VERSION;
var CCCANTO_URL = '/assets/cccanto.u8?v=' + DICT_VERSION;
var dictPromise = null;

// Shared utility functions
function filterDefs(defs) {
  var filtered = defs.filter(function(d) {
    if (!d || d.length < 2) return false;
    var lower = d.toLowerCase();
    if (lower.indexOf('surname') !== -1) return false;
    if (lower.indexOf('classifier') !== -1) return false;
    if (lower.startsWith('variant of')) return false;
    if (lower.startsWith('abbr.')) return false;
    if (lower.startsWith('see ')) return false;
    var first = d.charAt(0);
    if (first && first === first.toUpperCase() && first !== first.toLowerCase()) return false;
    return true;
  });
  return filtered.length > 0 ? filtered : defs;
}

function pickBestDefs(defs, maxCount, isSingleChar) {
  var sorted;
  if (isSingleChar) {
    sorted = defs.slice().sort(function(a, b) {
      return (a ? a.length : 999) - (b ? b.length : 999);
    });
  } else {
    sorted = defs.slice().sort(function(a, b) {
      return (b ? b.length : 0) - (a ? a.length : 0);
    });
  }
  var result = [];
  var seen = {};
  for (var i = 0; i < sorted.length && result.length < maxCount; i++) {
    var d = sorted[i];
    if (d && !seen[d]) {
      seen[d] = true;
      result.push(d);
    }
  }
  return result;
}

function pickPreferredDef(defs) {
  if (!defs || !defs.length) return '';
  for (var i = 0; i < defs.length; i++) {
    var d = defs[i];
    if (!d) continue;
    if (d.toLowerCase().indexOf('slang') !== -1) continue;
    return d;
  }
  return defs[0] || '';
}

function isSlangDef(definition) {
  return !!(definition && definition.toLowerCase().indexOf('slang') !== -1);
}

// Parse CC-CEDICT (Mandarin dictionary)
function parseCedict(text) {
  var charMap = {};
  var wordMap = {};
  var lines = text.split('\n');
  var lineRe = /(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\//;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || line.charAt(0) === '#') continue;
    var match = lineRe.exec(line);
    if (!match) continue;

    var trad = match[1];
    var simp = match[2];
    var pinyin = match[3];
    var rawDefs = match[4].split('/').filter(Boolean);
    var headwordLen = trad.length;

    // Store word-level entries with smart overwrite for single chars
    if (headwordLen === 1) {
      var filtered = filterDefs(rawDefs);
      var best = pickBestDefs(filtered, 3, true);
      var newDef = best[0] || rawDefs[0] || '';
      
      var wordKeys = [trad, simp];
      for (var wk = 0; wk < wordKeys.length; wk++) {
        var wordKey = wordKeys[wk];
        var existingWord = wordMap[wordKey];
        if (!existingWord) {
          wordMap[wordKey] = { p: pinyin, d: newDef, len: headwordLen };
        } else if (existingWord.len === 1) {
          var existingIsBad = existingWord.d && existingWord.d.toLowerCase().indexOf('surname') !== -1;
          var newIsBad = newDef && newDef.toLowerCase().indexOf('surname') !== -1;
          if (existingIsBad && !newIsBad) {
            wordMap[wordKey] = { p: pinyin, d: newDef, len: headwordLen };
          }
        }
      }
    } else {
      // Multi-char words: simple first-wins
      if (!wordMap[trad]) {
        wordMap[trad] = { p: pinyin, d: rawDefs[0] || '', len: headwordLen };
      }
      if (!wordMap[simp]) {
        wordMap[simp] = { p: pinyin, d: rawDefs[0] || '', len: headwordLen };
      }
    }

    // Process each character in the headword
    var chars = trad + simp;
    for (var j = 0; j < chars.length; j++) {
      var ch = chars[j];
      if (!ch) continue;

      var existing = charMap[ch];
      
      // PRIORITY 1: Single-character headwords (len=1) always win
      if (headwordLen === 1) {
        var filtered = filterDefs(rawDefs);
        var best = pickBestDefs(filtered, 3, true);
        var newDef = best[0] || rawDefs[0] || '';
        
        // If existing is also single-char, only overwrite if new is better
        if (existing && existing.len === 1) {
          var existingIsBad = existing.d && existing.d.toLowerCase().indexOf('surname') !== -1;
          var newIsBad = newDef && newDef.toLowerCase().indexOf('surname') !== -1;
          
          // Don't replace good with bad
          if (!existingIsBad && newIsBad) {
            // But merge the bad defs into allDefs for tooltip
            if (existing.allDefs && rawDefs.length > 0) {
              var seenAll = {};
              existing.allDefs.forEach(function(x) { if (x) seenAll[x] = true; });
              for (var k = 0; k < rawDefs.length && existing.allDefs.length < 10; k++) {
                if (rawDefs[k] && !seenAll[rawDefs[k]]) {
                  existing.allDefs.push(rawDefs[k]);
                }
              }
            }
            continue;
          }
          // Do replace bad with good (but keep the bad defs in allDefs)
          if (existingIsBad && !newIsBad) {
            var mergedAllDefs = [];
            // Start with existing bad defs
            if (existing.allDefs) {
              mergedAllDefs = existing.allDefs.slice();
            } else if (existing.d) {
              mergedAllDefs = [existing.d];
            }
            // Add new good defs
            var seenAll = {};
            mergedAllDefs.forEach(function(x) { if (x) seenAll[x] = true; });
            for (var k = 0; k < rawDefs.length && mergedAllDefs.length < 10; k++) {
              if (rawDefs[k] && !seenAll[rawDefs[k]]) {
                mergedAllDefs.push(rawDefs[k]);
              }
            }
            charMap[ch] = { p: pinyin, d: newDef, defs: best, allDefs: mergedAllDefs, len: 1 };
            continue;
          }
          // Both good or both bad: keep first one
          if (existingIsBad === newIsBad) {
            continue;
          }
        }
        
        charMap[ch] = {
          p: pinyin,
          d: newDef,
          defs: best,
          allDefs: rawDefs,
          len: 1
        };
        continue;
      }

      // PRIORITY 2: Only store multi-char entries if no single-char entry exists yet
      if (!existing) {
        charMap[ch] = {
          p: pinyin,
          d: rawDefs[0] || '',
          defs: pickBestDefs(rawDefs, 3, false),
          allDefs: rawDefs,
          len: headwordLen
        };
      }
      // If existing entry is also multi-char and same/shorter length, we can merge defs
      else if (existing.len > 1 && headwordLen <= existing.len) {
        var seenDefs = {};
        (existing.defs || []).forEach(function(x) { if (x) seenDefs[x] = true; });
        for (var k = 0; k < rawDefs.length && existing.defs.length < 3; k++) {
          if (rawDefs[k] && !seenDefs[rawDefs[k]]) {
            existing.defs.push(rawDefs[k]);
            seenDefs[rawDefs[k]] = true;
          }
        }
        // Merge allDefs too (with deduplication and limit)
        if (!existing.allDefs) existing.allDefs = rawDefs.slice();
        else if (existing.allDefs.length < 10) {
          var seenAll = {};
          existing.allDefs.forEach(function(x) { if (x) seenAll[x] = true; });
          for (var k = 0; k < rawDefs.length && existing.allDefs.length < 10; k++) {
            if (rawDefs[k] && !seenAll[rawDefs[k]]) {
              existing.allDefs.push(rawDefs[k]);
              seenAll[rawDefs[k]] = true;
            }
          }
        }
      }
    }
  }

  return { charMap: charMap, wordMap: wordMap };
}

// Parse CC-Canto (Cantonese dictionary with jyutping)
function parseCanto(text) {
  var charMap = {};
  var wordMap = {};
  var lines = text.split('\n');
  var lineRe = /(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\{([^\}]+)\}\s+\/(.+)\//;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || line.charAt(0) === '#') continue;
    var match = lineRe.exec(line);
    if (!match) continue;

    var trad = match[1];
    var simp = match[2];
    var pinyin = match[3];
    var jyutping = match[4];
    var rawDefs = match[5].split('/').filter(Boolean);
    var headwordLen = trad.length;

    // Store word-level entries
    if (headwordLen === 1) {
      var filtered = filterDefs(rawDefs);
      var best = pickBestDefs(filtered, 3, true);
      var newDef = pickPreferredDef(best) || pickPreferredDef(rawDefs);
      
      var wordKeys = [trad, simp];
      for (var wk = 0; wk < wordKeys.length; wk++) {
        var wordKey = wordKeys[wk];
        if (!wordMap[wordKey]) {
          wordMap[wordKey] = { j: jyutping, d: newDef, len: headwordLen };
        } else if (wordMap[wordKey].len === 1) {
          var existingIsSlang = isSlangDef(wordMap[wordKey].d);
          var newIsSlang = isSlangDef(newDef);
          if (existingIsSlang && !newIsSlang) {
            wordMap[wordKey] = { j: jyutping, d: newDef, len: headwordLen };
          }
        }
      }
    } else {
      if (!wordMap[trad]) {
        wordMap[trad] = { j: jyutping, d: rawDefs[0] || '', len: headwordLen };
      }
      if (!wordMap[simp]) {
        wordMap[simp] = { j: jyutping, d: rawDefs[0] || '', len: headwordLen };
      }
    }

    // Process each character
    var chars = trad + simp;
    for (var j = 0; j < chars.length; j++) {
      var ch = chars[j];
      if (!ch) continue;

      var existing = charMap[ch];
      
      // Single-character headwords have priority
      if (headwordLen === 1) {
        var filtered = filterDefs(rawDefs);
        var best = pickBestDefs(filtered, 3, true);
        var newDef = pickPreferredDef(best) || pickPreferredDef(rawDefs);
        
        if (!existing || existing.len > 1) {
          charMap[ch] = {
            j: jyutping,
            d: newDef,
            defs: best,
            allDefs: rawDefs,
            len: 1
          };
        } else if (existing.len === 1) {
          var existingIsSlang = isSlangDef(existing.d);
          var newIsSlang = isSlangDef(newDef);
          if (existingIsSlang && !newIsSlang) {
            charMap[ch] = {
              j: jyutping,
              d: newDef,
              defs: best,
              allDefs: rawDefs,
              len: 1
            };
          }
        }
        continue;
      }

      // Multi-char entries only if no single-char exists
      if (!existing) {
        charMap[ch] = {
          j: jyutping,
          d: rawDefs[0] || '',
          defs: pickBestDefs(rawDefs, 3, false),
          allDefs: rawDefs,
          len: headwordLen
        };
      }
    }
  }

  return { charMap: charMap, wordMap: wordMap };
}

// Keep every sense and reading: the display maps intentionally discard some.
function parseEnglishEntries(text) {
  var entries = [];
  text.split('\n').forEach(function(line) {
    if (!line || line.charAt(0) === '#') return;
    var match = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\//.exec(line);
    if (!match || !/^[\u3400-\u9fff]+$/.test(match[2]) || match[2].length > 6) return;
    var defs = match[4].split(/[;/]/).map(function(def) { return def.trim(); }).filter(function(def) {
      return def && !/^(CL:|classifier |surname |variant of |old variant of |see |also written )/i.test(def);
    });
    if (defs.length) entries.push({ traditional: match[1], simplified: match[2], pinyin: match[3], definitions: defs });
  });
  return entries;
}

function normalizeEnglish(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function searchEnglish(entries, input) {
  var query = normalizeEnglish(input);
  if (!query) return [];
  var matches = [];
  entries.forEach(function(entry) {
    var score = Infinity;
    var meaning = '';
    entry.definitions.forEach(function(def, senseIndex) {
      var normalized = normalizeEnglish(def);
      var gloss = normalizeEnglish(def.replace(/\([^)]*\)/g, '')).replace(/^(to |a |an |the )/, '');
      var rank = normalized === query || gloss === query ? 0 :
        (' ' + normalized + ' ').indexOf(' ' + query + ' ') !== -1 ? 1 : Infinity;
      // Prefer primary senses and ordinary usage over slang or literary glosses.
      rank += Math.min(senseIndex, 20) / 100 + (/slang|archaic|literary|dialect|obsolete/i.test(def) ? 0.5 : 0);
      if (rank < score) { score = rank; meaning = def; }
    });
    if (score !== Infinity) matches.push({ entry: entry, score: score, meaning: meaning });
  });
  matches.sort(function(a, b) {
    return a.score - b.score || a.entry.simplified.length - b.entry.simplified.length ||
      a.meaning.length - b.meaning.length;
  });
  var seen = Object.create(null);
  return matches.filter(function(match) {
    var key = match.entry.simplified + '|' + match.entry.traditional + '|' + match.entry.pinyin;
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  }).slice(0, 20).map(function(match) {
    return { simplified: match.entry.simplified, traditional: match.entry.traditional,
      pinyin: match.entry.pinyin, definition: match.meaning };
  });
}

function ensureDict() {
  if (dictPromise) return dictPromise;
  dictPromise = Promise.all([
    fetch(CEDICT_URL, { cache: 'reload' })
      .then(function(resp) {
        if (!resp.ok) throw new Error('Failed to fetch CC-CEDICT: ' + resp.status);
        return resp.text();
      }),
    fetch(CCCANTO_URL, { cache: 'reload' })
      .then(function(resp) {
        if (!resp.ok) throw new Error('Failed to fetch CC-Canto: ' + resp.status);
        return resp.text();
      })
  ])
    .then(function(results) {
      var cedictText = results[0];
      var ccantoText = results[1];
      
      // Parse both dictionaries separately
      var cedictData = parseCedict(cedictText);
      var ccantoData = parseCanto(ccantoText);
      
      return { 
        charMap: cedictData.charMap, 
        wordMap: cedictData.wordMap,
        cantoCharMap: ccantoData.charMap,
        cantoWordMap: ccantoData.wordMap,
        englishEntries: parseEnglishEntries(cedictText)
      };
    });
  return dictPromise;
}

self.onmessage = function(evt) {
  var msg = evt.data || {};
  if (!msg.id) return;
  if (msg.type === 'searchEnglish') {
    ensureDict().then(function(payload) {
      self.postMessage({ id: msg.id, result: searchEnglish(payload.englishEntries, msg.text || '') });
    }).catch(function(err) {
      self.postMessage({ id: msg.id, error: err.message || String(err) });
    });
    return;
  }
  if (msg.type !== 'lookup') return;
  var input = msg.text || '';

  ensureDict()
    .then(function(payload) {
      var charMap = payload.charMap;
      var wordMap = payload.wordMap;
      var cantoCharMap = payload.cantoCharMap;
      var cantoWordMap = payload.cantoWordMap;
      var result = {};

      // Full phrase lookup (exact)
      var trimmed = input.trim();
      if (trimmed && wordMap[trimmed]) {
        result._full = { p: wordMap[trimmed].p, d: wordMap[trimmed].d };
      }
      if (trimmed && cantoWordMap[trimmed]) {
        if (!result._full) result._full = {};
        result._full.cantoDef = cantoWordMap[trimmed].d;
        result._full.cantoJyut = cantoWordMap[trimmed].j;
      }

      // Per-character lookup
      for (var i = 0; i < input.length; i++) {
        var ch = input[i];
        if (!ch || /\s/.test(ch)) continue;
        if (result[ch]) continue;
        if (charMap[ch]) {
          result[ch] = { 
            p: charMap[ch].p, 
            d: charMap[ch].d, 
            defs: charMap[ch].defs,
            allDefs: charMap[ch].allDefs 
          };
        }
        if (cantoCharMap[ch]) {
          if (!result[ch]) result[ch] = {};
          result[ch].cantoDef = cantoCharMap[ch].d;
          result[ch].cantoJyut = cantoCharMap[ch].j;
          result[ch].cantoDefs = cantoCharMap[ch].defs;
          result[ch].cantoAllDefs = cantoCharMap[ch].allDefs;
        }
      }

      self.postMessage({ id: msg.id, result: result });
    })
    .catch(function(err) {
      self.postMessage({ id: msg.id, error: err && err.message ? err.message : String(err) });
    });
};
