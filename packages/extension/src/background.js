const DEVTOOLS_NAME = 'foxtream-devtools';
const CONTENT_NAME = 'foxtream-content';
const devtoolsPorts = {};
const messagePool = {};
chrome.extension.onConnect.addListener(onConnect);

function getCurrentTabId() {
  return new Promise(resolve => {
    chrome.tabs.query(
      { active: true, windowType: 'normal', currentWindow: true },
      ([tab]) => {
        tab && resolve(tab.id);
      },
    );
  });
}

function onConnect(port) {
  const fn = {
    [DEVTOOLS_NAME]: onDevtoolsConnect,
    [CONTENT_NAME]: onContentConnect,
  }[port.name];

  fn && fn(port);
}

async function onContentConnect(port) {
  const tabId = await getCurrentTabId();
  messagePool[tabId] = [];

  port.onMessage.addListener(message => onContentMessage(message, tabId));
  port.onDisconnect.addListener(() => {
    onContentMessage({ action: 'clear' }, tabId);
    delete messagePool[tabId];
  });
}

async function onDevtoolsConnect(port) {
  const tabId = await getCurrentTabId();
  const messages = messagePool[tabId];
  devtoolsPorts[tabId] = port;

  if (messages && messages.length) {
    port.postMessage({ action: 'batch', payload: messages });
  }

  port.onMessage.addListener(onDevtoolsMessage);
  port.onDisconnect.addListener(() => {
    delete devtoolsPorts[tabId];
  });
}

function onContentMessage(message, tabId) {
  targetPort = devtoolsPorts[tabId];
  messagePool[tabId].push(message);
  console.log({ message, tabId });
  if (targetPort) {
    targetPort.postMessage(message);
  }
}

function onDevtoolsMessage(message) {
  console.log(message);
}
