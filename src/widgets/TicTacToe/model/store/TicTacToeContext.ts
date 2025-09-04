import { createContext, useContext } from 'react'

import type { TicTacToeGame } from '../lib/TicTacToeGame'

export const TicTacToeContext = createContext<{
  game: TicTacToeGame | null
  onMove: (fieldId: number, ceilId: number) => void
}>({
  game: null,
  onMove: () => {},
})

export const useTicTacToeContext = () => useContext(TicTacToeContext)
