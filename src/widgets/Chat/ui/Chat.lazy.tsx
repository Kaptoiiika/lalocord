import { lazy } from "react"

export const ChatLazy = lazy(() =>
  import("./Chat").then((module) => ({
    default: module.Chat,
  }))
)
