import { track, readStore } from 'https://www.unpkg.com/@foxtream/core';

let waiting = false;
const stack = [];

function wait() {
  if (!waiting && !window.$$foxtream_send) {
    return requestIdleCallback(wait);
  }

  if (window.$$foxtream_send) {
    stack.forEach(data => window.$$foxtream_send(data));
  }

  waiting = true;
}

function send(data) {
  if (!window.$$foxtream_send) {
    stack.push(data);
    wait();
    return;
  }

  requestIdleCallback(() => {
    window.$$foxtream_send(data);
  });
}

function serialize(obj) {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'function') {
      delete result[key];
    }
  }
  return result;
}

track((model, method, input, output) => {
  send({
    action: 'call',
    payload: {
      model: model.name,
      method: method.name,
      input,
      output: serialize(output),
    },
  });
});

function UserModel(name = 'Dmitry', age = 24) {
  return {
    name,
    age,
    update(patch) {
      return () => patch;
    },
    sayHello() {
      return ({ name }) => ({ name: `Hello, ${name}` });
    },
  };
}

const user = readStore(UserModel);

user.update({ name: 'Anna' });

setTimeout(() => {
  readStore(UserModel).sayHello();
}, 3000);
