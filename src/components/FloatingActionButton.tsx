'use client'

import { useState } from 'react'
import { Plus, FileText, Users, Package, Receipt } from 'lucide-react'

const quickActions = [
  {
    name: 'New Invoice',
    href: '/invoices?action=create',
    icon: FileText,
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
    icon: FileText,
    color: 'bg-purple-500'
  },
  {
    name: 'Add Product',
    href: '/inventory?action=create',
    icon: Package,
    color: 'bg-orange-500'
  },
  {
    name: 'New Receipt',
    href: '/receipts?action=create',
    icon: Receipt,
    color: 'bg-indigo-500'
  }
]

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      {/* Action Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 space-y-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <a
                key={action.name}
                href={action.href}
                className={`flex items-center px-4 py-3 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[160px] transform transition-all duration-200 hover:scale-105 ${
                  isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
                onClick={() => setIsOpen(false)}
              >
                <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.name}</span>
              </a>
            )
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 bg-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-indigo-700 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
        aria-label={isOpen ? 'Close menu' : 'Open quick actions'}
      >
        <Plus className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-0'}`} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
