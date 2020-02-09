import { _globalThis } from './globalThis';

export const raf =
  _globalThis.requestIdleCallback ||
  _globalThis.requestAnimationFrame ||
  ((callback: Function) => setTimeout(callback, 0));
