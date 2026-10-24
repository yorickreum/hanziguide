// These are diagnostic content impressions, not interaction events or billing
// impressions. Active View in AdSense remains the viewability source of truth.
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || !('MutationObserver' in window)) return;
  document.querySelectorAll('.site-ad-unit').forEach(function (unit) {
    var sent = {};
    var inView = false;
    var timer;
    function record(stage) {
      if (sent[stage]) return;
      sent[stage] = true;
      (window._paq = window._paq || []).push([
        'trackContentImpression', 'Ad: ' + unit.dataset.adPlacement,
        stage, window.location.pathname
      ]);
    }
    function update() {
      if (unit.dataset.adRequested) record('requested');
      if (unit.dataset.adFailed) record('library-error');
      var status = unit.getAttribute('data-ad-status');
      if (status === 'filled' || status === 'unfilled') record(status);
      clearTimeout(timer);
      if (inView && !document.hidden && status === 'filled' && !sent['visible-1s']) {
        timer = setTimeout(function () {
          if (!document.hidden && inView && unit.getAttribute('data-ad-status') === 'filled') record('visible-1s');
        }, 1000);
      }
    }
    var viewport = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        update();
      });
    }, { threshold: [0, 0.5] });
    viewport.observe(unit);
    new MutationObserver(update).observe(unit, {
      attributes: true,
      attributeFilter: ['data-ad-status', 'data-ad-requested', 'data-ad-failed']
    });
    document.addEventListener('visibilitychange', update);
    update();
  });
})();
