export const clamp = (value: number, min = -Infinity, max = Infinity) => {
  const minIsRealMin = min <= max
  if (!minIsRealMin) {
    return Math.max(max, Math.min(min, value))
  }

  return Math.max(min, Math.min(max, value))
}
