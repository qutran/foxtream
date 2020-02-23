import App from './App.svelte';
const TOOLS_PORT = 2789;

interface Message {
  type: string;
  payload: any;
}

type UI = ReturnType<typeof createUI>;

function openSourceFile(path: string) {
  const encodedPath = encodeURIComponent(path);
  fetch(`http://localhost:${TOOLS_PORT}/open/${encodedPath}`);
}

function deserializeMessage(serializedMessage: string): Message {
  return JSON.parse(serializedMessage);
}

function createUI(target: HTMLElement) {
  return new App({ target, intro: true });
}

function createOnMessage(ui: UI) {
  return function onMessage(message: Message) {
    const { type, payload } = message;
    switch (type) {
      case 'call':
        ui.addCall(payload);
        break;
      case 'clearCalls':
        ui.clearCalls();
        break;
      case 'batch':
        payload.forEach((message: Message) => onMessage(message));
        break;
    }
  };
}

export function createStandaloneUI(target: HTMLElement) {
  const ui = createUI(target);
  const onMessage = createOnMessage(ui);
  const ws = new WebSocket(`ws://localhost:${TOOLS_PORT}?token=0&type=tools`);
  ws.addEventListener('message', ({ data }) => {
    onMessage(deserializeMessage(data));
  });
}

export function createExtensionUI(target: HTMLElement) {
  const ui = createUI(target);
  const onMessage = createOnMessage(ui);
  window.addEventListener('message', ({ data }) => {
    onMessage(deserializeMessage(data));
  });
}
