/**
 * Database Connection Test Script
 * Run this to verify your Supabase connection is working
 * Usage: node scripts/test-db-connection.js
 */

const { createClient } = require('@supabase/supabase-js')

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`)
}

async function testDatabaseConnection() {
  log(colors.blue + colors.bold, '\n🔍 Testing Supabase Database Connection...\n')

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    log(colors.red, '❌ Environment variables not found!')
    log(colors.yellow, '\nPlease create a .env.local file with:')
    log(colors.yellow, 'NEXT_PUBLIC_SUPABASE_URL=your-supabase-url')
    log(colors.yellow, 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
    log(colors.yellow, '\nGet these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
    return
  }

  log(colors.green, '✅ Environment variables found')
  log(colors.blue, `📍 URL: ${supabaseUrl}`)
  log(colors.blue, `🔑 Key: ${supabaseKey.substring(0, 20)}...`)

  // Test connection
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    log(colors.blue, '\n🔌 Testing connection...')

    // Test 1: Check if we can connect
    const { data, error } = await supabase.from('transactions').select('count', { count: 'exact' })
    
    if (error) {
      log(colors.red, `❌ Connection failed: ${error.message}`)
      
      if (error.message.includes('relation "transactions" does not exist')) {
        log(colors.yellow, '\n⚠️  Database schema not set up!')
        log(colors.yellow, 'Please run the SQL from supabase-schema.sql in your Supabase SQL Editor')
      } else if (error.message.includes('Invalid API key')) {
        log(colors.yellow, '\n⚠️  Invalid API key!')
        log(colors.yellow, 'Please check your NEXT_PUBLIC_SUPABASE_ANON_KEY')
      } else if (error.message.includes('Invalid URL')) {
        log(colors.yellow, '\n⚠️  Invalid URL!')
        log(colors.yellow, 'Please check your NEXT_PUBLIC_SUPABASE_URL')
      }
      return
    }

    log(colors.green, '✅ Successfully connected to database!')
    log(colors.green, `📊 Transactions table exists with ${data.length > 0 ? data[0].count : 0} records`)

    // Test 2: Check settings table
    log(colors.blue, '\n🔧 Testing settings table...')
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (settingsError) {
      log(colors.red, `❌ Settings table error: ${settingsError.message}`)
      if (settingsError.message.includes('relation "settings" does not exist')) {
        log(colors.yellow, '⚠️  Settings table not found - please run the schema SQL')
      }
    } else {
      log(colors.green, '✅ Settings table working!')
      log(colors.green, `💰 Current savings goal: ${settings.savings_goal}`)
    }

    // Test 3: Try to insert a test record (and delete it)
    log(colors.blue, '\n🧪 Testing write permissions...')
    const testTransaction = {
      amount: 1.00,
      type: 'income',
      category: 'Connection Test',
      user: 'Nuone',
      date: new Date().toISOString()
    }

    const { data: inserted, error: insertError } = await supabase
      .from('transactions')
      .insert([testTransaction])
      .select()
      .single()

    if (insertError) {
      log(colors.red, `❌ Write test failed: ${insertError.message}`)
    } else {
      log(colors.green, '✅ Write permissions working!')
      
      // Clean up test record
      await supabase.from('transactions').delete().eq('id', inserted.id)
      log(colors.green, '🧹 Test record cleaned up')
    }

    log(colors.green + colors.bold, '\n🎉 Database connection is fully working!')
    log(colors.blue, '🚀 Your app is ready for deployment!')

  } catch (err) {
    log(colors.red, `❌ Unexpected error: ${err.message}`)
  }
}

// Run the test
testDatabaseConnection().catch(console.error)


