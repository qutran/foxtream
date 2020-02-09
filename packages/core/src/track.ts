import { ModelType } from './types';

export const trackers = [];

export function track(
  middleware: (
    model: ModelType<any>,
    fn: Function,
    args: any[],
    output: any,
  ) => unknown,
) {
  trackers.push(middleware);
}
