import { useEffect, useState } from 'react'

import { IpcChannels } from 'electron/main/types/ipcChannels'

import type { GameSessionStats } from 'src/shared/types/GameSession'

import styles from './GameSessionPanel.module.scss'

const emptyStats: GameSessionStats = {
  encoder: '…',
  fps: 0,
  viewers: 0,
}

export const GameSessionPanel = () => {
  const [stats, setStats] = useState<GameSessionStats>(emptyStats)

  useEffect(
    () =>
      window.electron?.ipcRenderer.on(IpcChannels.gameSessionStats, (next) => {
        setStats(next)
      }),
    []
  )

  const handleStop = () => {
    window.electron?.ipcRenderer.sendMessage(IpcChannels.gameSessionStop, undefined)
  }

  return (
    <div className={styles.panel}>
      <p className={styles.stat}>Encoder: {stats.encoder}</p>
      <p className={styles.stat}>FPS: {stats.fps}</p>
      <p className={styles.stat}>Viewers: {stats.viewers}</p>
      <button
        type="button"
        className={styles.stop}
        onClick={handleStop}
      >
        Stop
      </button>
    </div>
  )
}
