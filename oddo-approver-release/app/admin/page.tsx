'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, DollarSign, FileText, Users, TrendingUp, BarChart3, Settings } from 'lucide-react'
import { Layout } from '../components/Layout'
import { ExpenseCard } from '../components/ExpenseCard'
import { ToastContainer, useToast } from '../components/Toast'
import { getStoredUser } from '../../lib/auth'
import { formatCurrency, formatDate } from '../../lib/utils'

interface Expense {
  id: string
  title: string
  description: string | null
  amount: number
  currency: string
  convertedAmount: number | null
  convertedTo: string | null
  status: string
  receiptUrl: string | null
  submittedAt: string
  createdAt?: string
  updatedAt?: string
  userId?: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  approvals: Array<{
    id: string
    level: number
    status: string
    comment: string | null
    approver: {
      id: string
      name: string
      role: string
    }
  }>
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [view, setView] = useState<'expenses' | 'users' | 'analytics'>('expenses')
  const router = useRouter()
  const { toasts, success, error, removeToast } = useToast()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || storedUser.role !== 'ADMIN') {
      router.push('/login')
      return
    }
    setUser(storedUser)
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [expensesResponse, usersResponse] = await Promise.all([
        fetch('/api/expenses?role=ADMIN'),
        fetch('/api/users')
      ])

      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json()
        setExpenses(expensesData)
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (approvalId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    if (!user) {
      error('Not authorized', 'You must be logged in to perform this action')
      return
    }
    try {
      const response = await fetch(`/api/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          comment,
          approverId: user.id
        })
      })

      if (response.ok) {
        success(
          status === 'APPROVED' ? 'Expense Approved' : 'Expense Rejected',
          `The expense has been ${status.toLowerCase()} successfully`
        )
        fetchData()
      } else {
        const errorData = await response.json()
        error('Action Failed', errorData.error || `Could not ${status.toLowerCase()} expense`)
      }
    } catch (err) {
      console.error('Approval error:', err)
      error('Action Failed', 'An error occurred while processing the approval')
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true
    return expense.status.toLowerCase() === filter
  })

  const getStats = () => {
    const pending = expenses.filter(e => e.status === 'PENDING').length
    const approved = expenses.filter(e => e.status === 'APPROVED').length
    const rejected = expenses.filter(e => e.status === 'REJECTED').length
    const totalAmount = expenses
      .filter(e => e.status === 'APPROVED')
      .reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0)
    
    const pendingAmount = expenses
      .filter(e => e.status === 'PENDING')
      .reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0)

    const totalUsers = users.length
    const activeUsers = users.filter(u => u.role !== 'ADMIN').length

    return { pending, approved, rejected, totalAmount, pendingAmount, totalUsers, activeUsers }
  }

  const getAnalytics = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Monthly trends
    const thisMonth = expenses.filter(e => {
      const expenseDate = new Date(e.submittedAt)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    
    const lastMonth = expenses.filter(e => {
      const expenseDate = new Date(e.submittedAt)
      const lastMonthDate = new Date(currentYear, currentMonth - 1)
      return expenseDate.getMonth() === lastMonthDate.getMonth() && expenseDate.getFullYear() === lastMonthDate.getFullYear()
    })

    // User activity
    const userActivity = users.map(u => {
      const userExpenses = expenses.filter(e => e.user.id === u.id)
      return {
        user: u,
        expenseCount: userExpenses.length,
        totalAmount: userExpenses.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0)
      }
    }).sort((a, b) => b.expenseCount - a.expenseCount)

    // Status distribution
    const statusDistribution = {
      PENDING: expenses.filter(e => e.status === 'PENDING').length,
      APPROVED: expenses.filter(e => e.status === 'APPROVED').length,
      REJECTED: expenses.filter(e => e.status === 'REJECTED').length,
      CANCELLED: expenses.filter(e => e.status === 'CANCELLED').length
    }

    return {
      thisMonth: thisMonth.length,
      lastMonth: lastMonth.length,
      thisMonthAmount: thisMonth.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0),
      lastMonthAmount: lastMonth.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0),
      userActivity,
      statusDistribution
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const stats = getStats()
  const analytics = getAnalytics()

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete system oversight and management
          </p>
        </div>

        {/* View Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {[
              { key: 'expenses', label: 'Expenses', icon: <FileText className="h-4 w-4" /> },
              { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
              { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key as any)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center space-x-2 ${
                  view === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pending}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(stats.pendingAmount, 'USD')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.approved}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(stats.totalAmount, 'USD')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  of {stats.totalUsers} total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content based on view */}
        {view === 'expenses' && (
          <>
            {/* Filter Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1">
                {[
                  { key: 'all', label: 'All Expenses', count: expenses.length },
                  { key: 'pending', label: 'Pending', count: stats.pending },
                  { key: 'approved', label: 'Approved', count: stats.approved },
                  { key: 'rejected', label: 'Rejected', count: stats.rejected }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Expenses List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {filter === 'all' ? 'All Expenses' : 
                   filter === 'pending' ? 'Pending Expenses' :
                   filter === 'approved' ? 'Approved Expenses' : 'Rejected Expenses'}
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading expenses...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No expenses found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onApprove={handleApproval}
                      currentUserId={user.id}
                      userRole={user.role}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'users' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              System Users
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        user.role === 'CFO' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              System Analytics
            </h2>
            
            {/* Monthly Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Monthly Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {analytics.thisMonth} expenses
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(analytics.thisMonthAmount, 'USD')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Month</span>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {analytics.lastMonth} expenses
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(analytics.lastMonthAmount, 'USD')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Status Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Activity
              </h3>
              <div className="space-y-3">
                {analytics.userActivity.map((activity, index) => (
                  <div key={activity.user.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{activity.user.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        activity.user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        activity.user.role === 'CFO' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                      }`}>
                        {activity.user.role}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {activity.expenseCount} expenses
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(activity.totalAmount, 'USD')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
