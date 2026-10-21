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

test('radical and component details use readable parts instead of internal decomposition codes', () => {
  const context = {
    $: selector => ({ prop: () => selector === '#show-mandarin' }),
    componentDefinitionCache: { '女': { d: 'woman', p: 'nu:3' } },
    formatComponentDefinition: entry => entry?.d || '',
    getComponentsLabel: () => 'Components:'
  };
  const components = source.slice(source.indexOf('function buildComponentsDetail('), source.indexOf('function renderKidsComponents('));
  const radical = source.slice(source.indexOf('function buildRadicalDetail('), source.indexOf('function renderRadicalLine('));
  vm.runInNewContext(components + radical, context);
  for (const detail of [
    context.buildRadicalDetail('女', ['𦣞']),
    context.buildComponentsDetail(['女', '𦣞'])
  ]) {
    assert.equal(detail, '女: woman (nu:3)\nComponents: 女 + 𦣞');
    assert.doesNotMatch(detail, /Decomp:|a\(/);
  }
  assert.equal(context.buildRadicalDetail('女', []), '女: woman (nu:3)');
});

test('popup text preserves rare glyphs with the same font fallback as the component row', () => {
  const context = app();
  const renderer = source.slice(source.indexOf('function renderComponentDetailText('), source.indexOf('function ensureComponentsToast('));
  vm.runInNewContext(renderer, context);
  const target = element();
  const text = '女: woman\nComponents: 女 + 𦣞 + 𧘇';
  context.renderComponentDetailText(target, text);
  assert.equal(target.textContent, text);
  const glyphs = target.children.filter(child => child.className?.includes('--supplementary'));
  assert.deepEqual(glyphs.map(child => child.textContent), ['𦣞', '𧘇']);
  context.renderComponentDetailText(target, '女: woman');
  assert.equal(target.textContent, '女: woman');
  assert.equal(target.children.length, 1, 'no stale glyphs from the previous popup');
});
