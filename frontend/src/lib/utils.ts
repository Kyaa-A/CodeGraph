import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Race a promise against a timeout. Cleans up the timer when the promise
 * settles first so we don't leak handles on the server.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Request timed out. Please try again.")),
        ms,
      );
    }),
  ]).finally(() => clearTimeout(timer));
}
