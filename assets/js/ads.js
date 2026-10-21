// Only explicitly placed banners are requested. Auto ads must also be disabled
// in AdSense; loading Google's library cannot enforce account-level settings.
(function () {
  'use strict';

  var libraryRequested = false;

  function requestAd(unit) {
    // Hidden quiz results and containers too narrow for a banner stay untouched.
    if (unit.dataset.adRequested || unit.getBoundingClientRect().width < 250 || !unit.getClientRects().length) return;
    unit.dataset.adRequested = 'true';

    if (!libraryRequested) {
      libraryRequested = true;
      var script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(unit.dataset.adClient);
      document.head.appendChild(script);
    }

    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }

  // Fail quietly without loading ads on older browsers. IntersectionObserver
  // also waits for the quiz results to become visible before requesting an ad.
  if (!('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        requestAd(entry.target);
        if (entry.target.dataset.adRequested) observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px 0px' });

  document.querySelectorAll('.site-ad-banner').forEach(function (unit) {
    observer.observe(unit);
  });
})();
