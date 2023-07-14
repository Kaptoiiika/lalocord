import { memo } from "react"
import { classNames } from "@/shared/lib/classNames/classNames"
import styles from "./AudioEffect.module.scss"

type AudioEffectProps = {
  className?: string
}

export const AudioEffect = memo(function AudioEffect (props: AudioEffectProps) {
  const { className } = props

  return <div className={classNames([styles.AudioEffect, className])}>
      
  </div>
})
