import { RouteProps } from "react-router-dom"

export const enum AppRoutes {
  NOT_FOUND = "not_found",

  INDEX = "/",
  MAIN_PAGE = "/",
  ROOM_ID = "/room/:id",
}

export type AppRouteProps = {
  authRequire?: boolean
} & RouteProps
