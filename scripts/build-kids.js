#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function parseCjkDecompLine(line) {
  if (!line || line.startsWith('#')) return null;
  const idx = line.indexOf(':');
  if (idx === -1) return null;
  const key = line.slice(0, idx).trim();
  const rest = line.slice(idx + 1).trim();
  if (!key || !rest) return null;
  const match = rest.match(/^([a-z])\((.*)\)$/i);
  if (!match) return null;
  const type = match[1];
  const compsRaw = match[2].trim();
  const components = compsRaw ? compsRaw.split(',').map((part) => part.trim()).filter(Boolean) : [];
  return { key, type, components };
}

function parseCjkDecompFile(filePath, map) {
  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const parsed = parseCjkDecompLine(line);
    if (!parsed) return;
    if (!map[parsed.key]) {
      map[parsed.key] = { t: parsed.type, c: parsed.components };
    }
  });
}

function resolveInputs(args) {
  const defaultOutput = path.join(__dirname, '..', 'assets', 'kids.json');
  if (!args.length) {
    const defaultInputs = [];
    const cjkFile = path.join(__dirname, '..', 'assets', 'cjk-decomp.txt');
    if (fs.existsSync(cjkFile)) defaultInputs.push(cjkFile);
    return { inputs: defaultInputs, output: defaultOutput };
  }
  const last = args[args.length - 1];
  if (last.endsWith('.json')) {
    return { inputs: args.slice(0, -1), output: last };
  }
  return { inputs: args, output: defaultOutput };
}

if (require.main === module) {
  const { inputs, output } = resolveInputs(process.argv.slice(2));
  const map = {};

  inputs.forEach((inputPath) => {
    if (!fs.existsSync(inputPath)) return;
    parseCjkDecompFile(inputPath, map);
  });

  fs.writeFileSync(output, JSON.stringify(map));
  console.log(`Wrote ${Object.keys(map).length} entries to ${output}`);
} else {
  module.exports = {
    parseCjkDecompLine: parseCjkDecompLine
  };
}
