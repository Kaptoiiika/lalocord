import { Suspense, useCallback, memo } from "react"
import { Routes, Route } from "react-router-dom"
import { PageLoader } from "@/widgets/PageLoader"
import { AppRouteProps } from "@/shared/config/routeConfig/routeConfig"
import { RoutesConfig } from "./Routes"

export const AppRouter = memo(function AppRouter() {
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
        {Object.entries(RoutesConfig).map(([path, routerProps]) =>
          routerWrapper(path, routerProps)
        )}
      </Routes>
    </Suspense>
  )
})
