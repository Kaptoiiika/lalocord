export const getNumberBeetwenTwoValues = (
  value = 0,
  min: number,
  max: number
): number => {
  if (value < min) return min
  if (value > max) return max

  return value
}
