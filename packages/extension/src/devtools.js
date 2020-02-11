const port = chrome.runtime.connect({ name: 'foxtream-devtools' });

function createPanel() {
  return new Promise(resolve =>
    chrome.devtools.panels.create(
      'Foxtream',
      null,
      './devtools/index.html',
      resolve,
    ),
  );
}

async function main() {
  port.onMessage.addListener(onMessage);
  let window = null;
  const pool = [];
  const panel = await createPanel();

  panel.onShown.addListener(_window => {
    window = _window;
    if (pool.length) {
      for (const message of pool) {
        window.postMessage(message, '*');
      }
    }
    panel.onHidden.addListener(() => port.onMessage.removeListener(onMessage));
  });

  function onMessage(message) {
    if (window) {
      window.postMessage(message, '*');
    } else {
      pool.push(message);
    }
  }
}

main();
