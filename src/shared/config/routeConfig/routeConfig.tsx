import type { RouteProps } from 'react-router-dom';

export const enum AppRoutes {
  NOT_FOUND = 'not_found',

  MAIN_PAGE = '/',
  ROOM_ID = '/room/:id',
  GAME = '/game',
}

export type AppRouteProps = {
  authRequire?: boolean;
} & RouteProps;
