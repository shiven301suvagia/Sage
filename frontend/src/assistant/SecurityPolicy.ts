export type SecurityAction = 'read' | 'notify' | 'execute';

export interface SecurityDecision { readonly allowed: boolean; readonly reason: string; }

export class SecurityPolicy {
  constructor(private readonly allowRestricted = false) {}

  check(action: SecurityAction, requiresConfirmation = false, confirmed = false): SecurityDecision {
    if (action === 'read') return { allowed: true, reason: 'Read-only action allowed.' };
    if (action === 'notify') return requiresConfirmation && !confirmed
      ? { allowed: false, reason: 'User confirmation required.' }
      : { allowed: true, reason: 'Notification allowed.' };
    if (!this.allowRestricted) return { allowed: false, reason: 'Restricted execution is disabled.' };
    if (!confirmed) return { allowed: false, reason: 'Explicit user confirmation required.' };
    return { allowed: true, reason: 'Confirmed execution allowed.' };
  }
}
