
export function PriorityNumberToText(value: number): RTCPriorityType {
  switch (value) {
    case 4:
      return "high"
    case 3:
      return "medium"
    case 2:
      return "low"
    case 1:
      return "very-low"
  }
  return "low"
}
export function PriorityTextToNumber(value?: string): number {
  switch (value) {
    case "high":
      return 4
    case "medium":
      return 3
    case "low":
      return 2
    case "very-low":
      return 1
  }
  return 2
}