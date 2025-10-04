'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Upload, FileText, DollarSign, Calendar, MapPin } from 'lucide-react'
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

export default function EmployeePage() {
  interface User { id: string; name: string; email?: string; role: string }
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ocrResult, setOcrResult] = useState<{ amount?: number; currency?: string } | null>(null)
  const [isProcessingOcr, setIsProcessingOcr] = useState(false)
  const router = useRouter()
  const { toasts, success, error, removeToast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    receipt: null as File | null
  })

  useEffect(() => {
    const storedUser = getStoredUser()
    if (!storedUser) {
      router.push('/login')
      return
    }
    setUser(storedUser)
    fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`/api/expenses?userId=${user?.id}&role=${user?.role}`)
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

  const handleFileUpload = async (file: File) => {
    setIsProcessingOcr(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setOcrResult(result)
        
        // Auto-fill form with OCR results
        setFormData(prev => ({
          ...prev,
          title: prev.title || 'Receipt from ' + new Date().toLocaleDateString(),
          amount: result.amount?.toString() || prev.amount,
          currency: result.currency || prev.currency
        }))
        
        success('OCR Processing Complete', 'Receipt details extracted successfully')
      } else {
        error('OCR Processing Failed', 'Could not extract text from image')
      }
    } catch (err) {
      console.error('OCR error:', err)
      error('OCR Processing Failed', 'An error occurred while processing the image')
    } finally {
      setIsProcessingOcr(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          receiptUrl: null, // In a real app, you'd upload to a file service
          userId: user?.id
        })
      })

      if (response.ok) {
        success('Expense Submitted', 'Your expense claim has been submitted for approval')
        setFormData({
          title: '',
          description: '',
          amount: '',
          currency: 'USD',
          receipt: null
        })
        setOcrResult(null)
        setShowForm(false)
        fetchExpenses()
      } else {
        const errorData = await response.json()
        error('Submission Failed', errorData.error || 'Could not submit expense')
      }
    } catch (err) {
      console.error('Submit error:', err)
      error('Submission Failed', 'An error occurred while submitting the expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTotalAmount = () => {
    return expenses.reduce((sum, expense) => {
      return sum + (expense.convertedAmount || expense.amount)
    }, 0)
  }

  const getStatusCounts = () => {
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 }
    expenses.forEach(expense => {
      counts[expense.status as keyof typeof counts]++
    })
    return counts
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const statusCounts = getStatusCounts()

  return (
    <Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Expense Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your expense claims and track approval status
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Expense
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(getTotalAmount(), 'USD')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statusCounts.PENDING}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statusCounts.APPROVED}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statusCounts.REJECTED}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Submit New Expense
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Receipt Upload (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({ ...prev, receipt: file }))
                          handleFileUpload(file)
                        }
                      }}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="cursor-pointer text-sm text-gray-600 dark:text-gray-400"
                    >
                      {isProcessingOcr ? 'Processing...' : 'Click to upload receipt'}
                    </label>
                  </div>
                  {ocrResult && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        OCR extracted: {ocrResult.amount && formatCurrency(ocrResult.amount, ocrResult.currency || 'USD')}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Expense'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Expenses
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No expenses submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
