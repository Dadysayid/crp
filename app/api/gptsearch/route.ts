import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

type Article = {
  title: string
  description: string
  link: string
  imageUrl: string
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  console.log('🌐 URL reçue:', url)

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const systemPrompt = `
You are a web researcher. You will receive a URL.
Your job is to extract useful articles or blog posts from that page using web search and return them as a clean JSON array.
Each item must follow this format:

{
  "title": "Title of the article",
  "description": "A short summary",
  "link": "A direct link to the article",
  "imageUrl": "The URL of the image if any"
}

⚠️ Very important: ONLY return the JSON array, without any explanations, no markdown formatting, no triple backticks, and no comments.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-search-preview',
      web_search_options: {},
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract articles from this URL: ${url}` },
      ],
    })

    const raw = completion.choices[0].message.content || '[]'

    // 🧼 Nettoyer les ```json et ``` éventuels
    const cleanJson = raw
      .trim()
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim()

    let articles: Article[] = []

    try {
      articles = JSON.parse(cleanJson)
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError)
      console.error('🔍 Raw GPT response:', raw)
      return NextResponse.json(
        { error: 'Invalid JSON format from GPT.' },
        { status: 500 }
      )
    }

    console.log('📰 Articles from GPT:', articles)

    return NextResponse.json(articles)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error in GPT scrape:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Unknown error occurred.' },
      { status: 500 }
    )
  }
}
