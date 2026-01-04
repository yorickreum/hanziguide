// Test for CC-CEDICT parser
// Run with: node assets/js/cedict-worker.test.js

// Mock Web Worker environment
global.self = {
  postMessage: function() {},
  onmessage: null
};

// Load the worker code (we'll extract and test the parser directly)
function parseCedict(text) {
  var charMap = {};
  var wordMap = {};
  var lines = text.split('\n');
  var lineRe = /(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\//;

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

    if (!wordMap[trad]) {
      wordMap[trad] = { p: pinyin, d: rawDefs[0] || '', len: headwordLen };
    }
    if (!wordMap[simp]) {
      wordMap[simp] = { p: pinyin, d: rawDefs[0] || '', len: headwordLen };
    }

    var chars = trad + simp;
    for (var j = 0; j < chars.length; j++) {
      var ch = chars[j];
      if (!ch) continue;

      var existing = charMap[ch];
      
      if (headwordLen === 1) {
        var filtered = filterDefs(rawDefs);
        var best = pickBestDefs(filtered, 3, true);
        var newDef = best[0] || rawDefs[0] || '';
        
        if (existing && existing.len === 1) {
          var existingIsBad = existing.d && existing.d.toLowerCase().indexOf('surname') !== -1;
          var newIsBad = newDef && newDef.toLowerCase().indexOf('surname') !== -1;
          
          // Don't replace good with bad
          if (!existingIsBad && newIsBad) {
            continue;
          }
          // Do replace bad with good
          if (existingIsBad && !newIsBad) {
            charMap[ch] = { p: pinyin, d: newDef, defs: best, len: 1 };
            continue;
          }
          // Both good or both bad: keep first one
          continue;
        }
        
        charMap[ch] = {
          p: pinyin,
          d: newDef,
          defs: best,
          len: 1
        };
        continue;
      }

      if (!existing) {
        charMap[ch] = {
          p: pinyin,
          d: rawDefs[0] || '',
          defs: [rawDefs[0] || ''],
          len: headwordLen
        };
      } else if (existing.len > 1 && headwordLen <= existing.len) {
        var seenDefs = {};
        (existing.defs || []).forEach(function(x) { if (x) seenDefs[x] = true; });
        for (var k = 0; k < rawDefs.length && existing.defs.length < 3; k++) {
          if (rawDefs[k] && !seenDefs[rawDefs[k]]) {
            existing.defs.push(rawDefs[k]);
            seenDefs[rawDefs[k]] = true;
          }
        }
      }
    }
  }

  return { charMap: charMap, wordMap: wordMap };
}

// Minimal CC-Canto parser for tests
function parseCanto(text) {
  var charMap = {};
  var wordMap = {};
  var lines = text.split('\n');
  var lineRe = /(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\{([^\}]+)\}\s+\/(.+)\//;

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

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line || line.charAt(0) === '#') continue;
    var match = lineRe.exec(line);
    if (!match) continue;

    var trad = match[1];
    var simp = match[2];
    var rawDefs = match[5].split('/').filter(Boolean);
    var headwordLen = trad.length;
    var jyutping = match[4];

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
    }

    var chars = trad + simp;
    for (var j = 0; j < chars.length; j++) {
      var ch = chars[j];
      if (!ch) continue;
      if (headwordLen === 1) {
        if (!charMap[ch] || charMap[ch].len > 1) {
          var filteredDefs = filterDefs(rawDefs);
          var bestDefs = pickBestDefs(filteredDefs, 3, true);
          var bestDef = pickPreferredDef(bestDefs) || pickPreferredDef(rawDefs);
          charMap[ch] = { j: jyutping, d: bestDef, defs: bestDefs, len: 1 };
        } else if (charMap[ch].len === 1) {
          var existingIsSlang = isSlangDef(charMap[ch].d);
          var newFiltered = filterDefs(rawDefs);
          var newBestDefs = pickBestDefs(newFiltered, 3, true);
          var newBestDef = pickPreferredDef(newBestDefs) || pickPreferredDef(rawDefs);
          var newIsSlang = isSlangDef(newBestDef);
          if (existingIsSlang && !newIsSlang) {
            charMap[ch] = { j: jyutping, d: newBestDef, defs: newBestDefs, len: 1 };
          }
        }
      } else if (!charMap[ch]) {
        charMap[ch] = { j: jyutping, d: rawDefs[0] || '', defs: rawDefs.slice(), len: headwordLen };
      }
    }
  }

  return { charMap: charMap, wordMap: wordMap };
}

// Test suite
var tests = [];
var passed = 0;
var failed = 0;

function test(name, fn) {
  tests.push({ name: name, fn: fn });
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message + '\n  Expected: ' + JSON.stringify(expected) + '\n  Actual: ' + JSON.stringify(actual));
  }
}

function assertMatch(actual, pattern, message) {
  if (!pattern.test(actual)) {
    throw new Error(message + '\n  Expected to match: ' + pattern + '\n  Actual: ' + actual);
  }
}

function assertNotMatch(actual, pattern, message) {
  if (pattern.test(actual)) {
    throw new Error(message + '\n  Expected NOT to match: ' + pattern + '\n  Actual: ' + actual);
  }
}

// Tests
test('Single-char entry wins over multi-char', function() {
  var input = [
    '上山 上山 [shang4 shan1] /to climb a hill/',
    '山 山 [shan1] /mountain/hill/anything that resembles a mountain/CL:座[zuo4]/'
  ].join('\n');
  
  var result = parseCedict(input);
  assertEqual(result.charMap['山'].len, 1, 'Should use single-char headword');
  assertMatch(result.charMap['山'].d, /mountain|hill/, 'Should contain mountain or hill');
  assertNotMatch(result.charMap['山'].d, /climb/, 'Should NOT contain "climb"');
});

test('Filters surname definitions for single chars', function() {
  var input = [
    '山 山 [Shan1] /surname Shan/',
    '山 山 [shan1] /mountain/hill/'
  ].join('\n');
  
  var result = parseCedict(input);
  assertNotMatch(result.charMap['山'].d, /surname/i, 'Should filter out surname');
  assertMatch(result.charMap['山'].d, /mountain|hill/, 'Should keep meaningful gloss');
});

test('Surname entry after good entry does not overwrite', function() {
  var input = [
    '山 山 [shan1] /mountain/hill/',
    '山 山 [Shan1] /surname Shan/'
  ].join('\n');
  
  var result = parseCedict(input);
  assertMatch(result.charMap['山'].d, /mountain|hill/, 'Should keep good definition');
  assertNotMatch(result.charMap['山'].d, /surname/i, 'Should NOT be overwritten by surname');
});

test('Filters classifier definitions', function() {
  var input = '個 个 [ge4] /classifier for people or objects/individual/'
  
  var result = parseCedict(input);
  assertNotMatch(result.charMap['個'].d, /classifier/i, 'Should filter out classifier');
  assertMatch(result.charMap['個'].d, /individual/, 'Should keep meaningful gloss');
});

test('Filters proper nouns (capitals)', function() {
  var input = '李 李 [Li3] /Li (surname)/plum/'
  
  var result = parseCedict(input);
  assertMatch(result.charMap['李'].d, /plum/, 'Should prefer lowercase gloss');
});

test('Word-level lookup works', function() {
  var input = '你好 你好 [ni3 hao3] /hello/hi/'
  
  var result = parseCedict(input);
  assertEqual(result.wordMap['你好'].d, 'hello', 'Should store full phrase');
  assertEqual(result.wordMap['你好'].p, 'ni3 hao3', 'Should store phrase pinyin');
});

test('Picks shorter/concise definitions for single chars', function() {
  var input = '好 好 [hao3] /good/well/proper/good to/easy to/very/so/(suffix indicating completion or readiness)/to be fond of/'
  
  var result = parseCedict(input);
  var defs = result.charMap['好'].defs;
  // Should prioritize shorter defs for single chars
  assertEqual(defs[0].length <= 4, true, 'First def should be short');
  assertEqual(defs.some(function(d) { return d === 'good'; }), true, 'Should include "good"');
});

test('Handles traditional/simplified pairs', function() {
  var input = '媽 妈 [ma1] /mama/mommy/mother/CL:個|个[ge4],位[wei4]/'
  
  var result = parseCedict(input);
  assertEqual(result.charMap['媽'].len, 1, 'Should store traditional');
  assertEqual(result.charMap['妈'].len, 1, 'Should store simplified');
  assertNotMatch(result.charMap['妈'].d, /^ma$/i, 'Should not be just transliteration');
});

test('Multi-char entries only stored when no single-char exists', function() {
  var input = [
    '爸爸 爸爸 [ba4 ba5] /father/dad/pa/papa/',
    '爸 爸 [ba4 ba5] /father/dad/pa/papa/'
  ].join('\n');
  
  var result = parseCedict(input);
  assertEqual(result.charMap['爸'].len, 1, 'Should end with single-char headword');
});

test('CC-Canto single-char avoids slang as primary def', function() {
  var input = [
    '虎 虎 [hu3] {fu2} /(slang) wife (who is savage and mean usually)/',
    '虎 虎 [hu3] {fu2} /tiger/brave/fierce/'
  ].join('\n');
  var result = parseCanto(input);
  assertEqual(result.wordMap['虎'].d, 'tiger', 'Should prefer non-slang definition');
});

// Run tests
console.log('Running CC-CEDICT parser tests...\n');

tests.forEach(function(t) {
  try {
    t.fn();
    console.log('✓ ' + t.name);
    passed++;
  } catch (e) {
    console.log('✗ ' + t.name);
    console.log('  ' + e.message);
    failed++;
  }
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');

// Test against real CC-CEDICT file
console.log('Testing against real CC-CEDICT file...\n');
var fs = require('fs');
var path = require('path');

try {
  var cedictPath = path.join(__dirname, '../cedict_ts.u8');
  if (fs.existsSync(cedictPath)) {
    console.log('Loading ' + cedictPath + '...');
    var cedictContent = fs.readFileSync(cedictPath, 'utf8');
    console.log('File size: ' + (cedictContent.length / 1024 / 1024).toFixed(2) + ' MB');
    console.log('Parsing...');
    var result = parseCedict(cedictContent);
    
    // Check 山
    console.log('\nChecking 山:');
    if (result.charMap['山']) {
      console.log('  Definition: ' + result.charMap['山'].d);
      console.log('  Pinyin: ' + result.charMap['山'].p);
      console.log('  Length: ' + result.charMap['山'].len);
      console.log('  All defs: ' + JSON.stringify(result.charMap['山'].defs));
      if (result.charMap['山'].d.toLowerCase().indexOf('surname') !== -1) {
        console.log('  ❌ FAIL: Contains surname!');
        failed++;
      } else if (result.charMap['山'].d.toLowerCase().indexOf('mountain') !== -1 || 
                 result.charMap['山'].d.toLowerCase().indexOf('hill') !== -1) {
        console.log('  ✓ PASS: Contains mountain/hill');
        passed++;
      } else {
        console.log('  ⚠ WARN: Unexpected definition');
      }
    } else {
      console.log('  ❌ NOT FOUND in charMap');
      failed++;
    }
    
    // Check 你好
    console.log('\nChecking 你好:');
    if (result.wordMap['你好']) {
      console.log('  Definition: ' + result.wordMap['你好'].d);
      console.log('  Pinyin: ' + result.wordMap['你好'].p);
    } else {
      console.log('  ❌ NOT FOUND in wordMap');
    }
    
    console.log('\n=================');
    console.log('Total chars parsed: ' + Object.keys(result.charMap).length);
    console.log('Total words parsed: ' + Object.keys(result.wordMap).length);
  } else {
    console.log('⚠ CC-CEDICT file not found at ' + cedictPath);
  }
} catch (e) {
  console.log('Error testing real file: ' + e.message);
}

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
