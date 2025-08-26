import { useEffect, useRef } from 'react'

import styles from './VolumeMeter.module.scss'

type VolumeMeterProps = {
  stream: MediaStream
}

export const VolumeMeter = (props: VolumeMeterProps) => {
  const { stream } = props
  const metterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getElement = () => metterRef.current
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 64

    const audioSourceNode = audioContext.createMediaStreamSource(stream)
    audioSourceNode.connect(analyser)

    const pcmData = new Uint8Array(analyser.fftSize)

    let isUnmounted = false

    const onFrame = () => {
      if (isUnmounted) return
      analyser.getByteFrequencyData(pcmData)

      const sum = pcmData.reduce((acc, amplitude) => acc + amplitude, 0)
      const avg = sum / pcmData.length
      const percent = Math.min(100, Math.max(0, (avg / 255) * 100))

      const elem = getElement()
      if (elem) elem.style.transform = `translate(0, ${100 - Math.min(100, percent * 3)}%)`

      window.requestAnimationFrame(onFrame)
    }

    onFrame()

    return () => {
      isUnmounted = true
      audioContext.close()
    }
  }, [stream])

  return (
    <div className={styles.volumeMeterWrapper}>
      <div
        ref={metterRef}
        className={styles.volumeMeter}
      />
    </div>
  )
}
