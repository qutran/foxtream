import { readStore, Observable } from './store';
import { ModelType } from './types';

export interface Resource<T> {
  read(): T;
  getValue(): T;
}

type ResourceCreator<T> = (
  ...args: unknown[]
) => { $resource: () => Promise<T> };

enum STATE {
  initial,
  pending,
  fulfilled,
  error,
}

export function createResource<T, R>(
  fn: ResourceCreator<R> & ModelType<T>,
): Resource<R & Omit<T, '$resource'> & Observable<R & Omit<T, '$resource'>>> {
  const { $resource, ...methods } = fn();
  let state: STATE = STATE.initial;
  let promise = null;
  let data = null;
  let error = null;
  let model = null;

  return {
    read() {
      if (state === STATE.initial) {
        state = STATE.pending;
        promise = $resource()
          .then(payload => {
            model = () => ({ ...payload, ...methods });
            data = readStore(model);
            state = STATE.fulfilled;
          })
          .catch(ex => {
            error = ex;
            state = STATE.error;
          });
      }

      if (state === STATE.pending) throw promise;
      if (state === STATE.error) throw error;

      return data;
    },
    getValue() {
      return readStore(model);
    },
  };
}
