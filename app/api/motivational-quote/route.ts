import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      // Fallback to default quotes if no API key
      return NextResponse.json({ 
        nuoneQuote: 'Nuone, wealth begins where impulse ends.',
        kateQuote: 'Kate bestie, mindful spending is self-care!',
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

    // Get last 10 quotes for each user to avoid repetition
    const { data: lastNuoneQuotes } = await supabase
      .from('motivational_quotes')
      .select('quote')
      .eq('target_user', 'Nuone')
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: lastKateQuotes } = await supabase
      .from('motivational_quotes')
      .select('quote')
      .eq('target_user', 'Kate')
      .order('created_at', { ascending: false })
      .limit(10)

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Get individual contribution percentages
    const nuoneContributionPercentage = savingsGoal > 0 ? ((transactions || [])
      .filter(t => t.user === 'Nuone')
      .reduce((sum, t) => sum + (t.type === 'withdrawal' ? -t.amount : t.amount), 0) / savingsGoal) * 100 : 0

    // Generate Nuone's quote (completely independent)
    const nuonePrompt = `Here's the person's name: Nuone
Their individual contribution: ${nuoneContributionPercentage.toFixed(1)}% of the overall goal
Overall savings goal: AED ${savingsGoal.toLocaleString()}

${lastNuoneQuotes && lastNuoneQuotes.length > 0 ? `Previous quotes generated (avoid anything similar to these):
${lastNuoneQuotes.map((q, i) => `${i + 1}. "${q.quote}"`).join('\n')}

Create something completely different from all of the above.` : 'This is the first quote generation.'}

Your Task: Create a motivational quote about saving money that sounds mature, masculine, and fact-based, as if it comes from a book or a well-known financial expert.

Requirements:
- The quote must sound realistic and practical, not cheesy or overly generic.
- Use Nuone's name within the quote, it doesn't always has to be in the start of the quote, you can incorporate it in the middle of the quote too.
- The quote should include financial wisdom or practical advice about saving.
- The quote must be 10 words long or below 10 words (count carefully).
- Do not use hashtags, emojis, or special symbols.
- The tone should feel like trusted advice from a successful person or book.
- The motivational advice has to be like from a friend.
- Refer to books like these, Richest Man in Babylon by George S. Clason, Rich Dad Poor Dad by Robert Kiyosaki, I Will Teach You to Be Rich by Ramit Sethi.

Examples:
1. "Nuone, every dirham saved today multiplies your freedom tomorrow."
2. "Discipline builds wealth; Nuone, consistency beats high income always."
3. "Nuone, saving first secures wealth; spending later creates peace."
4. "Small sacrifices grow fortunes, Nuone; ${nuoneContributionPercentage.toFixed(1)}% shows strong resolve."
5. "Nuone, steady progress turns AED ${savingsGoal.toLocaleString()} from dream to reality."`

    // Get Kate's individual contribution percentage
    const kateContributionPercentage = savingsGoal > 0 ? ((transactions || [])
      .filter(t => t.user === 'Kate')
      .reduce((sum, t) => sum + (t.type === 'withdrawal' ? -t.amount : t.amount), 0) / savingsGoal) * 100 : 0

    // Generate Kate's quote (completely independent)
    const katePrompt = `Here's the person's name: Kate
Their individual contribution: ${kateContributionPercentage.toFixed(1)}% of the overall goal
Overall savings goal: AED ${savingsGoal.toLocaleString()}

${lastKateQuotes && lastKateQuotes.length > 0 ? `Previous quotes generated (avoid anything similar to these):
${lastKateQuotes.map((q, i) => `${i + 1}. "${q.quote}"`).join('\n')}

Create something completely different from all of the above.` : 'This is the first quote generation.'}

Create a motivational, money-saving quote specifically for Kate, aimed at encouraging her to save money and resist impulsive spending. The quote should:

Be exactly 10 words.
- Include Kate's name somewhere in the quote (doesn't have to be first).
- Use modern Gen Z slang, trendy language, and emotional appeal to feel fun, relatable, and empowering.
- Highlight the value of delayed gratification, showing that instant rewards are often illusions.
- Sound realistic and practical, like advice Kate could actually follow, not cheesy or generic.
- Avoid hashtags, emojis, or special symbols.
- Maintain a light, girly, and inspiring tone, motivating Kate to take control of her money today for a better future.
- Think of it as a tiny pep talk Kate could read and feel motivated immediately, while still keeping it trendy and relatable.
- Use Gen Z Slang words.

Examples:
"Kate, skip the vibe splurge now, glow later stays unmatched."
"Delayed flex, Kate. Real queens budget today, slay tomorrow."
"Kate, don't chase mid thrills, secure that iconic future."
"Hold up Kate, instant drip fades, long-term slay hits different."
"Kate, keep it low-key now, future you screams main character."`

    // Generate both quotes simultaneously
    const [nuoneResult, kateResult] = await Promise.all([
      model.generateContent(nuonePrompt),
      model.generateContent(katePrompt)
    ])

    const nuoneQuote = nuoneResult.response.text().trim().replace(/['"]/g, '')
    const kateQuote = kateResult.response.text().trim().replace(/['"]/g, '')

    // Store both quotes
    const currentTime = new Date().toISOString()
    
    const { error: insertError } = await supabase
      .from('motivational_quotes')
      .insert([
        {
          quote: nuoneQuote,
          target_user: 'Nuone',
          created_at: currentTime,
        },
        {
          quote: kateQuote,
          target_user: 'Kate',
          created_at: currentTime,
        }
      ])

    if (insertError) {
      console.error('Error storing quotes:', insertError)
      // Still return the generated quotes even if storing fails
    }

    return NextResponse.json({ 
      nuoneQuote: nuoneQuote,
      kateQuote: kateQuote,
      generated: true,
      created_at: currentTime
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