'use client'

import { useState } from 'react'

type Article = {
  title: string
  description: string
  link: string
  imageUrl: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [firecrawlArticles, setFirecrawlArticles] = useState<Article[]>([])
  const [gptArticles, setGptArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  const fetchArticles = async () => {
    if (!url) return
    setLoading(true)

    try {
      // 🔥 1. Appel Firecrawl
      const firecrawlRes = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const firecrawlData = await firecrawlRes.json()
      setFirecrawlArticles(firecrawlData)

      // 🤖 2. Appel GPT web search
      const gptRes = await fetch('/api/gptsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const gptData = await gptRes.json()
      setGptArticles(gptData)
    } catch (err) {
      console.error('❌ Error while fetching articles:', err)
    }

    setLoading(false)
  }

  return (
    <main className='p-8 max-w-7xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>📰 Blog Article Extractor</h1>

      <input
        type='text'
        placeholder='Paste blog URL...'
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className='w-full border px-4 py-2 rounded mb-4'
      />

      <button
        onClick={fetchArticles}
        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
      >
        Compare Results
      </button>

      {loading && <p className='mt-4'>Loading...</p>}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
        {/* 🔥 Firecrawl Results */}
        <div>
          <h2 className='text-xl font-semibold mb-4'>🔥 Firecrawl Results</h2>
          {firecrawlArticles.map((article, index) => (
            <div key={index} className='border rounded shadow-sm p-4 mb-4'>
              <h3 className='font-bold text-lg'>{article.title}</h3>
              <p className='text-sm text-gray-600'>{article.description}</p>
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className='w-full h-48 object-cover rounded mt-2'
                />
              )}
              <a
                href={article.link}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 underline block mt-2'
              >
                Read more →
              </a>
            </div>
          ))}
        </div>

        {/* 🤖 GPT Web Search Results */}
        <div>
          <h2 className='text-xl font-semibold mb-4'>🤖 GPT Web Search Results</h2>
          {gptArticles.map((article, index) => (
            <div key={index} className='border rounded shadow-sm p-4 mb-4'>
              <h3 className='font-bold text-lg'>{article.title}</h3>
              <p className='text-sm text-gray-600'>{article.description}</p>
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className='w-full h-48 object-cover rounded mt-2'
                />
              )}
              <a
                href={article.link}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 underline block mt-2'
              >
                Read more →
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
