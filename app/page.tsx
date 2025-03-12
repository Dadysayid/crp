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
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)

  const fetchArticles = async () => {
    setLoading(true)
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    const data = await res.json()
    console.log('📥 Articles from GPT:', data)
    setArticles(data)
    setLoading(false)
  }

  return (
    <main className='p-8 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-4'>Blog Article Scraper</h1>

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
        Scrape Blog
      </button>

      {loading && <p className='mt-4'>Loading...</p>}

      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
        {articles.map((article, index) => (
          <div key={index} className='border rounded shadow-sm p-4'>
            <h2 className='font-bold text-lg'>{article.title}</h2>
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
    </main>
  )
}
