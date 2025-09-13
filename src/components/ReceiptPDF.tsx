'use client'

import { useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Receipt {
  id: number
  amount: number
  createdAt: string
  invoice: {
    id: number
    customer: {
      name: string
      email?: string
      phone?: string
      address?: string
    }
    product?: {
      name: string
      price: number
    }
    quantity: number
    total: number
    createdAt: string
  }
}

interface ReceiptPDFProps {
  receipt: Receipt
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
}

export default function ReceiptPDF({ 
  receipt, 
  companyName = 'Bluedots Technologies',
  companyAddress = '123 Business St, City, State 12345',
  companyPhone = '+1 (555) 123-4567',
  companyEmail = 'info@bluedots.com'
}: ReceiptPDFProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
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
      
      pdf.save(`receipt-${receipt.id}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const generateJPEG = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      const link = document.createElement('a')
      link.download = `receipt-${receipt.id}.jpg`
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
        ref={receiptRef}
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
            <h2 className="text-2xl font-bold text-green-600">RECEIPT</h2>
            <p className="text-gray-600 mt-2">#{receipt.id}</p>
            <p className="text-gray-600">
              Date: {new Date(receipt.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">✓ PAID</div>
              <p className="text-lg text-green-800">Payment Received</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                ${receipt.amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{receipt.invoice.customer.name}</p>
            {receipt.invoice.customer.email && (
              <p className="text-gray-600">{receipt.invoice.customer.email}</p>
            )}
            {receipt.invoice.customer.phone && (
              <p className="text-gray-600">{receipt.invoice.customer.phone}</p>
            )}
            {receipt.invoice.customer.address && (
              <p className="text-gray-600">{receipt.invoice.customer.address}</p>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details:</h3>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Invoice Number:</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">#{receipt.invoice.id}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Product/Service:</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">
                  {receipt.invoice.product?.name || 'Product/Service'}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Quantity:</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">{receipt.invoice.quantity}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Invoice Date:</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">
                  {new Date(receipt.invoice.createdAt).toLocaleDateString()}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">Payment Date:</td>
                <td className="border border-gray-300 px-4 py-2 text-gray-900">
                  {new Date(receipt.createdAt).toLocaleDateString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-300">
              <span className="text-sm font-medium text-gray-900">Invoice Total:</span>
              <span className="text-sm text-gray-900">${receipt.invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-4">
              <span className="text-lg font-bold text-gray-900">Amount Paid:</span>
              <span className="text-lg font-bold text-green-600">${receipt.amount.toFixed(2)}</span>
            </div>
            {receipt.amount < receipt.invoice.total && (
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium text-red-600">Outstanding:</span>
                <span className="text-sm font-bold text-red-600">
                  ${(receipt.invoice.total - receipt.amount).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-300">
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Thank You for Your Payment!</h4>
            <p className="text-sm text-gray-600">
              This receipt serves as proof of payment. Please keep this for your records.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              For any questions, contact us at {companyPhone} or {companyEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
