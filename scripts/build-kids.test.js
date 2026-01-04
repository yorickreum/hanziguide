#!/usr/bin/env node
'use strict';

// Run with: node scripts/build-kids.test.js

const assert = require('assert');
const buildKids = require('./build-kids');

function test(name, fn) {
  try {
    fn();
    console.log('✓ ' + name);
  } catch (err) {
    console.error('✗ ' + name);
    console.error(err.message || err);
    process.exitCode = 1;
  }
}

test('Parses cjk-decomp entry for 袁', function() {
  const line = '袁:d(土,37432)';
  const parsed = buildKids.parseCjkDecompLine(line);
  assert(parsed, 'Should parse line');
  assert.strictEqual(parsed.key, '袁');
  assert.strictEqual(parsed.type, 'd');
  assert.deepStrictEqual(parsed.components, ['土', '37432']);
});

test('Parses cjk-decomp entry for intermediate component', function() {
  const line = '37432:d(口,𧘇)';
  const parsed = buildKids.parseCjkDecompLine(line);
  assert(parsed, 'Should parse line');
  assert.strictEqual(parsed.key, '37432');
  assert.strictEqual(parsed.type, 'd');
  assert.deepStrictEqual(parsed.components, ['口', '𧘇']);
});

if (process.exitCode) {
  process.exit(1);
}
