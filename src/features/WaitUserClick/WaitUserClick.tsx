import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'

type WaitUserClickProps = PropsWithChildren

export const WaitUserClick = (props: WaitUserClickProps) => {
  const { children } = props

  const [, update] = useState(0)

  useMountedEffect(() => {
    const fn = (event: MouseEvent) => {
      if (event.isTrusted || navigator.userActivation?.hasBeenActive === true) {
        update((prev) => prev + 1)
        document.removeEventListener('click', fn)
      }
    }
    const fnKey = (event: KeyboardEvent) => {
      if (event.isTrusted || navigator.userActivation?.hasBeenActive === true) {
        update((prev) => prev + 1)
        document.removeEventListener('keypress', fnKey)
      }
    }

    document.addEventListener('click', fn)
    document.addEventListener('keypress', fnKey)

    return () => {
      document.removeEventListener('click', fn)
      document.removeEventListener('keypress', fnKey)
    }
  })

  if (navigator.userActivation && !navigator.userActivation?.hasBeenActive) {
    return (
      <div className="flex h-full w-full items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Click anywhere to continue</h2>
      </div>
    )
  }

  return <>{children}</>
}
