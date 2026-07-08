(function() {
  var CSV_URL = '/chinese_idioms_mandarin_cantonese.csv';
  var idioms = [];
  var state = {
    query: '',
    language: '',
    category: ''
  };

  var listEl = document.getElementById('idioms-list');
  var statusEl = document.getElementById('idioms-status');
  var searchEl = document.getElementById('idioms-search');
  var languageEl = document.getElementById('idioms-language');
  var categoryEl = document.getElementById('idioms-category');
  var missingFormEl = document.getElementById('idioms-missing-form');
  var missingTextEl = document.getElementById('idioms-missing-text');
  var missingNoteEl = document.getElementById('idioms-missing-note');
  var missingStatusEl = document.getElementById('idioms-missing-status');
  var categoryPromoEls = document.querySelectorAll('[data-idioms-category]');
  var searchTrackTimer = null;
  var lastTrackedSearch = '';

  function trackMatomoEvent(category, action, name, value) {
    if (typeof window === 'undefined' || !window._paq || typeof window._paq.push !== 'function') {
      return false;
    }
    var payload = ['trackEvent', category, action];
    if (name !== undefined && name !== null) {
      payload.push(name);
      if (value !== undefined && value !== null) {
        payload.push(value);
      }
    }
    window._paq.push(payload);
    return true;
  }

  function normalizeAnalyticsText(text, maxLen) {
    var clean = (text || '').replace(/\s+/g, ' ').trim();
    if (maxLen && clean.length > maxLen) {
      return clean.slice(0, maxLen);
    }
    return clean;
  }

  function analyticsContext(extra) {
    var payload = {
      query: state.query,
      language: state.language || 'All',
      category: state.category || 'All',
      shown: filteredIdioms().length
    };
    Object.keys(extra || {}).forEach(function(key) {
      payload[key] = extra[key];
    });
    return JSON.stringify(payload);
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var value = '';
    var quoted = false;

    for (var i = 0; i < text.length; i += 1) {
      var char = text[i];
      var next = text[i + 1];

      if (quoted) {
        if (char === '"' && next === '"') {
          value += '"';
          i += 1;
        } else if (char === '"') {
          quoted = false;
        } else {
          value += char;
        }
      } else if (char === '"') {
        quoted = true;
      } else if (char === ',') {
        row.push(value);
        value = '';
      } else if (char === '\n') {
        row.push(value);
        rows.push(row);
        row = [];
        value = '';
      } else if (char !== '\r') {
        value += char;
      }
    }

    if (value || row.length) {
      row.push(value);
      rows.push(row);
    }

    return rows;
  }

  function normalizeHeader(header) {
    return header.replace(/^\uFEFF/, '').trim();
  }

  function csvToObjects(text) {
    var rows = parseCsv(text).filter(function(row) {
      return row.some(function(value) {
        return value.trim();
      });
    });
    var headers = rows.shift().map(normalizeHeader);

    return rows.map(function(row) {
      return headers.reduce(function(obj, header, index) {
        obj[header] = (row[index] || '').trim();
        return obj;
      }, {});
    });
  }

  function dedupeRows(rows) {
    var byIdiom = {};

    rows.forEach(function(row) {
      var key = [row.hanzi, row.literal_translation, row.meaning].join('|');
      if (!byIdiom[key]) {
        byIdiom[key] = {
          hanzi: row.hanzi,
          literal: row.literal_translation,
          meaning: row.meaning,
          entries: []
        };
      }
      var exists = byIdiom[key].entries.some(function(entry) {
        return entry.language === row.language && entry.category === row.category;
      });
      if (!exists) {
        byIdiom[key].entries.push({
          language: row.language,
          category: row.category
        });
      }
    });

    return Object.keys(byIdiom).map(function(key) {
      return byIdiom[key];
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function primaryHanzi(value) {
    return (value || '').split('/')[0].trim();
  }

  function hanziVariants(value) {
    var parts = (value || '').split('/').map(function(part) {
      return part.trim();
    }).filter(Boolean);

    if (parts.length <= 1) {
      return parts.map(function(hanzi) {
        return {
          label: 'Hanzi',
          hanzi: hanzi
        };
      });
    }

    return parts.map(function(hanzi, index) {
      return {
        label: index === 0 ? 'Traditional' : 'Simplified',
        hanzi: hanzi
      };
    });
  }

  function visibleHanziVariants(value) {
    var variants = hanziVariants(value);

    if (state.language === 'Cantonese') {
      return variants.filter(function(variant) {
        return variant.label !== 'Simplified';
      });
    }

    if (state.language === 'Mandarin' && variants.length > 1) {
      return variants.filter(function(variant) {
        return variant.label !== 'Traditional';
      });
    }

    return variants;
  }

  function practiceHref(value) {
    return '/#' + encodeURIComponent(primaryHanzi(value));
  }

  function practiceHrefForHanzi(value) {
    return '/#' + encodeURIComponent(value);
  }

  function isToneSensitive(category) {
    return [
      'Mandarin internet slang',
      'Cantonese slang / Hong Kong',
      'Sarcastic / spicy',
      'Villain / power / dark aesthetic'
    ].indexOf(category) !== -1;
  }

  function renderCategoryOptions() {
    var categories = idioms
      .reduce(function(all, item) {
        item.entries.forEach(function(entry) {
          all.push(entry.category);
        });
        return all;
      }, [])
      .filter(function(value, index, self) {
        return value && self.indexOf(value) === index;
      })
      .sort();

    categoryEl.innerHTML = '<option value="">All categories</option>' + categories.map(function(category) {
      return '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + '</option>';
    }).join('');
  }

  function matchesQuery(item) {
    if (!state.query) {
      return true;
    }
    var haystack = [
      item.hanzi,
      item.literal,
      item.meaning,
      visibleEntries(item).map(function(entry) {
        return entry.language + ' ' + entry.category;
      }).join(' ')
    ].join(' ').toLowerCase();
    return haystack.indexOf(state.query) !== -1;
  }

  function visibleEntries(item) {
    return item.entries.filter(function(entry) {
      if (state.language && entry.language !== state.language) {
        return false;
      }
      if (state.category && entry.category !== state.category) {
        return false;
      }
      return true;
    });
  }

  function groupedVisibleEntries(item) {
    var byCategory = {};

    visibleEntries(item).forEach(function(entry) {
      if (!byCategory[entry.category]) {
        byCategory[entry.category] = {
          category: entry.category,
          languages: []
        };
      }
      if (byCategory[entry.category].languages.indexOf(entry.language) === -1) {
        byCategory[entry.category].languages.push(entry.language);
      }
    });

    return Object.keys(byCategory).map(function(category) {
      return byCategory[category];
    });
  }

  function filteredIdioms() {
    return idioms.filter(function(item) {
      if (!visibleEntries(item).length) {
        return false;
      }
      return matchesQuery(item);
    });
  }

  function render() {
    var visible = filteredIdioms();
    statusEl.textContent = visible.length + ' idiom' + (visible.length === 1 ? '' : 's') + ' shown';

    if (!visible.length) {
      listEl.innerHTML = '<p class="idioms-empty">No idioms match those filters.</p>';
      return;
    }

    listEl.innerHTML = visible.map(function(item) {
      var entryRows = groupedVisibleEntries(item).map(function(entry) {
        var toneBadge = isToneSensitive(entry.category)
          ? '<span class="idioms-badge idioms-badge-muted">tone-sensitive</span>'
          : '';
        return [
          '<div class="idioms-entry-row">',
            '<span class="idioms-language-label">' + escapeHtml(entry.languages.join(' / ')) + '</span>',
            '<span class="idioms-category">' + escapeHtml(entry.category) + '</span>',
            toneBadge,
          '</div>'
        ].join('');
      }).join('');
      var hanziRows = visibleHanziVariants(item.hanzi).map(function(variant) {
        return [
          '<a class="idiom-hanzi-row" href="' + practiceHrefForHanzi(variant.hanzi) + '">',
            '<span class="idiom-script-label">' + escapeHtml(variant.label) + '</span>',
            '<span class="idiom-hanzi-text">' + escapeHtml(variant.hanzi) + '</span>',
          '</a>'
        ].join('');
      }).join('');

      return [
        '<article class="idiom-card">',
          '<div class="idiom-card-meta">' + entryRows + '</div>',
          '<div class="idiom-hanzi-list">' + hanziRows + '</div>',
          '<div class="idiom-definition-list">',
            '<div class="idiom-definition-row">',
              '<span class="idiom-definition-label">Literal</span>',
              '<span class="idiom-definition-text">' + escapeHtml(item.literal) + '</span>',
            '</div>',
            '<div class="idiom-definition-row">',
              '<span class="idiom-definition-label">Meaning</span>',
              '<span class="idiom-definition-text">' + escapeHtml(item.meaning) + '</span>',
            '</div>',
          '</div>',
          '<a class="idiom-practice-link" href="' + practiceHref(item.hanzi) + '">',
            '<i class="fas fa-pen-nib" aria-hidden="true"></i> Practice characters',
          '</a>',
        '</article>'
      ].join('');
    }).join('');
  }

  function bindControls() {
    searchEl.addEventListener('input', function(event) {
      state.query = event.target.value.trim().toLowerCase();
      render();
      scheduleSearchTracking();
    });

    languageEl.addEventListener('change', function(event) {
      state.language = event.target.value;
      render();
      trackMatomoEvent('Idioms', 'FilterLanguage', analyticsContext({
        selected: state.language || 'All'
      }), filteredIdioms().length);
    });

    categoryEl.addEventListener('change', function(event) {
      state.category = event.target.value;
      render();
      trackMatomoEvent('Idioms', 'FilterCategory', analyticsContext({
        selected: state.category || 'All'
      }), filteredIdioms().length);
    });

    listEl.addEventListener('click', function(event) {
      var target = event.target;
      if (target && !target.closest) {
        target = target.parentElement;
      }
      var link = target ? target.closest('.idiom-hanzi-row, .idiom-practice-link') : null;
      if (!link) {
        return;
      }
      trackMatomoEvent('Idioms', 'PracticeClick', analyticsContext({
        text: normalizeAnalyticsText(link.textContent, 80)
      }));
    });

    categoryPromoEls.forEach(function(button) {
      button.addEventListener('click', function() {
        var category = button.getAttribute('data-idioms-category') || '';
        state.category = category;
        categoryEl.value = category;
        render();
        trackMatomoEvent('Idioms', 'CategoryPromoClick', analyticsContext({
          selected: category
        }), filteredIdioms().length);
        document.querySelector('.idioms-workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    if (missingFormEl) {
      missingFormEl.addEventListener('submit', submitMissingIdiom);
    }
  }

  function scheduleSearchTracking() {
    clearTimeout(searchTrackTimer);
    searchTrackTimer = setTimeout(function() {
      var query = normalizeAnalyticsText(state.query, 80);
      if (query.length < 2 || query === lastTrackedSearch) {
        return;
      }
      lastTrackedSearch = query;
      trackMatomoEvent('Idioms', 'Search', analyticsContext({
        query: query
      }), filteredIdioms().length);
    }, 900);
  }

  function submitMissingIdiom(event) {
    event.preventDefault();
    var idiom = normalizeAnalyticsText(missingTextEl ? missingTextEl.value : '', 80);
    var note = normalizeAnalyticsText(missingNoteEl ? missingNoteEl.value : '', 140);

    if (!idiom) {
      if (missingStatusEl) {
        missingStatusEl.textContent = 'Enter an idiom or saying before sending.';
      }
      return;
    }

    var sent = trackMatomoEvent('Idioms', 'MissingIdiom', JSON.stringify({
      idiom: idiom,
      note: note || '',
      language: state.language || 'All',
      category: state.category || 'All'
    }), idiom.length);

    if (missingStatusEl) {
      missingStatusEl.textContent = sent ?
        'Suggestion sent. Thank you.' :
        'Suggestion saved in the form, but analytics is unavailable right now.';
    }
    missingFormEl.reset();
  }

  fetch(CSV_URL)
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Could not load idioms CSV');
      }
      return response.text();
    })
    .then(function(csv) {
      idioms = dedupeRows(csvToObjects(csv));
      renderCategoryOptions();
      bindControls();
      render();
    })
    .catch(function(error) {
      console.error(error);
      statusEl.textContent = 'Could not load idioms.';
    });
})();
