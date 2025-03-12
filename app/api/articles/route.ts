import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

function truncateMarkdown(md: string, maxLength: number): string {
  if (md.length <= maxLength) return md
  const truncated = md.slice(0, maxLength)
  const lastHeader = truncated.lastIndexOf('#')
  return truncated.slice(0, lastHeader)
}

type Article = {
  title: string
  description: string
  link: string
  imageUrl: string
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  console.log('📡 URL received from frontend:', url)

  try {
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
      }),
    })

    const firecrawlData = await firecrawlRes.json()
    const markdown = firecrawlData?.data?.markdown || ''
    console.log('📝 Markdown length:', markdown.length)

    const safeMarkdown = truncateMarkdown(markdown, 18000)

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert markdown parser. You will receive raw markdown content from a blog page.

Your goal is to extract only real blog articles and ignore irrelevant content. For each blog post, return an object with:

{
  "title": "The title of the article",
  "description": "A short summary (2–3 lines)",
  "link": "A direct URL to the article (if available)",
  "imageUrl": "An image URL related to the article (if available)"
}

✅ Include only relevant blog articles.  
❌ Exclude cookie banners, legal mentions, privacy info, newsletter sections, contact forms, and unrelated site content.

⚠️ Return a **clean JSON array only**, nothing else.  
Do not wrap in markdown. Do not explain. Do not include any text outside the JSON.`,
        },
        {
          role: 'user',
          content: safeMarkdown,
        },
      ],
    })

    const raw = chatResponse.choices[0]?.message?.content || '[]'
    console.log('📤 Raw GPT response:', raw)

    const cleanJson = raw
      .trim()
      .replace(/^```json/, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim()

    let articles: Article[] = []

    if (cleanJson.startsWith('[') && cleanJson.endsWith(']')) {
      try {
        articles = JSON.parse(cleanJson)
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError)
        console.error('🔍 Cleaned GPT response:', cleanJson)
        return NextResponse.json(
          { error: 'Invalid JSON format from GPT (Firecrawl).' },
          { status: 500 }
        )
      }
    } else {
      console.warn('⚠️ GPT did not return a JSON array.')
      articles = []
    }

    console.log('📰 Articles extracted:', articles)
    return NextResponse.json(articles)
  } catch (err) {
    console.error('❌ Firecrawl or GPT error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
