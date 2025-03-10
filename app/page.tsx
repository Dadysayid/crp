'use client'

import BlogCard from "@/components/blog";
import { useEffect, useState } from "react"


export default function Home() {
  const [data, setData] = useState<{ title: string; markdown: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/scrap", { method: "POST" })
      const json = await res.json()
      console.log("🔥 Données finales :", json)

      if (json.success && json.data?.markdown) {
        setData({
          title: json.metadata?.title || "Article sans titre",
          markdown: json.data.markdown,
        })
      }
    }

    fetchData()
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Blog Scraper</h1>
      {data ? (
        <BlogCard title={data.title} markdown={data.markdown} />
      ) : (
        <p>Chargement...</p>
      )}
    </main>
  )
}
