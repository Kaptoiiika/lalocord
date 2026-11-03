import { useEffect } from 'react'

import { useWebRTCRoomStore } from '../model/WebRTCRoomStore'

export const useRoomScreenWakeLock = () => {
  const isOtherUserInRoom = useWebRTCRoomStore((state) => state.users.length > 0)

  useEffect(() => {
    if (!isOtherUserInRoom || !('wakeLock' in navigator)) return

    let isStopped = false
    let isRequestInFlight = false
    let sentinel: WakeLockSentinel | undefined

    const requestWakeLock = async () => {
      if (isStopped || isRequestInFlight || sentinel || document.visibilityState !== 'visible') return

      isRequestInFlight = true

      try {
        const nextSentinel = await navigator.wakeLock.request('screen')

        if (isStopped || document.visibilityState !== 'visible') {
          await nextSentinel.release()
          return
        }

        sentinel = nextSentinel
        nextSentinel.addEventListener('release', () => {
          if (sentinel === nextSentinel) sentinel = undefined
        })
      } catch {
        // Запрос отклоняется, если вкладка скрыта или API недоступен.
      } finally {
        isRequestInFlight = false
      }
    }

    // Браузер сам снимает Wake Lock, когда страница уходит в фон.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void requestWakeLock()
    }

    void requestWakeLock()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isStopped = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      void sentinel?.release()
      sentinel = undefined
    }
  }, [isOtherUserInRoom])
}
