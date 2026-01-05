import { useEffect, useCallback, useRef } from 'react'

import { useSettingStore } from 'src/entities/Settings'
import { useWebRTCRoomStore, type RoomUser } from 'src/features/WebRTCRoom'
import { __IS_ELECTRON__ } from 'src/shared/const/config'

import type { ExternalLinePayload } from './types'

import { useCanvasDrawing } from './useCanvasDrawing'

type UseWebRTCCanvasDrawingOptions = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  id: string
  fadeDelayMs: number
  fadeDurationMs: number
  strokeColor: string
  strokeWidth: number
  needCtrlKey: boolean
  user?: RoomUser
  isLocal: boolean
}
const drawLineChannel = new BroadcastChannel('draw_line_channel')

export const useWebRTCCanvasDrawing = (options: UseWebRTCCanvasDrawingOptions) => {
  const { allowDrawLine, overlayDrawEnabled } = useSettingStore()
  const { canvasRef, id, fadeDelayMs, fadeDurationMs, strokeColor, strokeWidth, needCtrlKey, user, isLocal } = options

  const roomUsers = useWebRTCRoomStore((state) => state.users)

  const handleLineDraw = useCallback(
    (payload: Omit<ExternalLinePayload, 'userId'>) => {
      if (!user) return

      user.peer.channelInfo.send(
        JSON.stringify({
          event: 'drawLine',
          message: { ...payload, userId: user.id },
        })
      )
    },
    [user]
  )

  const { drawExternalLine, clearStrokes } = useCanvasDrawing({
    canvasRef,
    id,
    fadeDelayMs,
    fadeDurationMs,
    strokeColor,
    strokeWidth,
    needCtrlKey,
    enabled: !isLocal,
    onLineDraw: handleLineDraw,
  })

  // Сохраняем drawExternalLine в ref для избежания пересоздания callback
  const drawExternalLineRef = useRef(drawExternalLine)
  drawExternalLineRef.current = drawExternalLine

  const handleDrawLine = useCallback(
    (payload: ExternalLinePayload) => {
      drawExternalLineRef.current(payload)

      if (__IS_ELECTRON__ && overlayDrawEnabled && allowDrawLine) {
        drawLineChannel.postMessage(payload)
      }
    },
    [overlayDrawEnabled, allowDrawLine]
  )

  // Подписка на входящие линии от других пользователей
  useEffect(() => {
    if (!roomUsers || !isLocal) return

    const handleChatMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      if (data.event === 'drawLine') {
        handleDrawLine(data.message)
      }
    }

    roomUsers.forEach((u) => {
      u.peer.channelInfo.on('onChatMessage', handleChatMessage)
    })

    return () => {
      roomUsers.forEach((u) => {
        u.peer.channelInfo.off('onChatMessage', handleChatMessage)
      })
    }
  }, [roomUsers, isLocal, handleDrawLine])

  return { drawExternalLine, clearStrokes }
}

