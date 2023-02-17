import { AuthorizationPage } from "@/pages/AuthorizationPage"
import { MainPage } from "@/pages/MainPage"
import { RoomPage } from "@/pages/RoomPage"
import {
  AppRouteProps,
  AppRoutes,
} from "@/shared/config/routeConfig/routeConfig"

export const RoutesConfig: Record<string, AppRouteProps> = {
  [AppRoutes.INDEX]: {
    element: <MainPage />,
  },

  [AppRoutes.ROOM_ID]: {
    element: <RoomPage />,
  },

  [AppRoutes.AUTH]: {
    element: <AuthorizationPage />,
  },
}
