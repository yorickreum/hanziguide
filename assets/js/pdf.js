import { safeSessionGet, getCharsFromHash } from '/assets/js/utils/storage.js';

async function generatePdf(chars) {
  var statusEl = document.getElementById('pdf-status');
  if (!chars) {
    if (statusEl) statusEl.textContent = 'Enter characters on the practice page first.';
    return;
  }

  if (statusEl) statusEl.textContent = 'Generating PDF…';
  try {
    var pdfModule = await import('/assets/js/hanzi_practice_pdf.js');
    await pdfModule.saveHanziPracticePdf(
      { characters: chars },
      'hanzi-practice.pdf'
    );
    if (window._paq && typeof window._paq.push === 'function') {
      window._paq.push(['trackEvent', 'PDF', 'Generate', chars, chars.length]);
    }
    if (statusEl) statusEl.textContent = 'Download should begin shortly.';
  } catch (err) {
    console.error('PDF error:', err);
    if (statusEl) statusEl.textContent = 'Failed to generate PDF.';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var chars = getCharsFromHash();
  if (!chars) {
    chars = safeSessionGet('hanziguide_chars') || '';
  }
  var backLink = document.getElementById('back-to-practice-link');
  if (backLink) {
    var href = '/';
    if (chars) {
      href += '#' + encodeURIComponent(chars);
    }
    backLink.setAttribute('href', href);
  }
  generatePdf(chars.trim());
});
