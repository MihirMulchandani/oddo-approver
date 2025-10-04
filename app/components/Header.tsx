'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { getStoredUser, clearUser, User as UserType } from '../../lib/auth'


export function Header() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
  }, [])

  const handleLogout = () => {
    clearUser()
    setUser(null)
    router.push('/login')
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator'
      case 'MANAGER': return 'Manager'
      case 'CFO': return 'CFO'
      case 'EMPLOYEE': return 'Employee'
      default: return role
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Oddo Approver
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Oddo Approver
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <nav className="flex space-x-4">
              <a
                href="/employee"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
              {user.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </a>
              )}
              {user.role === 'MANAGER' && (
                <a
                  href="/manager"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Manager
                </a>
              )}
              {user.role === 'CFO' && (
                <a
                  href="/cfo"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  CFO
                </a>
              )}
            </nav>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getRoleDisplayName(user.role)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="/employee"
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </a>
              {user.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </a>
              )}
              {user.role === 'MANAGER' && (
                <a
                  href="/manager"
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manager
                </a>
              )}
              {user.role === 'CFO' && (
                <a
                  href="/cfo"
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  CFO
                </a>
              )}
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRoleDisplayName(user.role)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
