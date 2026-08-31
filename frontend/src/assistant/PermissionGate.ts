export type Capability = 'read_context' | 'notify_user' | 'execute_action';

export type PermissionDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string };

export class PermissionGate {
  constructor(private readonly granted: ReadonlySet<Capability> = new Set()) {}

  check(capability: Capability): PermissionDecision {
    if (this.granted.has(capability)) return { allowed: true };
    return {
      allowed: false,
      reason: `Capability "${capability}" has not been granted.`,
    };
  }
}
