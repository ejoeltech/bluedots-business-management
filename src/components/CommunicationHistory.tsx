'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Communication {
  id: number
  reminderId: number
  type: string
  status: string
  sentAt: string | null
  recipient: string
  subject: string | null
  content: string
  errorMessage: string | null
  retryCount: number
  reminder: {
    id: number
    product: string
    customer: {
      name: string
    }
  }
}

interface CommunicationHistoryProps {
  customerId?: number
  reminderId?: number
  limit?: number
}

export default function CommunicationHistory({ customerId, reminderId, limit = 50 }: CommunicationHistoryProps) {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null)

  useEffect(() => {
    fetchCommunications()
  }, [customerId, reminderId])

  const fetchCommunications = async () => {
    try {
      let url = '/api/communications'
      const params = new URLSearchParams()
      
      if (customerId) params.append('customerId', customerId.toString())
      if (reminderId) params.append('reminderId', reminderId.toString())
      if (limit) params.append('limit', limit.toString())
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setCommunications(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch communications')
        setCommunications([])
      }
    } catch (error) {
      console.error('Error fetching communications:', error)
      setCommunications([])
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'SMS':
        return <MessageSquare className="h-4 w-4" />
      case 'CALL':
        return <Phone className="h-4 w-4" />
      case 'PUSH':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'BOUNCED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'BOUNCED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return 'bg-blue-100 text-blue-800'
      case 'SMS':
        return 'bg-purple-100 text-purple-800'
      case 'CALL':
        return 'bg-orange-100 text-orange-800'
      case 'PUSH':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not sent'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Communication History</h3>
        <span className="text-sm text-gray-500">
          {communications.length} record{communications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Communications List */}
      {communications && Array.isArray(communications) && communications.length > 0 ? (
        <div className="space-y-3">
          {communications.map((communication) => (
            <div
              key={communication.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => setSelectedCommunication(communication)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(communication.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(communication.type)}`}>
                        {communication.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(communication.status)}`}>
                        {getStatusIcon(communication.status)}
                        <span className="ml-1">{communication.status}</span>
                      </span>
                      {communication.retryCount > 0 && (
                        <span className="text-xs text-gray-500">
                          Retry {communication.retryCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {communication.subject || communication.reminder.product}
                      </p>
                      <p className="text-sm text-gray-600">
                        To: {communication.recipient}
                      </p>
                      <p className="text-sm text-gray-500">
                        Customer: {communication.reminder.customer.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(communication.sentAt)}
                      </p>
                    </div>

                    {communication.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        Error: {communication.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  {getStatusIcon(communication.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
          <p className="text-gray-500">No communication history available for the selected criteria.</p>
        </div>
      )}

      {/* Communication Detail Modal */}
      {selectedCommunication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedCommunication(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Communication Details
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedCommunication.type)}`}>
                        {selectedCommunication.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCommunication.status)}`}>
                        {getStatusIcon(selectedCommunication.status)}
                        <span className="ml-1">{selectedCommunication.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Customer:</span>
                      <p className="text-sm text-gray-900">{selectedCommunication.reminder.customer.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Product/Service:</span>
                      <p className="text-sm text-gray-900">{selectedCommunication.reminder.product}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Recipient:</span>
                      <p className="text-sm text-gray-900">{selectedCommunication.recipient}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Sent At:</span>
                      <p className="text-sm text-gray-900">{formatDate(selectedCommunication.sentAt)}</p>
                    </div>
                  </div>

                  {selectedCommunication.subject && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subject:</span>
                      <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
                        {selectedCommunication.subject}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500">Content:</span>
                    <div className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap max-h-60 overflow-y-auto">
                      {selectedCommunication.content}
                    </div>
                  </div>

                  {selectedCommunication.errorMessage && (
                    <div>
                      <span className="text-sm font-medium text-red-600">Error Message:</span>
                      <p className="text-sm text-red-700 mt-1 p-3 bg-red-50 rounded-md">
                        {selectedCommunication.errorMessage}
                      </p>
                    </div>
                  )}

                  {selectedCommunication.retryCount > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Retry Count:</span>
                      <p className="text-sm text-gray-900">{selectedCommunication.retryCount}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedCommunication(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
