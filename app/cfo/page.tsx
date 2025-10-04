'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, DollarSign, FileText, TrendingUp } from 'lucide-react'
import { Layout } from '../components/Layout'
import { ExpenseCard } from '../components/ExpenseCard'
import { ToastContainer, useToast } from '../components/Toast'
import { getStoredUser } from '../../lib/auth'
import { formatCurrency } from '../../lib/utils'


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

export default function CFOPage() {
  interface User { id: string; name: string; email?: string; role: string }
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const router = useRouter()
  const { toasts, success, error, removeToast } = useToast()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || (storedUser.role !== 'CFO' && storedUser.role !== 'ADMIN')) {
      router.push('/login')
      return
    }
    setUser(storedUser)
    fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?role=${user?.role}`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproval = async (approvalId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => {
    try {
      const response = await fetch(`/api/approvals/${approvalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status,
            comment,
            approverId: user?.id
          })
      })

      if (response.ok) {
        success(
          status === 'APPROVED' ? 'Expense Approved' : 'Expense Rejected',
          `The expense has been ${status.toLowerCase()} successfully`
        )
        fetchExpenses()
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

    return { pending, approved, rejected, totalAmount, pendingAmount }
  }

  const getMonthlyTrends = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const thisMonth = expenses.filter(e => {
      const expenseDate = new Date(e.submittedAt)
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    })
    
    const lastMonth = expenses.filter(e => {
      const expenseDate = new Date(e.submittedAt)
      const lastMonthDate = new Date(currentYear, currentMonth - 1)
      return expenseDate.getMonth() === lastMonthDate.getMonth() && expenseDate.getFullYear() === lastMonthDate.getFullYear()
    })

    const thisMonthAmount = thisMonth.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0)
    const lastMonthAmount = lastMonth.reduce((sum, e) => sum + (e.convertedAmount || e.amount), 0)
    
    const growth = lastMonthAmount > 0 ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0

    return {
      thisMonth: thisMonth.length,
      lastMonth: lastMonth.length,
      thisMonthAmount,
      lastMonthAmount,
      growth
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const stats = getStats()
  const trends = getMonthlyTrends()

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            CFO Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Final approval authority and financial oversight
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Final Approval</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {trends.thisMonth}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(trends.thisMonthAmount, 'USD')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth Rate</p>
                <p className={`text-2xl font-bold ${trends.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.growth >= 0 ? '+' : ''}{trends.growth.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  vs last month
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalAmount, 'USD')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  All time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
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
                    {trends.thisMonth} expenses
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(trends.thisMonthAmount, 'USD')}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Month</span>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {trends.lastMonth} expenses
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(trends.lastMonthAmount, 'USD')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Approval Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {stats.approved}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {([
              { key: 'pending', label: 'Pending Final Approval', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'rejected', label: 'Rejected', count: stats.rejected },
              { key: 'all', label: 'All Expenses', count: expenses.length }
            ] as { key: 'all' | 'pending' | 'approved' | 'rejected'; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-purple-600 text-white'
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
               filter === 'pending' ? 'Pending Final Approval' :
               filter === 'approved' ? 'Approved Expenses' : 'Rejected Expenses'}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'pending' ? 'No expenses pending final approval' : 
                 filter === 'approved' ? 'No approved expenses' :
                 filter === 'rejected' ? 'No rejected expenses' : 'No expenses found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onApprove={handleApproval}
                  currentUserId={user!.id}
                  userRole={user!.role}
                />
              ))}
            </div>
          )}
        </div>

        {/* CFO Insights */}
        {filter === 'pending' && stats.pending > 0 && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
              CFO Insights
            </h3>
            <p className="text-purple-800 dark:text-purple-200 text-sm mb-4">
              You have {stats.pending} expense{stats.pending !== 1 ? 's' : ''} pending final approval 
              worth {formatCurrency(stats.pendingAmount, 'USD')}. Review each expense carefully 
              before making your final decision.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Auto-approve all pending expenses (for demo purposes)
                  const pendingExpenses = expenses.filter(e => e.status === 'PENDING')
                  pendingExpenses.forEach(expense => {
                    const pendingApproval = expense.approvals.find(a => a.status === 'PENDING')
                    if (pendingApproval) {
                      handleApproval(pendingApproval.id, 'APPROVED', 'Final approval by CFO')
                    }
                  })
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Approve All Pending
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
