'use client'

import Link from 'next/link'
import { ArrowRight, DollarSign, Users, CheckCircle, Zap, Shield, BarChart3 } from 'lucide-react'


export default function HomePage() {
  // placeholder user state removed (not used on public home)



  const features = [
    {
      icon: <DollarSign className="h-8 w-8 text-blue-500" />,
      title: 'Smart OCR Processing',
      description: 'Upload receipts and automatically extract expense details using advanced OCR technology.'
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: 'Multi-Level Approval',
      description: 'Streamlined approval workflow with Manager and CFO approval levels for proper oversight.'
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
      title: 'Real-time Tracking',
      description: 'Track expense status in real-time with detailed approval history and comments.'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: 'Auto Currency Conversion',
      description: 'Automatic currency conversion to company base currency for global expense management.'
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: 'Role-Based Access',
      description: 'Secure access control with different permission levels for employees, managers, and admins.'
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-indigo-500" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting for better expense management insights.'
    }
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Oddo Approver
              </h1>
            </div>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Smart Expense
            <span className="text-blue-600 dark:text-blue-400"> Management</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Streamline your expense approval process with AI-powered OCR, multi-level approvals, 
            and real-time tracking. Built for modern teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              Start Managing Expenses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for expense management
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powerful features designed to make expense management simple and efficient
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to streamline your expenses?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join teams already using Oddo Approver to manage their expenses efficiently
            </p>
            <Link
              href="/login"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © 2024 Oddo Approver. Built for hackathon excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
