'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import QuotePDF from '@/components/QuotePDF'
import CurrencySelector from '@/components/CurrencySelector'
import { Plus, Edit, Trash2, Eye, Download, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'

interface Quote {
  id: number
  customer: {
    name: string
    email?: string
  }
  total: number
  currency: string
  status: string
  createdAt: string
}

function QuotesPageContent() {
  const searchParams = useSearchParams()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPDFModal, setShowPDFModal] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [formData, setFormData] = useState({
    customerId: '',
    total: '',
    currency: 'NGN',
    status: 'pending'
  })
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    fetchQuotes()
    fetchCustomers()
  }, [])

  // Handle URL parameters to auto-open modal
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create') {
      setShowModal(true)
      // Clean up URL without reloading
      const url = new URL(window.location.href)
      url.searchParams.delete('action')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes')
      if (response.ok) {
        const data = await response.json()
        setQuotes(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch quotes:', response.status)
        setQuotes([])
      }
    } catch (error) {
      console.error('Error fetching quotes:', error)
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch customers:', response.status)
        setCustomers([])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingQuote 
        ? `/api/quotes/${editingQuote.id}`
        : '/api/quotes'
      
      const method = editingQuote ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingQuote(null)
        setFormData({ customerId: '', total: '', currency: 'NGN', status: 'pending' })
        fetchQuotes()
      }
    } catch (error) {
      console.error('Error saving quote:', error)
    }
  }

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote)
    setFormData({
      customerId: quote.customer.name, // This should be the customer ID, but we'll handle it differently
      total: quote.total.toString(),
      currency: quote.currency || 'NGN',
      status: quote.status
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this quote?')) {
      try {
        await fetch(`/api/quotes/${id}`, {
          method: 'DELETE',
        })
        fetchQuotes()
      } catch (error) {
        console.error('Error deleting quote:', error)
      }
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Customer', 'Total', 'Status', 'Created At'],
      ...quotes.map(quote => [
        quote.id.toString(),
        quote.customer.name,
        quote.total.toString(),
        quote.status,
        new Date(quote.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quotes.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your quotes and proposals for customers.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setEditingQuote(null)
                setFormData({ customerId: '', total: '', currency: 'NGN', status: 'pending' })
                setShowModal(true)
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quote #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotes && Array.isArray(quotes) && quotes.length > 0 ? (
                      quotes.map((quote) => (
                      <tr key={quote.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{quote.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {quote.customer.name}
                          </div>
                          <div className="text-sm text-gray-500">{quote.customer.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(quote.total, quote.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={quote.status}
                            onChange={(e) => {
                              // Handle status update here if needed
                              console.log('Status update:', e.target.value)
                            }}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(quote.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedQuote(quote)
                                setShowPDFModal(true)
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(quote)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(quote.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <FileText className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
                            <p className="text-gray-500">Get started by creating your first quote.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create/Edit Quote Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingQuote ? 'Edit Quote' : 'Create New Quote'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Customer *</label>
                        <select
                          required
                          value={formData.customerId}
                          onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select customer</option>
                          {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Total Amount *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.total}
                          onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency *</label>
                        <CurrencySelector
                          value={formData.currency}
                          onChange={(currency) => setFormData({ ...formData, currency })}
                          className="mt-1 block w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingQuote ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>

        {/* PDF Modal */}
        {showPDFModal && selectedQuote && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPDFModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-96 overflow-y-auto">
                  <QuotePDF quote={selectedQuote as any} />
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowPDFModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuotesPageContent />
    </Suspense>
  )
}
