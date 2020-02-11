window.$$foxtream_send = message => {
  window.postMessage({ type: '$$foxtream', message }, '*');
};
