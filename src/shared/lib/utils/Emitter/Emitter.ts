// eslint-disable-next-line @typescript-eslint/no-explicit-any

type Callback<A> = (a: A) => void
export type Events = Record<string, any>

/**
 *
 * @class Emitter
 * @template E 
 * where: keyof E = eventName,
 * E.eventName = callback args
 */
class Emitter<E extends Events> {
  private events = new Map<keyof E, Set<Callback<any>>>()

  emit<K extends keyof E>(eventName: K, value: E[K]) {
    this.events.get(eventName)?.forEach((fn) => fn(value))
    return this
  }

  on<K extends keyof E>(eventName: K, callback: Callback<E[K]>) {
    const listeners = this.events.get(eventName)
    if (listeners) listeners.add(callback)
    else this.events.set(eventName, new Set([callback]))
    return this
  }

  off<K extends keyof E>(eventName: K, callback: Callback<E[K]>) {
    this.events.get(eventName)?.delete(callback)
    return this
  }
}

export default Emitter
