import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"
import { ContextMenu } from "@/shared/ui/ContextMenu"
import { useState } from "react"

export const GlobalContextMenu = () => {
  const [open, setOpen] = useState(false)
  const [left, setLeft] = useState<number>()
  const [top, setTop] = useState<number>()
  const [img, setImg] = useState<string>()

  useMountedEffect(() => {
    const fn = (e: MouseEvent) => {
      const target = e.target as Element
      if (target.tagName === "IMG") {
        e.preventDefault()
        setOpen(!!target)
        setTop(e.clientY)
        setLeft(e.clientX)
        //@ts-ignore
        setImg(target.src)
      }
    }

    document.addEventListener("contextmenu", fn)
    return () => {
      document.removeEventListener("contextmenu", fn)
    }
  })

  const handleClose = () => {
    setOpen(false)
    setLeft(undefined)
    setTop(undefined)
  }

  return (
    <ContextMenu
      imageToCopy={img}
      onClose={handleClose}
      open={open}
      anchorPosition={{ left: left ?? 0, top: top ?? 0 }}
    />
  )
}
