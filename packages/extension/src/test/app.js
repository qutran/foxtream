import 'https://cdnjs.cloudflare.com/ajax/libs/stacktrace.js/2.0.2/stacktrace.min.js';
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

function getFileMeta(file) {
  if (!file) return null;
  const { fileName, lineNumber, columnNumber } = file;
  return { fileName, lineNumber, columnNumber };
}

async function getTriggerSource() {
  const after = 'observableSubject.<computed>';
  const stack = await StackTrace.get();
  const index = stack.findIndex(
    ({ functionName }) => functionName && functionName.indexOf(after) >= 0,
  );
  return index < 0 ? null : getFileMeta(stack[index + 1]);
}

track(async (model, method, input, output) => {
  const triggerSource = await getTriggerSource();
  console.log(triggerSource);

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

function abc() {
  const { sayHello } = readStore(UserModel);
  sayHello();
}

setTimeout(() => {
  abc();
}, 3000);
