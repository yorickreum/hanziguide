// Only explicitly placed banners are requested. Auto ads must also be disabled
// in AdSense; loading Google's library cannot enforce account-level settings.
(function () {
  'use strict';

  var libraryRequested = false;
  var libraryFailed = false;
  var units = document.querySelectorAll('.site-ad-unit');

  function collapseAd(unit) {
    // Never hide a creative that Google has reported as filled.
    if (unit.getAttribute('data-ad-status') !== 'filled') {
      unit.closest('.site-ad').hidden = true;
    }
  }

  units.forEach(function (unit) {
    if (!('MutationObserver' in window)) return;
    // Google explicitly marks empty inventory as unfilled. Do not use a
    // timeout: a slow or consent-delayed request may still return a valid ad.
    var statusObserver = new MutationObserver(function () {
      if (unit.getAttribute('data-ad-status') === 'unfilled') {
        collapseAd(unit);
        statusObserver.disconnect();
      }
    });
    statusObserver.observe(unit, { attributes: true, attributeFilter: ['data-ad-status'] });
  });

  function requestAd(unit) {
    if (libraryFailed) {
      collapseAd(unit);
      return;
    }
    // Hidden quiz results and containers too narrow for a banner stay untouched.
    if (unit.dataset.adRequested || unit.getBoundingClientRect().width < 250 || !unit.getClientRects().length) return;
    unit.dataset.adRequested = 'true';
    // AdSense selects the next unprocessed .adsbygoogle element for each push.
    // Register only the visible unit being requested, so hidden desktop/mobile
    // alternatives and distant placements cannot consume another unit's push.
    unit.classList.add('adsbygoogle');

    if (!libraryRequested) {
      libraryRequested = true;
      var script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onerror = function () {
        libraryFailed = true;
        units.forEach(collapseAd);
      };
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(unit.dataset.adClient);
      document.head.appendChild(script);
    }

    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  // Fail quietly without loading ads on older browsers. IntersectionObserver
  // also waits for the quiz results to become visible before requesting an ad.
  if (!('IntersectionObserver' in window)) {
    units.forEach(collapseAd);
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        requestAd(entry.target);
        if (entry.target.dataset.adRequested) observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px 0px' });

  units.forEach(function (unit) {
    observer.observe(unit);
  });
})();
