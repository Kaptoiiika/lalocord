import { lazy } from "react"

export const AuthorizationPageLazy = lazy(() =>
  import("./AuthorizationPage").then((module) => ({
    default: module.AuthorizationPage,
  }))
)
