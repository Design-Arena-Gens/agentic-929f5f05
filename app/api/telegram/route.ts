import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { botToken, chatId, articles } = await request.json()

    if (!botToken || !chatId || !articles) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const results = []

    for (const article of articles) {
      const message = `📰 *${article.title}*\n\n${article.description}\n\n🔗 [Lire l'article](${article.url})\n📌 Source: ${article.source}`

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`

      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false
        })
      })

      const data = await response.json()

      if (data.ok) {
        results.push({ success: true, article: article.title })
      } else {
        results.push({ success: false, article: article.title, error: data.description })
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const allSuccess = results.every(r => r.success)

    return NextResponse.json({
      success: allSuccess,
      results,
      message: allSuccess ? 'Tous les articles ont été envoyés' : 'Certains articles n\'ont pas pu être envoyés'
    })
  } catch (error) {
    console.error('Error sending to Telegram:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
