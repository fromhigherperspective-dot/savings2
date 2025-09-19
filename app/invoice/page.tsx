"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Download, FileText, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  fromName: string
  fromAddress: string
  fromPhone: string
  toName: string
  toAddress: string
  toPhone: string
  serviceDescription: string
  servicesRendered: string
  deliverables: string
  amount: number
  quantity: number
}

export default function InvoicePage() {
  const router = useRouter()
  
  // Load saved user preference or default to "Nuone"
  const getSavedUser = (): "Nuone" | "Kate" => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedUser')
      if (saved === 'Nuone' || saved === 'Kate') {
        return saved
      }
    }
    return "Nuone"
  }

  const [selectedUser, setSelectedUserState] = useState<"Nuone" | "Kate">(getSavedUser())
  
  // Function to update selected user and save to localStorage
  const setSelectedUser = (user: "Nuone" | "Kate") => {
    setSelectedUserState(user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedUser', user)
    }
  }

  // Invoice data state
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    date: new Date().toISOString().split('T')[0],
    dueDate: "",
    fromName: "",
    fromAddress: "",
    fromPhone: "",
    toName: "",
    toAddress: "",
    toPhone: "",
    serviceDescription: "",
    servicesRendered: "",
    deliverables: "",
    amount: 0,
    quantity: 1
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Load saved user preference and generate invoice number on mount
  useEffect(() => {
    const savedUser = getSavedUser()
    if (savedUser !== selectedUser) {
      setSelectedUserState(savedUser)
    }
    
    // Generate invoice number starting from 00020
    const generateInvoiceNumber = () => {
      const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || "00019"
      const nextNumber = parseInt(lastInvoiceNumber) + 1
      const paddedNumber = nextNumber.toString().padStart(5, '0')
      localStorage.setItem('lastInvoiceNumber', paddedNumber)
      return `#${paddedNumber}`
    }

    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      fromName: selectedUser === "Kate" ? "Kate Angela Nolasco" : "Nuwan J",
      fromAddress: selectedUser === "Kate" 
        ? "Room 9, Villa 63, Al Leesayil St, Khalidiya, Abu Dhabi" 
        : "Abu Dhabi, UAE",
      fromPhone: selectedUser === "Kate" ? "056 658 2891" : "+971 50 436 1492"
    }))
  }, [])

  // Update from fields when user changes
  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      fromName: selectedUser === "Kate" ? "Kate Angela Nolasco" : "Nuwan J",
      fromAddress: selectedUser === "Kate" 
        ? "Room 9, Villa 63, Al Leesayil St, Khalidiya, Abu Dhabi" 
        : "Abu Dhabi, UAE",
      fromPhone: selectedUser === "Kate" ? "056 658 2891" : "+971 50 436 1492"
    }))
  }, [selectedUser])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.relative')) {
          setShowMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleInputChange = (field: keyof InvoiceData, value: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generatePDF = async () => {
    setIsGenerating(true)
    
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { default: jsPDF } = await import('jspdf')
      
      // Create A4 PDF
      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      
      // Set all text to black
      doc.setTextColor(0, 0, 0)
      
      // Header - Large "INVOICE" text (top left)
      doc.setFontSize(28)
      doc.setFont('helvetica', 'bold')
      doc.text('INVOICE', 20, 25)
      
      // Invoice details (top right, exactly as shown in PDF)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      // Right-aligned invoice details
      doc.text('Invoice ID:', 130, 45)
      doc.text(invoiceData.invoiceNumber, 170, 45)
      
      doc.text('Date:', 130, 55)
      doc.text(invoiceData.date, 170, 55)
      
      doc.text('Due Date:', 130, 65)
      doc.text(invoiceData.dueDate, 170, 65)
      
      // From and To sections (side by side)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('From:', 20, 90)
      doc.text('To:', 110, 90)
      
      // From section (left side)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      let fromY = 100
      const fromLines = invoiceData.fromAddress.split('\n')
      doc.text(invoiceData.fromName, 20, fromY)
      fromY += 5
      
      fromLines.forEach((line) => {
        if (line.trim()) {
          doc.text(line.trim(), 20, fromY)
          fromY += 5
        }
      })
      doc.text(invoiceData.fromPhone, 20, fromY)
      
      // To section (right side)
      let toY = 100
      const toLines = invoiceData.toAddress.split('\n')
      doc.text(invoiceData.toName, 110, toY)
      toY += 5
      
      toLines.forEach((line) => {
        if (line.trim()) {
          doc.text(line.trim(), 110, toY)
          toY += 5
        }
      })
      doc.text(invoiceData.toPhone, 110, toY)
      
      // Services table (black header, exactly as shown)
      const tableY = 150
      
      // Black header row
      doc.setFillColor(0, 0, 0)
      doc.rect(20, tableY, 170, 8, 'F')
      
      // White text on black background
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Item', 25, tableY + 5.5)
      doc.text('Quantity', 120, tableY + 5.5)
      doc.text('Price', 145, tableY + 5.5)
      doc.text('Amount', 165, tableY + 5.5)
      
      // Table data row
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      const dataY = tableY + 15
      
      doc.text(invoiceData.serviceDescription, 25, dataY)
      doc.text(invoiceData.quantity.toString(), 120, dataY)
      doc.text(invoiceData.amount.toString(), 145, dataY)
      doc.text(`AED ${(invoiceData.amount * invoiceData.quantity)}`, 165, dataY)
      
      // Services Rendered section
      let currentY = dataY + 20
      doc.setFont('helvetica', 'bold')
      doc.text('Services Rendered:', 20, currentY)
      currentY += 8
      
      doc.setFont('helvetica', 'normal')
      const servicesList = invoiceData.servicesRendered.split('\n').filter(s => s.trim())
      servicesList.forEach((service) => {
        doc.text(`• ${service.trim()}`, 25, currentY)
        currentY += 5
      })
      
      // Deliverables section
      currentY += 8
      doc.setFont('helvetica', 'bold')
      doc.text('Deliverables:', 20, currentY)
      currentY += 8
      
      doc.setFont('helvetica', 'normal')
      const deliverablesList = invoiceData.deliverables.split('\n').filter(d => d.trim())
      deliverablesList.forEach((deliverable) => {
        doc.text(`• ${deliverable.trim()}`, 25, currentY)
        currentY += 5
      })
      
      // Totals section (right aligned, exactly as shown)
      const totalAmount = invoiceData.amount * invoiceData.quantity
      const totalsY = Math.max(currentY + 20, 240)
      
      // Subtotal
      doc.setFont('helvetica', 'normal')
      doc.text('Subtotal', 140, totalsY)
      doc.text(`AED ${totalAmount}`, 165, totalsY)
      
      // Total (bold)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('Total', 140, totalsY + 10)
      doc.text(`AED ${totalAmount}`, 165, totalsY + 10)
      
      // Save the PDF
      const fileName = `Invoice ${invoiceData.invoiceNumber}.pdf`
      doc.save(fileName)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {/* Dynamic focus color styling */}
      <style jsx>{`
        .invoice-input-${selectedUser.toLowerCase()} input:focus,
        .invoice-input-${selectedUser.toLowerCase()} textarea:focus {
          border-color: ${selectedUser === "Kate" ? "#C11C84" : "#2c6fbb"} !important;
          box-shadow: 0 0 0 1px ${selectedUser === "Kate" ? "#C11C84" : "#2c6fbb"} !important;
        }
        .invoice-input-${selectedUser.toLowerCase()} input:focus-visible,
        .invoice-input-${selectedUser.toLowerCase()} textarea:focus-visible {
          outline: 2px solid ${selectedUser === "Kate" ? "#C11C84" : "#2c6fbb"} !important;
          outline-offset: 2px;
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-sm mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 flex-shrink-0 min-w-[40px] h-[40px] border border-gray-200"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Create Invoice</h1>
          </div>
          
          {/* Right side - User Toggle and Menu */}
          <div className="flex items-center gap-3">
            {/* User Toggle */}
            <div className="bg-gray-50 rounded-2xl p-1 shadow-sm border border-gray-200 flex-shrink-0">
              <div className="flex">
                <Button
                  variant={selectedUser === "Nuone" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-xl px-4 text-sm font-medium transition-all ${
                    selectedUser === "Nuone"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  style={selectedUser === "Nuone" ? { backgroundColor: '#2c6fbb' } : {}}
                  onClick={() => setSelectedUser("Nuone")}
                >
                  N
                </Button>
                <Button
                  variant={selectedUser === "Kate" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-xl px-4 text-sm font-medium transition-all ${
                    selectedUser === "Kate"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  style={selectedUser === "Kate" ? { backgroundColor: '#C11C84' } : {}}
                  onClick={() => setSelectedUser("Kate")}
                >
                  K
                </Button>
              </div>
            </div>
            
            {/* Menu Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 flex-shrink-0 min-w-[40px] h-[40px] border border-gray-200"
                title="Menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        window.location.href = '/to-do-list'
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      To do list
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        window.location.href = '/'
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Tinigom Nato
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Form */}
        <div className={`financial-card invoice-input-${selectedUser.toLowerCase()}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Details
          </h3>
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-gray-700 text-sm">Invoice Number</Label>
                <Input
                  value={invoiceData.invoiceNumber}
                  disabled
                  className="glass-input bg-gray-50"
                />
              </div>
              <div>
                <Label className="text-gray-700 text-sm">Date</Label>
                <Input
                  type="date"
                  value={invoiceData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="glass-input"
                />
              </div>
              <div>
                <Label className="text-gray-700 text-sm">Due Date</Label>
                <Input
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            {/* From Section */}
            <div>
              <Label className="text-lg font-semibold">From</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                <div>
                  <Label className="text-gray-700 text-sm">Name</Label>
                  <Input
                    value={invoiceData.fromName}
                    onChange={(e) => handleInputChange('fromName', e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm">Address</Label>
                  <Textarea
                    value={invoiceData.fromAddress}
                    onChange={(e) => handleInputChange('fromAddress', e.target.value)}
                    rows={3}
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm">Phone</Label>
                  <Input
                    value={invoiceData.fromPhone}
                    onChange={(e) => handleInputChange('fromPhone', e.target.value)}
                    className="glass-input"
                  />
                </div>
              </div>
            </div>

            {/* To Section */}
            <div>
              <Label className="text-lg font-semibold">To</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                <div>
                  <Label className="text-gray-700 text-sm">Client Name</Label>
                  <Input
                    value={invoiceData.toName}
                    onChange={(e) => handleInputChange('toName', e.target.value)}
                    placeholder="Enter client name"
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm">Client Address</Label>
                  <Textarea
                    value={invoiceData.toAddress}
                    onChange={(e) => handleInputChange('toAddress', e.target.value)}
                    rows={3}
                    placeholder="Enter client address"
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm">Client Phone</Label>
                  <Input
                    value={invoiceData.toPhone}
                    onChange={(e) => handleInputChange('toPhone', e.target.value)}
                    placeholder="Enter client phone"
                    className="glass-input"
                  />
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div>
              <Label className="text-lg font-semibold">Service Details</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                <div>
                  <Label className="text-gray-700 text-sm">Service Description</Label>
                  <Input
                    value={invoiceData.serviceDescription}
                    onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                    placeholder="e.g., Social Media Management"
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm">Quantity</Label>
                  <Input
                    type="number"
                    value={invoiceData.quantity}
                    onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                    min="1"
                    className="glass-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 text-sm">Amount (AED)</Label>
                  <Input
                    type="number"
                    value={invoiceData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="glass-input"
                  />
                </div>
              </div>
            </div>

            {/* Services Rendered */}
            <div>
              <Label className="text-gray-700 text-sm">Services Rendered</Label>
              <Textarea
                value={invoiceData.servicesRendered}
                onChange={(e) => handleInputChange('servicesRendered', e.target.value)}
                rows={4}
                placeholder="Enter each service on a new line:&#10;Graphic Designing&#10;Caption Writing&#10;Content Strategy & Creation"
                className="glass-input"
              />
              <p className="text-sm text-gray-500 mt-1">Enter each service on a new line</p>
            </div>

            {/* Deliverables */}
            <div>
              <Label className="text-gray-700 text-sm">Deliverables</Label>
              <Textarea
                value={invoiceData.deliverables}
                onChange={(e) => handleInputChange('deliverables', e.target.value)}
                rows={4}
                placeholder="Enter each deliverable on a new line:&#10;7 social media posts (static, carousel & reel)&#10;4-6 Instagram Stories (static, carousel & reel)"
                className="glass-input"
              />
              <p className="text-sm text-gray-500 mt-1">Enter each deliverable on a new line</p>
            </div>

            {/* Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  AED {(invoiceData.amount * invoiceData.quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Generate PDF Button */}
            <Button
              onClick={generatePDF}
              disabled={isGenerating || !invoiceData.toName || !invoiceData.serviceDescription}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              {isGenerating ? (
                "Generating PDF..."
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Generate & Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}