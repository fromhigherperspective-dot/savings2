import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Check if we have a valid cached quote
    const { data: cachedQuotes, error: fetchError } = await supabase
      .from('motivational_quotes')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Error fetching cached quote:', fetchError)
    }

    // If we have a valid cached quote, return it
    if (cachedQuotes && cachedQuotes.length > 0) {
      return NextResponse.json({ 
        quote: cachedQuotes[0].quote,
        cached: true,
        expires_at: cachedQuotes[0].expires_at
      })
    }

    // No valid cached quote, generate a new one
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      // Fallback to default quote if no API key
      return NextResponse.json({ 
        quote: 'Wealth begins where impulse ends.',
        cached: false,
        fallback: true
      })
    }

    // Get savings progress
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type, user')

    const { data: settings } = await supabase
      .from('settings')
      .select('savings_goal')
      .single()

    const totalSavings = (transactions || []).reduce((sum, t) => {
      return sum + (t.type === 'withdrawal' ? -t.amount : t.amount)
    }, 0)

    const savingsGoal = settings?.savings_goal || 150000
    const progressPercentage = Math.min((totalSavings / savingsGoal) * 100, 100)

    // Simple alternating: use timestamp to determine user (every 6 hours)
    const isNuoneTurn = Math.floor(Date.now() / (6 * 60 * 60 * 1000)) % 2 === 0
    const targetUser = isNuoneTurn ? 'Nuone' : 'Kate'

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = targetUser === 'Nuone' 
      ? `Generate a deeply meaningful and motivational savings quote for Nuone that addresses both financial and mental wellness.
        
        Context:
        - They are ${progressPercentage.toFixed(1)}% toward their savings goal
        
        Requirements:
        - Maximum 12-15 words for meaningful impact
        - Include "Nuone" naturally in the quote
        - Mature, wise, motivational tone
        - Include themes like: think twice before buying, do you really need that, mindful spending, mental health benefits of saving, delayed gratification, financial peace
        - Make it meaningful and thoughtful, not just about money
        - Reference progress or give practical wisdom
        - Examples: "Nuone, at ${Math.round(progressPercentage)}% - think twice, your peace depends on it" or "Nuone, do you really need that? Your future self will thank you" or "Nuone, saving improves mental health - you're ${Math.round(progressPercentage)}% proof!"
        
        Return ONLY the quote, nothing else.`
      : `Generate a deeply meaningful and motivational savings quote for Kate that addresses both financial and mental wellness.
        
        Context:
        - They are ${progressPercentage.toFixed(1)}% toward their savings goal
        
        Requirements:
        - Maximum 12-15 words for meaningful impact
        - Include "Kate" naturally in the quote
        - Gen Z girly tone but with depth and meaning
        - Include themes like: think twice before buying, do you really need that, mindful spending, mental health benefits of saving, self-care through saving
        - Mix Gen Z slang with meaningful advice
        - Reference progress or give practical wisdom
        - Examples: "Kate bestie, think twice before buying - your mental health at ${Math.round(progressPercentage)}% says yes!" or "Kate queen, do you really need that? Saving is self-care periodt!" or "Kate, mindful spending hits different - you're ${Math.round(progressPercentage)}% proof!"
        
        Return ONLY the quote, nothing else.`

    const result = await model.generateContent(prompt)
    const quote = result.response.text().trim().replace(/['"]/g, '')

    // Cache the new quote for 12 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 12)

    // Delete old quotes first
    await supabase
      .from('motivational_quotes')
      .delete()
      .lt('expires_at', new Date().toISOString())

    // Insert new quote
    const { error: insertError } = await supabase
      .from('motivational_quotes')
      .insert([
        {
          quote: quote,
          target_user: targetUser,
          expires_at: expiresAt.toISOString(),
        },
      ])

    if (insertError) {
      console.error('Error caching quote:', insertError)
      // Still return the generated quote even if caching fails
    }

    return NextResponse.json({ 
      quote: quote,
      cached: false,
      generated: true,
      expires_at: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Error generating quote:', error)
    
    // Fallback to default quote on any error
    return NextResponse.json({ 
      quote: 'Wealth begins where impulse ends.',
      cached: false,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}