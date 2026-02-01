'use client'

import { useState, useEffect, useRef } from 'react'
import VNCViewer from './VNCViewer'

interface FileInfo {
  name: string
  size: number
  modified: string
}

interface SessionInfo {
  sessionId: string
  wsPort: number
  createdAt: string
}

export default function PA9Page() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [uploadMsg, setUploadMsg] = useState('')
  const [showHelp, setShowHelp] = useState(true)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const loadFiles = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/session/${sessionId}/files`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files || [])
      }
    } catch {
      /* silent */
    }
  }

  const handleCreateSession = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/session', { method: 'POST' })
      if (!res.ok) throw new Error('Не удалось создать сессию')
      
      const newSession = await res.json()
      setSession(newSession)
      localStorage.setItem('pa9Session', JSON.stringify(newSession))
      setStatus('ready')
      loadFiles(newSession.sessionId)
    } catch (err) {
      console.error('Session create error:', err)
      setStatus('error')
    }
  }

  const handleEndSession = async () => {
    if (!session || !confirm('Завершить сессию? Несохранённые данные будут потеряны.')) return
    try {
      await fetch(`/api/session/${session.sessionId}`, { method: 'DELETE' })
      localStorage.removeItem('pa9Session')
      setSession(null)
      setStatus('idle')
      setFiles([])
    } catch {
      alert('Ошибка завершения сессии')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session) return
    const file = e.target.files?.[0]
    if (!file) return
    
    const ext = file.name.toLowerCase().slice(-4)
    if (ext !== '.pa9') {
      setUploadMsg('Разрешены только файлы .pa9')
      e.target.value = ''
      setTimeout(() => setUploadMsg(''), 3000)
      return
    }

    setUploadMsg('Загрузка...')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/session/${session.sessionId}/upload`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        setUploadMsg(`Файл ${file.name} загружен в /workspace`)
        loadFiles(session.sessionId)
      } else {
        const err = await res.json()
        setUploadMsg(err.error || 'Ошибка загрузки')
      }
    } catch {
      setUploadMsg('Ошибка подключения')
    } finally {
      e.target.value = ''
      setTimeout(() => setUploadMsg(''), 5000)
    }
  }

  const handleDownload = (filename: string) => {
    if (!session) return
    const url = `/api/session/${session.sessionId}/download?name=${encodeURIComponent(filename)}`
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDownloadLatest = () => {
    if (!session) return
    window.open(`/api/session/${session.sessionId}/download-latest`, '_blank')
  }

  const handleDownloadZip = () => {
    if (!session) return
    window.open(`/api/session/${session.sessionId}/download-zip`, '_blank')
  }

  const handleDelete = async (filename: string) => {
    if (!session || !confirm(`Удалить файл «${filename}»?`)) return
    try {
      const res = await fetch(`/api/session/${session.sessionId}/files/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        loadFiles(session.sessionId)
      } else {
        const err = await res.json()
        alert(err.error || 'Ошибка удаления')
      }
    } catch {
      alert('Ошибка подключения')
    }
  }

  const copyPath = () => {
    navigator.clipboard.writeText('/workspace')
    alert('Путь скопирован: /workspace')
  }

  if (status === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md px-6">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-4">PA9 Online</h2>
          <p className="text-neutral-600 mb-8">
            Запустите PA9 в браузере. Каждая сессия изолирована и работает независимо.
          </p>
          <button
            onClick={handleCreateSession}
            className="apple-btn px-8 py-4 text-base"
          >
            Запустить PA9
          </button>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Создаём вашу сессию PA9...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md px-6">
          <p className="text-red-600 mb-4">Сервис временно недоступен</p>
          <button
            onClick={handleCreateSession}
            className="apple-btn px-6 py-3 text-sm"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-neutral-50">
      {/* Панель управления */}
      <div className="shrink-0 bg-white border-b border-neutral-200 px-6 md:px-12 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" aria-hidden />
              <span className="text-sm text-neutral-600">Сессия активна</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-sm text-neutral-500 hover:text-neutral-700"
              >
                {showHelp ? 'Скрыть' : 'Показать'} подсказку
              </button>
              <button
                onClick={handleEndSession}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Завершить сессию
              </button>
            </div>
          </div>

          {showHelp && (
            <div className="mb-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4 text-sm text-neutral-700">
              <h3 className="font-semibold text-neutral-900">Как работать с файлами</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-neutral-800 mb-2">📂 Открыть файл:</p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                    <li>Загрузите .pa9 через кнопку ниже</li>
                    <li>В PA9: File → Open → /workspace</li>
                    <li>Выберите файл</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium text-neutral-800 mb-2">💾 Сохранить работу:</p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                    <li>В PA9: File → Save As → /workspace</li>
                    <li>Нажмите «Обновить» ниже</li>
                    <li>Скачайте файл через кнопку ⬇</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Загрузить файл в PA9
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept=".pa9"
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  onClick={() => uploadInputRef.current?.click()}
                  className="apple-btn-secondary px-5 py-2.5 text-sm"
                >
                  Выбрать файл
                </button>
                <button
                  onClick={() => session && loadFiles(session.sessionId)}
                  className="text-sm text-neutral-500 hover:text-neutral-700"
                >
                  Обновить
                </button>
              </div>
              {uploadMsg && (
                <p className={`mt-2 text-sm ${uploadMsg.includes('загружен') ? 'text-green-600' : 'text-amber-600'}`}>
                  {uploadMsg}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Путь к папке в PA9
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value="/workspace"
                  readOnly
                  className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono text-neutral-700"
                />
                <button
                  onClick={copyPath}
                  className="apple-btn-secondary px-5 py-2.5 text-sm shrink-0"
                >
                  Копировать
                </button>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-neutral-700">
                  Файлы сессии ({files.length})
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadLatest}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Последний файл
                  </button>
                  <button
                    onClick={handleDownloadZip}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Скачать всё (ZIP)
                  </button>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2">
                {files.map((f) => (
                  <li key={f.name} className="inline-flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(f.name)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm text-neutral-700 transition-colors"
                    >
                      <span>⬇</span>
                      {f.name}
                    </button>
                    <button
                      onClick={() => handleDelete(f.name)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* PA9 VNC */}
      <div className="flex-1 min-h-[600px] p-6 md:p-8">
        <div className="max-w-6xl mx-auto h-full min-h-[500px]">
          {session && <VNCViewer sessionId={session.sessionId} />}
        </div>
      </div>
    </div>
  )
}
