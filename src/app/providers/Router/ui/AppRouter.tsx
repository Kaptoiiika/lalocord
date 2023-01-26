import { Suspense, useCallback } from "react"
import { Routes, Route } from "react-router-dom"
import { PageLoader } from "@/widgets/PageLoader"
import {
  AppRouteProps,
  routeConfig,
} from "@/shared/config/routeConfig/routeConfig"

export const AppRouter = () => {
  const routerWrapper = useCallback(
    (path: string, routerProps: AppRouteProps) => {
      return (
        <Route
          key={path}
          path={routerProps.path ?? path}
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
