import { track } from '@foxtream/core';
import { createExtensionEmitter, createWSEmitter } from './utils/factories';
import { getSourceStack } from './utils/getSourceStack';

interface Action<T> {
  type: string;
  payload: T;
}

interface CallPayload {
  model: string;
  method: string;
  input?: unknown[];
  output: unknown;
  source?: string[];
  timestamp: number;
}

function serialize(obj: Object) {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'function') {
      delete result[key];
    }
  }
  return result;
}

export function initTools({ standalone }: { standalone?: boolean } = {}) {
  const emitter = standalone ? createWSEmitter() : createExtensionEmitter();

  track(async (model, method, input, output) => {
    emitter.send<Action<CallPayload>>({
      type: 'call',
      payload: {
        model: model.name,
        method: method.name,
        input,
        output: serialize(output),
        source: await getSourceStack(),
        timestamp: performance.now(),
      },
    });
  });
}
