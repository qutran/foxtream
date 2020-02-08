import { globalThis } from './globalThis';

export const raf =
  globalThis.requestIdleCallback ||
  globalThis.requestAnimationFrame ||
  ((callback: Function) => setTimeout(callback, 0));
