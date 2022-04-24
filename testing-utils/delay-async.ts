export function delayAsync(ms: number, signal?: AbortSignal) {
  let timeoutId: number;

  return new Promise<void>((resolve) => {
    const resolveDelay = () => {
      signal?.removeEventListener("abort", resolveDelay);
      clearTimeout(timeoutId);

      resolve();
    };

    if (signal?.aborted) {
      resolve();
      return;
    }

    signal?.addEventListener("abort", resolveDelay);

    timeoutId = setTimeout(resolveDelay, ms);
  });
}
