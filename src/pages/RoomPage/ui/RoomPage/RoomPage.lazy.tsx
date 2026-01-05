import { lazy } from 'react'

export const RoomPagelazy = lazy(() =>
  import('./RoomPage').then((module) => ({
    default: module.RoomPage,
  }))
)
