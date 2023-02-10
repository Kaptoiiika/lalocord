// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = Record<string, ((...args: any[]) => any)[]>

type EventKey = string
type EventReceiver<T> = (params: T) => void

class Emitter {
  private events: EventMap

  constructor() {
    this.events = {}
  }

  emit<T>(event: EventKey, ...args: T[]) {
    if (this.events[event]) {
      this.events[event].forEach((fn) => fn(...args))
    }
    return this
  }

  on<T>(event: EventKey, fn: EventReceiver<T>) {
    if (this.events[event]) this.events[event].push(fn)
    else this.events[event] = [fn]
    return this
  }

  off<T>(event: EventKey, fn?: EventReceiver<T>) {
    if (event) {
      const listeners = this.events[event]
      const index = listeners.findIndex((_fn) => _fn === fn)
      listeners.splice(index, 1)
    } else this.events[event] = []
    return this
  }
}

export default Emitter
