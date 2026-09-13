(function () {
  'use strict';

  var PAGE_SIZE = 24;

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function init() {
    var grid = document.getElementById('hsk-card-grid');
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.hsk-card'));
    var scriptInputs = Array.prototype.slice.call(document.querySelectorAll('input[name="hsk-script"]'));
    var search = document.getElementById('hsk-search');
    var radical = document.getElementById('hsk-radical');
    var strokeRange = document.getElementById('hsk-stroke-range');
    var exactStrokes = document.getElementById('hsk-exact-strokes');
    var sort = document.getElementById('hsk-sort');
    var resultCount = document.getElementById('hsk-result-count');
    var activeFilters = document.getElementById('hsk-active-filters');
    var clearFilters = document.getElementById('hsk-clear-filters');
    var showingCount = document.getElementById('hsk-showing-count');
    var showMore = document.getElementById('hsk-show-more');
    var empty = document.getElementById('hsk-empty');
    var random = document.getElementById('hsk-random-character');
    var visibleLimit = PAGE_SIZE;
    var filteredCards = cards.slice();
    var currentScript = 'simplified';

    function scriptValue(card, prefix) {
      return card.dataset[prefix + (currentScript === 'traditional' ? 'Traditional' : 'Simplified')] || '';
    }

    function populateRadicals() {
      radical.innerHTML = '<option value="">All radicals</option>';
      Array.from(new Set(cards.map(function (card) { return scriptValue(card, 'radical'); }).filter(Boolean)))
        .sort(function (a, b) { return a.localeCompare(b, 'zh-Hans'); })
        .forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        radical.appendChild(option);
      });
    }

    function updateCardScript(card) {
      var character = card.dataset[currentScript];
      var strokes = scriptValue(card, 'strokes');
      var cardRadical = scriptValue(card, 'radical');
      var practiceHref = '/#' + encodeURIComponent(character);
      var characterLink = card.querySelector('.hsk-card-character');
      var practiceLink = card.querySelector('.hsk-practice-link');
      characterLink.textContent = character;
      characterLink.href = practiceHref;
      characterLink.setAttribute('aria-label', 'Practice ' + character);
      practiceLink.href = practiceHref;
      card.querySelector('.hsk-practice-character').textContent = character;
      card.querySelector('.hsk-stroke-count').textContent = strokes || '—';
      var radicalButton = card.querySelector('.hsk-radical-filter');
      radicalButton.dataset.radical = cardRadical;
      radicalButton.textContent = cardRadical || '—';
      card.querySelectorAll('.hsk-speak').forEach(function (button) {
        button.dataset.text = character;
        button.setAttribute('aria-label', 'Hear ' + character + (button.dataset.language === 'zh-HK' ? ' in Cantonese' : ' in Mandarin'));
      });
      card.dataset.href = practiceHref;
    }

    populateRadicals();

    function matchesStrokeRange(strokes, range) {
      if (!range) return true;
      if (range === '1-4') return strokes >= 1 && strokes <= 4;
      if (range === '5-8') return strokes >= 5 && strokes <= 8;
      if (range === '9-12') return strokes >= 9 && strokes <= 12;
      return range === '13+' ? strokes >= 13 : true;
    }

    function addFilterChip(label, filterName) {
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.filter = filterName;
      button.textContent = label + ' ×';
      activeFilters.appendChild(button);
    }

    function updateFilterSummary() {
      activeFilters.innerHTML = '';
      if (search.value.trim()) addFilterChip('Search: ' + search.value.trim(), 'search');
      if (radical.value) addFilterChip('Radical: ' + radical.value, 'radical');
      if (strokeRange.value) addFilterChip(strokeRange.options[strokeRange.selectedIndex].text, 'range');
      if (exactStrokes.value) addFilterChip('Exactly ' + exactStrokes.value + ' strokes', 'exact');
      clearFilters.hidden = !activeFilters.children.length;
    }

    function compareCards(a, b) {
      var mode = sort.value;
      var aStrokes = Number(scriptValue(a, 'strokes')) || 999;
      var bStrokes = Number(scriptValue(b, 'strokes')) || 999;
      if (mode === 'strokes-asc') return aStrokes - bStrokes || Number(a.dataset.order) - Number(b.dataset.order);
      if (mode === 'strokes-desc') return bStrokes - aStrokes || Number(a.dataset.order) - Number(b.dataset.order);
      if (mode === 'pinyin') return a.dataset.pinyin.localeCompare(b.dataset.pinyin) || Number(a.dataset.order) - Number(b.dataset.order);
      if (mode === 'jyutping') return a.dataset.jyutping.localeCompare(b.dataset.jyutping) || Number(a.dataset.order) - Number(b.dataset.order);
      return Number(a.dataset.order) - Number(b.dataset.order);
    }

    function render(resetLimit) {
      if (resetLimit) visibleLimit = PAGE_SIZE;
      var query = normalize(search.value);
      var exact = Number(exactStrokes.value);

      cards.forEach(updateCardScript);

      filteredCards = cards.filter(function (card) {
        var haystack = normalize([
          card.dataset.simplified,
          card.dataset.traditional,
          card.dataset.meaning,
          card.dataset.pinyin,
          card.dataset.jyutping
        ].join(' '));
        var strokes = Number(scriptValue(card, 'strokes'));
        return (!query || haystack.indexOf(query) !== -1) &&
          (!radical.value || scriptValue(card, 'radical') === radical.value) &&
          matchesStrokeRange(strokes, strokeRange.value) &&
          (!exactStrokes.value || strokes === exact);
      }).sort(compareCards);

      filteredCards.forEach(function (card) { grid.appendChild(card); });
      cards.forEach(function (card) { card.hidden = true; });
      filteredCards.slice(0, visibleLimit).forEach(function (card) { card.hidden = false; });

      var shown = Math.min(visibleLimit, filteredCards.length);
      resultCount.textContent = filteredCards.length + (filteredCards.length === 1 ? ' character found' : ' characters found');
      showingCount.textContent = 'Showing ' + shown + ' of ' + filteredCards.length + ' characters';
      showMore.hidden = shown >= filteredCards.length;
      empty.hidden = filteredCards.length !== 0;
      updateFilterSummary();
    }

    [search, radical, strokeRange, exactStrokes].forEach(function (control) {
      control.addEventListener(control === search || control === exactStrokes ? 'input' : 'change', function () { render(true); });
    });
    sort.addEventListener('change', function () { render(false); });

    scriptInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        if (!input.checked) return;
        currentScript = input.value;
        radical.value = '';
        populateRadicals();
        render(true);
      });
    });

    showMore.addEventListener('click', function () {
      visibleLimit += PAGE_SIZE;
      render(false);
    });

    activeFilters.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter]');
      if (!button) return;
      if (button.dataset.filter === 'search') search.value = '';
      if (button.dataset.filter === 'radical') radical.value = '';
      if (button.dataset.filter === 'range') strokeRange.value = '';
      if (button.dataset.filter === 'exact') exactStrokes.value = '';
      render(true);
    });

    clearFilters.addEventListener('click', function () {
      search.value = '';
      radical.value = '';
      strokeRange.value = '';
      exactStrokes.value = '';
      render(true);
    });

    grid.addEventListener('click', function (event) {
      var radicalButton = event.target.closest('.hsk-radical-filter');
      if (radicalButton) {
        radical.value = radicalButton.dataset.radical;
        render(true);
        document.getElementById('hsk-browser-title').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (event.target.closest('a, button')) return;
      var card = event.target.closest('.hsk-card');
      if (card) window.location.href = card.dataset.href;
    });

    grid.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' || event.target !== event.target.closest('.hsk-card')) return;
      window.location.href = event.target.dataset.href;
    });

    grid.addEventListener('click', function (event) {
      var button = event.target.closest('.hsk-speak');
      if (!button || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
      event.stopPropagation();
      window.speechSynthesis.cancel();
      var utterance = new SpeechSynthesisUtterance(button.dataset.text);
      utterance.lang = button.dataset.language;
      window.speechSynthesis.speak(utterance);
    });

    random.addEventListener('click', function () {
      var pool = filteredCards.length ? filteredCards : cards;
      var card = pool[Math.floor(Math.random() * pool.length)];
      if (card) window.location.href = '/#' + encodeURIComponent(card.dataset[currentScript]);
    });

    render(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
