import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { Typography } from '@mui/material'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'

import styles from './WaitUserClick.module.scss'

type WaitUserClickProps = PropsWithChildren

export const WaitUserClick = (props: WaitUserClickProps) => {
  const { children } = props

  const [, update] = useState(0)

  useMountedEffect(() => {
    const fn = (e: MouseEvent) => {
      if (e.isTrusted || navigator.userActivation?.hasBeenActive === true) {
        update((prev) => prev + 1)
        document.removeEventListener('click', fn)
      }
    }
    const fnKey = (e: KeyboardEvent) => {
      if (e.isTrusted || navigator.userActivation?.hasBeenActive === true) {
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
      <div className={styles.WaitUserClick}>
        <Typography variant="h4">Click anywhere to continue</Typography>
      </div>
    )
  }

  return <>{children}</>
}
