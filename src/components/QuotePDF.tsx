'use client'

import { useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Quote {
  id: number
  customer: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  total: number
  status: string
  createdAt: string
}

interface QuotePDFProps {
  quote: Quote
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
}

export default function QuotePDF({ 
  quote, 
  companyName = 'Bluedots Technologies',
  companyAddress = '123 Business St, City, State 12345',
  companyPhone = '+1 (555) 123-4567',
  companyEmail = 'info@bluedots.com'
}: QuotePDFProps) {
  const quoteRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!quoteRef.current) return

    try {
      const canvas = await html2canvas(quoteRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      pdf.save(`quote-${quote.id}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const generateJPEG = async () => {
    if (!quoteRef.current) return

    try {
      const canvas = await html2canvas(quoteRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const link = document.createElement('a')
      link.download = `quote-${quote.id}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.9)
      link.click()
    } catch (error) {
      console.error('Error generating JPEG:', error)
    }
  }

  return (
    <div>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={generatePDF}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Export PDF
        </button>
        <button
          onClick={generateJPEG}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export JPEG
        </button>
      </div>

      <div 
        ref={quoteRef}
        className="bg-white p-8 max-w-4xl mx-auto shadow-lg"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-gray-600 mt-2">{companyAddress}</p>
            <p className="text-gray-600">{companyPhone}</p>
            <p className="text-gray-600">{companyEmail}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-indigo-600">QUOTE</h2>
            <p className="text-gray-600 mt-2">#{quote.id}</p>
            <p className="text-gray-600">
              Date: {new Date(quote.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote For:</h3>
            <p className="font-medium text-gray-900">{quote.customer.name}</p>
            {quote.customer.email && (
              <p className="text-gray-600">{quote.customer.email}</p>
            )}
            {quote.customer.phone && (
              <p className="text-gray-600">{quote.customer.phone}</p>
            )}
            {quote.customer.address && (
              <p className="text-gray-600">{quote.customer.address}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Status:</h3>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              quote.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : quote.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {quote.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Quote Items */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                  Quantity
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                  Unit Price
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                  Business Services & Products
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-900">
                  1
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900">
                  ${quote.total.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900">
                  ${quote.total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-sm font-medium text-gray-900">Subtotal:</span>
              <span className="text-sm text-gray-900">${quote.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-sm font-medium text-gray-900">Tax:</span>
              <span className="text-sm text-gray-900">$0.00</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">${quote.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-16 pt-8 border-t border-gray-300">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Quote Terms:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• This quote is valid for 30 days from the date of issue.</li>
                <li>• Payment terms: 50% deposit required to proceed, balance due upon completion.</li>
                <li>• Prices are subject to change without notice.</li>
                <li>• Any additional work requested will be quoted separately.</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact Information:</h4>
              <p className="text-sm text-gray-600">
                For questions about this quote, please contact us at {companyPhone} or {companyEmail}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
