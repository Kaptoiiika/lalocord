import { describe, expect, test } from "@jest/globals"
import { splitStringToChunks } from "./splitStringToChunks"

describe("splitStringToChunks", () => {
  test("value=`123456` size=3 toBe=[`123`,`456`]", () => {
    const value = splitStringToChunks(`123456`, 3)
    expect(value).toStrictEqual([`123`, `456`])
  })
  test("value=`1234567` size=3 toBe=[`123`,`456`, `7`]", () => {
    const value = splitStringToChunks(`1234567`, 3)
    expect(value).toStrictEqual([`123`, `456`, `7`])
  })
  test("value=`1234567` size=2.5 toBe=[`12`, `34`, `56`, `7`]", () => {
    const value = splitStringToChunks(`1234567`, 2.5)
    expect(value).toStrictEqual([`12`, `34`, `56`, `7`])
  })
  test("value=`123` size=-2 toBe=[`1`, `2`, `3`]", () => {
    const value = splitStringToChunks(`123`, -2)
    expect(value).toStrictEqual([`1`, `2`, `3`])
  })
  test("value=`123` size=NaN toBe=[`123`]", () => {
    const value = splitStringToChunks(`123`, NaN)
    expect(value).toStrictEqual([`123`])
  })
  test("value=`123` size=Infinity toBe=[`123`]", () => {
    const value = splitStringToChunks(`123`, Infinity)
    expect(value).toStrictEqual([`123`])
  })
  test("value=`123` size=-Infinity toBe=[`1`, `2`, `3`]", () => {
    const value = splitStringToChunks(`123`, -Infinity)
    expect(value).toStrictEqual([`1`, `2`, `3`])
  })
})
