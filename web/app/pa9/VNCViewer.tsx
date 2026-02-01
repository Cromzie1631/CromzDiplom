'use client'

import { useEffect, useRef, useState } from 'react'
import RFB from '@novnc/novnc/core/rfb'

interface VNCViewerProps {
  sessionId: string
}

export default function VNCViewer({ sessionId }: VNCViewerProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rfbRef = useRef<RFB | null>(null)
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [scale, setScale] = useState<'fit' | '100' | '125' | '150'>('fit')

  useEffect(() => {
    if (!canvasRef.current || !sessionId) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/session/${sessionId}/ws`

    try {
      const rfb = new RFB(canvasRef.current, wsUrl, {
        credentials: { password: '' },
      })

      rfb.scaleViewport = scale === 'fit'
      rfb.resizeSession = false

      rfb.addEventListener('connect', () => {
        setStatus('connected')
        console.log('[VNC] Connected')
      })

      rfb.addEventListener('disconnect', () => {
        setStatus('disconnected')
        console.log('[VNC] Disconnected')
      })

      rfb.addEventListener('securityfailure', () => {
        setStatus('error')
        console.error('[VNC] Security failure')
      })

      rfbRef.current = rfb

      // Update activity
      const activityInterval = setInterval(() => {
        fetch(`/api/session/${sessionId}/activity`, { method: 'POST' }).catch(() => {})
      }, 60000) // Every minute

      return () => {
        clearInterval(activityInterval)
        rfb.disconnect()
        rfbRef.current = null
      }
    } catch (error) {
      console.error('[VNC] Init error:', error)
      setStatus('error')
    }
  }, [sessionId])

  useEffect(() => {
    if (rfbRef.current) {
      rfbRef.current.scaleViewport = scale === 'fit'
      if (scale !== 'fit') {
        const scaleNum = parseInt(scale) / 100
        rfbRef.current.scale = scaleNum
      }
    }
  }, [scale])

  return (
    <div className="h-full flex flex-col apple-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            status === 'connected' ? 'bg-green-500' :
            status === 'connecting' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-sm text-neutral-600">
            {status === 'connected' ? 'Подключено' :
             status === 'connecting' ? 'Подключение...' :
             status === 'disconnected' ? 'Отключено' :
             'Ошибка подключения'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Масштаб:</span>
          {(['fit', '100', '125', '150'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-2 py-1 text-xs rounded ${
                scale === s
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
              }`}
            >
              {s === 'fit' ? 'По размеру' : `${s}%`}
            </button>
          ))}
        </div>
      </div>
      <div ref={canvasRef} className="flex-1 bg-neutral-900" />
    </div>
  )
}
