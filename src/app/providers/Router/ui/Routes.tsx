import { MainPage } from "@/pages/MainPage"
import { RoomPage } from "@/pages/RoomPage"
import { Test3dPage } from "@/pages/Test3dPage"
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

  [AppRoutes.THREEJS]: {
    element: <Test3dPage />,
  },
}
