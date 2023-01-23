import { classNames } from "./classNames"

describe("classNames", () => {
  test("with single class", () => {
    expect(classNames("first")).toBe("first")
  })

  test("with multi class", () => {
    expect(classNames(["first", "second"])).toBe("first second")
  })

  test("with class and few mods", () => {
    expect(classNames(["first", "second"], { bool: true, off: false })).toBe(
      "first second bool"
    )
  })

  test("with class and few mods (disabled)", () => {
    expect(classNames(["first", "second"], { bool: false, off: false })).toBe(
      "first second"
    )
  })

  test("only mods", () => {
    expect(classNames("", { bool: true, off: false })).toBe("bool")
  })
})
