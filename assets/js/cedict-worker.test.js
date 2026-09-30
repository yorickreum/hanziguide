// Run the production worker in a sandbox, rather than copying its parsers.
// Run with: node assets/js/cedict-worker.test.js
var vm = require('node:vm');
var worker = { self: { postMessage: function() {} } };
vm.createContext(worker);
vm.runInContext(require('node:fs').readFileSync(require('node:path').join(__dirname, 'cedict-worker.js'), 'utf8'), worker);
var parseCedict = worker.parseCedict;
var parseCanto = worker.parseCanto;

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

test('English search ranks exact meanings and keeps secondary senses', function() {
  var entries = worker.parseEnglishEntries([
    '水車 水车 [shui3 che1] /water wheel/',
    '水 水 [shui3] /water; liquid/',
    '喝 喝 [he1] /to drink/',
    '媽 妈 [ma1] /mum/mother/'
  ].join('\n'));
  assertEqual(worker.searchEnglish(entries, ' WATER ')[0].simplified, '水', 'Exact meaning ranks first');
  assertEqual(worker.searchEnglish(entries, 'liquid')[0].simplified, '水', 'Secondary sense is searchable');
  assertEqual(worker.searchEnglish(entries, 'drink')[0].simplified, '喝', 'Infinitive is an exact match');
  assertEqual(worker.searchEnglish(entries, 'mother')[0].traditional, '媽', 'Traditional form is preserved');
  assertEqual(worker.searchEnglish(entries, 'mother')[0].pinyin, 'ma1', 'Reading is preserved');
  assertEqual(worker.searchEnglish(entries, 'wat').length, 0, 'No partial-word matches');
  assertEqual(worker.searchEnglish(entries, '!!!').length, 0, 'Empty normalized queries return nothing');
});

test('English search excludes references and deduplicates results', function() {
  var entries = worker.parseEnglishEntries([
    '水 水 [shui3] /water/', '水 水 [shui3] /water/',
    '氵 氵 [shui3] /variant of water/',
    '你好 你好 [ni3 hao3] /hello/hi/',
    '謝謝 谢谢 [xie4 xie5] /thank you/'
  ].join('\n'));
  assertEqual(worker.searchEnglish(entries, 'water').length, 1, 'Duplicate and reference entries excluded');
  assertEqual(worker.searchEnglish(entries, 'thank   you')[0].simplified, '谢谢', 'Phrase whitespace normalized');
  assertEqual(worker.searchEnglish(entries, 'unknown').length, 0, 'Unknown queries return nothing');
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
