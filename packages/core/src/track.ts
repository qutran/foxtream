import { ModelType } from './types';

export const trackers = [];

export type TrackCallback = (
  model: ModelType<any>,
  fn: Function,
  args: any[],
  output: any,
) => unknown;

export function track(callback: TrackCallback) {
  trackers.push(callback);
}

export function untrack(callback: TrackCallback) {
  trackers.splice(trackers.indexOf(callback));
}
