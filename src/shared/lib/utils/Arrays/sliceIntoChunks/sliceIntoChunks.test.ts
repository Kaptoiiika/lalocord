import { describe, expect, test } from "@jest/globals"
import { sliceIntoChunks } from "./sliceIntoChunks"

describe("sliceIntoChunks", () => {
  const arr = [1, 2, 3, 4, 5]
  test("size=3 toBe=[[1, 2, 3],[4, 5]]", () => {
    const value = sliceIntoChunks(arr, 3)
    expect(value).toStrictEqual([
      [1, 2, 3],
      [4, 5],
    ])
  })
  test("size=2 toBe=[[1, 2], [3, 4], [5]]", () => {
    const value = sliceIntoChunks(arr, 2)
    expect(value).toStrictEqual([[1, 2], [3, 4], [5]])
  })
})
