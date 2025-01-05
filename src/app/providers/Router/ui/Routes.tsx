import { MainPage } from "@/pages/MainPage"
import { RoomPage } from "@/pages/RoomPage"
import {
  AppRouteProps,
  AppRoutes,
} from "@/shared/config/routeConfig/routeConfig"
import { TicTacToe } from "@/widgets/TicTacToe/ui/TicTacToe"
import { Navigate } from "react-router-dom"

export const RoutesConfig: Record<string, AppRouteProps> = {
  "*": {
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
