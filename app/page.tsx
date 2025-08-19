"use client"

import { useState, useEffect } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  Plus,
  Target,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  X,
  Filter,
  AlertTriangle,
  Trash2,
  DollarSign,
  PiggyBank,
  CreditCard,
} from "lucide-react"

interface Transaction {
  id: string
  amount: number
  type: "income" | "savings" | "withdrawal"
  category?: string
  reason?: string
  user: "Nuone" | "Kate"
  date: Date | string
}

export default function BudgetApp() {
  const [selectedUser, setSelectedUser] = useState<"Nuone" | "Kate">("Nuone")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoal, setSavingsGoal] = useState(150000)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const [filterType, setFilterType] = useState<"all" | "withdrawal" | "savings" | "income">("all")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterUser, setFilterUser] = useState<"all" | "Nuone" | "Kate">("all")
  const [loading, setLoading] = useState(false)

  // Form states
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [reason, setReason] = useState("")

  // Load data from database on component mount
  useEffect(() => {
    loadTransactions()
    loadSettings()
  }, [])

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      } else {
        console.error('Failed to load transactions')
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSavingsGoal(data.settings?.savings_goal || 150000)
      } else {
        console.error('Failed to load settings')
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  // Calculate totals (including both income and savings as positive)
  const userTotals = {
    Nuone: transactions
      .filter((t) => t.user === "Nuone")
      .reduce((sum, t) => sum + (t.type === "withdrawal" ? -t.amount : t.amount), 0),
    Kate: transactions
      .filter((t) => t.user === "Kate")
      .reduce((sum, t) => sum + (t.type === "withdrawal" ? -t.amount : t.amount), 0),
  }

  const grandTotal = userTotals.Nuone + userTotals.Kate
  const savingsProgress = Math.min((grandTotal / savingsGoal) * 100, 100)
  
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0)

  const addTransaction = async () => {
    if (!amount) return

    setLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type: 'income',
          category: category || null,
          user: selectedUser,
        }),
      })

      if (response.ok) {
        await loadTransactions() // Reload transactions from database
        setAmount("")
        setCategory("")
        setShowAddModal(false)
      } else {
        const error = await response.json()
        console.error('Failed to add transaction:', error)
        alert('Failed to add transaction. Please try again.')
      }
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Failed to add transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addWithdrawal = async () => {
    if (!amount || !reason) return

    setLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type: 'withdrawal',
          reason: reason || null,
          user: selectedUser,
        }),
      })

      if (response.ok) {
        await loadTransactions() // Reload transactions from database
        setAmount("")
        setReason("")
        setShowWithdrawModal(false)
      } else {
        const error = await response.json()
        console.error('Failed to add withdrawal:', error)
        alert('Failed to add withdrawal. Please try again.')
      }
    } catch (error) {
      console.error('Error adding withdrawal:', error)
      alert('Failed to add withdrawal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (transactionId: string) => {
    if (selectedUser !== "Nuone") {
      alert("Only Nuone can delete transactions.")
      return
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?")
    if (!confirmDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/transactions?id=${transactionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadTransactions() // Reload transactions from database
      } else {
        const error = await response.json()
        console.error('Failed to delete transaction:', error)
        alert('Failed to delete transaction. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTransactions = () => {
    let filtered = transactions

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    if (filterMonth !== "all") {
      const month = Number.parseInt(filterMonth)
      filtered = filtered.filter((t) => new Date(t.date).getMonth() === month)
    }

    if (filterUser !== "all") {
      filtered = filtered.filter((t) => t.user === filterUser)
    }

    return filtered
  }

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }: { percentage: number, size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="progress-ring"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10b981"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="progress-ring-circle"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-gray-600 text-xs mt-1">Wealth begins where impulse ends.</p>
          </div>
          
          {/* User Toggle */}
          <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
            <div className="flex">
              <Button
                variant={selectedUser === "Nuone" ? "default" : "ghost"}
                size="sm"
                className={`rounded-xl px-4 text-sm font-medium transition-all ${
                  selectedUser === "Nuone"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedUser("Nuone")}
              >
                Nuone
              </Button>
              <Button
                variant={selectedUser === "Kate" ? "default" : "ghost"}
                size="sm"
                className={`rounded-xl px-4 text-sm font-medium transition-all ${
                  selectedUser === "Kate"
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedUser("Kate")}
              >
                Kate
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Card - Moved to top */}
        <div className="financial-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Savings Goal</h3>
              <p className="text-gray-600 text-sm">Track your progress</p>
            </div>
            {selectedUser === "Nuone" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  const newGoal = prompt("Enter new savings goal:", savingsGoal.toString())
                  if (newGoal && !isNaN(parseFloat(newGoal))) {
                    setLoading(true)
                    try {
                      const response = await fetch('/api/settings', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          savings_goal: parseFloat(newGoal),
                        }),
                      })

                      if (response.ok) {
                        setSavingsGoal(parseFloat(newGoal))
                      } else {
                        const error = await response.json()
                        console.error('Failed to update savings goal:', error)
                        alert('Failed to update savings goal. Please try again.')
                      }
                    } catch (error) {
                      console.error('Error updating savings goal:', error)
                      alert('Failed to update savings goal. Please try again.')
                    } finally {
                      setLoading(false)
                    }
                  }
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                Edit
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-center">
            <CircularProgress percentage={savingsProgress} />
          </div>
        </div>

        {/* Main Balance Card */}
        <div className="financial-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Total Savings</p>
              <h2 className="text-4xl font-bold text-gray-900">AED {grandTotal.toLocaleString()}</h2>
            </div>
            <div className="bg-green-100 p-2 rounded-xl">
              <DollarSign className="h-5 w-5 text-green-600 animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Goal: AED {savingsGoal.toLocaleString()}</span>
            </div>
            <span className="text-green-600 font-medium">+{Math.round(savingsProgress)}%</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="financial-card">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-2 rounded-xl">
                <ArrowUpRight className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+AED 0</span>
            </div>
            <p className="text-gray-600 text-sm">Total Income</p>
            <p className="text-2xl font-bold text-gray-900">AED {totalIncome.toLocaleString()}</p>
          </div>

          <div className="financial-card">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 p-2 rounded-xl">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-red-600 text-sm font-medium">-AED 0</span>
            </div>
            <p className="text-gray-600 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">AED {totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        {/* Individual Balances */}
        <div className="financial-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Balances</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">N</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nuone</p>
                  <p className="text-gray-600 text-sm">Personal Account</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">AED {userTotals.Nuone.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-semibold">K</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Kate</p>
                  <p className="text-gray-600 text-sm">Personal Account</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">AED {userTotals.Kate.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <Plus className="mr-2 h-5 w-5" />
            Save
          </Button>
          <Button
            onClick={() => setShowWithdrawModal(true)}
            variant="outline"
            className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <ArrowDownRight className="mr-2 h-5 w-5" />
            Withdraw
          </Button>
        </div>

        {/* Recent Transactions - Always show filters */}
        <div className="financial-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          
          {/* Always visible filters */}
          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-gray-700 text-sm">Type</Label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="glass-input text-gray-900 text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 text-sm">User</Label>
                <Select value={filterUser} onValueChange={(value: any) => setFilterUser(value)}>
                  <SelectTrigger className="glass-input text-gray-900 text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Nuone">Nuone</SelectItem>
                    <SelectItem value="Kate">Kate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 text-sm">Month</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="glass-input text-gray-900 text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="0">January</SelectItem>
                    <SelectItem value="1">February</SelectItem>
                    <SelectItem value="2">March</SelectItem>
                    <SelectItem value="3">April</SelectItem>
                    <SelectItem value="4">May</SelectItem>
                    <SelectItem value="5">June</SelectItem>
                    <SelectItem value="6">July</SelectItem>
                    <SelectItem value="7">August</SelectItem>
                    <SelectItem value="8">September</SelectItem>
                    <SelectItem value="9">October</SelectItem>
                    <SelectItem value="10">November</SelectItem>
                    <SelectItem value="11">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {getFilteredTransactions()
                .slice(-10)
                .reverse()
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-xl ${
                          transaction.type === "withdrawal" 
                            ? "bg-red-100" 
                            : "bg-green-100"
                        }`}
                      >
                        {transaction.type === "withdrawal" ? (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {transaction.category || transaction.reason || transaction.type}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {transaction.user} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p
                        className={`font-semibold text-sm ${
                          transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {transaction.type === "withdrawal" ? "-" : "+"}
                        AED {transaction.amount.toLocaleString()}
                      </p>
                      {selectedUser === "Nuone" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTransaction(transaction.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No transactions yet. Add some to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="financial-card w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Save Money</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-900 p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-gray-700 text-sm font-medium">
                  Amount (AED)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-input text-gray-900 mt-1"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-700 text-sm font-medium">
                  Category (Optional)
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input text-gray-900 mt-1"
                  placeholder="e.g., Salary, Freelance, Savings"
                />
              </div>
              <Button 
                onClick={addTransaction} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Money"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Money Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="financial-card w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Make Withdrawal</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-500 hover:text-gray-900 p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdraw-amount" className="text-gray-700 text-sm font-medium">
                  Amount (AED)
                </Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-input text-gray-900 mt-1"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="reason" className="text-gray-700 text-sm font-medium">
                  Reason
                </Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="glass-input text-gray-900 mt-1"
                  placeholder="e.g., Groceries, Bills"
                />
              </div>
              <Button 
                onClick={addWithdrawal} 
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {loading ? "Processing..." : "Make Withdrawal"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}