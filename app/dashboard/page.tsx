"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, Menu, ArrowLeft, Plus, Check, Trash2 } from "lucide-react"

interface Todo {
  id: string
  text: string
  completed: boolean
  assignedTo: "N" | "K"
  createdAt: Date
}

export default function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [selectedPerson, setSelectedPerson] = useState<"N" | "K">("N")

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('dashboardTodos')
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        }))
        setTodos(parsedTodos)
      } catch (error) {
        console.error('Error loading todos:', error)
      }
    }
  }, [])

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('dashboardTodos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (newTodoText.trim() === "") return
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      assignedTo: selectedPerson,
      createdAt: new Date()
    }
    
    setTodos(prev => [newTodo, ...prev])
    setNewTodoText("")
  }

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    // Placeholder refresh function
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-sm mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-2 flex-shrink-0 min-w-[40px] h-[40px] border border-gray-200"
              title="Back to main page"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">To do list</h1>
            </div>
          </div>
          
          {/* Right side - Refresh Button and Menu */}
          <div className="flex items-center gap-3">
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

        {/* Todo Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="financial-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todos.filter(t => t.completed).length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
          <div className="financial-card">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{todos.filter(t => !t.completed).length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="financial-card">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h2>
            
            {/* Add new todo */}
            <div className="flex gap-2 mb-4 items-center">
              <Input
                type="text"
                placeholder="Add a new task..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              
              {/* Person selector - smaller */}
              <div className="bg-gray-50 rounded-xl p-0.5 shadow-sm border border-gray-200 flex-shrink-0">
                <div className="flex">
                  <Button
                    variant={selectedPerson === "N" ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-all h-8 ${
                      selectedPerson === "N"
                        ? "text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    style={selectedPerson === "N" ? { backgroundColor: '#2c6fbb' } : {}}
                    onClick={() => setSelectedPerson("N")}
                  >
                    N
                  </Button>
                  <Button
                    variant={selectedPerson === "K" ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition-all h-8 ${
                      selectedPerson === "K"
                        ? "text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    style={selectedPerson === "K" ? { backgroundColor: '#C11C84' } : {}}
                    onClick={() => setSelectedPerson("K")}
                  >
                    K
                  </Button>
                </div>
              </div>
              
              <Button
                onClick={addTodo}
                className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Todo list */}
          {todos.length > 0 ? (
            <div className="space-y-0">
              {todos.map((todo, index) => (
                <>
                  <div 
                    key={todo.id} 
                    className="flex items-start justify-between px-0 min-h-[40px]" 
                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors flex-shrink-0 mt-0.5 ${
                          todo.completed 
                            ? 'bg-green-600 border-green-600 text-white' 
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {todo.completed && <Check className="h-3 w-3" />}
                      </button>
                      
                      <div className="flex-1 min-w-0 pr-3">
                        <span 
                          className={`block break-words ${
                            todo.completed 
                              ? 'text-gray-500 line-through' 
                              : 'text-gray-900'
                          }`}
                          style={{ 
                            wordWrap: 'break-word', 
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            hyphens: 'auto'
                          }}
                        >
                          {todo.text}
                        </span>
                      </div>
                      
                      {/* Person indicator */}
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                        style={{ 
                          backgroundColor: todo.assignedTo === 'N' ? '#2c6fbb' : '#C11C84' 
                        }}
                      >
                        {todo.assignedTo}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 h-6 w-6 flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {index < todos.length - 1 && (
                    <hr className="border-gray-200" />
                  )}
                </>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks yet. Add one above to get started!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}