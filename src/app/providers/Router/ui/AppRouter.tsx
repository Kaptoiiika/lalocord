import { Suspense, useCallback } from "react"
import { Routes, Route } from "react-router-dom"
import { PageLoader } from "@/widgets/PageLoader"
import {
  AppRouteProps,
  routeConfig,
} from "@/shared/config/routeConfig/routeConfig"
import { RequireAuth } from "./RequireAuth/RequireAuth"

export const AppRouter = () => {
  const routerWrapper = useCallback(
    (path: string, routerProps: AppRouteProps) => {
      if (routerProps.authRequire)
        return (
          <Route
            key={path}
            path={routerProps.path}
            element={<RequireAuth>{routerProps.element}</RequireAuth>}
          />
        )

      return (
        <Route
          key={path}
          path={routerProps.path}
          element={routerProps.element}
        />
      )
    },
    []
  )

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {Object.entries(routeConfig).map(([path, routerProps]) =>
          routerWrapper(path, routerProps)
        )}
      </Routes>
    </Suspense>
  )
}
