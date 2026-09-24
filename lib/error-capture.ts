
let lastCapturedError: unknown;

export function captureError(error: unknown) {
  lastCapturedError = error;
}

export function consumeLastCapturedError(): Error | undefined {
  const error = lastCapturedError;
  lastCapturedError = undefined;

  if (error instanceof Error) return error;
  if (error == null) return undefined;

  return new Error(String(error));
}
