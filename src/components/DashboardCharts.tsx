'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, DollarSign, Package, Calendar, BarChart3 } from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  pendingQuotes: number
  unpaidInvoices: number
  overdueReminders: number
  monthlyRevenue: Array<{ month: string; revenue: number }>
  topCustomers: Array<{ name: string; revenue: number }>
  recentActivity: Array<{ type: string; description: string; date: string }>
}

export default function DashboardCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchDashboardStats()
  }, [timeRange])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/stats?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure all required fields have default values
      setStats({
        totalRevenue: data.totalRevenue || 0,
        totalCustomers: data.totalCustomers || 0,
        totalProducts: data.totalProducts || 0,
        pendingQuotes: data.pendingQuotes || 0,
        unpaidInvoices: data.unpaidInvoices || 0,
        overdueReminders: data.overdueReminders || 0,
        monthlyRevenue: data.monthlyRevenue || [],
        topCustomers: data.topCustomers || [],
        recentActivity: data.recentActivity || []
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set default stats to prevent crashes
      setStats({
        totalRevenue: 0,
        totalCustomers: 0,
        totalProducts: 0,
        pendingQuotes: 0,
        unpaidInvoices: 0,
        overdueReminders: 0,
        monthlyRevenue: [],
        topCustomers: [],
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow h-80"></div>
          <div className="bg-white p-6 rounded-lg shadow h-80"></div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+3%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingQuotes + stats.unpaidInvoices}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {stats.pendingQuotes} quotes • {stats.unpaidInvoices} invoices
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              stats.monthlyRevenue.map((item, index) => {
                const maxRevenue = Math.max(...stats.monthlyRevenue.map(r => r.revenue))
                const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-indigo-500 w-full rounded-t"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${item.month}: ₦${item.revenue.toLocaleString()}`}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                      {item.month}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Monthly revenue breakdown for the selected period
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {stats.topCustomers && stats.topCustomers.length > 0 ? (
              stats.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₦{customer.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No customer data available
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all customers →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.type === 'invoice' ? 'bg-green-500' :
                    activity.type === 'quote' ? 'bg-blue-500' :
                    activity.type === 'customer' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm text-gray-900">{activity.description}</span>
                </div>
                <span className="text-xs text-gray-500">{activity.date}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
