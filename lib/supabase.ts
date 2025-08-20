import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'savings' | 'withdrawal'
  category?: string
  reason?: string
  user: 'Nuone' | 'Kate'
  date: string
  created_at?: string
}

export interface Settings {
  id: number
  savings_goal: number
  updated_at?: string
}

export interface MotivationalQuote {
  id: string
  quote: string
  target_user: 'Nuone' | 'Kate'
  quote_number: number
  created_at?: string
  expires_at: string
}