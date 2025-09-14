'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import SimpleModal from '@/components/SimpleModal'

export default function TestModalPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Modal Test Page</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded">
            <p className="text-blue-800">
              <strong>Modal State:</strong> {showModal ? 'OPEN' : 'CLOSED'}
            </p>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open Modal
          </button>
          
          <button
            onClick={() => setShowModal(false)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Close Modal
          </button>
        </div>

        <SimpleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Test Modal"
        >
          <div className="space-y-4">
            <p>This is a test modal to verify modal functionality.</p>
            <p>If you can see this, the modal is working correctly!</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Close Modal
            </button>
          </div>
        </SimpleModal>
      </div>
    </Layout>
  )
}
