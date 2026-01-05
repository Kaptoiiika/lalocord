import { Navigate } from 'react-router-dom'

import { MainPage } from 'src/pages/MainPage'
import { RoomPage } from 'src/pages/RoomPage'
import { AppRoutes } from 'src/shared/config/routeConfig/routeConfig'
import { TicTacToe } from 'src/widgets/TicTacToe'

import type { AppRouteProps } from 'src/shared/config/routeConfig/routeConfig'

export const RoutesConfig: Record<string, AppRouteProps> = {
  '*': {
    index: true,
    element: <Navigate to={AppRoutes.MAIN_PAGE} />,
  },

  [AppRoutes.MAIN_PAGE]: {
    element: <MainPage />,
  },

  [AppRoutes.ROOM_ID]: {
    element: <RoomPage />,
  },

  game: {
    element: <TicTacToe />,
  },
}
