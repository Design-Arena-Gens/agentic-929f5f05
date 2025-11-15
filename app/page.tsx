'use client'

import { useState, useEffect } from 'react'

interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
}

interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error'
}

export default function Home() {
  const [botToken, setBotToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [newsApiKey, setNewsApiKey] = useState('')
  const [category, setCategory] = useState('technology')
  const [interval, setInterval] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<{ type: string; message: string } | null>(null)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { time, message, type }].slice(-50))
  }

  const fetchNews = async () => {
    try {
      addLog('Recherche de nouvelles news...', 'info')
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newsApiKey, category })
      })

      const data = await response.json()

      if (data.articles && data.articles.length > 0) {
        setNews(data.articles)
        addLog(`${data.articles.length} articles trouvés`, 'success')
        return data.articles
      } else {
        addLog('Aucun nouvel article trouvé', 'info')
        return []
      }
    } catch (error) {
      addLog(`Erreur lors de la recherche: ${error}`, 'error')
      return []
    }
  }

  const sendToTelegram = async (articles: NewsArticle[]) => {
    try {
      addLog('Envoi vers Telegram...', 'info')
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId, articles })
      })

      const data = await response.json()

      if (data.success) {
        addLog(`✓ ${articles.length} articles envoyés sur Telegram`, 'success')
        setStatus({ type: 'success', message: `${articles.length} articles publiés avec succès!` })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      addLog(`✗ Erreur Telegram: ${error}`, 'error')
      setStatus({ type: 'error', message: `Erreur: ${error}` })
    }
  }

  const runAgent = async () => {
    if (!botToken || !chatId || !newsApiKey) {
      setStatus({ type: 'error', message: 'Veuillez remplir tous les champs' })
      return
    }

    const articles = await fetchNews()
    if (articles.length > 0) {
      await sendToTelegram(articles)
    }
  }

  const startAgent = () => {
    if (!botToken || !chatId || !newsApiKey) {
      setStatus({ type: 'error', message: 'Veuillez remplir tous les champs' })
      return
    }

    setIsRunning(true)
    addLog('🤖 Agent démarré', 'success')
    setStatus({ type: 'success', message: 'Agent démarré - recherche automatique activée' })
    runAgent()
  }

  const stopAgent = () => {
    setIsRunning(false)
    addLog('Agent arrêté', 'info')
    setStatus({ type: 'info', message: 'Agent arrêté' })
  }

  useEffect(() => {
    if (!isRunning) return

    const executeAgent = async () => {
      await runAgent()
    }

    executeAgent()
    // @ts-ignore
    const timer = setInterval(executeAgent, interval * 60 * 1000)
    // @ts-ignore
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, interval])

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 Agent de News Telegram</h1>
        <p>Recherche automatique de news et publication sur Telegram</p>
      </div>

      <div className="card">
        <h2>Configuration</h2>
        <div className="config-form">
          <div className="form-group">
            <label>Token du Bot Telegram</label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            />
          </div>

          <div className="form-group">
            <label>Chat ID Telegram</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-1001234567890"
            />
          </div>

          <div className="form-group">
            <label>Clé API News (NewsAPI.org)</label>
            <input
              type="text"
              value={newsApiKey}
              onChange={(e) => setNewsApiKey(e.target.value)}
              placeholder="votre_cle_api_newsapi"
            />
          </div>

          <div className="form-group">
            <label>Catégorie de News</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="technology">Technologie</option>
              <option value="business">Business</option>
              <option value="science">Science</option>
              <option value="health">Santé</option>
              <option value="sports">Sports</option>
              <option value="entertainment">Divertissement</option>
              <option value="general">Général</option>
            </select>
          </div>

          <div className="form-group">
            <label>Intervalle de recherche (minutes)</label>
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              min="5"
              placeholder="60"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn"
              onClick={startAgent}
              disabled={isRunning}
            >
              {isRunning ? '✓ Agent en cours' : 'Démarrer l\'agent'}
            </button>

            <button
              className="btn btn-secondary"
              onClick={stopAgent}
              disabled={!isRunning}
            >
              Arrêter l'agent
            </button>

            <button
              className="btn"
              onClick={runAgent}
              disabled={isRunning}
            >
              Exécuter maintenant
            </button>
          </div>

          {status && (
            <div className={`status ${status.type}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="card">
          <h2>Logs d'activité</h2>
          <div className="logs">
            {logs.map((log, idx) => (
              <div key={idx} className="log-entry">
                <span className="log-time">{log.time}</span>
                <span className={`log-${log.type}`}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {news.length > 0 && (
        <div className="card">
          <h2>Dernières News Trouvées</h2>
          <div className="news-grid">
            {news.map((article, idx) => (
              <div key={idx} className="news-item">
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <div className="meta">
                  <span className="source">{article.source}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
