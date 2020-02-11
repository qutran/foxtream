const port = chrome.runtime.connect({ name: 'foxtream-content' });

function injectScript(filePath, tag) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'application/javascript');
  script.setAttribute('src', filePath);
  node.appendChild(script);
}

injectScript(chrome.extension.getURL('content/page.js'), 'body');

window.addEventListener(
  'message',
  ({ data }) => {
    if (!data || data.type !== '$$foxtream') return;
    port.postMessage(data.message);
  },
  false,
);
