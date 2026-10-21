const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/index.js'), 'utf8');
const searchSource = source.slice(source.indexOf('function initEnglishSearch()'), source.indexOf('function lookupCedict('));
function element() {
  return {
    children: [], dataset: {}, value: '',
    addEventListener(name, callback) { this[name] = callback; },
    appendChild(child) { this.children.push(child); },
    append(...children) { this.children.push(...children); },
    replaceChildren() { this.children = []; },
    setAttribute() {}, removeAttribute() {}, focus() { this.focused = true; }
  };
}

test('selecting an English search result closes Suggested Characters and loads the chosen character form', async () => {
  for (const script of ['simplified', 'traditional']) {
    const form = element(), input = element(), results = element(), character = element(), status = element();
    form.dataset = { found: 'Found', empty: 'Empty', loading: 'Loading', error: 'Error' };
    const elements = { 'english-search-form': form, 'english-search': input, 'english-search-results': results, 'character-select': character, 'english-search-status': status };
    const actions = [];
    const context = {
      document: { getElementById: id => elements[id], createElement: element, addEventListener() {} },
      lookupCedict: async (query, kind) => {
        assert.equal(query, 'horse'); assert.equal(kind, 'searchEnglish');
        return [{ simplified: '马', traditional: '馬', pinyin: 'mǎ', definition: 'horse' }];
      },
      $: selector => ({ fadeOut: () => actions.push(['close', selector]) }),
      getScriptType: () => script,
      setCharacterInput: text => actions.push(['load', text]),
      clearTimeout() {}, updateTimeout: null
    };
    vm.runInNewContext(searchSource + '\ninitEnglishSearch();', context);
    input.value = 'horse';
    await form.submit({ preventDefault() {} });
    assert.equal(results.children.length, 1);
    results.children[0].children[0].click();
    assert.deepEqual(actions, [['close', '#beginner-chars-modal'], ['load', script === 'traditional' ? '馬' : '马']]);
    assert.equal(character.focused, true);
    assert.equal(results.children.length, 0);
  }
});
