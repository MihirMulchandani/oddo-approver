'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, DollarSign, FileText } from 'lucide-react'
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

export default function ManagerPage() {
  interface User { id: string; name: string; email?: string; role: string }
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const router = useRouter()
  const { toasts, success, error, removeToast } = useToast()

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser || (storedUser.role !== 'MANAGER' && storedUser.role !== 'ADMIN')) {
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

    return { pending, approved, rejected, totalAmount }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const stats = getStats()

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manager Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Review and approve expense claims from your team
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pending}
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
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalAmount, 'USD')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {([
              { key: 'pending', label: 'Pending Review', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'rejected', label: 'Rejected', count: stats.rejected },
              { key: 'all', label: 'All Expenses', count: expenses.length }
            ] as { key: 'all' | 'pending' | 'approved' | 'rejected'; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
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
               filter === 'pending' ? 'Pending Review' :
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
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'pending' ? 'No expenses pending review' : 
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

        {/* Quick Actions */}
        {filter === 'pending' && stats.pending > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Quick Actions
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm mb-4">
              You have {stats.pending} expense{stats.pending !== 1 ? 's' : ''} pending your review. 
              Click on any expense card above to view details and take action.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  // Auto-approve all pending expenses (for demo purposes)
                  const pendingExpenses = expenses.filter(e => e.status === 'PENDING')
                  pendingExpenses.forEach(expense => {
                    const pendingApproval = expense.approvals.find(a => a.status === 'PENDING')
                    if (pendingApproval) {
                      handleApproval(pendingApproval.id, 'APPROVED', 'Bulk approved by manager')
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
