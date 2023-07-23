import styles from "./RoomUserItem.module.scss"
import { useState, useEffect } from "react"

type VolumeMeterProps = {
  stream: MediaStream
}

export const VolumeMeter = (props: VolumeMeterProps) => {
  const { stream } = props
  const [strength, setStrength] = useState(0)

  useEffect(() => {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    const audioSourceNode = audioContext.createMediaStreamSource(stream)
    audioSourceNode.connect(analyser)
    const pcmData = new Uint8Array(analyser.fftSize)

    let isUnmounted = false

    const onFrame = () => {
      if (isUnmounted) return
      analyser.getByteFrequencyData(pcmData)

      let sumSquares = 0.0
      for (const amplitude of pcmData) {
        sumSquares += amplitude * amplitude
      }
      const strength = Math.sqrt(sumSquares / pcmData.length)
      setStrength(strength)
      window.requestAnimationFrame(onFrame)
    }
    onFrame()
    return () => {
      audioContext.close()
      isUnmounted = true
    }
  }, [stream])

  return (
    <div className={styles.volumeMeterWrapper}>
      <div className={styles.volumeMeter} style={{ height: `${strength}%` }} />
    </div>
  )
}
