#!/bin/bash

# Oddo Approver Setup Script
echo "🚀 Setting up Oddo Approver..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update .env with your database configuration"
fi

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker is available. You can run 'npm run docker:up' to start with Docker"
else
    echo "⚠️  Docker not found. You'll need to set up PostgreSQL manually"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database configuration"
echo "2. Run 'npm run db:push' to set up the database"
echo "3. Run 'npm run db:seed' to seed with demo data"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "Or use Docker:"
echo "1. Run 'npm run docker:up' to start everything with Docker"
