export type Role = 'admin' | 'membre_bureau' | 'membre_actif'

export const ROLES = {
  ADMIN: 'admin',
  MEMBRE_BUREAU: 'membre_bureau',
  MEMBRE_ACTIF: 'membre_actif',
} as const

/**
 * Returns true if the user role has Bureau or Admin privileges.
 * Accepts legacy role aliases ('bureau', 'pole_lead') for smooth backwards compatibility.
 */
export function isBureauOrAdmin(role?: string | null): boolean {
  if (!role) return false
  return role === 'admin' || role === 'membre_bureau' || role === 'bureau' || role === 'pole_lead'
}

/**
 * Returns true if the user role is an Admin.
 */
export function isAdmin(role?: string | null): boolean {
  return role === 'admin'
}

/**
 * Returns a user-friendly label for any role.
 */
export function getRoleLabel(role?: string | null): string {
  switch (role) {
    case 'admin':
      return 'Administrateur'
    case 'membre_bureau':
    case 'bureau':
    case 'pole_lead':
      return 'Membre du Bureau'
    case 'membre_actif':
    case 'member':
    case 'membre':
    default:
      return 'Membre Actif'
  }
}
