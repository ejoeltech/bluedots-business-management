'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Calendar,
  ChevronRight,
  Activity
} from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  pendingQuotes: number
  unpaidInvoices: number
  overdueReminders: number
}

export default function MobileDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingQuotes: 0,
    unpaidInvoices: 0,
    overdueReminders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [customersRes, invoicesRes, receiptsRes, productsRes, remindersRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/invoices'),
        fetch('/api/receipts'),
        fetch('/api/products'),
        fetch('/api/reminders')
      ])

      const [customers, invoices, receipts, products, reminders] = await Promise.all([
        customersRes.ok ? customersRes.json() : [],
        invoicesRes.ok ? invoicesRes.json() : [],
        receiptsRes.ok ? receiptsRes.json() : [],
        productsRes.ok ? productsRes.json() : [],
        remindersRes.ok ? remindersRes.json() : []
      ])

      const totalRevenue = Array.isArray(receipts) ? receipts.reduce((sum: number, receipt: any) => sum + (receipt.amount || 0), 0) : 0
      const pendingInvoices = Array.isArray(invoices) ? invoices.filter((invoice: any) => invoice.status === 'unpaid' || invoice.status === 'pending').length : 0
      
      const today = new Date()
      const overdueReminders = Array.isArray(reminders) ? reminders.filter((reminder: any) => 
        new Date(reminder.nextDue) < today
      ).length : 0

      setStats({
        totalRevenue,
        totalCustomers: Array.isArray(customers) ? customers.length : 0,
        totalProducts: Array.isArray(products) ? products.length : 0,
        pendingQuotes: 0, // You can implement this
        unpaidInvoices: pendingInvoices,
        overdueReminders
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const quickActions = [
    {
      name: 'New Invoice',
      href: '/invoices?action=create',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      name: 'Add Customer',
      href: '/customers?action=create',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Create Quote',
      href: '/quotes?action=create',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'View Inventory',
      href: '/inventory',
      icon: Package,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-indigo-100">Here's what's happening with your business today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-lg font-bold text-gray-900">{stats.unpaidInvoices}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <a
                key={action.name}
                href={action.href}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 flex-1">{action.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            )
          })}
        </div>
      </div>

      {/* Alerts */}
      {(stats.overdueReminders > 0 || stats.unpaidInvoices > 0) && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
          <div className="space-y-3">
            {stats.overdueReminders > 0 && (
              <div className="flex items-center p-3 bg-red-50 rounded-lg">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    {stats.overdueReminders} overdue reminder{stats.overdueReminders > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600">Check reminders section</p>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </div>
            )}
            
            {stats.unpaidInvoices > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    {stats.unpaidInvoices} unpaid invoice{stats.unpaidInvoices > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-yellow-600">Follow up on payments</p>
                </div>
                <ChevronRight className="w-4 h-4 text-yellow-400" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
