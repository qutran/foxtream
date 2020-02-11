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
  let window = null;
  const pool = [];
  const panel = await createPanel();
  port.onMessage.addListener(onMessage);

  panel.onShown.addListener(_window => {
    window = _window;
    console.log(pool);
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
