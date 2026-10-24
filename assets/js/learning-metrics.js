(function () {
  'use strict';
  var startedAt = Date.now();
  var started = false;
  var completed = {};
  function track(category, action, name, value) {
    var event = ['trackEvent', category, action];
    if (name !== undefined) event.push(name);
    if (value !== undefined) event.push(value);
    (window._paq = window._paq || []).push(event);
  }
  window.hanziLearning = {
    track: track,
    practiceStarted: function () {
      if (started) return;
      started = true;
      track('Learning', 'PracticeStart', 'seconds-to-first-practice', Math.round((Date.now() - startedAt) / 1000));
    },
    practiceCompleted: function (kind) {
      if (completed[kind]) return;
      completed[kind] = true;
      track('Learning', kind);
    }
  };
})();
