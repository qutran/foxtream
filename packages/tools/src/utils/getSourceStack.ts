import StackTrace from 'stacktrace-js';
import { StackFrame } from 'stacktrace-js';

const OBSERVABLE_SUBJECT_NAME = 'observableSubject.<computed>';

function getSourceLink(frame: StackFrame) {
  const { fileName, lineNumber, columnNumber } = frame;
  return `${fileName}:${lineNumber}:${columnNumber}`;
}

export async function getSourceStack() {
  const stackTrace = await StackTrace.get();

  for (let i = 0; i < stackTrace.length; i++) {
    const isCurrentObservable = stackTrace[i]?.functionName?.includes(
      OBSERVABLE_SUBJECT_NAME,
    );
    const isNextObservable = stackTrace[i + 1]?.functionName?.includes(
      OBSERVABLE_SUBJECT_NAME,
    );

    if (isCurrentObservable && !isNextObservable) {
      return stackTrace.slice(i + 1).map(getSourceLink);
    }
  }
}
