import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}


export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20'
    case 'rejected':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
    case 'cancelled':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
  }
}

export function getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20'
    case 'manager':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
    case 'cfo':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20'
    case 'employee':
      return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20'
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20'
  }
}
