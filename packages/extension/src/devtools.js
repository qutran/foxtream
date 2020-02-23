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
  let pool = [];
  const panel = await createPanel();

  panel.onShown.addListener(_window => {
    window = _window;
    if (pool.length) {
      for (const message of pool) {
        window.postMessage(JSON.stringify(message), '*');
      }
    }
    panel.onHidden.addListener(() => {
      pool = [];
      window = null;
      port.onMessage.removeListener(onMessage);
    });
  });

  function onMessage(message) {
    if (window) {
      window.postMessage(JSON.stringify(message), '*');
    } else {
      pool.push(message);
    }
  }
}

main();
