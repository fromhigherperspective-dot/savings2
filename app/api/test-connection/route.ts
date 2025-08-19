import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Environment variables not set',
        details: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
        instructions: [
          'Create a .env.local file',
          'Add NEXT_PUBLIC_SUPABASE_URL=your-supabase-url',
          'Add NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key',
          'Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api'
        ]
      }, { status: 400 })
    }

    // Test 2: Check database connection
    const { data: transactionCount, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: countError.message,
        suggestions: countError.message.includes('relation "transactions" does not exist') 
          ? ['Run the SQL schema from supabase-schema.sql in your Supabase SQL Editor']
          : ['Check your Supabase URL and API key', 'Verify your Supabase project is active']
      }, { status: 500 })
    }

    // Test 3: Check settings table
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single()

    // Test 4: Test write permissions with a dummy record
    const testData = {
      amount: 0.01,
      type: 'income',
      category: 'Connection Test',
      user: 'Nuone',
      date: new Date().toISOString()
    }

    const { data: testInsert, error: insertError } = await supabase
      .from('transactions')
      .insert([testData])
      .select()
      .single()

    let writePermissions = true
    if (insertError) {
      writePermissions = false
    } else {
      // Clean up test record
      await supabase.from('transactions').delete().eq('id', testInsert.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      details: {
        url: supabaseUrl,
        keyPreview: `${supabaseKey.substring(0, 20)}...`,
        transactionTableExists: !countError,
        settingsTableExists: !settingsError,
        writePermissions,
        currentSavingsGoal: settings?.savings_goal || 'Not set',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


