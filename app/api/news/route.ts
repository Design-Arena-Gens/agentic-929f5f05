import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { apiKey, category } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: 'API key manquante' }, { status: 400 })
    }

    const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=fr&pageSize=5&apiKey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'ok' && data.articles) {
      const articles = data.articles
        .filter((article: any) => article.title && article.description)
        .map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt
        }))

      return NextResponse.json({ articles })
    } else {
      return NextResponse.json({ error: data.message || 'Erreur API' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
