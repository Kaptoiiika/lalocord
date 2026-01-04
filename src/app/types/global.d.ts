import { ElectronHandler } from '../../../electron/preload'

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

declare global {
  interface Window {
    electron?: ElectronHandler
  }

  const __BUILD_VERSION__: string
  const __BUILD_DATE_VERSION__: string
  const __IS_DEV__: boolean
}

export {}
