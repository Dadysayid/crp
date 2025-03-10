import { NextRequest, NextResponse } from 'next/server'

// ✅ Type pour un article retourné
type Article = {
  title: string
  description: string
  link: string
  imageUrl: string
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  console.log('📡 URL reçue du front:', url)

  try {
    
    const firecrawlLinksRes = await fetch(
      'https://api.firecrawl.dev/v1/scrape',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          url,
          formats: ['links'],
        }),
      }
    )

    const firecrawlLinks = await firecrawlLinksRes.json()
    const links: string[] = firecrawlLinks?.data?.links || []

    console.log('🔗 Liens récupérés :', links)

    const articles: Article[] = []

  
    for (const link of links.slice(0, 10)) {
      const metaRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          url: link,
          formats: ['html'],
        }),
      })

      const metaData = await metaRes.json()
      const meta = metaData?.data?.metadata

      if (meta?.title) {
        articles.push({
          title: meta.title,
          description: meta.description || '',
          link,
          imageUrl: meta['og:image'] || '',
        })
      }
    }

    console.log('📰 Articles trouvés :', articles)

    return NextResponse.json(articles)
  } catch (error) {
    console.error('❌ Firecrawl error:', error)
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 })
  }
}
