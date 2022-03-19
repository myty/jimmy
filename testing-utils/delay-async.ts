export function delayAsync(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve) => {
    let timeoutId: number;

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
