import type { Scheduler, TimerHandle } from './types.js';

export class SystemScheduler implements Scheduler {
  delay(milliseconds: number, callback: () => void): TimerHandle {
    const handle = globalThis.setTimeout(callback, milliseconds);
    return {
      cancel: () => {
        globalThis.clearTimeout(handle);
      },
    };
  }
}
