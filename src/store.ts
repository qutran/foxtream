import { raf } from './utils/raf';

export type Type<T> = (...args: any[]) => T;
type Listener<T> = (subject: T) => unknown;
type Unsubscribe = () => void;
type Subscribe<T> = (listener: Listener<T>) => Unsubscribe;

export interface Observable<T> {
  /**
   * subscribe to data changes
   * @param listener callback function to receive updated data
   * @returns unsubscribe function
   */
  subscribe(listener: Listener<T>): Unsubscribe;
}

interface Computed<T> {
  getValue(): T;
  subscribe(listener: Listener<T>): Unsubscribe;
  destroy(): void;
}

let isComputed = false;
let scheduled = false;
let currentScheduleUpdate = null;
const subFlow = new Set<Subscribe<any>>();
const cache = new Map<Type<any>, any>();

function wrapSubject<T>(subject: T): Observable<T> {
  const listeners = new Set<Listener<T>>();
  const observableSubject = {
    ...subject,
    subscribe(listener: Listener<T>) {
      listener(observableSubject);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  for (const [key, value] of Object.entries(observableSubject)) {
    if (typeof value !== 'function' || key === 'subscribe') continue;
    const originalMethod = observableSubject[key];
    observableSubject[key] = async (...args: unknown[]) => {
      const nextSubjectData: T = originalMethod(...args)(observableSubject);
      Object.assign(
        observableSubject,
        nextSubjectData instanceof Promise
          ? await nextSubjectData
          : nextSubjectData,
      );
      dispatch(observableSubject);
    };
  }

  function dispatch(nextSubjectData: T) {
    if (scheduled) return;
    scheduled = true;
    raf(() => {
      scheduled = false;
      listeners.forEach(listener => listener(nextSubjectData));
    });
  }

  return observableSubject;
}

export function initStore<T extends (...args: any[]) => unknown>(
  model: T,
  ...params: Parameters<T>
) {
  cache.set(model, wrapSubject(model(...params)));
}

export function readStore<T>(model: Type<T>): T & Observable<T> {
  if (!cache.has(model)) initStore(model);
  const fromCache = cache.get(model) as T & Observable<T>;
  if (isComputed) subFlow.add(fromCache.subscribe);
  return fromCache;
}

export function computed<T>(fn: Type<T>): Computed<ReturnType<typeof fn>> {
  isComputed = true;
  currentScheduleUpdate = scheduleUpdate;
  const listeners = new Set<Listener<T>>();
  let destroyed = false;
  let scheduled = false;
  let currentValue = fn();
  const unsubs = [...subFlow].map(sub =>
    sub(() => raf(() => scheduleUpdate())),
  );
  subFlow.clear();
  isComputed = false;

  function scheduleUpdate() {
    if (scheduled || destroyed) return;
    scheduled = true;
    raf(() => {
      currentValue = fn();
      scheduled = false;
      dispatch();
    });
  }

  function getValue(): T {
    if (isComputed) listeners.add(currentScheduleUpdate);
    return currentValue;
  }

  function subscribe(listener: Listener<T>) {
    if (destroyed) return;
    listener(currentValue);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function destroy() {
    listeners.clear();
    for (const unsub of unsubs) unsub();
    destroyed = true;
  }

  function dispatch() {
    listeners.forEach(listener => listener(currentValue));
  }

  return { getValue, subscribe, destroy };
}
