export function bitrateValueText(value: number) {
  return `${value} Mb/s`
}
export function bitrateToShortValue(value: number): number {
  return value / 1024 / 1024
}
