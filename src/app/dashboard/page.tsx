'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import DashboardCharts from '@/components/DashboardCharts'
import MobileDashboard from '@/components/MobileDashboard'
import { Users, FileText, Receipt, Package, Bell, TrendingUp, DollarSign } from 'lucide-react'

interface DashboardStats {
  customers: number
  invoices: number
  receipts: number
  products: number
  reminders: number
  totalRevenue: number
  pendingInvoices: number
  overdueReminders: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    invoices: 0,
    receipts: 0,
    products: 0,
    reminders: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
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
        customers: Array.isArray(customers) ? customers.length : 0,
        invoices: Array.isArray(invoices) ? invoices.length : 0,
        receipts: Array.isArray(receipts) ? receipts.length : 0,
        products: Array.isArray(products) ? products.length : 0,
        reminders: Array.isArray(reminders) ? reminders.length : 0,
        totalRevenue,
        pendingInvoices,
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
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        {/* Mobile Dashboard */}
        <div className="lg:hidden">
          <MobileDashboard />
        </div>

        {/* Desktop Dashboard */}
        <div className="hidden lg:block">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to Bluedots Technologies Business Management System
            </p>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.customers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Invoices</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.invoices}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">${stats.totalRevenue.toFixed(2)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Products</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.products}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Receipt className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Payments Received</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.receipts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Invoices</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingInvoices}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue Reminders</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.overdueReminders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <a
                href="/customers"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Add Customer</p>
                  <p className="text-sm text-gray-500">Create new customer</p>
                </div>
              </a>

              <a
                href="/invoices"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Create Invoice</p>
                  <p className="text-sm text-gray-500">Generate new invoice</p>
                </div>
              </a>

              <a
                href="/quotes"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Create Quote</p>
                  <p className="text-sm text-gray-500">Generate new quote</p>
                </div>
              </a>

              <a
                href="/reminders"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">Send Reminders</p>
                  <p className="text-sm text-gray-500">Process due reminders</p>
                </div>
              </a>
            </div>
          </div>
        </div>

          {/* Enhanced Analytics Dashboard */}
          <div className="mt-8">
            <DashboardCharts />
          </div>
        </div>
      </div>
    </Layout>
  )
}
