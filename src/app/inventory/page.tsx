'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import Modal from '@/components/Modal'
import CurrencySelector from '@/components/CurrencySelector'
import { Plus, Edit, Trash2, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'

interface Product {
  id: number
  name: string
  type: string
  stock: number
  price: number
  currency: string
  createdAt: string
  _count: {
    invoices: number
  }
}

function InventoryPageContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    stock: '',
    price: '',
    currency: 'NGN'
  })

  useEffect(() => {
    fetchProducts()
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

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch products:', response.status)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingProduct(null)
        setFormData({ name: '', type: '', stock: '', price: '', currency: 'NGN' })
        fetchProducts()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      type: product.type,
      stock: product.stock.toString(),
      price: product.price.toString(),
      currency: product.currency || 'NGN'
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        })
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Type', 'Stock', 'Price', 'Total Sales', 'Created At'],
      ...products.map(product => [
        product.name,
        product.type,
        product.stock.toString(),
        product.price.toString(),
        product._count.invoices.toString(),
        new Date(product.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', icon: TrendingDown, label: 'Out of Stock' }
    if (stock < 10) return { color: 'text-yellow-600', icon: TrendingDown, label: 'Low Stock' }
    return { color: 'text-green-600', icon: TrendingUp, label: 'In Stock' }
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
            <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your product inventory and stock levels.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Package className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setEditingProduct(null)
                setFormData({ name: '', type: '', stock: '', price: '', currency: 'NGN' })
                setShowModal(true)
              }}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock)
            const StockIcon = stockStatus.icon
            
            return (
              <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {product.type}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {product.name}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Stock</p>
                        <p className={`text-lg font-semibold ${stockStatus.color}`}>
                          {product.stock} units
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Price</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(product.price, product.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <StockIcon className="h-4 w-4 mr-1" />
                      {stockStatus.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product._count.invoices} sales
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g., Distilled Water 5L"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type *</label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select type</option>
                          <option value="Distilled Water">Distilled Water</option>
                          <option value="Battery">Battery</option>
                          <option value="Accessory">Accessory</option>
                          <option value="Service">Service</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Stock *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Currency *</label>
                        <CurrencySelector
                          value={formData.currency}
                          onChange={(currency) => setFormData({ ...formData, currency })}
                          className="mt-1 block w-full"
                        />
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
                {editingProduct ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryPageContent />
    </Suspense>
  )
}
