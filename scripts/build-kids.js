#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const idsOperatorRegex = /[⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻]/;

function addEntry(map, char, ids) {
  if (!char || !ids) return;
  if (!map[char]) map[char] = ids;
}

function parseUnihanDir(unihanDir, map) {
  const files = fs.readdirSync(unihanDir).filter((file) => /^Unihan_.*\.txt$/.test(file));
  files.forEach((file) => {
    const contents = fs.readFileSync(path.join(unihanDir, file), 'utf8');
    contents.split(/\r?\n/).forEach((line) => {
      if (!line || line.startsWith('#')) return;
      const parts = line.split('\t');
      if (parts.length < 3) return;
      if (parts[1] !== 'kIDS') return;
      const code = parts[0];
      if (!code.startsWith('U+')) return;
      const codepoint = parseInt(code.slice(2), 16);
      if (!Number.isFinite(codepoint)) return;
      const char = String.fromCodePoint(codepoint);
      addEntry(map, char, parts[2]);
    });
  });
}

function parseIdsFile(filePath, map) {
  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    if (!line || line.startsWith('#')) return;
    const parts = line.split('\t');
    if (parts.length < 2) return;
    let char = '';
    let ids = '';

    if (parts[0].startsWith('U+')) {
      const codepoint = parseInt(parts[0].slice(2), 16);
      if (!Number.isFinite(codepoint)) return;
      char = String.fromCodePoint(codepoint);
      if (parts[1] === 'kIDS' && parts[2]) {
        ids = parts[2];
      } else if (parts.length >= 3 && parts[1].length === 1) {
        ids = parts[2];
      } else {
        ids = parts[1];
      }
    } else if (parts[0].length === 1) {
      char = parts[0];
      ids = parts[1];
    }

    if (!idsOperatorRegex.test(ids)) return;
    addEntry(map, char, ids);
  });
}

function resolveInputs(args) {
  const defaultOutput = path.join(__dirname, '..', 'assets', 'kids.json');
  if (!args.length) {
    const defaultInputs = [];
    const unihanDir = path.join(__dirname, '..', 'assets', 'unihan');
    const idsFile = path.join(__dirname, '..', 'assets', 'ids-ucs-basic.txt');
    if (fs.existsSync(unihanDir)) defaultInputs.push(unihanDir);
    if (fs.existsSync(idsFile)) defaultInputs.push(idsFile);
    return { inputs: defaultInputs, output: defaultOutput };
  }
  const last = args[args.length - 1];
  if (last.endsWith('.json')) {
    return { inputs: args.slice(0, -1), output: last };
  }
  return { inputs: args, output: defaultOutput };
}

const { inputs, output } = resolveInputs(process.argv.slice(2));
const map = {};

inputs.forEach((inputPath) => {
  if (!fs.existsSync(inputPath)) return;
  const stat = fs.statSync(inputPath);
  if (stat.isDirectory()) {
    parseUnihanDir(inputPath, map);
  } else {
    parseIdsFile(inputPath, map);
  }
});

fs.writeFileSync(output, JSON.stringify(map));
console.log(`Wrote ${Object.keys(map).length} entries to ${output}`);
