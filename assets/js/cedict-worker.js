// CC-CEDICT parsing worker - Rewritten for clarity
var DICT_VERSION = 'cedict-20251223-12';
var SOURCE_URL = '/assets/cedict_ts.u8?v=' + DICT_VERSION;
var dictPromise = null;

function parseCedict(text) {
  var charMap = {};
  var wordMap = {};
  var lines = text.split('\n');
  var lineRe = /(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\//;

  // Filter definitions for single characters: remove surname/classifier/variant/proper nouns
  function filterDefs(defs) {
    var filtered = defs.filter(function(d) {
      if (!d || d.length < 2) return false;
      var lower = d.toLowerCase();
      // Skip various unwanted patterns
      if (lower.indexOf('surname') !== -1) return false;
      if (lower.indexOf('classifier') !== -1) return false;
      if (lower.startsWith('variant of')) return false;
      if (lower.startsWith('abbr.')) return false;
      if (lower.startsWith('see ')) return false;
      // Skip proper nouns (starts with capital)
      var first = d.charAt(0);
      if (first && first === first.toUpperCase() && first !== first.toLowerCase()) return false;
      return true;
    });
    return filtered.length > 0 ? filtered : defs;
  }

  // Pick best definitions: prefer shorter, more common glosses for single chars
  function pickBestDefs(defs, maxCount, isSingleChar) {
    // For single characters, prefer concise definitions (mountain > small bundle of straw for silkworms)
    var sorted;
    if (isSingleChar) {
      // Prefer shorter, more direct definitions
      sorted = defs.slice().sort(function(a, b) {
        return (a ? a.length : 999) - (b ? b.length : 999);
      });
    } else {
      // For words, prefer longer/more descriptive
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
      // Apply same quality logic as charMap
      var filtered = filterDefs(rawDefs);
      var best = pickBestDefs(filtered, 3, true);
      var newDef = best[0] || rawDefs[0] || '';
      
      // Check if we should overwrite existing wordMap entries
      var wordKeys = [trad, simp];
      for (var wk = 0; wk < wordKeys.length; wk++) {
        var wordKey = wordKeys[wk];
        var existingWord = wordMap[wordKey];
        if (!existingWord) {
          wordMap[wordKey] = { p: pinyin, d: newDef, len: headwordLen };
        } else if (existingWord.len === 1) {
          var existingIsBad = existingWord.d && existingWord.d.toLowerCase().indexOf('surname') !== -1;
          var newIsBad = newDef && newDef.toLowerCase().indexOf('surname') !== -1;
          // Replace bad with good
          if (existingIsBad && !newIsBad) {
            wordMap[wordKey] = { p: pinyin, d: newDef, len: headwordLen };
          }
          // Don't replace good with bad (skip)
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
          defs: [rawDefs[0] || ''],
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

function ensureDict() {
  if (dictPromise) return dictPromise;
  dictPromise = fetch(SOURCE_URL, { cache: 'reload' })
    .then(function(resp) {
      if (!resp.ok) throw new Error('Failed to fetch CC-CEDICT: ' + resp.status);
      return resp.text();
    })
    .then(function(text) {
      return parseCedict(text);
    });
  return dictPromise;
}

self.onmessage = function(evt) {
  var msg = evt.data || {};
  if (msg.type !== 'lookup' || !msg.id) return;
  var input = msg.text || '';

  ensureDict()
    .then(function(payload) {
      var charMap = payload.charMap;
      var wordMap = payload.wordMap;
      var result = {};

      // Full phrase lookup (exact)
      var trimmed = input.trim();
      if (trimmed && wordMap[trimmed]) {
        result._full = { p: wordMap[trimmed].p, d: wordMap[trimmed].d };
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
      }

      self.postMessage({ id: msg.id, result: result });
    })
    .catch(function(err) {
      self.postMessage({ id: msg.id, error: err && err.message ? err.message : String(err) });
    });
};
