import { lazy } from 'react'

export const TicTacToeLazy = lazy(() =>
  import('./TicTacToe').then((module) => ({
    default: module.TicTacToe,
  }))
)
