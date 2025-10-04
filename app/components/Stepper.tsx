'use client'

import { CheckCircle, Circle, XCircle } from 'lucide-react'
import { Approval, User as UserType } from '@prisma/client'

interface StepperProps {
  approvals: (Approval & { approver: UserType })[]
}

export function Stepper({ approvals }: StepperProps) {
  const maxLevel = Math.max(...approvals.map(a => a.level))
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1)

  const getLevelStatus = (level: number) => {
    const approval = approvals.find(a => a.level === level)
    if (!approval) return 'pending'
    return approval.status.toLowerCase()
  }

  const getLevelApprover = (level: number) => {
    const approval = approvals.find(a => a.level === level)
    return approval?.approver
  }

  return (
    <div className="flex items-center space-x-4">
      {levels.map((level, index) => {
        const status = getLevelStatus(level)
        const approver = getLevelApprover(level)
        const isLast = index === levels.length - 1

        return (
          <div key={level} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'approved' 
                  ? 'bg-green-500 text-white' 
                  : status === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {status === 'approved' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : status === 'rejected' ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  Level {level}
                </p>
                {approver && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {approver.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {status}
                </p>
              </div>
            </div>
            
            {!isLast && (
              <div className={`w-12 h-0.5 mx-2 ${
                status === 'approved' 
                  ? 'bg-green-500' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
