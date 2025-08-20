"use client"

import { useState, useEffect } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  RefreshCw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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

// Simple Calendar Component
interface SimpleCalendarProps {
  selectedDate?: Date
  onSelectDate: (date: Date | undefined) => void
}

const SimpleCalendar: React.FC<SimpleCalendarProps> = ({ selectedDate, onSelectDate }) => {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today)
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  const selectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onSelectDate(newDate)
  }
  
  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }
  
  const isTodayDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }
  
  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isSelectedDate(day)
      const isToday = isTodayDate(day)
      
      let dayClasses = 'w-8 h-8 text-sm rounded-md transition-colors '
      
      if (isSelected) {
        dayClasses += 'bg-green-600 text-white hover:bg-green-700'
      } else if (isToday) {
        dayClasses += 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
      } else {
        dayClasses += 'text-gray-900 hover:bg-gray-100'
      }
      
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          className={dayClasses}
        >
          {day}
        </button>
      )
    }
    
    return days
  }
  
  return (
    <div className="p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <h3 className="font-medium text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="w-8 h-6 text-xs text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
      
      {/* Clear button */}
      {selectedDate && (
        <div className="mt-4 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectDate(undefined)}
            className="w-full text-gray-600 hover:text-gray-900"
          >
            Clear date
          </Button>
        </div>
      )}
    </div>
  )
}

export default function BudgetApp() {
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoal, setSavingsGoal] = useState(150000)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const [filterType, setFilterType] = useState<"all" | "withdrawal" | "savings" | "income">("all")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [filterUser, setFilterUser] = useState<"all" | "Nuone" | "Kate">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullStart, setPullStart] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)

  // Form states
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [reason, setReason] = useState("")

  // Motivational quote state
  const [motivationalQuote, setMotivationalQuote] = useState("Wealth begins where impulse ends.")
  
  // Loading screen state
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [loadingFadeOut, setLoadingFadeOut] = useState(false)
  const [appReady, setAppReady] = useState(false)
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)

  // Track user activity and manage 12-hour inactivity timer
  const updateActivity = () => {
    // Clear existing timer when user is active
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      setInactivityTimer(null)
    }
    
    // Start new 12-hour inactivity timer
    const twelveHourTimer = setTimeout(() => {
      // Show loading screen after 12 hours of inactivity
      setShowLoadingScreen(true)
      setLoadingFadeOut(false)
      
      // Show loading for 2.5 seconds then start fade out
      setTimeout(() => {
        setLoadingFadeOut(true) // Start fade out
        
        // Remove loading screen after fade completes
        setTimeout(() => {
          setShowLoadingScreen(false)
          setLoadingFadeOut(false)
        }, 1000) // Wait for 1s fade duration
      }, 2500)
      
    }, 12 * 60 * 60 * 1000) // 12 hours
    
    setInactivityTimer(twelveHourTimer)
  }

  // Check if we should show loading screen on server restart
  const shouldShowLoadingOnStart = () => {
    const lastServerStart = localStorage.getItem('lastServerStart')
    const currentTime = Date.now().toString()
    
    if (!lastServerStart || lastServerStart !== currentTime) {
      localStorage.setItem('lastServerStart', currentTime)
      return true
    }
    return false
  }

  // Load saved user preference on client-side mount
  useEffect(() => {
    // Ensure we're on client-side and update user if needed
    const savedUser = getSavedUser()
    if (savedUser !== selectedUser) {
      setSelectedUserState(savedUser)
    }
  }, [])

  // Load data from database on component mount
  useEffect(() => {
    const showLoadingOnStart = shouldShowLoadingOnStart()
    
    if (showLoadingOnStart) {
      // Show loading screen on server restart
      setShowLoadingScreen(true)
      setLoadingFadeOut(false)
      
      // Load app data while loading screen is showing
      setTimeout(() => {
        setAppReady(true)
        loadTransactions()
        loadSettings()
        loadMotivationalQuote()
      }, 1000) // Load data early
      
      // Show loading for 2.5 seconds then start fade out
      setTimeout(() => {
        setLoadingFadeOut(true) // Start fade out
        
        // Start activity tracking during fade
        updateActivity()
        
        // Remove loading screen after fade completes
        setTimeout(() => {
          setShowLoadingScreen(false)
          setLoadingFadeOut(false)
        }, 1000) // Wait for 1s fade duration
      }, 2500)
    } else {
      // Load app immediately if no server restart
      setAppReady(true)
      loadTransactions()
      loadSettings()
      loadMotivationalQuote()
      
      // Start activity tracking immediately
      updateActivity()
    }
    
    // Add activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })
    
    // Set up interval to check for new quotes every 12 hours
    const quoteInterval = setInterval(loadMotivationalQuote, 12 * 60 * 60 * 1000) // 12 hours
    
    return () => {
      clearInterval(quoteInterval)
      if (inactivityTimer) clearTimeout(inactivityTimer)
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true)
      })
    }
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, filterDate, filterUser])

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      } else {
        console.error('Failed to load transactions - using empty array')
        setTransactions([]) // Fallback to empty array
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      setTransactions([]) // Fallback to empty array
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSavingsGoal(data.settings?.savings_goal || 150000)
      } else {
        console.error('Failed to load settings - using default')
        setSavingsGoal(150000) // Fallback to default
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSavingsGoal(150000) // Fallback to default
    }
  }

  const loadMotivationalQuote = async () => {
    try {
      const response = await fetch('/api/motivational-quote')
      if (response.ok) {
        const data = await response.json()
        setMotivationalQuote(data.quote || "Wealth begins where impulse ends.")
      } else {
        console.error('Failed to load motivational quote - using default')
        setMotivationalQuote("Wealth begins where impulse ends.")
      }
    } catch (error) {
      console.error('Error loading motivational quote:', error)
      setMotivationalQuote("Wealth begins where impulse ends.")
    }
  }

  // Refresh data function
  const refreshData = async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadTransactions(), loadSettings(), loadMotivationalQuote()])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStart(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStart > 0 && window.scrollY === 0) {
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - pullStart)
      setPullDistance(Math.min(distance, 120)) // Max pull distance of 120px
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !refreshing) {
      refreshData()
    }
    setPullStart(0)
    setPullDistance(0)
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
      // Map "savings" filter to show "income" transactions (money added)
      if (filterType === "savings") {
        filtered = filtered.filter((t) => t.type === "income")
      } else {
        filtered = filtered.filter((t) => t.type === filterType)
      }
    }

    if (filterDate) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getFullYear() === filterDate.getFullYear() &&
          transactionDate.getMonth() === filterDate.getMonth() &&
          transactionDate.getDate() === filterDate.getDate()
        )
      })
    }

    if (filterUser !== "all") {
      filtered = filtered.filter((t) => t.user === filterUser)
    }

    return filtered
  }

  const getPaginatedTransactions = () => {
    const filtered = getFilteredTransactions()
    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    const itemsPerPage = 5
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    
    return {
      transactions: sorted.slice(startIndex, endIndex),
      totalPages: Math.ceil(sorted.length / itemsPerPage),
      totalTransactions: sorted.length
    }
  }

  // Apple-style Loading Screen Component
  const LoadingScreen = () => {
    return (
      <div className={`fixed inset-0 bg-white flex flex-col items-center justify-center z-50 transition-opacity duration-1000 ease-out ${loadingFadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center">
          {/* App title - clean and static */}
          <div className="space-y-1 mb-4">
            <h1 className="text-3xl font-light text-black tracking-wide">Tinigom nato</h1>
            <p className="text-gray-500 text-sm font-light">Loading your savings journey</p>
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-dot-flow" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-dot-flow" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-dot-flow" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        
        {/* Custom styles for dot animation */}
        <style jsx>{`
          @keyframes dot-flow {
            0%, 70%, 100% {
              transform: translateY(0px);
              opacity: 0.3;
            }
            35% {
              transform: translateY(-6px);
              opacity: 0.9;
            }
          }
          
          .animate-dot-flow {
            animation: dot-flow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}</style>
      </div>
    )
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
    <>
      {/* Loading screen with fade transition - always render when showing */}
      {showLoadingScreen && <LoadingScreen />}
      
      {/* Main app - only render when ready */}
      {appReady && (
    <div 
      className="min-h-screen bg-gray-50 p-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-full shadow-lg p-3 transition-all duration-200"
          style={{
            opacity: Math.min(pullDistance / 80, 1),
            transform: `translateX(-50%) translateY(${Math.max(pullDistance - 40, 10)}px)`
          }}
        >
          <div className={`w-6 h-6 border-2 border-green-600 rounded-full ${refreshing || pullDistance > 80 ? 'animate-spin border-t-transparent' : ''}`}>
            {!refreshing && pullDistance <= 80 && (
              <ArrowDownRight className="w-4 h-4 text-green-600 mt-0.5 ml-0.5" />
            )}
          </div>
        </div>
      )}
      
      <div className="max-w-sm mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tinigom nato</h1>
          </div>
          
          {/* Right side - User Toggle and Refresh Button */}
          <div className="flex items-center gap-3">
            {/* User Toggle */}
            <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex-shrink-0">
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
                Nuone
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
                Kate
              </Button>
            </div>
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 flex-shrink-0 min-w-[40px] h-[40px] border border-gray-200"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
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
          
          {/* Motivational Quote under pie chart */}
          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-700 text-sm font-medium italic">"{motivationalQuote}"</p>
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e6f0ff' }}>
                  <span className="font-semibold" style={{ color: '#2c6fbb' }}>N</span>
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fde7f3' }}>
                  <span className="font-semibold" style={{ color: '#C11C84' }}>K</span>
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
                    <SelectItem value="withdrawal">W</SelectItem>
                    <SelectItem value="savings">S</SelectItem>
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
              <div className="flex justify-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      type="button"
                      className="flex items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <CalendarDays className={`h-8 w-8 transition-colors ${
                        filterDate ? "text-gray-700 hover:text-gray-900" : "text-gray-400 hover:text-gray-600"
                      }`} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <SimpleCalendar 
                      selectedDate={filterDate}
                      onSelectDate={setFilterDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {transactions.length > 0 ? (
            <>
              <div className="space-y-3">
                {getPaginatedTransactions().transactions.map((transaction) => (
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
              
              {/* Pagination Controls */}
              {(() => {
                const { totalPages, totalTransactions } = getPaginatedTransactions()
                if (totalPages > 1) {
                  return (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <p className="text-gray-500 text-xs">
                        {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''} total
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="text-gray-600 hover:text-gray-900 px-2 py-1 text-sm"
                        >
                          ←
                        </Button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm ${
                              currentPage === pageNum
                                ? "bg-green-600 text-white"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {pageNum}
                          </Button>
                        ))}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="text-gray-600 hover:text-gray-900 px-2 py-1 text-sm"
                        >
                          →
                        </Button>
                      </div>
                    </div>
                  )
                }
                return null
              })()}
            </>
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
      )}
    </>
  )
}