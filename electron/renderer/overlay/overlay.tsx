import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import { useCanvasDrawing } from 'src/widgets/RoomStream/ui/CanvasPainter'

import './overlay.scss'

const container = document.getElementById('overlay-content')

if (!container) {
  throw new Error('Контейнер overlay-content не найден. Не удалось вмонтировать реакт приложение')
}

const root = createRoot(container)

const Overlay = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { drawExternalLine } = useCanvasDrawing({
    canvasRef,
    id: 'overlay-canvas',
    fadeDelayMs: 2500,
    fadeDurationMs: 550,
    strokeColor: '#f00',
    strokeWidth: 8,
    needCtrlKey: false,
    enabled: true,
  })

  useEffect(() => {
    const drawLineChannel = new BroadcastChannel('draw_line_channel')
    drawLineChannel.onmessage = (event) => {
      drawExternalLine(event.data)
    }

    return () => {
      drawLineChannel.close()
    }
  }, [drawExternalLine])

  return (
    <canvas
      id="overlay-canvas"
      ref={canvasRef}
      width={2560}
      height={1440}
    />
  )
}

root.render(
  <div className="overlay">
    <Overlay />
  </div>
)

