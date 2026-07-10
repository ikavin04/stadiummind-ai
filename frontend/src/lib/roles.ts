/**
 * Role utilities — centralises all role-driven logic so pages/components
 * stay clean. Import from here, never read user.role ad-hoc in components.
 */
import { useAppStore } from '../store/useAppStore';
import type { UserRole, Severity } from '../types';

// ─── Which nav routes each role can access ────────────────────────────────────
export const ROLE_NAV: Record<UserRole, string[]> = {
  fan:       ['/fan-hub', '/assistant'],
  volunteer: ['/dashboard', '/assistant'],
  security:  ['/dashboard', '/crowd', '/assistant'],
  medical:   ['/dashboard', '/crowd', '/assistant'],
  manager:   ['/dashboard', '/crowd', '/assistant'],
};

/** Returns true if the current role is allowed to visit this path. */
export function roleCanAccess(role: UserRole, path: string): boolean {
  return ROLE_NAV[role]?.includes(path) ?? false;
}

/** Roles that should have the Active Alerts panel expanded by default. */
export const ROLES_ALERTS_EXPANDED: UserRole[] = ['security'];

/** Roles that see plain-language status instead of raw occupancy %. */
export const ROLES_PLAIN_LANGUAGE: UserRole[] = ['volunteer'];

/** Roles that see the Medical Center Status card on the dashboard. */
export const ROLES_MEDICAL_CARD: UserRole[] = ['medical', 'manager'];

/** Roles that see zones sorted by occupancy descending (highest risk first). */
export const ROLES_SORT_BY_RISK: UserRole[] = ['security', 'medical'];

// ─── Volunteer plain-language occupancy labels ────────────────────────────────
const PLAIN_LANGUAGE: Record<Severity, string> = {
  normal: 'Normal — no action needed',
  watch:  'Watch — monitor closely',
  alert:  'Alert — action required',
};

export function occupancyLabel(severity: Severity): string {
  return PLAIN_LANGUAGE[severity];
}

// ─── Convenience hook ─────────────────────────────────────────────────────────
export function useRole(): UserRole {
  const user = useAppStore((s) => s.user);
  return user?.role ?? 'fan';
}
