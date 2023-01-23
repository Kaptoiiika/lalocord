import { RouteProps } from "react-router-dom"

export const enum AppRoutes {
  NOT_FOUND = "not_found",
}

export type AppRouteProps = {
  authRequire?: boolean
} & RouteProps

export const RoutePaths: Record<AppRoutes, string> = {
  [AppRoutes.NOT_FOUND]: "*",
}

export const routeConfig: Record<string, AppRouteProps> = {}
