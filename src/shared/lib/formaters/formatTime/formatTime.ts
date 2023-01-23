export const formatMsToMMSS = (time: number): string => {
  const minutes = time / 60 / 1000
  const seconds = Math.floor(time / 1000 - Math.floor(minutes) * 60)
  if (seconds < 10) {
    return `${minutes.toFixed(0)}:0${seconds.toFixed(0)}`
  }

  return `${minutes.toFixed(0)}:${seconds.toFixed(0)}`
}

export const formatSToMMSS = (time: number): string => {
  const minutes = time / 60
  const seconds = Math.floor(time - Math.floor(minutes) * 60)
  if (seconds < 10) {
    return `${minutes.toFixed(0)}:0${seconds.toFixed(0)}`
  }

  return `${minutes.toFixed(0)}:${seconds.toFixed(0)}`
}
