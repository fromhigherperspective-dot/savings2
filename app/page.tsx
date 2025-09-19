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
  Menu,
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
    <div className="p-4 bg-gray-50">
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
  const [targetMonths, setTargetMonths] = useState<number>(0)
  const [targetStartDate, setTargetStartDate] = useState<Date | null>(null)

  const [filterType, setFilterType] = useState<"all" | "withdrawal" | "savings" | "income">("all")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [filterUser, setFilterUser] = useState<"all" | "Nuone" | "Kate">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullStart, setPullStart] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)



  // Motivational quotes state
  const [nuoneQuote, setNuoneQuote] = useState("Nuone, wealth begins where impulse ends.")
  const [kateQuote, setKateQuote] = useState("Kate bestie, mindful spending is self-care!")
  
  // 3-way animation state: 0 = Nuone quote, 1 = Success %, 2 = Kate quote
  const [currentView, setCurrentView] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Menu dropdown state
  const [showMenu, setShowMenu] = useState(false)
  
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
    const lastNavigation = localStorage.getItem('lastNavigation')
    const currentTime = Date.now()
    
    // Only show loading if more than 5 minutes have passed since last navigation
    // This prevents loading screen when navigating between app pages
    if (lastNavigation && currentTime - parseInt(lastNavigation) < 5 * 60 * 1000) {
      localStorage.setItem('lastNavigation', currentTime.toString())
      return false
    }
    
    // Show loading if it's first time or more than 5 minutes since last visit
    if (!lastServerStart || currentTime - parseInt(lastServerStart) > 5 * 60 * 1000) {
      localStorage.setItem('lastServerStart', currentTime.toString())
      localStorage.setItem('lastNavigation', currentTime.toString())
      return true
    }
    
    localStorage.setItem('lastNavigation', currentTime.toString())
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
        loadMotivationalQuotes()
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
      loadMotivationalQuotes()
      
      // Start activity tracking immediately
      updateActivity()
    }
    
    // Add activity listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true)
    })
    
    // Set up automatic quote generation every 4 hours
    const quoteInterval = setInterval(loadMotivationalQuotes, 4 * 60 * 60 * 1000) // 4 hours
    
    // Set up 3-way fade animation: Nuone quote → Success % → Kate quote → repeat
    const fadeInterval = setInterval(() => {
      setIsTransitioning(true)
      
      setTimeout(() => {
        setCurrentView(prev => (prev + 1) % 3) // Cycle through 0, 1, 2
        setIsTransitioning(false)
      }, 518) // 518ms fade out duration
      
    }, 7000) // 7 seconds
    
    return () => {
      clearInterval(quoteInterval)
      clearInterval(fadeInterval)
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
        setTargetMonths(data.settings?.target_months || 0)
        setTargetStartDate(data.settings?.target_start_date ? new Date(data.settings.target_start_date) : null)
      } else {
        console.error('Failed to load settings - using default')
        setSavingsGoal(150000) // Fallback to default
        setTargetMonths(0) // Fallback to 0
        setTargetStartDate(null) // Fallback to null
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setSavingsGoal(150000) // Fallback to default
      setTargetMonths(0) // Fallback to 0
      setTargetStartDate(null) // Fallback to null
    }
  }

  const loadMotivationalQuotes = async () => {
    try {
      // Add timestamp to force fresh quotes and prevent caching
      const timestamp = Date.now()
      const response = await fetch(`/api/motivational-quote?t=${timestamp}`)
      if (response.ok) {
        const data = await response.json()
        setNuoneQuote(data.nuoneQuote || "Nuone, wealth begins where impulse ends.")
        setKateQuote(data.kateQuote || "Kate bestie, mindful spending is self-care!")
        console.log('New quotes loaded:', { nuone: data.nuoneQuote, kate: data.kateQuote })
      } else {
        console.error('Failed to load motivational quotes - using defaults')
        setNuoneQuote("Nuone, wealth begins where impulse ends.")
        setKateQuote("Kate bestie, mindful spending is self-care!")
      }
    } catch (error) {
      console.error('Error loading motivational quotes:', error)
      setNuoneQuote("Nuone, wealth begins where impulse ends.")
      setKateQuote("Kate bestie, mindful spending is self-care!")
    }
  }

  // Refresh data function
  const refreshData = async () => {
    setRefreshing(true)
    try {
      // Always load new motivational quotes on refresh
      await Promise.all([loadTransactions(), loadSettings(), loadMotivationalQuotes()])
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
  
  // Calculate individual contribution percentages against the overall goal
  const nuoneContributionPercentage = savingsGoal > 0 ? (userTotals.Nuone / savingsGoal) * 100 : 0
  const kateContributionPercentage = savingsGoal > 0 ? (userTotals.Kate / savingsGoal) * 100 : 0
  
  // Calculate monthly saving rate and prediction based on current date
  const calculateSavingPrediction = () => {
    if (targetMonths === 0) return null
    
    const now = new Date()
    const remainingAmount = Math.max(0, savingsGoal - grandTotal)
    
    // Calculate how many months remain from today to reach the target date
    let remainingMonths = targetMonths
    
    if (targetStartDate) {
      // Calculate the target end date
      const targetEndDate = new Date(targetStartDate)
      targetEndDate.setMonth(targetEndDate.getMonth() + targetMonths)
      
      // Calculate months remaining from today to target end date
      const monthsDiff = (targetEndDate.getFullYear() - now.getFullYear()) * 12 + 
                        (targetEndDate.getMonth() - now.getMonth()) + 
                        (targetEndDate.getDate() - now.getDate()) / 30
      
      remainingMonths = Math.max(0, Math.round(monthsDiff * 10) / 10) // Round to 1 decimal
    } else {
      // If no start date is set, we can't calculate remaining months accurately
      // For now, we'll assume the full target duration remains
      // But ideally, user should set a new goal to get accurate calculations
      remainingMonths = targetMonths
    }
    
    if (remainingMonths <= 0) {
      return {
        requiredMonthlySaving: 0,
        currentMonthlySaving: 0,
        isAchievable: true,
        shortfall: 0,
        targetReached: true,
        remainingAmount,
        remainingMonths: 0
      }
    }
    
    const requiredMonthlySaving = remainingAmount / remainingMonths
    
    // Calculate current monthly saving rate (last 3 months average)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= threeMonthsAgo && t.type === 'income'
    )
    
    const recentSavings = recentTransactions.reduce((sum, t) => sum + t.amount, 0)
    const monthlyAverage = recentSavings / 3
    
    return {
      requiredMonthlySaving,
      currentMonthlySaving: monthlyAverage,
      isAchievable: monthlyAverage >= requiredMonthlySaving,
      shortfall: Math.max(0, requiredMonthlySaving - monthlyAverage),
      remainingAmount,
      remainingMonths,
      targetReached: remainingAmount <= 0
    }
  }
  
  const prediction = calculateSavingPrediction()
  
  // Calculate success likelihood based on current trends
  const calculateSuccessLikelihood = () => {
    if (!prediction || targetMonths === 0) return 50
    
    const currentProgress = (grandTotal / savingsGoal) * 100
    const timeElapsed = targetStartDate ? 
      ((new Date().getTime() - new Date(targetStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1
    const expectedProgressByNow = (timeElapsed / targetMonths) * 100
    
    // Calculate success likelihood based on current performance vs expected
    let successLikelihood = 50 // Base 50%
    
    if (currentProgress >= expectedProgressByNow) {
      // Ahead of schedule - higher likelihood
      const performanceRatio = currentProgress / Math.max(expectedProgressByNow, 1)
      successLikelihood = Math.min(95, 50 + (performanceRatio * 30))
    } else {
      // Behind schedule - lower likelihood
      const performanceRatio = currentProgress / Math.max(expectedProgressByNow, 1)
      successLikelihood = Math.max(15, 50 * performanceRatio)
    }
    
    // Factor in recent saving trends (last 3 months)
    if (prediction.currentMonthlySaving >= prediction.requiredMonthlySaving) {
      successLikelihood = Math.min(95, successLikelihood + 20)
    } else {
      successLikelihood = Math.max(10, successLikelihood - 15)
    }
    
    return Math.round(successLikelihood)
  }
  
  const successLikelihood = calculateSuccessLikelihood()
  
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpenses = transactions
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0)

  const addTransaction = async () => {
    const amount = prompt("Enter deposit amount (AED):")
    if (!amount || isNaN(parseFloat(amount))) return

    const description = prompt("Enter description (optional):")

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
          category: description || null,
          user: selectedUser,
        }),
      })

      if (response.ok) {
        await loadTransactions() // Reload transactions from database
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
    const amount = prompt("Enter withdrawal amount (AED):")
    if (!amount || isNaN(parseFloat(amount))) return

    const reason = prompt("Enter reason:")
    if (!reason) return

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
      <div className={`fixed inset-0 bg-gray-100 flex items-center justify-center z-50 transition-opacity duration-1000 ease-out ${loadingFadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center">
          {/* App title - clean and static */}
          <div className="space-y-1 mb-4 text-center">
            <h1 className="text-3xl font-light text-black tracking-wide text-center">Tinigom Nato</h1>
            <p className="text-gray-500 text-sm font-light text-center">Loading your savings journey</p>
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center items-center space-x-2">
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
      className="min-h-screen bg-gray-100 p-4"
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
          className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 bg-gray-50 rounded-full shadow-lg p-3 transition-all duration-200"
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
            <h1 className="text-xl font-bold text-gray-900">Tinigom Nato</h1>
          </div>
          
          {/* Right side - User Toggle and Refresh Button */}
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
                        window.location.href = '/invoice'
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Create Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Card - Moved to top */}
        <div className="financial-card">
          <div className="mb-6">
            <div className="flex items-end justify-between">
              <div style={{ gap: '2px' }} className="flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 leading-tight">Savings Goal</h3>
                <p className="text-gray-600 text-sm leading-tight">Track your progress</p>
              </div>
              {selectedUser === "Nuone" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                  const newGoal = prompt("Enter new savings goal:", savingsGoal.toString())
                  if (newGoal && !isNaN(parseFloat(newGoal))) {
                    const newMonths = prompt("Enter target months (e.g., 12) or leave empty:", targetMonths > 0 ? targetMonths.toString() : "")
                    setLoading(true)
                    try {
                      const targetStartDateToSave = new Date() // Set start date as today when setting new goal
                      
                      const response = await fetch('/api/settings', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          savings_goal: parseFloat(newGoal),
                          target_months: newMonths && !isNaN(parseInt(newMonths)) ? parseInt(newMonths) : null,
                          target_start_date: newMonths && !isNaN(parseInt(newMonths)) ? targetStartDateToSave.toISOString() : null,
                        }),
                      })

                      if (response.ok) {
                        setSavingsGoal(parseFloat(newGoal))
                        setTargetMonths(newMonths && !isNaN(parseInt(newMonths)) ? parseInt(newMonths) : 0)
                        setTargetStartDate(newMonths && !isNaN(parseInt(newMonths)) ? targetStartDateToSave : null)
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
          </div>
          
          <div className="flex items-center justify-center">
            <CircularProgress percentage={savingsProgress} />
          </div>
          
          {/* Target and Prediction Info */}
          {(targetMonths > 0 || prediction) && (
            <div className="text-center mt-3">
              <div className="text-xs text-gray-600" style={{ fontSize: '0.715rem' }}>
                {prediction && prediction.remainingMonths > 0 && `${prediction.remainingMonths} months left`}
                {prediction && prediction.remainingMonths > 0 && ' | '}
                {prediction && !prediction.targetReached && (
                  <span className={prediction.isAchievable ? 'text-green-600' : 'text-orange-600'}>
                    Need AED {Math.round(prediction.requiredMonthlySaving).toLocaleString()}/month
                  </span>
                )}
                {prediction && prediction.targetReached && (
                  <span className="text-green-600">Target Reached!</span>
                )}
              </div>
            </div>
          )}
          
          {/* 3-Way Cycling: Nuone Quote → Success % → Kate Quote */}
          <div className="text-center mt-4 pt-4 border-t border-gray-100 relative h-12 flex items-center justify-center">
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[518ms] ease-in-out ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {currentView === 0 && (
                <p className="text-gray-700 text-sm font-medium italic">"{nuoneQuote}"</p>
              )}
              {currentView === 1 && (
                <p className="text-gray-700 text-sm font-medium italic">
                  {targetMonths > 0 ? `${successLikelihood}% chance of reaching goal by target date` : 'Set a target timeline to see success likelihood'}
                </p>
              )}
              {currentView === 2 && (
                <p className="text-gray-700 text-sm font-medium italic">"{kateQuote}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Main Balance Card */}
        <div className="financial-card py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-600 text-sm">Total Savings</p>
              <h2 className="text-xl font-bold text-gray-900">AED {grandTotal.toLocaleString()}</h2>
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
            <p className="text-lg font-bold text-gray-900">AED {totalIncome.toLocaleString()}</p>
          </div>

          <div className="financial-card">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-100 p-2 rounded-xl">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-red-600 text-sm font-medium">-AED 0</span>
            </div>
            <p className="text-gray-600 text-sm">Total Expenses</p>
            <p className="text-lg font-bold text-gray-900">AED {totalExpenses.toLocaleString()}</p>
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
                  <p className="text-gray-600 text-sm">{Math.round(nuoneContributionPercentage)}% contributed</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">AED {userTotals.Nuone.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fde7f3' }}>
                  <span className="font-semibold" style={{ color: '#C11C84' }}>K</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Kate</p>
                  <p className="text-gray-600 text-sm">{Math.round(kateContributionPercentage)}% contributed</p>
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">AED {userTotals.Kate.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={addTransaction}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center"
            style={{ paddingRight: '1.75rem' }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Deposit
          </Button>
          <Button
            onClick={addWithdrawal}
            variant="outline"
            className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
            style={{ paddingRight: '1.75rem' }}
          >
            <ArrowDownRight className="mr-2 h-5 w-5" />
            Withdraw
          </Button>
        </div>

        {/* Recent Transactions - Always show filters */}
        <div className="financial-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          
          {/* Filters with separator line */}
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
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
            <hr className="border-gray-200" />
          </div>
          
          {transactions.length > 0 ? (
            <>
              <div className="space-y-0">
                {getPaginatedTransactions().transactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <div className="flex items-center justify-between px-0" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTransaction(transaction.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {index < getPaginatedTransactions().transactions.length - 1 && (
                      <hr className="border-gray-200" />
                    )}
                  </React.Fragment>
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


    </div>
      )}
    </>
  )
}