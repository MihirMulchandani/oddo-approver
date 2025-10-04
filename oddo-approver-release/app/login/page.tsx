'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Shield, DollarSign, Users } from 'lucide-react'
import { storeUser, getStoredUser } from '../../lib/auth'

const DEMO_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@oddo.com',
    role: 'ADMIN',
    description: 'Full system access and management capabilities',
    icon: <Shield className="h-6 w-6" />,
    color: 'bg-purple-500'
  },
  {
    id: '2',
    name: 'John Manager',
    email: 'manager@oddo.com',
    role: 'MANAGER',
    description: 'First-level approval authority for team expenses',
    icon: <Users className="h-6 w-6" />,
    color: 'bg-blue-500'
  },
  {
    id: '3',
    name: 'Sarah CFO',
    email: 'cfo@oddo.com',
    role: 'CFO',
    description: 'Final approval authority for high-value expenses',
    icon: <DollarSign className="h-6 w-6" />,
    color: 'bg-green-500'
  },
  {
    id: '4',
    name: 'Alice Employee',
    email: 'employee1@oddo.com',
    role: 'EMPLOYEE',
    description: 'Submit and track personal expense claims',
    icon: <User className="h-6 w-6" />,
    color: 'bg-orange-500'
  },
  {
    id: '5',
    name: 'Bob Employee',
    email: 'employee2@oddo.com',
    role: 'EMPLOYEE',
    description: 'Submit and track personal expense claims',
    icon: <User className="h-6 w-6" />,
    color: 'bg-orange-500'
  }
]

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getStoredUser()
    if (storedUser) {
      const dashboardPath = storedUser.role === 'ADMIN' ? '/admin' : 
                           storedUser.role === 'MANAGER' ? '/manager' :
                           storedUser.role === 'CFO' ? '/cfo' : '/employee'
      router.push(dashboardPath)
    }
  }, [router])

  const handleLogin = () => {
    if (!selectedUser) return

    const user = DEMO_USERS.find(u => u.id === selectedUser)
    if (!user) return

    storeUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any
    })

    const dashboardPath = user.role === 'ADMIN' ? '/admin' : 
                         user.role === 'MANAGER' ? '/manager' :
                         user.role === 'CFO' ? '/cfo' : '/employee'
    
    router.push(dashboardPath)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20'
      case 'MANAGER': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
      case 'CFO': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
      case 'EMPLOYEE': return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20'
      default: return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getRoleTextColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-purple-600 dark:text-purple-400'
      case 'MANAGER': return 'text-blue-600 dark:text-blue-400'
      case 'CFO': return 'text-green-600 dark:text-green-400'
      case 'EMPLOYEE': return 'text-orange-600 dark:text-orange-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </a>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Oddo Approver
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Choose a demo user to explore the system
          </p>
        </div>

        {/* Demo Users */}
        <div className="space-y-4">
          {DEMO_USERS.map((user) => (
            <div
              key={user.id}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selectedUser === user.id
                  ? `${getRoleColor(user.role)} ring-2 ring-offset-2 ring-blue-500`
                  : `${getRoleColor(user.role)} hover:shadow-md`
              }`}
              onClick={() => setSelectedUser(user.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`${user.color} rounded-full p-2 text-white`}>
                  {user.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleTextColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {user.description}
                  </p>
                </div>
                {selectedUser === user.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!selectedUser}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Login as Selected User
        </button>

        {/* Demo Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Demo Information
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• All users have pre-seeded expense data</li>
            <li>• OCR processing works with sample receipts</li>
            <li>• Currency conversion uses live exchange rates</li>
            <li>• Approval workflows are fully functional</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
