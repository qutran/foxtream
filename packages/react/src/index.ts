import {
  readStore,
  track,
  untrack,
  Computed,
  Observable,
  Resource,
  ModelType,
  TrackCallback,
} from '@foxtream/core';
import { useState, useCallback, useEffect, useMemo } from 'react';

export function useStore<T>(model: ModelType<T>) {
  const store = useMemo(() => readStore(model), [model]);
  const [value, setValue] = useState<Omit<T, 'subscribe'>>(() => {
    const { subscribe, ...initialValue } = store;
    return initialValue;
  });

  useEffect(() => store.subscribe(nextValue => setValue({ ...nextValue })), [
    store,
  ]);

  return value;
}

export function useComputed<T>(computed: Computed<T>): T {
  const [value, setValue] = useState(() => computed.getValue());
  useEffect(() => computed.subscribe(setValue), [computed]);

  return value;
}

export function useResource<T extends Observable<any>>(resource: Resource<T>) {
  const data = resource.read();
  const subscribe = useCallback(data.subscribe, [resource]);
  const [value, setValue] = useState(() => {
    const { subscribe, ...initialValue } = data;
    return initialValue;
  });

  useEffect(() => subscribe(nextValue => setValue({ ...nextValue })), [
    subscribe,
  ]);
  return value;
}

export function useTrack(fn: TrackCallback, deps = []) {
  useEffect(() => {
    track(fn);
    return () => untrack(fn);
  }, deps);
}
