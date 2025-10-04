import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oddo.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@oddo.com',
      role: Role.ADMIN,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@oddo.com' },
    update: {},
    create: {
      name: 'John Manager',
      email: 'manager@oddo.com',
      role: Role.MANAGER,
    },
  })

  const cfo = await prisma.user.upsert({
    where: { email: 'cfo@oddo.com' },
    update: {},
    create: {
      name: 'Sarah CFO',
      email: 'cfo@oddo.com',
      role: Role.CFO,
    },
  })

  const employee1 = await prisma.user.upsert({
    where: { email: 'employee1@oddo.com' },
    update: {},
    create: {
      name: 'Alice Employee',
      email: 'employee1@oddo.com',
      role: Role.EMPLOYEE,
    },
  })

  const employee2 = await prisma.user.upsert({
    where: { email: 'employee2@oddo.com' },
    update: {},
    create: {
      name: 'Bob Employee',
      email: 'employee2@oddo.com',
      role: Role.EMPLOYEE,
    },
  })

  // Create sample expenses
  const expense1 = await prisma.expense.create({
    data: {
      title: 'Client Dinner',
      description: 'Business dinner with potential client',
      amount: 150.00,
      currency: 'USD',
      convertedAmount: 150.00,
      convertedTo: 'USD',
      status: 'PENDING',
      userId: employee1.id,
    },
  })

  const expense2 = await prisma.expense.create({
    data: {
      title: 'Office Supplies',
      description: 'Stationery and office materials',
      amount: 75.50,
      currency: 'USD',
      convertedAmount: 75.50,
      convertedTo: 'USD',
      status: 'PENDING',
      userId: employee2.id,
    },
  })

  const expense3 = await prisma.expense.create({
    data: {
      title: 'Conference Travel',
      description: 'Flight and hotel for tech conference',
      amount: 1200.00,
      currency: 'USD',
      convertedAmount: 1200.00,
      convertedTo: 'USD',
      status: 'APPROVED',
      userId: employee1.id,
    },
  })

  // Create approval records
  await prisma.approval.create({
    data: {
      expenseId: expense1.id,
      approverId: manager.id,
      level: 1,
      status: 'PENDING',
    },
  })

  await prisma.approval.create({
    data: {
      expenseId: expense2.id,
      approverId: manager.id,
      level: 1,
      status: 'PENDING',
    },
  })

  await prisma.approval.create({
    data: {
      expenseId: expense3.id,
      approverId: manager.id,
      level: 1,
      status: 'APPROVED',
      comment: 'Approved for conference attendance',
    },
  })

  await prisma.approval.create({
    data: {
      expenseId: expense3.id,
      approverId: cfo.id,
      level: 2,
      status: 'APPROVED',
      comment: 'Final approval for conference travel',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👥 Created users:', { admin, manager, cfo, employee1, employee2 })
  console.log('💰 Created expenses:', { expense1, expense2, expense3 })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
