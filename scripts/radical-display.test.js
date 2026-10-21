const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/index.js'), 'utf8');
const glyphSource = source.slice(source.indexOf('function getComponentGlyphClass('), source.indexOf('function needsHeavyComponentsFont('));
const renderSource = source.slice(source.indexOf('function renderRadicalLine('), source.indexOf('function renderRadical(char,'));
function element() {
  return {
    children: [], attributes: {}, style: {},
    set textContent(value) { this.text = value; this.children = []; },
    get textContent() { return (this.text || '') + this.children.map(child => child.textContent).join(''); },
    appendChild(child) { this.children.push(child); },
    setAttribute(key, value) { this.attributes[key] = value; }
  };
}
function app() {
  const loaded = [], details = [];
  const context = {
    document: {
      createElement: element,
      createTextNode: text => ({ textContent: text }),
      getElementById: () => ({ getAttribute: () => 'Other components:' })
    },
    getRadicalLabel: () => 'Radical:',
    setCharacterInput: char => loaded.push(char),
    appendInfoIcon: (...args) => details.push(args)
  };
  vm.runInNewContext(glyphSource + renderSource, context);
  return { ...context, loaded, details };
}

test('姬 keeps its actual radical distinct from the rare remaining component', () => {
  const radicals = JSON.parse(fs.readFileSync(path.join(root, 'assets/radicals.json'), 'utf8'));
  const kids = JSON.parse(fs.readFileSync(path.join(root, 'assets/kids.json'), 'utf8'));
  assert.equal(radicals['姬'].normalize('NFKD'), '女');
  assert.deepEqual(kids['姬'].c, ['女', '𦣞']);
  const ui = app(), target = element();
  ui.renderRadicalLine(target, '女', '𦣞', ['𦣞'], 'details');
  assert.equal(target.textContent, 'Radical: 女 · Other components: 𦣞');
  const glyphs = target.children.filter(child => child.attributes?.role === 'button');
  assert.equal(glyphs.length, 2);
  assert.equal(glyphs[0].className, 'component-glyph');
  assert.equal(glyphs[1].className, 'component-glyph component-glyph--supplementary');
  glyphs[0].onclick({ stopPropagation() {} });
  glyphs[1].onkeydown({ key: 'Enter', preventDefault() {} });
  assert.deepEqual(ui.loaded, ['女', '𦣞']);
  assert.equal(ui.details.length, 1);
});

test('a radical without remaining components has no empty extra label and clears stale content', () => {
  const ui = app(), target = element();
  ui.renderRadicalLine(target, '女', '𦣞', ['𦣞'], 'details');
  ui.renderRadicalLine(target, '木', '', [], 'details');
  assert.equal(target.textContent, 'Radical: 木');
  assert.equal(target.children.filter(child => child.attributes?.role === 'button').length, 1);
});

test('supplementary glyph font support also covers other rare components without changing common glyphs', () => {
  const ui = app();
  assert.equal(ui.getComponentGlyphClass('女'), 'component-glyph');
  assert.equal(ui.getComponentGlyphClass('臣'), 'component-glyph');
  assert.match(ui.getComponentGlyphClass('𧘇'), /--supplementary/);
});
