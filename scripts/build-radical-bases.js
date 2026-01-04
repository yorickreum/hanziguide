#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const outFile = process.argv[2] || path.join(__dirname, '..', 'assets', 'radical-bases.json');
const map = {};

for (let code = 0x2F00; code <= 0x2FD5; code += 1) {
  const radical = String.fromCodePoint(code);
  let base = radical;
  try {
    base = radical.normalize('NFKD') || radical;
  } catch (e) {
    base = radical;
  }
  map[radical] = base;
}

fs.writeFileSync(outFile, JSON.stringify(map));
console.log(`Wrote ${Object.keys(map).length} radical bases to ${outFile}`);
