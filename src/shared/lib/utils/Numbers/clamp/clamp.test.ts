import { describe, expect, test } from "@jest/globals"
import { clamp } from "./clamp"

describe("clamp", () => {
  test("value=1 min 0 max 1", () => {
    const value = clamp(1, 0, 1)
    expect(value).toBe(1)
  })
  test("value=1 min 1 max 0", () => {
    const value = clamp(1, 1, 0)
    expect(value).toBe(1)
  })
  test("value=1 min 0 max 2", () => {
    const value = clamp(1, 0, 2)
    expect(value).toBe(1)
  })
  test("value=1 min -5 max -1", () => {
    const value = clamp(1, -5, -1)
    expect(value).toBe(-1)
  })
  test("value=1 min -5 max undefine", () => {
    const value = clamp(1, -5)
    expect(value).toBe(1)
  })
  test("value=-10 min -5 max undefine", () => {
    const value = clamp(-10, -5)
    expect(value).toBe(-5)
  })
  test("value=1 min undefine max undefine", () => {
    const value = clamp(1)
    expect(value).toBe(1)
  })
  test("value=undefine min undefine max undefine", () => {
    const value = clamp()
    expect(value).toBe(NaN)
  })
})
