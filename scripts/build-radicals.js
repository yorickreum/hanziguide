#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function parseRadicalLine(line) {
  if (!line || line.startsWith('#')) return null;
  const parts = line.split('\t');
  if (parts.length < 3) return null;
  if (parts[1] !== 'kRSUnicode') return null;
  const code = parts[0];
  if (!code.startsWith('U+')) return null;
  const codepoint = parseInt(code.slice(2), 16);
  if (!Number.isFinite(codepoint)) return null;
  const char = String.fromCodePoint(codepoint);
  const values = parts[2].split(/\s+/);
  if (!values.length) return null;
  const match = values[0].match(/^(\d+)/);
  if (!match) return null;
  const radicalNum = parseInt(match[1], 10);
  if (!Number.isFinite(radicalNum) || radicalNum < 1 || radicalNum > 214) return null;
  const radicalChar = String.fromCodePoint(0x2F00 + radicalNum - 1);
  return { char, radicalChar };
}

const inputFile = process.argv[2] || path.join(__dirname, '..', 'assets', 'unihan', 'Unihan_IRGSources.txt');
const outFile = process.argv[3] || path.join(__dirname, '..', 'assets', 'radicals.json');

if (!fs.existsSync(inputFile)) {
  console.error(`Unihan radical file not found: ${inputFile}`);
  process.exit(1);
}

const map = {};
const contents = fs.readFileSync(inputFile, 'utf8');
contents.split(/\r?\n/).forEach((line) => {
  const parsed = parseRadicalLine(line);
  if (!parsed) return;
  if (!map[parsed.char]) map[parsed.char] = parsed.radicalChar;
});

fs.writeFileSync(outFile, JSON.stringify(map));
console.log(`Wrote ${Object.keys(map).length} radicals to ${outFile}`);
