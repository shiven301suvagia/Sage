export interface SystemSnapshot {
  readonly platform: string;
  readonly online: boolean;
  readonly capturedAtMs: number;
}

export interface SystemContextProvider {
  snapshot(nowMs?: number): SystemSnapshot;
}

export class RuntimeSystemContext implements SystemContextProvider {
  snapshot(nowMs = Date.now()): SystemSnapshot {
    return { platform: typeof process !== 'undefined' ? process.platform : 'unknown', online: true, capturedAtMs: nowMs };
  }
}
