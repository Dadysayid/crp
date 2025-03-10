import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"

interface BlogCardProps {
  title: string;
  markdown: string;
}

export default function BlogCard({ title, markdown }: BlogCardProps) {
  return (
    <Card className="max-w-2xl mx-auto my-6 shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Article extrait via Firecrawl</CardDescription>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </CardContent>
    </Card>
  )
}
