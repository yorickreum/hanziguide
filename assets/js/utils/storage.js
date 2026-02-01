export function safeSessionGet(key) {
  try {
    return window.sessionStorage ? window.sessionStorage.getItem(key) : null;
  } catch (e) {
    return null;
  }
}

export function safeSessionSet(key, value) {
  try {
    if (window.sessionStorage) window.sessionStorage.setItem(key, value);
  } catch (e) {
    // Ignore storage failures (private mode, sandboxed frames, etc.).
  }
}

export function safeSessionRemove(key) {
  try {
    if (window.sessionStorage) window.sessionStorage.removeItem(key);
  } catch (e) {
    // Ignore storage failures.
  }
}

export function getCharsFromHash() {
  var hash = window.location.hash ? window.location.hash.substring(1) : '';
  if (!hash) return '';
  try {
    return decodeURIComponent(hash);
  } catch (e) {
    return hash;
  }
}
