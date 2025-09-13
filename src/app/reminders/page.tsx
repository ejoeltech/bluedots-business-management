'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import CommunicationHistory from '@/components/CommunicationHistory'
import { Plus, Edit, Trash2, Bell, Clock, Calendar, MessageSquare } from 'lucide-react'

interface Reminder {
  id: number
  customer: {
    name: string
    email?: string
    phone?: string
  }
  product: string
  interval: number
  nextDue: string
  createdAt: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [selectedReminderId, setSelectedReminderId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    customerId: '',
    product: 'Tubular Battery Servicing',
    interval: '90',
    nextDue: ''
  })
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    fetchReminders()
    fetchCustomers()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      const data = await response.json()
      setReminders(data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingReminder 
        ? `/api/reminders/${editingReminder.id}`
        : '/api/reminders'
      
      const method = editingReminder ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingReminder(null)
        setFormData({ customerId: '', product: 'Tubular Battery Servicing', interval: '90', nextDue: '' })
        fetchReminders()
      }
    } catch (error) {
      console.error('Error saving reminder:', error)
    }
  }

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setFormData({
      customerId: reminder.customer.name, // This should be customer ID, but we'll handle it differently
      product: reminder.product,
      interval: reminder.interval.toString(),
      nextDue: new Date(reminder.nextDue).toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      try {
        await fetch(`/api/reminders/${id}`, {
          method: 'DELETE',
        })
        fetchReminders()
      } catch (error) {
        console.error('Error deleting reminder:', error)
      }
    }
  }

  const sendReminders = async () => {
    try {
      const response = await fetch('/api/reminders/send', {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchReminders()
      }
    } catch (error) {
      console.error('Error sending reminders:', error)
    }
  }

  const getDueStatus = (nextDue: string) => {
    const dueDate = new Date(nextDue)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { color: 'text-red-600', label: 'Overdue', bgColor: 'bg-red-100' }
    if (diffDays <= 7) return { color: 'text-yellow-600', label: 'Due Soon', bgColor: 'bg-yellow-100' }
    return { color: 'text-green-600', label: 'Scheduled', bgColor: 'bg-green-100' }
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
            <h1 className="text-2xl font-semibold text-gray-900">Customer Reminders</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage customer service reminders for tubular battery servicing.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <button
              onClick={sendReminders}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Reminders
            </button>
            <button
              onClick={() => {
                setEditingReminder(null)
                setFormData({ customerId: '', product: 'Tubular Battery Servicing', interval: '90', nextDue: '' })
                setShowModal(true)
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder) => {
            const status = getDueStatus(reminder.nextDue)
            
            return (
              <div key={reminder.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Bell className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Customer
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {reminder.customer.name}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Service</p>
                      <p className="text-sm text-gray-900">{reminder.product}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedReminderId(reminder.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Communication History"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(reminder)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Reminder"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Reminder"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Every {reminder.interval} days
                    </div>
                    <div className={`px-2 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.color}`}>
                      {status.label}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Next: {new Date(reminder.nextDue).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
                      </h3>
                    </div>
                    
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
                        <label className="block text-sm font-medium text-gray-700">Service Type *</label>
                        <select
                          required
                          value={formData.product}
                          onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="Tubular Battery Servicing">Tubular Battery Servicing</option>
                          <option value="Distilled Water Refill">Distilled Water Refill</option>
                          <option value="Battery Maintenance">Battery Maintenance</option>
                          <option value="System Check">System Check</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reminder Interval (days) *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.interval}
                          onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="90"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Next Due Date *</label>
                        <input
                          type="date"
                          required
                          value={formData.nextDue}
                          onChange={(e) => setFormData({ ...formData, nextDue: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingReminder ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Communication History Modal */}
      {selectedReminderId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedReminderId(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Communication History
                  </h3>
                  <button
                    onClick={() => setSelectedReminderId(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <CommunicationHistory reminderId={selectedReminderId} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
