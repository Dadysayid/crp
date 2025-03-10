import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ',
      },
      body: JSON.stringify({
        url: 'https://softwaremind.com/blog/why-companies-choose-hybrid-cloud-and-how-they-keep-it-secure/',
        formats: ['markdown'],
      }),
    })

    const data = await response.json()
    console.log('🧠 Données reçues de Firecrawl :', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Erreur dans la requête Firecrawl :', error)
    return NextResponse.json({ error: 'Erreur Firecrawl' }, { status: 500 })
  }
}
