'use client'

import { useState } from 'react'
import { Calendar, DollarSign, User, FileText, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getRoleColor } from '@/lib/utils'
import { Expense, Approval, User as UserType } from '@prisma/client'

interface ExpenseWithRelations extends Expense {
  user: UserType
  approvals: (Approval & { approver: UserType })[]
}

interface ExpenseCardProps {
  expense: ExpenseWithRelations
  onView?: (expense: ExpenseWithRelations) => void
  onApprove?: (approvalId: string, status: 'APPROVED' | 'REJECTED', comment?: string) => void
  currentUserId?: string
  userRole?: string
}

export function ExpenseCard({ 
  expense, 
  onView, 
  onApprove, 
  currentUserId, 
  userRole 
}: ExpenseCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [approvalComment, setApprovalComment] = useState('')
  const [isApproving, setIsApproving] = useState(false)

  const canApprove = (approval: Approval & { approver: UserType }) => {
    if (!currentUserId || !userRole) return false
    if (approval.status !== 'PENDING') return false
    if (approval.approverId === currentUserId) return true
    if (userRole === 'ADMIN') return true
    return false
  }

  const handleApprove = async (approvalId: string, status: 'APPROVED' | 'REJECTED') => {
    if (!onApprove) return
    
    setIsApproving(true)
    try {
      await onApprove(approvalId, status, approvalComment || undefined)
      setApprovalComment('')
    } finally {
      setIsApproving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {expense.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
              {expense.status}
            </span>
          </div>
          
          {expense.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
              {expense.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>
                {formatCurrency(expense.amount, expense.currency)}
                {expense.convertedAmount && expense.convertedAmount !== expense.amount && (
                  <span className="ml-1">
                    ({formatCurrency(expense.convertedAmount, expense.convertedTo || 'USD')})
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(expense.submittedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{expense.user.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={() => onView(expense)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="View details"
            >
              <Eye className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Toggle details"
          >
            <FileText className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Approval Progress
          </h4>
          
          <div className="space-y-3">
            {expense.approvals.map((approval, index) => (
              <div key={approval.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(approval.status)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Level {approval.level}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(approval.approver.role)}`}>
                      {approval.approver.role}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {approval.approver.name}
                    </span>
                  </div>
                </div>
                
                {approval.comment && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                    "{approval.comment}"
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Approval actions for pending approvals */}
          {expense.approvals.some(a => a.status === 'PENDING' && canApprove(a)) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Add a comment (optional)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex space-x-2">
                  {expense.approvals
                    .filter(a => a.status === 'PENDING' && canApprove(a))
                    .map(approval => (
                      <div key={approval.id} className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(approval.id, 'APPROVED')}
                          disabled={isApproving}
                          className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprove(approval.id, 'REJECTED')}
                          disabled={isApproving}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
