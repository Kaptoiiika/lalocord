export function sliceIntoTotalChunks<T>(arr: T[], totalSize: number): T[][] {
  const res: T[][] = []
  const chunkSize = Math.ceil(arr.length / totalSize)
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    res.push(chunk)
  }
  return res
}

