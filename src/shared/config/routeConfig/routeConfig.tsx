/* eslint-disable boundaries/element-types */
import { MainPage } from "@/pages/MainPage"
import { RouteProps } from "react-router-dom"

export const enum AppRoutes {
  NOT_FOUND = "not_found",

  INDEX = "/",
}

export type AppRouteProps = {
  authRequire?: boolean
} & RouteProps

export const routeConfig: Record<string, AppRouteProps> = {
  [AppRoutes.INDEX]: {
    element: <MainPage />,
  },
}
