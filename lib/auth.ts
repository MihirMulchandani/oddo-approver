import { Role } from '@prisma/client'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('oddo-user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function storeUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('oddo-user', JSON.stringify(user))
}

export function clearUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('oddo-user')
}

export function hasPermission(user: User | null, requiredRole: Role): boolean {
  if (!user) return false

  const roleHierarchy = {
    [Role.EMPLOYEE]: 1,
    [Role.MANAGER]: 2,
    [Role.CFO]: 3,
    [Role.ADMIN]: 4,
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function canApprove(user: User | null, level: number): boolean {
  if (!user) return false

  switch (level) {
    case 1: // Manager level
      return user.role === Role.MANAGER || user.role === Role.ADMIN
    case 2: // CFO level
      return user.role === Role.CFO || user.role === Role.ADMIN
    default:
      return false
  }
}

export function canViewAllExpenses(user: User | null): boolean {
  return user?.role === Role.ADMIN || user?.role === Role.MANAGER || user?.role === Role.CFO
}
