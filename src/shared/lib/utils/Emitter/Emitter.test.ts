import { describe, expect, beforeEach, jest, it } from "@jest/globals"
import Emitter from "./Emitter"

describe("Emitter", () => {
  interface ArgValue {
    a: number
  }

  let stringMock: jest.Mock<(arg: string) => void>
  let numberMock: jest.Mock<(arg: number) => void>
  let valueMock: jest.Mock<(arg: ArgValue) => void>

  beforeEach(() => {
    stringMock = jest.fn()
    numberMock = jest.fn()
    valueMock = jest.fn()
  })

  const listener1 = (arg: string) => {
    stringMock(arg)
  }

  const listener2 = (arg: number) => {
    numberMock(arg)
  }

  const listener3 = (arg: ArgValue) => {
    valueMock(arg)
  }

  interface Events {
    test1: string
    test2: number
    test3: ArgValue
  }

  let emitter: Emitter<Events>
  beforeEach(() => {
    emitter = new Emitter()
    emitter.on("test1", listener1)
    emitter.on("test2", listener2)
    emitter.on("test3", listener3)
  })

  describe("on", () => {
    it("adds an event emitter", () => {
      emitter.emit("test1", "value")
      emitter.emit("test2", 3)
      emitter.emit("test3", { a: 42 })
      emitter.emit("test3", { a: 43 })
      expect(stringMock.mock.calls).toEqual([["value"]])
      expect(numberMock.mock.calls).toEqual([[3]])
      expect(valueMock.mock.calls).toEqual([[{ a: 42 }], [{ a: 43 }]])
    })
  })

  describe("emit", () => {
    it("emit event", () => {
      const newCallbackMock = jest.fn(() => "")
      emitter.on("test1", newCallbackMock)
      emitter.emit("test1", "value")
      expect(stringMock.mock.calls).toEqual([["value"]])
      expect(newCallbackMock.mock.calls).toEqual([["value"]])
    })
  })

  describe("off", () => {
    it("removes an event listener", () => {
      emitter.off("test1", listener1)
      emitter.off("test2", listener2)
      emitter.emit("test1", "value")
      emitter.emit("test2", 3)
      emitter.emit("test3", { a: 42 })
      expect(stringMock.mock.calls).toEqual([])
      expect(numberMock.mock.calls).toEqual([])
      expect(valueMock.mock.calls).toEqual([[{ a: 42 }]])
    })
    it("removes an event listener should remove one listener", () => {
      const newCallbackMock = jest.fn()
      emitter.on("test1", newCallbackMock)
      emitter.off("test1", listener1)
      emitter.emit("test1", "value")
      expect(stringMock.mock.calls).toEqual([])
      expect(newCallbackMock.mock.calls).toEqual([["value"]])
    })
  })
})
