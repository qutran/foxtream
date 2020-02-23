function createPool() {
  let pool = [];

  return {
    hasItems() {
      return !!pool.length;
    },
    push<T>(message: T) {
      pool.push(message);
    },
    invoke<T>(callback: (...args: T[]) => any) {
      pool.forEach((item: T) => callback(item));
      pool = [];
    },
  };
}

export function createWSEmitter() {
  const TOOLS_PORT = 2789;
  const host = `ws://localhost:${TOOLS_PORT}?token=0&type=app`;
  let ready = false;
  const pool = createPool();
  const ws = new WebSocket(host);
  ws.onopen = () => {
    ready = true;
    if (pool.hasItems()) {
      pool.invoke(message => ws.send(JSON.stringify(message)));
    }
  };

  return {
    send<T>(message: T) {
      if (ready) {
        ws.send(JSON.stringify(message));
      } else {
        pool.push(message);
      }
    },
  };
}

export function createExtensionEmitter() {
  const win = window as any;
  const pool = createPool();
  const { requestIdleCallback } = win;

  function wait() {
    if (win.$$foxtream_send) {
      pool.invoke(message => win.$$foxtream_send(message));
    } else {
      requestIdleCallback(wait);
    }
  }

  wait();

  return {
    send<T>(message: T) {
      if (!win.$$foxtream_send) {
        requestIdleCallback(() => win.$$foxtream_send(message));
      } else {
        pool.push(message);
      }
    },
  };
}
