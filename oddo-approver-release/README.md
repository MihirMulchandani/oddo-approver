# Oddo Approver - Smart Expense Management System

A modern, full-stack expense management web application built for hackathon excellence. Features AI-powered OCR, multi-level approval workflows, real-time currency conversion, and role-based access control.

## 🚀 Features

- **Smart OCR Processing**: Upload receipts and automatically extract expense details using Tesseract.js
- **Multi-Level Approval**: Streamlined workflow with Manager and CFO approval levels
- **Real-time Currency Conversion**: Automatic conversion to company base currency using live exchange rates
- **Role-Based Access Control**: Secure access for Employees, Managers, CFOs, and Admins
- **Modern UI**: Clean, responsive design with dark/light mode toggle
- **Real-time Tracking**: Track expense status with detailed approval history
- **Analytics Dashboard**: Comprehensive reporting and insights for administrators

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **OCR**: Tesseract.js
- **UI Components**: Radix UI, Lucide React Icons
- **Animations**: Framer Motion
- **Deployment**: Docker, Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (or Docker for containerized setup)

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and navigate to the project
git clone <repository-url>
cd oddo-approver

# Start with Docker
npm run docker:up
```

The application will be available at `http://localhost:3000`

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your database configuration

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## 👥 Demo Users

The system comes pre-seeded with demo users:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@oddo.com | - | Full system access |
| Manager | manager@oddo.com | - | First-level approvals |
| CFO | cfo@oddo.com | - | Final approvals |
| Employee | employee1@oddo.com | - | Submit expenses |
| Employee | employee2@oddo.com | - | Submit expenses |

## 🎯 User Roles & Permissions

### Employee
- Submit expense claims
- Upload receipts for OCR processing
- View personal expense history
- Track approval status

### Manager
- Review and approve/reject first-level expenses
- View team expense reports
- Access manager dashboard

### CFO
- Final approval authority for high-value expenses
- Financial oversight and analytics
- Access to comprehensive reporting

### Admin
- Full system access
- User management
- Override any approval
- System analytics and insights

## 🔧 API Endpoints

### Expenses
- `GET /api/expenses` - List expenses (filtered by role)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/[id]` - Get expense details

### Approvals
- `PATCH /api/approvals/[id]` - Approve/reject expense

### OCR
- `POST /api/ocr` - Process receipt image

### Users
- `GET /api/users` - List all users (admin only)

## 🐳 Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# Rebuild containers
npm run docker:build

# View logs
docker-compose logs -f
```

## 📊 Database Schema

### Users
- id, name, email, role, createdAt, updatedAt

### Expenses
- id, title, description, amount, currency, convertedAmount, convertedTo, status, receiptUrl, userId, submittedAt

### Approvals
- id, expenseId, approverId, level, status, comment, createdAt, updatedAt

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Docker

1. Build Docker image
2. Deploy to your preferred container platform
3. Set up PostgreSQL database
4. Configure environment variables

## 🔧 Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/oddo_approver"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
EXCHANGE_RATE_API_URL="https://api.exchangerate.host/convert"
NEXT_PUBLIC_APP_NAME="Oddo Approver"
NEXT_PUBLIC_COMPANY_NAME="OddoCorp"
NEXT_PUBLIC_DEFAULT_CURRENCY="USD"
```

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 UI/UX Features

- **Dark/Light Mode**: Toggle between themes
- **Smooth Animations**: Framer Motion powered transitions
- **Toast Notifications**: Real-time feedback
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: Graceful error states

## 🔒 Security Features

- Role-based access control
- Input validation and sanitization
- Secure file upload handling
- Environment variable protection

## 📈 Performance

- Server-side rendering with Next.js
- Optimized images and assets
- Efficient database queries with Prisma
- Client-side caching

## 🧪 Testing

The application includes:
- Type safety with TypeScript
- ESLint for code quality
- Responsive design testing
- Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is built for hackathon purposes. Feel free to use and modify as needed.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review the demo instructions
3. Check the GitHub issues
4. Contact the development team

## 🎉 Demo Instructions

1. Start the application
2. Login with any demo user
3. Try submitting an expense with OCR
4. Switch between different user roles
5. Test the approval workflow
6. Explore the analytics dashboard

---

**Built with ❤️ for hackathon excellence**