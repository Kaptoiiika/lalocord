import { lazy } from "react"

export const MainPageLazy = lazy(() =>
  import("./MainPage").then((module) => ({
    default: module.MainPage,
  }))
)
