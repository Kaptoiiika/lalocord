import { Suspense, useCallback, memo } from 'react';
import { Routes, Route } from 'react-router-dom';

import { PageLoader } from 'src/widgets/PageLoader';

import type { AppRouteProps } from 'src/shared/config/routeConfig/routeConfig';

import { RoutesConfig } from './Routes';


export const AppRouter = memo(function AppRouter() {
  const routerWrapper = useCallback(
    (path: string, routerProps: AppRouteProps) => (
      <Route
        key={path}
        path={routerProps.path ?? path}
        element={routerProps.element}
      />
    ),
    []
  );

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {Object.entries(RoutesConfig).map(([path, routerProps]) => routerWrapper(path, routerProps))}
      </Routes>
    </Suspense>
  );
});
