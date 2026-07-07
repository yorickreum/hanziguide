#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const output = process.argv[3] || path.join('assets', 'data', 'geo-quiz-lacd-points.json');

if (!input) {
  console.error('Usage: node scripts/build-geo-quiz-lacd-data.js /path/to/cn_tax.csv [output.json]');
  process.exit(1);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scale(value, min, max) {
  if (value === null || max === min) return 0;
  return (value - min) / (max - min);
}

function toHexChannel(value) {
  const channel = Math.max(0, Math.min(255, Math.round(value * 255)));
  return channel.toString(16).padStart(2, '0');
}

const raw = fs.readFileSync(input, 'utf8');
const rows = parseCsv(raw).filter((row) => row.length > 1);
const header = rows[0].map((name) => name.replace(/^\uFEFF/, ''));
const index = Object.fromEntries(header.map((name, i) => [name, i]));
const records = rows.slice(1).filter((row) => row[index.cities]);

const dimensions = ['d1', 'd2', 'd3'];
const ranges = {};
dimensions.forEach((dimension) => {
  const values = records.map((row) => asNumber(row[index[dimension]])).filter((value) => value !== null);
  ranges[dimension] = {
    min: Math.min(...values),
    max: Math.max(...values)
  };
});

const points = records.map((row, id) => {
  const d1 = asNumber(row[index.d1]);
  const d2 = asNumber(row[index.d2]);
  const d3 = asNumber(row[index.d3]);
  const r = scale(d1, ranges.d1.min, ranges.d1.max);
  const g = scale(d2, ranges.d2.min, ranges.d2.max);
  const b = scale(d3, ranges.d3.min, ranges.d3.max);

  return {
    id: id + 1,
    name: row[index.cities],
    lat: asNumber(row[index.lat]),
    lon: asNumber(row[index.long]),
    rgb: `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`,
    sharp6: row[index.sharp6],
    heat6: row[index.heat6],
    sharp10: row[index.sharp10],
    heat10: row[index.heat10]
  };
});

const payload = {
  source: 'Huang et al. 2024 supplementary materials, Zenodo 10.5281/zenodo.10697975, cn_tax.csv',
  license: 'CC-BY-4.0',
  generatedFrom: path.basename(input),
  count: points.length,
  points
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(payload)}\n`);
