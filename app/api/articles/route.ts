import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

function truncateMarkdown(md: string, maxLength: number): string {
  if (md.length <= maxLength) return md
  const truncated = md.slice(0, maxLength)
  const lastHeader = truncated.lastIndexOf('#')
  return truncated.slice(0, lastHeader)
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
          content: `You are an expert markdown parser. From the provided markdown, extract only valid blog articles. For each article, return a JSON object with the following structure:

{
  "title": "The title of the article",
  "description": "A short summary or intro",
  "link": "A direct link to the article",
  "imageUrl": "The image URL if available"
}

Exclude cookie banners, legal text, or irrelevant content. Only return a valid JSON array of articles.`,
        },
        {
          role: 'user',
          content: safeMarkdown,
        },
      ],
  
    })

    const parsed = chatResponse.choices[0]?.message?.content || '[]'
    const articles = JSON.parse(parsed)

    console.log('📰 Articles extracted:', articles)

    return NextResponse.json(articles)
  } catch (err) {
    console.error('❌ Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
