import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../lib/prisma'
import { convertCurrency } from '../../lib/currency'
import { Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') as Role

    let whereClause = {}

    // If not admin/manager/cfo, only show user's own expenses
    if (role !== Role.ADMIN && role !== Role.MANAGER && role !== Role.CFO) {
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 })
      }
      whereClause = { userId }
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      amount,
      currency,
      receiptUrl,
      userId,
    } = body

    if (!title || !amount || !currency || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert currency to USD
    const conversion = await convertCurrency(amount, currency, 'USD')

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        amount,
        currency,
        convertedAmount: conversion.convertedAmount,
        convertedTo: 'USD',
        receiptUrl,
        userId,
      },
    })

    // Create initial approval for manager
    const manager = await prisma.user.findFirst({
      where: { role: Role.MANAGER },
    })

    if (manager) {
      await prisma.approval.create({
        data: {
          expenseId: expense.id,
          approverId: manager.id,
          level: 1,
          status: 'PENDING',
        },
      })
    }

    // Fetch the created expense with relations
    const createdExpense = await prisma.expense.findUnique({
      where: { id: expense.id },
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
    })

    return NextResponse.json(createdExpense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
