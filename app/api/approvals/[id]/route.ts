import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { Role } from '@prisma/client'

export async function PATCH(request: NextRequest) {
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const id = segments[segments.length - 1]
  try {
    const body = await request.json()
    const { status, comment, approverId } = body

    if (!status || !approverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get the approval
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        expense: true,
        approver: true,
      },
    })

    if (!approval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      )
    }

    // Check if user can approve this level
    const canApprove = 
      approval.approver.role === Role.ADMIN ||
      (approval.level === 1 && approval.approver.role === Role.MANAGER) ||
      (approval.level === 2 && approval.approver.role === Role.CFO)

    if (!canApprove) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update approval
    await prisma.approval.update({
      where: { id },
      data: {
        status,
        comment,
      },
    })

    // If approved and this is the final level, update expense status
    if (status === 'APPROVED') {
      const allApprovals = await prisma.approval.findMany({
        where: { expenseId: approval.expenseId },
        orderBy: { level: 'asc' },
      })

      const maxLevel = Math.max(...allApprovals.map(a => a.level))
      const isFinalApproval = approval.level === maxLevel

      if (isFinalApproval) {
        await prisma.expense.update({
          where: { id: approval.expenseId },
          data: { status: 'APPROVED' },
        })
      } else {
        // Create next level approval
        const nextLevel = approval.level + 1
        let nextApprover

        if (nextLevel === 2) {
          // CFO approval
          nextApprover = await prisma.user.findFirst({
            where: { role: Role.CFO },
          })
        }

        if (nextApprover) {
          await prisma.approval.create({
            data: {
              expenseId: approval.expenseId,
              approverId: nextApprover.id,
              level: nextLevel,
              status: 'PENDING',
            },
          })
        }
      }
    } else if (status === 'REJECTED') {
      // If rejected, update expense status
      await prisma.expense.update({
        where: { id: approval.expenseId },
        data: { status: 'REJECTED' },
      })
    }

    // Return updated approval with relations
      const result = await prisma.approval.findUnique({
      where: { id },
      include: {
        expense: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            approvals: {
              include: {
                approver: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                  },
                },
              },
              orderBy: {
                level: 'asc',
              },
            },
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating approval:', error)
    return NextResponse.json(
      { error: 'Failed to update approval' },
      { status: 500 }
    )
  }
}
