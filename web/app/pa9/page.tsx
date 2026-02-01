'use client'

import { useState, useEffect, useRef } from 'react'

// API идёт через тот же origin (Next.js проксирует /api на backend)
const VNC_PORT = process.env.NEXT_PUBLIC_VNC_PORT || '6080'

function getVncUrl(): string {
  if (typeof window === 'undefined') return `http://localhost:${VNC_PORT}/vnc.html?resize=scale`
  const base = `http://${window.location.hostname}:${VNC_PORT}/vnc.html`
  return base.includes('?') ? `${base}&resize=scale` : `${base}?resize=scale`
}

interface FileInfo {
  name: string
  size: number
}

export default function PA9Page() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [workspacePath] = useState('/workspace')
  const [status, setStatus] = useState<'idle' | 'copied' | 'uploading'>('idle')
  const [uploadMsg, setUploadMsg] = useState('')
  const [showHelp, setShowHelp] = useState(true)
  const [vncUrl, setVncUrl] = useState('')
  const uploadInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setVncUrl(getVncUrl())
  }, [])

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const res = await fetch(`/api/files`)
      if (res.ok) {
        const data = await res.json()
        setFiles(data.files || [])
      }
    } catch {
      /* silent */
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.toLowerCase().slice(-4)
    if (ext !== '.pa9') {
      setUploadMsg('Разрешены только файлы .pa9')
      e.target.value = ''
      setTimeout(() => setUploadMsg(''), 3000)
      return
    }

    setStatus('uploading')
    setUploadMsg('')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/upload`, { method: 'POST', body: formData })
      if (res.ok) {
        setUploadMsg(`Файл ${file.name} загружен. Ниже откройте его в PA9.`)
        loadFiles()
      } else {
        const err = await res.json()
        setUploadMsg(err.error || 'Ошибка загрузки')
      }
    } catch {
      setUploadMsg('Сервер недоступен. Запустите Docker.')
    } finally {
      setStatus('idle')
      e.target.value = ''
      setTimeout(() => setUploadMsg(''), 5000)
    }
  }

  const handleDownload = (name: string) => {
    const url = `/api/download/${encodeURIComponent(name)}`
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Удалить файл «${name}»?`)) return
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(name)}`, { method: 'DELETE' })
      if (res.ok) {
        loadFiles()
      } else {
        const err = await res.json()
        alert(err.error || 'Ошибка удаления')
      }
    } catch {
      alert('Сервер недоступен')
    }
  }

  const copyPath = () => {
    navigator.clipboard.writeText(workspacePath)
    setStatus('copied')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-neutral-50">
      {/* Верхняя панель — что это и как пользоваться */}
      <div className="shrink-0 bg-white border-b border-neutral-200 px-6 md:px-12 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" aria-hidden />
              <span className="text-sm text-neutral-600">PA9 запущен</span>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              {showHelp ? 'Скрыть подсказку' : 'Показать подсказку'}
            </button>
          </div>

          {showHelp && (
            <div className="mb-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4 text-sm text-neutral-700">
              <h3 className="font-semibold text-neutral-900">Как работать с файлами</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-neutral-800 mb-2">📂 Открыть файл с компьютера в PA9:</p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                    <li>Нажмите «Выбрать файл» и выберите .pa9 на диске</li>
                    <li>Файл загрузится в папку /workspace</li>
                    <li>В окне PA9: меню File → Open</li>
                    <li>Введите путь /workspace (или вставьте из поля ниже)</li>
                    <li>Выберите нужный файл</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium text-neutral-800 mb-2">💾 Сохранить и управлять:</p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                    <li>В PA9: File → Save As → путь /workspace, имя файла</li>
                    <li>Нажмите «Обновить» — файл появится в списке</li>
                    <li>Нажмите на имя файла — скачать на компьютер</li>
                    <li>Нажмите ✕ рядом с файлом — удалить лишнее</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Открыть файл с компьютера → PA9
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
                  disabled={status === 'uploading'}
                  className="apple-btn-secondary px-5 py-2.5 text-sm disabled:opacity-50"
                >
                  {status === 'uploading' ? 'Загрузка…' : 'Выбрать файл'}
                </button>
                <button
                  onClick={loadFiles}
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
                Путь к папке (вставить в PA9: File → Open)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workspacePath}
                  readOnly
                  className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-mono text-neutral-700"
                />
                <button
                  onClick={copyPath}
                  className="apple-btn-secondary px-5 py-2.5 text-sm shrink-0"
                >
                  {status === 'copied' ? 'Скопировано' : 'Копировать'}
                </button>
              </div>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Сохранить на компьютер — нажмите на файл:
              </label>
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

      {/* PA9 */}
      <div className="flex-1 min-h-[600px] p-6 md:p-8">
        <div className="max-w-6xl mx-auto h-full min-h-[500px] apple-card overflow-hidden">
          <iframe
            src={vncUrl || 'about:blank'}
            className="w-full h-full min-h-[500px] border-0"
            title="PA9"
            allow="clipboard-read; clipboard-write; fullscreen"
          />
        </div>
      </div>
    </div>
  )
}
