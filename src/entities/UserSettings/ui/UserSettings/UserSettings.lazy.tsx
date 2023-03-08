import { lazy } from "react"

export const UserSettingsLazy = lazy(() =>
  import("./UserSettings").then((module) => ({
    default: module.UserSettings,
  }))
)
